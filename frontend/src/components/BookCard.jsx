import React, { useState, useRef, useEffect } from 'react';
import { FileText, Sparkles, PenLine, Globe, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

/* ── Tag gradient palettes ── */
const TAG_GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
];
const TAG_DARK = [
  { borderColor: 'rgba(124,77,255,0.5)', color: '#9575FF' },
  { borderColor: 'rgba(245,87,108,0.5)', color: '#f5576c' },
  { borderColor: 'rgba(0,242,254,0.5)', color: '#00f2fe' },
  { borderColor: 'rgba(56,249,215,0.5)', color: '#38f9d7' },
  { borderColor: 'rgba(254,225,64,0.5)', color: '#fee140' },
];

const iconBtnBase = 'shrink-0 w-11 h-11 flex items-center justify-center p-0 rounded-2xl text-lg font-semibold cursor-pointer transition-all duration-200';

/**
 * BookCard Component
 * 
 * Displays individual book information with progress, rating, and reading dates
 */
function BookCard({ 
  book, 
  onUpdate, 
  onDelete, 
  onShowInsights, 
  onViewNotes, 
  onWriteReview, 
  onTogglePrivacy,
  isSelectionMode = false,
  isSelected = false,
  onToggleSelection
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);
  
  const getStatusLabel = (status) => {
    switch (status) {
      case 'FINISHED':
        return 'Finished';
      case 'READING':
        return 'Reading';
      case 'WANT_TO_READ':
        return 'Want to Read';
      default:
        return status;
    }
  };

  const getProgressColor = (progress) => {
    if (progress === 0) return '#e0e0e0';
    if (progress === 100) return '#10b981'; // Green
    return '#3b82f6'; // Blue
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderStars = (rating) => {
    if (!rating) return null;
    return (
      <div className="flex gap-1 text-[22px] max-md:text-lg">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={star <= rating ? 'text-amber-400 drop-shadow-[0_2px_4px_rgba(251,191,36,0.3)] animate-[star-twinkle_3s_ease-in-out_infinite]' : 'text-gray-300'}>
            ★
          </span>
        ))}
      </div>
    );
  };

  const handleShare = async () => {
    const getStatusEmoji = (status) => {
      switch (status) {
        case 'FINISHED': return '✅';
        case 'READING': return '📖';
        case 'WANT_TO_READ': return '📚';
        default: return '';
      }
    };

    let shareText = `${getStatusEmoji(book.status)} ${book.title} by ${book.author}\n`;
    
    if (book.rating) {
      shareText += `Rating: ${'★'.repeat(book.rating)}${'☆'.repeat(5 - book.rating)}\n`;
    }
    
    if (book.status === 'FINISHED' && book.review) {
      shareText += `\n"${book.review}"\n`;
    }
    
    if (book.tags && book.tags.length > 0) {
      shareText += `\nTags: ${book.tags.join(', ')}`;
    }

    try {
      await navigator.clipboard.writeText(shareText);
      toast.success('📋 Book recommendation copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy recommendation');
    }
  };

  const isDark = document.body.classList.contains('dark-mode');

  return (
    <div 
      className={`relative overflow-hidden bg-[var(--color-bg)] border-2 ${
        isSelected ? 'border-violet-600 dark:border-violet-500' : 'border-[var(--color-border)]'
      } rounded-[20px] p-8 shadow-[var(--shadow-sm)] transition-all duration-200 ${
        isSelectionMode ? 'cursor-pointer' : ''
      } hover:border-violet-700 hover:-translate-y-1.5 hover:shadow-xl before:content-[''] before:absolute before:top-0 before:left-0 before:w-full before:h-1 before:bg-gradient-to-r before:from-violet-700 before:to-purple-500 before:scale-x-0 before:origin-left before:transition-transform before:duration-200 hover:before:scale-x-100 dark:border-0 dark:border-t dark:border-white/[0.08] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] dark:hover:border-[rgba(124,77,255,0.3)] dark:hover:-translate-y-1.5 dark:hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7),0_0_40px_-10px_rgba(124,77,255,0.2)] max-md:p-6`}
      onClick={() => {
        if (isSelectionMode && onToggleSelection) {
          onToggleSelection();
        }
      }}
    >
      {/* Selection Checkbox */}
      {isSelectionMode && (
        <div className="absolute top-4 left-4 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              if (onToggleSelection) onToggleSelection();
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-600 text-violet-600 focus:ring-violet-500 cursor-pointer"
          />
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex justify-between items-start mb-4 gap-4 relative">
        <h3 className="text-xl font-bold text-[var(--color-text-primary)] leading-[1.3] flex-1 m-0 -tracking-[0.3px] max-md:text-lg">
          {!onTogglePrivacy && book.isPublic === false && <Lock className="w-4 h-4 inline mr-1.5 opacity-70" title="Private book" />}
          {book.title}
        </h3>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold py-1.5 px-3.5 rounded-full whitespace-nowrap uppercase tracking-wider shadow-[var(--shadow-xs)] max-md:text-[10px] max-md:py-[5px] max-md:px-2.5 ${
            book.status === 'FINISHED' ? 'bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-800 border border-emerald-300' :
            book.status === 'READING' ? 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-800 border border-blue-300' :
            'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 border border-gray-300'
          }`}>
            {getStatusLabel(book.status)}
          </span>
          <div className="relative" ref={dropdownRef}>
            <button
              className="bg-transparent border border-[var(--color-border)] text-[var(--color-text-secondary)] w-8 h-8 rounded-2xl text-xl flex items-center justify-center cursor-pointer transition-all duration-200 p-0 leading-none hover:bg-[var(--color-bg-secondary)] hover:border-violet-700 hover:text-violet-700"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              aria-label="More options"
            >
              ⋮
            </button>
            {isDropdownOpen && (
              <div className="absolute top-[calc(100%+4px)] right-0 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl shadow-xl min-w-[180px] z-[100] overflow-hidden animate-[dropdownSlide_0.2s_ease-out]">
                <button
                  className="w-full py-3 px-4 bg-none border-none text-left text-sm font-medium text-[var(--color-text-primary)] cursor-pointer transition-colors duration-200 flex items-center gap-2.5 hover:bg-[var(--color-bg-secondary)]"
                  onClick={() => { setIsDropdownOpen(false); onUpdate(book); }}
                >
                  <span className="text-base shrink-0">✏️</span>
                  Edit Details
                </button>
                <button
                  className="w-full py-3 px-4 bg-none border-none text-left text-sm font-medium text-red-500 cursor-pointer transition-colors duration-200 flex items-center gap-2.5 hover:bg-red-500/10"
                  onClick={() => { setIsDropdownOpen(false); onDelete(book.id); }}
                >
                  <span className="text-base shrink-0">🗑️</span>
                  Delete Book
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Author ── */}
      <p className="text-base text-[var(--color-text-secondary)] mb-6 font-medium max-md:text-sm max-md:mb-4">by {book.author}</p>

      {/* ── Privacy Toggle ── */}
      {onTogglePrivacy && (
        <button
          className={`inline-flex items-center gap-1.5 cursor-pointer text-[0.78rem] font-semibold py-1 px-3 mb-2 rounded-full transition-all duration-200 ${
            book.isPublic === false
              ? 'bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 hover:border-red-300 dark:bg-red-600/15 dark:border-red-600/30 dark:text-red-300 dark:hover:bg-red-600/25'
              : 'bg-indigo-50 border border-indigo-200 text-indigo-600 hover:bg-indigo-100 hover:border-indigo-300 dark:bg-indigo-500/15 dark:border-indigo-500/30 dark:text-indigo-300 dark:hover:bg-indigo-500/25'
          }`}
          onClick={() => onTogglePrivacy(book.id, book.isPublic === false)}
        >
          {book.isPublic === false ? <Lock className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
          <span className="leading-none">{book.isPublic === false ? 'Private' : 'Public'}</span>
        </button>
      )}

      {/* ── Rating ── */}
      {book.rating && (
        <div className="mb-6">
          {renderStars(book.rating)}
        </div>
      )}

      {/* ── Progress ── */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-[var(--color-text-secondary)] font-semibold">
            {book.pagesRead} / {book.totalPages} pages
          </span>
          <span className="text-sm font-bold bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-primary)' }}>
            {book.progress}%
          </span>
        </div>
        <div className="w-full h-2.5 bg-[var(--color-bg-secondary)] rounded-full overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]">
          <div
            className="h-full rounded-full transition-[width] duration-600 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-[0_0_10px_rgba(99,102,241,0.4)] relative overflow-hidden after:content-[''] after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/30 after:to-transparent after:animate-[g-shimmer_2s_infinite]"
            style={{
              width: `${book.progress}%`,
              backgroundColor: getProgressColor(book.progress)
            }}
          />
        </div>
      </div>

      {/* ── Dates ── */}
      {(book.startDate || book.completeDate) && (
        <div className="flex gap-4 mb-4 mt-1 max-md:flex-wrap max-md:gap-2">
          {book.startDate && (
            <div className="flex gap-1 text-xs text-[var(--color-text-secondary)] max-md:text-[11px]">
              <span className="text-[var(--color-text-light)] font-medium">Started:</span>
              <span className="font-semibold">{formatDate(book.startDate)}</span>
            </div>
          )}
          {book.completeDate && (
            <div className="flex gap-1 text-xs text-[var(--color-text-secondary)] max-md:text-[11px]">
              <span className="text-[var(--color-text-light)] font-medium">Finished:</span>
              <span className="font-semibold">{formatDate(book.completeDate)}</span>
            </div>
          )}
        </div>
      )}

      {/* ── Review Preview ── */}
      {book.review && (
        <div className="mb-4 p-2 bg-[var(--color-bg-secondary)] border-l-[3px] border-l-violet-700 rounded-lg max-md:p-1">
          <p className="text-sm text-[var(--color-text-secondary)] italic m-0 leading-relaxed max-md:text-xs">
            "{book.review.length > 100 ? book.review.substring(0, 100) + '...' : book.review}"
          </p>
        </div>
      )}

      {/* ── Tags ── */}
      {book.tags && book.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {book.tags.map((tag, index) => {
            const i = index % TAG_GRADIENTS.length;
            return (
              <span
                key={index}
                className="inline-block py-1 px-2.5 rounded-xl text-[11px] font-medium uppercase tracking-wider"
                style={isDark
                  ? { background: 'transparent', border: `1px solid ${TAG_DARK[i].borderColor}`, color: TAG_DARK[i].color }
                  : { background: TAG_GRADIENTS[i], color: 'white' }
                }
              >
                {tag}
              </span>
            );
          })}
        </div>
      )}

      {/* ── Actions ── */}
      <div className="flex gap-2 items-center max-md:gap-1">
        <button
          className="flex-1 bg-violet-600/85 text-white border-none py-3 px-6 rounded-2xl text-sm font-bold cursor-pointer transition-all duration-300 shadow-[0_2px_8px_rgba(109,40,217,0.15)] relative overflow-hidden tracking-wider h-11 flex items-center justify-center hover:bg-violet-700 hover:-translate-y-[2px] hover:shadow-[0_4px_12px_rgba(109,40,217,0.25)] active:-translate-y-[1px] dark:bg-[#7C4DFF]/70 dark:hover:bg-[#7C4DFF]/90 max-md:py-3 max-md:px-[18px] max-md:text-xs"
          onClick={() => onUpdate(book)}
        >
          Update
        </button>
        {onViewNotes && (
          <button
            className={`${iconBtnBase} bg-gradient-to-br from-amber-100 to-amber-200 text-amber-700 border-2 border-amber-400 hover:from-amber-200 hover:to-amber-300 hover:border-amber-500 hover:-translate-y-0.5 hover:scale-105 hover:shadow-[0_6px_20px_rgba(255,193,7,0.4)] active:translate-y-0 active:scale-100 max-md:w-10 max-md:h-10 max-md:text-base`}
            onClick={() => onViewNotes(book)}
            title="View Notes"
          >
            <FileText className="w-5 h-5" />
          </button>
        )}
        {onShowInsights && (
          <button
            className={`${iconBtnBase} bg-gradient-to-br from-amber-50 to-amber-200 text-amber-900 border-2 border-amber-400 hover:from-amber-200 hover:to-amber-300 hover:border-amber-500 hover:-translate-y-0.5 hover:scale-105 hover:shadow-[0_6px_20px_rgba(251,191,36,0.4)] max-md:w-10 max-md:h-10 max-md:text-base`}
            onClick={() => onShowInsights(book)}
            title="AI Insights"
          >
            <Sparkles className="w-5 h-5" />
          </button>
        )}
        {onWriteReview && (
          <button
            className={`${iconBtnBase} bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-800 border-2 border-indigo-400 hover:from-indigo-200 hover:to-indigo-300 hover:border-indigo-500 hover:-translate-y-0.5 hover:scale-105 hover:shadow-[0_6px_20px_rgba(99,102,241,0.4)]`}
            onClick={() => onWriteReview(book)}
            title="Write Review"
          >
            <PenLine className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}

export default BookCard;
