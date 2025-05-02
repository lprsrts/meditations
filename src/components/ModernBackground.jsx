import { useEffect, useRef, useState } from 'react';

export default function ModernBackground() {
  const canvasRef = useRef(null);
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
    
    // Also listen for direct localStorage changes
    const handleStorageChange = () => {
      const theme = localStorage.getItem('theme') || 'light';
      setIsDarkMode(theme === 'dark');
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('themeChange', handleThemeChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Get computed CSS colors directly from the current theme
    const getComputedColor = (colorVar) => {
      return getComputedStyle(document.documentElement).getPropertyValue(colorVar).trim();
    };
    
    // Get colors from CSS custom properties
    const accentColor = getComputedColor('--color-accent');
    const neutralColor = getComputedColor('--color-neutral');
    
    // Performance optimizations - limit gradients based on screen size
    const screenArea = window.innerWidth * window.innerHeight;
    // Use 2 gradients for smaller screens, 3 for larger ones
    const gradientCount = screenArea < 500000 ? 2 : 3;
    
    // Animation variables
    let animationFrameId;
    const gradients = [];
    
    // Create initial gradients
    for (let i = 0; i < gradientCount; i++) {
      // Convert hex colors to rgba
      const hexToRgba = (hex, alpha) => {
        // Default fallback colors in case computed styles aren't available
        if (!hex || hex === '') {
          return isDarkMode ? 
            `rgba(116, 141, 146, ${alpha})` : // Default neutral
            `rgba(18, 78, 102, ${alpha})`;    // Default accent
        }
        
        // Handle shorthand hex (e.g., #123)
        if (hex.length === 4) {
          hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
        }
        
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      };
      
      gradients.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 100 + Math.random() * 300,
        // Slow down the movement for a more subtle effect
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        color: isDarkMode ? 
          hexToRgba(neutralColor, 0.1 + Math.random() * 0.1) : // Neutral color in dark mode
          hexToRgba(accentColor, 0.05 + Math.random() * 0.06)  // Accent color in light mode
      });
    }
    
    // Track time for frame limiting
    let lastFrameTime = 0;
    const fpsLimit = 30; // Limit frames per second
    
    // Animation function with frame rate limiting
    const animate = (timestamp) => {
      // Limit frame rate
      if (timestamp - lastFrameTime < 1000 / fpsLimit) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }
      
      lastFrameTime = timestamp;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw gradients
      gradients.forEach(gradient => {
        // Update position
        gradient.x += gradient.vx;
        gradient.y += gradient.vy;
        
        // Bounce off edges
        if (gradient.x < 0 || gradient.x > canvas.width) gradient.vx *= -1;
        if (gradient.y < 0 || gradient.y > canvas.height) gradient.vy *= -1;
        
        // Draw gradient
        const radGrad = ctx.createRadialGradient(
          gradient.x, gradient.y, 0,
          gradient.x, gradient.y, gradient.size
        );
        
        radGrad.addColorStop(0, gradient.color);
        radGrad.addColorStop(1, 'transparent');
        
        ctx.fillStyle = radGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    // Start animation
    animationFrameId = requestAnimationFrame(animate);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDarkMode]);
  
  return (
    <div className="background-container">
      <canvas ref={canvasRef} className="gradient-canvas" />
    </div>
  );
}