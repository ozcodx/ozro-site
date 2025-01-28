import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase.js';

interface ServerStats {
  // Estadísticas de Jugadores
  totalAccounts: number;
  activeAccounts: number;
  totalPlayers: number;
  activePlayers: number;
  totalGuilds: number;
  // Estadísticas de Economía
  totalZeny: number;
  avgZenyPerPlayer: number;
  // Estadísticas de Niveles
  avgLevel: number;
  maxLevel: {
    level: number;
    character: string;
    others: number;
  };
  // Estadísticas de Actividad
  mvpsToday: number;
  questsCompleted: number;
}

const Stats = () => {
  const [stats, setStats] = useState<ServerStats>({
    totalAccounts: 0,
    activeAccounts: 0,
    totalPlayers: 0,
    activePlayers: 0,
    totalGuilds: 0,
    totalZeny: 0,
    avgZenyPerPlayer: 0,
    avgLevel: 0,
    maxLevel: {
      level: 0,
      character: 'N/A',
      others: 0
    },
    mvpsToday: 0,
    questsCompleted: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Obtener datos de personajes y cuentas
        const charSnapshot = await getDocs(collection(db, 'char'));
        const accountDataSnapshot = await getDocs(collection(db, 'account-data'));
        const loginSnapshot = await getDocs(collection(db, 'login'));
        
        let totalPlayers = charSnapshot.size;
        let totalZeny = 0;
        let totalLevel = 0;
        let maxLevel = 0;
        let maxLevelChar = 'N/A';
        let maxLevelCount = 0;

        // Calcular cuentas activas en los últimos 7 días
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        let activeAccounts = 0;
        loginSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.lastlogin) {
            const lastLogin = new Date(data.lastlogin);
            if (lastLogin >= sevenDaysAgo) {
              activeAccounts++;
            }
          }
        });

        // Primer recorrido para encontrar el nivel máximo
        charSnapshot.forEach(doc => {
          const data = doc.data();
          const level = Number(data.base_level || 0);
          if (level > maxLevel) {
            maxLevel = level;
          }
        });

        // Segundo recorrido para contar personajes en nivel máximo y procesar otros datos
        charSnapshot.forEach(doc => {
          const data = doc.data();
          totalZeny += Number(data.zeny || 0);
          const level = Number(data.base_level || 0);
          totalLevel += level;

          if (level === maxLevel) {
            maxLevelCount++;
            if (maxLevelCount === 1) {
              maxLevelChar = data.name || 'N/A';
            }
          }
        });

        // Sumar zeny de las bóvedas de banco
        accountDataSnapshot.forEach(doc => {
          const data = doc.data();
          totalZeny += Number(data.bank_vault || 0);
        });

        // Establecer estadísticas
        setStats({
          // Datos reales
          totalPlayers,
          totalZeny,
          totalAccounts: loginSnapshot.size,
          activeAccounts,
          avgLevel: totalPlayers > 0 ? Math.round(totalLevel / totalPlayers) : 0,
          maxLevel: {
            level: maxLevel,
            character: maxLevelChar,
            others: Math.max(0, maxLevelCount - 1)
          },
          // Datos mock restantes
          activePlayers: 8,
          totalGuilds: 3,
          avgZenyPerPlayer: Math.round(totalZeny / totalPlayers),
          mvpsToday: 12,
          questsCompleted: 156
        });

      } catch (error) {
        console.error('Error al obtener estadísticas:', error);
      }
    };

    fetchStats();
  }, []);

  const formatNumber = (num: number): string => {
    return num.toLocaleString('es-ES');
  };

  const formatMaxLevel = () => {
    const { level, character, others } = stats.maxLevel;
    if (level === 0) return 'N/A';
    if (others === 0) return `${level} (${character})`;
    return `${level} (${character} y ${others} más)`;
  };

  return (
    <div className="info-content">
      <h2>Estadísticas del Servidor</h2>
      <div className="content-section">
        <h3>Comunidad y Jugadores</h3>
        <p>
          Información sobre nuestra comunidad y su actividad reciente:
        </p>
        <ul>
          <li>
            <strong>Total de Cuentas Registradas:</strong> {formatNumber(stats.totalAccounts)}
          </li>
          <li>
            <strong>Cuentas Activas (7 días):</strong> {formatNumber(stats.activeAccounts)}
          </li>
          <li>
            <strong>Total de Personajes:</strong> {formatNumber(stats.totalPlayers)}
          </li>
          <li>
            <strong>Personajes Activos (24h):</strong> {formatNumber(stats.activePlayers)} *
          </li>
          <li>
            <strong>Total de Guilds:</strong> {formatNumber(stats.totalGuilds)} *
          </li>
        </ul>

        <h3>Progreso y Niveles</h3>
        <p>
          Estadísticas sobre el avance y desarrollo de los personajes:
        </p>
        <ul>
          <li>
            <strong>Nivel más Alto:</strong> {formatMaxLevel()}
          </li>
          <li>
            <strong>Nivel Promedio:</strong> {stats.avgLevel}
          </li>
        </ul>

        <h3>Economía</h3>
        <p>
          Estado actual de la economía del servidor:
        </p>
        <ul>
          <li>
            <strong>Zeny Total en Circulación:</strong> {formatNumber(stats.totalZeny)} z
          </li>
          <li>
            <strong>Zeny Promedio por Jugador:</strong> {formatNumber(stats.avgZenyPerPlayer)} z
          </li>
        </ul>

        <h3>Actividad Diaria</h3>
        <p>
          Resumen de las actividades realizadas en el servidor:
        </p>
        <ul>
          <li>
            <strong>MVPs Derrotados Hoy:</strong> {formatNumber(stats.mvpsToday)} *
          </li>
          <li>
            <strong>Quests Completadas:</strong> {formatNumber(stats.questsCompleted)} *
          </li>
        </ul>
        <p className="stats-note">
          * Datos simulados para desarrollo
        </p>
      </div>
    </div>
  );
};

export default Stats; 
