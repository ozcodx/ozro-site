import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import '../styles/Stats.css';

interface ServerData {
  accounts: {
    activeLastWeek: number;
    total: number;
  };
  characters: {
    activeLast24h: number;
    averageLevel: number;
    highestLevel: number;
    maxLevelCount: number;
  };
  economy: {
    averageZenyPerAccount: number;
    averageZenyPerChar: number;
    bankZeny: string;
    totalZeny: string;
  };
  guilds: {
    total: number;
  };
  timestamp: Timestamp;
}

const Stats = () => {
  const [serverData, setServerData] = useState<ServerData | null>(null);

  const formatTimestamp = (timestamp: Timestamp) => {
    const date = timestamp.toDate();
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const serverDataRef = collection(db, 'server-data');
        const q = query(serverDataRef, orderBy('timestamp', 'desc'), limit(1));

        const unsubscribe = onSnapshot(q, (snapshot) => {
          if (!snapshot.empty) {
            const data = snapshot.docs[0].data() as ServerData;
            setServerData(data);
          }
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error al obtener estadísticas:', error);
      }
    };

    fetchStats();
  }, []);

  if (!serverData) {
    return <div className="stats-loading">Cargando estadísticas...</div>;
  }

  return (
    <div className="stats-container">
      <div className="stats-section">
        <h3>Cuentas</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Total de Cuentas</span>
            <span className="stat-value">{serverData.accounts.total}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Activas (última semana)</span>
            <span className="stat-value">{serverData.accounts.activeLastWeek}</span>
          </div>
        </div>
      </div>

      <div className="stats-section">
        <h3>Personajes</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Activos (últimas 24h)</span>
            <span className="stat-value">{serverData.characters.activeLast24h}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Nivel Promedio</span>
            <span className="stat-value">{serverData.characters.averageLevel}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Nivel más Alto</span>
            <span className="stat-value">{serverData.characters.highestLevel}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Personajes Nivel Máximo</span>
            <span className="stat-value">{serverData.characters.maxLevelCount}</span>
          </div>
        </div>
      </div>

      <div className="stats-section">
        <h3>Economía</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Zeny Total</span>
            <span className="stat-value">{parseInt(serverData.economy.totalZeny).toLocaleString()}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Zeny en Banco</span>
            <span className="stat-value">{parseInt(serverData.economy.bankZeny).toLocaleString()}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Promedio por Cuenta</span>
            <span className="stat-value">{serverData.economy.averageZenyPerAccount.toLocaleString()}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Promedio por Personaje</span>
            <span className="stat-value">{serverData.economy.averageZenyPerChar.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="stats-section">
        <h3>Guilds</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Total de Guilds</span>
            <span className="stat-value">{serverData.guilds.total}</span>
          </div>
        </div>
      </div>

      <div className="stats-timestamp">
        Última actualización: {formatTimestamp(serverData.timestamp)}
      </div>
    </div>
  );
};

export default Stats; 
