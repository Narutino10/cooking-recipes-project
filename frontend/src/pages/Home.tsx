import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllRecipes } from '../services/recipeService';
import { Recipe } from '../types/recipe.type';
import { getIngredientsFromRecipe, formatIngredientsForSearch } from '../utils/recipeUtils';
import '../styles/pages/Home.scss'; 

const Home = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    const fetchRecipes = async () => {
      const data = await getAllRecipes();
      setRecipes(data);
      setFilteredRecipes(data);
    };

    fetchRecipes();
  }, []);

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredRecipes(recipes);
    } else {
      const filtered = recipes.filter((recipe) => {
        const ingredients = getIngredientsFromRecipe(recipe);
        const ingredientsText = formatIngredientsForSearch(ingredients);

        const name = String(recipe.fields?.Nom ?? '').toLowerCase();
        const type = String(recipe.fields?.['Type de plat'] ?? '').toLowerCase();

        return (
          name.includes(searchTerm.toLowerCase()) ||
          type.includes(searchTerm.toLowerCase()) ||
          ingredientsText.includes(searchTerm.toLowerCase())
        );
      });
      setFilteredRecipes(filtered);
    }
  }, [searchTerm, recipes]);

  return (
    <div className="home-page">
      <h1>Liste des Recettes</h1>
      
      <div className="search-section">
        <input
          type="text"
          placeholder="Rechercher par nom, type ou ingrédient..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <ul className="recipes-list">
        {filteredRecipes.map((recipe) => (
          <li key={recipe.id} className="recipe-card">
            <Link to={`/recipe/${recipe.id}`}>
              <h2>{recipe.fields?.Nom ?? 'Recette'}</h2>
              <p>Type : {recipe.fields?.['Type de plat'] ?? '—'}</p>
              <p>
                Pour {recipe.fields?.['Nombre de personnes'] ?? 1} personne
                {(typeof recipe.fields?.['Nombre de personnes'] === 'number' && recipe.fields['Nombre de personnes'] > 1) ? 's' : ''}
              </p>
              {Array.isArray((recipe.fields as any)?.tags) && (recipe.fields as any).tags.length > 0 && (
                <div className="tags">
                  {(recipe.fields as any).tags.map((t: string, i: number) => (
                    <span key={i} className="badge tag">{t}</span>
                  ))}
                </div>
              )}
              
        <aside className="recipe-aside">
          {/* Image display: support 'Image' (Airtable-style) or 'imageUrl' */}
          {(() => {
            const maybeImage = recipe.fields?.Image ?? (recipe.fields as any)?.imageUrl ?? null;
            if (Array.isArray(maybeImage) && maybeImage.length > 0) {
              const url = maybeImage[0]?.url ?? maybeImage[0]?.thumbnails?.large?.url ?? null;
              if (url) return <img src={url} alt={recipe.fields?.Nom ?? 'image recette'} className="recipe-image" />;
            }
            if (typeof maybeImage === 'string' && maybeImage.trim() !== '') {
              return <img src={maybeImage} alt={recipe.fields?.Nom ?? 'image recette'} className="recipe-image" />;
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
            </Link>
          </li>
        ))}
      </ul>
      
      {filteredRecipes.length === 0 && searchTerm && (
        <p className="no-results">Aucune recette trouvée pour "{searchTerm}"</p>
      )}
    </div>
  );
};

export default Home;
