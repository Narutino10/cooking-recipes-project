import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getRecipeById } from '../services/recipeService';
import { Recipe } from '../types/recipe.type';
import '../styles/pages/RecipeDetail.scss';

const RecipeDetail = () => {
  const { id } = useParams();
  const [recipe, setRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      if (id) {
        const data = await getRecipeById(id);
        setRecipe(data);
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
    </div>
  );
};

export default RecipeDetail;
