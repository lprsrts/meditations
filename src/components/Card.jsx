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

  return (
    <motion.div
      className="card"
      drag
      dragMomentum={false}
      onDragStart={(e, info) => {
        // Bring card to front when dragging starts
        e.target.style.zIndex = Date.now();
      }}
      initial={{ scale: 0, opacity: 0, y: -50 + Math.random() * 100 }}
      animate={{ 
        scale: 1, 
        opacity: 1, 
        y: 0, 
        x: 30 + (index % 3) * 30, // Stagger cards horizontally
        rotate: -5 + Math.random() * 10 // Random slight rotation
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