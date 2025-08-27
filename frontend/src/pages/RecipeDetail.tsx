import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getRecipeById } from '../services/recipeService';
import { Recipe } from '../types/recipe.type';
import { getIngredientsFromRecipe, getIntolerancesFromRecipe } from '../utils/recipeUtils';
import RecipeImage from '../components/RecipeImage';
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
          <span className="meta-item">
            <strong>Type :</strong> {recipe.fields?.['Type de plat'] || 'Non spécifié'}
          </span>
          <span className="meta-item">
            <strong>Pour :</strong> {recipe.fields?.['Nombre de personnes'] ?? 1} pers.
          </span>
          {((recipe.fields as any)?.difficulty) && (
            <span className="badge difficulty">{(recipe.fields as any).difficulty}</span>
          )}
          {Array.isArray((recipe.fields as any).tags) && (recipe.fields as any).tags.length > 0 && (
            <div className="tags">
              {(recipe.fields as any).tags.map((t: string, i: number) => 
                <span key={i} className="badge tag">{t}</span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="recipe-body">
        <div className="recipe-content">
          <section className="section instructions">
            <h3>📝 Instructions</h3>
            {recipe.fields?.Instructions ? (
              <div className="instructions-content">
                {recipe.fields.Instructions.split(/\n{2,}|\n/).map((paragraph: string, i: number) => {
                  const trimmed = paragraph.trim();
                  if (!trimmed) return null;
                  
                  // Check if it's a numbered step
                  const numberedMatch = trimmed.match(/^(\d+)\.?\s*(.+)$/);
                  if (numberedMatch) {
                    return (
                      <div key={i} className="instruction-step">
                        <span className="step-number">{numberedMatch[1]}</span>
                        <span className="step-text">{numberedMatch[2]}</span>
                      </div>
                    );
                  }
                  
                  // Check if it's a bullet point
                  const bulletMatch = trimmed.match(/^[-•*]\s*(.+)$/);
                  if (bulletMatch) {
                    return (
                      <div key={i} className="instruction-bullet">
                        <span className="bullet">•</span>
                        <span className="bullet-text">{bulletMatch[1]}</span>
                      </div>
                    );
                  }
                  
                  // Regular paragraph
                  return <p key={i}>{trimmed}</p>;
                })}
              </div>
            ) : (
              <p className="empty-instructions">Aucune instruction fournie pour cette recette.</p>
            )}
          </section>

          <section className="section ingredients">
            <h3>🥕 Ingrédients</h3>
            {ingredients.length > 0 ? (
              <ul className="ingredients-list">
                {ingredients.map((ing, idx) => (
                  <li key={idx} className="ingredient-item">
                    <span className="ingredient-bullet">•</span>
                    <span className="ingredient-text">{ing}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Aucun ingrédient spécifié</p>
            )}
          </section>

          {intolerances.length > 0 && (
            <section className="section intolerances">
              <h3>⚠️ Intolérances</h3>
              <div className="intolerances-list">
                {intolerances.map((intolerance, idx) => (
                  <span key={idx} className="intolerance-badge">
                    {intolerance}
                  </span>
                ))}
              </div>
            </section>
          )}

          {recipe.fields?.['Analyse nutritionnelle'] && recipe.fields['Analyse nutritionnelle'].length > 0 && (
            <div className="nutrition-analysis">
              <h3>📊 Analyse nutritionnelle</h3>
              <div className="nutrition-content">
                {recipe.fields['Analyse nutritionnelle'].map((item, index) => (
                  <p key={index}>{item}</p>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="recipe-aside">
          <RecipeImage recipe={recipe} size="large" />

          <div className="aside-meta">
            {((recipe.fields as any).prepTime || (recipe.fields as any).cookTime) && (
              <div className="timing-info">
                <h4>⏱️ Temps</h4>
                <p>
                  Préparation: {(recipe.fields as any).prepTime ?? 0} min<br/>
                  Cuisson: {(recipe.fields as any).cookTime ?? 0} min
                </p>
              </div>
            )}
            {(recipe.fields as any).calories && (
              <div className="calories-info">
                <h4>🔥 Calories</h4>
                <p>{(recipe.fields as any).calories} kcal</p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default RecipeDetail;
