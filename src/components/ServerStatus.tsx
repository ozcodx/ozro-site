import { useEffect, useRef, useState } from 'react';
import '../styles/ServerStatus.css';
import { collection, query, orderBy, limit, onSnapshot, Timestamp, getDocs } from 'firebase/firestore';
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
  timestamp?: Timestamp;
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
    vpn: 'Indeterminado',
    server: 'Indeterminado',
    'event-name': 'Por definir',
    'event-date': 'Por definir',
    players: 0,
    ping: 0
  });

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

  useEffect(() => {
    console.log('Configurando escucha en tiempo real...');
    try {
      const serverStatusRef = collection(db, 'server-status');
      console.log('Referencia a colección creada');
      
      const q = query(serverStatusRef);
      console.log('Query creada sin ordenamiento');

      const unsubscribe = onSnapshot(q, (snapshot) => {
        console.log('Snapshot recibido, documentos:', snapshot.size);
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          const data = doc.data() as ServerStatusData;
          console.log('Datos recibidos:', data);
          setStatusData(data);
        }
      }, (error) => {
        console.error('Error en el listener:', error);
      });

      return () => {
        console.log('Limpiando listener...');
        unsubscribe();
      };
    } catch (error) {
      console.error('Error al configurar la escucha:', error);
    }
  }, []);

  // Efecto para listar todas las colecciones
  useEffect(() => {
    const listCollections = async () => {
      try {
        console.log('Intentando listar colecciones...');
        const collections = await getDocs(collection(db, 'server-status'));
        console.log('Documentos en server-status:', collections.size);
        collections.forEach(doc => {
          console.log('Documento encontrado:', doc.id, doc.data());
        });

        // Intentar listar otros documentos en la raíz
        const rootCollections = await getDocs(collection(db, 'server_status'));
        console.log('Documentos en server_status:', rootCollections.size);
        rootCollections.forEach(doc => {
          console.log('Documento encontrado en server_status:', doc.id, doc.data());
        });

      } catch (error) {
        console.error('Error al listar colecciones:', error);
      }
    };

    listCollections();
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
            value={`${statusData.ping}ms`}
            type="number"
          />
        </div>
      </div>
    </div>
  );
};

export default ServerStatus; 
