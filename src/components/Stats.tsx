import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase.js';

interface ServerStats {
  totalPlayers: number;
  totalZeny: number;
  avgLevel: number;
  maxLevel: {
    level: number;
    character: string;
  };
}

const Stats = () => {
  const [stats, setStats] = useState<ServerStats>({
    totalPlayers: 0,
    totalZeny: 0,
    avgLevel: 0,
    maxLevel: {
      level: 0,
      character: 'N/A'
    }
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Obtener datos de personajes
        const charSnapshot = await getDocs(collection(db, 'char'));
        const accountDataSnapshot = await getDocs(collection(db, 'account-data'));
        
        let totalPlayers = charSnapshot.size;
        let totalZeny = 0;
        let totalLevel = 0;
        let maxLevel = 0;
        let maxLevelChar = 'N/A';

        // Procesar datos de personajes
        charSnapshot.forEach(doc => {
          const data = doc.data();
          // Convertir a número y sumar, usando 0 si es undefined o NaN
          totalZeny += Number(data.zeny || 0);
          const level = Number(data.base_level || 0);
          totalLevel += level;

          if (level > maxLevel) {
            maxLevel = level;
            maxLevelChar = data.name || 'N/A';
          }
        });

        // Sumar zeny de las bóvedas de banco
        accountDataSnapshot.forEach(doc => {
          const data = doc.data();
          // Convertir a número y sumar, usando 0 si es undefined o NaN
          totalZeny += Number(data.bank_vault || 0);
        });

        setStats({
          totalPlayers,
          totalZeny,
          avgLevel: totalPlayers > 0 ? Math.round(totalLevel / totalPlayers) : 0,
          maxLevel: {
            level: maxLevel,
            character: maxLevelChar
          }
        });

      } catch (error) {
        console.error('Error al obtener estadísticas:', error);
      }
    };

    fetchStats();
  }, []); // Solo se ejecuta una vez al montar el componente

  const formatNumber = (num: number): string => {
    return num.toLocaleString('es-ES');
  };

  return (
    <div className="info-content">
      <h2>Estadísticas del Servidor</h2>
      <div className="content-section">
        <p>
        Detalles del servidor, reflejando la información más reciente, actualizada periódicamente:
        </p>
        <ul>
          <li>
            <strong>Total de Personajes:</strong> {formatNumber(stats.totalPlayers)}
          </li>
          <li>
            <strong>Zeny Total en Circulación:</strong> {formatNumber(stats.totalZeny)} z
          </li>
          <li>
            <strong>Nivel Promedio:</strong> {stats.avgLevel}
          </li>
          <li>
            <strong>Nivel más Alto:</strong> {stats.maxLevel.level} ({stats.maxLevel.character})
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Stats; 
