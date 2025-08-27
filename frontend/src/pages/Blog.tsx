import { useState, useEffect } from 'react';
import '../styles/pages/Blog.scss';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  image: string;
  category: string;
  tags: string[];
  featured: boolean;
}

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    // Simulation de données de blog
    const mockPosts: BlogPost[] = [
      {
        id: 1,
        title: "Les secrets des chefs pour réussir vos sauces",
        excerpt: "Découvrez les techniques professionnelles pour créer des sauces exceptionnelles qui feront la différence dans vos plats.",
        content: "Les sauces sont l'âme de la cuisine. Elles peuvent transformer un plat ordinaire en une expérience gustative extraordinaire...",
        author: "Chef Marie Dubois",
        date: "2025-01-15",
        image: "/images/blog/sauces.jpg",
        category: "techniques",
        tags: ["sauces", "techniques", "chef"],
        featured: true
      },
      {
        id: 2,
        title: "Cuisine végétarienne : Tendances 2025",
        excerpt: "Explorez les dernières tendances en cuisine végétarienne et comment les intégrer dans votre quotidien.",
        content: "La cuisine végétarienne évolue constamment. Cette année, nous assistons à une révolution des saveurs...",
        author: "Sophie Martin",
        date: "2025-01-10",
        image: "/images/blog/vegetarien.jpg",
        category: "tendances",
        tags: ["végétarien", "tendances", "santé"],
        featured: false
      },
      {
        id: 3,
        title: "Les épices du monde : Un tour gastronomique",
        excerpt: "Partez à la découverte des épices les plus exotiques et apprenez à les utiliser dans vos recettes.",
        content: "Les épices sont les trésors cachés de la cuisine mondiale. Chaque région du globe offre ses propres merveilles...",
        author: "Ahmed Benali",
        date: "2025-01-05",
        image: "/images/blog/epices.jpg",
        category: "culture",
        tags: ["épices", "monde", "culture"],
        featured: false
      }
    ];
    setPosts(mockPosts);
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

  const featuredPost = posts.find(post => post.featured);

  return (
    <div className="blog-page">
      <div className="blog-container">
        <header className="blog-header">
          <h1>🍳 Blog Culinaire</h1>
          <p>Découvrez nos articles, conseils et inspirations culinaires</p>
        </header>

        {featuredPost && (
          <section className="featured-post">
            <div className="featured-content">
              <div className="featured-image">
                <img src={featuredPost.image} alt={featuredPost.title} />
                <div className="featured-badge">À la une</div>
              </div>
              <div className="featured-text">
                <h2>{featuredPost.title}</h2>
                <p className="featured-excerpt">{featuredPost.excerpt}</p>
                <div className="featured-meta">
                  <span className="author">Par {featuredPost.author}</span>
                  <span className="date">{new Date(featuredPost.date).toLocaleDateString('fr-FR')}</span>
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
                    <img src={post.image} alt={post.title} />
                    <div className="post-category">{categories.find(c => c.value === post.category)?.label}</div>
                  </div>
                  <div className="post-content">
                    <h3>{post.title}</h3>
                    <p className="post-excerpt">{post.excerpt}</p>
                    <div className="post-meta">
                      <span className="author">Par {post.author}</span>
                      <span className="date">{new Date(post.date).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="post-tags">
                      {post.tags.map(tag => (
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
                  <span className="author">Par {selectedPost.author}</span>
                  <span className="date">{new Date(selectedPost.date).toLocaleDateString('fr-FR')}</span>
                  <span className="category">{categories.find(c => c.value === selectedPost.category)?.label}</span>
                </div>
              </header>
              <div className="post-image-large">
                <img src={selectedPost.image} alt={selectedPost.title} />
              </div>
              <div className="post-body">
                <div className="post-content-full" dangerouslySetInnerHTML={{ __html: selectedPost.content }} />
                <div className="post-tags">
                  {selectedPost.tags.map(tag => (
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
