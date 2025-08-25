import { useState } from 'react';
import { generateRecipe } from '../services/aiService';
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
  });
  
  const [generatedRecipe, setGeneratedRecipe] = useState<GeneratedRecipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      const recipe = await generateRecipe(payload);
      setGeneratedRecipe(recipe);
    } catch (err) {
      setError('Erreur lors de la génération de la recette. Veuillez réessayer.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRecipe = async () => {
    if (!generatedRecipe) return;

    try {
      // Prompt user for visibility and optional metadata before saving
      const visibility = window.prompt('Visibilité (public/private)', 'public') as 'public' | 'private';
      const tagsInput = window.prompt('Tags (séparés par ,)', '') || '';
      const difficulty = window.prompt('Difficulté (easy/medium/hard)', 'easy') as 'easy' | 'medium' | 'hard';

      const recipeData = {
        name: generatedRecipe.name,
        type: generatedRecipe.type,
        ingredients: generatedRecipe.ingredients,
        nbPersons: formData.nbPersons,
        intolerances: formData.intolerances, // Déjà un tableau
        instructions: generatedRecipe.instructions,
        visibility,
        tags: tagsInput ? tagsInput.split(',').map(t => t.trim()) : [],
        difficulty,
      };

      await createNewRecipe(recipeData);
      alert('Recette sauvegardée avec succès !');
      setGeneratedRecipe(null);
      setFormData({
        ingredients: '',
        nbPersons: 2,
        intolerances: [], // Tableau vide
        dietType: '',
        cookingTime: '',
      });
    } catch (err) {
      alert('Erreur lors de la sauvegarde de la recette.');
      console.error(err);
    }
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

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Génération en cours...' : 'Générer la recette'}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {generatedRecipe && (
        <div className="generated-recipe">
          <h2>Recette générée ✨</h2>
          <div className="recipe-content">
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
