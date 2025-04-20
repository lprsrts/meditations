import { motion } from "framer-motion";
import { useRef, useEffect } from "react";

// Set the maximum z-index for cards
const MAX_Z_INDEX = 1000;

// Module-level variable to keep track of the highest z-index among cards
let highestZIndex = 1;

// Add Gaussian random number generator for normal distribution
function randomGaussian(mean = 0, stdev = 1) {
  let u = 1 - Math.random();
  let v = 1 - Math.random();
  return mean + stdev * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// Constrain a value between min and max
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export default function Card({ article, index, centerPoint }) {
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
  
  // Safe viewport boundaries to ensure cards stay visible
  const safeRadius = Math.min(window.innerWidth, window.innerHeight) * 0.4;
  
  // Generate random offsets from center using normal distribution
  // Smaller std deviation gives tighter clustering
  const xOffset = randomGaussian(0, safeRadius / 3);
  const yOffset = randomGaussian(0, safeRadius / 3);
  
  // Constrain to safe boundaries
  const clampedX = clamp(xOffset, -safeRadius, safeRadius);
  const clampedY = clamp(yOffset, -safeRadius, safeRadius);
  
  // Deterministic animation values to avoid hydration mismatches
  const rotation = ((index % 3) - 1) * 5; // Either -5, 0, or 5 degrees

  return (
    <motion.div
      ref={cardRef}
      className="card"
      drag
      dragMomentum={false}
      onDragStart={(e) => {
        highestZIndex++;
        if (highestZIndex > MAX_Z_INDEX) {
          highestZIndex = 1; // Reset to base value
        }
        // Always update the style via currentTarget or use cardRef as a fallback
        const target = e.currentTarget || cardRef.current;
        if (target) {
          target.style.zIndex = highestZIndex;
        }
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: 1,
        opacity: 1,
        x: clampedX,
        y: clampedY,
        rotate: rotation,
      }}
      transition={{
        delay: index * 0.15,
        type: "spring",
        damping: 15,
        stiffness: 150,
      }}
      style={{ 
        position: "absolute",
        transform: "translate(-50%, -50%)", // Center the card on its position
        zIndex: index // Initial z-index based on array order
      }}
    >
      <div className="card-content">
        <h2>{article.title}</h2>
        {article.date && (
          <div className="card-date">{formatDate(article.date)}</div>
        )}
        <div className="card-decoration"></div>
      </div>
      <a href={`/articles/${article.slug}`} className="card-link">
        Oku →
      </a>
    </motion.div>
  );
}
