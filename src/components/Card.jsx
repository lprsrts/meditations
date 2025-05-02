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

// Check if a position is within viewport boundaries with some margin
function isPositionInBounds(position, windowWidth, windowHeight, cardWidth = 280, cardHeight = 120, margin = 20) {
  // The cards are centered at (0,0) with the viewport center as origin
  const maxX = windowWidth / 2 - cardWidth / 2 - margin;
  const maxY = windowHeight / 2 - cardHeight / 2 - margin;
  
  return (
    position.x >= -maxX &&
    position.x <= maxX &&
    position.y >= -maxY &&
    position.y <= maxY
  );
}

// Key for position storage in localStorage
const POSITION_STORAGE_KEY = 'cardPositions';

export default function Card({ article, index, safeRadius = 200, debugMode, zIndex }) {
  const cardRef = useRef(null);
  const [position, setPosition] = useState(null);
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
  
  // Clear all saved positions if holding shift when pressing 'r'
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'r' && e.shiftKey) {
        console.log("Clearing all saved card positions");
        localStorage.removeItem(POSITION_STORAGE_KEY);
        window.location.reload();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  // Generate initial position or load saved position
  useEffect(() => {
    try {
      // Current window dimensions
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      
      // Try to load saved positions from localStorage first
      const savedPositionsJSON = localStorage.getItem(POSITION_STORAGE_KEY);
      let initialPosition;
      let needsRepositioning = false;
      
      if (savedPositionsJSON) {
        const savedPositions = JSON.parse(savedPositionsJSON);
        initialPosition = savedPositions[article.slug];
        
        // Check if the saved position is outside the viewport
        if (initialPosition && !isPositionInBounds(initialPosition, windowWidth, windowHeight)) {
          console.log(`Card "${article.slug}" is outside bounds, repositioning`);
          needsRepositioning = true;
        }
      }
      
      if (initialPosition && !needsRepositioning) {
        // Found a valid saved position that's within bounds
        setPosition(initialPosition);
      } else {
        // Either no saved position, or it was outside bounds - generate a new one
        const distance = Math.abs(randomGaussian(0, safeRadius / 3));
        const angle = Math.random() * 2 * Math.PI;
        const clampedDist = clamp(distance, 0, safeRadius * 0.9);
        
        // Make sure the new position is within bounds
        let newPosition = sphericalToCartesian(clampedDist, angle);
        
        // Double-check the generated position and constrain if needed
        if (!isPositionInBounds(newPosition, windowWidth, windowHeight)) {
          // If still out of bounds, constrain it to viewport
          const maxX = windowWidth / 2 - 160; // 140px for half card width + 20px margin
          const maxY = windowHeight / 2 - 80; // 60px for half card height + 20px margin
          
          newPosition = {
            x: clamp(newPosition.x, -maxX, maxX), 
            y: clamp(newPosition.y, -maxY, maxY)
          };
        }
        
        setPosition(newPosition);
        setDistancePercent(Math.round((clampedDist / safeRadius) * 100));
        
        // Save the new position
        const savedPositions = savedPositionsJSON ? JSON.parse(savedPositionsJSON) : {};
        savedPositions[article.slug] = newPosition;
        localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(savedPositions));
      }
    } catch (e) {
      console.warn('Failed to handle card position', e);
      // Fallback to a simple random position near the center
      const randomAngle = Math.random() * 2 * Math.PI;
      const randomDist = Math.random() * safeRadius * 0.5; // Use 0.5 instead of 0.7 to keep closer to center
      setPosition(sphericalToCartesian(randomDist, randomAngle));
    }
  }, [article.slug, safeRadius]);

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
  
  // Handle drag end - save the new position
  const handleDragEnd = (event, info) => {
    if (!position) return;
    
    let newPosition = { 
      x: position.x + info.offset.x,
      y: position.y + info.offset.y 
    };
    
    // Check and correct if the dragged position is outside viewport bounds
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    if (!isPositionInBounds(newPosition, windowWidth, windowHeight)) {
      // Constrain to viewport
      const maxX = windowWidth / 2 - 160; // 140px for half card width + 20px margin
      const maxY = windowHeight / 2 - 80; // 60px for half card height + 20px margin
      
      newPosition = {
        x: clamp(newPosition.x, -maxX, maxX), 
        y: clamp(newPosition.y, -maxY, maxY)
      };
    }
    
    // Update state with new position
    setPosition(newPosition);
    
    // Save to localStorage for persistence
    try {
      const savedPositionsJSON = localStorage.getItem(POSITION_STORAGE_KEY);
      const savedPositions = savedPositionsJSON ? JSON.parse(savedPositionsJSON) : {};
      savedPositions[article.slug] = newPosition;
      localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(savedPositions));
    } catch (e) {
      console.warn('Failed to save card position', e);
    }
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

  // Don't render until we have a position
  if (position === null) {
    return null;
  }

  // Custom styles for consistent shadow behavior across environments
  const cardStyle = {
    position: "absolute",
    left: "50%", 
    top: "50%",
    marginLeft: "-140px", // Half the card width (280/2)
    marginTop: "-60px",   // Half the card height (120/2)
    zIndex: effectiveZIndex(),
    borderRadius: "12px",
    backdropFilter: "blur(10px)",
  };

  return (
    <motion.div
      ref={cardRef}
      className={`card ${isHovered ? 'card-hovered' : ''}`}
      drag
      dragMomentum={false}
      onDragStart={handleInteraction}
      onDragEnd={handleDragEnd}
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
        rotate: rotation
      }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        x: position.x,
        y: position.y,
        rotate: rotation
      }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
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
      <a 
        href={`/articles/${article.slug}`} 
        className="card-link"
      >
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
