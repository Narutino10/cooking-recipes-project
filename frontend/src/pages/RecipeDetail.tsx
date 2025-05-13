import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getRecipeById, getIngredientsByIds } from '../services/recipeService';
import { Recipe } from '../types/recipe.type';
import '../styles/pages/RecipeDetail.scss';

const RecipeDetail = () => {
  const { id } = useParams();
  const [recipe, setRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
  const fetchRecipe = async () => {
    if (id) {
      const data = await getRecipeById(id);
      const ingredientIds = data.fields.Ingrédients || [];
      const ingredientNames = await getIngredientsByIds(ingredientIds);
      setRecipe({ ...data, fields: { ...data.fields, Ingrédients: ingredientNames } });
    }
  };
  fetchRecipe();
}, [id]);

  if (!recipe) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="recipe-detail">
      <h1>{recipe.fields.Nom}</h1>
      <p><strong>Type :</strong> {recipe.fields['Type de plat']}</p>
      <p><strong>Nombre de personnes :</strong> {recipe.fields['Nombre de personnes']}</p>
      <p><strong>Instructions :</strong> {recipe.fields.Instructions}</p>
      <p><strong>Ingrédients :</strong> {recipe.fields.Ingrédients.join(', ')}</p>
      {Array.isArray(recipe.fields.Intolérances) && recipe.fields.Intolérances.length > 0 && (
        <p><strong>Intolérances :</strong> {recipe.fields.Intolérances.join(', ')}</p>
      )}

      <Link to="/">
        <button>← Retour à la liste</button>
      </Link>
    </div>
  );
};

export default RecipeDetail;
