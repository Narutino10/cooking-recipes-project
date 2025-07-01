import { Injectable, BadRequestException } from '@nestjs/common';
import axios, { AxiosResponse, AxiosError } from 'axios';
import { Recipe } from '../interfaces/recipe.interface';
import { CreateRecipeDto } from '../recipes/create-recipe.dto';
import { MistralService } from '../mistral/mistral.service';

// Valid intolerance options in Airtable (predefined multiple select field)
export const VALID_INTOLERANCES = ['Lactose', 'Gluten'] as const;

@Injectable()
export class AirtableService {
  private readonly BASE_ID =
    process.env.AIRTABLE_BASE_ID || 'appHJEmvm3o1OKZHc';
  private readonly TABLE_NAME =
    process.env.AIRTABLE_RECIPES_TABLE_NAME || 'Recettes';
  private readonly API_TOKEN =
    process.env.AIRTABLE_TOKEN ||
    'patxO1XSdTTifeEsx.c525a63972ecc6e288382719cbf676296a57da92938d8c271eebbaa20baac3ab';

  private readonly baseUrl = `https://api.airtable.com/v0/${this.BASE_ID}`;
  private readonly headers = {
    Authorization: `Bearer ${this.API_TOKEN}`,
    'Content-Type': 'application/json',
  };

  constructor(private readonly mistralService: MistralService) {}

  async getAllRecipes(): Promise<Recipe[]> {
    const url = `${this.baseUrl}/${this.TABLE_NAME}`;
    const res: AxiosResponse<{ records: Recipe[] }> = await axios.get(url, {
      headers: this.headers,
    });
    return res.data.records;
  }

  async searchRecipes(filters: {
    name?: string;
    type?: string;
    ingredient?: string;
  }): Promise<Recipe[]> {
    const { name, type, ingredient } = filters;
    const formulaParts: string[] = [];

    if (name) {
      formulaParts.push(`FIND(LOWER("${name}"), LOWER({Nom}))`);
    }
    if (type) {
      formulaParts.push(`FIND(LOWER("${type}"), LOWER({Type de plat}))`);
    }
    if (ingredient) {
      // Recherche dans le nouveau champ "Liste ingrédients" et l'ancien champ "Ingrédients"
      formulaParts.push(
        `OR(
          FIND(LOWER("${ingredient}"), LOWER({Liste ingrédients})),
          ARRAYJOIN({Ingrédients}, ",") & "" != "" && FIND(LOWER("${ingredient}"), LOWER(ARRAYJOIN({Ingrédients}, ",")))
        )`,
      );
    }

    const filterFormula =
      formulaParts.length > 0 ? `AND(${formulaParts.join(',')})` : '';
    const url = `${this.baseUrl}/${this.TABLE_NAME}`;
    const params = filterFormula ? { filterByFormula: filterFormula } : {};

    const res: AxiosResponse<{ records: Recipe[] }> = await axios.get(url, {
      headers: this.headers,
      params,
    });

    return res.data.records;
  }

  async createRecipe(data: CreateRecipeDto): Promise<Recipe> {
    try {
      // Générer l'analyse nutritionnelle avec Mistral
      const nutritionAnalysis =
        await this.mistralService.generateNutritionAnalysis(data.ingredients);

      // Filter intolerances to only include valid options
      const filteredIntolerances = data.intolerances
        ? data.intolerances.filter((intolerance) =>
            VALID_INTOLERANCES.includes(
              intolerance as (typeof VALID_INTOLERANCES)[number],
            ),
          )
        : [];

      // Log if any invalid intolerances were filtered out
      if (
        data.intolerances &&
        filteredIntolerances.length !== data.intolerances.length
      ) {
        const invalidIntolerances = data.intolerances.filter(
          (intolerance) =>
            !VALID_INTOLERANCES.includes(
              intolerance as (typeof VALID_INTOLERANCES)[number],
            ),
        );
        console.warn(
          `Invalid intolerances filtered out: ${invalidIntolerances.join(', ')}. Valid options are: ${VALID_INTOLERANCES.join(', ')}`,
        );
      }

      // Convert ingredients array to a simple text string for now
      // TODO: Implement proper ingredient handling (either create text field in Airtable or handle linked records)
      const ingredientsText = data.ingredients
        ? data.ingredients.join(', ')
        : '';

      // Traiter les ingrédients - utiliser les noms de champs corrects d'Airtable
      const fields = {
        Nom: data.name,
        'Type de plat': data.type,
        // Note: Skipping ingredients for now as the field expects linked records
        // We could add a simple text field for ingredients in Airtable as a workaround
        'Nombre de personnes': data.nbPersons,
        Intolérances: filteredIntolerances,
        Instructions: data.instructions,
        'Analyse nutritionnelle': [
          `Calories: ${nutritionAnalysis.calories}`,
          `Protéines: ${nutritionAnalysis.proteins}g`,
          `Glucides: ${nutritionAnalysis.carbohydrates}g`,
          `Lipides: ${nutritionAnalysis.fats}g`,
          `Vitamines: ${nutritionAnalysis.vitamins.join(', ')}`,
          `Minéraux: ${nutritionAnalysis.minerals.join(', ')}`,
          nutritionAnalysis.description,
          `\nIngrédients: ${ingredientsText}`,
        ].join('\n'),
      };

      console.log(
        'Données envoyées à Airtable:',
        JSON.stringify({ fields }, null, 2),
      );

      const url = `${this.baseUrl}/${this.TABLE_NAME}`;
      const res: AxiosResponse<{ id: string; fields: Recipe['fields'] }> =
        await axios.post(url, { fields }, { headers: this.headers });

      return {
        id: res.data.id,
        fields: res.data.fields,
      };
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error(
        'Erreur lors de la création de la recette:',
        axiosError.response?.data || (error as Error).message,
      );
      // Provide more specific error messages
      if (axiosError.response?.status === 422) {
        throw new BadRequestException(
          'Invalid data provided. Please check all fields and ensure intolerances are valid options: ' +
            VALID_INTOLERANCES.join(', '),
        );
      }

      throw error;
    }
  }

  async getRecipeById(id: string): Promise<Recipe> {
    const url = `${this.baseUrl}/${this.TABLE_NAME}/${id}`;
    const res: AxiosResponse<{ id: string; fields: Recipe['fields'] }> =
      await axios.get(url, {
        headers: this.headers,
      });

    return {
      id: res.data.id,
      fields: res.data.fields,
    };
  }

  getValidIntolerances(): string[] {
    return [...VALID_INTOLERANCES];
  }

  async deleteRecipeById(id: string): Promise<void> {
    const url = `${this.baseUrl}/${this.TABLE_NAME}/${id}`;
    await axios.delete(url, { headers: this.headers });
  }
}
