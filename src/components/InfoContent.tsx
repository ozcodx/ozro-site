import { ReactNode } from 'react';
import '../styles/Information.css';

interface InfoContentProps {
  selectedSection: string;
}

const contentMap: Record<string, ReactNode> = {
  'features': (
    <div className="info-content">
      <h2>Especificaciones</h2>
      <div className="content-section">
        <p>
          Nuestro servidor ofrece una experiencia renovada y equilibrada,
          diseñada para aquellos que buscan un desafío sin perder la esencia clásica del juego.
          <br />
          Este servidor ha sido balanceado y optimizado para poder jugar con un grupo reducido de jugadores.
          Sin depender de un gran mercado o mecanicas propias de un juego masivo.
        </p>
        <p>
          Algunas de las características mas destacadas de este servidor son:
        </p>
        <ul>
          <li>Servidor Renewal basado en el episodio 14.3 con ajustes personalizados.</li>
          <li>Acceso exclusivo mediante VPN privada, garantizando un entorno seguro y controlado.</li>
          <li>Enfoque familiar y comunidad reducida, optimizado para pocos jugadores.</li>
          <li>Balance y jugabilidad mejorada, con ajustes en la experiencia, el combate y la progresión.</li>
          <li>Personalización y optimización, con un sistema de penalizaciones y recompensas.</li>
          <li>Mecanicas de comercio orientadas la independencia de los jugadores.</li>
          <li>Narrativa inmersiva con un lore progresivo y quests únicas que expanden el mundo del juego.</li>
        </ul>

      </div>
    </div>
  ),
  'exp-rates': (
    <div className="info-content">
      <h2>Tasas de Experiencia</h2>
      <div className="content-section">
        <p>
          Contamos con un sistema de experiencia balanceado,
          pensado para mantener el progreso dinámico sin perder el desafío:
        </p>
        <ul>
          <li>Experiencia Base y Job normal: 5x</li>
          <li>Experiencia de MVPs: 10x</li>
          <li>Experiencia de Quests: 3x</li>
        </ul>
        <p>
          Las tasas están ajustadas para ofrecer una progresión satisfactoria sin hacer el juego demasiado fácil.
          Los MVPs dan el doble de experiencia para incentivar la caza de Boss, mientras que las quests dan menos
          para mantener el balance.
        </p>
        <p>
          Además, se aplican bonificaciones especiales:
        </p>
        <ul>
          <li>Experiencia de party: +80% por cada miembro adicional.</li>
          <li>Bonificación por ataque en party: +25% de EXP por cada atacante.</li>
          <li>Multi Level-Up habilitado, permitiendo subir varios niveles de una sola vez.</li>
        </ul>
      </div>
    </div>
  ),
  'drop-rates': (
    <div className="info-content">
      <h2>Tasas de Drop</h2>
      <div className="content-section">
        <p>
          Contamos con un sistema de drop balanceado,
          pensado para mantener el progreso dinámico sin perder el desafío:
        </p>
        <ul>
          <li>Ítems comunes: ×10</li>
          <li>Consumibles: ×20</li>
          <li>Equipamiento: ×30</li>
          <li>Cartas: ×200</li>
        </ul>
        <p>
          Además, se aplican tasas especiales:
        </p>
        <ul>
          <li>Tesoros de WoE: ×5</li>
          <li>Ítems comunes de Boss: ×5</li>
          <li>Consumibles de Boss: ×10</li>
          <li>Equipamiento de Boss: ×15</li>
          <li>Cartas de MVPs: ×100</li>
        </ul>
        <p>
          El sistema de drop está diseñado para que los items mantengan su valor mientras se hace más accesible
          conseguir el equipo necesario para progresar.
        </p>
      </div>
    </div>
  ),
  'unique-features': (
    <div className="info-content">  
      <h2>Características Únicas</h2>
      <div className="content-section">
        <p>
          Nuestro servidor busca ofrecer una experiencia ajustada para quienes buscan algo diferente.
          Con mecánicas únicas, mejoras en la jugabilidad y un entorno optimizado,
          te ofrecemos una aventura renovada sin perder la esencia clásica.
        </p>
        <p>
          Algunas de las características que mejoran la Jugabilidad:
        </p>
        <ul>
          <li>Progresión más ágil: No necesitas completar misiones para cambiar al primer Job.</li>
          <li>Desafíos estratégicos: Los monstruos tienen el doble de HP y pueden realizar golpes críticos.</li>
          <li>Sistema de party optimizado: Bonificaciones adicionales de experiencia para incentivar el juego en equipo.</li>
          <li>Los Boss tiene Heal reducido: Ya no necesitas una gran party para derrotarlos.</li>
          <li>La barra de vida de los enemigos está oculta, excepto en los Boss, aumentando la inmersión.</li>
        </ul>
        <p>
          Algunos cambios para balancear la Economía:
        </p>
        <ul>
          <li>Cada monstruo derrotado otorga una pequeña cantidad de Zeny.</li>
          <li>Al morir, pierdes el 10% del Zeny en posesión, fomentando un manejo estratégico del dinero.</li>
          <li>Las Bounty Missions otorgan Cash Points y Special Gold, dando más opciones para progresar.</li>
          <li>Los Merchant pueden ganar Job EXP al comerciar, reforzando su rol dentro del mundo del juego.</li>
        </ul>
        <p>
          Cambios en el sistema de Mascotas:
        </p>
        <ul>
          <li>Ademas de los bonos habituales, las mascotas pueden atacar.</li>
          <li>Las mascotas deben ser leales para que puedan defender a sus dueños.</li>
          <li>Las mascotas pueden subir de nivel, aumentando su utilidad.</li>
          <li>Las mascotas pueden infligir golpes críticos.</li>
        </ul>
        <p>
          Consideraciones sobre la Cash Shop:
        </p>
        <ul>
          <li>Los Cash Points pueden comprarse y venderse por Zeny directamente mediante un NPC.</li>
          <li>Se Pueden comprar Card Sets, Endow Scrolls y High Priest Scrolls directamente en la Cash Shop.</li>
          <li>Algunos consumibles también están disponibles, facilitando la preparación para el combate.</li>
          <li>Equipo Rental que permite ganar mas experiencia.</li>
          <li>El Equipamento que antes era de Cash Shop ahora se consigue mediante Quests.</li>
        </ul>
      </div>
    </div>
  ),

};

const InfoContent = ({ selectedSection }: InfoContentProps) => {
  return (
    <div className="info-content-container">
      <div className="scrollable-content">
        {contentMap[selectedSection] || (
          <div className="info-content">
            <h2>Sección en Construcción</h2>
            <div className="content-section"> 
              <p>Esta sección está siendo actualizada...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InfoContent; 