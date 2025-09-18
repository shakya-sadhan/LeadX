import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import HowItWorks from '../../components/HowItWorks/HowItWorks';
import './AboutPage.css';

const AboutPage = () => {
  const aboutRef = useRef(null);
  const isInView = useInView(aboutRef, { once: true, threshold: 0.3 });
  const trackRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [activeCard, setActiveCard] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeFeature, setActiveFeature] = useState(0);
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX);
    setScrollLeft(trackRef.current.scrollLeft);
    if (trackRef.current) {
      trackRef.current.classList.add('paused');
    }
    e.preventDefault();
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    if (trackRef.current) {
      trackRef.current.classList.remove('paused');
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
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
    if (trackRef.current) {
      trackRef.current.classList.remove('paused');
    }
  };

  const handleCardClick = (index) => {
    setActiveCard(index);
  };

  // Auto-play functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % 5;
        setActiveCard(nextIndex);
        return nextIndex;
      });
    }, 3000);

    return () => clearInterval(interval);
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
    <div className="about-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background">
          <img 
            src="/hero.jpg" 
            alt="Sales Lead Management" 
            className="hero-bg-image"
          />
          <div className="hero-overlay"></div>
        </div>

        <div className="hero-content">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hero-title"
          >
            We Create Sales Leaders
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="hero-subtitle"
          >
            on every searchable platform
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="hero-cta-button"
          >
            Get In Touch
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17L17 7M17 7H7M17 7V17"/>
            </svg>
          </motion.button>
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
              </h2>
              
              <div className="about-buttons">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="about-btn primary-btn"
                >
                  Learn More
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="about-btn secondary-btn"
                >
                  Get Started
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="feature" className="features-section">
        <div className="features-container">
          <h2 className="features-title">FEATURES</h2>
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
                  <div className="feature-bg-image">
                    <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop&auto=format" alt="Lead Scoring" />
                  </div>
                  <div className="feature-overlay"></div>
                  <div className="slide-content">
                    <h3>LEAD SCORING</h3>
                    <p>Automatically prioritize leads based on engagement and behavior patterns</p>
                  </div>
                </div>
                <div className="feature-slide feature-slide-2">
                  <div className="feature-bg-image">
                    <img src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop&auto=format" alt="Real-time Tracking" />
                  </div>
                  <div className="feature-overlay"></div>
                  <div className="slide-content">
                    <h3>REAL-TIME TRACKING</h3>
                    <p>Monitor lead activities and interactions in real-time</p>
                  </div>
                </div>
                <div className="feature-slide feature-slide-3">
                  <div className="feature-bg-image">
                    <img src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=300&fit=crop&auto=format" alt="Automated Follow-up" />
                  </div>
                  <div className="feature-overlay"></div>
                  <div className="slide-content">
                    <h3>AUTOMATED FOLLOW-UP</h3>
                    <p>Set up automated email sequences and reminders</p>
                  </div>
                </div>
                <div className="feature-slide feature-slide-4">
                  <div className="feature-bg-image">
                    <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&auto=format" alt="Analytics Dashboard" />
                  </div>
                  <div className="feature-overlay"></div>
                  <div className="slide-content">
                    <h3>ANALYTICS DASHBOARD</h3>
                    <p>Comprehensive analytics and reporting to track performance</p>
                  </div>
                </div>
                <div className="feature-slide feature-slide-5">
                  <div className="feature-bg-image">
                    <img src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=300&fit=crop&auto=format" alt="CRM Integration" />
                  </div>
                  <div className="feature-overlay"></div>
                  <div className="slide-content">
                    <h3>CRM INTEGRATION</h3>
                    <p>Seamlessly integrate with popular CRM systems</p>
                  </div>
                </div>
                {/* Duplicate content for seamless loop */}
                <div className="feature-slide feature-slide-1">
                  <div className="feature-bg-image">
                    <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop&auto=format" alt="Lead Scoring" />
                  </div>
                  <div className="feature-overlay"></div>
                  <div className="slide-content">
                    <h3>LEAD SCORING</h3>
                    <p>Automatically prioritize leads based on engagement and behavior patterns</p>
                  </div>
                </div>
                <div className="feature-slide feature-slide-2">
                  <div className="feature-bg-image">
                    <img src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop&auto=format" alt="Real-time Tracking" />
                  </div>
                  <div className="feature-overlay"></div>
                  <div className="slide-content">
                    <h3>REAL-TIME TRACKING</h3>
                    <p>Monitor lead activities and interactions in real-time</p>
                  </div>
                </div>
                <div className="feature-slide feature-slide-3">
                  <div className="feature-bg-image">
                    <img src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=300&fit=crop&auto=format" alt="Automated Follow-up" />
                  </div>
                  <div className="feature-overlay"></div>
                  <div className="slide-content">
                    <h3>AUTOMATED FOLLOW-UP</h3>
                    <p>Set up automated email sequences and reminders</p>
                  </div>
                </div>
                <div className="feature-slide feature-slide-4">
                  <div className="feature-bg-image">
                    <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&auto=format" alt="Analytics Dashboard" />
                  </div>
                  <div className="feature-overlay"></div>
                  <div className="slide-content">
                    <h3>ANALYTICS DASHBOARD</h3>
                    <p>Comprehensive analytics and reporting to track performance</p>
                  </div>
                </div>
                <div className="feature-slide feature-slide-5">
                  <div className="feature-bg-image">
                    <img src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=300&fit=crop&auto=format" alt="CRM Integration" />
                  </div>
                  <div className="feature-overlay"></div>
                  <div className="slide-content">
                    <h3>CRM INTEGRATION</h3>
                    <p>Seamlessly integrate with popular CRM systems</p>
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
              </h2>
              
              <div className="about-like-buttons">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="about-like-btn primary-btn"
                >
                  Learn More
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="about-like-btn secondary-btn"
                >
                  Get Started
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <HowItWorks />

    </div>
  );
};


export default AboutPage;
