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
  searchByMap?: boolean;
  includeMiniBoss?: boolean;
  selectedTypes: number[];
}

interface SearchState {
  results: SearchResult[];
  lastVisible: any | null;
  hasMore: boolean;
}

const RESULTS_PER_PAGE = 10;

const ITEM_TYPES = {
  0: 'Healing item',
  2: 'Usable item',
  3: 'Etc item',
  4: 'Weapon',
  5: 'Armor',
  6: 'Card',
  7: 'Pet egg',
  8: 'Pet equipment',
  10: 'Ammo',
  11: 'Delayed Usable',
  18: 'Usable with Confirmation'
} as const;

const WEAPON_SUBTYPES = {
  0: 'Bare fist',
  1: 'Daggers',
  2: 'One-handed swords',
  3: 'Two-handed swords',
  4: 'One-handed spears',
  5: 'Two-handed spears',
  6: 'One-handed axes',
  7: 'Two-handed axes',
  8: 'Maces',
  9: 'Unused',
  10: 'Staves',
  11: 'Bows',
  12: 'Knuckles',
  13: 'Musical instruments',
  14: 'Whips',
  15: 'Books',
  16: 'Katars',
  17: 'Revolvers',
  18: 'Rifles',
  19: 'Gatling guns',
  20: 'Shotguns',
  21: 'Grenade launchers',
  22: 'Fuuma shurikens',
  23: 'Two-handed staves'
} as const;

const AMMO_SUBTYPES = {
  1: 'Arrows',
  2: 'Throwable daggers',
  3: 'Bullets',
  4: 'Shells',
  5: 'Grenades',
  6: 'Shuriken',
  7: 'Kunai',
  8: 'Cannon balls',
  9: 'Throwable items'
} as const;

const getTypeName = (type: number): string => {
  return ITEM_TYPES[type as keyof typeof ITEM_TYPES] || `Unknown (${type})`;
};

const getSubtypeName = (type: number, subtype: number): string => {
  if (type === 4) { // Weapon
    return WEAPON_SUBTYPES[subtype as keyof typeof WEAPON_SUBTYPES] || `Unknown (${subtype})`;
  } else if (type === 10) { // Ammo
    return AMMO_SUBTYPES[subtype as keyof typeof AMMO_SUBTYPES] || `Unknown (${subtype})`;
  }
  return '';
};

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
    searchByMap: false,
    includeMiniBoss: true,
    selectedTypes: []
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
      searchByMap: false,
      includeMiniBoss: true,
      selectedTypes: []
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

  const handleTypeToggle = (type: number) => {
    setSearchOptions(prev => ({
      ...prev,
      selectedTypes: prev.selectedTypes.includes(type)
        ? prev.selectedTypes.filter(t => t !== type)
        : [...prev.selectedTypes, type]
    }));
  };

  const searchItems = async (searchTerm: string, options: SearchOptions, lastDoc: any = null) => {
    const dbRef = collection(db, 'item-db');
    let baseQuery = query(dbRef);
    const conditions: any[] = [];

    if (searchTerm.trim()) {
      const searchField = options.searchById ? 'id' : 
                         options.searchByDescription ? 'description' : 'name_english';
      
      let processedSearchTerm = searchTerm.trim();
      if (!options.searchById && !options.searchByDescription) {
        processedSearchTerm = processedSearchTerm
          .split(/\s+/)
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join('_');
      }

      if (options.exactMatch) {
        conditions.push(where(searchField, '==', processedSearchTerm));
      } else {
        conditions.push(where(searchField, '>=', processedSearchTerm));
      }
    }

    if (options.selectedTypes.length > 0) {
      const typeStrings = options.selectedTypes.map(type => type.toString());
      conditions.push(where('type', 'in', typeStrings));
    }

    if (conditions.length > 0) {
      baseQuery = query(dbRef, ...conditions);
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
    let baseQuery = query(dbRef);

    if (searchTerm.trim()) {
      const searchField = options.searchById ? 'ID' :
                         options.searchByMap ? 'map' : 'iName';
      const searchTermLower = searchTerm.toLowerCase();

      if (options.exactMatch) {
        baseQuery = query(
          dbRef,
          where(searchField, '==', searchTermLower)
        );
      } else {
        baseQuery = query(
          dbRef,
          where(searchField, '>=', searchTermLower),
          where(searchField, '<=', searchTermLower + '\uf8ff')
        );
      }
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
    setIsSearching(true);
    try {
      const searchResult = await (activeTab === 'items' 
        ? searchItems(searchTerm, searchOptions)
        : searchMobs(searchTerm, searchOptions));
      
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
                        <div className="search-types">
                          <div className="search-types-title">Filtrar por tipo:</div>
                          <div className="search-types-grid">
                            {Object.entries(ITEM_TYPES).map(([typeId, typeName]) => (
                              <label key={typeId} className="type-checkbox">
                                <input
                                  type="checkbox"
                                  checked={searchOptions.selectedTypes.includes(Number(typeId))}
                                  onChange={() => handleTypeToggle(Number(typeId))}
                                />
                                {typeName}
                              </label>
                            ))}
                          </div>
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
                          <img 
                            src={result.illustration || result.icon || '/placeholder.png'}
                            alt={result.name_english}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder.png';
                            }}
                          />
                        </div>
                        <div className="result-card-info">
                          <div className="result-card-header">
                            <div className="result-card-title">
                              <img 
                                src={result.icon || '/placeholder.png'}
                                alt={result.name_english}
                                className="small-icon"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = '/placeholder.png';
                                }}
                              />
                              <div className="title-container">
                                <div className="title-row">
                                  <h3>
                                    <span className="name-title">{formatItemName(result.name_english)}</span>
                                    {' '}
                                    <span className="name-details">
                                      [{result.name_english}/{result.name_japanese || '???'}]
                                    </span>
                                    {' '}
                                    <span className="result-card-id">(#{result.id})</span>
                                  </h3>
                                  <span className="item-type">
                                    {getTypeName(result.type)}
                                    {(result.type === 4 || result.type === 10) && result.subtype ? (
                                      <span className={`item-type-${result.type === 4 ? 'weapon' : 'ammo'}`}>
                                        {' - '}
                                        {getSubtypeName(result.type, result.subtype)}
                                      </span>
                                    ) : null}
                                  </span>
                                </div>
                              </div>
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
                              <div className="result-card-property">
                                <span className="property-label">Peso</span>
                                <span className="property-value">{result.weight}</span>
                              </div>
                            </div>
                          </div>
                          {result.script && (
                            <div className="result-card-section">
                              <div className="result-card-script-header">Script:</div>
                              <pre className="result-card-script">
                                {result.script}
                              </pre>
                            </div>
                          )}
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
                {searchTerm || searchOptions.selectedTypes.length > 0 
                  ? 'No se encontraron resultados' 
                  : 'Ingresa un término para buscar o selecciona tipos de objetos'}
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