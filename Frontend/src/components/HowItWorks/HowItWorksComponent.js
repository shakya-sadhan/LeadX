import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring, useAnimation } from 'framer-motion';
import './HowItWorks.css';

const HowItWorksComponent = () => {
  const containerRef = useRef(null);
  const [activeCard, setActiveCard] = useState(0);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  
  const controls = useAnimation();
  const scrollY = useMotionValue(0);
  const scrollYProgress = useSpring(scrollY, { stiffness: 100, damping: 30, restDelta: 0.001 });

  // Card data
  const cards = [
    {
      id: 1,
      title: "Lead Capture",
      subtitle: "Multi-Channel Collection",
      description: "Capture leads from multiple channels and score them in real-time for maximum conversion.",
      features: [
        "Multi-channel lead collection",
        "Real-time lead scoring",
        "Automated data validation",
        "Instant lead assignment",
        "CRM integration"
      ],
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop&auto=format&q=80",
      color: "#6366f1"
    },
    {
      id: 2,
      title: "Lead Nurturing",
      subtitle: "Personalized Engagement",
      description: "Personalized engagement through automated sequences and multi-channel campaigns.",
      features: [
        "Automated email sequences",
        "Behavioral trigger campaigns",
        "Multi-channel touchpoints",
        "Personalized content delivery",
        "Lead scoring optimization"
      ],
      image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop&auto=format&q=80",
      color: "#8b5cf6"
    },
    {
      id: 3,
      title: "Sales Conversion",
      subtitle: "Seamless Handoff",
      description: "Seamless handoff to sales teams with complete context and automated assignment.",
      features: [
        "Complete lead context transfer",
        "Automated sales team assignment",
        "Real-time lead activity tracking",
        "Conversion analytics and reporting",
        "Sales team performance insights"
      ],
      image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=600&fit=crop&auto=format&q=80",
      color: "#06b6d4"
    }
  ];

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);
    
    const handleChange = (e) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Touch device detection
  useEffect(() => {
    const checkTouchDevice = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    
    checkTouchDevice();
    window.addEventListener('resize', checkTouchDevice);
    return () => window.removeEventListener('resize', checkTouchDevice);
  }, []);

  // Scroll progress tracking
  const { scrollYProgress: containerScrollProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Update active card based on scroll progress
  useEffect(() => {
    if (isReducedMotion) return;

    const unsubscribe = containerScrollProgress.onChange((latest) => {
      const cardCount = cards.length;
      const cardProgress = latest * cardCount;
      const newActiveCard = Math.min(
        Math.floor(cardProgress + 0.5),
        cardCount - 1
      );
      
      if (newActiveCard !== activeCard) {
        setActiveCard(newActiveCard);
      }
    });

    return unsubscribe;
  }, [containerScrollProgress, activeCard, cards.length, isReducedMotion]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (isReducedMotion) return;

    switch (e.key) {
      case 'ArrowDown':
      case ' ':
        e.preventDefault();
        if (activeCard < cards.length - 1) {
          setActiveCard(activeCard + 1);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (activeCard > 0) {
          setActiveCard(activeCard - 1);
        }
        break;
      case 'Home':
        e.preventDefault();
        setActiveCard(0);
        break;
      case 'End':
        e.preventDefault();
        setActiveCard(cards.length - 1);
        break;
    }
  }, [activeCard, cards.length, isReducedMotion]);

  // Touch swipe handling
  const handleTouchStart = (e) => {
    if (isReducedMotion) return;
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e) => {
    if (isReducedMotion) return;
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (isReducedMotion || !touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && activeCard < cards.length - 1) {
      setActiveCard(activeCard + 1);
    }
    if (isRightSwipe && activeCard > 0) {
      setActiveCard(activeCard - 1);
    }
  };

  // Pagination dot click handler
  const handleDotClick = useCallback((index) => {
    if (isReducedMotion) return;
    setActiveCard(index);
  }, [isReducedMotion]);

  // Focus management
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('keydown', handleKeyDown);
      container.addEventListener('touchstart', handleTouchStart, { passive: true });
      container.addEventListener('touchmove', handleTouchMove, { passive: true });
      container.addEventListener('touchend', handleTouchEnd, { passive: true });
      
      return () => {
        container.removeEventListener('keydown', handleKeyDown);
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [handleKeyDown]);

  return (
    <section 
      ref={containerRef}
      className="how-it-works-section"
      tabIndex={0}
      role="region"
      aria-label="How it works"
      aria-live="polite"
    >
      <div className="how-it-works-container">
        <div className="how-it-works-sticky">
          <div className="how-it-works-content">
            <motion.h2 
              className="how-it-works-title"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 0.9, 0.35, 1] }}
              viewport={{ once: true }}
            >
              How It Works
            </motion.h2>
            
            <div className="cards-container">
              {cards.map((card, index) => (
                <Card
                  key={card.id}
                  card={card}
                  index={index}
                  isActive={index === activeCard}
                  isVisible={Math.abs(index - activeCard) <= 1}
                  isReducedMotion={isReducedMotion}
                  isTouchDevice={isTouchDevice}
                />
              ))}
            </div>

            {/* Pagination dots */}
            <div className="pagination-dots" role="tablist" aria-label="Card navigation">
              {cards.map((_, index) => (
                <button
                  key={index}
                  className={`pagination-dot ${index === activeCard ? 'active' : ''}`}
                  onClick={() => handleDotClick(index)}
                  role="tab"
                  aria-selected={index === activeCard}
                  aria-label={`Go to card ${index + 1}`}
                  tabIndex={index === activeCard ? 0 : -1}
                />
              ))}
            </div>

            {/* Progress indicator */}
            <div className="progress-indicator" role="progressbar" aria-valuenow={activeCard + 1} aria-valuemin={1} aria-valuemax={cards.length}>
              <div 
                className="progress-bar"
                style={{ 
                  width: `${((activeCard + 1) / cards.length) * 100}%`,
                  transition: isReducedMotion ? 'none' : 'width 0.55s cubic-bezier(0.22, 0.9, 0.35, 1)'
                }}
              />
            </div>

            {/* Instructions */}
            <div className="instructions" aria-live="polite">
              <p>Use arrow keys, space bar, or swipe to navigate between cards</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Individual Card Component
const Card = ({ card, index, isActive, isVisible, isReducedMotion, isTouchDevice }) => {
  const cardRef = useRef(null);
  
  // Don't render cards that are not visible (performance optimization)
  if (!isVisible && !isReducedMotion && !isTouchDevice) return null;

  // Animation variants
  const cardVariants = {
    inactive: {
      y: 40,
      scale: 0.95,
      filter: "blur(2px)",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
      zIndex: 1,
      transition: {
        duration: 0.55,
        ease: [0.22, 0.9, 0.35, 1]
      }
    },
    active: {
      y: 0,
      scale: 1.05,
      filter: "blur(0px)",
      boxShadow: "0 24px 48px rgba(0, 0, 0, 0.15)",
      zIndex: 10,
      transition: {
        duration: 0.55,
        ease: [0.22, 0.9, 0.35, 1]
      }
    },
    enter: {
      y: 60,
      scale: 0.9,
      filter: "blur(3px)",
      opacity: 0,
      zIndex: 0,
      transition: {
        duration: 0.8,
        ease: [0.22, 0.9, 0.35, 1]
      }
    }
  };

  return (
    <motion.div
      ref={cardRef}
      className="how-it-works-card"
      variants={cardVariants}
      initial="enter"
      animate={isActive ? "active" : "inactive"}
      style={{
        position: 'absolute',
        width: '100%',
        maxWidth: '500px',
        height: 'auto',
        zIndex: isActive ? 10 : 1,
        willChange: 'transform, filter, box-shadow'
      }}
      whileHover={!isTouchDevice && !isReducedMotion ? { 
        scale: isActive ? 1.08 : 1.02,
        transition: { 
          type: "spring", 
          stiffness: 300, 
          damping: 20,
          duration: 0.3
        }
      } : {}}
      role="tabpanel"
      aria-hidden={!isActive}
      aria-label={`${card.title} - ${card.subtitle}`}
    >
      <div className="card-background" style={{ backgroundColor: card.color }}>
        <img 
          src={card.image} 
          alt={card.title} 
          className="card-image"
          loading="lazy"
        />
        <div className="card-overlay" />
      </div>
      
      <div className="card-content">
        <div className="card-number">0{card.id}</div>
        <div className="card-text">
          <h3 className="card-title">{card.title}</h3>
          <p className="card-subtitle">{card.subtitle}</p>
          <p className="card-description">{card.description}</p>
          <ul className="card-features">
            {card.features.map((feature, featureIndex) => (
              <li key={featureIndex} className="feature-item">
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

export default HowItWorksComponent;
