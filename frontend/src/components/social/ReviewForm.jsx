import React, { useState, useEffect } from 'react';
import reviewApi from '../../api/reviewApi';
import toast from 'react-hot-toast';

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000] p-4 animate-[g-fadeIn_0.2s] max-[480px]:items-end max-[480px]:p-0" onClick={handleBackdropClick}>
      <div className="bg-white rounded-2xl w-full max-w-[520px] max-h-[90vh] overflow-y-auto p-6 animate-[g-slideUp_0.25s_ease-out] dark:bg-[#1e1e2e] max-[480px]:max-h-[95vh] max-[480px]:rounded-b-none max-[480px]:fixed max-[480px]:bottom-0 max-[480px]:left-0 max-[480px]:right-0 max-[480px]:max-w-none">
        <div className="flex justify-between items-center mb-2">
          <h2 className="m-0 text-[1.2rem] font-bold text-[#111] dark:text-[#e0e0e0]">{isEditing ? 'Edit Review' : 'Write a Review'}</h2>
          <button className="bg-transparent border-none text-[1.2rem] cursor-pointer text-[#999] py-1 px-2 rounded-md transition-colors duration-150 hover:bg-black/[0.06] dark:text-[#666] dark:hover:bg-white/[0.08]" onClick={onClose}>✕</button>
        </div>

        {bookTitle && (
          <p className="text-[0.9rem] text-[#666] m-0 mb-4 dark:text-[#888]">📖 {bookTitle}</p>
        )}

        <form onSubmit={handleSubmit}>
          {/* Star Rating */}
          <div className="mb-4">
            <label className="block text-[0.85rem] font-semibold text-[#333] mb-1.5 dark:text-[#ccc]">Your Rating</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`bg-transparent border-none cursor-pointer text-[2rem] p-0 transition-all duration-100 hover:scale-[1.15] ${
                    star <= (hoverRating || rating) ? 'text-amber-400' : 'text-[#d4d4d8]'
                  }`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  ★
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-[0.85rem] text-[#666] font-medium dark:text-[#888]">
                  {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][rating]}
                </span>
              )}
            </div>
          </div>

          {/* Review Content */}
          <div className="mb-3 relative">
            <label className="block text-[0.85rem] font-semibold text-[#333] mb-1.5 dark:text-[#ccc]">Your Review</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What did you think about this book? Share your thoughts..."
              maxLength={5000}
              rows={6}
              className="w-full p-3 border border-[#d4d4d8] rounded-[10px] text-[0.9rem] font-[inherit] resize-y min-h-[120px] outline-none transition-colors duration-200 box-border text-[#333] bg-white focus:border-indigo-500 dark:bg-[#141422] dark:border-[#3d3d50] dark:text-[#e0e0e0] dark:focus:border-indigo-400"
            />
            <span className="absolute bottom-2 right-3 text-[0.72rem] text-[#999] dark:text-[#555]">
              {content.length}/5000
            </span>
          </div>

          {/* Spoiler Toggle */}
          <div className="mb-5">
            <label className="flex items-center gap-2 cursor-pointer text-[0.85rem]">
              <input
                type="checkbox"
                checked={containsSpoilers}
                onChange={(e) => setContainsSpoilers(e.target.checked)}
                className="w-4 h-4 accent-indigo-500 cursor-pointer"
              />
              <span className="text-[#555] dark:text-[#aaa]">
                ⚠️ This review contains spoilers
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-2.5 justify-end">
            <button
              type="button"
              className="py-2.5 px-5 rounded-[10px] border border-[#d4d4d8] bg-transparent text-[#666] text-[0.9rem] cursor-pointer transition-colors duration-150 hover:bg-black/[0.04] dark:border-[#3d3d50] dark:text-[#aaa] dark:hover:bg-white/[0.06]"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2.5 px-6 rounded-[10px] border-none bg-gradient-to-br from-indigo-500 to-violet-500 text-white text-[0.9rem] font-semibold cursor-pointer transition-all duration-150 hover:enabled:opacity-90 hover:enabled:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
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
