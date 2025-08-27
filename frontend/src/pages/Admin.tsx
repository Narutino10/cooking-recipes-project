import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import '../styles/pages/Admin.scss';

interface ContentItem {
  id: number;
  type: 'blog' | 'forum' | 'event' | 'recipe';
  title: string;
  author: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  content: string;
}

const Admin = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'content' | 'users' | 'settings'>('dashboard');
  const [pendingContent, setPendingContent] = useState<ContentItem[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRecipes: 0,
    totalPosts: 0,
    pendingItems: 0
  });

  useEffect(() => {
    // Simulation de données admin
    const mockPendingContent: ContentItem[] = [
      {
        id: 1,
        type: 'blog',
        title: 'Les secrets des chefs pour réussir vos sauces',
        author: 'ChefAmateur',
        status: 'pending',
        createdAt: '2025-01-15',
        content: 'Découvrez les techniques professionnelles...'
      },
      {
        id: 2,
        type: 'forum',
        title: 'Comment réussir parfaitement un risotto ?',
        author: 'PâtissierPassion',
        status: 'pending',
        createdAt: '2025-01-14',
        content: 'Bonjour à tous ! Je cherche des conseils...'
      },
      {
        id: 3,
        type: 'event',
        title: 'Atelier Cuisine Française',
        author: 'ChefDubois',
        status: 'pending',
        createdAt: '2025-01-13',
        content: 'Apprenez les bases de la cuisine française...'
      }
    ];

    setPendingContent(mockPendingContent);
    setStats({
      totalUsers: 1234,
      totalRecipes: 567,
      totalPosts: 890,
      pendingItems: mockPendingContent.length
    });
  }, []);

  const handleContentAction = (id: number, action: 'approve' | 'reject') => {
    setPendingContent(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, status: action === 'approve' ? 'approved' : 'rejected' }
          : item
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#27ae60';
      case 'rejected': return '#e74c3c';
      case 'pending': return '#f39c12';
      default: return '#95a5a6';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved': return 'Approuvé';
      case 'rejected': return 'Rejeté';
      case 'pending': return 'En attente';
      default: return status;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'blog': return 'Article de blog';
      case 'forum': return 'Sujet forum';
      case 'event': return 'Événement';
      case 'recipe': return 'Recette';
      default: return type;
    }
  };

  if (!user || user.email !== 'iouahabi1@myges.fr') {
    return (
      <div className="admin-access-denied">
        <h1>Accès refusé</h1>
        <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        <header className="admin-header">
          <h1>🍳 Panel d'Administration</h1>
          <p>Gérez votre plateforme culinaire</p>
        </header>

        <nav className="admin-nav">
          <button
            className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <i className="fas fa-chart-line"></i>
            Tableau de bord
          </button>
          <button
            className={`nav-tab ${activeTab === 'content' ? 'active' : ''}`}
            onClick={() => setActiveTab('content')}
          >
            <i className="fas fa-file-alt"></i>
            Contenu
            {stats.pendingItems > 0 && (
              <span className="badge">{stats.pendingItems}</span>
            )}
          </button>
          <button
            className={`nav-tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <i className="fas fa-users"></i>
            Utilisateurs
          </button>
          <button
            className={`nav-tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <i className="fas fa-cog"></i>
            Paramètres
          </button>
        </nav>

        <main className="admin-content">
          {activeTab === 'dashboard' && (
            <div className="dashboard">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-users"></i>
                  </div>
                  <div className="stat-info">
                    <h3>{stats.totalUsers.toLocaleString()}</h3>
                    <p>Utilisateurs inscrits</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-utensils"></i>
                  </div>
                  <div className="stat-info">
                    <h3>{stats.totalRecipes.toLocaleString()}</h3>
                    <p>Recettes publiées</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-comments"></i>
                  </div>
                  <div className="stat-info">
                    <h3>{stats.totalPosts.toLocaleString()}</h3>
                    <p>Messages forum</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-clock"></i>
                  </div>
                  <div className="stat-info">
                    <h3>{stats.pendingItems}</h3>
                    <p>En attente de validation</p>
                  </div>
                </div>
              </div>

              <div className="recent-activity">
                <h3>Activité récente</h3>
                <div className="activity-list">
                  <div className="activity-item">
                    <div className="activity-icon">
                      <i className="fas fa-user-plus"></i>
                    </div>
                    <div className="activity-content">
                      <p>Nouveau utilisateur inscrit : Marie Dubois</p>
                      <span className="activity-time">Il y a 2 heures</span>
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-icon">
                      <i className="fas fa-utensils"></i>
                    </div>
                    <div className="activity-content">
                      <p>Nouvelle recette publiée : "Risotto aux truffes"</p>
                      <span className="activity-time">Il y a 4 heures</span>
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-icon">
                      <i className="fas fa-comments"></i>
                    </div>
                    <div className="activity-content">
                      <p>Nouveau sujet forum : "Techniques de cuisson"</p>
                      <span className="activity-time">Il y a 6 heures</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'content' && (
            <div className="content-management">
              <div className="content-header">
                <h3>Validation du contenu</h3>
                <p>Gérez les articles de blog, sujets forum et événements en attente</p>
              </div>

              <div className="content-list">
                {pendingContent.map(item => (
                  <div key={item.id} className="content-item">
                    <div className="content-info">
                      <div className="content-meta">
                        <span className="content-type">{getTypeLabel(item.type)}</span>
                        <span
                          className="content-status"
                          style={{ backgroundColor: getStatusColor(item.status) }}
                        >
                          {getStatusLabel(item.status)}
                        </span>
                      </div>
                      <h4>{item.title}</h4>
                      <p className="content-preview">{item.content}</p>
                      <div className="content-details">
                        <span className="author">Par {item.author}</span>
                        <span className="date">{new Date(item.createdAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>

                    {item.status === 'pending' && (
                      <div className="content-actions">
                        <button
                          className="btn btn-success"
                          onClick={() => handleContentAction(item.id, 'approve')}
                        >
                          <i className="fas fa-check"></i>
                          Approuver
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleContentAction(item.id, 'reject')}
                        >
                          <i className="fas fa-times"></i>
                          Rejeter
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="users-management">
              <h3>Gestion des utilisateurs</h3>
              <p>Fonctionnalité à implémenter - Liste des utilisateurs, modération, statistiques</p>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="settings">
              <h3>Paramètres système</h3>
              <p>Fonctionnalité à implémenter - Configuration du site, modération automatique, etc.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Admin;
