import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getNewRecipeById, updateRecipe, updateRecipeImages } from '../services/recipeService';
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
  imageUrls: [] as string[],
  newImageFiles: [] as File[],
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
            imageUrls: Array.isArray((recipe as any).imageUrls) ? (recipe as any).imageUrls : ((recipe as any).imageUrl ? [(recipe as any).imageUrl] : fd.imageUrls),
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
  // include visibility now supported by backend
  visibility: formData.visibility,
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
      // if new images selected, upload them via the images endpoint
      if (Array.isArray(formData.newImageFiles) && formData.newImageFiles.length > 0) {
        const fd = new FormData();
        formData.newImageFiles.forEach((f: File) => fd.append('images', f));
        // no removals here
        await updateRecipeImages(id, fd);
      }
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
          Images existantes:
        </label>
        <div className="existing-images">
          {Array.isArray(formData.imageUrls) && formData.imageUrls.length > 0 ? (
            formData.imageUrls.map((url: string, i: number) => (
              <div key={i} className="existing-image-item">
                <img src={url.startsWith('/') ? `${process.env.REACT_APP_API_URL ?? 'http://localhost:3001'}${url}` : url} alt={`img-${i}`} style={{ maxWidth: 120 }} />
                <button type="button" onClick={() => setFormData({ ...formData, imageUrls: formData.imageUrls.filter((u: string) => u !== url), _removedImages: [...(formData._removedImages || []), url] })}>Supprimer</button>
              </div>
            ))
          ) : (
            <div>Aucune image</div>
          )}
        </div>

        <label>
          Ajouter des images:
          <input type="file" accept="image/*" multiple onChange={(e) => setFormData({ ...formData, newImageFiles: e.target.files ? Array.from(e.target.files) : [] })} />
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
