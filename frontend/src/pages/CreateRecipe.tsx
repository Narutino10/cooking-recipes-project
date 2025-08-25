import { useState } from 'react';
import { createNewRecipe } from '../services/recipeService';
import '../styles/pages/CreateRecipe.scss';

const CreateRecipe = () => {
  const [formData, setFormData] = useState<{
    name: string;
    type: string;
    ingredients: string;
    nbPersons: number;
    intolerances: string;
    instructions: string;
  description: string;
    visibility: 'public' | 'private';
    tags: string;
    difficulty: 'easy' | 'medium' | 'hard';
    prepTime: string;
    cookTime: string;
    calories: string;
    imageUrl: string;
  imageFile?: File | null;
  }>({
    name: '',
    type: '',
    ingredients: '',
    nbPersons: 1,
    intolerances: '',
    instructions: '',
  description: '',
  visibility: 'public',
  tags: '',
  difficulty: 'easy',
  prepTime: '',
  cookTime: '',
  calories: '',
  imageUrl: '',
  imageFile: null,
  });

  // structured ingredients: name + amount (e.g., sugar + 200g)
  const [ingredientsList, setIngredientsList] = useState<{ name: string; amount: string }[]>([
    { name: '', amount: '' },
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target as HTMLInputElement;
    if (name === 'nbPersons') {
      setFormData({ ...formData, [name]: Number(value) });
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ingredientsPayload =
      ingredientsList.length && ingredientsList.some((it) => it.name.trim() !== '')
        ? ingredientsList
            .filter((it) => it.name.trim() !== '')
            .map((it) => (it.amount ? `${it.amount} ${it.name}`.trim() : it.name.trim()))
        : formData.ingredients
            .split(',')
            .map((i) => i.trim())
            .filter((s) => s.length > 0);

    const ingredientsText = ingredientsPayload.length
      ? ingredientsPayload.map((it) => `- ${it}`).join('\n')
      : '';

    const payload = {
      name: formData.name,
      type: formData.type,
      ingredients: ingredientsPayload,
      nbPersons: Number(formData.nbPersons),
      intolerances: formData.intolerances ? formData.intolerances.split(',').map((i) => i.trim()) : [],
      instructions: formData.instructions,
  visibility: formData.visibility,
      tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()) : [],
  difficulty: formData.difficulty as 'easy' | 'medium' | 'hard',
      prepTime: formData.prepTime ? Number(formData.prepTime) : undefined,
      cookTime: formData.cookTime ? Number(formData.cookTime) : undefined,
      calories: formData.calories ? Number(formData.calories) : undefined,
  description: `${ingredientsText}${ingredientsText ? '\n\n' : ''}${formData.description}`,
    };
    // If an image file was selected, send multipart/form-data
    if ((formData as any).imageFile instanceof File) {
      const fd = new FormData();
      Object.entries(payload).forEach(([k, v]) => {
        if (Array.isArray(v)) fd.append(k, v.join(','));
        else if (v !== undefined && v !== null) fd.append(k, String(v));
      });
      fd.append('image', (formData as any).imageFile);
      await (await import('../services/recipeService')).createRecipeWithImage(fd);
    } else {
      await createNewRecipe(payload);
    }
    alert('Recette créée avec succès !');
    setFormData({
      name: '',
      type: '',
      ingredients: '',
      nbPersons: 1,
      intolerances: '',
      instructions: '',
  description: '',
  visibility: 'public',
      tags: '',
      difficulty: 'easy',
      prepTime: '',
      cookTime: '',
      calories: '',
      imageUrl: '',
    });
    setIngredientsList([{ name: '', amount: '' }]);
  };

  return (
    <div className="create-recipe">
      <h1>Créer une nouvelle recette</h1>
      <form onSubmit={handleSubmit}>
          <input type="text" name="name" placeholder="Nom" value={formData.name} onChange={handleChange} required />
          <input type="text" name="type" placeholder="Type de plat" value={formData.type} onChange={handleChange} required />
          {/* Ingredients structured input: multiple rows with name + amount */}
          <div className="ingredients-list">
            <label>Ingrédients (nom + grammage)</label>
            {ingredientsList.map((ing, idx) => (
              <div key={idx} className="ingredient-row">
                <input
                  type="text"
                  placeholder="Nom (ex: Farine)"
                  value={ing.name}
                  onChange={(e) => {
                    const copy = [...ingredientsList];
                    copy[idx] = { ...copy[idx], name: e.target.value };
                    setIngredientsList(copy);
                  }}
                />
                <input
                  type="text"
                  placeholder="Quantité (ex: 200g)"
                  value={ing.amount}
                  onChange={(e) => {
                    const copy = [...ingredientsList];
                    copy[idx] = { ...copy[idx], amount: e.target.value };
                    setIngredientsList(copy);
                  }}
                />
                <button type="button" onClick={() => setIngredientsList(ingredientsList.filter((_, i) => i !== idx))}>
                  Supprimer
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setIngredientsList([...ingredientsList, { name: '', amount: '' }])}
            >
              Ajouter un ingrédient
            </button>
          </div>
          <input type="number" name="nbPersons" placeholder="Nombre de personnes" value={formData.nbPersons} onChange={handleChange} required />
          <input type="text" name="intolerances" placeholder="Intolérances (séparées par ,)" value={formData.intolerances} onChange={handleChange} />
          <textarea name="description" placeholder="Courte description" value={formData.description} onChange={handleChange} />

          <textarea name="instructions" placeholder="Instructions" value={formData.instructions} onChange={handleChange} required />

          <label>
            Visibilité:
            <select name="visibility" value={formData.visibility} onChange={handleChange}>
              <option value="public">Publique</option>
              <option value="private">Privée</option>
            </select>
          </label>

          <input type="text" name="tags" placeholder="Tags (séparés par ,)" value={formData.tags} onChange={handleChange} />
          <label>
            Image (optionnelle):
            <input type="file" accept="image/*" onChange={(e) => setFormData({ ...formData, imageFile: e.target.files?.[0] ?? null })} />
          </label>

          <label>
            Difficulté:
            <select name="difficulty" value={formData.difficulty} onChange={handleChange}>
              <option value="easy">Facile</option>
              <option value="medium">Moyenne</option>
              <option value="hard">Difficile</option>
            </select>
          </label>

          <input type="number" name="prepTime" placeholder="Temps de préparation (minutes)" value={formData.prepTime} onChange={handleChange} />
          <input type="number" name="cookTime" placeholder="Temps de cuisson (minutes)" value={formData.cookTime} onChange={handleChange} />
          <input type="number" name="calories" placeholder="Calories (kcal)" value={formData.calories} onChange={handleChange} />
          {/* imageUrl removed: use file upload instead */}

          <button type="submit">Créer</button>
        </form>
    </div>
  );
};

export default CreateRecipe;
