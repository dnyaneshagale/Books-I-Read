import React, { useState, useRef, useEffect } from 'react';
import './ProfileDropdown.css';

function ProfileDropdown({ username, onImport, onShare, onLogout, isDarkMode, onToggleDarkMode }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleImport = () => {
    setIsOpen(false);
    onImport();
  };

  const handleShare = () => {
    setIsOpen(false);
    onShare();
  };

  const handleLogout = () => {
    setIsOpen(false);
    onLogout();
  };

  const handleToggleDarkMode = () => {
    onToggleDarkMode();
  };

  return (
    <div className="profile-dropdown" ref={dropdownRef}>
      <button
        className="profile-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="profile-icon">👤</span>
        <span className="profile-name">{username}</span>
        <svg 
          className={`profile-chevron ${isOpen ? 'open' : ''}`}
          width="12" 
          height="12" 
          viewBox="0 0 12 12" 
          fill="none"
        >
          <path 
            d="M2 4L6 8L10 4" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="profile-menu">
          {/* Dark Mode Toggle */}
          <div className="profile-menu-item dark-mode-toggle" onClick={handleToggleDarkMode}>
            <div className="dark-mode-label">
              <span className="menu-icon">🌙</span>
              <span>Dark Mode</span>
            </div>
            <div className={`toggle-switch ${isDarkMode ? 'active' : ''}`}>
              <div className="toggle-slider"></div>
            </div>
          </div>
          
          <div className="profile-menu-divider"></div>
          
          <button className="profile-menu-item" onClick={handleImport}>
            <span className="menu-icon">📤</span>
            <span>Import Data</span>
          </button>
          
          <button className="profile-menu-item" onClick={handleShare}>
            <span className="menu-icon">🔗</span>
            <span>Share Profile</span>
          </button>
          
          <div className="profile-menu-divider"></div>
          
          <button className="profile-menu-item logout" onClick={handleLogout}>
            <span className="menu-icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default ProfileDropdown;
