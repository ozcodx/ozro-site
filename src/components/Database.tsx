import { useState, useRef, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import Header from './Header';
import Footer from './Footer';
import '../styles/Database.css';

type TabType = 'items' | 'mobs';

interface SearchResult {
  id: string;
  [key: string]: any;
}

interface SearchOptions {
  searchById: boolean;
  exactMatch: boolean;
  searchByDescription?: boolean;
  includeRefinedItems?: boolean;
  searchByMap?: boolean;
  includeMiniBoss?: boolean;
}

const Database = () => {
  const [activeTab, setActiveTab] = useState<TabType>('items');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOptionsVisible, setIsOptionsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [searchOptions, setSearchOptions] = useState<SearchOptions>({
    searchById: false,
    exactMatch: false,
    searchByDescription: false,
    includeRefinedItems: true,
    searchByMap: false,
    includeMiniBoss: true
  });
  const searchOptionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setResults([]);
    setSearchTerm('');
    setSearchOptions({
      searchById: false,
      exactMatch: false,
      searchByDescription: false,
      includeRefinedItems: true,
      searchByMap: false,
      includeMiniBoss: true
    });
    if (isOptionsVisible) {
      handleOptionsClose();
    }
  }, [activeTab]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchOptionsRef.current && !searchOptionsRef.current.contains(event.target as Node)) {
        handleOptionsClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleOptionsToggle = () => {
    if (isOptionsVisible) {
      handleOptionsClose();
    } else {
      setIsOptionsVisible(true);
      setIsClosing(false);
    }
  };

  const handleOptionsClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOptionsVisible(false);
      setIsClosing(false);
    }, 300); // Duración de la animación
  };

  const handleOptionChange = (option: keyof SearchOptions) => {
    setSearchOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const searchItems = async (searchTerm: string, options: SearchOptions) => {
    const dbRef = collection(db, 'item-db');
    const searchField = options.searchById ? 'id' : 
                       options.searchByDescription ? 'description' : 'name_english';
    
    let q;
    if (options.exactMatch) {
      q = query(dbRef, where(searchField, '==', searchTerm));
    } else {
      q = query(
        dbRef,
        where(searchField, '>=', searchTerm),
        where(searchField, '<=', searchTerm + '\uf8ff')
      );
    }

    if (!options.includeRefinedItems) {
      q = query(q, where('refined', '==', false));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  };

  const searchMobs = async (searchTerm: string, options: SearchOptions) => {
    const dbRef = collection(db, 'mob-db');
    const searchField = options.searchById ? 'ID' :
                       options.searchByMap ? 'map' : 'iName';
    
    let q;
    if (options.exactMatch) {
      q = query(dbRef, where(searchField, '==', searchTerm));
    } else {
      q = query(
        dbRef,
        where(searchField, '>=', searchTerm),
        where(searchField, '<=', searchTerm + '\uf8ff')
      );
    }

    if (!options.includeMiniBoss) {
      q = query(q, where('is_miniboss', '==', false));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    try {
      const results = await (activeTab === 'items' 
        ? searchItems(searchTerm.trim(), searchOptions)
        : searchMobs(searchTerm.trim(), searchOptions));
      
      setResults(results);
    } catch (error) {
      console.error('Error al buscar:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="database">
      <Header />
      <div className="database-content">
        <div className="database-tabs">
          <button 
            className={`tab-button ${activeTab === 'items' ? 'active' : ''}`}
            onClick={() => setActiveTab('items')}
          >
            Base de Datos de Objetos
          </button>
          <button 
            className={`tab-button ${activeTab === 'mobs' ? 'active' : ''}`}
            onClick={() => setActiveTab('mobs')}
          >
            Base de Datos de Monstruos
          </button>
        </div>
        <div className="database-container">
          <div className="search-section">
            <div className="search-container">
              <form onSubmit={handleSearch} className="search-form">
                <div className="form-group">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={`Buscar por nombre ${activeTab === 'items' ? 'del objeto' : 'del monstruo'}...`}
                    className="search-input"
                  />
                  <button type="submit" className="search-button" disabled={isSearching}>
                    {isSearching ? 'Buscando...' : 'Buscar'}
                  </button>
                </div>
              </form>
              <div className="search-options-container" ref={searchOptionsRef}>
                <button 
                  className="search-options-toggle"
                  onClick={handleOptionsToggle}
                >
                  <i className={`arrow-icon ${isOptionsVisible ? 'up' : 'down'}`}></i>
                </button>
                {isOptionsVisible && (
                  <div className={`search-options-panel ${isClosing ? 'closing' : ''}`}>
                    <div className="search-option">
                      <label>
                        <input 
                          type="checkbox" 
                          checked={searchOptions.searchById}
                          onChange={() => handleOptionChange('searchById')}
                        /> 
                        Buscar por ID
                      </label>
                    </div>
                    <div className="search-option">
                      <label>
                        <input 
                          type="checkbox" 
                          checked={searchOptions.exactMatch}
                          onChange={() => handleOptionChange('exactMatch')}
                        /> 
                        Búsqueda exacta
                      </label>
                    </div>
                    {activeTab === 'items' ? (
                      <>
                        <div className="search-option">
                          <label>
                            <input 
                              type="checkbox" 
                              checked={searchOptions.searchByDescription}
                              onChange={() => handleOptionChange('searchByDescription')}
                            /> 
                            Buscar en descripción
                          </label>
                        </div>
                        <div className="search-option">
                          <label>
                            <input 
                              type="checkbox" 
                              checked={searchOptions.includeRefinedItems}
                              onChange={() => handleOptionChange('includeRefinedItems')}
                            /> 
                            Incluir objetos refinados
                          </label>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="search-option">
                          <label>
                            <input 
                              type="checkbox" 
                              checked={searchOptions.searchByMap}
                              onChange={() => handleOptionChange('searchByMap')}
                            /> 
                            Buscar por mapa
                          </label>
                        </div>
                        <div className="search-option">
                          <label>
                            <input 
                              type="checkbox" 
                              checked={searchOptions.includeMiniBoss}
                              onChange={() => handleOptionChange('includeMiniBoss')}
                            /> 
                            Incluir mini-jefes
                          </label>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="results-section">
            {results.length > 0 ? (
              <div className="results-grid">
                {results.map(result => (
                  <div key={result.id} className="result-card">
                    <h3>{activeTab === 'items' ? result.name_english : result.iName}</h3>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-results">
                {searchTerm ? 'No se encontraron resultados' : 'Ingresa un término para buscar'}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Database; 
