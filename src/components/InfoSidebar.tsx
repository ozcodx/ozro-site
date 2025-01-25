import { InfoSection } from './Information';
import '../styles/Information.css';

interface InfoSidebarProps {
  sections: InfoSection[];
  selectedSection: string;
  onSectionChange: (sectionId: string) => void;
}

const InfoSidebar = ({ sections, selectedSection, onSectionChange }: InfoSidebarProps) => {
  const categories = Array.from(new Set(sections.map(section => section.category)));

  return (
    <div className="info-sidebar">
      {categories.map(category => (
        <div key={category} className="sidebar-category">
          <h3>{category}</h3>
          <ul>
            {sections
              .filter(section => section.category === category)
              .map(section => (
                <li 
                  key={section.id}
                  className={`sidebar-item ${selectedSection === section.id ? 'active' : ''}`}
                  onClick={() => onSectionChange(section.id)}
                >
                  <img src={section.icon} alt="" className="sidebar-icon" />
                  <span>{section.title}</span>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default InfoSidebar; 