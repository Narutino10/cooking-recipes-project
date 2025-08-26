import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { createNewRecipe, createRecipeWithImage } from '../services/recipeService';
import { getNewRecipeById, updateRecipe } from '../services/recipeService';
import '../styles/pages/CreateRecipe.scss';

const CreateRecipe = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

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
  imageFiles?: File[];
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
  imageFiles: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // structured ingredients: name + amount (e.g., sugar + 200g)
  const [ingredientsList, setIngredientsList] = useState<{ name: string; amount: string }[]>([
    { name: '', amount: '' },
  ]);

  // Load recipe when ?edit=<id> is present
  useEffect(() => {
    const edit = searchParams.get('edit');
    if (!edit) return;
    setIsEditing(true);
    setEditId(edit);
    (async () => {
      try {
        const recipe = await getNewRecipeById(edit);
        // map recipe to form fields
        setFormData((fd) => ({
          ...fd,
          name: recipe.name ?? fd.name,
          type: (recipe as any).type ?? fd.type,
          ingredients: Array.isArray((recipe as any).ingredients) ? (recipe as any).ingredients.join(', ') : (recipe as any).ingredients ?? fd.ingredients,
          nbPersons: (recipe as any).servings ?? (recipe as any).nbPersons ?? fd.nbPersons,
          intolerances: Array.isArray((recipe as any).intolerances) ? (recipe as any).intolerances.join(', ') : (recipe as any).intolerances ?? fd.intolerances,
          instructions: (recipe as any).instructions ?? fd.instructions,
          description: (recipe as any).description ?? fd.description,
          visibility: (recipe as any).visibility ?? fd.visibility,
          tags: Array.isArray((recipe as any).tags) ? (recipe as any).tags.join(', ') : (recipe as any).tags ?? fd.tags,
          difficulty: (recipe as any).difficulty ?? fd.difficulty,
          prepTime: (recipe as any).prepTime ? String((recipe as any).prepTime) : fd.prepTime,
          cookTime: (recipe as any).cookTime ? String((recipe as any).cookTime) : fd.cookTime,
          calories: (recipe as any).calories ? String((recipe as any).calories) : fd.calories,
          imageUrl: (recipe as any).imageUrl ?? fd.imageUrl,
        }));
      } catch (err) {
        console.error('load recipe for edit error', err);
        alert('Impossible de charger la recette pour modification');
      }
    })();
  }, [searchParams]);

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
    setIsSubmitting(true);
    try {
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
        // backend expects 'servings'
        servings: Number(formData.nbPersons),
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

      // If editing, call updateRecipe (image replacement not supported here)
      if (isEditing && editId) {
        if ((formData as any).imageFile instanceof File) {
          alert('Remplacement d\'image lors de la modification non pris en charge pour l\'instant. Retirez le fichier ou mettez à jour l\'image séparément.');
          setIsSubmitting(false);
          return;
        }
        await updateRecipe(editId, payload as any);
        alert('Recette mise à jour avec succès !');
        navigate(`/recipe/${editId}`);
      } else {
        // If image files were selected, send multipart/form-data with key 'images'
        if (Array.isArray((formData as any).imageFiles) && (formData as any).imageFiles.length > 0) {
          const fd = new FormData();
          Object.entries(payload).forEach(([k, v]) => {
            if (Array.isArray(v)) fd.append(k, v.join(','));
            else if (v !== undefined && v !== null) fd.append(k, String(v));
          });
          (formData as any).imageFiles.forEach((f: File) => fd.append('images', f));
          await createRecipeWithImage(fd);
        } else {
          await createNewRecipe(payload as any);
        }
        alert('Recette créée avec succès !');
        // reset form after create
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
          imageFiles: [],
        });
        setIngredientsList([{ name: '', amount: '' }]);
      }

  // handled above
    } catch (err: any) {
      console.error('create recipe error', err);
  alert(err?.message ?? 'Erreur lors de la création / mise à jour de la recette');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-recipe">
      <h1>Créer une nouvelle recette</h1>
      <form onSubmit={handleSubmit}>
  <input type="text" name="name" placeholder="Nom" value={formData.name} onChange={handleChange} required />
        <label>
          Type de plat:
          <select name="type" value={formData.type} onChange={handleChange} required>
            <option value="">-- Choisir --</option>
            <option value="dessert">Dessert</option>
            <option value="breakfast">Petit-déjeuner</option>
            <option value="main">Plat principal</option>
            <option value="snack">Snack</option>
            <option value="drink">Boisson</option>
          </select>
        </label>
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
          <button type="button" onClick={() => setIngredientsList([...ingredientsList, { name: '', amount: '' }])}>
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
          Images (optionnelles):
          <input type="file" accept="image/*" multiple onChange={(e) => setFormData({ ...formData, imageFiles: e.target.files ? Array.from(e.target.files) : [] })} />
        </label>
        {/* preview selected images */}
        {Array.isArray(formData.imageFiles) && formData.imageFiles.length > 0 && (
          <div className="image-previews">
            {formData.imageFiles.map((f, i) => (
              <div key={i} className="preview-item">
                <img src={URL.createObjectURL(f)} alt={f.name} style={{ maxWidth: 120 }} />
                <div>{f.name}</div>
              </div>
            ))}
          </div>
        )}

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

  <button type="submit" disabled={isSubmitting}>{isSubmitting ? (isEditing ? 'Mise à jour...' : 'Création...') : (isEditing ? 'Mettre à jour' : 'Créer')}</button>
      </form>
    </div>
  );
};

export default CreateRecipe;
