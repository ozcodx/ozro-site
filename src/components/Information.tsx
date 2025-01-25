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
  // Tasas y Configuraciones
  { id: 'exp-rates', title: 'Tasas de Experiencia', icon: '/icons/exp.webp', category: 'Tasas y Configuraciones' },
  { id: 'drop-rates', title: 'Tasas de Drop', icon: '/icons/drop.webp', category: 'Tasas y Configuraciones' },
  { id: 'battle-config', title: 'Config. de Batalla', icon: '/icons/battle.webp', category: 'Tasas y Configuraciones' },
  { id: 'party-config', title: 'Config. de Party', icon: '/icons/party.webp', category: 'Tasas y Configuraciones' },
  
  // NPCs y Servicios
  { id: 'utility-npcs', title: 'NPCs de Utilidad', icon: '/icons/npc.webp', category: 'NPCs y Servicios' },
  { id: 'custom-npcs', title: 'NPCs Personalizados', icon: '/icons/custom.webp', category: 'NPCs y Servicios' },
  { id: 'cash-shop', title: 'Cash Shop', icon: '/icons/cash.webp', category: 'NPCs y Servicios' },
  
  // Sistemas Personalizados
  { id: 'custom-quests', title: 'Misiones Custom', icon: '/icons/quest.webp', category: 'Sistemas Personalizados' },
  { id: 'custom-items', title: 'Items Custom', icon: '/icons/item.webp', category: 'Sistemas Personalizados' },
  { id: 'custom-features', title: 'Características Custom', icon: '/icons/feature.webp', category: 'Sistemas Personalizados' },
  
  // Información del Servidor
  { id: 'server-info', title: 'Datos del Servidor', icon: '/icons/server.webp', category: 'Información del Servidor' },
  { id: 'commands', title: 'Comandos', icon: '/icons/command.webp', category: 'Información del Servidor' },
  { id: 'rules', title: 'Reglas', icon: '/icons/rules.webp', category: 'Información del Servidor' },
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