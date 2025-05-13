import axios from 'axios';

const API_TOKEN = 'patxO1XSdTTifeEsx.c525a63972ecc6e288382719cbf676296a57da92938d8c271eebbaa20baac3ab';
const BASE_ID = 'appHJEmvm3o1OKZHc';
const TABLE_RECETTES = 'Recettes';
const TABLE_INGREDIENTS = 'Ingredients';

const headers = {
  Authorization: `Bearer ${API_TOKEN}`,
  'Content-Type': 'application/json',
};

const baseUrl = `https://api.airtable.com/v0/${BASE_ID}`;

const recipes = [
  {
    name: 'Pâtes carbonara',
    type: 'Plat principal',
    ingredients: ['Pâtes', 'Crème', 'Lardons', 'Oeuf'],
    nbPersons: 2,
    intolerances: ['Lactose'],
    instructions: 'Faire cuire les pâtes, puis ajouter la crème et les lardons.',
  },
];

async function getIngredientIds(names: string[]): Promise<string[]> {
  const ids: string[] = [];

  for (const name of names) {
    const res = await axios.get(`${baseUrl}/${TABLE_INGREDIENTS}`, {
      headers,
      params: {
        filterByFormula: `LOWER({Nom})="${name.toLowerCase()}"`,
      },
    });

    const record = res.data.records?.[0];
    if (record) ids.push(record.id);
    else console.warn(`⚠️ Ingrédient non trouvé : ${name}`);
  }

  return ids;
}

async function seed() {
  try {
    for (const recipe of recipes) {
      const ingredientIds = await getIngredientIds(recipe.ingredients);

      const res = await axios.post(
        `${baseUrl}/${TABLE_RECETTES}`,
        {
          fields: {
            Nom: recipe.name,
            'Type de plat': recipe.type,
            Ingrédients: ingredientIds,
            'Nombre de personnes': recipe.nbPersons,
            Intolérances: recipe.intolerances,
            Instructions: recipe.instructions,
            'Analyse nutritionnelle': [], // tu peux faire pareil si tu veux lier la table Nutrition
          },
        },
        { headers }
      );

      console.log('✅ Recette ajoutée :', res.data);
    }
  } catch (error) {
    console.error('❌ Erreur lors du seed :', error.response?.data || error);
  }
}

seed();
