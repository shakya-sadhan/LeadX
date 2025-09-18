import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fixed login credentials
  const FIXED_CREDENTIALS = {
    email: 'admin@leadgen.com',
    password: 'password123'
  };

  useEffect(() => {
    // Check if user is already logged in
    const checkAuthStatus = () => {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        setIsAuthenticated(true);
        setUser(JSON.parse(userData));
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      setLoading(false);
    };

    checkAuthStatus();

    // Listen for storage changes (logout from other tabs)
    const handleStorageChange = () => {
      checkAuthStatus();
    };

    // Listen for logout events
    const handleLogoutEvent = () => {
      setIsAuthenticated(false);
      setUser(null);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userLoggedOut', handleLogoutEvent);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLoggedOut', handleLogoutEvent);
    };
  }, []);

  const login = (email, password) => {
    // Check against fixed credentials
    if (email === FIXED_CREDENTIALS.email && password === FIXED_CREDENTIALS.password) {
      const authToken = 'demo-token-' + Date.now();
      const userData = {
        email: email,
        name: 'Admin User',
        loginTime: new Date().toISOString()
      };
      
      localStorage.setItem('authToken', authToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setIsAuthenticated(true);
      setUser(userData);
      
      return { success: true, message: 'Login successful!' };
    } else {
      return { success: false, message: 'Invalid credentials. Use admin@leadgen.com / password123' };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    
    // Trigger logout event
    window.dispatchEvent(new CustomEvent('userLoggedOut'));
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
