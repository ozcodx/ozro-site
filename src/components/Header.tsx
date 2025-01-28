import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import '../styles/Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavClick = (path: string) => {
    if (location.pathname === path) {
      window.scrollTo(0, 0);
    }
    toggleMenu();
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/" onClick={() => handleNavClick('/')}>
            <img src="/logo.png" alt="OzRagnarok Logo" className="logo-icon" />
            <span>OzRagnarok</span>
          </Link>
        </div>
        <button className={`menu-toggle ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}>
          <span className="hamburger"></span>
        </button>
        <nav className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <ul>
            <li><Link to="/information" onClick={() => handleNavClick('/information')}>Información</Link></li>
            <li><Link to="/database" onClick={() => handleNavClick('/database')}>Base de Datos</Link></li>
            <li><Link to="/ranking" onClick={() => handleNavClick('/ranking')}>Rankings</Link></li>
            <li><Link to="/encyclopedia" onClick={() => handleNavClick('/encyclopedia')}>Enciclopedia</Link></li>
            <li><Link to="/donate" onClick={() => handleNavClick('/donate')}>Donar</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header; 