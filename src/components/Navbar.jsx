import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Listen for theme changes
  useEffect(() => {
    // Initialize theme based on current document attribute
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    setIsDarkMode(currentTheme === 'dark');
    
    // Listen for theme changes
    const handleThemeChange = (event) => {
      setIsDarkMode(event.detail.isDarkMode);
    };
    
    window.addEventListener('themeChange', handleThemeChange);
    
    return () => {
      window.removeEventListener('themeChange', handleThemeChange);
    };
  }, []);
  
  return (
    <nav className="navbar">
      <div className="logo">Alper Saritas • Kendime Düşünceler</div>
      
      <div className="nav-links">
        <motion.a 
          href="https://alpersaritas.com" 
          className="nav-link"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ y: -2 }}
          transition={{ type: "spring", stiffness: 300 }}
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
    </nav>
  );
}