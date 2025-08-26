import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getUserRecipes, deleteRecipe } from '../services/recipeService';
import '../styles/pages/MyRecipes.scss';
import ConfirmModal from '../components/ConfirmModal';

const MyRecipes = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    getUserRecipes(1, 50)
      .then((res) => setRecipes(res?.recipes ?? []))
      .catch((err) => console.error('getUserRecipes error', err))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const handleView = (id: string) => {
    navigate(`/recipe/${id}`);
  };

  const handleEdit = (id: string) => {
  navigate(`/edit-recipe/${id}`);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
  };

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteRecipe(deletingId);
      setRecipes((prev) => prev.filter((r) => r.id !== deletingId));
    } catch (err) {
      console.error('deleteRecipe error', err);
      alert('Impossible de supprimer la recette');
    } finally {
      setDeletingId(null);
    }
  };

  const cancelDelete = () => setDeletingId(null);

  if (!isAuthenticated) {
    return <div>Connectez-vous pour voir vos recettes.</div>;
  }

  return (
    <div className="page my-recipes">
      <h1>Mes recettes</h1>
      {loading && <div>Chargement...</div>}
      {!loading && recipes.length === 0 && <div>Vous n'avez pas encore de recettes.</div>}
      <div className="recipe-list">
        {recipes.map((r) => (
          <div key={r.id} className="recipe-card">
            <div className="recipe-card-body">
              <div className="recipe-title">{r.name ?? r.fields?.Nom ?? 'Sans titre'}</div>
              <div className="recipe-meta">Créé: {new Date(r.createdAt ?? r.fields?.createdAt ?? Date.now()).toLocaleString()}</div>
              <div className="recipe-actions">
                <button onClick={() => handleView(r.id)}>Voir</button>
                <button onClick={() => handleEdit(r.id)}>Modifier</button>
                <button onClick={() => handleDelete(r.id)}>Supprimer</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <ConfirmModal
        open={!!deletingId}
        title="Supprimer la recette"
        message="Voulez-vous vraiment supprimer cette recette ? Cette action est irréversible."
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default MyRecipes;
