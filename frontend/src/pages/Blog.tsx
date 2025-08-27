import { useState, useEffect } from 'react';
import '../styles/pages/Blog.scss';
import { getArticles, getFeaturedArticles, searchArticles, Article } from '../services/articleService';

const Blog = () => {
  const [posts, setPosts] = useState<Article[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPost, setSelectedPost] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const response = await getArticles(1, 20); // Récupère les 20 premiers articles
        setPosts(response.articles);
      } catch (err) {
        console.error('Erreur lors du chargement des articles:', err);
        setError('Erreur lors du chargement des articles');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const categories = [
    { value: 'all', label: 'Toutes les catégories' },
    { value: 'techniques', label: 'Techniques culinaires' },
    { value: 'tendances', label: 'Tendances' },
    { value: 'culture', label: 'Culture gastronomique' },
    { value: 'sante', label: 'Santé & Nutrition' }
  ];

  const filteredPosts = selectedCategory === 'all'
    ? posts
    : posts.filter(post => post.category === selectedCategory);

  const featuredPost = posts.find(post => post.isFeatured);

  return (
    <div className="blog-page">
      <div className="blog-container">
        <header className="blog-header">
          <h1>🍳 Blog Culinaire</h1>
          <p>Découvrez nos articles, conseils et inspirations culinaires</p>
        </header>

        {loading && (
          <div className="loading">
            <p>Chargement des articles...</p>
          </div>
        )}

        {error && (
          <div className="error">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {featuredPost && (
              <section className="featured-post">
                <div className="featured-content">
                  <div className="featured-image">
                    <img src={featuredPost.imageUrl || '/images/blog/default.jpg'} alt={featuredPost.title} />
                    <div className="featured-badge">À la une</div>
                  </div>
                  <div className="featured-text">
                    <h2>{featuredPost.title}</h2>
                    <p className="featured-excerpt">{featuredPost.excerpt || featuredPost.content.substring(0, 200) + '...'}</p>
                    <div className="featured-meta">
                      <span className="author">Par {featuredPost.author.firstName} {featuredPost.author.lastName}</span>
                      <span className="date">{new Date(featuredPost.createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <button
                      className="btn btn-primary"
                      onClick={() => setSelectedPost(featuredPost)}
                    >
                      Lire l'article complet
                    </button>
                  </div>
                </div>
              </section>
            )}

            <div className="blog-content">
              <aside className="blog-sidebar">
                <div className="category-filter">
                  <h3>Catégories</h3>
                  <div className="category-list">
                    {categories.map(category => (
                      <button
                        key={category.value}
                        className={`category-btn ${selectedCategory === category.value ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(category.value)}
                      >
                        {category.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="newsletter-sidebar">
                  <h3>Newsletter</h3>
                  <p>Recevez nos meilleurs articles directement dans votre boîte mail</p>
                  <div className="newsletter-form">
                    <input type="email" placeholder="Votre email" />
                    <button type="submit" className="btn btn-primary">S'abonner</button>
                  </div>
                </div>
              </aside>

              <main className="blog-main">
                <div className="posts-grid">
                  {filteredPosts.map(post => (
                    <article key={post.id} className="blog-post-card">
                      <div className="post-image">
                        <img src={post.imageUrl || '/images/blog/default.jpg'} alt={post.title} />
                        <div className="post-category">{categories.find(c => c.value === post.category)?.label}</div>
                      </div>
                      <div className="post-content">
                        <h3>{post.title}</h3>
                        <p className="post-excerpt">{post.excerpt || post.content.substring(0, 150) + '...'}</p>
                        <div className="post-meta">
                          <span className="author">Par {post.author.firstName} {post.author.lastName}</span>
                          <span className="date">{new Date(post.createdAt).toLocaleDateString('fr-FR')}</span>
                        </div>
                        <div className="post-tags">
                          {post.tags.map((tag: string) => (
                            <span key={tag} className="tag">#{tag}</span>
                          ))}
                        </div>
                        <button
                          className="btn btn-outline"
                          onClick={() => setSelectedPost(post)}
                        >
                          Lire la suite
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </main>
            </div>
          </>
        )}
      </div>

      {selectedPost && (
        <div className="modal-overlay" onClick={() => setSelectedPost(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedPost(null)}>
              <i className="fas fa-times"></i>
            </button>
            <article className="full-post">
              <header className="post-header">
                <h2>{selectedPost.title}</h2>
                <div className="post-meta">
                  <span className="author">Par {selectedPost.author.firstName} {selectedPost.author.lastName}</span>
                  <span className="date">{new Date(selectedPost.createdAt).toLocaleDateString('fr-FR')}</span>
                  <span className="category">{categories.find(c => c.value === selectedPost.category)?.label}</span>
                </div>
              </header>
              <div className="post-image-large">
                <img src={selectedPost.imageUrl || '/images/blog/default.jpg'} alt={selectedPost.title} />
              </div>
              <div className="post-body">
                <div className="post-content-full" dangerouslySetInnerHTML={{ __html: selectedPost.content }} />
                <div className="post-tags">
                  {selectedPost.tags.map((tag: string) => (
                    <span key={tag} className="tag">#{tag}</span>
                  ))}
                </div>
              </div>
            </article>
          </div>
        </div>
      )}
    </div>
  );
};

export default Blog;
