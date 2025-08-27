import '../styles/components/Footer.scss';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3 className="footer-logo">🍳 Cooking Recipes</h3>
          <p className="footer-description">
            Découvrez et partagez les meilleures recettes culinaires.
            Une communauté passionnée de cuisine pour tous les niveaux.
          </p>
          <div className="social-links">
            <a href="#" className="social-link" aria-label="Facebook">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="#" className="social-link" aria-label="Instagram">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="#" className="social-link" aria-label="Twitter">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#" className="social-link" aria-label="YouTube">
              <i className="fab fa-youtube"></i>
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h4>Recettes</h4>
          <ul>
            <li><a href="/#">Toutes les recettes</a></li>
            <li><a href="/#">Recettes populaires</a></li>
            <li><a href="/create">Nouvelles recettes</a></li>
            <li><a href="/#">Par catégorie</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Communauté</h4>
          <ul>
            <li><a href="/forum">Forum</a></li>
            <li><a href="/#">Partagez vos recettes</a></li>
            <li><a href="/events">Événements culinaires</a></li>
            <li><a href="/blog">Blog</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Contact</h4>
          <div className="contact-info">
            <div className="contact-item">
              <i className="fas fa-envelope"></i>
              <span>iouahabi1@myges.fr</span>
            </div>
            <div className="contact-item">
              <i className="fas fa-phone"></i>
              <span>+33 7 69 87 73 82</span>
            </div>
            <div className="contact-item">
              <i className="fas fa-map-marker-alt"></i>
              <span>Paris, France</span>
            </div>
          </div>
          <div className="newsletter">
            <h5>Newsletter</h5>
            <p>Recevez nos meilleures recettes chaque semaine</p>
            <div className="newsletter-input">
              <input type="email" placeholder="Votre email" />
              <button type="submit">S'abonner</button>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p>&copy; {new Date().getFullYear()} Cooking Recipes. Tous droits réservés.</p>
          <div className="footer-links">
            <a href="/privacy-policy">Politique de confidentialité</a>
            <a href="/terms-of-service">Conditions d'utilisation</a>
            <a href="/legal-mentions">Mentions légales</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
