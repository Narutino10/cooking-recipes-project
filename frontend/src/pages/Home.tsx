import { useEffect, useState } from 'react';
import { getAllRecipes, searchRecipes } from '../services/recipeService';
import { Recipe } from '../types/recipe.type';
import '../styles/pages/Home.scss';

const Home = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [query, setQuery] = useState({ name: '', type: '', ingredient: '' });

  const fetchRecipes = async () => {
    const data = await getAllRecipes();
    setRecipes(data);
  };

  const fetchSearch = async () => {
    const data = await searchRecipes(query);
    setRecipes(data);
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  return (
    <div className="home-page">
      <h1>Liste des Recettes</h1>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Nom"
          value={query.name}
          onChange={(e) => setQuery({ ...query, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Type de plat"
          value={query.type}
          onChange={(e) => setQuery({ ...query, type: e.target.value })}
        />
        <input
          type="text"
          placeholder="Ingrédient"
          value={query.ingredient}
          onChange={(e) => setQuery({ ...query, ingredient: e.target.value })}
        />
        <button onClick={fetchSearch}>Rechercher</button>
        <button onClick={fetchRecipes}>Réinitialiser</button>
      </div>

      <ul className="recipes-list">
        {recipes.map((recipe) => (
          <li key={recipe.id} className="recipe-card">
            <h2>{recipe.fields.Nom}</h2>
            <p>Type : {recipe.fields['Type de plat']}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;
