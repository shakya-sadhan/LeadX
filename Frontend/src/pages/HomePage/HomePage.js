import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, useScroll, useTransform, useSpring } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Lenis from 'lenis';
import './HomePage.css';

const HomePage = () => {
  const aboutRef = useRef(null);
  const isInView = useInView(aboutRef, { once: true, threshold: 0.3 });
  const trackRef = useRef(null);
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [activeCard, setActiveCard] = useState(0); // Start with first card active
  const [currentIndex, setCurrentIndex] = useState(0); // Track current position in carousel
  const [activeFeature, setActiveFeature] = useState(0); // Track active feature image
  const [currentFeature, setCurrentFeature] = useState(0); // Track which feature card to show
  const [activeScrollSection, setActiveScrollSection] = useState(1); // Track which scroll section is active
  
  // Parallax refs
  const howItWorksRef = useRef(null);
  const card1Ref = useRef(null);
  const card2Ref = useRef(null);
  const card3Ref = useRef(null);

  // Lenis smooth scroll setup
  useEffect(() => {
    const lenis = new Lenis({
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

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  // Scroll-based parallax animations
  const { scrollYProgress: howItWorksProgress } = useScroll({
    target: howItWorksRef,
    offset: ["start end", "end start"]
  });

  const { scrollYProgress: card1Progress } = useScroll({
    target: card1Ref,
    offset: ["start end", "end start"]
  });

  const { scrollYProgress: card2Progress } = useScroll({
    target: card2Ref,
    offset: ["start end", "end start"]
  });

  const { scrollYProgress: card3Progress } = useScroll({
    target: card3Ref,
    offset: ["start end", "end start"]
  });

  // Transform values for parallax effects
  const card1Y = useTransform(card1Progress, [0, 1], [100, -100]);
  const card1Scale = useTransform(card1Progress, [0, 0.5, 1], [0.8, 1, 0.8]);
  const card1Opacity = useTransform(card1Progress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  const card2Y = useTransform(card2Progress, [0, 1], [120, -120]);
  const card2Scale = useTransform(card2Progress, [0, 0.5, 1], [0.8, 1, 0.8]);
  const card2Opacity = useTransform(card2Progress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  const card3Y = useTransform(card3Progress, [0, 1], [140, -140]);
  const card3Scale = useTransform(card3Progress, [0, 0.5, 1], [0.8, 1, 0.8]);
  const card3Opacity = useTransform(card3Progress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  // Spring animations for smooth entrance
  const springConfig = {
    type: "spring",
    stiffness: 100,
    damping: 20,
    mass: 1
  };


  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX);
    setScrollLeft(trackRef.current.scrollLeft);
    // Pause the animation when dragging
    if (trackRef.current) {
      trackRef.current.classList.add('paused');
    }
    e.preventDefault();
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    // Resume animation when mouse leaves
    if (trackRef.current) {
      trackRef.current.classList.remove('paused');
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    // Resume animation when mouse is released
    if (trackRef.current) {
      trackRef.current.classList.remove('paused');
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX;
    const walk = (x - startX) * 1.5;
    trackRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX);
    setScrollLeft(trackRef.current.scrollLeft);
    // Pause the animation when dragging
    if (trackRef.current) {
      trackRef.current.classList.add('paused');
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.touches[0].pageX;
    const walk = (x - startX) * 1.5;
    trackRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    // Resume animation when touch ends
    if (trackRef.current) {
      trackRef.current.classList.remove('paused');
    }
  };

  const handleCardClick = (index) => {
    setActiveCard(index);
  };

  // Auto-play functionality - change active card every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % 5; // 5 total cards, loops back to 0 after 4
        setActiveCard(nextIndex);
        return nextIndex;
      });
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, []);

  // Enhanced scroll detection for compact sections with throttling
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentScroll = window.scrollY;
          const howItWorksSection = document.querySelector('.how-it-works-section');
          
          if (!howItWorksSection) {
            ticking = false;
            return;
          }
          
          const sectionTop = howItWorksSection.offsetTop;
          const sectionHeight = howItWorksSection.offsetHeight;
          const relativeScroll = currentScroll - sectionTop;
          
          // Calculate which section should be active based on scroll position within the section
          const sectionProgress = relativeScroll / sectionHeight;
          
          // Much more responsive thresholds for faster section switching
          if (sectionProgress < 0.08) {
            setActiveScrollSection(1); // Lead Capture
          } else if (sectionProgress < 0.25) {
            setActiveScrollSection(2); // Lead Nurturing
          } else if (sectionProgress < 0.45) {
            setActiveScrollSection(3); // Sales Conversion
          } else {
            setActiveScrollSection(3); // Keep last section active
          }
          
          ticking = false;
        });
        ticking = true;
      }
    };

    // Initial call to set the correct section on load
    handleScroll();
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  // Feature data for the main card
  const getFeatures = () => {
    return [
      {
        id: 1,
        title: "Pioneers",
        description: "Creating industry narratives that others follow. We paved the path for creative SEO and multi-channel search.",
        subDescription: "First search-first agency to win a Cannes Lion.",
        image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=500&fit=crop&auto=format&q=80"
      },
      {
        id: 2,
        title: "Award Winning",
        description: "79 awards and counting. Voted The Drum's best agency outside of London.",
        subDescription: "Official judges for Global Search Awards and Global Content Marketing Awards.",
        image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=500&h=500&fit=crop&auto=format&q=80"
      },
      {
        id: 3,
        title: "Innovation",
        description: "Pushing boundaries with new technologies to stay ahead in digital marketing.",
        subDescription: "AI-powered solutions and cutting-edge analytics for today's businesses.",
        image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=500&h=500&fit=crop&auto=format&q=80"
      },
      {
        id: 4,
        title: "Results",
        description: "Data-driven approach delivering measurable results and sustainable growth.",
        subDescription: "Every campaign optimized for maximum ROI with transparent reporting.",
        image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&h=500&fit=crop&auto=format&q=80"
      }
    ];
  };

  // Features will only change when user clicks arrows or indicators
  // No automatic scroll-triggered changes

  // How it Works data
  const getHowItWorksData = () => {
    return [
      {
        id: 1,
        title: "LEAD CAPTURE",
        description: "Automatically capture leads from multiple channels and score them in real-time for maximum conversion potential.",
        icon: (
          <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2"/>
            <circle cx="12" cy="12" r="2" fill="currentColor"/>
          </svg>
        )
      },
      {
        id: 2,
        title: "LEAD NURTURING",
        description: "Personalized engagement through automated sequences and multi-channel campaigns tailored to lead behavior.",
        icon: (
          <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )
      },
      {
        id: 3,
        title: "LEAD QUALIFICATION",
        description: "AI-powered scoring and automated workflows to identify high-value prospects and prioritize follow-up.",
        icon: (
          <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )
      },
      {
        id: 4,
        title: "SALES CONVERSION",
        description: "Seamless handoff to sales teams with complete context and automated assignment for optimal results.",
        icon: (
          <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 1V23M17 5H9.5C8.11929 5 7 6.11929 7 7.5S8.11929 10 9.5 10H14.5C15.8807 10 17 11.1193 17 12.5S15.8807 15 14.5 15H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )
      }
    ];
  };

  // Problems data for the horizontal scrollable layout
  const getProblems = () => {
    return [
      { 
        id: 1, 
        title: "Lost Leads", 
        description: "Leads slip through the cracks without proper tracking systems.",
        image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop&auto=format&q=80"
      },
      { 
        id: 2, 
        title: "Poor Follow-up", 
        description: "Inconsistent follow-up processes lead to missed opportunities.",
        image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&h=400&fit=crop&auto=format&q=80"
      },
      { 
        id: 3, 
        title: "No Analytics", 
        description: "Lack of data insights makes optimization impossible.",
        image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop&auto=format&q=80"
      },
      { 
        id: 4, 
        title: "Manual Tracking", 
        description: "Time-consuming manual processes reduce efficiency.",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop&auto=format&q=80"
      },
      { 
        id: 5, 
        title: "Low Conversion", 
        description: "Poor lead nurturing results in lost revenue.",
        image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&h=400&fit=crop&auto=format&q=80"
      }
    ];
  };

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero">


        {/* Transparent Sales Lead Management Image */}
        <div className="hero-transparent-image">
          <img 
            src="/hero.jpg" 
            alt="Sales Lead Management" 
            className="transparent-bg-image"
          />
        </div>


        {/* Hero Content Container */}
        <div className="hero-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hero-content"
          >
            {/* Main Heading - Rise at Seven Style */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="hero-title"
            >
              We Create
              <span className="title-highlight">
                Sales Leaders
                <img
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=120&h=120&fit=crop&auto=format"
                  alt="Sales Leaders"
                  className="sales-image"
                />
              </span>
            </motion.h1>

            {/* Sub Heading - Rise at Seven Style */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="hero-subtitle"
            >
              on every searchable platform
            </motion.p>

            {/* CTA Button - Rise at Seven Style */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="hero-cta"
            >
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  backgroundColor: "#ffffff",
                  color: "#000000"
                }}
                whileTap={{ scale: 0.98 }}
                className="hero-button"
              >
                Get In Touch
                <svg 
                  width="12" 
                  height="12" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="button-arrow"
                >
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>


      {/* About Section */}
      <section id="about" ref={aboutRef} className="about-section">
        <div className="about-container">
          <div className="about-content">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="about-description"
            >
              <p>
                Leads are everywhere—but without direction, they go nowhere. 
                Lead management makes sure every interaction is tracked, 
                nurtured, and converted into growth.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="about-title-section"
            >
              <h2 className="about-main-title">
                Turning Interest Into
                <span className="title-emphasis"> Opportunity</span>
                <img
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=80&h=80&fit=crop&auto=format"
                  alt="Opportunity"
                  className="about-image"
                />
              </h2>
              
              <div className="about-buttons">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="about-btn primary-btn"
                >
                  Learn More <span className="btn-arrow">↗</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="about-btn secondary-btn"
                >
                  Get Started <span className="btn-arrow">↗</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>


      {/* Features Section with Continuous Sliding */}
      <section id="feature" className="features-section">
        <div className="features-container">
          <h2 className="features-title">Features</h2>
          <p className="features-subtitle">Drag to explore all features • Hover to pause</p>
          <div className="sliding-container">
            <div 
              className="sliding-track"
              ref={trackRef}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            >
              <div className="sliding-content">
                <div className="feature-slide feature-slide-1">
                  <div className="slide-content">
                    <h3>Lead Scoring</h3>
                    <p>Automatically prioritize leads based on engagement and behavior patterns</p>
                  </div>
                </div>
                <div className="feature-slide feature-slide-2">
                  <div className="slide-content">
                    <h3>Real-time Tracking</h3>
                    <p>Monitor lead activities and interactions in real-time</p>
                  </div>
                </div>
                <div className="feature-slide feature-slide-3">
                  <div className="slide-content">
                    <h3>Automated Follow-up</h3>
                    <p>Set up automated email sequences and reminders</p>
                  </div>
                </div>
                <div className="feature-slide feature-slide-4">
                  <div className="slide-content">
                    <h3>Analytics Dashboard</h3>
                    <p>Comprehensive analytics and reporting to track performance</p>
                  </div>
                </div>
                <div className="feature-slide feature-slide-5">
                  <div className="slide-content">
                    <h3>CRM Integration</h3>
                    <p>Seamlessly integrate with popular CRM systems</p>
                  </div>
                </div>
                <div className="feature-slide feature-slide-6">
                  <div className="slide-content">
                    <h3>Lead Qualification</h3>
                    <p>Smart qualification processes to identify high-value prospects</p>
                  </div>
                </div>
                {/* Duplicate content for seamless loop */}
                <div className="feature-slide feature-slide-1">
                  <div className="slide-content">
                    <h3>Lead Scoring</h3>
                    <p>Automatically prioritize leads based on engagement and behavior patterns</p>
                  </div>
                </div>
                <div className="feature-slide feature-slide-2">
                  <div className="slide-content">
                    <h3>Real-time Tracking</h3>
                    <p>Monitor lead activities and interactions in real-time</p>
                  </div>
                </div>
                <div className="feature-slide feature-slide-3">
                  <div className="slide-content">
                    <h3>Automated Follow-up</h3>
                    <p>Set up automated email sequences and reminders</p>
                  </div>
                </div>
                <div className="feature-slide feature-slide-4">
                  <div className="slide-content">
                    <h3>Analytics Dashboard</h3>
                    <p>Comprehensive analytics and reporting to track performance</p>
                  </div>
                </div>
                <div className="feature-slide feature-slide-5">
                  <div className="slide-content">
                    <h3>CRM Integration</h3>
                    <p>Seamlessly integrate with popular CRM systems</p>
                  </div>
                </div>
                <div className="feature-slide feature-slide-6">
                  <div className="slide-content">
                    <h3>Lead Qualification</h3>
                    <p>Smart qualification processes to identify high-value prospects</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About-like Section */}
      <section className="about-like-section">
        <div className="about-like-container">
          <div className="about-like-content">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="about-like-description"
            >
              <p>
                Transform your lead management with intelligent automation. 
                Our platform ensures every lead is captured, nurtured, and converted 
                into meaningful business growth.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="about-like-title-section"
            >
              <h2 className="about-like-main-title">
                From Leads To
                <span className="title-emphasis"> Success</span>
                <img
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=80&h=80&fit=crop&auto=format"
                  alt="Success"
                  className="about-like-image"
                />
              </h2>
              
              <div className="about-like-buttons">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="about-like-btn primary-btn"
                >
                  Learn More <span className="btn-arrow">↗</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="about-like-btn secondary-btn"
                >
                  Get Started <span className="btn-arrow">↗</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it Works Section - Parallax Scroll Design */}
      <section id="how-it-works" ref={howItWorksRef} className="how-it-works-section">
        <div className="section-header">
          <h2>How It Works</h2>
          <div className="manual-navigation">
            <button 
              className={`nav-btn ${activeScrollSection === 1 ? 'active' : ''}`}
              onClick={() => setActiveScrollSection(1)}
            >
              Lead Capture
            </button>
            <button 
              className={`nav-btn ${activeScrollSection === 2 ? 'active' : ''}`}
              onClick={() => setActiveScrollSection(2)}
            >
              Lead Nurturing
            </button>
            <button 
              className={`nav-btn ${activeScrollSection === 3 ? 'active' : ''}`}
              onClick={() => setActiveScrollSection(3)}
            >
              Sales Conversion
            </button>
          </div>
        </div>
        <div className="how-it-works-container">
          {/* Section 1: Lead Capture - Light Beige */}
          <motion.div 
            ref={card1Ref}
            className="scroll-reveal-section section-1"
            style={{
              y: card1Y,
              scale: card1Scale,
              opacity: card1Opacity,
            }}
            initial={{ y: 100, scale: 0.8, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            transition={springConfig}
            whileInView={{ 
              y: 0, 
              scale: 1, 
              opacity: 1,
              transition: { ...springConfig, delay: 0.1 }
            }}
            viewport={{ once: false, margin: "-100px" }}
          >
            <div className="section-number">001</div>
            <div className="section-content">
              <h3 className="section-title">Lead Capture</h3>
              <p className="section-description">Automatically capture leads from multiple channels and score them in real-time for maximum conversion potential.</p>
              <ul className="section-features">
                <li>Multi-channel lead collection (website, social media, email)</li>
                <li>Real-time lead scoring and qualification</li>
                <li>Automated data validation and enrichment</li>
                <li>Instant lead assignment to sales teams</li>
                <li>CRM integration and synchronization</li>
              </ul>
            </div>
            <div className="section-visual">
              <div className="visual-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
            </div>
          </motion.div>

          {/* Section 2: Lead Nurturing - Medium Beige */}
          <motion.div 
            ref={card2Ref}
            className="scroll-reveal-section section-2"
            style={{
              y: card2Y,
              scale: card2Scale,
              opacity: card2Opacity,
            }}
            initial={{ y: 120, scale: 0.8, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            transition={springConfig}
            whileInView={{ 
              y: 0, 
              scale: 1, 
              opacity: 1,
              transition: { ...springConfig, delay: 0.2 }
            }}
            viewport={{ once: false, margin: "-100px" }}
          >
            <div className="section-number">002</div>
            <div className="section-content">
              <h3 className="section-title">Lead Nurturing</h3>
              <p className="section-description">Personalized engagement through automated sequences and multi-channel campaigns tailored to lead behavior and preferences.</p>
              <ul className="section-features">
                <li>Automated email sequences based on lead behavior</li>
                <li>Behavioral trigger campaigns and follow-ups</li>
                <li>Multi-touch engagement across all channels</li>
                <li>Personalized content delivery and recommendations</li>
                <li>Lead scoring updates and qualification tracking</li>
              </ul>
            </div>
            <div className="section-visual">
              <div className="visual-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
            </div>
          </motion.div>

          {/* Section 3: Sales Conversion - Darker Tan */}
          <motion.div 
            ref={card3Ref}
            className="scroll-reveal-section section-3"
            style={{
              y: card3Y,
              scale: card3Scale,
              opacity: card3Opacity,
            }}
            initial={{ y: 140, scale: 0.8, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            transition={springConfig}
            whileInView={{ 
              y: 0, 
              scale: 1, 
              opacity: 1,
              transition: { ...springConfig, delay: 0.3 }
            }}
            viewport={{ once: false, margin: "-100px" }}
          >
            <div className="section-number">003</div>
            <div className="section-content">
              <h3 className="section-title">Sales Conversion</h3>
              <p className="section-description">Seamless handoff to sales teams with complete context and automated assignment for optimal conversion results.</p>
              <ul className="section-features">
                <li>Intelligent lead routing to best-fit sales rep</li>
                <li>Complete lead context and interaction history</li>
                <li>Real-time sales team notifications and alerts</li>
                <li>Conversion tracking and performance analytics</li>
                <li>ROI measurement and campaign optimization</li>
              </ul>
            </div>
            <div className="section-visual">
              <div className="visual-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                </svg>
              </div>
            </div>
          </motion.div>
        </div>
      </section>


    </div>
  );
};

export default HomePage;
