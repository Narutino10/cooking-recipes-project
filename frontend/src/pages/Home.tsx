import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllRecipes } from '../services/recipeService';
import { Recipe } from '../types/recipe.type';
import { getIngredientsFromRecipe, formatIngredientsForSearch } from '../utils/recipeUtils';
import useDebounce from '../hooks/useDebounce';
import RecipeImage from '../components/RecipeImage';
import '../styles/pages/Home.scss';

const Home = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAllRecipes();
        setRecipes(data);
        setFilteredRecipes(data);
      } catch (err: any) {
        setError(err?.message ?? 'Erreur lors du chargement des recettes');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  useEffect(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (q === '') {
      setFilteredRecipes(recipes);
      return;
    }
    const filtered = recipes.filter((recipe) => {
      const ingredients = getIngredientsFromRecipe(recipe);
      const ingredientsText = formatIngredientsForSearch(ingredients);

      const name = String(recipe.fields?.Nom ?? '').toLowerCase();
      const type = String(recipe.fields?.['Type de plat'] ?? '').toLowerCase();

      return name.includes(q) || type.includes(q) || ingredientsText.includes(q);
    });
    setFilteredRecipes(filtered);
  }, [debouncedSearch, recipes]);

  const recipesList = useMemo(() => filteredRecipes, [filteredRecipes]);

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
          aria-label="Rechercher des recettes"
        />
      </div>

      {loading && <p>Chargement des recettes...</p>}
      {error && <p className="error">{error}</p>}

      <ul className="recipes-list">
        {recipesList.map((recipe) => (
          <li key={recipe.id} className="recipe-card">
            <Link to={`/recipe/${recipe.id}`}>
              <div className="recipe-aside">
                <RecipeImage recipe={recipe} size="medium" />
              </div>

              <div className="recipe-content">
                <h2>{recipe.fields?.Nom ?? 'Recette'}</h2>
                <p><strong>Type :</strong> {recipe.fields?.['Type de plat'] ?? '—'}</p>
                <p><strong>Pour :</strong> {recipe.fields?.['Nombre de personnes'] ?? 1} personne{(typeof recipe.fields?.['Nombre de personnes'] === 'number' && recipe.fields['Nombre de personnes'] > 1) ? 's' : ''}</p>

                {Array.isArray((recipe.fields as any)?.tags) && (recipe.fields as any).tags.length > 0 && (
                  <div className="tags">
                    {(recipe.fields as any).tags.map((t: string, i: number) => (
                      <span key={i} className="badge tag">{t}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* small meta block */}
              <div className="aside-meta">
                {((recipe.fields as any).prepTime || (recipe.fields as any).cookTime) && (
                  <p><strong>Temps :</strong> {(recipe.fields as any).prepTime ?? 0} min préparation / {(recipe.fields as any).cookTime ?? 0} min cuisson</p>
                )}
                {(recipe.fields as any).calories && (
                  <p><strong>Calories :</strong> {(recipe.fields as any).calories} kcal</p>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {recipesList.length === 0 && debouncedSearch && (
        <p className="no-results">Aucune recette trouvée pour "{searchTerm}"</p>
      )}
    </div>
  );
};

export default Home;
