import { Link } from 'react-router-dom';
import { useState } from 'react';
import '../styles/Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/">
            <img src="/logo.png" alt="OzRagnarok Logo" className="logo-icon" />
            <span>OzRagnarok</span>
          </Link>
        </div>
        <button className={`menu-toggle ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}>
          <span className="hamburger"></span>
        </button>
        <nav className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <ul>
            <li><Link to="/information" onClick={toggleMenu}>Información</Link></li>
            <li><Link to="/database" onClick={toggleMenu}>Base de Datos</Link></li>
            <li><Link to="/ranking" onClick={toggleMenu}>Rankings</Link></li>
            <li><Link to="/encyclopedia" onClick={toggleMenu}>Enciclopedia</Link></li>
            <li><Link to="/donate" onClick={toggleMenu}>Donar</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header; 