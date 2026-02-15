import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Search, Newspaper, PenLine, BookMarked, Moon, Upload, Share2, LogOut } from 'lucide-react';

function ProfileDropdown({ username, onImport, onShare, onLogout, isDarkMode, onToggleDarkMode }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

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

  const handleNavigate = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  const menuItemBase = "flex items-center gap-3 w-full py-2.5 px-3.5 bg-transparent border-none rounded-[var(--radius-md)] cursor-pointer transition-all duration-200 text-sm font-medium text-[var(--color-text-primary)] text-left hover:bg-[var(--color-bg-tertiary)] hover:translate-x-0.5 dark:text-[var(--color-text-primary)] dark:hover:bg-[var(--color-bg-secondary-dark)]";

  return (
    <div className="relative flex items-center max-md:hidden" ref={dropdownRef}>
      <button
        className="flex items-center gap-2 px-4 h-10 bg-[var(--color-bg)] border-[1.5px] border-[var(--color-border)] rounded-full cursor-pointer transition-all duration-200 text-sm font-medium text-[var(--color-text-primary)] whitespace-nowrap shadow-xs hover:bg-[var(--color-bg-secondary)] hover:border-[var(--color-primary)] hover:shadow-sm hover:-translate-y-px active:translate-y-0 dark:bg-[var(--color-bg-dark)] dark:border-[var(--color-border-dark)] dark:text-[var(--color-text-primary-dark)] dark:hover:bg-[var(--color-bg-secondary-dark)] dark:hover:border-[var(--color-primary)]"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <User className="w-4 h-4" />
        <span className="text-sm font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-text-primary-dark)]">{username}</span>
        <svg 
          className={`transition-transform duration-200 text-[var(--color-text-secondary)] ${isOpen ? 'rotate-180' : ''}`}
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
        <div className="absolute top-[calc(100%+8px)] right-0 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.12),0_2px_6px_rgba(0,0,0,0.08)] min-w-[200px] p-1.5 z-[1000] animate-fade-in dark:bg-[var(--color-bg-dark)] dark:border-[var(--color-border-dark)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.4),0_2px_6px_rgba(0,0,0,0.2)]">
          {/* Social Navigation */}
          <button className={menuItemBase} onClick={() => handleNavigate('/profile')}>
            <User className="w-4 h-4 shrink-0" />
            <span>My Profile</span>
          </button>
          
          <button className={menuItemBase} onClick={() => handleNavigate('/discover')}>
            <Search className="w-4 h-4 shrink-0" />
            <span>Discover</span>
          </button>
          
          <button className={menuItemBase} onClick={() => handleNavigate('/feed')}>
            <Newspaper className="w-4 h-4 shrink-0" />
            <span>Feed</span>
          </button>
          
          <button className={menuItemBase} onClick={() => handleNavigate('/reviews')}>
            <PenLine className="w-4 h-4 shrink-0" />
            <span>Reviews</span>
          </button>
          
          <button className={menuItemBase} onClick={() => handleNavigate('/lists')}>
            <BookMarked className="w-4 h-4 shrink-0" />
            <span>My Lists</span>
          </button>
          
          <div className="h-px bg-[var(--color-border)] my-1.5 dark:bg-[var(--color-border-dark)]"></div>

          {/* Dark Mode Toggle */}
          <div
            className={`${menuItemBase} justify-between`}
            onClick={handleToggleDarkMode}
          >
            <div className="flex items-center gap-3">
              <Moon className="w-4 h-4 shrink-0" />
              <span>Dark Mode</span>
            </div>
            <div className={`w-11 h-6 rounded-xl relative transition-colors duration-300 shrink-0 ${isDarkMode ? 'bg-[var(--color-primary)]' : 'bg-gray-300'}`}>
              <div className={`w-[18px] h-[18px] bg-white rounded-full absolute top-[3px] left-[3px] transition-transform duration-300 shadow-[0_2px_4px_rgba(0,0,0,0.2)] ${isDarkMode ? 'translate-x-5' : ''}`}></div>
            </div>
          </div>
          
          <div className="h-px bg-[var(--color-border)] my-1.5 dark:bg-[var(--color-border-dark)]"></div>
          
          <button className={menuItemBase} onClick={handleImport}>
            <Upload className="w-4 h-4 shrink-0" />
            <span>Import Data</span>
          </button>
          
          <button className={menuItemBase} onClick={handleShare}>
            <Share2 className="w-4 h-4 shrink-0" />
            <span>Share Profile</span>
          </button>
          
          <div className="h-px bg-[var(--color-border)] my-1.5 dark:bg-[var(--color-border-dark)]"></div>
          
          <button className={`${menuItemBase} !text-[var(--color-danger)] hover:!bg-red-500/10`} onClick={handleLogout}>
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default ProfileDropdown;
