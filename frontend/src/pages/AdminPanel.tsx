import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { getAllUsers, User } from '../services/userService';
import { getAllRecipes, Recipe } from '../services/recipeService';
import '../styles/pages/AdminPanel.scss';

const AdminPanel = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // TODO: Add role check here - only admins should access this
    // For now, we'll allow access to all authenticated users

    fetchData();
  }, [isAuthenticated, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersData, recipesData] = await Promise.all([
        getAllUsers(),
        getAllRecipes()
      ]);
      setUsers(usersData);
      setRecipes(recipesData);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <div>Redirection vers la page de connexion...</div>;
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>🔧 Panel Administrateur</h1>
        <p>Gestion des utilisateurs et recettes</p>
      </div>

      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Vue d'ensemble
        </button>
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Utilisateurs ({users.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'recipes' ? 'active' : ''}`}
          onClick={() => setActiveTab('recipes')}
        >
          Recettes ({recipes.length})
        </button>
      </div>

      <div className="admin-content">
        {loading ? (
          <div className="loading">Chargement des données...</div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div className="overview-section">
                <div className="stat-card">
                  <h3>👥 Utilisateurs</h3>
                  <div className="stat-number">{users.length}</div>
                  <p>Utilisateurs inscrits</p>
                </div>
                <div className="stat-card">
                  <h3>📚 Recettes</h3>
                  <div className="stat-number">{recipes.length}</div>
                  <p>Recettes publiées</p>
                </div>
                <div className="stat-card">
                  <h3>📊 Activité</h3>
                  <div className="stat-number">—</div>
                  <p>À venir</p>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="users-section">
                <h2>Liste des Utilisateurs</h2>
                <div className="users-list">
                  {users.map((user: User) => (
                    <div key={user.id} className="user-card">
                      <div className="user-avatar">
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <div className="user-info">
                        <h4>{user.firstName} {user.lastName}</h4>
                        <p>{user.email}</p>
                      </div>
                      <div className="user-actions">
                        <button className="btn btn-outline btn-sm">Voir profil</button>
                        <button className="btn btn-danger btn-sm">Supprimer</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'recipes' && (
              <div className="recipes-section">
                <h2>Liste des Recettes</h2>
                <div className="recipes-list">
                  {recipes.map((recipe: Recipe) => (
                    <div key={recipe.id} className="recipe-admin-card">
                      <h4>{recipe.fields?.Nom ?? 'Sans titre'}</h4>
                      <p><strong>Auteur:</strong> À déterminer</p>
                      <p><strong>Type:</strong> {recipe.fields?.['Type de plat'] ?? '—'}</p>
                      <div className="recipe-actions">
                        <button className="btn btn-outline btn-sm">Voir</button>
                        <button className="btn btn-warning btn-sm">Modifier</button>
                        <button className="btn btn-danger btn-sm">Supprimer</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
