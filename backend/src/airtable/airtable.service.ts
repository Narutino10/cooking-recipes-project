import { Injectable } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { Recipe } from '../interfaces/recipe.interface';
import { CreateRecipeDto } from '../recipes/create-recipe.dto';

@Injectable()
export class AirtableService {
  private readonly BASE_ID = 'appHJEmvm3o1OKZHc';
  //private readonly TABLE_NAME = 'Recettes';
  
  private readonly TABLE_NAME = 'Recettes';
  private readonly API_TOKEN =
    'patxO1XSdTTifeEsx.c525a63972ecc6e288382719cbf676296a57da92938d8c271eebbaa20baac3ab';

  private readonly baseUrl = `https://api.airtable.com/v0/${this.BASE_ID}`;
  private readonly headers = {
    Authorization: `Bearer ${this.API_TOKEN}`,
    'Content-Type': 'application/json',
  };

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

  private async generateNutritionAnalysis(ingredientIds: string[]): Promise<string> {
  const ingredientNames = await Promise.all(
    ingredientIds.map(async (id) => {
      const res = await axios.get(`https://api.airtable.com/v0/${this.BASE_ID}/Ingredients/${id}`, {
        headers: this.headers,
      });
      return res.data.fields?.Nom || 'Ingrédient inconnu';
    })
  );

  const prompt = `Voici une liste d'ingrédients : ${ingredientNames.join(', ')}. Donne-moi une analyse nutritionnelle simple (calories, protéines, lipides, glucides, vitamines, minéraux) sous forme de texte.`;

  const res = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return res.data.choices[0].message.content;
  }

  async createRecipe(data: CreateRecipeDto): Promise<Recipe> {
  // Étape 1 : Générer une analyse nutritionnelle avec OpenAI
  const nutrition = await this.generateNutritionAnalysis(data.ingredients);

  // Étape 2 : Sauvegarder dans Airtable
  const fields = {
    Nom: data.name,
    'Type de plat': data.type,
    Ingrédients: data.ingredients,
    'Nombre de personnes': data.nbPersons,
    Intolérances: data.intolerances ?? [],
    Instructions: data.instructions,
    'Analyse nutritionnelle': [nutrition],
  };

  const url = `${this.baseUrl}/${this.TABLE_NAME}`;
  const res = await axios.post<{ id: string; fields: Recipe['fields'] }>(
    url,
    { fields },
    { headers: this.headers }
  );

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


