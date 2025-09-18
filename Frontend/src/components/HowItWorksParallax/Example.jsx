import React from 'react';
import HowItWorksParallax from './HowItWorksParallax';
import './Example.css';

/**
 * Example usage of HowItWorksParallax component
 * This shows how to integrate the parallax component with existing card designs
 */
const HowItWorksParallaxExample = () => {
  // Example cards that match the existing design
  const cards = [
    <div className="how-card section-1">
      <div className="section-number">001</div>
      <div className="section-content">
        <h3 className="section-title">Lead Capture</h3>
        <p className="section-description">
          Automatically capture leads from multiple channels and score them in real-time for maximum conversion potential.
        </p>
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
    </div>,

    <div className="how-card section-2">
      <div className="section-number">002</div>
      <div className="section-content">
        <h3 className="section-title">Lead Nurturing</h3>
        <p className="section-description">
          Personalized engagement through automated sequences and multi-channel campaigns tailored to lead behavior and preferences.
        </p>
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
    </div>,

    <div className="how-card section-3">
      <div className="section-number">003</div>
      <div className="section-content">
        <h3 className="section-title">Sales Conversion</h3>
        <p className="section-description">
          Seamless handoff to sales teams with complete context and automated assignment for optimal conversion results.
        </p>
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
    </div>
  ];

  return (
    <div className="example-container">
      <div className="example-header">
        <h2>How It Works</h2>
        <p>Scroll to see the parallax animation in action</p>
      </div>
      
      <HowItWorksParallax 
        cards={cards}
        className="example-parallax"
        staggerDelay={0.08}
        translateRange={22}
        scaleRange={0.03}
        opacityRange={0.25}
      />
      
      <div className="example-footer">
        <p>Scroll up and down to see the smooth parallax effects</p>
      </div>
    </div>
  );
};

export default HowItWorksParallaxExample;
