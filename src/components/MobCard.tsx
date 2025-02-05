import { ReactElement } from 'react';

interface MobDrop {
  id: number;
  type: 'normal' | 'card' | 'mvp';
  per: number;
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
}

const MOB_SIZE = {
  0: "Small",
  1: "Medium",
  2: "Large"
} as const;

const MOB_MODES = {
  0: "CANMOVE",
  1: "LOOTER",
  2: "AGGRESSIVE",
  3: "ASSIST",
  4: "CASTSENSOR_IDLE",
  5: "BOSS",
  6: "PLANT",
  7: "CANATTACK",
  8: "DETECTOR",
  9: "CASTSENSOR_CHASE",
  10: "CHANGECHASE",
  11: "ANGRY",
  12: "CHANGETARGET_MELEE",
  13: "CHANGETARGET_CHASE",
  14: "TARGETWEAK",
  15: "NOKNOCKBACK",
  16: "RANDOMTARGET",
} as const;

const MOB_RACES = {
  0: "Amorfo",
  1: "No-Muerto",
  2: "Bruto",
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
  7: "Sombra",
  8: "Fantasma",
  9: "No-Muerto"
} as const;

const getSizeName = (size: number): string => {
  return MOB_SIZE[size as keyof typeof MOB_SIZE] || `Unknown (${size})`;
};

const getModeNames = (modes: number[]): string[] => {
  return modes.map(mode => MOB_MODES[mode as keyof typeof MOB_MODES] || `Unknown (${mode})`);
};

const getRaceName = (race: number): string => {
  return MOB_RACES[race as keyof typeof MOB_RACES] || `Unknown (${race})`;
};

const getElementName = (element: number): string => {
  return MOB_ELEMENTS[element as keyof typeof MOB_ELEMENTS] || `Unknown (${element})`;
};

interface MobCardProps {
  result: MobResult;
}

const MobCard: React.FC<MobCardProps> = ({ result }) => {
  return (
    <div className="result-card">
      <div className="result-card-content">
        <div className="result-card-image">
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
                    <span className="name-title">{result.name}</span>
                    {' '}
                    <span className="name-details">
                      [{result.name2}]
                    </span>
                    {' '}
                    <span className="result-card-id">(#{result.id})</span>
                  </h3>
                  <span className="mob-type">
                    Nivel {result.lvl} - {getSizeName(result.size)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="result-card-section">
            <div className="result-card-properties">
              <div className="result-card-property">
                <span className="property-label">HP</span>
                <span className="property-value">{result.hp || 'NA'}</span>
              </div>
              <div className="result-card-property">
                <span className="property-label">Base/Job EXP</span>
                <span className="property-value">{`${result.exp || 'NA'}/${result.jexp || 'NA'}`}</span>
              </div>
              <div className="result-card-property">
                <span className="property-label">MVP EXP</span>
                <span className="property-value">{result.mexp || 'NA'}</span>
              </div>
              <div className="result-card-property">
                <span className="property-label">DEF/MDEF</span>
                <span className="property-value">{`${result.def || 'NA'}/${result.mdef || 'NA'}`}</span>
              </div>
            </div>
          </div>
          <div className="result-card-section">
            <div className="result-card-properties">
              <div className="result-card-property">
                <span className="property-label">STR/AGI/VIT</span>
                <span className="property-value">{`${result.str || 'NA'}/${result.agi || 'NA'}/${result.vit || 'NA'}`}</span>
              </div>
              <div className="result-card-property">
                <span className="property-label">INT/DEX/LUK</span>
                <span className="property-value">{`${result.int || 'NA'}/${result.dex || 'NA'}/${result.luk || 'NA'}`}</span>
              </div>
              <div className="result-card-property">
                <span className="property-label">ATK</span>
                <span className="property-value">{result.atk || 'NA'}</span>
              </div>
            </div>
          </div>
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
            </div>
          </div>
          {result.drop && result.drop.length > 0 && (
            <div className="result-card-section">
              <div className="result-card-drops">
                <div className="result-card-drops-header">Drops:</div>
                <div className="result-card-drops-grid">
                  {result.drop.map((drop, index) => (
                    <div key={`${drop.id}-${index}`} className="result-card-drop">
                      <span className={`drop-type ${drop.type}`}>{drop.type}</span>
                      <span className="drop-id">#{drop.id}</span>
                      <span className="drop-chance">{drop.per}%</span>
                    </div>
                  ))}
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
export { MOB_SIZE, MOB_MODES }; 