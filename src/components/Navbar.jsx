import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Listen for theme changes and scroll events
  useEffect(() => {
    // Initialize theme based on current document attribute
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    setIsDarkMode(currentTheme === 'dark');
    
    // Listen for theme changes
    const handleThemeChange = (event) => {
      setIsDarkMode(event.detail.isDarkMode);
    };
    
    // Handle scroll for navbar appearance
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    
    // Close mobile menu when window is resized to desktop size
    const handleResize = () => {
      if (window.innerWidth > 768 && isOpen) {
        setIsOpen(false);
      }
    };
    
    window.addEventListener('themeChange', handleThemeChange);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('themeChange', handleThemeChange);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen, scrolled]);
  
  // Toggle mobile menu
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  // Close mobile menu when a link is clicked
  const handleNavLinkClick = () => {
    if (isOpen) {
      setIsOpen(false);
    }
  };
  
  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="logo">Alper Saritas • Kendime Düşünceler</div>
      
      {/* Desktop navigation */}
      <div className="nav-links desktop-nav">
        <motion.a 
          href="https://alpersaritas.com" 
          className="nav-link"
          whileHover={{ y: -2 }}
          transition={{ type: "spring", stiffness: 300 }}
          onClick={handleNavLinkClick}
        >
          Ana Sayfa
        </motion.a>
        
        <motion.span 
          className="nav-link coming-soon"
        >
          Engineering Blog
        </motion.span>
        
        <motion.span 
          className="nav-link coming-soon"
        >
          Code Lab
        </motion.span>
        
        <ThemeToggle />
      </div>
      
      {/* Mobile hamburger button */}
      <button 
        className={`mobile-menu-button ${isOpen ? 'open' : ''}`} 
        onClick={toggleMenu}
        aria-label="Toggle Menu"
        aria-expanded={isOpen}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      
      {/* Mobile navigation - collapsible menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="mobile-nav"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="mobile-nav-links"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, staggerChildren: 0.1 }}
            >
              <motion.a
                href="https://alpersaritas.com"
                className="mobile-nav-link"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
                onClick={handleNavLinkClick}
              >
                Ana Sayfa
              </motion.a>
              
              <motion.span className="mobile-nav-link coming-soon">
                Engineering Blog
              </motion.span>
              
              <motion.span className="mobile-nav-link coming-soon">
                Code Lab
              </motion.span>
              
              <div className="mobile-theme-toggle">
                <ThemeToggle />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}