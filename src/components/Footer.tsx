import { useEffect, useRef, useState } from 'react';

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
            Somos un servidor privado de Ragnarök Online enfocado en ofrecer una experiencia 
            única y balanceada. Nuestro objetivo es mantener la esencia del juego mientras 
            incorporamos mejoras que lo hacen más disfrutable.
          </p>
        </div>
        <div className={`footer-section ${isVisible ? 'visible' : ''}`}>
          <h3>Características</h3>
          <p>
            • Rates balanceados: 5x/5x/10x<br />
            • Episodio 14.3 Renewal<br />
            • Eventos especiales<br />
            • Misiones únicas<br />
            • Comunidad amigable
          </p>
        </div>
        <div className={`footer-section ${isVisible ? 'visible' : ''}`}>
          <h3>Contacto</h3>
          <p>
            ¿Tienes dudas o sugerencias? ¡Nos encantaría escucharte!<br />
            Discord: <a href="https://discord.gg/tuservidor">Únete a nuestra comunidad</a>
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