import { useState, useEffect } from 'react';
import '../styles/pages/Forum.scss';

interface ForumPost {
  id: number;
  title: string;
  content: string;
  author: string;
  authorAvatar: string;
  date: string;
  category: string;
  replies: number;
  likes: number;
  tags: string[];
  isSticky?: boolean;
  isLocked?: boolean;
}

interface ForumCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  postCount: number;
  color: string;
}

const Forum = () => {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewPostForm, setShowNewPostForm] = useState(false);

  const categories: ForumCategory[] = [
    {
      id: 'general',
      name: 'Discussion générale',
      description: 'Discussions libres sur la cuisine',
      icon: '💬',
      postCount: 45,
      color: '#3498db'
    },
    {
      id: 'recettes',
      name: 'Partage de recettes',
      description: 'Partagez vos meilleures recettes',
      icon: '🍳',
      postCount: 32,
      color: '#e74c3c'
    },
    {
      id: 'aide',
      name: 'Aide & Conseils',
      description: 'Demandez de l\'aide à la communauté',
      icon: '❓',
      postCount: 28,
      color: '#27ae60'
    },
    {
      id: 'events',
      name: 'Événements culinaires',
      description: 'Annoncez vos événements',
      icon: '🎉',
      postCount: 15,
      color: '#f39c12'
    }
  ];

  useEffect(() => {
    // Simulation de données de forum
    const mockPosts: ForumPost[] = [
      {
        id: 1,
        title: "Comment réussir parfaitement un risotto à la truffe ?",
        content: "Bonjour à tous ! Je cherche des conseils pour réussir un risotto à la truffe. J'ai déjà essayé plusieurs fois mais le riz reste toujours trop ferme...",
        author: "ChefAmateur",
        authorAvatar: "CA",
        date: "2025-01-15T10:30:00",
        category: "aide",
        replies: 12,
        likes: 25,
        tags: ["risotto", "truffe", "technique"],
        isSticky: true
      },
      {
        id: 2,
        title: "Nouvelle recette : Tarte aux pommes revisitée",
        content: "Voici ma version de la tarte aux pommes avec une touche d'originalité : j'ai ajouté du caramel au beurre salé et des amandes effilées...",
        author: "PâtissierPassion",
        authorAvatar: "PP",
        date: "2025-01-14T15:45:00",
        category: "recettes",
        replies: 8,
        likes: 42,
        tags: ["tarte", "pommes", "dessert"]
      },
      {
        id: 3,
        title: "Soirée dégustation vins et fromages - Paris",
        content: "Organisons une soirée dégustation le samedi 20 janvier à 19h. Apportez votre meilleur fromage !",
        author: "GourmetParis",
        authorAvatar: "GP",
        date: "2025-01-13T09:15:00",
        category: "events",
        replies: 15,
        likes: 38,
        tags: ["vin", "fromage", "dégustation", "paris"]
      }
    ];
    setPosts(mockPosts);
  }, []);

  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesSearch = searchTerm === '' ||
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const stickyPosts = filteredPosts.filter(post => post.isSticky);
  const regularPosts = filteredPosts.filter(post => !post.isSticky);

  return (
    <div className="forum-page">
      <div className="forum-container">
        <header className="forum-header">
          <h1>🍳 Forum Culinaire</h1>
          <p>Échangez, partagez et apprenez avec notre communauté passionnée</p>
        </header>

        <div className="forum-controls">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Rechercher dans le forum..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="search-btn">
              <i className="fas fa-search"></i>
            </button>
          </div>
          <button
            className="btn btn-primary new-post-btn"
            onClick={() => setShowNewPostForm(true)}
          >
            <i className="fas fa-plus"></i>
            Nouveau sujet
          </button>
        </div>

        <div className="forum-categories">
          <button
            className={`category-tab ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            Tous les sujets
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-tab ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <span className="category-icon">{category.icon}</span>
              {category.name}
              <span className="post-count">({category.postCount})</span>
            </button>
          ))}
        </div>

        <div className="forum-content">
          <aside className="forum-sidebar">
            <div className="forum-stats">
              <h3>Statistiques</h3>
              <div className="stat-item">
                <span className="stat-label">Membres actifs</span>
                <span className="stat-value">1,234</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Messages aujourd'hui</span>
                <span className="stat-value">45</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Nouveaux membres</span>
                <span className="stat-value">12</span>
              </div>
            </div>

            <div className="online-users">
              <h3>En ligne maintenant</h3>
              <div className="online-list">
                <div className="online-user">
                  <div className="user-avatar">CA</div>
                  <span>ChefAmateur</span>
                </div>
                <div className="online-user">
                  <div className="user-avatar">PP</div>
                  <span>PâtissierPassion</span>
                </div>
                <div className="online-user">
                  <div className="user-avatar">GP</div>
                  <span>GourmetParis</span>
                </div>
              </div>
            </div>
          </aside>

          <main className="forum-main">
            {stickyPosts.length > 0 && (
              <section className="sticky-posts">
                <h3>📌 Sujets épinglés</h3>
                {stickyPosts.map(post => (
                  <article key={post.id} className="forum-post sticky">
                    <div className="post-header">
                      <div className="post-title">
                        <h3>{post.title}</h3>
                        {post.isSticky && <span className="sticky-badge">Épinglé</span>}
                        {post.isLocked && <span className="locked-badge">Fermé</span>}
                      </div>
                      <div className="post-meta">
                        <div className="author-info">
                          <div className="author-avatar">{post.authorAvatar}</div>
                          <span className="author-name">{post.author}</span>
                        </div>
                        <span className="post-date">
                          {new Date(post.date).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                    <div className="post-content">
                      <p>{post.content}</p>
                    </div>
                    <div className="post-footer">
                      <div className="post-tags">
                        {post.tags.map(tag => (
                          <span key={tag} className="tag">#{tag}</span>
                        ))}
                      </div>
                      <div className="post-stats">
                        <span className="replies">
                          <i className="fas fa-reply"></i> {post.replies} réponses
                        </span>
                        <span className="likes">
                          <i className="fas fa-heart"></i> {post.likes}
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </section>
            )}

            <section className="regular-posts">
              <h3>Derniers sujets</h3>
              {regularPosts.map(post => (
                <article key={post.id} className="forum-post">
                  <div className="post-header">
                    <div className="post-title">
                      <h3>{post.title}</h3>
                      {post.isSticky && <span className="sticky-badge">Épinglé</span>}
                      {post.isLocked && <span className="locked-badge">Fermé</span>}
                    </div>
                    <div className="post-meta">
                      <div className="author-info">
                        <div className="author-avatar">{post.authorAvatar}</div>
                        <span className="author-name">{post.author}</span>
                      </div>
                      <span className="post-date">
                        {new Date(post.date).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                  <div className="post-content">
                    <p>{post.content}</p>
                  </div>
                  <div className="post-footer">
                    <div className="post-tags">
                      {post.tags.map(tag => (
                        <span key={tag} className="tag">#{tag}</span>
                      ))}
                    </div>
                    <div className="post-stats">
                      <span className="replies">
                        <i className="fas fa-reply"></i> {post.replies} réponses
                      </span>
                      <span className="likes">
                        <i className="fas fa-heart"></i> {post.likes}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </section>
          </main>
        </div>
      </div>

      {showNewPostForm && (
        <div className="modal-overlay" onClick={() => setShowNewPostForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowNewPostForm(false)}>
              <i className="fas fa-times"></i>
            </button>
            <div className="new-post-form">
              <h2>Nouveau sujet</h2>
              <form>
                <div className="form-group">
                  <label htmlFor="post-title">Titre</label>
                  <input
                    type="text"
                    id="post-title"
                    placeholder="Entrez le titre de votre sujet"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="post-category">Catégorie</label>
                  <select id="post-category" required>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="post-content">Message</label>
                  <textarea
                    id="post-content"
                    placeholder="Écrivez votre message..."
                    rows={8}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="post-tags">Tags (séparés par des virgules)</label>
                  <input
                    type="text"
                    id="post-tags"
                    placeholder="recette, cuisine, aide..."
                  />
                </div>
                <div className="form-actions">
                  <button type="button" className="btn btn-outline" onClick={() => setShowNewPostForm(false)}>
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Publier le sujet
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Forum;
