import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Search, Newspaper, PenLine, BookMarked, Moon, Upload, Share2, LogOut, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

function ProfileDropdown({ username, onImport, onShare, onLogout, isDarkMode, onToggleDarkMode }) {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div className="relative flex items-center max-md:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex items-center gap-2 px-4 h-10 bg-[var(--color-bg)] border-[1.5px] border-[var(--color-border)] rounded-full cursor-pointer transition-all duration-200 text-sm font-medium text-[var(--color-text-primary)] whitespace-nowrap shadow-xs hover:bg-[var(--color-bg-secondary)] hover:border-[var(--color-primary)] hover:shadow-sm hover:-translate-y-px active:translate-y-0 dark:bg-[var(--color-bg-dark)] dark:border-[var(--color-border-dark)] dark:text-[var(--color-text-primary-dark)] dark:hover:bg-[var(--color-bg-secondary-dark)] dark:hover:border-[var(--color-primary)]"
            aria-label="Open profile menu"
          >
            <User className="w-4 h-4" />
            <span className="text-sm font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-text-primary-dark)]">{username}</span>
            <ChevronDown className="w-4 h-4 text-[var(--color-text-secondary)]" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="min-w-[230px]">
          <DropdownMenuItem onClick={() => handleNavigate('/profile')}>
            <User className="w-4 h-4 shrink-0" />
            <span>My Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleNavigate('/discover')}>
            <Search className="w-4 h-4 shrink-0" />
            <span>Discover</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleNavigate('/feed')}>
            <Newspaper className="w-4 h-4 shrink-0" />
            <span>Feed</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleNavigate('/reviews')}>
            <PenLine className="w-4 h-4 shrink-0" />
            <span>Reviews</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleNavigate('/lists')}>
            <BookMarked className="w-4 h-4 shrink-0" />
            <span>My Lists</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={onToggleDarkMode}>
            <Moon className="w-4 h-4 shrink-0" />
            <span className="flex-1">Dark Mode</span>
            <div className={`w-11 h-6 rounded-xl relative transition-colors duration-300 shrink-0 ${isDarkMode ? 'bg-[var(--color-primary)]' : 'bg-gray-300'}`}>
              <div className={`w-[18px] h-[18px] bg-white rounded-full absolute top-[3px] left-[3px] transition-transform duration-300 shadow-[0_2px_4px_rgba(0,0,0,0.2)] ${isDarkMode ? 'translate-x-5' : ''}`}></div>
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={onImport}>
            <Upload className="w-4 h-4 shrink-0" />
            <span>Import Data</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onShare}>
            <Share2 className="w-4 h-4 shrink-0" />
            <span>Share Profile</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem className="!text-[var(--color-danger)] focus:!bg-red-500/10" onClick={onLogout}>
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default ProfileDropdown;
