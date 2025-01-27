import { useEffect, useRef, useState } from 'react';

interface NewsProps {
  children: React.ReactNode;
}

const News = ({ children }: NewsProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const newsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      {
        threshold: 0.2,
        rootMargin: '-100px 0px',
      }
    );

    if (newsRef.current) {
      observer.observe(newsRef.current);
    }

    return () => {
      if (newsRef.current) {
        observer.unobserve(newsRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={newsRef}
      className={`news-section ${isVisible ? 'visible' : ''}`}
    >
      <h2>Últimas Actualizaciones</h2>
      <div className="news-container">
        {children}
      </div>
    </div>
  );
};

export default News; 
