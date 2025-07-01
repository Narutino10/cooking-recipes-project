import { Link } from 'react-router-dom';
import '../styles/components/Header.scss';

const Header = () => {
  return (
    <header className="header">
      <div className="logo">
        <Link to="/">🍽 Cooking Recipes</Link>
      </div>
      <nav className="nav-links">
        <Link to="/">Accueil</Link>
        <Link to="/create">Ajouter une recette</Link>
        <Link to="/generate">Générer avec IA</Link>
      </nav>
    </header>
  );
};

export default Header;
