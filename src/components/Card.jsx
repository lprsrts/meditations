import { motion } from "framer-motion";
import { useRef, useState, useEffect, useContext } from "react";
import { CardZIndexContext } from "./Deck";

// Add Gaussian random number generator for normal distribution
function randomGaussian(mean = 0, stdev = 1) {
  let u = 1 - Math.random(); // Should not be exactly 0
  let v = 1 - Math.random(); // Should not be exactly 0
  if (u === 0) u = 0.0001;
  if (v === 0) v = 0.0001;
  const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  return mean + stdev * z;
}

// Constrain a value between min and max
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// Convert spherical coordinates to cartesian
function sphericalToCartesian(radius, angle) {
  return {
    x: radius * Math.cos(angle),
    y: radius * Math.sin(angle)
  };
}

export default function Card({ article, index, safeRadius = 200, debugMode, zIndex }) {
  const cardRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [distancePercent, setDistancePercent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  
  // Use global context for hovered card state
  const { updateZIndex, totalCards, hoveredCard, setHoveredCard } = useContext(CardZIndexContext);

  // Format the date in Turkish locale
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR", {
      year: "numeric", month: "long", day: "numeric",
    });
  };
  
  // Generate position using a true circular normal distribution
  useEffect(() => {
    const distance = Math.abs(randomGaussian(0, safeRadius / 4));
    const angle = Math.random() * 2 * Math.PI;
    const coords = sphericalToCartesian(distance, angle);
    const clampedDist = clamp(distance, 0, safeRadius);
    const clampedCoords = sphericalToCartesian(clampedDist, angle);
    
    setPosition(clampedCoords);
    setDistancePercent(Math.round((clampedDist / safeRadius) * 100));
  }, [safeRadius]);

  // Handle mouse enter - bring card to front temporarily
  const handleMouseEnter = () => {
    setIsHovered(true);
    setHoveredCard(article.slug);
  };

  // Handle mouse leave - restore original z-index
  const handleMouseLeave = () => {
    setIsHovered(false);
    if (hoveredCard === article.slug) {
      setHoveredCard(null);
    }
  };

  // Handle card interaction - permanently update z-index
  const handleInteraction = () => {
    updateZIndex(article.slug);
  };

  // Calculate the effective z-index for this card based on hover state and system state
  const effectiveZIndex = () => {
    if (hoveredCard === article.slug) {
      return totalCards + 1000; // Temporarily on top
    }
    return zIndex;
  };

  // Deterministic rotation to avoid hydration mismatches
  const rotation = ((index % 3) - 1) * 5; // Either -5, 0, or 5 degrees

  // Custom styles for consistent shadow behavior across environments
  const cardStyle = {
    position: "absolute",
    left: "50%", 
    top: "50%",
    marginLeft: "-140px", // Half the card width (280/2)
    marginTop: "-60px",   // Half the card height (120/2)
    zIndex: effectiveZIndex(),
    // Use CSS variables for theme-sensitive shadows
    boxShadow: isHovered 
      ? "0 5px 15px var(--shadow-color-hover)" 
      : "2px 2px 10px var(--shadow-color)",
    transition: "box-shadow 0.3s ease-in-out, background-color 0.3s ease, border-color 0.3s ease"
  };

  return (
    <motion.div
      ref={cardRef}
      className={`card ${isHovered ? 'card-hovered' : ''}`}
      drag
      dragMomentum={false}
      onDragStart={handleInteraction}
      onClick={handleInteraction}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleMouseEnter} 
      onTouchEnd={handleMouseLeave}
      initial={{ 
        opacity: 0, 
        scale: 0,
        x: position.x,
        y: position.y,
        rotate: 0
      }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        x: position.x,
        y: position.y,
        rotate: rotation
      }}
      transition={{
        delay: index * 0.15,
        type: "spring",
        damping: 15,
        stiffness: 150
      }}
      style={cardStyle}
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
      
      {/* Debug info for this card */}
      {debugMode && (
        <div className="card-debug" style={{
          position: "absolute",
          top: "2px",
          left: "2px",
          fontSize: "8px",
          backgroundColor: "rgba(0,0,0,0.5)",
          color: "#fff",
          padding: "2px 4px",
          borderRadius: "2px",
          pointerEvents: "none"
        }}>
          z:{zIndex} {hoveredCard === article.slug ? "H" : ""} d:{distancePercent}%
        </div>
      )}
    </motion.div>
  );
}
