import { useState } from 'react';
import { createRecipe } from '../services/recipeService';
import '../styles/pages/CreateRecipe.scss';

const CreateRecipe = () => {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    ingredients: '',
    nbPersons: 1,
    intolerances: '',
    instructions: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      ingredients: formData.ingredients.split(',').map((i) => i.trim()),
      intolerances: formData.intolerances ? formData.intolerances.split(',').map((i) => i.trim()) : [],
      nbPersons: Number(formData.nbPersons),
    };
    await createRecipe(payload);
    alert('Recette créée avec succès !');
    setFormData({
      name: '',
      type: '',
      ingredients: '',
      nbPersons: 1,
      intolerances: '',
      instructions: '',
    });
  };

  return (
    <div className="create-recipe">
      <h1>Créer une nouvelle recette</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Nom" value={formData.name} onChange={handleChange} required />
        <input type="text" name="type" placeholder="Type de plat" value={formData.type} onChange={handleChange} required />
        <input type="text" name="ingredients" placeholder="Ingrédients (séparés par ,)" value={formData.ingredients} onChange={handleChange} required />
        <input type="number" name="nbPersons" placeholder="Nombre de personnes" value={formData.nbPersons} onChange={handleChange} required />
        <input type="text" name="intolerances" placeholder="Intolérances (séparées par ,)" value={formData.intolerances} onChange={handleChange} />
        <textarea name="instructions" placeholder="Instructions" value={formData.instructions} onChange={handleChange} required />
        <button type="submit">Créer</button>
      </form>
    </div>
  );
};

export default CreateRecipe;
