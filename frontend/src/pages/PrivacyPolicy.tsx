import '../styles/pages/Legal.scss';

const PrivacyPolicy = () => {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <header className="legal-header">
          <h1>Politique de Confidentialité</h1>
          <p className="last-updated">Dernière mise à jour : 15 janvier 2025</p>
        </header>

        <div className="legal-content">
          <section>
            <h2>1. Introduction</h2>
            <p>
              Chez Cooking Recipes, nous nous engageons à protéger votre vie privée et vos données personnelles.
              Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos informations.
            </p>
          </section>

          <section>
            <h2>2. Informations que nous collectons</h2>
            <h3>2.1 Informations que vous nous fournissez</h3>
            <ul>
              <li>Nom et prénom</li>
              <li>Adresse email</li>
              <li>Informations de profil (photo, biographie)</li>
              <li>Recettes que vous créez et partagez</li>
              <li>Commentaires et messages sur le forum</li>
            </ul>

            <h3>2.2 Informations collectées automatiquement</h3>
            <ul>
              <li>Adresse IP</li>
              <li>Type de navigateur et version</li>
              <li>Pages visitées et temps passé</li>
              <li>Données de géolocalisation (si activé)</li>
            </ul>
          </section>

          <section>
            <h2>3. Utilisation de vos données</h2>
            <p>Nous utilisons vos données pour :</p>
            <ul>
              <li>Fournir et améliorer nos services</li>
              <li>Personnaliser votre expérience</li>
              <li>Communiquer avec vous</li>
              <li>Modérer la communauté</li>
              <li>Analyser l'utilisation du site</li>
            </ul>
          </section>

          <section>
            <h2>4. Partage de vos données</h2>
            <p>Nous ne vendons pas vos données personnelles. Nous pouvons partager vos informations :</p>
            <ul>
              <li>Avec votre consentement explicite</li>
              <li>Pour respecter nos obligations légales</li>
              <li>Avec nos prestataires de services (hébergement, analyse)</li>
              <li>En cas de fusion ou acquisition</li>
            </ul>
          </section>

          <section>
            <h2>5. Sécurité des données</h2>
            <p>
              Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données contre
              l'accès non autorisé, la modification, la divulgation ou la destruction.
            </p>
          </section>

          <section>
            <h2>6. Vos droits</h2>
            <p>Conformément au RGPD, vous avez le droit de :</p>
            <ul>
              <li>Accéder à vos données personnelles</li>
              <li>Rectifier vos données</li>
              <li>Effacer vos données</li>
              <li>Limiter le traitement</li>
              <li>Vous opposer au traitement</li>
              <li>À la portabilité des données</li>
            </ul>
          </section>

          <section>
            <h2>7. Cookies</h2>
            <p>
              Nous utilisons des cookies pour améliorer votre expérience. Vous pouvez contrôler
              l'utilisation des cookies via les paramètres de votre navigateur.
            </p>
          </section>

          <section>
            <h2>8. Modifications</h2>
            <p>
              Cette politique peut être modifiée à tout moment. Nous vous informerons des changements
              importants par email ou via une notification sur le site.
            </p>
          </section>

          <section>
            <h2>9. Contact</h2>
            <p>
              Pour toute question concernant cette politique, contactez-nous à :
              <br />
              Email : iouahabi1@myges.fr
              <br />
              Adresse : Paris, France
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
