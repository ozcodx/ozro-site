import { ReactNode } from 'react';

interface NewsItemProps {
  title: string;
  content: string;
  emoji: string;
}

interface NewsProps {
  children: ReactNode;
}

const News = ({ children }: NewsProps) => {
  return (
    <div className="news-section">
      <h2>Últimas Actualizaciones</h2>
      <div className="news-container">
        {children}
      </div>
    </div>
  );
};

export default News; 
