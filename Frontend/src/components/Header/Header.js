
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOverHero, setIsOverHero] = useState(true);
  const [scrollingDown, setScrollingDown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let ticking = false;
    
    const controlHeader = () => {
      const currentScrollY = window.scrollY;
      
      // Show header when at the top
      if (currentScrollY < 10) {
        setIsVisible(true);
        setScrollingDown(false);
      }
      // Hide header when scrolling down (more than 100px)
      else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setScrollingDown(true);
        setIsVisible(false);
      }
      // Show header when scrolling up
      else if (currentScrollY < lastScrollY) {
        setScrollingDown(false);
        setIsVisible(true);
      }
      
      // Check if header is over hero section (approximately 100vh)
      const heroHeight = window.innerHeight;
      setIsOverHero(currentScrollY < heroHeight - 100);
      
      setLastScrollY(currentScrollY);
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(controlHeader);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.header
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className={`header ${isOverHero ? 'integrated-hero' : 'floating-overlay'}`}
        >
          <div className="header-container">
            {/* Logo */}
            <div className="logo" onClick={() => navigate('/')}>
              <span className="logo-text">Evecta</span>
            </div>

            {/* Navigation Menu */}
            <nav className="header-nav">
              <ul className="nav-list">
                <li><a href="#about" className="nav-link">About</a></li>
                <li><a href="#feature" className="nav-link">Feature</a></li>
                <li><a href="#how-it-works" className="nav-link">How it Works</a></li>
              </ul>
            </nav>

            {/* Right side actions */}
            <div className="header-actions">

              {/* Mobile menu button */}
              <button 
                className="mobile-menu-btn"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                <span className={`hamburger ${isMenuOpen ? 'active' : ''}`}>
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mobile-menu"
              >
                <ul className="mobile-nav-list">
                  <li><a href="#about">About</a></li>
                  <li><a href="#feature">Feature</a></li>
                  <li><a href="#how-it-works">How it Works</a></li>
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.header>
      )}
    </AnimatePresence>
  );
};

export default Header;
