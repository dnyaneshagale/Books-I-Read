import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Newspaper, PenLine, Search, BookMarked, User } from 'lucide-react';

/**
 * NavBar - Shared navigation bar for all authenticated pages
 * Bottom bar on mobile, top bar on non-Dashboard pages
 */
const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/feed', label: 'Feed', icon: Newspaper },
    { path: '/reviews', label: 'Reviews', icon: PenLine },
    { path: '/discover', label: 'Discover', icon: Search },
    { path: '/lists', label: 'Lists', icon: BookMarked },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  const isActive = (itemPath) => {
    if (itemPath === '/') return path === '/';
    return path.startsWith(itemPath);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[1000] bg-white/92 border-t border-[var(--color-border)] pb-[env(safe-area-inset-bottom,4px)] pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)] pt-1 backdrop-blur-[12px] md:top-0 md:bottom-auto md:border-t-0 md:border-b md:border-b-slate-200/60 md:pt-[env(safe-area-inset-top,0px)] md:pb-0 md:bg-white/80 md:backdrop-blur-[20px] md:backdrop-saturate-[180%] md:shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.02)] dark:bg-[rgba(15,12,21,0.88)] dark:border-t-[var(--color-border)] dark:backdrop-blur-[20px] dark:backdrop-saturate-[180%] md:dark:bg-[rgba(15,12,21,0.85)] md:dark:border-b-[rgba(45,42,74,0.6)] md:dark:shadow-[0_1px_3px_rgba(0,0,0,0.2),0_4px_12px_rgba(0,0,0,0.15)]">
      <div className="flex justify-around items-center max-w-[600px] mx-auto md:max-w-[800px] md:gap-1 md:px-4">
        {navItems.map((item) => (
          <button
            key={item.path}
            className={`
              flex flex-col items-center gap-0.5 py-1.5 px-3 bg-transparent border-none cursor-pointer
              transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] select-none relative
              touch-manipulation
              md:flex-row md:gap-2 md:py-3.5 md:px-5 md:rounded-[10px]
              active:scale-90
              ${isActive(item.path)
                ? 'text-[var(--color-primary)] md:bg-[rgba(99,102,241,0.08)] dark:text-[var(--color-primary)] md:dark:bg-[rgba(124,77,255,0.12)]'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] md:hover:bg-[rgba(99,102,241,0.06)] dark:text-[var(--color-text-secondary)] dark:hover:text-[var(--color-primary)] md:dark:hover:bg-[rgba(124,77,255,0.08)]'
              }
            `}
            onClick={() => navigate(item.path)}
            title={item.label}
          >
            {isActive(item.path) && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-[3px] bg-[var(--gradient-primary)] rounded-b-[3px] animate-scale-in md:top-auto md:bottom-0 md:w-6 md:rounded-t-[3px] md:rounded-b-none" />
            )}
            <item.icon className="w-5 h-5 md:w-[1.15rem] md:h-[1.15rem]" />
            <span className="text-[0.65rem] font-semibold tracking-[0.02em] md:text-[0.85rem]">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default NavBar;
