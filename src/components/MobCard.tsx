interface MobDrop {
  id: number;
  type: 'normal' | 'card' | 'mvp';
  per: number;
  itemName: string;
  itemIcon: string;
}

interface MobResult {
  id: string;
  name: string;
  name2: string;
  sprite: string;
  hp: number;
  lvl: number;
  def: number;
  mdef: number;
  atk: number;
  str: number;
  agi: number;
  vit: number;
  int: number;
  dex: number;
  luk: number;
  exp: number;
  jexp: number;
  mexp: number;
  element: number;
  size: number;
  race: number;
  drop: MobDrop[];
  mode?: number[];
  code_name?: string;
}

const MOB_SIZE = {
  0: "Pequeño",
  1: "Mediano",
  2: "Grande"
} as const;


const MOB_MODES = {
  0: "CANMOVE",
  1: "LOOTER",
  2: "AGGRESSIVE",
  3: "ASSIST",
  4: "CASTSENSOR",
  5: "BOSS",
  6: "PLANT",
  7: "CANATTACK",
  8: "DETECTOR",
  //9: "CASTSENSOR_CHASE",
  10: "CHANGECHASE",
  //11: "ANGRY",
  //12: "CHANGETARGET_MELEE",
  //13: "CHANGETARGET_CHASE",
  //14: "TARGETWEAK",
  15: "NOKNOCKBACK",
  //16: "RANDOMTARGET",
} as const;

const MOB_RACES = {
  0: "Amorfo",
  1: "No-Muerto",
  2: "Bestia",
  3: "Planta",
  4: "Insecto",
  5: "Pez",
  6: "Demonio",
  7: "Humanoide",
  8: "Angel",
  9: "Dragón"
} as const;

const MOB_ELEMENTS = {
  0: "Neutral",
  1: "Agua",
  2: "Tierra",
  3: "Fuego",
  4: "Viento",
  5: "Veneno",
  6: "Sagrado",
  7: "Oscuridad",
  8: "Fantasma",
  9: "No-Muerto"
} as const;

const getSizeName = (size: number): string => {
  return MOB_SIZE[size as keyof typeof MOB_SIZE] || `Unknown (${size})`;
};

const getRaceName = (race: number): string => {
  return MOB_RACES[race as keyof typeof MOB_RACES] || `Unknown (${race})`;
};

const getElementName = (element: number): string => {
  const level = Math.floor(element / 20) + 1;
  const elementId = element - ((level - 1) * 20);
  return `${MOB_ELEMENTS[elementId as keyof typeof MOB_ELEMENTS]} ${level}` || `Unknown (${element})`;
};

interface MobCardProps {
  result: MobResult;
}

const MobCard: React.FC<MobCardProps> = ({ result }) => {
  return (
    <div className="result-card">
      <div className="result-card-content">
        <div className="result-card-image">
            {result.mexp > 0 && (
            <div className="mvp-icon">
              <img src="/icons/mvp.gif" alt="MVP" />
            </div>
            )}
            <img 
            src={result.sprite || '/placeholder.png'}
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
              <div className="title-container">
                <div className="title-row">
                  <h3>
                    <span className="name-title"><a href={`/database?mob=${result.id}`}>{result.name}</a></span>
                    {' '}
                    <span className="name-details">
                      [{result.name2} / {result.code_name}]
                    </span>
                    {' '}
                    <span className="result-card-id">(#{result.id})</span>
                  </h3>
                  <span className="mob-level">
                    Nivel {result.lvl}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Primera fila: HP, ATK, DEF/MDEF */}
          <div className="result-card-section">
            <div className="result-card-properties">
              <div className="result-card-property">
                <span className="property-label">HP</span>
                <span className="property-value">{result.hp || 'NA'}</span>
              </div>
              <div className="result-card-property">
                <span className="property-label">ATK</span>
                <span className="property-value">{result.atk || 'NA'}</span>
              </div>
              <div className="result-card-property">
                <span className="property-label">DEF/MDEF</span>
                <span className="property-value">{`${result.def || 'NA'}/${result.mdef || 'NA'}`}</span>
              </div>
            </div>
          </div>

          {/* Nueva fila: Base EXP, Job EXP, MVP EXP */}
          <div className="result-card-section">
            <div className="result-card-properties">
              <div className="result-card-property">
                <span className="property-label">Base EXP</span>
                <span className="property-value">{result.exp?.toLocaleString() || 'NA'}</span>
              </div>
              <div className="result-card-property">
                <span className="property-label">Job EXP</span>
                <span className="property-value">{result.jexp?.toLocaleString() || 'NA'}</span>
              </div>
              {result.mexp > 0 && (
                <div className="result-card-property">
                  <span className="property-label">MVP EXP</span>
                  <span className="property-value">{result.mexp.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Segunda fila: Raza, Elemento, Tamaño */}
          <div className="result-card-section">
            <div className="result-card-properties">
              <div className="result-card-property">
                <span className="property-label">Raza</span>
                <span className="property-value">{getRaceName(result.race)}</span>
              </div>
              <div className="result-card-property">
                <span className="property-label">Elemento</span>
                <span className="property-value">{getElementName(result.element)}</span>
              </div>
              <div className="result-card-property">
                <span className="property-label">Tamaño</span>
                <span className="property-value">{getSizeName(result.size)}</span>
              </div>
            </div>
          </div>

          {/* Tercera fila: Stats y Modos */}
          <div className="result-card-section stats-modes-grid">
            <div className="result-card-stats">
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">STR</span>
                  <span className="stat-value">{result.str || 'NA'}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">AGI</span>
                  <span className="stat-value">{result.agi || 'NA'}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">VIT</span>
                  <span className="stat-value">{result.vit || 'NA'}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">INT</span>
                  <span className="stat-value">{result.int || 'NA'}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">DEX</span>
                  <span className="stat-value">{result.dex || 'NA'}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">LUK</span>
                  <span className="stat-value">{result.luk || 'NA'}</span>
                </div>
              </div>
            </div>
            <div className="result-card-modes">
              <div className="modes-grid">
              {Object.entries(MOB_MODES)
                .map(([modeId, modeName]) => ({
                  id: modeId,
                  name: modeName,
                  isActive: result.mode?.includes(Number(modeId))
                }))
                .sort((a, b) => (b.isActive ? 1 : 0) - (a.isActive ? 1 : 0))
                .map(({ id, name, isActive }) => (
                  <div key={id} className={`mode-item ${isActive ? 'mode-item-active' : ''}`}>
                    <span>{name} :</span><strong> {isActive ? 'SI' : 'NO'}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>



          {result.drop && result.drop.filter(d => d.per > 0).length > 0 && (
            <div className="result-card-section">
              <div className="result-card-drops">
                <div className="result-card-drops-grid normal-drops">
                  {result.drop
                    .filter(d => d.per > 0)
                    .map((drop, index) => {
                      // Convertir el nombre a Title Case y truncar si es necesario
                      const formattedName = drop.itemName
                        .split(' ')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                        .join(' ');
                      
                      const truncatedName = formattedName.length > 20 
                        ? formattedName.substring(0, 20) + '...'
                        : formattedName;
                      
                      return (
                        <div key={`${drop.id}-${index}`} className={`result-card-drop ${drop.type}`}>
                          <img 
                            src={drop.itemIcon || '/placeholder.png'}
                            alt={formattedName}
                            className="drop-icon"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder.png';
                            }}
                          />
                          <span className="drop-name">
                            <a href={`/database?item=${drop.id}`}>{truncatedName}</a>{drop.type === 'mvp' ? ' (MVP)' : ''}
                          </span>
                          <span className="drop-chance">
                            {(Math.min(drop.per, 1000) / 10).toFixed(1)}%
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobCard;
export type { MobResult };
export { MOB_SIZE, MOB_MODES, MOB_ELEMENTS, MOB_RACES }; 