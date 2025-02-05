import { useState, useRef, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import ItemCard, { SearchResult, ITEM_TYPES } from './ItemCard';
import '../styles/Database.css';
// @ts-ignore
import lunr from 'lunr';

type TabType = 'items' | 'mobs';

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
    if (!descriptor || descriptor[id] === undefined) {
        return '/placeholder.png';
    }

    const batchNumber = descriptor[id];
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

      const itemData = localData.items[id] || {};
      const nameDescData = localData.nameDesc.find((item: any) => item.id === id);

      const type = Number(itemData.type);
      return {
        id,
        type,
        ...itemData,
        name: nameDescData?.name || '',
        description: nameDescData?.description || '',
        icon,
        illustration
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
        if (localData.items[id] && !isNaN(itemType)) {
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
              return !isNaN(itemType);
            });
        } catch (error) {
          console.error('Error en la búsqueda:', error);
        }
      }
    } else {
      matchedIds = Object.keys(localData.items).filter(id => {
        const itemType = Number(localData.items[id]?.type);
        return !isNaN(itemType);
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
                    <ItemCard key={result.id} result={result} />
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