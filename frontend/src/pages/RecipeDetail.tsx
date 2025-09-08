import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getRecipeById } from '../services/recipeService';
import { Recipe } from '../types/recipe.type';
import { getIngredientsFromRecipe, getIntolerancesFromRecipe } from '../utils/recipeUtils';
import RecipeImage from '../components/RecipeImage';
import RatingForm from '../components/RatingForm';
import RatingDisplay from '../components/RatingDisplay';
import { ratingService, Rating, RatingStats } from '../services/ratingService';
import { useAuth } from '../hooks/useAuth';
import '../styles/pages/RecipeDetail.scss';

const RecipeDetail = () => {
  const { id } = useParams();
  const { isAuthenticated, user, logout } = useAuth();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // État pour les ratings
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [ratingStats, setRatingStats] = useState<RatingStats>({ average: 0, count: 0 });
  const [userRating, setUserRating] = useState<Rating | null>(null);
  const [ratingsLoading, setRatingsLoading] = useState(false);
  const [showRatingForm, setShowRatingForm] = useState(false);

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

  // Charger les ratings quand la recette est chargée
  useEffect(() => {
    if (recipe?.id) {
      loadRatings();
    }
  }, [recipe?.id, isAuthenticated, user?.id]);

  const loadRatings = async () => {
    if (!recipe?.id) return;

    setRatingsLoading(true);
    try {
      // Charger d'abord les données publiques (toujours disponibles)
      const [ratingsData, statsData] = await Promise.all([
        ratingService.getRecipeRatings(recipe.id),
        ratingService.getRecipeAverageRating(recipe.id),
      ]);

      setRatings(ratingsData);
      setRatingStats(statsData);

      // Charger le rating de l'utilisateur connecté (seulement si authentifié)
      if (isAuthenticated && user?.id) {
        try {
          const userRatingData = await ratingService.getUserRatingForRecipe(recipe.id);
          setUserRating(userRatingData);
        } catch (error: any) {
          // Si on reçoit une 401, le token est probablement expiré
          if (error?.response?.status === 401) {
            console.warn('Token expiré, déconnexion de l\'utilisateur');
            // Déconnecter l'utilisateur et nettoyer la session
            logout();
            setUserRating(null);
          } else {
            // Pour les autres erreurs, juste logger
            console.error('Erreur lors de la récupération du rating utilisateur:', error);
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des ratings:', error);
    } finally {
      setRatingsLoading(false);
    }
  };

  const handleRatingSubmit = async (rating: number, comment: string) => {
    if (!recipe?.id || !user?.id) return;

    try {
      if (userRating) {
        // Modifier le rating existant
        await ratingService.updateRating(userRating.id, { rating, comment });
      } else {
        // Créer un nouveau rating
        await ratingService.createRating({ rating, comment, recipeId: recipe.id });
      }

      // Recharger les ratings
      await loadRatings();
      setShowRatingForm(false);
    } catch (error: any) {
      console.error('Erreur lors de la soumission du rating:', error);
      alert(error?.response?.data?.message || 'Erreur lors de la soumission de votre avis');
    }
  };

  const handleEditRating = (rating: Rating) => {
    setUserRating(rating);
    setShowRatingForm(true);
  };

  const handleDeleteRating = async (ratingId: string) => {
    if (!user?.id) return;

    if (window.confirm('Êtes-vous sûr de vouloir supprimer votre avis ?')) {
      try {
        await ratingService.deleteRating(ratingId);
        await loadRatings();
      } catch (error: any) {
        console.error('Erreur lors de la suppression du rating:', error);
        alert(error?.response?.data?.message || 'Erreur lors de la suppression de votre avis');
      }
    }
  };

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

          {/* Section des avis et commentaires */}
          <section className="section ratings-section">
            <h3>⭐ Avis et commentaires</h3>

            {/* Affichage des statistiques et avis existants */}
            <RatingDisplay
              ratings={ratings}
              stats={ratingStats}
              onEditRating={handleEditRating}
              onDeleteRating={handleDeleteRating}
              currentUserId={user?.id}
            />

            {/* Formulaire de notation pour les utilisateurs connectés */}
            {isAuthenticated && (
              <div className="rating-form-container">
                {!userRating && !showRatingForm && (
                  <button
                    className="add-rating-btn"
                    onClick={() => setShowRatingForm(true)}
                  >
                    ✍️ Donner mon avis
                  </button>
                )}

                {(userRating || showRatingForm) && (
                  <div className="rating-form-wrapper">
                    <RatingForm
                      recipeId={recipe.id}
                      onRatingSubmit={handleRatingSubmit}
                      existingRating={userRating}
                    />
                    <button
                      className="cancel-rating-btn"
                      onClick={() => {
                        setShowRatingForm(false);
                        setUserRating(null);
                      }}
                    >
                      Annuler
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Message pour les utilisateurs non connectés */}
            {!isAuthenticated && (
              <div className="login-prompt">
                <p>🔒 Connectez-vous pour donner votre avis sur cette recette !</p>
              </div>
            )}
          </section>
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
