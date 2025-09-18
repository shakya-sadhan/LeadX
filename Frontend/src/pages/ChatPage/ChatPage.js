import React, { useState } from 'react';
import './ChatPage.css';

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSuggestions, setCurrentSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage = {
        id: Date.now() + 1,
        text: "I understand you're asking about: " + inputValue + ". This is a simulated response. In a real application, this would connect to an AI service.",
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleSuggestionClick = (topic) => {
    const suggestions = suggestionSets[topic] || [];
    setCurrentSuggestions(suggestions);
    setShowSuggestions(true);
  };

  const handleSuggestionSelect = (suggestion) => {
    setInputValue(suggestion);
    setShowSuggestions(false);
  };

  const salesLeadSuggestions = [
    { 
      label: 'Lead Generation', 
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
      )
    },
    { 
      label: 'Sales Pipeline', 
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6h18"/>
          <path d="M3 12h18"/>
          <path d="M3 18h18"/>
        </svg>
      )
    },
    { 
      label: 'Lead Scoring', 
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
        </svg>
      )
    }
  ];

  // Different suggestion sets for each topic
  const suggestionSets = {
    'Lead Generation': [
      "What are the best lead generation strategies for B2B companies?",
      "How to create effective lead magnets for my business?",
      "What tools should I use for lead generation in 2024?",
      "How to optimize my website for lead generation?",
      "What's the difference between inbound and outbound lead generation?"
    ],
    'Sales Pipeline': [
      "How to build an effective sales pipeline?",
      "What are the key stages in a sales pipeline?",
      "How to track and measure pipeline performance?",
      "What CRM tools work best for pipeline management?",
      "How to identify and fix pipeline bottlenecks?"
    ],
    'Lead Scoring': [
      "What is lead scoring and how does it work?",
      "How to set up an effective lead scoring system?",
      "What factors should I consider for lead scoring?",
      "How to improve lead scoring accuracy?",
      "What's the difference between demographic and behavioral scoring?"
    ]
  };

  return (
    <div className="chat-page">
      {messages.length === 0 ? (
        <div className="perplexity-layout">
          {/* Centered Title */}
          <div className="page-title">
            <h1>Evecta</h1>
          </div>

          {/* Search Bar with Icons */}
          <div className="search-container">
            <form onSubmit={handleSendMessage} className="search-form">
              <div className="search-bar">
                <div className="search-input-container">
                  <div className="search-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"/>
                      <path d="M21 21l-4.35-4.35"/>
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Ask anything..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="search-input"
                  />
                  <div className="search-actions">
                    <button type="submit" className="search-submit-btn" disabled={!inputValue.trim()}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Pill-shaped Action Buttons */}
          <div className="topic-buttons">
            {salesLeadSuggestions.map((suggestion, index) => (
              <button key={index} className="topic-button" onClick={() => handleSuggestionClick(suggestion.label)}>
                <span className="topic-icon">{suggestion.icon}</span>
                <span className="topic-text">{suggestion.label}</span>
              </button>
            ))}
          </div>

          {/* Dynamic Suggestions */}
          {showSuggestions && currentSuggestions.length > 0 && (
            <div className="suggestions-container">
              <div className="suggestions-header">
                <h3>Suggested Questions</h3>
                <button className="close-suggestions" onClick={() => setShowSuggestions(false)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              <div className="suggestions-list">
                {currentSuggestions.map((suggestion, index) => (
                  <button 
                    key={index} 
                    className="suggestion-item" 
                    onClick={() => handleSuggestionSelect(suggestion)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"/>
                      <path d="M21 21l-4.35-4.35"/>
                    </svg>
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="chat-container">
          {/* Messages */}
          <div className="messages-container">
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.sender}`}>
                <div className="message-avatar">
                  {message.sender === 'user' ? '👤' : '🚀'}
                </div>
                <div className="message-content">
                  <div className="message-text">{message.text}</div>
                  <div className="message-time">{message.timestamp}</div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="message ai">
                <div className="message-avatar">🚀</div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Input */}
          <div className="chat-input-container">
            <form onSubmit={handleSendMessage} className="chat-input-form">
              <div className="chat-input-bar">
                <input
                  type="text"
                  placeholder="Ask anything..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="chat-input"
                />
                <button type="submit" className="send-button" disabled={!inputValue.trim()}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
