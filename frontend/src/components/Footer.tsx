import '../styles/components/Footer.scss';

const Footer = () => {
  return (
    <footer className="footer">
      <p>© {new Date().getFullYear()} Cooking Recipes. Tous droits réservés.</p>
    </footer>
  );
};

export default Footer;
