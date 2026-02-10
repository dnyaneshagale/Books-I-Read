import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './NavBar.css';

/**
 * NavBar - Shared navigation bar for all authenticated pages
 * Bottom bar on mobile, top bar on non-Dashboard pages
 */
const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/feed', label: 'Feed', icon: '📰' },
    { path: '/reviews', label: 'Reviews', icon: '✍️' },
    { path: '/discover', label: 'Discover', icon: '🔍' },
    { path: '/lists', label: 'Lists', icon: '📚' },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ];

  const isActive = (itemPath) => {
    if (itemPath === '/') return path === '/';
    return path.startsWith(itemPath);
  };

  return (
    <nav className="app-nav">
      <div className="app-nav__items">
        {navItems.map((item) => (
          <button
            key={item.path}
            className={`app-nav__item ${isActive(item.path) ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
            title={item.label}
          >
            <span className="app-nav__icon">{item.icon}</span>
            <span className="app-nav__label">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default NavBar;
