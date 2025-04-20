import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from './Card';

export default function Deck({ articles }) {
  const [mounted, setMounted] = useState(false);
  const [sortedArticles, setSortedArticles] = useState([]);
  const [centerPoint, setCenterPoint] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
    // Sort articles by date, newest first
    const sorted = [...articles].sort((a, b) => 
      new Date(b.data.date) - new Date(a.data.date)
    );
    setSortedArticles(sorted);
    
    // Set center point based on window dimensions
    const updateCenterPoint = () => {
      setCenterPoint({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
      });
    };
    
    updateCenterPoint();
    window.addEventListener('resize', updateCenterPoint);
    return () => window.removeEventListener('resize', updateCenterPoint);
  }, [articles]);

  // Before hydration is complete, render a simplified version
  if (!mounted) {
    return (
      <div className="deck">
        <div className="site-title">KENDİME DÜŞÜNCELER</div>
      </div>
    );
  }

  return (
    <div className="deck">
      <div className="cards-container" style={{ position: 'absolute', left: centerPoint.x, top: centerPoint.y }}>
        {sortedArticles.map((article, i) => (
          <Card 
            key={article.slug}
            article={{
              slug: article.slug,
              title: article.data.title,
              date: article.data.date
            }}
            index={i}
            centerPoint={centerPoint}
          />
        ))}
      </div>
      <div className="site-title">KENDİME DÜŞÜNCELER</div>
    </div>
  );
}