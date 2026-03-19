import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

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
    <nav className="app-nav fixed bottom-0 left-0 right-0 z-[1000] bg-white/[0.92] border-t border-border backdrop-blur-[12px] [-webkit-backdrop-filter:blur(12px)] pb-[env(safe-area-inset-bottom,4px)] pt-1 tablet:top-0 tablet:bottom-auto tablet:border-t-0 tablet:border-b tablet:border-b-slate-200/60 tablet:p-0 tablet:bg-white/80 tablet:backdrop-blur-[20px] tablet:[-webkit-backdrop-filter:blur(20px)_saturate(180%)] tablet:shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.02)] dark:bg-[rgba(15,12,21,0.88)] dark:border-t-border dark:backdrop-blur-[20px] dark:[backdrop-filter:blur(20px)_saturate(180%)] dark:[-webkit-backdrop-filter:blur(20px)_saturate(180%)] dark:tablet:bg-[rgba(15,12,21,0.85)] dark:tablet:border-b-[rgba(45,42,74,0.6)] dark:tablet:shadow-[0_1px_3px_rgba(0,0,0,0.2),0_4px_12px_rgba(0,0,0,0.15)]">
      <div className="flex justify-around items-center max-w-[600px] mx-auto tablet:max-w-[800px] tablet:gap-1 tablet:px-4">
        {navItems.map((item) => (
          <button
            key={item.path}
            className={`app-nav__item flex flex-col items-center gap-0.5 py-1.5 px-3 bg-none border-none cursor-pointer text-txt-secondary transition-all duration-200 ease-out-expo [-webkit-tap-highlight-color:transparent] relative active:scale-90 hover:text-primary tablet:flex-row tablet:gap-2 tablet:py-3.5 tablet:px-5 tablet:rounded-[10px] tablet:hover:bg-[rgba(99,102,241,0.06)] dark:text-txt-secondary dark:hover:text-primary dark:tablet:hover:bg-[rgba(124,77,255,0.08)] ${isActive(item.path) ? 'active text-primary tablet:bg-[rgba(99,102,241,0.08)] dark:text-primary dark:tablet:bg-[rgba(124,77,255,0.12)]' : ''}`}
            onClick={() => navigate(item.path)}
            title={item.label}
          >
            <span className="text-xl leading-none tablet:text-[1.15rem]">{item.icon}</span>
            <span className="text-[0.65rem] font-semibold tracking-[0.02em] tablet:text-[0.85rem] tablet:font-semibold">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default NavBar;
