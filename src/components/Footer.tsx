const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Créditos</h3>
          <p>
            Sitio web creado por{' '}
            <a href="https://github.com/ozcodx" target="_blank" rel="noopener noreferrer">
              Ozcodx
            </a>{' '}
            y{' '}
            <a href="https://github.com/Bernalopithecus" target="_blank" rel="noopener noreferrer">
              Bernalopithecus
            </a>
          </p>
        </div>
        
        <div className="footer-section">
          <h3>Información Legal</h3>
          <p>
            Todas las marcas comerciales mencionadas en este sitio son propiedad de sus respectivos dueños.
          </p>
          <p>
            El uso de descripciones como "Ragnarok" y "servidor privado de Ragnarok" es completamente legal 
            y cumple con las leyes vigentes.
          </p>
          
        </div>

        <div className="footer-section">
          <h3>Aviso</h3>
          <p>
            Este es un servidor privado sin fines de lucro, creado por fans y para fans, 
            con el objetivo de preservar y compartir la experiencia clásica del juego.
          </p>
          <p>
            Este es un proyecto independiente y no está afiliado con Gravity Co., Ltd. 
            o cualquier otra compañía relacionada con Ragnarok Online.
          </p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2024 OzRagnarok. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer; 