import { useState, useRef, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import '../styles/Database.css';
// @ts-ignore
import lunr from 'lunr';

type TabType = 'items' | 'mobs';

interface SearchResult {
  id: string;
  [key: string]: any;
}

interface LunrSearchResult {
  ref: string;
  score: number;
  matchData: any;
}

interface SearchOptions {
  selectedTypes: number[];
  searchByMap?: boolean;
  includeMiniBoss?: boolean;
}

interface SearchState {
  results: SearchResult[];
  lastVisible: any | null;
  hasMore: boolean;
}

interface ImageDescriptor {
  icons: { [key: string]: number };
  illustrations: { [key: string]: number };
}

interface LocalData {
  items: { [key: string]: any };
  types: { [key: string]: string[] };
  imageDescriptor: ImageDescriptor;
  searchIndex: lunr.Index | null;
  nameDesc: any[];
  iconBatches: { [key: number]: { [key: string]: string } };
  illustrationBatches: { [key: number]: { [key: string]: string } };
}

const RESULTS_PER_PAGE = 10;

const JOBS = {
  0 : "Novice",
  1 : "Swordman",
  2 : "Magician",
  3 : "Archer",
  4 : "Acolyte",
  5 : "Merchant",
  6 : "Thief",
  7 : "Knight",
  8 : "Priest",
  9 : "Wizard",
  10 : "Blacksmith",
  11 : "Hunter",
  12 : "Assassin",
  13 : "Unused",
  14 : "Crusader",
  15 : "Monk",
  16 : "Sage",
  17 : "Rogue",
  18 : "Alchemist",
  19 : "Bard/Dancer",
  20 : "Unused",
  21 : "Taekwon",
  22 : "Star Gladiator",
  23 : "Soul Linker",
  24 : "Gunslinger",
  25 : "Ninja",
  26 : "Gangsi",
  27 : "Death Knight",
  28 : "Dark Collector",
  29 : "Kagerou/Oboro",
  30 : "Rebellion",
  31 : "Summoner"
} as const;

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

const getJobName = (job: number): string => {
  return JOBS[job as keyof typeof JOBS] || `Unknown (${job})`;
};

const Database = () => {
  const [activeTab, setActiveTab] = useState<TabType>('items');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchState, setSearchState] = useState<SearchState>({
    results: [],
    lastVisible: 0,
    hasMore: true
  });
  const [isOptionsVisible, setIsOptionsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [searchOptions, setSearchOptions] = useState<SearchOptions>({
    selectedTypes: [],
    searchByMap: false,
    includeMiniBoss: true
  });
  const [localData, setLocalData] = useState<LocalData>({
    items: {},
    types: {},
    imageDescriptor: { icons: {}, illustrations: {} },
    searchIndex: null,
    nameDesc: [],
    iconBatches: {},
    illustrationBatches: {}
  });
  const searchOptionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [
          itemsResponse,
          typesResponse,
          imageDescriptorResponse,
          searchIndexResponse,
          nameDescResponse
        ] = await Promise.all([
          fetch('/data/items.json'),
          fetch('/data/types.json'),
          fetch('/data/images_descriptor.json'),
          fetch('/data/search-index.json'),
          fetch('/data/namedesc.json')
        ]);

        const [items, types, imageDescriptor, searchIndexData, nameDesc] = await Promise.all([
          itemsResponse.json(),
          typesResponse.json(),
          imageDescriptorResponse.json(),
          searchIndexResponse.json(),
          nameDescResponse.json()
        ]);

        setLocalData({
          items,
          types,
          imageDescriptor,
          searchIndex: lunr.Index.load(searchIndexData),
          nameDesc,
          iconBatches: {},
          illustrationBatches: {}
        });
      } catch (error) {
        console.error('Error cargando datos iniciales:', error);
      }
    };

    loadInitialData();
  }, []);

  const loadImageBatch = async (batchNumber: number, type: 'icons' | 'illustrations') => {
    if (!localData[type === 'icons' ? 'iconBatches' : 'illustrationBatches'][batchNumber]) {
      try {
        const response = await fetch(`/data/${type}_batch_${batchNumber}.json`);
        const batchData = await response.json();
        
        setLocalData(prev => ({
          ...prev,
          [type === 'icons' ? 'iconBatches' : 'illustrationBatches']: {
            ...prev[type === 'icons' ? 'iconBatches' : 'illustrationBatches'],
            [batchNumber]: batchData
          }
        }));
        return batchData;
      } catch (error) {
        console.error(`Error cargando batch de ${type}:`, error);
        return null;
      }
    }
    return localData[type === 'icons' ? 'iconBatches' : 'illustrationBatches'][batchNumber];
  };

  const getImage = async (id: string, type: 'icons' | 'illustrations'): Promise<string> => {
    const descriptor = localData.imageDescriptor[type];
    if (!descriptor || !descriptor[id]) {
      return '/placeholder.png';
    }

    const batchNumber = descriptor[id];
    const batch = await loadImageBatch(batchNumber, type);
    
    return batch?.[id] || '/placeholder.png';
  };

  const processResults = async (matchedIds: string[]) => {
    const startIndex = (searchState.lastVisible as number) * RESULTS_PER_PAGE;
    const paginatedIds = matchedIds.slice(startIndex, startIndex + RESULTS_PER_PAGE);
    
    const results = await Promise.all(paginatedIds.map(async id => {
      const [icon, illustration] = await Promise.all([
        getImage(id, 'icons'),
        getImage(id, 'illustrations')
      ]);

      // Obtener el item base y los datos de nombre/descripción
      const itemData = localData.items[id] || {};
      const nameDescData = localData.nameDesc.find((item: any) => item.id === id);

      return {
        id,
        type: itemData.type || 0,
        subtype: itemData.subtype || 0,
        atk: itemData.atk || 0,
        matk: itemData.matk || 0,
        defence: itemData.defence || 0,
        price_buy: itemData.price_buy || 0,
        price_sell: itemData.price_sell || 0,
        weight: itemData.weight || 0,
        codename1: itemData.codename1 || '',
        codename2: itemData.codename2 || '',
        script: itemData.script || '',
        name: nameDescData?.name || itemData.codename1 || '',
        description: nameDescData?.description || '',
        icon,
        illustration
      };
    }));

    return results;
  };

  const isValidItem = (id: string, items: any, nameDesc: any[], imageDescriptor: any) => {
    const item = items[id];
    const nameDescData = nameDesc.find((nd: any) => nd.id === id);
    
    return item && 
           nameDescData && 
           nameDescData.name && // Tiene nombre en nameDesc
           nameDescData.description && // Tiene descripción
           item.type !== undefined && 
           item.codename1 && // Tiene nombre en inglés
           imageDescriptor.icons[id]; // Tiene ícono
  };

  const handleInitialSearch = async (items: any, nameDesc: any, imageDescriptor: any) => {
    // Mostrar solo los primeros 10 items válidos
    const initialIds = nameDesc
      .filter((nd: any) => isValidItem(nd.id, items, nameDesc, imageDescriptor))
      .slice(0, RESULTS_PER_PAGE)
      .map((nd: any) => nd.id);

    const results = await processResults(initialIds);
    
    setSearchState({
      results,
      lastVisible: 0,
      hasMore: false // No mostrar "cargar más" en la carga inicial
    });
  };

  const searchItems = async (searchTerm: string, options: SearchOptions) => {
    let matchedIds: string[] = [];

    if (searchTerm.trim()) {
      const isNumericSearch = /^\d+$/.test(searchTerm.trim());

      if (isNumericSearch) {
        const id = searchTerm.trim();
        if (isValidItem(id, localData.items, localData.nameDesc, localData.imageDescriptor)) {
          matchedIds = [id];
        }
      } else if (localData.searchIndex) {
        try {
          const searchResults = localData.searchIndex.search(searchTerm) as LunrSearchResult[];
          matchedIds = searchResults
            .sort((a, b) => b.score - a.score)
            .map(result => result.ref)
            .filter(id => isValidItem(id, localData.items, localData.nameDesc, localData.imageDescriptor));
        } catch (error) {
          console.error('Error en la búsqueda con Lunr:', error);
        }
      }
    } else {
      matchedIds = localData.nameDesc
        .filter((nd: any) => isValidItem(nd.id, localData.items, localData.nameDesc, localData.imageDescriptor))
        .map((nd: any) => nd.id);
    }

    // Filtrar por tipos seleccionados usando la base de datos de tipos
    if (options.selectedTypes.length > 0) {
      const selectedTypeIds = new Set(
        options.selectedTypes.flatMap(type => localData.types[type] || [])
      );
      matchedIds = matchedIds.filter(id => selectedTypeIds.has(id));
    }

    const results = await processResults(matchedIds);

    return {
      results,
      lastVisible: 0,
      hasMore: matchedIds.length > RESULTS_PER_PAGE
    };
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    try {
      const searchResult = await searchItems(searchTerm, searchOptions);
      setSearchState(searchResult);
    } catch (error) {
      console.error('Error al buscar:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const loadMore = async () => {
    if (!searchState.hasMore) return;

    try {
      const nextPage = (searchState.lastVisible as number) + 1;
      const currentResults = await searchItems(searchTerm, searchOptions);
      
      setSearchState(prev => ({
        results: [...prev.results, ...currentResults.results],
        lastVisible: nextPage,
        hasMore: currentResults.hasMore
      }));
    } catch (error) {
      console.error('Error al cargar más resultados:', error);
    }
  };

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
    }, 300);
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
                    placeholder={`Buscar por nombre o ID ${activeTab === 'items' ? 'del objeto' : 'del monstruo'}...`}
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
                          checked={searchOptions.selectedTypes.length > 0}
                          onChange={() => handleOptionChange('selectedTypes')}
                        /> 
                        Filtrar por tipo
                      </label>
                    </div>
                    {activeTab === 'items' ? (
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
                            alt={result.name}
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
                                alt={result.name}
                                className="small-icon"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = '/placeholder.png';
                                }}
                              />
                              <div className="title-container">
                                <div className="title-row">
                                  <h3>
                                    <span className="name-title">{result.name}</span>
                                    {' '}
                                    <span className="name-details">
                                      [{result.codename1}/{result.codename2 || '???'}]
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
                          {result.description && (
                            <div className="result-card-section">
                              <div className="result-card-description-header">Descripción:</div>
                              <div className="result-card-description">
                                <pre className="result-card-description-content">
                                  {result.description}
                                </pre>
                              </div>
                            </div>
                          )}
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
                      className="load-more-button"
                    >
                      Cargar más
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