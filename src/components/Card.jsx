import { motion } from "framer-motion";
import { useRef } from "react";

// Module-level variable to keep track of the highest z-index among cards
let highestZIndex = 1;

export default function Card({ article, index }) {
  // Format the date in Turkish locale
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Create a ref for the card
  const cardRef = useRef(null);

  // Deterministic animation values to avoid hydration mismatches
  const yOffset = index % 2 === 0 ? -30 : 30;
  const rotation = ((index % 3) - 1) * 5; // Either -5, 0, or 5 degrees

  return (
    <motion.div
      ref={cardRef}
      className="card"
      drag
      dragMomentum={false}
      onDragStart={(e) => {
        highestZIndex++;
        // Always update the style via currentTarget or use cardRef as a fallback
        const target = e.currentTarget || cardRef.current;
        if (target) {
          target.style.zIndex = highestZIndex;
        }
      }}
      initial={{ scale: 0, opacity: 0, y: yOffset }}
      animate={{
        scale: 1,
        opacity: 1,
        y: 0,
        x: 30 + (index % 3) * 30, // Stagger cards horizontally
        rotate: rotation,
      }}
      transition={{
        delay: index * 0.15,
        type: "spring",
        damping: 15,
        stiffness: 150,
      }}
      // Set position relative so child elements can be absolutely positioned
      style={{ position: "relative" }}
    >
      <div className="card-content">
        <h2>{article.title}</h2>
        {article.date && (
          <div className="card-date">{formatDate(article.date)}</div>
        )}
        <div className="card-decoration"></div>
      </div>
      {/* Positioned at the bottom right of the card */}
      <a href={`/articles/${article.slug}`} className="card-link">
        Oku →
      </a>
    </motion.div>
  );
}
