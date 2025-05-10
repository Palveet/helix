import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const NavBar: React.FC = () => {
  const location = useLocation();
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div className="top-bar">
      <Link to="/" className="nav-brand">
        Helix
      </Link>
      <div className="nav-links">
        <Link  to="/profile" className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}>
          Profile
        </Link>
        <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
          Dashboard
        </Link>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </div>
  );
};

export default NavBar; 