import React from 'react';
import './PageWrapper.css';

const PageWrapper = ({ children, className = '' }) => {
  return (
    <div className={`page-wrapper ${className}`}>
      {/* Main content area */}
      <div className="page-content">
        {children}
      </div>
    </div>
  );
};

export default PageWrapper;
