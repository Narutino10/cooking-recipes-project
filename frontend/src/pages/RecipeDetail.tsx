import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getRecipeById } from '../services/recipeService';
import { Recipe } from '../types/recipe.type';
import { getIngredientsFromRecipe, getIntolerancesFromRecipe } from '../utils/recipeUtils';
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

  const ingredients = getIngredientsFromRecipe(recipe);
  const intolerances = getIntolerancesFromRecipe(recipe);

  return (
    <div className="recipe-detail">
      <h1>{recipe.fields?.Nom ?? 'Recette'}</h1>
      <p><strong>Type :</strong> {recipe.fields?.['Type de plat'] ?? '—'}</p>
      <p><strong>Nombre de personnes :</strong> {recipe.fields?.['Nombre de personnes'] ?? 1}</p>
      <p><strong>Instructions :</strong> {recipe.fields?.Instructions ?? ''}</p>
      <p><strong>Ingrédients :</strong> {ingredients.join(', ')}</p>

      {/* Image display: support 'Image' (Airtable-style) or 'imageUrl' */}
      {(() => {
  const maybeImage = recipe.fields?.Image ?? (recipe.fields as any)?.imageUrl ?? null;
        if (!maybeImage) return null;

        // If Airtable Image object or array
        if (Array.isArray(maybeImage) && maybeImage.length > 0) {
          const url = maybeImage[0]?.url ?? maybeImage[0]?.thumbnails?.large?.url;
          return url ? <img src={url} alt={recipe.fields?.Nom ?? 'image recette'} className="recipe-image" /> : null;
        }

        // If string URL
        if (typeof maybeImage === 'string') {
          return <img src={maybeImage} alt={recipe.fields?.Nom ?? 'image recette'} className="recipe-image" />;
        }

        return null;
      })()}

      {recipe.fields?.['Analyse nutritionnelle'] && recipe.fields['Analyse nutritionnelle'].length > 0 && (
        <div className="nutrition-analysis">
          <h3>Analyse nutritionnelle</h3>
          <div className="nutrition-content">
            {recipe.fields['Analyse nutritionnelle'].map((item, index) => (
              <p key={index}>{item}</p>
            ))}
          </div>
        </div>
      )}

      {intolerances.length > 0 && (
        <p><strong>Intolérances :</strong> {intolerances.join(', ')}</p>
      )}
    </div>
  );
};

export default RecipeDetail;
