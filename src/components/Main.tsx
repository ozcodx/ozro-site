import { useEffect, useState } from 'react';
import Header from './Header';
import InfoCard from './InfoCard';
import News from './News';
import Footer from './Footer';
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
          <img src="/logotipo.png" alt="Logotipo" className="banner-logo" />
          <h1>¡Bienvenido!</h1>
          <p>Tu aventura comienza aquí</p>
        </div>
      </div>
      <div className="server-info-section">
        <div className="server-info-grid">
          <InfoCard
            iconUrl={`/mobs/${RANDOM_MOBS[0]}.webp`}
            title="Un Servidor para Disfrutar sin Presión"
            description="Aquí no hay carreras ni competencia desmedida. Juega a tu propio ritmo, solo o con amigos, sin preocuparte por perder el progreso. Un lugar ideal para compartir en familia. Además, el servidor lo administramos nosotros, tenemos la garantia de que no se cerrará."
          />
          <InfoCard
            iconUrl={`/mobs/${RANDOM_MOBS[1]}.webp`}
            title="Una Experiencia Balanceada y Renovada"
            description="Disfruta de un servidor Renewal con mecánicas ajustadas y balanceadas. Jugamos en el episodio 14.3 con rates ajustados para un progresión fluida: 5x/5x/10x. Aunque hay bonificaciones y penalizaciones de EXP y el drop varia dependiendo del tipo de item."
          />
          <InfoCard
            iconUrl={`/mobs/${RANDOM_MOBS[2]}.webp`}
            title="Redescubre el Juego con un Nuevo Enfoque."
            description="Aquí el comercio y la economía no son el centro del juego. Con NPCs personalizados y misiones únicas, todo está diseñado para una experiencia autosuficiente, ideal para jugar solo o en pequeños grupos sin depender de un mercado masivo."
          />
          <InfoCard
            iconUrl={`/mobs/${RANDOM_MOBS[3]}.webp`}
            title="Un Mundo en constante Evolución."
            description="Con ajustes y actualizaciones constantes, la experiencia siempre se mantiene fresca y equilibrada. Además, Tu voz es escuchada, este es un servidor en crecimiento donde las ideas y propuestas de los jugadores pueden dar forma al mundo en el que juegas."
          />
        </div>
      </div>
      <div className="server-info-section">
        <News>
          
          <p> <strong>25 Enero de 2025</strong><br />
            Se realizaron múltiples mejoras en la quest de armas Crimson, incluyendo ajustes en los costos, 
            mejoras en los diálogos y correcciones en la ubicación de los NPCs. También se modificó el sistema 
            de intercambio de ítems de la quest. 
            Además, se solucionó un bug en el NPC Trasher que cambiaba los ítems tras cada reconexión.
            También se balancearon las recompensas del Macaco que cambia banana y cacao por objetos de recuperación de SP.
          </p> 
          <p> <strong>22 Enero de 2025</strong><br />
            Se mejoró la funcionalidad del Mystic Channeler, añadiendo el reinicio de mapas y mobs del Star Gladiator.
            También se corrigieron errores en los IDs de los minerales enriquecidos de la Cash Shop. 
          </p> 
          <p> <strong>21 Enero de 2025</strong><br />
            El sistema de recompensas del Gambler fue actualizado con nuevos ítems,
            y se eliminaron los tickets de refinamiento +11 del Refine Master.
            Además, se corrigieron errores en los comandos de los GMs y se modificaron los items de Asistencia y Cash Shop. 
          </p> 
          <p> <strong>19 Enero de 2025</strong><br />
            Se añadió la quest de creación de armas Crimson, se actualizaron varios NPCs y se corrigieron errores en scripts.
            También se mejoró el diálogo del NPC Trasher y se implementó un límite de gasto diario de 1M de Zeny. 
          </p> 
          <p> <strong>18 Enero de 2025</strong><br />
            Se introdujo un nuevo NPC llamado "Trasher", un cazador de tesoros que compra ítems misceláneos hasta diez veces su valor.
            Además, se ajustaron las configuraciones de batalla, modificando las tasas de experiencia y los rates de drop de ítems. 
          </p> 
          <p> <strong>13 Enero de 2025</strong><br />
            Se habilitó el sistema de autoloot para todos los jugadores,
            se realizaron ajustes en NPCs personalizados y se configuró la dirección IP del nuevo servidor. 
          </p> 
          <p> <strong>de 2021 a 2025</strong><br />
            Tras un largo período de inactividad, la construcción del servidor se detuvo por diversas razones.
            Entre ellas, cambios en prioridades personales y falta de tiempo para continuar con el desarrollo.
            Sin embargo, en 2025 el proyecto fue retomado, incorporando nuevas mecánicas y mejoras al balance del juego. 
          </p> 
          <p> <strong>22 Junio de 2021</strong><br />
            Se ajustó el sistema de apuestas y se agregó un nuevo NPC llamado "Monke",
            un segundo apostador con nuevas mecánicas para conseguir consumibles. 
          </p> 
          <p> <strong>19 Junio de 2021</strong><br />
            El sistema de misiones de caza recibió mejoras,
            incluyendo la incorporación de nuevos sombreros y la modificación del tiempo de los buffs de los Soul Linkers.
            También se ajustó el daño recibido por los MVP con aura verde, aumentando en un 10%.
            Ademas, se resolvió un error con los Cash Points en las misiones de caza. 
          </p> 
          <p> <strong>16 Junio de 2021</strong><br />
            Se incorporaron NPCs personalizados y se introdujeron nuevas configuraciones al servidor.
            Además, se añadieron misiones repetibles de experiencia y se ajustaron los comandos de los jugadores. 
          </p> 
          <p> <strong>21 Junio de 2021 - Inicio del servidor</strong><br />
            El servidor fue creado con la intención de ofrecer una experiencia privada y offline,
            diseñada para un grupo reducido de jugadores. La meta era mantener un balance justo y divertido,
            con ajustes que permitieran disfrutar del juego sin la dependencia de una gran comunidad o economía inflada.
            Así nació un mundo personalizado donde cada NPC y mecánica fueron pensados para adaptarse a este estilo de juego.
          </p>
        </News>
      </div>
      <Footer />
    </div>
  );
};

export default Main;
