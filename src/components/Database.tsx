import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ItemCard, { SearchResult, ITEM_TYPES } from './ItemCard';
import MobCard, { MobResult, MOB_SIZE, MOB_ELEMENTS, MOB_RACES } from './MobCard';
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
  selectedTypes: number[];
  selectedElements: number[];
  selectedRaces: number[];
  selectedSizes: number[];
  showBoss: boolean;
  showNormal: boolean;
  showMvp: boolean;
}

interface SearchState {
  allMatchedIds: string[];
  currentPage: number;
  results: (SearchResult | MobResult)[];
  totalPages: number;
}

interface ImageDescriptor {
  icons: { [key: string]: number };
  illustrations: { [key: string]: number };
}

interface MobImageDescriptor {
  [key: string]: number;
}

interface LocalData {
  items: { [key: string]: any };
  mobs: { [key: string]: any };
  types: { [key: string]: string[] };
  imageDescriptor: ImageDescriptor;
  mobImageDescriptor: MobImageDescriptor;
  searchIndex: lunr.Index | null;
  mobSearchIndex: lunr.Index | null;
  nameDesc: { [key: string]: any };
  iconBatches: { [key: number]: { [key: string]: string } };
  illustrationBatches: { [key: number]: { [key: string]: string } };
  mobSpriteBatches: { [key: number]: { [key: string]: string } };
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
    selectedTypes: [],
    selectedElements: [],
    selectedRaces: [],
    selectedSizes: [],
    showBoss: true,
    showNormal: true,
    showMvp: true
  });
  const [localData, setLocalData] = useState<LocalData>({
    items: {},
    mobs: {},
    types: {},
    imageDescriptor: { icons: {}, illustrations: {} },
    mobImageDescriptor: {},
    searchIndex: null,
    mobSearchIndex: null,
    nameDesc: {},
    iconBatches: {},
    illustrationBatches: {},
    mobSpriteBatches: {}
  });
  const searchOptionsRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const [initialSearchDone, setInitialSearchDone] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [
          itemsResponse,
          mobsResponse,
          typesResponse,
          imageDescriptorResponse,
          mobImageDescriptorResponse,
          searchIndexResponse,
          mobSearchIndexResponse,
          nameDescResponse
        ] = await Promise.all([
          fetch('/data/items.json'),
          fetch('/data/mobs.json'),
          fetch('/data/types.json'),
          fetch('/data/images_descriptor.json'),
          fetch('/data/mob-images-descriptor.json'),
          fetch('/data/search-index.json'),
          fetch('/data/mob-search-index.json'),
          fetch('/data/namedesc.json')
        ]);

        const [
          items,
          mobs,
          types,
          imageDescriptor,
          mobImageDescriptor,
          searchIndexData,
          mobSearchIndexData,
          nameDesc
        ] = await Promise.all([
          itemsResponse.json(),
          mobsResponse.json(),
          typesResponse.json(),
          imageDescriptorResponse.json(),
          mobImageDescriptorResponse.json(),
          searchIndexResponse.json(),
          mobSearchIndexResponse.json(),
          nameDescResponse.json()
        ]);

        setLocalData({
          items,
          mobs,
          types,
          imageDescriptor,
          mobImageDescriptor,
          searchIndex: lunr.Index.load(searchIndexData),
          mobSearchIndex: lunr.Index.load(mobSearchIndexData),
          nameDesc,
          iconBatches: {},
          illustrationBatches: {},
          mobSpriteBatches: {}
        });

        await handleInitialSearch();
      } catch (error) {
        console.error('Error cargando datos iniciales:', error);
      }
    };

    loadInitialData();
  }, [location]);

  const loadImageBatch = async (batchNumber: number, type: 'icons' | 'illustrations' | 'sprites') => {
    const batchType = type === 'sprites' ? 'mobSpriteBatches' : type === 'icons' ? 'iconBatches' : 'illustrationBatches';
    const batchPrefix = type === 'sprites' ? 'mob_sprites' : type;

    if (!localData[batchType][batchNumber]) {
      try {
        const response = await fetch(`/data/${batchPrefix}_batch_${batchNumber}.json`);
        const batchData = await response.json();
        
        setLocalData(prev => ({
          ...prev,
          [batchType]: {
            ...prev[batchType],
            [batchNumber]: batchData
          }
        }));
        return batchData;
      } catch (error) {
        console.error(`Error cargando batch de ${type}:`, error);
        return null;
      }
    }
    return localData[batchType][batchNumber];
  };

  const getImage = async (id: string, type: 'icons' | 'illustrations' | 'sprites'): Promise<string> => {
    const descriptor = type === 'sprites' ? localData.mobImageDescriptor : localData.imageDescriptor[type === 'icons' ? 'icons' : 'illustrations'];
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
    
    if (activeTab === 'items') {
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
    } else {
      const results = await Promise.all(paginatedIds.map(async id => {
        const sprite = await getImage(id, 'sprites');
        const mobData = localData.mobs[id] || {};

        // Procesar los drops para incluir información del item
        const processedDrops = await Promise.all((mobData.drop || []).map(async (drop: any) => {
          const dropId = String(drop.id); // Convertir a string de forma segura
          const nameDescData = localData.nameDesc.find((item: any) => item.id === dropId);
          const icon = await getImage(dropId, 'icons');

          return {
            ...drop,
            itemName: nameDescData?.name || `Item #${dropId}`, // Fallback si no hay nombre
            itemIcon: icon
          };
        }));

        return {
          id,
          code_name: mobData.sprite,
          ...mobData,
          sprite,
          drop: processedDrops
        };
      }));

      return results;
    }
  };

  const handleInitialSearch = async () => {
    const initialIds = [] as string[];

    //load params
    const searchParams = new URLSearchParams(location.search);
    const mobId = searchParams.get('mob');
    const itemId = searchParams.get('item');
    
    //InitialSearchDone marks if the search by params has been done
    //this should be done only once
    if (!initialSearchDone){
      if (mobId) {
        setActiveTab('mobs');
        setSearchTerm(mobId);
      } else if (itemId) {
        setActiveTab('items');
        setSearchTerm(itemId);
      }
      setInitialSearchDone(true);
      }else{
        setSearchTerm('');
        // when tab changes, we need to clear the view
        const results = await processResults(initialIds, 0);
        
        setSearchState({
            allMatchedIds: initialIds,
            currentPage: 0,
            results,
            totalPages: Math.ceil(initialIds.length / RESULTS_PER_PAGE)
        });
      }
    };

    useEffect(() => {
      const performInitialSearch = async () => {
        if (initialSearchDone && searchTerm) {
          const searchResult = await searchItems(searchTerm, searchOptions);
          setSearchState(searchResult);
        }
      };
  
      performInitialSearch();
    }, [initialSearchDone]); // Dependencias en searchTerm y initialSearchDone

  const searchItems = async (searchTerm: string, options: SearchOptions) => {
    let matchedIds: string[] = [];

    if (searchTerm.trim()) {
      const isNumericSearch = /^\d+$/.test(searchTerm.trim());
      const searchIndex = activeTab === 'items' ? localData.searchIndex : localData.mobSearchIndex;
      const dataSource = activeTab === 'items' ? localData.items : localData.mobs;

      if (isNumericSearch) {
        const id = searchTerm.trim();
        if (dataSource[id]) {
          matchedIds = [id];
        }
      } else if (searchIndex) {
        try {
          const searchResults = searchIndex.search(searchTerm) as LunrSearchResult[];
          matchedIds = searchResults
            .sort((a, b) => b.score - a.score)
            .map(result => result.ref);
        } catch (error) {
          console.error('Error en la búsqueda:', error);
        }
      }
    } else {
      matchedIds = Object.keys(activeTab === 'items' ? localData.items : localData.mobs);
    }

    // Filtrar los IDs para asegurarse de que solo se incluyan los que están en localData.items
    if (activeTab === 'items') {
      matchedIds = matchedIds.filter(id => localData.items[id]);
    }

    if (activeTab === 'items' && options.selectedTypes.length > 0) {
      matchedIds = matchedIds.filter(id => 
        options.selectedTypes.includes(Number(localData.items[id].type))
      );
    } else if (activeTab === 'mobs') {
      const mobs = localData.mobs;
      
      // Filtrar por tipo de monstruo (normal/boss/mvp)
      matchedIds = matchedIds.filter(id => {
        const isBoss = mobs[id].mode?.includes(5);
        const isMvp = mobs[id].mexp > 0;
        const isNormal = !isBoss;

        return (
          (options.showNormal && isNormal) ||
          (options.showBoss && isBoss && !isMvp) ||
          (options.showMvp && isMvp)
        );
      });

      // Filtrar por elemento
      if (options.selectedElements.length > 0) {
        matchedIds = matchedIds.filter(id => {
          const elementLevel = Math.floor(mobs[id].element / 20) + 1;
          const elementId = mobs[id].element - ((elementLevel - 1) * 20);
          return options.selectedElements.includes(elementId);
        });
      }

      // Filtrar por raza
      if (options.selectedRaces.length > 0) {
        matchedIds = matchedIds.filter(id => 
          options.selectedRaces.includes(mobs[id].race)
        );
      }

      // Filtrar por tamaño
      if (options.selectedSizes.length > 0) {
        matchedIds = matchedIds.filter(id => 
          options.selectedSizes.includes(Number(mobs[id].size))
        );
      }
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

  const handleTypeToggle = (type: number) => {
    setSearchOptions(prev => ({
      ...prev,
      selectedTypes: prev.selectedTypes.includes(type)
        ? prev.selectedTypes.filter(t => t !== type)
        : [...prev.selectedTypes, type]
    }));
  };

  const handleElementToggle = (element: number) => {
    setSearchOptions(prev => ({
      ...prev,
      selectedElements: prev.selectedElements.includes(element)
        ? prev.selectedElements.filter(e => e !== element)
        : [...prev.selectedElements, element]
    }));
  };

  const handleRaceToggle = (race: number) => {
    setSearchOptions(prev => ({
      ...prev,
      selectedRaces: prev.selectedRaces.includes(race)
        ? prev.selectedRaces.filter(r => r !== race)
        : [...prev.selectedRaces, race]
    }));
  };

  const handleSizeToggle = (size: number) => {
    setSearchOptions(prev => ({
      ...prev,
      selectedSizes: prev.selectedSizes.includes(size)
        ? prev.selectedSizes.filter(s => s !== size)
        : [...prev.selectedSizes, size]
    }));
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchTerm('');
    setSearchOptions({
      selectedTypes: [],
      selectedElements: [],
      selectedRaces: [],
      selectedSizes: [],
      showBoss: true,
      showNormal: true,
      showMvp: true
    });
    handleInitialSearch();
  };

  return (
    <div className="database">
      <Header />
      <div className="database-content">
        <div className="database-tabs">
          <button 
            className={`tab-button ${activeTab === 'items' ? 'active' : ''}`}
            onClick={() => handleTabChange('items')}
          >
            Base de Datos de Objetos
          </button>
          <button 
            className={`tab-button ${activeTab === 'mobs' ? 'active' : ''}`}
            onClick={() => handleTabChange('mobs')}
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
                    {activeTab === 'items' ? (
                      <>
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
                        <div className="search-types">
                          <div className="search-types-title">Tipo de monstruo:</div>
                          <div className="search-types-grid">
                            <label className="type-checkbox">
                              <input
                                type="checkbox"
                                checked={searchOptions.showNormal}
                                onChange={() => setSearchOptions(prev => ({...prev, showNormal: !prev.showNormal}))}
                              />
                              Monstruos Normales
                            </label>
                            <label className="type-checkbox">
                              <input
                                type="checkbox"
                                checked={searchOptions.showBoss}
                                onChange={() => setSearchOptions(prev => ({...prev, showBoss: !prev.showBoss}))}
                              />
                              Monstruos Boss
                            </label>
                            <label className="type-checkbox">
                              <input
                                type="checkbox"
                                checked={searchOptions.showMvp}
                                onChange={() => setSearchOptions(prev => ({...prev, showMvp: !prev.showMvp}))}
                              />
                              Monstruos MVP
                            </label>
                          </div>
                        </div>
                        <div className="search-types">
                          <div className="search-types-title">Filtrar por elemento:</div>
                          <div className="search-types-grid">
                            {Object.entries(MOB_ELEMENTS).map(([elementId, elementName]) => (
                              <label key={elementId} className="type-checkbox">
                                <input
                                  type="checkbox"
                                  checked={searchOptions.selectedElements.includes(Number(elementId))}
                                  onChange={() => handleElementToggle(Number(elementId))}
                                />
                                {elementName}
                              </label>
                            ))}
                          </div>
                        </div>
                        <div className="search-types">
                          <div className="search-types-title">Filtrar por raza:</div>
                          <div className="search-types-grid">
                            {Object.entries(MOB_RACES).map(([raceId, raceName]) => (
                              <label key={raceId} className="type-checkbox">
                                <input
                                  type="checkbox"
                                  checked={searchOptions.selectedRaces.includes(Number(raceId))}
                                  onChange={() => handleRaceToggle(Number(raceId))}
                                />
                                {raceName}
                              </label>
                            ))}
                          </div>
                        </div>
                        <div className="search-types">
                          <div className="search-types-title">Filtrar por tamaño:</div>
                          <div className="search-types-grid">
                            {Object.entries(MOB_SIZE).map(([sizeId, sizeName]) => (
                              <label key={sizeId} className="type-checkbox">
                                <input
                                  type="checkbox"
                                  checked={searchOptions.selectedSizes.includes(Number(sizeId))}
                                  onChange={() => handleSizeToggle(Number(sizeId))}
                                />
                                {sizeName}
                              </label>
                            ))}
                          </div>
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
                    activeTab === 'items' ? (
                      <ItemCard key={result.id} result={result as SearchResult} />
                    ) : (
                      <MobCard key={result.id} result={result as MobResult} />
                    )
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
                  : 'Ingresa un término para buscar o selecciona un filtro'}
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