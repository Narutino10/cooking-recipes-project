import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getRecipeById } from '../services/recipeService';
import { Recipe } from '../types/recipe.type';
import { getIngredientsFromRecipe, getIntolerancesFromRecipe } from '../utils/recipeUtils';
import '../styles/pages/RecipeDetail.scss';

const RecipeDetail = () => {
  const { id } = useParams();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getRecipeById(id);
        setRecipe(data);
      } catch (err: any) {
        setError(err?.message ?? 'Erreur lors du chargement de la recette');
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [id]);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!recipe) return <div>Recette introuvable.</div>;

  const ingredients = getIngredientsFromRecipe(recipe);
  const intolerances = getIntolerancesFromRecipe(recipe);

  return (
    <div className="recipe-detail">
      <div className="recipe-header">
        <h1>{recipe.fields?.Nom ?? 'Recette'}</h1>
        <div className="recipe-meta">
          <span className="meta-item"><strong>Type :</strong> {recipe.fields?.['Type de plat'] ?? '—'}</span>
          <span className="meta-item"><strong>Pour :</strong> {recipe.fields?.['Nombre de personnes'] ?? 1} pers.</span>
          {((recipe.fields as any)?.difficulty) && (
            <span className="badge difficulty">{(recipe.fields as any).difficulty}</span>
          )}
          {Array.isArray((recipe.fields as any).tags) && (recipe.fields as any).tags.length > 0 && (
            <div className="tags">{(recipe.fields as any).tags.map((t: string, i: number) => <span key={i} className="badge tag">{t}</span>)}</div>
          )}
        </div>
      </div>

      <div className="recipe-body">
        <div className="recipe-content">
          <section className="section instructions">
            <h3>Instructions</h3>
            {(recipe.fields?.Instructions ?? '').trim() ? (
              (recipe.fields?.Instructions ?? '').split(/\n{2,}|\n/).map((p, i) => (
                <p key={i}>{p}</p>
              ))
            ) : (
              <p className="empty-instructions">Aucune instruction fournie pour cette recette.</p>
            )}
          </section>

          <section className="section ingredients">
            <h3>Ingrédients</h3>
            {ingredients.length > 0 ? (
              <ul>
                {ingredients.map((ing, idx) => <li key={idx}>{ing}</li>)}
              </ul>
            ) : (
              <p>—</p>
            )}
          </section>

          {intolerances.length > 0 && (
            <p className="intolerances"><strong>Intolérances :</strong> {intolerances.join(', ')}</p>
          )}

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
        </div>

        <aside className="recipe-aside">
          {/* Image display: support 'Image' (Airtable-style) or 'imageUrl' */}
          {(() => {
            const maybeImage = recipe.fields?.Image ?? (recipe.fields as any)?.imageUrl ?? null;
            if (Array.isArray(maybeImage) && maybeImage.length > 0) {
              const url = maybeImage[0]?.url ?? maybeImage[0]?.thumbnails?.large?.url ?? null;
              if (url) return <img loading="lazy" src={url} alt={recipe.fields?.Nom ?? 'image recette'} className="recipe-image" />;
            }
            if (typeof maybeImage === 'string' && maybeImage.trim() !== '') {
              return <img loading="lazy" src={maybeImage} alt={recipe.fields?.Nom ?? 'image recette'} className="recipe-image" />;
            }
            // placeholder
            return (
              <div className="recipe-image placeholder">
                <div className="placeholder-icon">🍽️</div>
                <div className="placeholder-text">Aucune image</div>
              </div>
            );
          })()}

          {/* small meta block */}
          <div className="aside-meta">
            {((recipe.fields as any).prepTime || (recipe.fields as any).cookTime) && (
              <p><strong>Temps :</strong> {(recipe.fields as any).prepTime ?? 0} min préparation / {(recipe.fields as any).cookTime ?? 0} min cuisson</p>
            )}
            {(recipe.fields as any).calories && (
              <p><strong>Calories :</strong> {(recipe.fields as any).calories} kcal</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default RecipeDetail;
