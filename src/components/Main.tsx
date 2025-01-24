import { useEffect, useState } from 'react';
import Header from './Header';
import '../styles/Main.css';
import Cookies from 'js-cookie';

const TOTAL_CITIES = 8;
const TOTAL_CHARS = 7;

const Main = () => {
  const [randomCity, setRandomCity] = useState(Cookies.get('randomCity') || '1');
  const [randomChar, setRandomChar] = useState(Cookies.get('randomChar') || '1');

  useEffect(() => {
    let newCity;
    do {
      newCity = Math.floor(Math.random() * TOTAL_CITIES) + 1;
    } while (newCity.toString() === randomCity);
    setRandomCity(newCity.toString());
    Cookies.set('randomCity', newCity.toString());
  }, []);

  useEffect(() => {
    let newChar;
    do {
      newChar = Math.floor(Math.random() * TOTAL_CHARS) + 1;
    } while (newChar.toString() === randomChar);
    setRandomChar(newChar.toString());
    Cookies.set('randomChar', newChar.toString());
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
        <div className="banner-char"
        style={{
          backgroundImage: `url(/chars/${randomChar}.webp)`,
        }}
        ></div>
        <div className="banner-content">
          <h1>Bienvenido a OzRagnarok</h1>
          <p>Tu aventura comienza aquí</p>
        </div>
      </div>
    </div>
  );
};

export default Main;
