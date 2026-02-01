import React, { useState, useEffect } from 'react';
import bookApi from '../api/bookApi';
import toast from 'react-hot-toast';
import './UpdateProgressModal.css';

/**
 * UpdateProgressModal Component
 * 
 * Modal for updating book reading progress, status, rating, and review
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
        tags: tags
      };

      await bookApi.updateBook(book.id, updatedData);
      
      // Show different messages based on completion
      if (status === 'FINISHED' && book.status !== 'FINISHED') {
        toast.success('🎉 Book marked as finished! Congratulations!');
      } else {
        toast.success('📈 Book updated successfully!');
      }

      if (onUpdated) {
        onUpdated();
      }
      onClose();
    } catch (error) {
      console.error('Error updating book:', error);
      
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
    
    // Auto-set dates based on status
    if (newStatus === 'READING') {
      // Set start date if not already set
      if (!startDate) {
        setStartDate(new Date().toISOString().split('T')[0]);
      }
      // Clear complete date if coming from FINISHED
      setCompleteDate('');
    } else if (newStatus === 'FINISHED') {
      // Set complete date if not already set
      if (!completeDate) {
        setCompleteDate(new Date().toISOString().split('T')[0]);
      }
      // Set pages to max when marking as finished
      setPagesRead(book.totalPages);
    } else if (newStatus === 'WANT_TO_READ') {
      // Clear both dates when setting to Want to Read
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

  // Close on escape key
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
      <div className="modal-content update-modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Update Book</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="book-info">
          <h3>{book.title}</h3>
          <p className="author-text">by {book.author}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            {/* Status Selection */}
            <div className="form-group">
              <label>Reading Status</label>
              <div className="status-buttons">
                <button
                  type="button"
                  className={`status-btn ${status === 'WANT_TO_READ' ? 'active' : ''}`}
                  onClick={() => handleStatusChange('WANT_TO_READ')}
                >
                  Want to Read
                </button>
                <button
                  type="button"
                  className={`status-btn ${status === 'READING' ? 'active' : ''}`}
                  onClick={() => handleStatusChange('READING')}
                >
                  Reading
                </button>
                <button
                  type="button"
                  className={`status-btn ${status === 'FINISHED' ? 'active' : ''}`}
                  onClick={() => handleStatusChange('FINISHED')}
                >
                  Finished
                </button>
              </div>
            </div>
          </div>

          {/* Progress Section - Simplified and Visual */}
          <div className="progress-update-section">
            <div className="progress-header">
              <label>Reading Progress</label>
              <div className="progress-display">
                <span className="pages-current">{pagesRead}</span>
                <span className="pages-separator">/</span>
                <span className="pages-total">{book.totalPages}</span>
                <span className="pages-label">pages</span>
              </div>
            </div>
            
            {/* Visual Slider */}
            <div className="slider-container">
              <input
                type="range"
                id="pagesSlider"
                value={pagesRead}
                onChange={(e) => {
                  setPagesRead(parseInt(e.target.value));
                  setError('');
                }}
                min="0"
                max={book.totalPages}
                className="pages-slider"
                style={{
                  background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${progress}%, #e2e8f0 ${progress}%, #e2e8f0 100%)`
                }}
              />
              <div className="progress-percentage">{progress}%</div>
            </div>

            {/* Direct Input for Precise Control */}
            <div className="pages-input-row">
              <label htmlFor="pagesRead" className="sr-only">Pages Read</label>
              <input
                type="number"
                id="pagesRead"
                value={pagesRead}
                onChange={(e) => {
                  setPagesRead(parseInt(e.target.value) || 0);
                  setError('');
                }}
                min="0"
                max={book.totalPages}
                className={`pages-input ${error ? 'error' : ''}`}
                placeholder="Enter pages"
              />
              {error && <span className="error-message">{error}</span>}
            </div>

            {/* Quick Actions - Larger and More Prominent */}
            <div className="quick-actions-grid">
              <button type="button" className="quick-action-btn" onClick={() => handleQuickUpdate(10)}>
                <span className="quick-number">+10</span>
                <span className="quick-label">pages</span>
              </button>
              <button type="button" className="quick-action-btn" onClick={() => handleQuickUpdate(25)}>
                <span className="quick-number">+25</span>
                <span className="quick-label">pages</span>
              </button>
              <button type="button" className="quick-action-btn" onClick={() => handleQuickUpdate(50)}>
                <span className="quick-number">+50</span>
                <span className="quick-label">pages</span>
              </button>
              <button type="button" className="quick-action-btn quick-action-complete" onClick={() => setPagesRead(book.totalPages)}>
                <span className="quick-number">✓</span>
                <span className="quick-label">Finish</span>
              </button>
            </div>
          </div>

          <div className="form-row">
            {/* Start Date */}
            <div className="form-group">
              <label htmlFor="startDate">Start Date</label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            {/* Complete Date */}
            <div className="form-group">
              <label htmlFor="completeDate">Complete Date</label>
              <input
                type="date"
                id="completeDate"
                value={completeDate}
                onChange={(e) => setCompleteDate(e.target.value)}
              />
            </div>
          </div>

          {/* Rating */}
          <div className="form-group">
            <label>Rating</label>
            <div className="rating-input">
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

          {/* Review */}
          <div className="form-group">
            <label htmlFor="review">Review / Notes</label>
            <textarea
              id="review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your thoughts about this book..."
              rows="4"
              maxLength="2000"
            />
            <span className="char-count">{review.length}/2000</span>
          </div>
          {/* Tags */}
          <div className="form-group">
            <label htmlFor="tags">Tags / Genres</label>
            <div className="tags-input-container">
              <input
                type="text"
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                placeholder="Add tags (press Enter or comma)"
                className="tags-input"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="btn-add-tag"
                disabled={!tagInput.trim()}
              >
                +
              </button>
            </div>
            {tags.length > 0 && (
              <div className="tags-display">
                {tags.map((tag, index) => (
                  <span key={index} className="tag-chip">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="tag-remove"
                      aria-label="Remove tag"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpdateProgressModal;
