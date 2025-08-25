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
