import { ReactNode } from 'react';
import '../styles/Information.css';

interface InfoContentProps {
  selectedSection: string;
}

const contentMap: Record<string, ReactNode> = {
  'exp-rates': (
    <div className="info-content">
      <h2>Tasas de Experiencia</h2>
      <div className="content-section">
        <h3>Experiencia Base y de Job</h3>
        <ul>
          <li>Experiencia Base y Job normal: 5x</li>
          <li>Experiencia de MVPs: 10x</li>
          <li>Experiencia de Quests: 3x</li>
        </ul>
        <p>
          Las tasas están ajustadas para ofrecer una progresión satisfactoria sin hacer el juego demasiado fácil.
          Los MVPs dan el doble de experiencia para incentivar la caza de jefes, mientras que las quests dan menos
          para mantener el balance.
        </p>
      </div>
    </div>
  ),
  'drop-rates': (
    <div className="info-content">
      <h2>Tasas de Drop</h2>
      <div className="content-section">
        <h3>Tasas por Categoría</h3>
        <ul>
          <li>Consumibles: 20x</li>
          <li>Equipamiento: 30x</li>
          <li>Cartas: 2% (1% con penalización de nivel)</li>
          <li>Items de MVP: 5x a 15x</li>
          <li>Tesoros WoE: 5x</li>
        </ul>
        <p>
          El sistema de drop está diseñado para que los items mantengan su valor mientras se hace más accesible
          conseguir el equipo necesario para progresar.
        </p>
      </div>
    </div>
  ),
  // Añade más secciones según sea necesario
};

const InfoContent = ({ selectedSection }: InfoContentProps) => {
  return (
    <div className="info-content-container">
      {contentMap[selectedSection] || (
        <div className="info-content">
          <h2>Sección en Construcción</h2>
          <p>Esta sección está siendo actualizada...</p>
        </div>
      )}
    </div>
  );
};

export default InfoContent; 