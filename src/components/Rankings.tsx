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
  total_diamonds: number;
  total_mvp_cards: number;
  total_zeny: number;
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
  byClass: Record<string, Character[]>;
  overall: Character[];
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
    return account.total_zeny + (account.total_diamonds * 500000000);
  };

  const renderZenyRanking = () => {
    if (!rankingData?.accounts) return null;
    const sortedAccounts = [...rankingData.accounts]
      .sort((a, b) => calculateTotalZeny(b) - calculateTotalZeny(a))
      .slice(0, 10)
      .filter(account => calculateTotalZeny(account) > 0);

    return (
      <div className="ranking-list">
        <h3>Top 10 - Zeny Total</h3>
        {sortedAccounts.map((account, index) => (
          <div key={account.account_id} className="ranking-item">
            <span className="rank">{index + 1}</span>
            <span className="name">{account.userid}</span>
            <span className="value">{calculateTotalZeny(account).toLocaleString()} z</span>
          </div>
        ))}
      </div>
    );
  };

  const renderCardsRanking = () => {
    if (!rankingData?.accounts) return null;
    const sortedAccounts = [...rankingData.accounts]
      .sort((a, b) => b.total_cards - a.total_cards)
      .slice(0, 10)
      .filter(account => account.total_cards > 0);

    return (
      <div className="ranking-list">
        <h3>Top 10 - Total de Cartas</h3>
        {sortedAccounts.map((account, index) => (
          <div key={account.account_id} className="ranking-item">
            <span className="rank">{index + 1}</span>
            <span className="name">{account.userid}</span>
            <span className="value">{account.total_cards}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderMvpCardsRanking = () => {
    if (!rankingData?.accounts) return null;
    const sortedAccounts = [...rankingData.accounts]
      .sort((a, b) => b.total_mvp_cards - a.total_mvp_cards)
      .slice(0, 10)
      .filter(account => account.total_mvp_cards > 0);

    return (
      <div className="ranking-list">
        <h3>Top 10 - Cartas MVP</h3>
        {sortedAccounts.map((account, index) => (
          <div key={account.account_id} className="ranking-item">
            <span className="rank">{index + 1}</span>
            <span className="name">{account.userid}</span>
            <span className="value">{account.total_mvp_cards}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderLoginRanking = () => {
    if (!rankingData?.accounts) return null;
    const sortedAccounts = [...rankingData.accounts]
      .sort((a, b) => b.logincount - a.logincount)
      .slice(0, 10)
      .filter(account => account.logincount > 0);

    return (
      <div className="ranking-list">
        <h3>Top 10 - Login Count</h3>
        {sortedAccounts.map((account, index) => (
          <div key={account.account_id} className="ranking-item">
            <span className="rank">{index + 1}</span>
            <span className="name">{account.userid}</span>
            <span className="value">{account.logincount}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderFameRanking = () => {
    if (!rankingData?.byClass) return null;
    
    return Object.entries(rankingData.byClass).map(([classId, characters]) => {
      const sortedCharacters = [...characters]
        .sort((a, b) => b.fame - a.fame)
        .slice(0, 10)
        .filter(char => char.fame > 0);

      if (sortedCharacters.length === 0) return null;

      return (
        <div key={classId} className="ranking-list">
          <h3>Top 10 Fame - Clase {classId}</h3>
          {sortedCharacters.map((char, index) => (
            <div key={char.name} className="ranking-item">
              <span className="rank">{index + 1}</span>
              <span className="name">{char.name} ({char.userid})</span>
              <span className="value">{char.fame}</span>
            </div>
          ))}
        </div>
      );
    });
  };

  const renderBaseExpRanking = () => {
    if (!rankingData?.overall) return null;
    const sortedCharacters = [...rankingData.overall]
      .sort((a, b) => b.base_exp - a.base_exp)
      .slice(0, 10)
      .filter(char => char.base_exp > 0);

    return (
      <div className="ranking-list">
        <h3>Top 10 - Base Experience</h3>
        {sortedCharacters.map((char, index) => (
          <div key={char.name} className="ranking-item">
            <span className="rank">{index + 1}</span>
            <span className="name">
              {char.name} ({char.userid}) - Nivel {char.base_level} Clase {char.class}
            </span>
            <span className="value">{char.base_exp.toLocaleString()}</span>
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
            MVP
          </button>
          <button 
            className={activeTab === 'login' ? 'active' : ''} 
            onClick={() => setActiveTab('login')}
          >
            Login
          </button>
          <button 
            className={activeTab === 'fame' ? 'active' : ''} 
            onClick={() => setActiveTab('fame')}
          >
            Fame
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