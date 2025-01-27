import { useEffect, useRef, useState } from 'react';

interface InfoCardProps {
  iconUrl: string;
  title: string;
  description: string;
  fromRight?: boolean;
}

const InfoCard = ({ iconUrl, title, description, fromRight }: InfoCardProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

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

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={cardRef}
      className={`server-info-card ${fromRight ? 'from-right' : ''} ${isVisible ? 'visible' : ''}`}
    >
      <div className="card-icon">
        <img src={iconUrl} alt="Ícono" />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
};

export default InfoCard;