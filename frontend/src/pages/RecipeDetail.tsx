import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getRecipeById } from '../services/recipeService';
import { Recipe } from '../types/recipe.type';
import axios from 'axios';
import '../styles/pages/RecipeDetail.scss';

const RecipeDetail = () => {
  const { id } = useParams();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [ingredientNames, setIngredientNames] = useState<string[]>([]);

  useEffect(() => {
    const fetchRecipe = async () => {
      if (id) {
        const data = await getRecipeById(id);
        setRecipe(data);

        const ingredientIds = data.fields.Ingrédients || [];
        const names: string[] = [];

        for (const ingredientId of ingredientIds) {
          try {
            const res = await axios.get(
              `https://api.airtable.com/v0/appHJEmvm3o1OKZHc/Ingredients/${ingredientId}`,
              {
                headers: {
                  Authorization: `Bearer patxO1XSdTTifeEsx.c525a63972ecc6e288382719cbf676296a57da92938d8c271eebbaa20baac3ab`,
                },
              }
            );
            names.push(res.data.fields.Nom);
          } catch (err) {
            names.push('Ingrédient inconnu');
          }
        }

        setIngredientNames(names);
      }
    };

    fetchRecipe();
  }, [id]);

  if (!recipe) return <div>Chargement...</div>;

  const { Nom, Instructions, Intolérances, 'Type de plat': type, 'Nombre de personnes': nb, 'Analyse nutritionnelle': nutrition } = recipe.fields;

  return (
    <div className="recipe-detail">
      <h1>{Nom}</h1>
      <p><strong>Type :</strong> {type}</p>
      <p><strong>Nombre de personnes :</strong> {nb}</p>
      <p><strong>Instructions :</strong> {Instructions}</p>
      <p><strong>Ingrédients :</strong> {ingredientNames.join(', ')}</p>

      {Intolérances && Intolérances.length > 0 && (
        <p><strong>Intolérances :</strong> {Intolérances.join(', ')}</p>
      )}

      {nutrition && nutrition.length > 0 && (
        <div className="nutrition">
          <h3>🔬 Analyse nutritionnelle</h3>
          <p>{nutrition[0]}</p>
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <Link to="/">
          <button>← Retour à la liste</button>
        </Link>
      </div>
    </div>
  );
};

export default RecipeDetail;
