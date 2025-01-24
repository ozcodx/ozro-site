import '../App.css';
import logo from '../assets/logo.png';

const Main = () => {
  return (
    <div className="app-container">
      <div className="content">
        <img 
          src={logo} 
          alt="Logo" 
          className="logo" 
        />
        <h1 className="title">FORJA DE CÓDIGO</h1>
        <p className="subtitle">
          Aqui estará el contenido de tu aplicación
        </p>
      </div>
    </div>
  );
};

export default Main;
