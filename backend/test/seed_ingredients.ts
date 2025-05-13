import axios from 'axios';

const API_TOKEN = 'patxO1XSdTTifeEsx.c525a63972ecc6e288382719cbf676296a57da92938d8c271eebbaa20baac3ab';
const BASE_ID = 'appHJEmvm3o1OKZHc';
const TABLE_NAME = 'Ingredients';

const headers = {
  Authorization: `Bearer ${API_TOKEN}`,
  'Content-Type': 'application/json',
};

const baseUrl = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;

const ingredients = [
  { Nom: 'Pâtes', Quantité: 100, Unité: 'g' },
  { Nom: 'Crème', Quantité: 20, Unité: 'cl' },
  { Nom: 'Lardons', Quantité: 100, Unité: 'g' },
  { Nom: 'Oeuf', Quantité: 2, Unité: 'pièces' },
  { Nom: 'Salade', Quantité: 1, Unité: 'pièce' },
  { Nom: 'Poulet', Quantité: 150, Unité: 'g' },
  { Nom: 'Parmesan', Quantité: 30, Unité: 'g' },
  { Nom: 'Croutons', Quantité: 15, Unité: 'g' },
];

async function seedIngredients() {
  try {
    for (const item of ingredients) {
      const res = await axios.post(baseUrl, { fields: item }, { headers });
      console.log('✅ Ajouté :', res.data.fields.Nom);
    }
    console.log('✅ Tous les ingrédients ont été ajoutés.');
  } catch (error) {
    console.error('❌ Erreur lors du seed :', error.response?.data || error);
  }
}

seedIngredients();
