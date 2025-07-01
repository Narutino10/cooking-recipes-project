import { Injectable } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { Recipe } from '../interfaces/recipe.interface';
import { CreateRecipeDto } from '../recipes/create-recipe.dto';
import { MistralService } from '../mistral/mistral.service';

@Injectable()
export class AirtableService {
  private readonly BASE_ID = process.env.AIRTABLE_BASE_ID || 'appHJEmvm3o1OKZHc';
  private readonly TABLE_NAME = process.env.AIRTABLE_RECIPES_TABLE_NAME || 'Recettes';
  private readonly API_TOKEN = process.env.AIRTABLE_TOKEN ||
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
      formulaParts.push(
        `ARRAYJOIN({Ingrédients}, ",") & "" != "" && FIND(LOWER("${ingredient}"), LOWER(ARRAYJOIN({Ingrédients}, ",")))`,
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
    // Générer l'analyse nutritionnelle avec Mistral
    const nutritionAnalysis = await this.mistralService.generateNutritionAnalysis(data.ingredients);
    
    const fields = {
      Nom: data.name,
      'Type de plat': data.type,
      Ingrédients: data.ingredients,
      'Nombre de personnes': data.nbPersons,
      Intolérances: data.intolerances ?? [],
      Instructions: data.instructions,
      'Analyse nutritionnelle': [
        `Calories: ${nutritionAnalysis.calories}`,
        `Protéines: ${nutritionAnalysis.proteins}g`,
        `Glucides: ${nutritionAnalysis.carbohydrates}g`,
        `Lipides: ${nutritionAnalysis.fats}g`,
        `Vitamines: ${nutritionAnalysis.vitamins.join(', ')}`,
        `Minéraux: ${nutritionAnalysis.minerals.join(', ')}`,
        nutritionAnalysis.description,
      ],
    };

    const url = `${this.baseUrl}/${this.TABLE_NAME}`;
    const res: AxiosResponse<{ id: string; fields: Recipe['fields'] }> =
      await axios.post(url, { fields }, { headers: this.headers });

    return {
      id: res.data.id,
      fields: res.data.fields,
    };
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

  async deleteRecipeById(id: string): Promise<void> {
    const url = `${this.baseUrl}/${this.TABLE_NAME}/${id}`;
    await axios.delete(url, { headers: this.headers });
  }
}
