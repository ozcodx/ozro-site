import { useState, useRef, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import '../styles/Database.css';
// @ts-ignore
import lunr from 'lunr';

type TabType = 'items' | 'mobs';

interface SearchResult {
  id: string;
  type: number;
  subtype: number;
  atk: number;
  matk: number;
  defence: number;
  price_buy: number;
  price_sell: number;
  weight: number;
  codename1: string;
  codename2: string;
  script: string;
  name: string;
  description: string;
  icon: string;
  illustration: string;
  // Nuevos campos
  stack_amount?: number;
  slots?: number;
  equip_level_min?: number;
  equip_level_max?: number;
  refinable?: boolean;
  weapon_level?: number;
  equip_locations?: number[];
  equip_upper?: number[];
  equip_jobs?: number[];
}

interface LunrSearchResult {
  ref: string;
  score: number;
  matchData: any;
}

interface SearchOptions {
  exactMatch: boolean;
  searchByDescription?: boolean;
  searchByMap?: boolean;
  includeMiniBoss?: boolean;
  selectedTypes: number[];
}

interface SearchState {
  allMatchedIds: string[];
  currentPage: number;
  results: SearchResult[];
  totalPages: number;
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
  nameDesc: { [key: string]: any };
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

const UPPER_TYPES = {
  0 : "Normal jobs",
  1 : "Trascended jobs",
  2 : "Baby jobs",
  3 : "Third jobs",
  4 : "Trascended Third jobs",
  5 : "Baby Third jobs"
}

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

const EQUIP_LOCATIONS = {
  0 : "Lower Headgear",
  1 : "Weapon",
  2 : "Garment",
  3 : "Accessory 1",
  4 : "Armor",
  5 : "Shield",
  6 : "Both Hands",
  7 : "Footgear",
  8 : "Accessory 2",
  9 : "Upper Headgear",
  10 : "Middle Headgear",
  11 : "Costume Top Headgear",
  12 : "Costume Mid Headgear",
  13 : "Costume Low Headgear",
  14 : "Costume Garment/Robe",
  15 : "Ammunition",
  16 : "Shadow Armor",
  17 : "Shadow Weapon",
  18 : "Shadow Shield",
  19 : "Shadow 2H Weapon",
  20 : "Shadow Shoes",
  21 : "Shadow Accessory 2",
  22 : "Shadow Accessory 1",
  23 : "Shadow Accessories",
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

const getEquipLocationsText = (locations: number[]): string => {
  const locationNames = locations.map(loc => EQUIP_LOCATIONS[loc as keyof typeof EQUIP_LOCATIONS] || `Unknown (${loc})`);
  const fullText = locationNames.join(', ');
  return fullText.length > 30 ? fullText.substring(0, 27) + '...' : fullText;
};

const processColoredText = (text: string): JSX.Element[] => {
  const parts = text.split(/(\^[0-9A-F]{6})/i);
  let currentColor = '000000';
  const elements: JSX.Element[] = [];
  let key = 0;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part.startsWith('^')) {
      currentColor = part.substring(1);
      continue;
    }
    if (part) {
      elements.push(
        <span 
          key={key++} 
          style={{ color: `#${currentColor}` }}
        >
          {part}
        </span>
      );
    }
  }

  return elements;
};

const getUpperTypesText = (upperTypes: number[]): string => {
  const allTypes = [0, 1, 2, 3, 4, 5];
  const missingTypes = allTypes.filter(type => !upperTypes.includes(type));
  const presentTypes = allTypes.filter(type => upperTypes.includes(type));
  
  if (missingTypes.length === 0) {
    return 'Todos';
  }
  
  if (missingTypes.length > 2 || missingTypes.includes(0)) {
    // eliminar baby classes (5,2)
    const presentTypesWithoutBaby = presentTypes.filter(type => type !== 5 && type !== 2);
    const presentNames = presentTypesWithoutBaby.map(type => UPPER_TYPES[type as keyof typeof UPPER_TYPES]);
    return `Únicamente ${presentNames.join(', ')}`;
  }
  
  const missingNames = missingTypes.map(type => UPPER_TYPES[type as keyof typeof UPPER_TYPES]);
  return `Todos excepto ${missingNames.join(', ')}`;
};

const Database = () => {
  const [activeTab, setActiveTab] = useState<TabType>('items');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchState, setSearchState] = useState<SearchState>({
    allMatchedIds: [],
    currentPage: 0,
    results: [],
    totalPages: 0
  });
  const [isOptionsVisible, setIsOptionsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [searchOptions, setSearchOptions] = useState<SearchOptions>({
    exactMatch: false,
    searchByDescription: false,
    searchByMap: false,
    includeMiniBoss: true,
    selectedTypes: []
  });
  const [localData, setLocalData] = useState<LocalData>({
    items: {},
    types: {},
    imageDescriptor: { icons: {}, illustrations: {} },
    searchIndex: null,
    nameDesc: {},
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

        handleInitialSearch();
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
    console.log(id, batchNumber);
    const batch = await loadImageBatch(batchNumber, type);
    
    return batch?.[id] || '/placeholder.png';
  };

  const processResults = async (ids: string[], page: number) => {
    const startIndex = page * RESULTS_PER_PAGE;
    const endIndex = Math.min(startIndex + RESULTS_PER_PAGE, ids.length);
    const paginatedIds = ids.slice(startIndex, endIndex);
    
    const results = await Promise.all(paginatedIds.map(async id => {
      const [icon, illustration] = await Promise.all([
        getImage(id, 'icons'),
        getImage(id, 'illustrations')
      ]);

      // Obtener el item base y los datos de nombre/descripción
      const itemData = localData.items[id] || {};
      const nameDescData = localData.nameDesc.find((item: any) => item.id === id);

      // Asegurarnos de que type sea un número
      const type = Number(itemData.type);
      return {
        id,
        type,
        ...itemData,
        name: nameDescData?.name || '',
        description: nameDescData?.description || '',
        icon,
        illustration,
        // Nuevos campos
        stack_amount: itemData.stack_amount,
        slots: itemData.slots,
        equip_level_min: itemData.equip_level_min,
        equip_level_max: itemData.equip_level_max,
        refinable: itemData.refinable,
        weapon_level: itemData.weapon_level,
        equip_locations: itemData.equip_locations,
        equip_upper: itemData.equip_upper,
        equip_jobs: itemData.equip_jobs
      };
    }));

    return results;
  };

  const handleInitialSearch = async () => {
    const initialIds = [] as string[];
    const results = await processResults(initialIds, 0);
    
    setSearchState({
      allMatchedIds: initialIds,
      currentPage: 0,
      results,
      totalPages: Math.ceil(initialIds.length / RESULTS_PER_PAGE)
    });
  };

  const searchItems = async (searchTerm: string, options: SearchOptions) => {
    let matchedIds: string[] = [];

    if (searchTerm.trim()) {
      const isNumericSearch = /^\d+$/.test(searchTerm.trim());

      if (isNumericSearch) {
        const id = searchTerm.trim();
        const itemType = Number(localData.items[id]?.type);
        if (localData.items[id] && !isNaN(itemType) && ITEM_TYPES[itemType as keyof typeof ITEM_TYPES]) {
          matchedIds = [id];
        }
      } else if (localData.searchIndex) {
        try {
          const searchResults = localData.searchIndex.search(searchTerm) as LunrSearchResult[];
          matchedIds = searchResults
            .sort((a, b) => b.score - a.score)
            .map(result => result.ref)
            .filter(id => {
              const itemType = Number(localData.items[id]?.type);
              return !isNaN(itemType) && ITEM_TYPES[itemType as keyof typeof ITEM_TYPES];
            });
        } catch (error) {
          console.error('Error en la búsqueda:', error);
        }
      }
    } else {
      matchedIds = Object.keys(localData.items).filter(id => {
        const itemType = Number(localData.items[id]?.type);
        return !isNaN(itemType) && ITEM_TYPES[itemType as keyof typeof ITEM_TYPES];
      });
    }

    if (options.selectedTypes.length > 0) {
      matchedIds = matchedIds.filter(id => 
        options.selectedTypes.includes(Number(localData.items[id].type))
      );
    }

    const totalPages = Math.ceil(matchedIds.length / RESULTS_PER_PAGE);
    const results = await processResults(matchedIds, 0);

    return {
      allMatchedIds: matchedIds,
      currentPage: 0,
      results,
      totalPages
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

  const handlePageChange = async (newPage: number) => {
    if (newPage < 0 || newPage >= searchState.totalPages) return;
    
    try {
      const results = await processResults(searchState.allMatchedIds, newPage);
      setSearchState(prev => ({
        ...prev,
        currentPage: newPage,
        results
      }));

      // Hacer scroll al inicio de la sección de resultados
      const resultsSection = document.querySelector('.results-section');
      if (resultsSection) {
        resultsSection.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    } catch (error) {
      console.error('Error al cambiar de página:', error);
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
                            Incluir descripción en la búsqueda
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
                                <span className="property-value">{`${result.atk || 'NA'}/${result.matk || 'NA'}`}</span>
                              </div>
                              <div className="result-card-property">
                                <span className="property-label">DEF</span>
                                <span className="property-value">{result.defence || 'NA'}</span>
                              </div>
                              <div className="result-card-property">
                                <span className="property-label">Precio</span>
                                <span className="property-value">{`${result.price_buy || 'NA'}/${result.price_sell || 'NA'}`}</span>
                              </div>
                              <div className="result-card-property">
                                <span className="property-label">Peso</span>
                                <span className="property-value">{result.weight || 'NA'}</span>
                              </div>
                            </div>
                          </div>
                          {Number(result.type) === 4 && (
                            <div className="result-card-section">
                              <div className="result-card-properties">
                                <div className="result-card-property">
                                  <span className="property-label">Slots</span>
                                  <span className="property-value">{result.slots || 0}</span>
                                </div>
                                <div className="result-card-property">
                                  <span className="property-label">Nivel Equip</span>
                                  <span className="property-value">{`${result.equip_level_min || 1}/${result.equip_level_max || 1}`}</span>
                                </div>
                                <div className="result-card-property">
                                  <span className="property-label">Refinable</span>
                                  <span className="property-value">{result.refinable ? 'Sí' : 'No'}</span>
                                </div>
                                <div className="result-card-property">
                                  <span className="property-label">Nivel Arma</span>
                                  <span className="property-value">{result.weapon_level || 1}</span>
                                </div>
                              </div>
                            </div>
                          )}
                          {Number(result.type) === 5 && (
                            <div className="result-card-section">
                              <div className="result-card-properties">
                                <div className="result-card-property">
                                  <span className="property-label">Slots</span>
                                  <span className="property-value">{result.slots || 0}</span>
                                </div>
                                <div className="result-card-property">
                                  <span className="property-label">Nivel Equip</span>
                                  <span className="property-value">{`${result.equip_level_min || 1}/${result.equip_level_max || 1}`}</span>
                                </div>
                                <div className="result-card-property">
                                  <span className="property-label">Refinable</span>
                                  <span className="property-value">{result.refinable ? 'Sí' : 'No'}</span>
                                </div>
                                <div className="result-card-property" title={result.equip_locations ? getEquipLocationsText(result.equip_locations) : ''}>
                                  <span className="property-label">Ubicación</span>
                                  <span className="property-value">{result.equip_locations ? getEquipLocationsText(result.equip_locations) : 'NA'}</span>
                                </div>
                              </div>
                            </div>
                          )}
                          {(Number(result.type) === 4 || Number(result.type) === 5) && (
                            <div className="result-card-section">
                              <div className="result-card-jobs">
                                <div className="result-card-property">
                                  <span className="property-label">Jobs</span>
                                  <span className="property-value">
                                    {result.equip_jobs && result.equip_jobs.length > 0 
                                      ? result.equip_jobs.map(job => getJobName(job)).join(', ')
                                      : 'Todos'}
                                  </span>
                                </div>
                                <div className="result-card-property">
                                  <span className="property-label">Grupos</span>
                                  <span className="property-value">
                                    {result.equip_upper?.length ? getUpperTypesText(result.equip_upper) : 'Todos'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                          {result.description && (
                            <div className="result-card-section">
                              <div className="result-card-description-header">Descripción:</div>
                              <div className="result-card-description">
                                <div className="result-card-description-content">
                                  {processColoredText(result.description)}
                                </div>
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
                {searchState.totalPages > 1 && (
                  <div className="pagination">
                    <button 
                      onClick={() => handlePageChange(0)}
                      disabled={searchState.currentPage === 0}
                      className="pagination-button"
                    >
                      {'<<'}
                    </button>
                    <button 
                      onClick={() => handlePageChange(searchState.currentPage - 1)}
                      disabled={searchState.currentPage === 0}
                      className="pagination-button"
                    >
                      {'<'}
                    </button>
                    <span className="pagination-info">
                      Página {searchState.currentPage + 1} de {searchState.totalPages}
                    </span>
                    <button 
                      onClick={() => handlePageChange(searchState.currentPage + 1)}
                      disabled={searchState.currentPage === searchState.totalPages - 1}
                      className="pagination-button"
                    >
                      {'>'}
                    </button>
                    <button 
                      onClick={() => handlePageChange(searchState.totalPages - 1)}
                      disabled={searchState.currentPage === searchState.totalPages - 1}
                      className="pagination-button"
                    >
                      {'>>'}
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