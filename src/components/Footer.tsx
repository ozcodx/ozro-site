import { useEffect, useRef, useState } from 'react';
import '../styles/Footer.css';

const Footer = () => {
  const [isVisible, setIsVisible] = useState(false);
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      {
        threshold: 0.1,
        rootMargin: '-50px 0px',
      }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => {
      if (footerRef.current) {
        observer.unobserve(footerRef.current);
      }
    };
  }, []);

  return (
    <footer ref={footerRef} className="footer">
      <div className="footer-content">
        <div className={`footer-section ${isVisible ? 'visible' : ''}`}>
          <h3>Sobre Nosotros</h3>
          <p>
            Servidor creado y mantenido por{' '}
            <a href="https://github.com/ozcodx" target="_blank" rel="noopener noreferrer">
              OzCodx
              </a>{' '}
            y{' '}
            <a href="https://github.com/Bernalopithecus" target="_blank" rel="noopener noreferrer">
              Bernalopithecus
              </a>
          </p>
        </div>
        <div className={`footer-section ${isVisible ? 'visible' : ''}`}>
        <h3>Información Legal</h3>
          <p>
          Todas las marcas comerciales mencionadas en este sitio son propiedad de sus respectivos dueños.
          </p>
        </div>
        <div className={`footer-section ${isVisible ? 'visible' : ''}`}>
          <h3>Contacto</h3>
          <p>
            Si tienes alguna pregunta o sugerencia, por favor contáctanos a través del correo: 
            <a href="mailto:ozcodx@gmail.com"> ozcodx@gmail.com</a>
          </p>
        </div>
      </div>
      <div className={`footer-bottom ${isVisible ? 'visible' : ''}`}>
        <p>© 2025 Oz Ragnarok. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer; 