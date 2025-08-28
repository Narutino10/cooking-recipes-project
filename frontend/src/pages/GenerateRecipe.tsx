import { useState, useEffect } from 'react';
import { generateRecipeWithImage } from '../services/aiService';
import { GeneratedRecipe } from '../types/ai.type';
import { createNewRecipe } from '../services/recipeService';
import { IntoleranceSelector } from '../components/IntoleranceSelector';
import '../styles/pages/GenerateRecipe.scss';

const GenerateRecipe = () => {
  const [formData, setFormData] = useState({
    ingredients: '',
    nbPersons: 2,
    intolerances: [] as string[], // Changé en tableau
    dietType: '',
    cookingTime: '',
    generateImage: true,
    imageStyle: 'gastronomique',
  });
  
  const [generatedRecipe, setGeneratedRecipe] = useState<GeneratedRecipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveData, setSaveData] = useState({
    visibility: 'public' as 'public' | 'private',
    tags: '',
    difficulty: 'easy' as 'easy' | 'medium' | 'hard',
  });
  const [weeklyGenerations, setWeeklyGenerations] = useState(0);
  const [maxGenerations] = useState(7); // Limite de 7 générations par semaine

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleIntoleranceChange = (intolerances: string[]) => {
    setFormData({ ...formData, intolerances });
  };

  // Gestion de la limitation des générations
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Lundi comme début de semaine
    return new Date(d.setDate(diff));
  };

  const loadWeeklyGenerations = () => {
    const stored = localStorage.getItem('weeklyGenerations');
    if (stored) {
      const data = JSON.parse(stored);
      const weekStart = getWeekStart(new Date());
      const storedWeekStart = new Date(data.weekStart);

      if (storedWeekStart.getTime() === weekStart.getTime()) {
        setWeeklyGenerations(data.count);
      } else {
        // Nouvelle semaine, reset du compteur
        setWeeklyGenerations(0);
        localStorage.setItem('weeklyGenerations', JSON.stringify({
          count: 0,
          weekStart: weekStart.toISOString()
        }));
      }
    }
  };

  const incrementWeeklyGenerations = () => {
    const newCount = weeklyGenerations + 1;
    setWeeklyGenerations(newCount);
    const weekStart = getWeekStart(new Date());
    localStorage.setItem('weeklyGenerations', JSON.stringify({
      count: newCount,
      weekStart: weekStart.toISOString()
    }));
  };

  // Charger les données au montage du composant
  useEffect(() => {
    loadWeeklyGenerations();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Vérifier la limite de générations
    if (weeklyGenerations >= maxGenerations) {
      setError(`Vous avez atteint la limite de ${maxGenerations} générations par semaine. Revenez la semaine prochaine !`);
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        ingredients: formData.ingredients.split(',').map((i) => i.trim()),
        nbPersons: Number(formData.nbPersons),
        intolerances: formData.intolerances, // Déjà un tableau
        dietType: formData.dietType || undefined,
        cookingTime: formData.cookingTime ? Number(formData.cookingTime) : undefined,
      };

      const recipe = await generateRecipeWithImage({
        ...payload,
        generateImage: formData.generateImage,
        imageStyle: formData.imageStyle,
      });
      
      // Incrémenter le compteur de générations
      incrementWeeklyGenerations();
      
      setGeneratedRecipe(recipe);
    } catch (err: any) {
      // Axios error: try to extract backend message
      let msg = 'Erreur lors de la génération de la recette. Veuillez réessayer.';
      if (err?.response?.data?.message) {
        if (Array.isArray(err.response.data.message)) {
          msg = err.response.data.message.join(' ');
        } else {
          msg = err.response.data.message;
        }
      }
      setError(msg);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRecipe = () => {
    if (!generatedRecipe) return;
    setShowSaveModal(true);
  };

  const handleConfirmSave = async () => {
    if (!generatedRecipe) return;

    try {
      const recipeData = {
        name: generatedRecipe.name,
        type: generatedRecipe.type || 'Plat principal', // Valeur par défaut si type est vide
        ingredients: generatedRecipe.ingredients,
        servings: formData.nbPersons,
        intolerances: formData.intolerances, // Déjà un tableau
        instructions: generatedRecipe.instructions,
        visibility: saveData.visibility,
        tags: saveData.tags ? saveData.tags.split(',').map(t => t.trim()).filter(t => t) : [],
        difficulty: saveData.difficulty,
        imageUrls: generatedRecipe.imageUrl ? [generatedRecipe.imageUrl] : [], // Correction: imageUrls au lieu de imageUrl
      };

      await createNewRecipe(recipeData);
      alert('Recette sauvegardée avec succès !');
      setGeneratedRecipe(null);
      setShowSaveModal(false);
      setFormData({
        ingredients: '',
        nbPersons: 2,
        intolerances: [], // Tableau vide
        dietType: '',
        cookingTime: '',
        generateImage: true,
        imageStyle: 'gastronomique',
      });
      setSaveData({
        visibility: 'public',
        tags: '',
        difficulty: 'easy',
      });
    } catch (err: any) {
      // Extract backend error message for better debugging
      let errorMessage = 'Erreur lors de la sauvegarde de la recette.';
      if (err?.response?.data?.message) {
        if (Array.isArray(err.response.data.message)) {
          errorMessage = `Erreur de validation: ${err.response.data.message.join(', ')}`;
        } else {
          errorMessage = `Erreur: ${err.response.data.message}`;
        }
      } else if (err?.response?.status === 400) {
        errorMessage = 'Erreur de validation des données. Vérifiez que tous les champs requis sont remplis.';
      }
      alert(errorMessage);
      console.error('Erreur lors de la sauvegarde:', err);
    }
  };

  const handleSaveDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSaveData(prev => ({ ...prev, [name]: value }));
  };

  const handleCancelSave = () => {
    setShowSaveModal(false);
  };

  return (
    <div className="generate-recipe">
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1>Générer une recette avec l'IA</h1>
        <div style={{
          background: weeklyGenerations >= maxGenerations ? 'rgba(231, 76, 60, 0.1)' : 'rgba(52, 152, 219, 0.1)',
          border: `2px solid ${weeklyGenerations >= maxGenerations ? '#e74c3c' : '#3498db'}`,
          borderRadius: '20px',
          padding: '1rem',
          margin: '1rem auto',
          maxWidth: '400px',
          fontSize: '0.9rem',
          fontWeight: '500'
        }}>
          <div style={{ marginBottom: '0.5rem' }}>
            {weeklyGenerations >= maxGenerations ? '🚫' : '⚡'} 
            Générations cette semaine: {weeklyGenerations}/{maxGenerations}
          </div>
          {weeklyGenerations < maxGenerations ? (
            <div style={{ color: '#27ae60', fontSize: '0.8rem' }}>
              {maxGenerations - weeklyGenerations} génération{maxGenerations - weeklyGenerations > 1 ? 's' : ''} restante{maxGenerations - weeklyGenerations > 1 ? 's' : ''}
            </div>
          ) : (
            <div style={{ color: '#e74c3c', fontSize: '0.8rem' }}>
              Limite atteinte - Revenez la semaine prochaine !
            </div>
          )}
        </div>
      </div>
      
      <form onSubmit={handleGenerate}>
        <div className="form-group">
          <label>Ingrédients disponibles (séparés par des virgules) :</label>
          <input
            type="text"
            name="ingredients"
            value={formData.ingredients}
            onChange={handleChange}
            placeholder="ex: tomates, basilic, mozzarella"
            required
          />
        </div>

        <div className="form-group">
          <label>Nombre de personnes :</label>
          <input
            type="number"
            name="nbPersons"
            value={formData.nbPersons}
            onChange={handleChange}
            min="1"
            max="20"
            required
          />
        </div>

        <div className="form-group">
          <label>Intolérances alimentaires (optionnel) :</label>
          <IntoleranceSelector
            selectedIntolerances={formData.intolerances}
            onChange={handleIntoleranceChange}
            className="intolerance-selector"
          />
        </div>

        <div className="form-group">
          <label>Type de régime (optionnel) :</label>
          <select name="dietType" value={formData.dietType} onChange={handleChange}>
            <option value="">Aucun</option>
            <option value="végétarien">Végétarien</option>
            <option value="végétalien">Végétalien</option>
            <option value="sans gluten">Sans gluten</option>
            <option value="cétogène">Cétogène</option>
            <option value="méditerranéen">Méditerranéen</option>
          </select>
        </div>

        <div className="form-group">
          <label>Temps de cuisson souhaité (minutes, optionnel) :</label>
          <input
            type="number"
            name="cookingTime"
            value={formData.cookingTime}
            onChange={handleChange}
            placeholder="ex: 30"
            min="5"
            max="300"
          />
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              name="generateImage"
              checked={formData.generateImage}
              onChange={(e) => setFormData({ ...formData, generateImage: e.target.checked })}
            />
            Générer une image avec l'IA (Stability AI)
          </label>
        </div>

        {formData.generateImage && (
          <div className="form-group">
            <label>Style de l'image :</label>
            <select
              name="imageStyle"
              value={formData.imageStyle}
              onChange={handleChange}
            >
              <option value="gastronomique">Gastronomique</option>
              <option value="naturel">Naturel</option>
              <option value="moderne">Moderne</option>
              <option value="rustique">Rustique</option>
              <option value="minimaliste">Minimaliste</option>
            </select>
          </div>
        )}

        <button 
          type="submit" 
          disabled={isLoading || weeklyGenerations >= maxGenerations}
          style={{
            opacity: (isLoading || weeklyGenerations >= maxGenerations) ? 0.6 : 1,
            cursor: (isLoading || weeklyGenerations >= maxGenerations) ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Génération en cours...' : 
           weeklyGenerations >= maxGenerations ? 'Limite atteinte' : 
           'Générer la recette'}
        </button>
      </form>

          {isLoading && (
            <div className="loader" style={{ margin: '2rem auto', textAlign: 'center' }}>
              <span role="img" aria-label="Chargement" style={{ fontSize: '2rem', animation: 'spin 1s linear infinite' }}>🍳</span>
              <div>
                Génération de la recette{formData.generateImage ? ' et de l\'image IA' : ''}...
              </div>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          {generatedRecipe && (
            <div className="generated-recipe">
              <h2>Recette générée ✨</h2>
              <div className="recipe-content">
                {generatedRecipe.imageUrl && (
                  <div className="generated-image" style={{ textAlign: 'center' }}>
                    <img src={generatedRecipe.imageUrl.startsWith('/') ? `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}${generatedRecipe.imageUrl}` : generatedRecipe.imageUrl} alt={generatedRecipe.name} style={{ maxWidth: '100%', borderRadius: '8px', boxShadow: '0 2px 8px #0001' }} />
                    <div style={{ fontSize: '0.95em', color: '#888', marginTop: '0.5em' }}>Image générée par IA (Stable Diffusion)</div>
                  </div>
                )}
                <h3>{generatedRecipe.name}</h3>
                <p><strong>Type :</strong> {generatedRecipe.type}</p>
            
            <div className="ingredients-section">
              <h4>Ingrédients :</h4>
              <ul>
                {generatedRecipe.ingredients.map((ingredient, index) => (
                  <li key={index}>{ingredient}</li>
                ))}
              </ul>
            </div>

            <div className="instructions-section">
              <h4>Instructions :</h4>
              <p>{generatedRecipe.instructions}</p>
            </div>

            <div className="nutrition-section">
              <h4>Analyse nutritionnelle :</h4>
              <div className="nutrition-grid">
                <div className="nutrition-item">
                  <span className="label">Calories :</span>
                  <span className="value">{generatedRecipe.nutritionAnalysis.calories}</span>
                </div>
                <div className="nutrition-item">
                  <span className="label">Protéines :</span>
                  <span className="value">{generatedRecipe.nutritionAnalysis.proteins}g</span>
                </div>
                <div className="nutrition-item">
                  <span className="label">Glucides :</span>
                  <span className="value">{generatedRecipe.nutritionAnalysis.carbohydrates}g</span>
                </div>
                <div className="nutrition-item">
                  <span className="label">Lipides :</span>
                  <span className="value">{generatedRecipe.nutritionAnalysis.fats}g</span>
                </div>
              </div>
              
              {generatedRecipe.nutritionAnalysis.vitamins.length > 0 && (
                <p><strong>Vitamines :</strong> {generatedRecipe.nutritionAnalysis.vitamins.join(', ')}</p>
              )}
              
              {generatedRecipe.nutritionAnalysis.minerals.length > 0 && (
                <p><strong>Minéraux :</strong> {generatedRecipe.nutritionAnalysis.minerals.join(', ')}</p>
              )}
              
              <p className="nutrition-description">{generatedRecipe.nutritionAnalysis.description}</p>
            </div>

            <div className="recipe-actions">
              <button onClick={handleSaveRecipe} className="save-button">
                Sauvegarder cette recette
              </button>
              <button onClick={() => setGeneratedRecipe(null)} className="cancel-button">
                Générer une nouvelle recette
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Recipe Modal */}
      {showSaveModal && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="modal-content" style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ marginTop: 0, color: '#333' }}>Sauvegarder la recette</h3>
            
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Visibilité :
              </label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="visibility"
                    value="public"
                    checked={saveData.visibility === 'public'}
                    onChange={handleSaveDataChange}
                    style={{ marginRight: '0.5rem' }}
                  />
                  Publique
                </label>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="visibility"
                    value="private"
                    checked={saveData.visibility === 'private'}
                    onChange={handleSaveDataChange}
                    style={{ marginRight: '0.5rem' }}
                  />
                  Privée
                </label>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Difficulté :
              </label>
              <select
                name="difficulty"
                value={saveData.difficulty}
                onChange={handleSaveDataChange}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              >
                <option value="easy">Facile</option>
                <option value="medium">Moyen</option>
                <option value="hard">Difficile</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Tags (séparés par des virgules) :
              </label>
              <input
                type="text"
                name="tags"
                value={saveData.tags}
                onChange={handleSaveDataChange}
                placeholder="ex: rapide, végétarien, dessert"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={handleCancelSave}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #ddd',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmSave}
                style={{
                  padding: '0.5rem 1rem',
                  border: 'none',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerateRecipe;
