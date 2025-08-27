import { useState } from 'react';
import '../styles/pages/Contact.scss';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulation d'envoi du formulaire
      await new Promise(resolve => setTimeout(resolve, 2000));

      setSubmitMessage('Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        category: 'general'
      });
    } catch (error) {
      setSubmitMessage('Une erreur s\'est produite. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-container">
        <header className="contact-header">
          <h1>Contactez-nous</h1>
          <p>Nous sommes là pour vous aider ! N'hésitez pas à nous contacter pour toute question.</p>
        </header>

        <div className="contact-content">
          <div className="contact-info-section">
            <div className="contact-info-card">
              <div className="info-icon">
                <i className="fas fa-envelope"></i>
              </div>
              <h3>Email</h3>
              <p>iouahabi1@myges.fr</p>
              <p>Réponse sous 24h</p>
            </div>

            <div className="contact-info-card">
              <div className="info-icon">
                <i className="fas fa-phone"></i>
              </div>
              <h3>Téléphone</h3>
              <p>+33 7 69 87 73 82</p>
              <p>Lundi au vendredi, 9h-18h</p>
            </div>

            <div className="contact-info-card">
              <div className="info-icon">
                <i className="fas fa-map-marker-alt"></i>
              </div>
              <h3>Adresse</h3>
              <p>Paris, France</p>
              <p>Disponible pour événements</p>
            </div>

            <div className="contact-info-card">
              <div className="info-icon">
                <i className="fas fa-clock"></i>
              </div>
              <h3>Horaires</h3>
              <p>Lundi - Vendredi: 9h - 18h</p>
              <p>Samedi: 10h - 16h</p>
            </div>
          </div>

          <div className="contact-form-section">
            <div className="form-header">
              <h2>Envoyez-nous un message</h2>
              <p>Remplissez le formulaire ci-dessous et nous vous répondrons rapidement.</p>
            </div>

            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Nom complet *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Votre nom"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="votre.email@exemple.com"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="category">Catégorie</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  <option value="general">Question générale</option>
                  <option value="support">Support technique</option>
                  <option value="partnership">Partenariat</option>
                  <option value="events">Événements culinaires</option>
                  <option value="feedback">Commentaires</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="subject">Sujet *</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  placeholder="Objet de votre message"
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  placeholder="Votre message..."
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane"></i>
                    Envoyer le message
                  </>
                )}
              </button>
            </form>

            {submitMessage && (
              <div className={`submit-message ${submitMessage.includes('succès') ? 'success' : 'error'}`}>
                <i className={`fas ${submitMessage.includes('succès') ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                {submitMessage}
              </div>
            )}
          </div>
        </div>

        <section className="faq-section">
          <h2>Questions fréquentes</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h4>Comment puis-je partager ma recette ?</h4>
              <p>Créez un compte gratuit et utilisez notre outil de création de recettes. Vous pouvez ajouter des photos, des instructions détaillées et des informations nutritionnelles.</p>
            </div>
            <div className="faq-item">
              <h4>Les recettes sont-elles gratuites ?</h4>
              <p>Oui ! Toutes nos recettes sont gratuites et accessibles à tous. Certaines fonctionnalités premium sont disponibles pour les utilisateurs inscrits.</p>
            </div>
            <div className="faq-item">
              <h4>Comment fonctionne la génération IA ?</h4>
              <p>Notre IA analyse vos préférences culinaires et génère des recettes personnalisées. Il suffit de répondre à quelques questions sur vos goûts et contraintes alimentaires.</p>
            </div>
            <div className="faq-item">
              <h4>Puis-je modifier une recette existante ?</h4>
              <p>Absolument ! Vous pouvez sauvegarder n'importe quelle recette et l'adapter à vos besoins personnels.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Contact;
