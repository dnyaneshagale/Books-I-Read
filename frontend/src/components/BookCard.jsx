import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import './BookCard.css';

/**
 * BookCard Component
 * 
 * Displays individual book information with progress, rating, and reading dates
 */
function BookCard({ book, onUpdate, onDelete, onShowInsights, onViewNotes }) {
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
  
  const getStatusClass = (status) => {
    switch (status) {
      case 'FINISHED':
        return 'status-completed';
      case 'READING':
        return 'status-reading';
      case 'WANT_TO_READ':
        return 'status-not-started';
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
      <div className="rating-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={star <= rating ? 'star-filled' : 'star-empty'}>
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
    <div className="book-card">
      <div className="book-header">
        <h3 className="book-title">{book.title}</h3>
        <div className="header-actions">
          <span className={`status-badge ${getStatusClass(book.status)}`}>
            {getStatusLabel(book.status)}
          </span>
          <div className="more-options-wrapper" ref={dropdownRef}>
            <button 
              className="btn-more-options"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              aria-label="More options"
            >
              ⋮
            </button>
            {isDropdownOpen && (
              <div className="dropdown-menu">
                <button 
                  className="dropdown-item"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onUpdate(book);
                  }}
                >
                  <span className="dropdown-icon">✏️</span>
                  Edit Details
                </button>
                <button 
                  className="dropdown-item dropdown-item-danger"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onDelete(book.id);
                  }}
                >
                  <span className="dropdown-icon">🗑️</span>
                  Delete Book
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="book-author">by {book.author}</p>

      {book.rating && (
        <div className="book-rating">
          {renderStars(book.rating)}
        </div>
      )}

      <div className="progress-section">
        <div className="progress-info">
          <span className="pages-info">
            {book.pagesRead} / {book.totalPages} pages
          </span>
          <span className="progress-percentage">
            {book.progress}%
          </span>
        </div>

        <div className="progress-bar-container">
          <div
            className="progress-bar-fill"
            style={{
              width: `${book.progress}%`,
              backgroundColor: getProgressColor(book.progress)
            }}
          />
        </div>
      </div>

      {(book.startDate || book.completeDate) && (
        <div className="book-dates">
          {book.startDate && (
            <div className="date-item">
              <span className="date-label">Started:</span>
              <span className="date-value">{formatDate(book.startDate)}</span>
            </div>
          )}
          {book.completeDate && (
            <div className="date-item">
              <span className="date-label">Finished:</span>
              <span className="date-value">{formatDate(book.completeDate)}</span>
            </div>
          )}
        </div>
      )}

      {book.review && (
        <div className="book-review-preview">
          <p className="review-text">
            "{book.review.length > 100 ? book.review.substring(0, 100) + '...' : book.review}"
          </p>
        </div>
      )}

      {book.tags && book.tags.length > 0 && (
        <div className="book-tags">
          {book.tags.map((tag, index) => (
            <span key={index} className="book-tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="card-actions">
        <button
          className="btn-update-book"
          onClick={() => onUpdate(book)}
        >
          Update
        </button>
        {onViewNotes && (
          <button
            className="btn-view-notes"
            onClick={() => onViewNotes(book)}
            title="View Notes"
          >
            📝
          </button>
        )}
        {onShowInsights && (
          <button
            className="btn-ai-insights"
            onClick={() => onShowInsights(book)}
            title="AI Insights"
          >
            ✨
          </button>
        )}
      </div>
    </div>
  );
}

export default BookCard;
