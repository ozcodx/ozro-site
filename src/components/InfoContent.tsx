import { ReactNode } from 'react';
import '../styles/Information.css';
import Stats from './Stats';

interface InfoContentProps {
  selectedSection: string;
}

const contentMap: Record<string, ReactNode> = {
  'stats': <Stats />,
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
  'download': (
    <div className="info-content">
      <h2>Descargas</h2>
      <div className="content-section">
        <p>
          Descarga el cliente para disfrutar de la experiencia en nuestro servidor.
          <br />
          Recuerda que las cuentas nuevas debes solicitarlas a los administradores.
        </p>
        <ul>
          <li><a href="https://drive.usercontent.google.com/download?id=1VTzGUOz4OpP__ZTZ4UkKQndinIJNkcHS&export=download" target="_blank" rel="noopener noreferrer">Descargar desde Google Drive</a></li>
        </ul>
        <p>
          Para poderte conectar al servidor necesitas tener instalada la VPN de ZeroTier.
          <br />
          La informacion de identificador de red puedes solicitarla a los administradores.
        </p>
        <ul>
          <li><a href="https://download.zerotier.com/dist/ZeroTier%20One.msi" target="_blank" rel="noopener noreferrer">Descargar ZeroTier</a></li>
        </ul>
        <p>
          Si tienes alguna duda, no dudes en contactar con los administradores.
        </p>
      </div>
    </div>
  ),
  'unique-features': (
    <div className="info-content">  
      <h2>Mecanicas Únicas</h2>
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
          <li>No necesitas completar misiones para cambiar al primer Job.</li>
          <li>Los monstruos tienen el doble de HP y pueden realizar golpes críticos.</li>
          <li>Bonificaciones adicionales de experiencia en party para incentivar el juego en equipo.</li>
          <li>Los Boss tienen Heal reducido, ya no se necesita una gran party para derrotarlos.</li>
          <li>La barra de vida de los enemigos está oculta, excepto en los Boss.</li>
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
  'cash-shop': (
    <div className="info-content">
      <h2>Cash Shop</h2>
      <div className="content-section">
        <p>
          La Cash Shop ofrece una variedad de productos para mejorar la experiencia de juego sin desequilibarlo.
          Aquí encontrarás mejoras de conveniencia, potenciadores temporales y objetos difíciles de obtener.
        </p>
        <h3>Materiales de Mejora</h3>
        <p>
          Para Refinamiento Avanzados y mejores probabilidades:
        </p>
        <ul>
            <li><strong>Metales de Forja:</strong> HD Elunium, Enriched Elunium, HD Oridecon, Enriched Oridecon.</li>
            <li><strong>Metales Avanzados:</strong> Bradium, HD Bradium, Cardium, HD Cardium.</li>
        </ul>
        <h3>Mejoras de Conveniencia</h3>
        <p>
          Acceso unico a mejoras o facilidades exclusivas en el juego:
        </p>
        <ul>
            <li><strong>Gym Pass:</strong> Aumenta la capacidad de carga de peso</li>
            <li><strong>Kafra Storage Card:</strong> Accede a tu almacenamiento desde cualquier lugar</li>
        </ul>
        <h3>Buffs y Reforzamientos Temporales</h3>
        <p>
          Para aquellos que buscan una ventaja estratégica:
        </p>
        <ul>
            <li><strong>Abrasive:</strong> Incremento de Critical Rate</li>
            <li><strong>Scrolls de Buffs de High Priest:</strong> Blessing, Increase Agi, Aspersio, Assumptio, Lex Aeterna.</li>
            <li><strong>Elemental Converter Scrolls:</strong> Fire, Earth, Water, Wind.</li>
        </ul>
        <h3>Bonificaciones de Experiencia</h3>
        <p>
          Anillos de alquiler que otorgan un +15% de EXP contra enemigos de un tipo específico durante una semana:
        </p>
        <ul>
            <li><strong>Beholder Ring:</strong> Neutral</li>
            <li><strong>Bloody Ring:</strong> Demihuman</li>
            <li><strong>Chemical Ring:</strong> Plant</li>
            <li><strong>Clamorous Ring:</strong> Brute</li>
            <li><strong>Decussate Ring:</strong> Demon</li>
            <li><strong>Fisher Ring:</strong> Fish</li>
            <li><strong>Hallow Ring:</strong> Undead</li>
            <li><strong>Insecticide Ring:</strong> Insect</li>
            <li><strong>Satanic Ring:</strong> Angel</li>
        </ul>
        <h3>Cajas de Objetos Aleatorios</h3>
        <p>
          Sorpresas para los jugadores que disfrutan de la emoción de lo inesperado:
        </p>
        <ul>
            <li><strong>Jewelery Box:</strong> Accesorios aleatorios</li>
            <li><strong>Wrapped Mask:</strong> Máscaras aleatorias</li>
            <li><strong>Old Red Box:</strong> Equipo aleatorio</li>
            <li><strong>Poring Box:</strong> Invoca un Poring aleatorio, incluyendo Angeling, Deviling y Ghostring</li>
        </ul>
        <h3>Consumibles Útiles</h3>
        <p>
          Para esos momentos críticos en el combate:
        </p>
        <ul>
            <li><strong>Cursed Water:</strong> Encanta el arma con propiedad Shadow</li>
            <li><strong>Blue Potion:</strong> Recuperación rápida de SP</li>
            <li><strong>Acid Bomb:</strong> Para Alchemist y Creator</li>
            <li><strong>Yggdrasil Leaf:</strong> Revive a un aliado caído</li>
            <li><strong>Token of Siegfried:</strong> Revive instantáneamente en combate</li>
        </ul>
        <h3>Conjuntos de Cartas</h3>
        <p>
          Perfectos para aquellos que buscan fortalecer a sus personajes con builds específicas:
        </p>
        <ul>
            <li><strong>First Class Sets:</strong> Archer, Acolyte, Swordman, Magician, Thief, Merchant.</li>
            <li><strong>Second Class Sets:</strong> Crusader, Alchemist, Bard, Rogue, Sage, Monk.</li>
            <li><strong>Other Sets:</strong> Owl, Clock Tower, Ghost, Geffenia, Nightmare.</li>
        </ul>
      </div>
    </div>
  ),

  'restrictions': (
    <div className="info-content">
      <h2>Restricciones y penalizaciones</h2>
      <div className="content-section">
        <p>
          Para mantener el balance del juego, evitar abusos y mantener la progresión se establecen los siguientes límites:
        </p>
        <h3>Niveles Máximos</h3>
        <ul>  
          <li>Clases Regulares: 99/50</li>
          <li>Clases Expanded: 99/60</li>
          <li>Clases Renacidas: 99/70</li>
          <li>Clases Avanzadas: 175/60</li>
        </ul>
        <h3>Estadísticas Máximas</h3>
        <ul>
          <li>Baby Classes: 80</li>
          <li>Clases Regulares: 99</li>
          <li>Clases Expanded Avanzadas: 125</li>
          <li>Clases Avanzadas: 130</li>
        </ul>
        <h3>Restricciones Generales</h3>
        <ul>
          <li>Velocidad de ataque máxima (ASPD): 193 clases regulares y 195 clases avanzadas</li>
          <li>Máximo de Zeny: 2,147,483,647</li>
          <li>Nivel máximo para compartir experiencia en Party: 15 niveles</li>
          <li>Máximo nivel de Safe Refine Ticket: +9</li>
          <li>Máximo nivel de Refine: +20</li>
        </ul>
        <h3>Penalizaciones de Experiencia y Drop</h3>
        <ul>
          <li>Monstruos 30 niveles por encima: Drop reducido al 50%, experiencia al 40%.</li>
          <li>Monstruos 15 niveles por encima: Drop reducido al 60%, experiencia al 100%.</li>
          <li>Monstruos 10 niveles por encima: Drop reducido al 75%, pero experiencia aumentada a 140%.</li>
          <li>Monstruos en el rango de nivel del jugador: Experiencia y drop normales.</li>
          <li>Monstruos 10 niveles por debajo: Drop reducido al 75%, experiencia reducida al 90%.</li>
          <li>Monstruos 15 niveles por debajo: Drop reducido al 60%, experiencia reducida al 80%.</li>
          <li>Monstruos 30 niveles por debajo: Drop reducido al 50%, experiencia mínima del 10%.</li>
        </ul>
        <h3>Indicador de Penalizaciones</h3>
        <p>
          Para ayudar a los jugadores a visualizar las penalizaciones de experiencia y drop, se ha implementado un indicador visual.
          Este indicador muestra el nivel del monstruo en comparación con el nivel del jugador, lo que facilita la selección de objetivos adecuados.
        </p>
        <ul>
          <li>Rojo: Monstruos 10+ niveles por encima.</li>
          <li>Rosa: Monstruos dentro del rango de nivel.</li>
          <li>Gris: Monstruos 15+ niveles por debajo.</li>
        </ul>
      </div>
    </div>
  ),

  'trade-npcs': (
    <div className="info-content">
      <h2>Comercio e Intercambio</h2>
      <div className="content-section">
        <ul>
          <li><strong>Card Trader</strong> - Permite intercambiar cartas por objetos especiales.</li>
          <li><strong>Cash Point Merchant</strong> - Facilita la compra y venta de Cash Points usando Zeny.</li>
          <li><strong>Thrasher</strong> - Recolecta objetos aleatorios por un alto precio.</li>
          <li><strong>Old Blacksmith</strong> - Permite intercambiar el Special Gold obtenido en Bounty Missions por piedras y bendiciones de Blacksmith.</li>
          <li><strong>Monke</strong> - Un simpático Yoyo que intercambia bananas por frutas aleatorias.</li>
        </ul>
      </div>
    </div>
  ),

  'buff-npcs': (
    <div className="info-content">
      <h2>Buffs y Soporte</h2>
      <div className="content-section">
        <ul>
          <li><strong>Healer</strong> - Cura completamente al personaje y otorga Buffs temporales.</li>
          <li><strong>Endower</strong> - Un sabio viajero que encanta armas con poder elemental por un costo.</li>
          <li><strong>Soul Linker</strong> - Otorga Buffs exclusivos de Soul Linker a cambio de Zeny.</li>
          <li><strong>Reset Girl</strong> - Permite reiniciar estadísticas y habilidades del personaje, solo se puede usar una vez por personaje.</li>
        </ul>
      </div>
    </div>
  ),

  'other-npcs': (
    <div className="info-content">
      <h2>Otros NPCs</h2>
      <div className="content-section">
        <ul>
          <li><strong>Cronista</strong> - Lleva un conteo de los aventureros que recorren el mundo.</li>
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