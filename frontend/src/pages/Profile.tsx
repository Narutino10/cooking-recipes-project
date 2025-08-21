import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile } from '../services/authService';
import { getUserRecipes, NewRecipe } from '../services/recipeService';
import '../styles/pages/Profile.scss';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isEmailConfirmed: boolean;
  createdAt: string;
}

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [recipes, setRecipes] = useState<NewRecipe[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const [userResponse, recipesResponse] = await Promise.all([
          getProfile(),
          getUserRecipes()
        ]);
        
        setUser(userResponse);
        setRecipes(recipesResponse.recipes || []);
        setFormData({
          firstName: userResponse.firstName,
          lastName: userResponse.lastName,
        });
      } catch (error: any) {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          setError('Erreur lors du chargement des données');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const updatedUser = await updateProfile(formData);
      setUser(updatedUser);
      setIsEditing(false);
      setSuccess('Profil mis à jour avec succès !');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (loading) {
    return <div className="profile-loading">Chargement...</div>;
  }

  if (!user) {
    return <div className="profile-error">Utilisateur non trouvé</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <h1>Mon Profil</h1>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="profile-info">
          <div className="user-card">
            <div className="user-avatar">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            
            {!isEditing ? (
              <div className="user-details">
                <h2>{user.firstName} {user.lastName}</h2>
                <p className="user-email">{user.email}</p>
                <p className="user-status">
                  Compte {user.isEmailConfirmed ? 'vérifié' : 'non vérifié'}
                </p>
                <p className="user-joined">
                  Inscrit le {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                </p>
                
                <div className="profile-actions">
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="edit-button"
                  >
                    Modifier le profil
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="logout-button"
                  >
                    Se déconnecter
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdate} className="edit-form">
                <div className="form-group">
                  <label htmlFor="firstName">Prénom</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="lastName">Nom</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-actions">
                  <button type="submit" className="save-button">
                    Enregistrer
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        firstName: user.firstName,
                        lastName: user.lastName,
                      });
                    }}
                    className="cancel-button"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        <div className="user-recipes">
          <h2>Mes Recettes ({recipes.length})</h2>
          
          {recipes.length === 0 ? (
            <div className="no-recipes">
              <p>Vous n'avez pas encore créé de recettes.</p>
              <button 
                onClick={() => navigate('/create-recipe')}
                className="create-first-recipe"
              >
                Créer ma première recette
              </button>
            </div>
          ) : (
            <div className="recipes-grid">
              {recipes.map((recipe) => (
                <div key={recipe.id} className="recipe-card">
                  <h3>{recipe.name}</h3>
                  <p className="recipe-description">{recipe.description}</p>
                  <div className="recipe-meta">
                    <span className="recipe-servings">{recipe.servings} pers.</span>
                    <span className="recipe-difficulty">{recipe.difficulty}</span>
                  </div>
                  <div className="recipe-actions">
                    <button 
                      onClick={() => navigate(`/recipe/${recipe.id}`)}
                      className="view-button"
                    >
                      Voir
                    </button>
                    <button 
                      onClick={() => navigate(`/recipe/${recipe.id}/edit`)}
                      className="edit-recipe-button"
                    >
                      Modifier
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
