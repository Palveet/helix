import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import LoginSignupPage from './components/LoginSignupPage';
import ProfileForm from './components/ProfileForm';
import ChatWindow from './components/ChatWindow';
import Workspace from './components/Workspace';
import './App.css';

const App: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(localStorage.getItem('userId'));

  const handleLogin = (id: string) => {
    localStorage.setItem('userId', id);
    setUserId(id);
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    setUserId(null);
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <header className="top-bar">
          <Link to="/" className="nav-brand">Helix</Link>
          <div className="nav-links">
            {userId && (
              <>
                <Link to="/profile" className="nav-link">Profile</Link>
                <Link to="/dashboard" className="nav-link">Dashboard</Link>
                <button className="logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </>
            )}
          </div>
        </header>
        
        {!userId ? (
          <LoginSignupPage onLogin={handleLogin} />
        ) : (
          <Routes>
            <Route path="/profile" element={<ProfileForm userId={userId} />} />
            <Route
              path="/dashboard"
              element={
                <div className="app-container">
                  <div className="chat-section">
                    <ChatWindow userId={userId} />
                  </div>
                  <div className="workspace-section">
                    <div className="section-header">Workspace</div>
                    <Workspace userId={userId} />
                  </div>
                </div>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        )}
      </div>
    </Router>
  );
};

export default App;
