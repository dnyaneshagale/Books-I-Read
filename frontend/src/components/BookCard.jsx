import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';

/**
 * BookCard Component
 * 
 * Displays individual book information with progress, rating, and reading dates
 */
function BookCard({ book, onUpdate, onDelete, onShowInsights, onViewNotes, onWriteReview, onTogglePrivacy }) {
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

  const getStatusClasses = (status) => {
    switch (status) {
      case 'FINISHED':
        return 'bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-800 border border-emerald-300';
      case 'READING':
        return 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-800 border border-blue-300';
      case 'WANT_TO_READ':
        return 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 border border-gray-300';
      default:
        return '';
    }
  };

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
    if (progress === 100) return '#10b981';
    return '#3b82f6';
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderStars = (rating) => {
    if (!rating) return null;
    return (
      <div className="flex gap-1 text-[22px]">
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

  return (
    <div className="book-card bg-bg border-2 border-border rounded-xl p-xl transition-all duration-200 ease-smooth shadow-sm relative overflow-hidden hover:border-primary hover:-translate-y-1.5 hover:shadow-xl dark:border-0 dark:border-t dark:border-t-white/[0.08] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] dark:hover:border-t-[rgba(124,77,255,0.3)] dark:hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7),0_0_40px_-10px_rgba(124,77,255,0.2)] dark:hover:-translate-y-1.5">
      <div className="flex justify-between items-start mb-md gap-md relative">
        <h3 className="text-xl font-bold text-txt-primary leading-[1.3] flex-1 m-0 tracking-[-0.3px] max-md:text-lg">
          {!onTogglePrivacy && book.isPublic === false && <span className="text-sm mr-1.5 opacity-70" title="Private book">🔒</span>}
          {book.title}
        </h3>
        <div className="flex items-center gap-sm">
          <span className={`text-xs font-bold py-1.5 px-3.5 rounded-full whitespace-nowrap uppercase tracking-[0.5px] shadow-xs max-md:text-[10px] max-md:py-[5px] max-md:px-2.5 ${getStatusClasses(book.status)}`}>
            {getStatusLabel(book.status)}
          </span>
          <div className="relative" ref={dropdownRef}>
            <button
              className="bg-transparent border border-border text-txt-secondary w-8 h-8 rounded-lg text-[20px] flex items-center justify-center cursor-pointer transition-all duration-200 ease-smooth p-0 leading-none hover:bg-bg-secondary hover:border-primary hover:text-primary"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              aria-label="More options"
            >
              ⋮
            </button>
            {isDropdownOpen && (
              <div className="absolute top-[calc(100%+4px)] right-0 bg-bg border border-border rounded-lg shadow-xl min-w-[180px] z-[100] overflow-hidden animate-[dropdownSlide_0.2s_ease-out]">
                <button
                  className="w-full py-3 px-4 bg-none border-none text-left text-sm font-medium text-txt-primary cursor-pointer transition-colors duration-200 ease-smooth flex items-center gap-2.5 hover:bg-bg-secondary"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onUpdate(book);
                  }}
                >
                  <span className="text-base flex-shrink-0">✏️</span>
                  Edit Details
                </button>
                <button
                  className="w-full py-3 px-4 bg-none border-none text-left text-sm font-medium text-danger cursor-pointer transition-colors duration-200 ease-smooth flex items-center gap-2.5 hover:bg-red-500/10"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onDelete(book.id);
                  }}
                >
                  <span className="text-base flex-shrink-0">🗑️</span>
                  Delete Book
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="text-base text-txt-secondary mb-lg font-medium max-md:text-sm max-md:mb-md">by {book.author}</p>

      {onTogglePrivacy && (
        <button
          className={`inline-flex items-center gap-1.5 cursor-pointer text-[0.78rem] font-semibold py-1 px-3 mb-2 rounded-full transition-all duration-200 ${book.isPublic === false ? 'bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 hover:border-red-300 dark:bg-red-600/[0.15] dark:border-red-600/30 dark:text-red-300 dark:hover:bg-red-600/25' : 'bg-indigo-50 border border-indigo-200 text-indigo-600 hover:bg-indigo-100 hover:border-indigo-300 dark:bg-indigo-500/[0.15] dark:border-indigo-500/30 dark:text-indigo-300 dark:hover:bg-indigo-500/25'}`}
          onClick={() => onTogglePrivacy(book.id, book.isPublic === false)}
        >
          <span className="text-[0.85rem]">{book.isPublic === false ? '🔒' : '🌍'}</span>
          <span className="leading-none">{book.isPublic === false ? 'Private' : 'Public'}</span>
        </button>
      )}

      {book.rating && (
        <div className="mb-lg">
          {renderStars(book.rating)}
        </div>
      )}

      <div className="mb-lg">
        <div className="flex justify-between items-center mb-md">
          <span className="text-sm text-txt-secondary font-semibold">
            {book.pagesRead} / {book.totalPages} pages
          </span>
          <span className="text-sm font-bold bg-gradient-to-br from-primary to-primary-light bg-clip-text [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
            {book.progress}%
          </span>
        </div>

        <div className="progress-bar-container w-full h-2.5 bg-bg-secondary rounded-full overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]">
          <div
            className="progress-bar-fill h-full rounded-full bg-gradient-to-r from-primary to-primary-light transition-[width] duration-[600ms] ease-smooth shadow-[0_0_10px_rgba(99,102,241,0.4)] relative overflow-hidden"
            style={{
              width: `${book.progress}%`,
              backgroundColor: getProgressColor(book.progress)
            }}
          />
        </div>
      </div>

      {(book.startDate || book.completeDate) && (
        <div className="flex gap-md mb-md mt-xs max-md:flex-wrap max-md:gap-sm max-md:mt-1">
          {book.startDate && (
            <div className="flex gap-1 text-xs text-txt-secondary max-md:text-[11px]">
              <span className="text-txt-light font-medium max-md:text-[11px]">Started:</span>
              <span className="text-txt-secondary font-semibold max-md:text-[11px]">{formatDate(book.startDate)}</span>
            </div>
          )}
          {book.completeDate && (
            <div className="flex gap-1 text-xs text-txt-secondary max-md:text-[11px]">
              <span className="text-txt-light font-medium max-md:text-[11px]">Finished:</span>
              <span className="text-txt-secondary font-semibold max-md:text-[11px]">{formatDate(book.completeDate)}</span>
            </div>
          )}
        </div>
      )}

      {book.review && (
        <div className="mb-md p-sm bg-bg-secondary border-l-[3px] border-l-primary rounded-sm max-md:p-xs">
          <p className="text-sm text-txt-secondary italic m-0 leading-[1.5] max-md:text-xs">
            "{book.review.length > 100 ? book.review.substring(0, 100) + '...' : book.review}"
          </p>
        </div>
      )}

      {book.tags && book.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-md">
          {book.tags.map((tag, index) => (
            <span key={index} className="book-tag inline-block py-1 px-2.5 bg-gradient-to-br from-indigo-400 to-purple-700 text-white rounded-xl text-[11px] font-medium uppercase tracking-[0.5px] dark:bg-none dark:bg-transparent dark:border dark:border-[rgba(124,77,255,0.5)] dark:text-[#9575FF]">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-sm items-center max-md:gap-xs">
        <button
          className="btn-update-book flex-1 bg-gradient-to-br from-primary to-primary-light text-white border-none py-3 px-6 rounded-lg text-sm font-bold cursor-pointer transition-all duration-300 shadow-[0_4px_12px_rgba(109,40,217,0.3),0_2px_4px_rgba(0,0,0,0.1)] relative overflow-hidden tracking-[0.3px] h-11 flex items-center justify-center hover:-translate-y-[3px] hover:shadow-[0_8px_20px_rgba(109,40,217,0.4),0_4px_8px_rgba(0,0,0,0.15)] active:-translate-y-[1px] max-md:py-3 max-md:px-[18px] max-md:text-xs"
          onClick={() => onUpdate(book)}
        >
          Update
        </button>
        {onViewNotes && (
          <button
            className="bg-gradient-to-br from-[#fff3cd] to-[#ffe69c] text-[#856404] border-2 border-[#ffc107] p-0 rounded-lg text-lg font-semibold cursor-pointer transition-all duration-200 ease-smooth w-11 h-11 flex items-center justify-center flex-shrink-0 hover:from-[#ffe69c] hover:to-[#ffd966] hover:border-amber-500 hover:-translate-y-0.5 hover:scale-105 hover:shadow-[0_6px_20px_rgba(255,193,7,0.4)] active:translate-y-0 active:scale-100"
            onClick={() => onViewNotes(book)}
            title="View Notes"
          >
            📝
          </button>
        )}
        {onShowInsights && (
          <button
            className="bg-gradient-to-br from-amber-100 to-amber-200 text-amber-900 border-2 border-amber-400 p-0 rounded-lg text-lg font-semibold cursor-pointer transition-all duration-200 ease-smooth w-11 h-11 flex items-center justify-center flex-shrink-0 hover:from-amber-200 hover:to-amber-300 hover:border-amber-500 hover:-translate-y-0.5 hover:scale-105 hover:shadow-[0_6px_20px_rgba(251,191,36,0.4)] max-md:w-10 max-md:h-10 max-md:text-base"
            onClick={() => onShowInsights(book)}
            title="AI Insights"
          >
            ✨
          </button>
        )}
        {onWriteReview && (
          <button
            className="bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-800 border-2 border-indigo-400 p-0 rounded-lg text-lg cursor-pointer transition-all duration-200 ease-smooth w-11 h-11 flex items-center justify-center flex-shrink-0 hover:from-indigo-200 hover:to-indigo-300 hover:border-indigo-500 hover:-translate-y-0.5 hover:scale-105 hover:shadow-[0_6px_20px_rgba(99,102,241,0.4)]"
            onClick={() => onWriteReview(book)}
            title="Write Review"
          >
            ✍️
          </button>
        )}
      </div>
    </div>
  );
}

export default BookCard;
