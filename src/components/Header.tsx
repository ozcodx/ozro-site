import { Link } from 'react-router-dom';
import '../styles/Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/">OzRagnarok</Link>
        </div>
        <nav className="nav-menu">
          <ul>
            <li><Link to="/information">Information</Link></li>
            <li><Link to="/database">Database</Link></li>
            <li><Link to="/ranking">Ranking</Link></li>
            <li><Link to="/download">Download</Link></li>
            <li><Link to="/donate">Donate</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header; 