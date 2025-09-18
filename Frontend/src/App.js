import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Sidebar from './components/Sidebar/Sidebar';
import PageWrapper from './components/PageWrapper/PageWrapper';
import HomePage from './pages/HomePage/HomePage';
import ChatPage from './pages/ChatPage/ChatPage';
import AboutPage from './pages/AboutPage/AboutPage';
import BlogPage from './pages/BlogPage/BlogPage';
import SettingsPage from './pages/SettingsPage/SettingsPage';
import DashboardPage from './pages/DashboardPage/DashboardPage';
import './App.css';


// Component for authenticated layout (Dashboard)
const AuthenticatedLayout = () => {
  return (
    <div className="app">
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="*" element={<DashboardPage />} />
      </Routes>
    </div>
  );
};

// Component for unauthenticated layout
const UnauthenticatedLayout = () => {
  return (
    <div className="app">
      <Sidebar />
      <main className="main-content">
        <PageWrapper>
          <Routes>
            <Route path="/" element={<ChatPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </PageWrapper>
      </main>
    </div>
  );
};

// Main app content component
const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="app">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <AuthenticatedLayout /> : <UnauthenticatedLayout />;
};

// Main app component
function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
