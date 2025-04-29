import { useEffect, useState } from 'react';
import { getAllRecipes } from '../services/recipeService';
import { Recipe } from '../types/recipe.type';
import '../styles/pages/Home.scss'; 

const Home = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    const fetchRecipes = async () => {
      const data = await getAllRecipes();
      setRecipes(data);
    };

    fetchRecipes();
  }, []);

  return (
    <div className="home-page">
      <h1>Liste des Recettes</h1>
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
