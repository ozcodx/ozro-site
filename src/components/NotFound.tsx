import { Link } from 'react-router-dom';
import '../App.css';

const NotFound = () => {
  return (
    <div className="app-container">
      <div className="content">
        <h1 className="title">404</h1>
        <p className="subtitle">Página no encontrada</p>
        <Link to="/" className="primary-button">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
};

export default NotFound;