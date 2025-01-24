import { useEffect, useState } from 'react';
import Header from './Header';
import '../styles/Main.css';

const TOTAL_CITIES = 8;

const Main = () => {
  const [randomCity, setRandomCity] = useState('1');

  useEffect(() => {
    const randomNumber = Math.floor(Math.random() * TOTAL_CITIES) + 1;
    setRandomCity(randomNumber.toString());
  }, []);

  return (
    <div className="main">
      <Header />
      <div 
        className="banner"
        style={{
          backgroundImage: `url(/cities/${randomCity}.jpg)`,
        }}
      >
        <div className="banner-content">
          <h1>Bienvenido a OzRagnarok</h1>
          <p>Tu aventura comienza aquí</p>
        </div>
      </div>
    </div>
  );
};

export default Main;
