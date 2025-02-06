import Header from './Header';
import Footer from './Footer';
import { Link } from 'react-router-dom';
import '../styles/Thanks.css';

const Thanks = () => {
  return (
    <div className="thanks">
      <Header />
      <div className="thanks-container">
        <div className="thanks-content">
          <h1>¡Gracias por tu Apoyo!</h1>
          
          <div className="thanks-icon">
            ❤️
          </div>

          <div className="message">
            <p>Tu donación es muy importante para nosotros.</p>
            <p>Gracias a personas como tú podemos seguir mejorando OzRagnarok.</p>
          </div>

          <div className="next-steps">
            <h2>¿Qué sigue?</h2>
            <ul>
              <li>Tu donación será procesada en breve</li>
              <li>Recibirás un correo de confirmación</li>
              <li>¡Sigue disfrutando del juego!</li>
            </ul>
          </div>

          <div className="actions">
            <Link to="/" className="action-button primary">
              Volver al Inicio
            </Link>
            <Link to="/information" className="action-button secondary">
              Ver Información
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Thanks; 