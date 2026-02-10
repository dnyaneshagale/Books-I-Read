import React, { useState, useEffect } from 'react';
import bookApi from '../api/bookApi';
import toast from 'react-hot-toast';
import './UpdateProgressModal.css';

/**
 * UpdateProgressModal Component - Compact Version
 * 
 * Modal for updating book reading progress with context-aware fields
 */
function UpdateProgressModal({ book, onClose, onUpdated }) {
  const [pagesRead, setPagesRead] = useState(book.pagesRead);
  const [status, setStatus] = useState(book.status || 'WANT_TO_READ');
  const [rating, setRating] = useState(book.rating || 0);
  const [review, setReview] = useState(book.review || '');
  const [startDate, setStartDate] = useState(book.startDate || '');
  const [completeDate, setCompleteDate] = useState(book.completeDate || '');
  const [tags, setTags] = useState(book.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [isPublic, setIsPublic] = useState(book.isPublic !== false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Calculate live progress
  const calculateProgress = () => {
    if (!book.totalPages) return 0;
    return Math.round((pagesRead / book.totalPages) * 100 * 100) / 100;
  };

  const progress = calculateProgress();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (pagesRead < 0) {
      setError('Pages read cannot be negative');
      return;
    }

    if (pagesRead > book.totalPages) {
      setError(`Pages read cannot exceed total pages (${book.totalPages})`);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const updatedData = {
        title: book.title,
        author: book.author,
        totalPages: book.totalPages,
        pagesRead: parseInt(pagesRead),
        status: status,
        rating: rating > 0 ? rating : null,
        review: review.trim() || null,
        startDate: startDate || null,
        completeDate: completeDate || null,
        tags: tags,
        isPublic: isPublic
      };

      await bookApi.updateBook(book.id, updatedData);
      
      if (status === 'FINISHED' && book.status !== 'FINISHED') {
        toast.success('🎉 Book marked as finished!');
      } else {
        toast.success('📈 Book updated successfully!');
      }

      if (onUpdated) {
        onUpdated();
      }
      onClose();
    } catch (error) {
      if (error.response?.data?.message) {
        setError(error.response.data.message);
        toast.error(error.response.data.message);
      } else {
        setError('Failed to update book. Please try again.');
        toast.error('Failed to update book');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickUpdate = (pages) => {
    const newPagesRead = Math.min(Math.max(pagesRead + pages, 0), book.totalPages);
    setPagesRead(newPagesRead);
    setError('');
  };

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    
    if (newStatus === 'READING') {
      if (!startDate) {
        setStartDate(new Date().toISOString().split('T')[0]);
      }
      setCompleteDate('');
    } else if (newStatus === 'FINISHED') {
      if (!completeDate) {
        setCompleteDate(new Date().toISOString().split('T')[0]);
      }
      setPagesRead(book.totalPages);
    } else if (newStatus === 'WANT_TO_READ') {
      setStartDate('');
      setCompleteDate('');
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content update-modal-compact" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Update Book</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body-scrollable">
          <div className="book-info-compact">
            <h3>{book.title}</h3>
            <p className="author-text">by {book.author}</p>
          </div>

          <form onSubmit={handleSubmit} id="update-book-form">
          {/* Compact Segmented Status Control */}
          <div className="form-group">
            <label>Status</label>
            <div className="status-segmented">
              <button
                type="button"
                className={`status-segment ${status === 'WANT_TO_READ' ? 'active' : ''}`}
                onClick={() => handleStatusChange('WANT_TO_READ')}
              >
                Want to Read
              </button>
              <button
                type="button"
                className={`status-segment ${status === 'READING' ? 'active' : ''}`}
                onClick={() => handleStatusChange('READING')}
              >
                Reading
              </button>
              <button
                type="button"
                className={`status-segment ${status === 'FINISHED' ? 'active' : ''}`}
                onClick={() => handleStatusChange('FINISHED')}
              >
                Finished
              </button>
            </div>
          </div>

          {/* Conditional: Show Progress Only for READING */}
          {status === 'READING' && (
            <div className="progress-compact-section">
              <label>Progress</label>
              
              {/* Slider with percentage */}
              <div className="slider-row">
                <input
                  type="range"
                  value={pagesRead}
                  onChange={(e) => {
                    setPagesRead(parseInt(e.target.value));
                    setError('');
                  }}
                  min="0"
                  max={book.totalPages}
                  className="pages-slider-compact"
                  style={{
                    background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${progress}%, var(--color-border) ${progress}%, var(--color-border) 100%)`
                  }}
                />
                <span className="progress-percent">{progress}%</span>
              </div>

              {/* Input + Total + Quick Buttons Row */}
              <div className="progress-controls-row">
                <div className="pages-input-compact">
                  <input
                    type="number"
                    value={pagesRead}
                    onChange={(e) => {
                      setPagesRead(parseInt(e.target.value) || 0);
                      setError('');
                    }}
                    min="0"
                    max={book.totalPages}
                    className={`input-pages ${error ? 'error' : ''}`}
                  />
                  <span className="pages-total-text">/ {book.totalPages}</span>
                </div>
                
                <div className="quick-buttons-inline">
                  <button type="button" onClick={() => handleQuickUpdate(5)}>+5</button>
                  <button type="button" onClick={() => handleQuickUpdate(10)}>+10</button>
                  <button type="button" onClick={() => handleQuickUpdate(25)}>+25</button>
                </div>
              </div>
              {error && <span className="error-message-compact">{error}</span>}
            </div>
          )}

          {/* Conditional: Show Dates Side-by-Side */}
          {(status === 'READING' || status === 'FINISHED') && (
            <div className="form-row-inline">
              {status === 'READING' && (
                <div className="form-group-half">
                  <label htmlFor="startDate">Start Date</label>
                  <input
                    type="date"
                    id="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
              )}
              {status === 'FINISHED' && (
                <>
                  <div className="form-group-half">
                    <label htmlFor="startDate">Start Date</label>
                    <input
                      type="date"
                      id="startDate"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="form-group-half">
                    <label htmlFor="completeDate">Complete Date</label>
                    <input
                      type="date"
                      id="completeDate"
                      value={completeDate}
                      onChange={(e) => setCompleteDate(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Conditional: Show Rating Only for FINISHED */}
          {status === 'FINISHED' && (
            <div className="form-group">
              <label>Rating</label>
              <div className="rating-input-compact">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star-btn ${star <= rating ? 'filled' : ''}`}
                    onClick={() => setRating(star)}
                  >
                    ★
                  </button>
                ))}
                {rating > 0 && (
                  <button
                    type="button"
                    className="clear-rating-btn"
                    onClick={() => setRating(0)}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Conditional: Show Review Only for FINISHED */}
          {status === 'FINISHED' && (
            <div className="form-group">
              <label htmlFor="review">Review</label>
              <textarea
                id="review"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Share your thoughts about this book..."
                rows="3"
                maxLength="2000"
                className="review-compact"
              />
              <span className="char-count">{review.length}/2000</span>
            </div>
          )}

          {/* Tags - Always Show */}
          <div className="form-group">
            <label htmlFor="tags">Tags</label>
            <div className="tags-input-container">
              <input
                type="text"
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                placeholder="Add tags (press Enter)"
                className="tags-input-compact"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="tags-add-btn"
                disabled={!tagInput.trim()}
              >
                +
              </button>
            </div>
            {tags.length > 0 && (
              <div className="tags-display-compact">
                {tags.map((tag, index) => (
                  <span key={index} className="tag-chip">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="tag-remove"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Privacy Toggle */}
          <div className="form-group form-group--toggle">
            <label className="privacy-toggle">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
              <span className="privacy-toggle__label">
                {isPublic ? '🌍 Public — visible to your followers' : '🔒 Private — only you can see this book'}
              </span>
            </label>
          </div>

          </form>
        </div>

        <div className="modal-actions-sticky">
          <button type="button" className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form="update-book-form" className="btn-update" disabled={isSubmitting}>
            {isSubmitting ? 'Updating...' : 'Update Book'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default UpdateProgressModal;
