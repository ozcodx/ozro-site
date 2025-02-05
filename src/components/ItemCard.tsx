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

const JOBS = {
  0: "Novice",
  1: "Swordman",
  2: "Magician",
  3: "Archer",
  4: "Acolyte",
  5: "Merchant",
  6: "Thief",
  7: "Knight",
  8: "Priest",
  9: "Wizard",
  10: "Blacksmith",
  11: "Hunter",
  12: "Assassin",
  13: "Unused",
  14: "Crusader",
  15: "Monk",
  16: "Sage",
  17: "Rogue",
  18: "Alchemist",
  19: "Bard/Dancer",
  20: "Unused",
  21: "Taekwon",
  22: "Star Gladiator",
  23: "Soul Linker",
  24: "Gunslinger",
  25: "Ninja",
  26: "Gangsi",
  27: "Death Knight",
  28: "Dark Collector",
  29: "Kagerou/Oboro",
  30: "Rebellion",
  31: "Summoner"
} as const;

const UPPER_TYPES = {
  0: "Normal jobs",
  1: "Trascended jobs",
  2: "Baby jobs",
  3: "Third jobs",
  4: "Trascended Third jobs",
  5: "Baby Third jobs"
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

const EQUIP_LOCATIONS = {
  0: "Lower Headgear",
  1: "Weapon",
  2: "Garment",
  3: "Accessory 1",
  4: "Armor",
  5: "Shield",
  6: "Both Hands",
  7: "Footgear",
  8: "Accessory 2",
  9: "Upper Headgear",
  10: "Middle Headgear",
  11: "Costume Top Headgear",
  12: "Costume Mid Headgear",
  13: "Costume Low Headgear",
  14: "Costume Garment/Robe",
  15: "Ammunition",
  16: "Shadow Armor",
  17: "Shadow Weapon",
  18: "Shadow Shield",
  19: "Shadow 2H Weapon",
  20: "Shadow Shoes",
  21: "Shadow Accessory 2",
  22: "Shadow Accessory 1",
  23: "Shadow Accessories",
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

const getUpperTypesText = (upperTypes: number[]): string => {
  const allTypes = [0, 1, 2, 3, 4, 5];
  const missingTypes = allTypes.filter(type => !upperTypes.includes(type));
  const presentTypes = allTypes.filter(type => upperTypes.includes(type));
  
  if (missingTypes.length === 0) {
    return 'Todos';
  }
  
  if (missingTypes.length > 2 || missingTypes.includes(0)) {
    const presentTypesWithoutBaby = presentTypes.filter(type => type !== 5 && type !== 2);
    const presentNames = presentTypesWithoutBaby.map(type => UPPER_TYPES[type as keyof typeof UPPER_TYPES]);
    return `Únicamente ${presentNames.join(', ')}`;
  }
  
  const missingNames = missingTypes.map(type => UPPER_TYPES[type as keyof typeof UPPER_TYPES]);
  return `Todos excepto ${missingNames.join(', ')}`;
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

interface ItemCardProps {
  result: SearchResult;
}

const ItemCard: React.FC<ItemCardProps> = ({ result }) => {
  return (
    <div className="result-card">
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
  );
};

export default ItemCard;
export type { SearchResult };
export {ITEM_TYPES};