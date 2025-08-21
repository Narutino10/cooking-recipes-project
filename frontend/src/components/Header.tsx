import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import '../styles/components/Header.scss';

const Header = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate('/');
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/" className="logo-link">
            <span className="logo-icon">🍽️</span>
            <span className="logo-text">Cooking Recipes</span>
          </Link>
        </div>

        <nav className="nav-links">
          <Link to="/" className="nav-link">
            <span className="nav-icon">🏠</span>
            Accueil
          </Link>
          
          {isAuthenticated ? (
            <>
              <Link to="/create-recipe" className="nav-link">
                <span className="nav-icon">➕</span>
                Créer une recette
              </Link>
              <Link to="/generate-recipe" className="nav-link">
                <span className="nav-icon">🤖</span>
                Générer avec IA
              </Link>
            </>
          ) : (
            <Link to="/generate-recipe" className="nav-link">
              <span className="nav-icon">🤖</span>
              Générer avec IA
            </Link>
          )}
        </nav>

        <div className="auth-section">
          {isAuthenticated ? (
            <div className="user-menu" ref={dropdownRef}>
              <button 
                className="user-profile-btn" 
                onClick={toggleDropdown}
                aria-expanded={showDropdown}
              >
                <div className="user-avatar">
                  {user?.firstName?.[0]?.toUpperCase()}{user?.lastName?.[0]?.toUpperCase()}
                </div>
                <span className="user-name">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className={`dropdown-arrow ${showDropdown ? 'open' : ''}`}>
                  ▼
                </span>
              </button>
              
              {showDropdown && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <div className="user-info">
                      <div className="user-avatar-large">
                        {user?.firstName?.[0]?.toUpperCase()}{user?.lastName?.[0]?.toUpperCase()}
                      </div>
                      <div className="user-details">
                        <div className="user-full-name">
                          {user?.firstName} {user?.lastName}
                        </div>
                        <div className="user-email">{user?.email}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="dropdown-divider"></div>
                  
                  <Link 
                    to="/profile" 
                    className="dropdown-item"
                    onClick={() => setShowDropdown(false)}
                  >
                    <span className="dropdown-icon">👤</span>
                    Mon Profil
                  </Link>
                  <Link 
                    to="/profile" 
                    className="dropdown-item"
                    onClick={() => setShowDropdown(false)}
                  >
                    <span className="dropdown-icon">📖</span>
                    Mes Recettes
                  </Link>
                  <Link 
                    to="/create-recipe" 
                    className="dropdown-item"
                    onClick={() => setShowDropdown(false)}
                  >
                    <span className="dropdown-icon">➕</span>
                    Créer une recette
                  </Link>
                  
                  <div className="dropdown-divider"></div>
                  
                  <button 
                    className="dropdown-item logout-btn" 
                    onClick={handleLogout}
                  >
                    <span className="dropdown-icon">🚪</span>
                    Se déconnecter
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-outline">
                Se connecter
              </Link>
              <Link to="/register" className="btn btn-primary">
                S'inscrire
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
