import axios from 'axios';

const API_TOKEN =
  'patxO1XSdTTifeEsx.c525a63972ecc6e288382719cbf676296a57da92938d8c271eebbaa20baac3ab';
const BASE_ID = 'appHJEmvm3o1OKZHc';
const TABLE_NAME = 'tblKk1r28rRqvfenz';

const headers = {
  Authorization: `Bearer ${API_TOKEN}`,
  'Content-Type': 'application/json',
};

const baseUrl = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;

const recipes = [
  {
    fields: {
      Nom: 'Pâtes carbonara',
      'Type de plat': 'Plat principal',
      Ingrédients: ['Pâtes', 'Crème', 'Lardons', 'Oeuf'],
      'Nombre de personnes': 2,
      Intolérances: ['Lactose'],
      Instructions:
        'Faire cuire les pâtes, puis ajouter la crème et les lardons.',
      'Analyse nutritionnelle': [],
    },
  },
  {
    fields: {
      Nom: 'Salade César',
      'Type de plat': 'Entrée',
      Ingrédients: ['Salade', 'Poulet', 'Parmesan', 'Croutons'],
      'Nombre de personnes': 1,
      Instructions: 'Mélanger tous les ingrédients et ajouter la sauce.',
      'Analyse nutritionnelle': [],
    },
  },
];

async function seed() {
  try {
    for (const recipe of recipes) {
      const res = await axios.post(baseUrl, recipe, { headers });
      console.log('✅ Ajouté :', res.data);
    }
    console.log('✅ Seed terminé');
  } catch (error) {
    console.error('❌ Erreur lors du seed :', error.response?.data || error);
  }
}

seed();
