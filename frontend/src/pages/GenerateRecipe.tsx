import { useState } from 'react';
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleIntoleranceChange = (intolerances: string[]) => {
    setFormData({ ...formData, intolerances });
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
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
      <h1>Générer une recette avec l'IA</h1>
      
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

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Génération en cours...' : 'Générer la recette'}
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
    </div>
  );
};

export default GenerateRecipe;
