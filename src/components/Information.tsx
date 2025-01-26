import { useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import InfoSidebar from './InfoSidebar';
import InfoContent from './InfoContent';
import '../styles/Information.css';

export type InfoSection = {
  id: string;
  title: string;
  icon: string;
  category: string;
};

const sections: InfoSection[] = [
  // Información del Servidor
  { id: 'features', title: 'Características', icon: '/icons/feature.png', category: 'Información del Servidor' },
  { id: 'exp-rates', title: 'Rates de Experiencia', icon: '/icons/exp.png', category: 'Información del Servidor' },
  { id: 'drop-rates', title: 'Tasa de Drop', icon: '/icons/drop.png', category: 'Información del Servidor' },
  { id: 'stats', title: 'Estadísticas', icon: '/icons/stats.png', category: 'Información del Servidor' },

  // Sistemas Personalizados
  { id: 'unique-features', title: 'Características Personalizadas', icon: '/icons/unique.png', category: 'Sistemas Personalizados' },
  { id: 'cash-shop', title: 'Cash Shop', icon: '/icons/cash.png', category: 'Sistemas Personalizados' },
  { id: 'restrictions', title: 'Restricciones y penalizaciones', icon: '/icons/restriction.png', category: 'Sistemas Personalizados' },

  // NPCs Personalizados
  { id: 'trade-npcs', title: 'Comercio e Intercambio', icon: '/icons/trade.png', category: 'NPCs Personalizados' },
  { id: 'buff-npcs', title: 'Buffs y Soporte', icon: '/icons/buff.png', category: 'NPCs Personalizados' },
  { id: 'other-npcs', title: 'Otros', icon: '/icons/npc.png', category: 'NPCs Personalizados' },

  // Quests Personalizadas
  { id: 'crimson-weapons', title: 'Crimson Weapons', icon: '/icons/weapon.png', category: 'Quests Personalizadas' },
  { id: 'bounty-missions', title: 'Bounty Missions', icon: '/icons/bounty.png', category: 'Quests Personalizadas' },
  { id: 'hunting-missions', title: 'Hunting Missions', icon: '/icons/hunt.png', category: 'Quests Personalizadas' },
];

const Information = () => {
  const [selectedSection, setSelectedSection] = useState<string>(sections[0].id);

  return (
    <div className="information">
      <Header />
      <div className="server-info-section">
        <div className="info-container">
          <InfoSidebar 
            sections={sections} 
            selectedSection={selectedSection} 
            onSectionChange={setSelectedSection} 
          />
          <InfoContent selectedSection={selectedSection} />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Information; 