import { useState, useEffect, createContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from './Card';

// Store z-indices in localStorage for persistence between hot reloads
const ZINDEX_STORAGE_KEY = 'cardZIndices';

// Create a context to share z-index state across cards
export const CardZIndexContext = createContext({
  updateZIndex: () => {},
  totalCards: 0,
  hoveredCard: null,
  setHoveredCard: () => {}
});

export default function Deck({ articles }) {
  const [mounted, setMounted] = useState(false);
  const [sortedArticles, setSortedArticles] = useState([]);
  const [centerPoint, setCenterPoint] = useState({ x: 0, y: 0 });
  const [safeRadius, setSafeRadius] = useState(0);
  const [debugMode, setDebugMode] = useState(false);
  const [showCards, setShowCards] = useState(false);
  
  // Keep track of all card z-indices
  const [zIndices, setZIndices] = useState({});
  
  // Track the currently hovered card
  const [hoveredCard, setHoveredCard] = useState(null);

  // Initialize and store z-indices
  useEffect(() => {
    setMounted(true);
    // Sort articles by date, newest first
    const sorted = [...articles].sort((a, b) => 
      new Date(b.data.date) - new Date(a.data.date)
    );
    setSortedArticles(sorted);
    
    // Try to load z-indices from localStorage first (for HMR persistence)
    let initialZIndices = {};
    try {
      const savedIndices = localStorage.getItem(ZINDEX_STORAGE_KEY);
      if (savedIndices) {
        const parsed = JSON.parse(savedIndices);
        // Make sure all current articles have z-indices
        let valid = true;
        sorted.forEach(article => {
          if (!(article.slug in parsed)) {
            valid = false;
          }
        });
        
        if (valid) {
          initialZIndices = parsed;
          console.log("Restored z-indices from storage");
        }
      }
    } catch (e) {
      console.warn("Error loading z-indices", e);
    }
    
    // If we don't have valid saved z-indices, initialize fresh ones
    if (Object.keys(initialZIndices).length === 0) {
      sorted.forEach((article, index) => {
        initialZIndices[article.slug] = sorted.length - index; // Newest has highest z-index
      });
    }
    
    setZIndices(initialZIndices);
    
    // Set center point and safe radius based on window dimensions
    const updateDimensions = () => {
      setCenterPoint({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
      });
      
      // Update safe radius
      const newSafeRadius = Math.min(window.innerWidth, window.innerHeight) * 0.4;
      setSafeRadius(newSafeRadius);
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    // Delay showing cards to let visitor see the title
    const timer = setTimeout(() => {
      setShowCards(true);
    }, 1800); // 1.8 second delay
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
      clearTimeout(timer);
    };
  }, [articles]);

  // Save z-indices to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(zIndices).length > 0) {
      try {
        localStorage.setItem(ZINDEX_STORAGE_KEY, JSON.stringify(zIndices));
      } catch (e) {
        console.warn("Error saving z-indices", e);
      }
    }
  }, [zIndices]);

  // Function to update z-index when a card is clicked/dragged
  const updateZIndex = (slug) => {
    // Clear hovered card state when a card is clicked/dragged
    setHoveredCard(null);
    
    setZIndices(prevZIndices => {
      const newZIndices = { ...prevZIndices };
      const selectedCardZIndex = prevZIndices[slug];
      const maxZIndex = sortedArticles.length;
      
      // Only update if card isn't already at the top
      if (selectedCardZIndex < maxZIndex) {
        // Adjust other cards' z-indices
        Object.keys(newZIndices).forEach(cardSlug => {
          if (cardSlug !== slug && newZIndices[cardSlug] > selectedCardZIndex) {
            // Push down cards that were above the selected one
            newZIndices[cardSlug]--;
          }
        });
        
        // Move selected card to top
        newZIndices[slug] = maxZIndex;
      }
      
      // Debug log to help troubleshoot
      if (debugMode) {
        console.log(`Card ${slug} z-index updated from ${selectedCardZIndex} to ${newZIndices[slug]}`);
      }
      
      return newZIndices;
    });
  };

  // Toggle debug mode on key press
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'd') {
        setDebugMode(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Before hydration is complete, render a simplified version
  if (!mounted) {
    return (
      <div className="deck">
        <div className="site-title">KENDİME DÜŞÜNCELER</div>
      </div>
    );
  }

  return (
    <CardZIndexContext.Provider value={{ 
      updateZIndex, 
      totalCards: sortedArticles.length,
      hoveredCard,
      setHoveredCard
    }}>
      <div className="deck">
        <motion.div 
          className="site-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        >
          KENDİME DÜŞÜNCELER
        </motion.div>
        
        <AnimatePresence>
          {showCards && (
            <div className="cards-container" style={{ position: 'absolute', left: centerPoint.x, top: centerPoint.y }}>
              {/* Debug circle showing the safe radius */}
              {debugMode && (
                <div 
                  className="debug-circle" 
                  style={{
                    position: 'absolute',
                    width: safeRadius * 2 + 'px',
                    height: safeRadius * 2 + 'px',
                    borderRadius: '50%',
                    border: '2px dashed rgba(255, 0, 0, 0.5)',
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none'
                  }}
                />
              )}
              
              {sortedArticles.map((article, i) => (
                <Card 
                  key={article.slug}
                  article={{
                    slug: article.slug,
                    title: article.data.title,
                    date: article.data.date
                  }}
                  index={i}
                  zIndex={zIndices[article.slug] || 0}
                  safeRadius={safeRadius}
                  debugMode={debugMode}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
        
        {/* Debug info display */}
        {debugMode && (
          <div className="debug-info" style={{
            position: 'fixed',
            bottom: '10px',
            left: '10px',
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            fontSize: '12px',
            zIndex: 9999
          }}>
            <p>Debug Mode: ON (Press 'd' to toggle)</p>
            <p>Center: {centerPoint.x.toFixed(0)}px, {centerPoint.y.toFixed(0)}px</p>
            <p>Safe Radius: {safeRadius.toFixed(0)}px</p>
            <p>Cards: {sortedArticles.length}</p>
            <p>Hovered: {hoveredCard || 'None'}</p>
            {debugMode && (
              <div>
                <p>Z-Indices:</p>
                <div style={{ maxHeight: '100px', overflowY: 'auto', fontSize: '10px' }}>
                  {Object.entries(zIndices).map(([slug, z]) => (
                    <div key={slug}>{slug.substring(0, 10)}: {z}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </CardZIndexContext.Provider>
  );
}