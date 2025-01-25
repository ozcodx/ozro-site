import { useEffect, useState } from 'react';
import Header from './Header';
import InfoCard from './InfoCard';
import '../styles/Main.css';
import Cookies from 'js-cookie';

const TOTAL_CITIES = 8;
const TOTAL_CHARS = 7;
const TOTAL_MOBS = 11;

function getRandomNumbers(amount: number) {
  let numbers = Array.from({ length: TOTAL_MOBS }, (_, i) => i + 1);
  let result = [];
  for (let i = 0; i < amount; i++) {
      let randomIndex = Math.floor(Math.random() * numbers.length);
      result.push(numbers[randomIndex]);
      numbers.splice(randomIndex, 1);
  }
  return result;
}

const Main = () => {
  const [randomCity, setRandomCity] = useState(Cookies.get('randomCity') || '1');
  const [randomChar, setRandomChar] = useState(Cookies.get('randomChar') || '1');
  const RANDOM_MOBS = getRandomNumbers(4);

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
          <InfoCard
            iconUrl={`/mobs/${RANDOM_MOBS[0]}.webp`}
            title="Experiencia ajustada para un avance dinámico sin perder la esencia clásica."
            description="Las tasas de experiencia ofrecen un progreso moderado con una base y job EXP de 5x, mientras que los MVPs dan el doble (10x) y las quests un poco menos (3x). Esto permite un crecimiento fluido sin volverse demasiado fácil ni excesivamente lento."
          />
          <InfoCard
            iconUrl={`/mobs/${RANDOM_MOBS[1]}.webp`}
            title="Un sistema de drop con tasas mejoradas para recompensar el esfuerzo sin perder el valor de los objetos."
            description="Los drops varían según la categoría: consumibles (20x), equipamiento (30x), y cartas con una tasa del 2% (1% si aplica penalización de nivel). Los ítems de MVPs tienen un drop menor (5x a 15x), manteniendo su rareza. Los tesoros WoE también tienen un drop de 5x para incentivar la competencia."
          />
          <InfoCard
            iconUrl={`/mobs/${RANDOM_MOBS[2]}.webp`}
            title="Cambios que mejoran la jugabilidad sin romper la esencia del juego."
            description="Desde eliminar la misión del primer Job hasta permitir multi level-up y bonificaciones de experiencia en parties, las mecánicas están diseñadas para optimizar la experiencia de juego. Los monstruos pueden hacer críticos, otorgan algo de Zeny al morir y tienen el doble de HP, mientras que los Bosses no pueden curarse en combate."
          />
          <InfoCard
            iconUrl={`/mobs/${RANDOM_MOBS[3]}.webp`}
            title="NPCs y misiones exclusivas para personalizar tu aventura."
            description="El servidor cuenta con NPCs útiles (Healer, Endower, Reset, etc.), quests personalizadas para obtener equipo y objetos únicos, y una Cash Shop con Job Card Sets, Endow Scrolls y consumibles especiales. Además, las mascotas pueden subir de nivel y participar en combate, agregando una nueva dimensión estratégica."
          />
        </div>
      </div>
    </div>
  );
};

export default Main;
