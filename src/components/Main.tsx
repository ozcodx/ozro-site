import { useEffect, useState } from 'react';
import Header from './Header';
import '../styles/Main.css';
import Cookies from 'js-cookie';

const TOTAL_CITIES = 8;
const TOTAL_CHARS = 7;

const Main = () => {
  const [randomCity, setRandomCity] = useState(Cookies.get('randomCity') || '1');
  const [randomChar, setRandomChar] = useState(Cookies.get('randomChar') || '1');

  useEffect(() => {
    let newCity;
    do {
      newCity = Math.floor(Math.random() * TOTAL_CITIES) + 1;
    } while (newCity.toString() === randomCity);
    setRandomCity(newCity.toString());
    Cookies.set('randomCity', newCity.toString());
  }, []);

  useEffect(() => {
    let newChar;
    do {
      newChar = Math.floor(Math.random() * TOTAL_CHARS) + 1;
    } while (newChar.toString() === randomChar);
    setRandomChar(newChar.toString());
    Cookies.set('randomChar', newChar.toString());
  }, []);

  return (
    <div className="main">
      <Header />
      <div 
        className="banner"
        style={{
          backgroundImage: `url(/cities/${randomCity}.jpg)`,
        }}
      >
        <div className="banner-char"
        style={{
          backgroundImage: `url(/chars/${randomChar}.webp)`,
        }}
        ></div>
        <div className="banner-content">
          <h1>Bienvenido a OzRagnarok</h1>
          <p>Tu aventura comienza aquí</p>
        </div>
      </div>
      <div className="server-info-section">
        <div className="server-info-grid">
          <div className="server-info-card">
            <div className="card-icon">
              <img src="/icons/exp.png" alt="Experiencia" />
            </div>
            <h3>Experiencia ajustada para un avance dinámico sin perder la esencia clásica.</h3>
            <p>Las tasas de experiencia ofrecen un progreso moderado con una base y job EXP de 5x, mientras que los MVPs dan el doble (10x) y las quests un poco menos (3x). Esto permite un crecimiento fluido sin volverse demasiado fácil ni excesivamente lento.</p>
          </div>
          <div className="server-info-card">
            <div className="card-icon">
              <img src="/icons/level.png" alt="Nivel" />
            </div>
            <h3>Un sistema de drop con tasas mejoradas para recompensar el esfuerzo sin perder el valor de los objetos.</h3>
            <p>Los drops varían según la categoría: consumibles (20x), equipamiento (30x), y cartas con una tasa del 2% (1% si aplica penalización de nivel). Los ítems de MVPs tienen un drop menor (5x a 15x), manteniendo su rareza. Los tesoros WoE también tienen un drop de 5x para incentivar la competencia.</p>
          </div>
          <div className="server-info-card">
            <div className="card-icon">
              <img src="/icons/custom.png" alt="Customización" />
            </div>
            <h3>Cambios que mejoran la jugabilidad sin romper la esencia del juego.</h3>
            <p>Desde eliminar la misión del primer Job hasta permitir multi level-up y bonificaciones de experiencia en parties, las mecánicas están diseñadas para optimizar la experiencia de juego. Los monstruos pueden hacer críticos, otorgan algo de Zeny al morir y tienen el doble de HP, mientras que los Bosses no pueden curarse en combate.</p>
          </div>
          <div className="server-info-card">
            <div className="card-icon">
              <img src="/icons/protection.png" alt="Protección" />
            </div>
            <h3>NPCs y misiones exclusivas para personalizar tu aventura.</h3>
            <p>El servidor cuenta con NPCs útiles (Healer, Endower, Reset, etc.), quests personalizadas para obtener equipo y objetos únicos, y una Cash Shop con Job Card Sets, Endow Scrolls y consumibles especiales. Además, las mascotas pueden subir de nivel y participar en combate, agregando una nueva dimensión estratégica.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;
