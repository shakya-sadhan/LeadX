import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import Lenis from '@studio-freight/lenis';
import './HowItWorksParallax.css';

/**
 * HowItWorksParallax - A scroll-linked parallax component for animating cards
 * 
 * Features:
 * - Sticky container with scroll-linked parallax effects
 * - GPU-optimized animations using only transform and opacity
 * - Spring-eased entrance animations with staggered delays
 * - Respects prefers-reduced-motion accessibility setting
 * - Smooth scrolling with Lenis integration
 * 
 * @param {Object} props
 * @param {Array} props.cards - Array of React elements with .how-card class
 * @param {string} props.className - Additional CSS class for the container
 * @param {number} props.staggerDelay - Delay between card animations (default: 0.08s)
 * @param {number} props.translateRange - Y-axis translation range (default: 22px)
 * @param {number} props.scaleRange - Scale range (default: 0.03)
 * @param {number} props.opacityRange - Opacity range (default: 0.25)
 */
const HowItWorksParallax = ({ 
  cards = [], 
  className = '',
  staggerDelay = 0.08,
  translateRange = 22,
  scaleRange = 0.03,
  opacityRange = 0.25
}) => {
  const containerRef = useRef(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [lenis, setLenis] = useState(null);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Initialize Lenis smooth scrolling (disabled for reduced motion)
  useEffect(() => {
    if (reducedMotion) return;

    const lenisInstance = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    setLenis(lenisInstance);

    function raf(time) {
      lenisInstance.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenisInstance.destroy();
      setLenis(null);
    };
  }, [reducedMotion]);

  // Scroll progress for the container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Spring configuration for smooth animations
  const springConfig = {
    type: "spring",
    stiffness: 160,
    damping: 22,
    mass: 1
  };

  // Initial animation state
  const initialAnimation = {
    opacity: 0,
    y: 18,
    scale: 0.995
  };

  // Final animation state
  const finalAnimation = {
    opacity: 1,
    y: 0,
    scale: 1
  };

  return (
    <div 
      ref={containerRef}
      className={`how-it-works-parallax-container ${className}`}
    >
      <div className="how-it-works-parallax-sticky">
        {cards.map((card, index) => {
          // Create individual scroll progress for each card
          const cardRef = useRef(null);
          const { scrollYProgress: cardProgress } = useScroll({
            target: cardRef,
            offset: ["start end", "end start"]
          });

          // Transform values for parallax effects
          const y = useTransform(
            cardProgress, 
            [0, 1], 
            [translateRange, -translateRange]
          );
          
          const scale = useTransform(
            cardProgress, 
            [0, 0.5, 1], 
            [1 - scaleRange, 1 + scaleRange, 1 - scaleRange]
          );
          
          const opacity = useTransform(
            cardProgress, 
            [0, 0.2, 0.8, 1], 
            [1 - opacityRange, 1, 1, 1 - opacityRange]
          );

          return (
            <motion.div
              key={index}
              ref={cardRef}
              className="how-it-works-parallax-card"
              style={{
                y: reducedMotion ? 0 : y,
                scale: reducedMotion ? 1 : scale,
                opacity: reducedMotion ? 1 : opacity,
              }}
              initial={reducedMotion ? finalAnimation : initialAnimation}
              animate={finalAnimation}
              transition={{
                ...springConfig,
                delay: reducedMotion ? 0 : index * staggerDelay
              }}
              whileInView={{
                ...finalAnimation,
                transition: {
                  ...springConfig,
                  delay: reducedMotion ? 0 : index * staggerDelay
                }
              }}
              viewport={{ 
                once: false, 
                margin: "-100px",
                amount: 0.3
              }}
            >
              {card}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default HowItWorksParallax;
