import React, { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './HowItWorks.css';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const HowItWorks = () => {
  const containerRef = useRef(null);
  const cardsRef = useRef([]);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  // Card data
  const cards = [
    {
      id: 1,
      title: "Capture Leads",
      subtitle: "Collect prospects from websites, social media, and campaigns into one place.",
      description: "",
      features: [],
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop&auto=format&q=80",
      color: "#6366f1"
    },
    {
      id: 2,
      title: "Nurture & Engage",
      subtitle: "Send timely emails and follow-ups to build trust and keep leads interested.",
      description: "",
      features: [],
      image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop&auto=format&q=80",
      color: "#8b5cf6"
    },
    {
      id: 3,
      title: "Convert to Sales",
      subtitle: "Hand warm leads to your sales team and track every deal to closure.",
      description: "",
      features: [],
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

  // GSAP ScrollTrigger pinned animation setup
  useEffect(() => {
    if (isReducedMotion) return;

    const cards = cardsRef.current;
    const title = containerRef.current?.querySelector('.how-it-works-title');
    const section = containerRef.current;
    
    if (!cards.length || !section) return;

    // Calculate section height dynamically based on number of cards
    const totalCards = cards.length;
    // Set height to exactly match the ScrollTrigger end point (300vh for 3 cards)
    // This will be the total document height - no content below
    const sectionHeight = "300vh";
    gsap.set(section, { height: sectionHeight });
    
    // Set the dedicated container height instead of body
    gsap.set("#how-it-works.scroll-container", { height: "300vh" });

    // Animate title on load
    if (title) {
      gsap.fromTo(title, 
        { opacity: 0, y: 30 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.8, 
          ease: "power2.out",
          delay: 0.2
        }
      );
    }

    // Set initial state for all cards - all hidden initially
    gsap.set(cards, {
      opacity: 0,
      scale: 0.9,
      y: 30,
      transformOrigin: 'center center',
      position: 'absolute',
      top: '0',
      left: '50%',
      transform: 'translate(-50%, 0)',
      zIndex: 1
    });

    // Create timeline for the entire pinned section
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "+=300%", // Exactly 300% for three cards - one viewport per card
        pin: true,
        scrub: 1, // Smooth scrubbing with slight delay
        pinSpacing: false, // Disable pin spacing to prevent extra height
        anticipatePin: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          const cardIndex = Math.min(Math.floor(progress * totalCards), totalCards - 1);
          const cardProgress = (progress * totalCards) % 1;
          
          // Hide all cards first
          cards.forEach((card, index) => {
            if (card) {
              gsap.set(card, { 
                opacity: 0, 
                scale: 0.9, 
                y: 30,
                zIndex: 1
              });
            }
          });
          
          // Show the current card with smooth transitions
          if (cards[cardIndex]) {
            // Calculate smooth easing for the card transition
            const easeProgress = gsap.parseEase("power2.out")(cardProgress);
            
            const cardOpacity = Math.min(easeProgress * 2, 1);
            const cardScale = 0.9 + (easeProgress * 0.1);
            const cardY = 30 - (easeProgress * 30);
            
            gsap.set(cards[cardIndex], {
              opacity: cardOpacity,
              scale: cardScale,
              y: cardY,
              zIndex: 10
            });
          }
          
          // Handle the transition between cards - start next card fade-in when current is 70% complete
          if (cardProgress > 0.7 && cardIndex < totalCards - 1) {
            const nextCardIndex = cardIndex + 1;
            if (cards[nextCardIndex]) {
              const nextCardProgress = (cardProgress - 0.7) / 0.3; // 0 to 1 over the last 30%
              const nextEaseProgress = gsap.parseEase("power2.out")(nextCardProgress);
              
              const nextCardOpacity = Math.min(nextEaseProgress * 2, 1);
              const nextCardScale = 0.9 + (nextEaseProgress * 0.1);
              const nextCardY = 30 - (nextEaseProgress * 30);
              
              gsap.set(cards[nextCardIndex], {
                opacity: nextCardOpacity,
                scale: nextCardScale,
                y: nextCardY,
                zIndex: 10
              });
            }
          }
          
          // Ensure the third card is fully visible when we reach the end
          if (progress >= 0.9) {
            const lastCardIndex = totalCards - 1;
            if (cards[lastCardIndex]) {
              gsap.set(cards[lastCardIndex], {
                opacity: 1,
                scale: 1,
                y: 0,
                zIndex: 10
              });
            }
          }
        }
      }
    });

    // Cleanup function
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      // Reset container height to auto on unmount
      gsap.set("#how-it-works.scroll-container", { height: "auto" });
    };
  }, [isReducedMotion]);

  return (
    <section 
      ref={containerRef}
      id="how-it-works"
      className="how-it-works-section scroll-container"
      role="region"
      aria-label="How it works"
    >
      <div className="how-it-works-container">
          <div className="how-it-works-content">
          <h2 className="how-it-works-title">
              How It Works
          </h2>
            
            <div className="cards-container">
              {cards.map((card, index) => (
                <Card
                  key={card.id}
                ref={el => cardsRef.current[index] = el}
                  card={card}
                  index={index}
                  isReducedMotion={isReducedMotion}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Individual Card Component
const Card = React.forwardRef(({ card, index, isReducedMotion }, ref) => {
  return (
    <div
      ref={ref}
      className="how-it-works-card"
      role="article"
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
        </div>
      </div>
    </div>
  );
});

export default HowItWorks;
