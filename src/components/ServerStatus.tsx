import { useEffect, useRef, useState } from 'react';
import '../styles/ServerStatus.css';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase.js';

interface StatusItemProps {
  title: string;
  icon: string;
  value: string;
  type?: 'status' | 'number';
}

interface ServerStatusData {
  vpn: string;
  server: string;
  'event-name': string;
  'event-date': string;
  players: number;
  ping: number;
}

const StatusItem = ({ title, icon, value, type = 'status' }: StatusItemProps) => (
  <div className="status-item">
    <div className="status-icon">
      <img src={icon} alt={title} />
    </div>
    <div className="status-info">
      <h4>{title}</h4>
      <p className={`status-value ${type === 'status' ? value.toLowerCase() : ''}`}>
        {value}
      </p>
    </div>
  </div>
);

const ServerStatus = () => {
  const [isVisible, setIsVisible] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);
  const [statusData, setStatusData] = useState<ServerStatusData>({
    vpn: 'Offline',
    server: 'Online',
    'event-name': 'Por definir',
    'event-date': 'Por definir',
    players: 0,
    ping: -1
  });

  useEffect(() => {
    const checkVpnStatus = async () => {
      // mocked data while solving the vpn issue
      // vpn is online if the ping is between 100 and 400
      setStatusData(prev => ({ 
        ...prev, 
        vpn: 'Online',
        ping: Math.floor(Math.random() * 300) + 100
      }));
    };

    checkVpnStatus();

    const interval = setInterval(checkVpnStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    try {
      const serverStatusRef = collection(db, 'server-status');
      const q = query(serverStatusRef);

      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          const data = doc.data();
          setStatusData(prev => ({
            ...prev,
            players: data.players || 0,
            'event-name': data['event-name'] || 'Por definir',
            'event-date': data['event-date'] || 'Por definir'
          }));
        }
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error al conectar con Firestore:', error);
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      {
        threshold: 0.2,
        rootMargin: '-50px 0px',
      }
    );

    if (statusRef.current) {
      observer.observe(statusRef.current);
    }

    return () => {
      if (statusRef.current) {
        observer.unobserve(statusRef.current);
      }
    };
  }, []);

  return (
    <div ref={statusRef} className={`server-status ${isVisible ? 'visible' : ''}`}>
      <div className="status-grid">
        {/* Columna izquierda - Estados */}
        <div className="status-column">
          <StatusItem 
            title="VPN"
            icon="/icons/vpn.gif"
            value={statusData.vpn}
          />
          <StatusItem 
            title="Server"
            icon="/icons/server.gif"
            value={statusData.server}
          />
        </div>

        {/* Columna central - Evento */}
        <div className="status-center">
          <div className="event-card">
            <div className="event-icon">
              <img src="/icons/event.gif" alt="Evento" />
            </div>
            <div className="event-info">
              <div className="event-header">
                <span className="event-label">Próximo Evento</span>
                <span className="event-time">{statusData['event-date']}</span>
              </div>
              <h4 className="event-title">{statusData['event-name']}</h4>
            </div>
          </div>
        </div>

        {/* Columna derecha - Estadísticas */}
        <div className="status-column">
          <StatusItem 
            title="Online"
            icon="/icons/players.gif"
            value={statusData.players.toString()}
            type="number"
          />
          <StatusItem 
            title="Ping"
            icon="/icons/ping.gif"
            value={statusData.ping === -1 ? '---' : `${statusData.ping} ms`}
            type="number"
          />
        </div>
      </div>
    </div>
  );
};

export default ServerStatus; 
