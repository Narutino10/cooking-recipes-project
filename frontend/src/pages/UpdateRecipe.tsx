import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getNewRecipeById, updateRecipe } from '../services/recipeService';
import '../styles/pages/CreateRecipe.scss';

const UpdateRecipe = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<any>({
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

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const recipe = await getNewRecipeById(id);
        setFormData((fd: any) => ({
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
        console.error('load recipe for update error', err);
        alert('Impossible de charger la recette');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

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
    if (!id) return;
    setIsSubmitting(true);
    try {
      const payload: any = {
        // Only include properties defined in UpdateRecipeDto to satisfy ValidationPipe
        name: formData.name,
        ingredients: formData.ingredients ? formData.ingredients.split(',').map((s: string) => s.trim()) : [],
        servings: Number(formData.nbPersons),
        intolerances: formData.intolerances ? formData.intolerances.split(',').map((s: string) => s.trim()) : [],
        instructions: formData.instructions,
        tags: formData.tags ? formData.tags.split(',').map((s: string) => s.trim()) : [],
        difficulty: formData.difficulty,
        prepTime: formData.prepTime ? Number(formData.prepTime) : undefined,
        cookTime: formData.cookTime ? Number(formData.cookTime) : undefined,
        calories: formData.calories ? Number(formData.calories) : undefined,
        description: formData.description,
      };

      if ((formData as any).imageFile instanceof File) {
        alert('Remplacement d\'image non pris en charge pour l\'instant. Retirez le fichier ou mettez à jour l\'image séparément.');
        setIsSubmitting(false);
        return;
      }

      await updateRecipe(id, payload);
      alert('Recette mise à jour');
      navigate(`/recipe/${id}`);
    } catch (err) {
      console.error('update error', err);
      alert('Erreur lors de la mise à jour');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="create-recipe">
      <h1>Modifier la recette</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Nom" value={formData.name} onChange={handleChange} required />
        <input type="text" name="type" placeholder="Type de plat" value={formData.type} onChange={handleChange} required />

        <input type="text" name="ingredients" placeholder="Ingrédients (séparés par ,)" value={formData.ingredients} onChange={handleChange} />
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
          Image (optionnelle, non utilisée pour le moment):
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

        <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Mise à jour...' : 'Mettre à jour'}</button>
      </form>
    </div>
  );
};

export default UpdateRecipe;
