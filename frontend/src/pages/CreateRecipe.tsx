import { useEffect, useState } from 'react';
import { createRecipe, getAllIngredients } from '../services/recipeService';
import { Ingredient } from '../types/ingredient.type';
import '../styles/pages/CreateRecipe.scss';

const CreateRecipe = () => {
  const [ingredientsList, setIngredientsList] = useState<Ingredient[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    ingredients: [] as string[],
    nbPersons: 1,
    intolerances: '',
    instructions: '',
  });

  useEffect(() => {
    const fetchIngredients = async () => {
      const data = await getAllIngredients();
      setIngredientsList(data);
    };
    fetchIngredients();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleIngredientsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
    setFormData({ ...formData, ingredients: selected });
  };
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const payload = {
    name: formData.name,
    type: formData.type,
    ingredients: formData.ingredients, // ✅ liste d’IDs
    nbPersons: Number(formData.nbPersons),
    intolerances: formData.intolerances ? [formData.intolerances] : [],
    instructions: formData.instructions,
  };

  try {
    await createRecipe(payload);
    alert('Recette créée avec succès !');
    setFormData({
      name: '',
      type: '',
      ingredients: [],
      nbPersons: 1,
      intolerances: '',
      instructions: '',
    });
  } catch (err) {
    console.error('Erreur lors de la création :', err);
    alert('Erreur lors de la création de la recette.');
  }
};


  return (
    <div className="create-recipe">
      <h1>Créer une nouvelle recette</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Nom"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="type"
          placeholder="Type de plat"
          value={formData.type}
          onChange={handleChange}
          required
        />

        <label>Ingrédients (Ctrl+clic pour multiple) :</label>
        <select
          multiple
          name="ingredients"
          value={formData.ingredients}
          onChange={handleIngredientsChange}
        >
          {ingredientsList.map((ing) => (
            <option key={ing.id} value={ing.id}>
              {ing.fields.Nom}
            </option>

          ))}
        </select>

        <input
          type="number"
          name="nbPersons"
          placeholder="Nombre de personnes"
          value={formData.nbPersons}
          onChange={handleChange}
          required
        />

        <label>Intolérances :</label>
        <select name="intolerances" value={formData.intolerances} onChange={handleChange}>
          <option value="">Aucune</option>
          <option value="Lactose">Lactose</option>
          <option value="Gluten">Gluten</option>
          <option value="Arachides">Arachides</option>
        </select>

        <textarea
          name="instructions"
          placeholder="Instructions"
          value={formData.instructions}
          onChange={handleChange}
          required
        />

        <button type="submit">Créer</button>
      </form>
    </div>
  );
};

export default CreateRecipe;
