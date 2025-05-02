import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

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
      <div className="nav-links">
        <motion.a 
          href="https://alpersaritas.com" 
          className="home-link"
          whileHover={{ y: -2 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          Ana Sayfa
        </motion.a>
      </div>
    </nav>
  );
}