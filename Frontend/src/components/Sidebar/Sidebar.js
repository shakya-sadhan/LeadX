import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import MessageBox from '../MessageBox/MessageBox';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, logout, user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  const [signupForm, setSignupForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [messageBox, setMessageBox] = useState({
    isVisible: false,
    type: 'success',
    message: ''
  });

  const menuItems = [
    { 
      id: 'about', 
      label: 'About Us', 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
          <path d="M12 17h.01"/>
        </svg>
      ), 
      path: '/about' 
    },
    { 
      id: 'blog', 
      label: 'Blog', 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10,9 9,9 8,9"/>
        </svg>
      ), 
      path: '/blog' 
    }
  ];


  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleAddClick = () => {
    // Navigate to chat page
    navigate('/chat');
  };

  const handleGoogleSignIn = () => {
    // Google Sign-In functionality
    console.log('Google Sign-In clicked');
    // You can integrate with Google OAuth here
    // For now, we'll just show a message
    setMessageBox({
      isVisible: true,
      type: 'success',
      message: 'Google Sign-In feature coming soon!'
    });
  };

  const handleSignIn = () => {
    setShowAuthModal(true);
  };

  const handleLogout = () => {
    logout();
    setMessageBox({
      isVisible: true,
      type: 'success',
      message: 'Logged out successfully!'
    });
    navigate('/');
  };

  const handleCloseModal = () => {
    setShowAuthModal(false);
    setErrors({});
    setLoginForm({ email: '', password: '' });
    setSignupForm({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
  };

  const handleCloseMessageBox = () => {
    setMessageBox({
      isVisible: false,
      type: 'success',
      message: ''
    });
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupForm(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateLogin = () => {
    const newErrors = {};
    
    if (!loginForm.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(loginForm.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!loginForm.password) {
      newErrors.password = 'Password is required';
    } else if (loginForm.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignup = () => {
    const newErrors = {};
    
    if (!signupForm.firstName) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!signupForm.lastName) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!signupForm.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(signupForm.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!signupForm.password) {
      newErrors.password = 'Password is required';
    } else if (signupForm.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (!signupForm.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (signupForm.password !== signupForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (validateLogin()) {
      const result = login(loginForm.email, loginForm.password);
      
      if (result.success) {
        setMessageBox({
          isVisible: true,
          type: 'success',
          message: result.message
        });
        handleCloseModal();
        // Navigate to dashboard after successful login
        navigate('/dashboard');
      } else {
        setMessageBox({
          isVisible: true,
          type: 'error',
          message: result.message
        });
      }
    }
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    if (validateSignup()) {
      console.log('Signup submitted:', signupForm);
      alert('Account created successfully! (This is a demo)');
      handleCloseModal();
    }
  };

  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-text">Evecta</span>
        </div>
      </div>

      {/* Add Button */}
      <div className="add-section">
        <button className="add-button" onClick={handleAddClick}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => handleNavigation(item.path)}
          >
            <div className="nav-icon-container">
              <span className="nav-icon">{item.icon}</span>
            </div>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Sign In/User Section */}
      <div className="signin-section">
        {user ? (
          <>
            <div className="user-info">
              <div className="user-avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div className="user-details">
                <span className="user-name">{user?.name || 'User'}</span>
                <span className="user-email">{user?.email}</span>
              </div>
            </div>
            <button className="logout-button" onClick={handleLogout} title="Logout">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16,17 21,12 16,7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </>
        ) : (
          <div className="signin-container">
            <button className="signin-button" onClick={handleSignIn}>
              <div className="signin-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
            </button>
            <span className="signin-label">Sign In</span>
          </div>
        )}
      </div>

      {/* Authentication Modal */}
      {showAuthModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2></h2>
            </div>

            <div className="auth-forms">
              {activeTab === 'login' ? (
                <form className="auth-form login-form" onSubmit={handleLoginSubmit}>
                  <div className="form-header">
                    <h3>Welcome Back</h3>
                    <button className="close-button" onClick={handleCloseModal}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                    <p>Sign in to your account</p>
                  </div>

                  {/* Google Sign In Button */}
                  <button type="button" className="google-signin-button" onClick={handleGoogleSignIn}>
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </button>

                  <div className="divider">
                    <span>or</span>
                  </div>

                  <div className="form-group">
                    <label htmlFor="login-email">Email Address</label>
                    <input
                      type="email"
                      id="login-email"
                      name="email"
                      value={loginForm.email}
                      onChange={handleLoginChange}
                      className={errors.email ? 'error' : ''}
                      placeholder="Enter your email"
                    />
                    {errors.email && <span className="error-message">{errors.email}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="login-password">Password</label>
                    <input
                      type="password"
                      id="login-password"
                      name="password"
                      value={loginForm.password}
                      onChange={handleLoginChange}
                      className={errors.password ? 'error' : ''}
                      placeholder="Enter your password"
                    />
                    {errors.password && <span className="error-message">{errors.password}</span>}
                  </div>

                  <div className="form-options">
                    <label className="checkbox-label">
                      <input type="checkbox" />
                      <span className="checkmark"></span>
                      Remember me
                    </label>
                    <a href="#" className="forgot-password">Forgot password?</a>
                  </div>

                  <button type="submit" className="submit-button">
                    Sign In
                  </button>

                  <div className="form-footer">
                    <p>Don't have an account? <button type="button" onClick={() => setActiveTab('signup')} className="link-button">Sign up</button></p>
                  </div>
                </form>
              ) : (
                <form className="auth-form signup-form" onSubmit={handleSignupSubmit}>
                  <div className="form-header">
                    <h3>Create Account</h3>
                    <button className="close-button" onClick={handleCloseModal}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                    <p>Join us today</p>
                  </div>

                  {/* Google Sign In Button */}
                  <button type="button" className="google-signin-button" onClick={handleGoogleSignIn}>
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </button>

                  <div className="divider">
                    <span>or</span>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="signup-firstName">First Name</label>
                      <input
                        type="text"
                        id="signup-firstName"
                        name="firstName"
                        value={signupForm.firstName}
                        onChange={handleSignupChange}
                        className={errors.firstName ? 'error' : ''}
                        placeholder="First name"
                      />
                      {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="signup-lastName">Last Name</label>
                      <input
                        type="text"
                        id="signup-lastName"
                        name="lastName"
                        value={signupForm.lastName}
                        onChange={handleSignupChange}
                        className={errors.lastName ? 'error' : ''}
                        placeholder="Last name"
                      />
                      {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="signup-email">Email Address</label>
                    <input
                      type="email"
                      id="signup-email"
                      name="email"
                      value={signupForm.email}
                      onChange={handleSignupChange}
                      className={errors.email ? 'error' : ''}
                      placeholder="Enter your email"
                    />
                    {errors.email && <span className="error-message">{errors.email}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="signup-password">Password</label>
                    <input
                      type="password"
                      id="signup-password"
                      name="password"
                      value={signupForm.password}
                      onChange={handleSignupChange}
                      className={errors.password ? 'error' : ''}
                      placeholder="Create a password"
                    />
                    {errors.password && <span className="error-message">{errors.password}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="signup-confirmPassword">Confirm Password</label>
                    <input
                      type="password"
                      id="signup-confirmPassword"
                      name="confirmPassword"
                      value={signupForm.confirmPassword}
                      onChange={handleSignupChange}
                      className={errors.confirmPassword ? 'error' : ''}
                      placeholder="Confirm your password"
                    />
                    {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                  </div>

                  <div className="form-options">
                    <label className="checkbox-label">
                      <input type="checkbox" required />
                      <span className="checkmark"></span>
                      I agree to the <a href="#" className="terms-link">Terms of Service</a> and <a href="#" className="terms-link">Privacy Policy</a>
                    </label>
                  </div>

                  <button type="submit" className="submit-button">
                    Create Account
                  </button>

                  <div className="form-footer">
                    <p>Already have an account? <button type="button" onClick={() => setActiveTab('login')} className="link-button">Sign in</button></p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Custom Message Box */}
      <MessageBox
        type={messageBox.type}
        message={messageBox.message}
        isVisible={messageBox.isVisible}
        onClose={handleCloseMessageBox}
      />
    </div>
  );
};

export default Sidebar;
