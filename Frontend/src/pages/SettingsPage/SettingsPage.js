import React, { useState } from 'react';
import './SettingsPage.css';

const SettingsPage = () => {
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

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
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
    // Clear error when user starts typing
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
      // Handle login logic here
      console.log('Login submitted:', loginForm);
      alert('Login successful! (This is a demo)');
    }
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    if (validateSignup()) {
      // Handle signup logic here
      console.log('Signup submitted:', signupForm);
      alert('Account created successfully! (This is a demo)');
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-container">
        <div className="settings-header">
          <h1>Account</h1>
          <p>Sign in or create a new account</p>
        </div>

        <div className="settings-content">
          <div className="auth-tabs">
            <button
              className={`tab-button ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => setActiveTab('login')}
            >
              Login
            </button>
            <button
              className={`tab-button ${activeTab === 'signup' ? 'active' : ''}`}
              onClick={() => setActiveTab('signup')}
            >
              Sign Up
            </button>
          </div>

          <div className="auth-forms">
            {activeTab === 'login' ? (
              <form className="auth-form login-form" onSubmit={handleLoginSubmit}>
                <div className="form-header">
                  <h2>Welcome Back</h2>
                  <p>Sign in to your account</p>
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
                  <h2>Create Account</h2>
                  <p>Join us today</p>
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
    </div>
  );
};

export default SettingsPage;
