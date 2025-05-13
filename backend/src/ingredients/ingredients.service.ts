// src/ingredients/ingredients.service.ts
import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class IngredientsService {
  private readonly BASE_ID = 'appHJEmvm3o1OKZHc';
  private readonly TABLE_ID = 'Ingredients'; // ← remplace par ton vrai ID de la table Ingredients
  private readonly API_TOKEN = 'patxO1XSdTTifeEsx.c525a63972ecc6e288382719cbf676296a57da92938d8c271eebbaa20baac3ab';

  private readonly baseUrl = `https://api.airtable.com/v0/${this.BASE_ID}/${this.TABLE_ID}`;

  private readonly headers = {
    Authorization: `Bearer ${this.API_TOKEN}`,
    'Content-Type': 'application/json',
  };

  async getAllIngredients() {
    const response = await axios.get(this.baseUrl, { headers: this.headers });
    return response.data.records;
  }
}
