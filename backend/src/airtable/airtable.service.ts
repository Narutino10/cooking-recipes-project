import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { Recipe } from '../interfaces/recipe.interface';
import { CreateRecipeDto } from '../recipes/create-recipe.dto';

@Injectable()
export class AirtableService {
  private readonly API_URL = 'https://api.airtable.com/v0';
  private readonly BASE_ID = 'appHJEmvm3o1OKZHc'; // Ton vrai ID de base
  private readonly TABLE_NAME = 'Recettes'; // Nom exact de ta table
  private readonly API_TOKEN =
    'patxO1XSdTTifeEsx.c525a63972ecc6e288382719cbf676296a57da92938d8c271eebbaa20baac3ab'; // Ton token

  private readonly headers = {
    Authorization: `Bearer patxO1XSdTTifeEsx.c525a63972ecc6e288382719cbf676296a57da92938d8c271eebbaa20baac3ab`,
    'Content-Type': 'application/json',
  };

  private get baseUrl() {
    return `${this.API_URL}/${this.BASE_ID}/${this.TABLE_NAME}`;
  }

  async getAllRecipes(): Promise<Recipe[]> {
    const response = await axios.get<{ records: Recipe[] }>(this.baseUrl, {
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

    const params = filterFormula ? { filterByFormula: filterFormula } : {};

    const response = await axios.get<{ records: Recipe[] }>(this.baseUrl, {
      headers: this.headers,
      params,
    });

    return response.data.records;
  }

  async createRecipe(data: CreateRecipeDto): Promise<Recipe> {
    const airtableFields = {
      Nom: data.name,
      'Type de plat': data.type,
      Ingrédients: data.ingredients,
      'Nombre de personnes': data.nbPersons,
      Intolérances: data.intolerances ?? [],
      Instructions: data.instructions,
      'Analyse nutritionnelle': data.nutritionId ? [data.nutritionId] : [],
    };

    const response = await axios.post<{ id: string; fields: Recipe['fields'] }>(
      this.baseUrl,
      { fields: airtableFields },
      { headers: this.headers },
    );

    return {
      id: response.data.id,
      fields: response.data.fields,
    };
  }

  async getRecipeById(id: string): Promise<Recipe> {
    const url = `${this.baseUrl}/${id}`;

    const response = await axios.get<{ id: string; fields: Recipe['fields'] }>(
      url,
      {
        headers: this.headers,
      },
    );

    return {
      id: response.data.id,
      fields: response.data.fields,
    };
  }

  async deleteRecipeById(id: string): Promise<void> {
    const url = `${this.baseUrl}/${id}`;
    await axios.delete(url, { headers: this.headers });
  }
}
