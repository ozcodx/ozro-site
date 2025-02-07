import { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import '../styles/Rankings.css';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

// Tipos de datos
interface Account {
  account_id: number;
  logincount: number;
  total_cards: number;
  total_cards_distinct: number;
  total_diamonds: number;
  total_mvp_cards: number;
  total_boss_cards: number;
  total_zeny: string;
  userid: string;

}

interface Character {
  account_id: number;
  base_exp: number;
  base_level: number;
  class?: number;
  fame: number;
  job_exp: number;
  name: string;
  userid: string;
}

interface RankingData {
  accounts: Account[];
  characters: Character[];
}

const CLASSES = {
  0: "Novice",
  1: "Swordman",
  2: "Mage",
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
  13: "Knight2",
  14: "Crusader",
  15: "Monk",
  16: "Sage",
  17: "Rogue",
  18: "Alchemist",
  19: "Bard",
  20: "Dancer",
  21: "Crusader2",
  22: "Wedding",
  23: "SuperNovice",
  24: "Gunslinger",
  25: "Ninja",
  26: "Xmas",
  27: "Summer",

  4001: "High_Novice",
  4002: "High_Swordman",
  4003: "High_Mage",
  4004: "High_Archer",
  4005: "High_Acolyte",
  4006: "High_Merchant",
  4007: "High_Thief",
  4008: "Lord_Knight",
  4009: "High_Priest",
  4010: "High_Wizard",
  4011: "Whitesmith",
  4012: "Sniper",
  4013: "Assassin_Cross",
  4014: "Lord_Knight2",
  4015: "Paladin",
  4016: "Champion",
  4017: "Professor",
  4018: "Stalker",
  4019: "Creator",
  4020: "Clown",
  4021: "Gypsy",
  4022: "Paladin2",

  4023: "Baby",
  4024: "Baby_Swordman",
  4025: "Baby_Mage",
  4026: "Baby_Archer",
  4027: "Baby_Acolyte",
  4028: "Baby_Merchant",
  4029: "Baby_Thief",
  4030: "Baby_Knight",
  4031: "Baby_Priest",
  4032: "Baby_Wizard",
  4033: "Baby_Blacksmith",
  4034: "Baby_Hunter",
  4035: "Baby_Assassin",
  4036: "Baby_Knight2",
  4037: "Baby_Crusader",
  4038: "Baby_Monk",
  4039: "Baby_Sage",
  4040: "Baby_Rogue",

  4041: "Baby_Alchemist",
  4042: "Baby_Bard",
  4043: "Baby_Dancer",
  4044: "Baby_Crusader2",
  4045: "Super_Baby",

  4046: "Taekwon",
  4047: "Star_Gladiator",
  4048: "Star_Gladiator2",
  4049: "Soul_Linker",

  4050: "Gangsi",
  4051: "Death_Knight",
  4052: "Dark_Collector",

  4054: "Rune_Knight",
  4055: "Warlock",
  4056: "Ranger",
  4057: "Arch_Bishop",
  4058: "Mechanic",
  4059: "Guillotine_Cross",

  4060: "Rune_Knight_Trascended",
  4061: "Warlock_Trascended",
  4062: "Ranger_Trascended",
  4063: "Arch_Bishop_Trascended",
  4064: "Mechanic_Trascended",

  4065: "Guillotine_Cross_Trascended",
  4066: "Royal_Guard",
  4067: "Sorcerer",
  4068: "Minstrel",
  4069: "Wanderer",
  4070: "Sura",
  4071: "Genetic",
  4072: "Shadow_Chaser",

  4073: "Royal_Guard_Trascended",
  4074: "Sorcerer_Trascended",
  4075: "Minstrel_Trascended",
  4076: "Wanderer_Trascended",
  4077: "Sura_Trascended",
  4078: "Genetic_Trascended",
  4079: "Shadow_Chaser_Trascended",

  4080: "Rune_Knight2",
  4081: "Rune_Knight_T2",
  4082: "Royal_Guard2",
  4083: "Royal_Guard_T2",
  4084: "Ranger2",
  4085: "Ranger_T2",
  4086: "Mechanic2",
  4087: "Mechanic_T2",

  4096: "Baby_Rune",
  4097: "Baby_Warlock",
  4098: "Baby_Ranger",
  4099: "Baby_Bishop",
  4100: "Baby_Mechanic",
  4101: "Baby_Cross",
  4102: "Baby_Guard",
  4103: "Baby_Sorcerer",
  4104: "Baby_Minstrel",
  4105: "Baby_Wanderer",
  4106: "Baby_Sura",
  4107: "Baby_Genetic",
  4108: "Baby_Chaser",

  4109: "Baby_Rune2",
  4110: "Baby_Guard2",
  4111: "Baby_Ranger2",
  4112: "Baby_Mechanic2",

  4190: "Super_Novice_E",
  4191: "Super_Baby_E",

  4211: "Kagerou",
  4212: "Oboro",
  4215: "Rebellion"
}

const Rankings = () => {
  const [activeTab, setActiveTab] = useState('zeny');
  const [rankingData, setRankingData] = useState<RankingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const rankingsRef = collection(db, 'rankings');
        const q = query(rankingsRef, orderBy('timestamp', 'desc'), limit(1));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const data = querySnapshot.docs[0].data() as RankingData;
          setRankingData(data);
        }
      } catch (error) {
        console.error('Error fetching rankings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, []);

  const calculateTotalZeny = (account: Account) => {
    return parseInt(account.total_zeny) + (account.total_diamonds * 500000000);
  };

  const toPlural = (str: string, count: number) => {
    return count == 1 ? str : str + 's';
  };


  const toTitleCase = (str: string) => {
    return str.toLowerCase().split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };


  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const formatClassName = (classId: number) => {
    const className = Object.entries(CLASSES).find(([id]) => parseInt(id) === classId)?.[1] || `Clase ${classId}`;
    return className.replace(/_/g, ' ').replace(/\d+/g, '').trim();
  };

  const renderZenyRanking = () => {
    if (!rankingData?.accounts) return null;
    const sortedAccounts = [...rankingData.accounts]
      .filter(account => !['admin', 'gamemaster'].includes(account.userid.toLowerCase()))
      .sort((a, b) => calculateTotalZeny(b) - calculateTotalZeny(a))
      .slice(0, 10)
      .filter(account => calculateTotalZeny(account) > 0);

    return (
      <div className="ranking-list">
        <h3>Zeny Total</h3>
        {sortedAccounts.map((account, index) => (
          <div key={account.account_id} className="ranking-item">
            <span className="rank">{index + 1}</span>
            <span className="name">{toTitleCase(account.userid)}</span>
            <span className="value">{formatNumber(calculateTotalZeny(account))} z</span>
            <span className="diamonds">{account.total_diamonds} diamantes</span>
          </div>
        ))}
      </div>
    );
  };

  const renderCardsRanking = () => {
    if (!rankingData?.accounts) return null;
    const sortedAccounts = [...rankingData.accounts]
      .filter(account => !['admin', 'gamemaster'].includes(account.userid.toLowerCase()))
      .sort((a, b) => b.total_cards_distinct - a.total_cards_distinct)
      .slice(0, 10)
      .filter(account => account.total_cards_distinct > 0);

    return (
      <div className="ranking-list">
        <h3>Total de Cartas</h3>
        {sortedAccounts.map((account, index) => (
          <div key={account.account_id} className="ranking-item">
            <span className="rank">{index + 1}</span>
            <span className="name">{toTitleCase(account.userid)}</span>
            <span className="class">{account.total_cards_distinct} {toPlural('Carta', account.total_cards_distinct)} {toPlural('Distinta', account.total_cards_distinct)}</span>
            <span className="class">{account.total_cards} {toPlural('Carta', account.total_cards)} en Total</span>
          </div>
        ))}
      </div>
    );
  };

  const renderMvpCardsRanking = () => {
    if (!rankingData?.accounts) return null;
    const sortedAccounts = [...rankingData.accounts]
      .filter(account => !['admin', 'gamemaster'].includes(account.userid.toLowerCase()))
      .sort((a, b) => (b.total_boss_cards - a.total_boss_cards) + (b.total_mvp_cards - a.total_mvp_cards)   )
      .slice(0, 10);

    return (
      <div className="ranking-list">
        <h3>Cartas de monstruos Boss</h3>
        {sortedAccounts.map((account, index) => (
          <div key={account.account_id} className="ranking-item">
            <span className="rank">{index + 1}</span>
            <span className="name">{toTitleCase(account.userid)}</span>
            <span className="class">{account.total_boss_cards} {toPlural('Carta', account.total_boss_cards)} Boss</span>
            <span className="class">{account.total_mvp_cards} {toPlural('Carta', account.total_mvp_cards)} MVP</span>
          </div>



        ))}
      </div>
    );
  };

  const renderLoginRanking = () => {
    if (!rankingData?.accounts) return null;
    const sortedAccounts = [...rankingData.accounts]
      .filter(account => !['admin', 'gamemaster'].includes(account.userid.toLowerCase()))
      .sort((a, b) => b.logincount - a.logincount)
      .slice(0, 10)
      .filter(account => account.logincount > 0);

    return (
      <div className="ranking-list">
        <h3>Conteo de Logins</h3>
        {sortedAccounts.map((account, index) => (
          <div key={account.account_id} className="ranking-item">
            <span className="rank">{index + 1}</span>
            <span className="name">{toTitleCase(account.userid)}</span>
            <span className="value">{formatNumber(account.logincount)} veces</span>
          </div>
        ))}
      </div>
    );
  };

  const renderFameRanking = () => {
    // get characters with fame > 0
    const characters = rankingData?.characters.filter(char => char.fame > 0).sort((a, b) => b.fame - a.fame) || [];
    // separate by class
    const byClass = characters.reduce((acc, char) => {
      const className = formatClassName(char.class || -1);
      acc[className] = [...(acc[className] || []), char];
      return acc;
    }, {} as Record<string, Character[]>);
    // sort by fame
    const sortedCharacters = Object.entries(byClass).map(([className, characters]) => {
      return {
        className,
        characters: characters.sort((a, b) => b.fame - a.fame)
      };
    });
    // render by class
    return sortedCharacters.map(({ className, characters }) => {
      if (characters.length === 0) return null;

      return (
        <div key={className} className="ranking-list">
          <h3>Fama como {className}</h3>
          {characters.map((char, index) => (

            <div key={char.name} className="ranking-item">
              <span className="rank">{index + 1}</span>

              <span className="name">{toTitleCase(char.name)} ({toTitleCase(char.userid)})</span>
              <span className="value">{formatNumber(char.fame)} Puntos</span>
            </div>
          ))}
        </div>
      );
    });
  };

  const renderBaseExpRanking = () => {
    if (!rankingData?.characters) return null;
    const sortedCharacters = [...rankingData.characters]
      .filter(char => !['admin', 'gamemaster'].includes(char.userid.toLowerCase()))
      .sort((a, b) => b.base_exp - a.base_exp)
      .slice(0, 10)
      .filter(char => char.base_exp > 0);

    return (
      <div className="ranking-list">
        <h3>Experiencia y Nivel</h3>
        {sortedCharacters.map((char, index) => (
          <div key={char.name} className="ranking-item">
            <span className="rank">{index + 1}</span>
            <span className="name">{toTitleCase(char.name)} ({toTitleCase(char.userid)})</span>
            <span className="class">{formatClassName(char.class || -1)}</span>
            <span className="level">Nivel {char.base_level}</span>
            <span className="value">{formatNumber(char.base_exp)}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="rankings">
      <Header />
      <div className="rankings-container">
        <div className="rankings-nav">
          <button 
            className={activeTab === 'zeny' ? 'active' : ''} 
            onClick={() => setActiveTab('zeny')}
          >
            Zeny
          </button>
          <button 
            className={activeTab === 'cards' ? 'active' : ''} 
            onClick={() => setActiveTab('cards')}
          >
            Cartas
          </button>
          <button 
            className={activeTab === 'mvp' ? 'active' : ''} 
            onClick={() => setActiveTab('mvp')}
          >
            Cartas Boss
          </button>
          <button 
            className={activeTab === 'login' ? 'active' : ''} 
            onClick={() => setActiveTab('login')}
          >
            Conexiones
          </button>
          <button 
            className={activeTab === 'fame' ? 'active' : ''} 
            onClick={() => setActiveTab('fame')}
          >
            Fama
          </button>
          <button 
            className={activeTab === 'exp' ? 'active' : ''} 
            onClick={() => setActiveTab('exp')}
          >
            Experiencia
          </button>
        </div>

        <div className="rankings-content">
          {loading ? (
            <div className="loading">Cargando rankings...</div>
          ) : (
            <>
              {activeTab === 'zeny' && renderZenyRanking()}
              {activeTab === 'cards' && renderCardsRanking()}
              {activeTab === 'mvp' && renderMvpCardsRanking()}
              {activeTab === 'login' && renderLoginRanking()}
              {activeTab === 'fame' && renderFameRanking()}
              {activeTab === 'exp' && renderBaseExpRanking()}
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Rankings; 