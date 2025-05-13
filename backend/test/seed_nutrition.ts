import axios from 'axios';

const API_TOKEN = 'patxO1XSdTTifeEsx.c525a63972ecc6e288382719cbf676296a57da92938d8c271eebbaa20baac3ab';
const BASE_ID = 'appHJEmvm3o1OKZHc';
const TABLE_NAME = 'Nutrition';

const headers = {
  Authorization: `Bearer ${API_TOKEN}`,
  'Content-Type': 'application/json',
};

const baseUrl = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;

const data = [
  {
    fields: {
      Calories: 250,
      Protéines: 8,
      Glucides: 35,
      Lipides: 10,
      Vitamines: 'Vitamine B, Vitamine D',
      Minéraux: 'Calcium, Fer',
      // 'Recette liée': [], // à remplir plus tard si besoin
    },
  },
  {
    fields: {
      Calories: 180,
      Protéines: 5,
      Glucides: 20,
      Lipides: 6,
      Vitamines: 'Vitamine C',
      Minéraux: 'Magnésium',
    },
  },
];

async function seed() {
  try {
    for (const item of data) {
      const res = await axios.post(baseUrl, item, { headers });
      console.log('✅ Ajouté :', res.data);
    }
    console.log('✅ Seed terminé');
  } catch (error) {
    console.error('❌ Erreur lors du seed :', error.response?.data || error);
  }
}

seed();
