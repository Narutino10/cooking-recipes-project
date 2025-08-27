import '../styles/pages/Legal.scss';

const LegalMentions = () => {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <header className="legal-header">
          <h1>Mentions Légales</h1>
          <p className="last-updated">Dernière mise à jour : 15 janvier 2025</p>
        </header>

        <div className="legal-content">
          <section>
            <h2>1. Informations légales</h2>
            <div className="legal-info-grid">
              <div className="info-item">
                <strong>Nom de l'entreprise :</strong>
                <p>Cooking Recipes</p>
              </div>
              <div className="info-item">
                <strong>Statut :</strong>
                <p>Entreprise individuelle</p>
              </div>
              <div className="info-item">
                <strong>Adresse :</strong>
                <p>Paris, France</p>
              </div>
              <div className="info-item">
                <strong>Email :</strong>
                <p>iouahabi1@myges.fr</p>
              </div>
              <div className="info-item">
                <strong>Téléphone :</strong>
                <p>+33 7 69 87 73 82</p>
              </div>
              <div className="info-item">
                <strong>Numéro SIRET :</strong>
                <p>En cours d'immatriculation</p>
              </div>
            </div>
          </section>

          <section>
            <h2>2. Directeur de la publication</h2>
            <p>
              Le directeur de la publication du site Cooking Recipes est [Votre nom].
            </p>
          </section>

          <section>
            <h2>3. Hébergement</h2>
            <div className="hosting-info">
              <p><strong>Hébergeur :</strong> [Nom de l'hébergeur]</p>
              <p><strong>Adresse :</strong> [Adresse de l'hébergeur]</p>
              <p><strong>Téléphone :</strong> [Téléphone de l'hébergeur]</p>
            </div>
          </section>

          <section>
            <h2>4. Propriété intellectuelle</h2>
            <p>
              L'ensemble du contenu de ce site (textes, images, vidéos, logos, icônes, etc.) est protégé
              par le droit d'auteur. Toute reproduction, distribution, modification ou exploitation
              commerciale est interdite sans autorisation préalable.
            </p>
          </section>

          <section>
            <h2>5. Données personnelles</h2>
            <p>
              Les données personnelles collectées sur ce site sont traitées conformément à notre
              politique de confidentialité et au RGPD. Pour plus d'informations, consultez notre
              <a href="/privacy-policy"> politique de confidentialité</a>.
            </p>
          </section>

          <section>
            <h2>6. Cookies</h2>
            <p>
              Ce site utilise des cookies pour améliorer votre expérience utilisateur.
              Vous pouvez gérer vos préférences de cookies via les paramètres de votre navigateur.
            </p>
          </section>

          <section>
            <h2>7. Responsabilité</h2>
            <p>
              Cooking Recipes s'efforce d'assurer l'exactitude des informations publiées sur ce site,
              mais ne peut garantir l'absence d'erreurs. L'utilisation des informations et recettes
              présentes sur ce site se fait sous votre propre responsabilité.
            </p>
            <p>
              Nous déclinons toute responsabilité quant aux dommages directs ou indirects pouvant
              résulter de l'utilisation de ce site.
            </p>
          </section>

          <section>
            <h2>8. Liens externes</h2>
            <p>
              Ce site peut contenir des liens vers des sites externes. Cooking Recipes n'est pas
              responsable du contenu de ces sites externes ni des dommages pouvant résulter de leur utilisation.
            </p>
          </section>

          <section>
            <h2>9. Droit applicable et juridiction</h2>
            <p>
              Ces mentions légales sont régies par le droit français. En cas de litige,
              les tribunaux français seront seuls compétents.
            </p>
          </section>

          <section>
            <h2>10. Contact</h2>
            <p>
              Pour toute question concernant ces mentions légales, vous pouvez nous contacter :
            </p>
            <div className="contact-details">
              <p><strong>Email :</strong> iouahabi1@myges.fr</p>
              <p><strong>Téléphone :</strong> +33 7 69 87 73 82</p>
              <p><strong>Adresse :</strong> Paris, France</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default LegalMentions;
