import React, { useState, useEffect } from 'react';
import reviewApi from '../../api/reviewApi';
import toast from 'react-hot-toast';
import './ReviewForm.css';

/**
 * ReviewForm - Modal for writing/editing a book review
 */
const ReviewForm = ({ bookId, bookTitle, existingReview, onClose, onSaved }) => {
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [containsSpoilers, setContainsSpoilers] = useState(false);
  const [saving, setSaving] = useState(false);

  const isEditing = !!existingReview;

  useEffect(() => {
    if (existingReview) {
      setContent(existingReview.content || '');
      setRating(existingReview.rating || 0);
      setContainsSpoilers(existingReview.containsSpoilers || false);
    }
  }, [existingReview]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    if (!content.trim()) {
      toast.error('Please write your review');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        content: content.trim(),
        rating,
        containsSpoilers
      };

      if (isEditing) {
        await reviewApi.updateReview(existingReview.id, payload);
        toast.success('Review updated!');
      } else {
        await reviewApi.createReview(bookId, payload);
        toast.success('Review published!');
      }
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Failed to save review';
      toast.error(typeof msg === 'string' ? msg : 'Failed to save review');
    } finally {
      setSaving(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="review-form-overlay" onClick={handleBackdropClick}>
      <div className="review-form-modal">
        <div className="review-form__header">
          <h2>{isEditing ? 'Edit Review' : 'Write a Review'}</h2>
          <button className="review-form__close" onClick={onClose}>✕</button>
        </div>

        {bookTitle && (
          <p className="review-form__book-title">📖 {bookTitle}</p>
        )}

        <form onSubmit={handleSubmit}>
          {/* Star Rating */}
          <div className="review-form__rating-section">
            <label>Your Rating</label>
            <div className="review-form__stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`review-form__star ${
                    star <= (hoverRating || rating) ? 'active' : ''
                  }`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  ★
                </button>
              ))}
              {rating > 0 && (
                <span className="review-form__rating-label">
                  {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][rating]}
                </span>
              )}
            </div>
          </div>

          {/* Review Content */}
          <div className="review-form__content-section">
            <label>Your Review</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What did you think about this book? Share your thoughts..."
              maxLength={5000}
              rows={6}
              className="review-form__textarea"
            />
            <span className="review-form__char-count">
              {content.length}/5000
            </span>
          </div>

          {/* Spoiler Toggle */}
          <div className="review-form__spoiler-section">
            <label className="review-form__spoiler-toggle">
              <input
                type="checkbox"
                checked={containsSpoilers}
                onChange={(e) => setContainsSpoilers(e.target.checked)}
              />
              <span className="review-form__spoiler-label">
                ⚠️ This review contains spoilers
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="review-form__actions">
            <button
              type="button"
              className="review-form__cancel"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="review-form__submit"
              disabled={saving || rating === 0 || !content.trim()}
            >
              {saving ? 'Saving...' : isEditing ? 'Update Review' : 'Publish Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewForm;
