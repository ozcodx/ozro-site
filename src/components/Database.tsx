import { useState, useRef, useEffect } from 'react';
import { collection, query, where, getDocs, limit, startAfter } from 'firebase/firestore';
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

interface SearchState {
  results: SearchResult[];
  lastVisible: any | null;
  hasMore: boolean;
}

const RESULTS_PER_PAGE = 10;

const formatItemName = (name: string) => {
  return name
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const Database = () => {
  const [activeTab, setActiveTab] = useState<TabType>('items');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchState, setSearchState] = useState<SearchState>({
    results: [],
    lastVisible: null,
    hasMore: true
  });
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
    setSearchState({
      results: [],
      lastVisible: null,
      hasMore: true
    });
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

  const searchItems = async (searchTerm: string, options: SearchOptions, lastDoc: any = null) => {
    const dbRef = collection(db, 'item-db');
    const searchField = options.searchById ? 'id' : 
                       options.searchByDescription ? 'description' : 'name_english';
    
    let baseQuery;
    const searchTermLower = searchTerm.toLowerCase();

    if (options.exactMatch) {
      baseQuery = query(
        dbRef,
        where(searchField, '>=', searchTermLower),
        where(searchField, '<=', searchTermLower + '\uf8ff')
      );
    } else {
      baseQuery = query(
        dbRef,
        where(searchField, '>=', searchTermLower),
        where(searchField, '<=', searchTermLower + '\uf8ff')
      );
    }

    if (!options.includeRefinedItems) {
      baseQuery = query(baseQuery, where('refined', '==', false));
    }

    let finalQuery = query(baseQuery, limit(RESULTS_PER_PAGE));
    if (lastDoc) {
      finalQuery = query(finalQuery, startAfter(lastDoc));
    }

    const snapshot = await getDocs(finalQuery);
    return {
      results: snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })),
      lastVisible: snapshot.docs[snapshot.docs.length - 1],
      hasMore: snapshot.docs.length === RESULTS_PER_PAGE
    };
  };

  const searchMobs = async (searchTerm: string, options: SearchOptions, lastDoc: any = null) => {
    const dbRef = collection(db, 'mob-db');
    const searchField = options.searchById ? 'ID' :
                       options.searchByMap ? 'map' : 'iName';
    
    let baseQuery;
    const searchTermLower = searchTerm.toLowerCase();

    if (options.exactMatch) {
      baseQuery = query(
        dbRef,
        where(searchField, '>=', searchTermLower),
        where(searchField, '<=', searchTermLower + '\uf8ff')
      );
    } else {
      baseQuery = query(
        dbRef,
        where(searchField, '>=', searchTermLower),
        where(searchField, '<=', searchTermLower + '\uf8ff')
      );
    }

    if (!options.includeMiniBoss) {
      baseQuery = query(baseQuery, where('is_miniboss', '==', false));
    }

    let finalQuery = query(baseQuery, limit(RESULTS_PER_PAGE));
    if (lastDoc) {
      finalQuery = query(finalQuery, startAfter(lastDoc));
    }

    const snapshot = await getDocs(finalQuery);
    return {
      results: snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })),
      lastVisible: snapshot.docs[snapshot.docs.length - 1],
      hasMore: snapshot.docs.length === RESULTS_PER_PAGE
    };
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    try {
      const searchResult = await (activeTab === 'items' 
        ? searchItems(searchTerm.trim(), searchOptions)
        : searchMobs(searchTerm.trim(), searchOptions));
      
      setSearchState({
        results: searchResult.results,
        lastVisible: searchResult.lastVisible,
        hasMore: searchResult.hasMore
      });
    } catch (error) {
      console.error('Error al buscar:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const loadMore = async () => {
    if (!searchState.lastVisible || !searchState.hasMore || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const searchResult = await (activeTab === 'items'
        ? searchItems(searchTerm.trim(), searchOptions, searchState.lastVisible)
        : searchMobs(searchTerm.trim(), searchOptions, searchState.lastVisible));

      setSearchState({
        results: searchResult.results,
        lastVisible: searchResult.lastVisible,
        hasMore: searchResult.hasMore
      });
    } catch (error) {
      console.error('Error al cargar más resultados:', error);
    } finally {
      setIsLoadingMore(false);
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
            {searchState.results.length > 0 ? (
              <>
                <div className="results-grid">
                  {searchState.results.map(result => (
                    <div key={result.id} className="result-card">
                      <div className="result-card-content">
                        <div className="result-card-image">
                          <img src={`https://file5s.ratemyserver.net/items/large/${result.id}.gif`} alt={result.name_english} />
                        </div>
                        <div className="result-card-info">
                          <div className="result-card-header">
                            <div className="result-card-title">
                              <img 
                                src={`https://file5s.ratemyserver.net/items/small/${result.id}.gif`} 
                                alt={result.name_english}
                                className="small-icon"
                              />
                              <h3>{formatItemName(result.name_english)}</h3>
                              <span className="result-card-id">({result.id})</span>
                            </div>
                          </div>
                          <div className="result-card-section">
                            <div className="result-card-properties">
                              <div className="result-card-property">
                                <span className="property-label">ATK/MATK</span>
                                <span className="property-value">{`${result.atk}/${result.matk}`}</span>
                              </div>
                              <div className="result-card-property">
                                <span className="property-label">DEF</span>
                                <span className="property-value">{result.defence}</span>
                              </div>
                              <div className="result-card-property">
                                <span className="property-label">Precio</span>
                                <span className="property-value">{`${result.price_buy}/${result.price_sell}`}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {searchState.hasMore && (
                  <div className="load-more">
                    <button 
                      onClick={loadMore} 
                      disabled={isLoadingMore}
                      className="load-more-button"
                    >
                      {isLoadingMore ? 'Cargando...' : 'Cargar más'}
                    </button>
                  </div>
                )}
              </>
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
