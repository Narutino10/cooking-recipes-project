import '../styles/pages/Legal.scss';

const TermsOfService = () => {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <header className="legal-header">
          <h1>Conditions d'Utilisation</h1>
          <p className="last-updated">Dernière mise à jour : 15 janvier 2025</p>
        </header>

        <div className="legal-content">
          <section>
            <h2>1. Acceptation des conditions</h2>
            <p>
              En accédant et en utilisant Cooking Recipes, vous acceptez d'être lié par ces conditions d'utilisation.
              Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.
            </p>
          </section>

          <section>
            <h2>2. Description du service</h2>
            <p>
              Cooking Recipes est une plateforme permettant de :
            </p>
            <ul>
              <li>Créer et partager des recettes culinaires</li>
              <li>Générer des recettes personnalisées avec l'IA</li>
              <li>Participer à une communauté culinaire</li>
              <li>Accéder à des événements culinaires</li>
            </ul>
          </section>

          <section>
            <h2>3. Comptes utilisateurs</h2>
            <h3>3.1 Création de compte</h3>
            <p>
              Pour accéder à certaines fonctionnalités, vous devez créer un compte.
              Vous êtes responsable de la confidentialité de votre mot de passe.
            </p>

            <h3>3.2 Informations fournies</h3>
            <p>
              Vous vous engagez à fournir des informations exactes et à jour lors de l'inscription.
            </p>
          </section>

          <section>
            <h2>4. Utilisation du service</h2>
            <h3>4.1 Règles de conduite</h3>
            <p>Vous vous engagez à :</p>
            <ul>
              <li>Ne pas publier de contenu offensant ou inapproprié</li>
              <li>Respecter les droits de propriété intellectuelle</li>
              <li>Ne pas spammer ou harceler les autres utilisateurs</li>
              <li>Ne pas utiliser le service à des fins illégales</li>
            </ul>

            <h3>4.2 Contenu utilisateur</h3>
            <p>
              Vous conservez les droits sur le contenu que vous publiez, mais vous accordez à Cooking Recipes
              une licence pour utiliser, modifier et afficher ce contenu sur la plateforme.
            </p>
          </section>

          <section>
            <h2>5. Propriété intellectuelle</h2>
            <p>
              Le contenu de Cooking Recipes (textes, images, logos, etc.) est protégé par le droit d'auteur.
              Vous ne pouvez pas reproduire ce contenu sans autorisation préalable.
            </p>
          </section>

          <section>
            <h2>6. Limitation de responsabilité</h2>
            <p>
              Cooking Recipes ne peut être tenu responsable des dommages directs ou indirects
              résultant de l'utilisation du service.
            </p>
          </section>

          <section>
            <h2>7. Résiliation</h2>
            <p>
              Nous nous réservons le droit de suspendre ou supprimer votre compte en cas de violation
              de ces conditions d'utilisation.
            </p>
          </section>

          <section>
            <h2>8. Modifications</h2>
            <p>
              Ces conditions peuvent être modifiées à tout moment. Les modifications entrent en vigueur
              dès leur publication sur le site.
            </p>
          </section>

          <section>
            <h2>9. Droit applicable</h2>
            <p>
              Ces conditions sont régies par le droit français. Tout litige sera soumis aux tribunaux français.
            </p>
          </section>

          <section>
            <h2>10. Contact</h2>
            <p>
              Pour toute question concernant ces conditions :
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

export default TermsOfService;
