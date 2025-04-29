import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as dotenv from 'dotenv';
import { Recipe } from '../interfaces/recipe.interface';
import { CreateRecipeDto } from '../recipes/create-recipe.dto';

dotenv.config();

@Injectable()
export class AirtableService {
  private readonly apiUrl = `${process.env.AIRTABLE_API_URL}${process.env.AIRTABLE_BASE_ID}`;

  private readonly headers = {
    Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`,
    'Content-Type': 'application/json',
  };

  async getAllRecipes(): Promise<Recipe[]> {
    const url = `${this.apiUrl}/${process.env.AIRTABLE_RECIPES_TABLE_NAME}`;
    const response = await axios.get<{ records: Recipe[] }>(url, {
      headers: this.headers,
    });
    return response.data.records;
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

    const url = `${this.apiUrl}/${process.env.AIRTABLE_RECIPES_TABLE_NAME}`;

    const params = filterFormula ? { filterByFormula: filterFormula } : {};

    const response = await axios.get<{ records: Recipe[] }>(url, {
      headers: this.headers,
      params,
    });

    return response.data.records;
  }

  async createRecipe(data: CreateRecipeDto): Promise<Recipe> {
    const url = `${this.apiUrl}/${process.env.AIRTABLE_RECIPES_TABLE_NAME}`;

    const airtableFields = {
      Nom: data.name,
      'Type de plat': data.type,
      Ingrédients: data.ingredients,
      'Nombre de personnes': data.nbPersons,
      Intolérances: data.intolerances ?? [],
      Instructions: data.instructions,
      'Analyse nutritionnelle': data.nutritionId ? [data.nutritionId] : [],
    };

    const response = await axios.post<{ id: string; fields: Recipe }>(
      url,
      {
        fields: airtableFields,
      },
      { headers: this.headers },
    );

    return response.data as unknown as Recipe;
  }
}
