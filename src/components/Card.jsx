import { motion } from 'framer-motion';

export default function Card({ article, index }) {
  // Format the date in Turkish locale
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Use deterministic values for animation properties to avoid hydration mismatches
  const yOffset = index % 2 === 0 ? -30 : 30; 
  const rotation = (index % 3 - 1) * 5;  // -5, 0, or 5 degrees

  return (
    <motion.div
      className="card"
      drag
      dragMomentum={false}
      onDragStart={(e, info) => {
        // Bring card to front when dragging starts
        e.target.style.zIndex = 1000 + index;
      }}
      initial={{ scale: 0, opacity: 0, y: yOffset }}
      animate={{ 
        scale: 1, 
        opacity: 1, 
        y: 0, 
        x: 30 + (index % 3) * 30, // Stagger cards horizontally
        rotate: rotation // Deterministic rotation
      }}
      transition={{ 
        delay: index * 0.15, 
        type: 'spring', 
        damping: 15,
        stiffness: 150
      }}
    >
      <a href={`/articles/${article.slug}`} className="card-link">
        <h2>{article.title}</h2>
        {article.date && (
          <div className="card-date">{formatDate(article.date)}</div>
        )}
        <div className="card-decoration"></div>
      </a>
    </motion.div>
  );
}