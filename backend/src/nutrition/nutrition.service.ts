import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class NutritionService {
  private readonly OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  private readonly AIRTABLE_BASE_ID = 'appHJEmvm3o1OKZHc';
  private readonly AIRTABLE_TABLE_NAME = 'Nutrition';
  private readonly AIRTABLE_API_KEY = 'ton_token_airtable';
  private readonly AIRTABLE_URL = `https://api.airtable.com/v0/${this.AIRTABLE_BASE_ID}/${this.AIRTABLE_TABLE_NAME}`;

  private readonly headers = {
    Authorization: `Bearer ${this.AIRTABLE_API_KEY}`,
    'Content-Type': 'application/json',
  };

  async generateNutrition(ingredients: string[], nbPersons: number): Promise<string> {
    const prompt = `
Donne une estimation nutritionnelle réaliste en JSON pour une recette de ${nbPersons} personne(s) avec ces ingrédients :
${ingredients.join(', ')}.

Le JSON doit être au format :
{
  "Calories": nombre,
  "Protéines": nombre,
  "Glucides": nombre,
  "Lipides": nombre,
  "Vitamines": "liste séparée par virgules",
  "Minéraux": "liste séparée par virgules"
}
    `;

    const res = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      },
      {
        headers: {
          Authorization: `Bearer ${this.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const jsonString = res.data.choices[0].message.content.trim();
    const nutritionData = JSON.parse(jsonString);

    // Création dans Airtable
    const airtableRes = await axios.post(
      this.AIRTABLE_URL,
      {
        fields: {
          Calories: nutritionData.Calories,
          Protéines: nutritionData.Protéines,
          Glucides: nutritionData.Glucides,
          Lipides: nutritionData.Lipides,
          Vitamines: nutritionData.Vitamines,
          Minéraux: nutritionData.Minéraux,
        },
      },
      { headers: this.headers }
    );

    return airtableRes.data.id; // ID de la nutrition à lier à la recette
  }
}
