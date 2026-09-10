import React, { useState, useEffect } from 'react';
import bookApi from '../api/bookApi';
import toast from 'react-hot-toast';

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

  const calculateProgress = () => {
    if (!book.totalPages) return 0;
    return Math.round((pagesRead / book.totalPages) * 100 * 100) / 100;
  };

  const progress = calculateProgress();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pagesRead < 0) { setError('Pages read cannot be negative'); return; }
    if (pagesRead > book.totalPages) { setError(`Pages read cannot exceed total pages (${book.totalPages})`); return; }

    setIsSubmitting(true);
    setError('');

    try {
      const updatedData = {
        title: book.title, author: book.author, totalPages: book.totalPages,
        pagesRead: parseInt(pagesRead), status, rating: rating > 0 ? rating : null,
        review: review.trim() || null, startDate: startDate || null,
        completeDate: completeDate || null, tags, isPublic
      };
      await bookApi.updateBook(book.id, updatedData);
      if (status === 'FINISHED' && book.status !== 'FINISHED') { toast.success('🎉 Book marked as finished!'); }
      else { toast.success('📈 Book updated successfully!'); }
      if (onUpdated) onUpdated();
      onClose();
    } catch (error) {
      if (error.response?.data?.message) { setError(error.response.data.message); toast.error(error.response.data.message); }
      else { setError('Failed to update book. Please try again.'); toast.error('Failed to update book'); }
    } finally { setIsSubmitting(false); }
  };

  const handleQuickUpdate = (pages) => {
    const newPagesRead = Math.min(Math.max(pagesRead + pages, 0), book.totalPages);
    setPagesRead(newPagesRead);
    setError('');
  };

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    if (newStatus === 'READING') {
      if (!startDate) setStartDate(new Date().toISOString().split('T')[0]);
      setCompleteDate('');
    } else if (newStatus === 'FINISHED') {
      if (!completeDate) setCompleteDate(new Date().toISOString().split('T')[0]);
      setPagesRead(book.totalPages);
    } else if (newStatus === 'WANT_TO_READ') {
      setStartDate(''); setCompleteDate('');
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) { setTags([...tags, tag]); setTagInput(''); }
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); handleAddTag(); }
  };

  const handleRemoveTag = (tagToRemove) => { setTags(tags.filter(tag => tag !== tagToRemove)); };

  useEffect(() => {
    const handleEscape = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div className="modal-overlay fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-md animate-fade-in overflow-y-auto max-md:p-sm" onClick={onClose}>
      <div className="update-modal-compact modal-content bg-bg dark:!bg-[#0F0C15] rounded-xl max-w-[500px] w-full max-h-[85vh] flex flex-col animate-slide-up shadow-xl border border-border m-auto max-[480px]:max-w-full max-[480px]:max-h-screen max-[480px]:m-0 max-[480px]:rounded-none max-md:max-w-[90%]" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="modal-header flex justify-between items-center py-md px-lg border-b border-border bg-gradient-to-br from-bg to-bg-secondary dark:!bg-gradient-to-br dark:!from-[#0F0C15] dark:!to-[#1E1B24] dark:!border-b-[#3a3642] flex-shrink-0">
          <h2 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent m-0">Update Book</h2>
          <button className="close-btn bg-none border-none text-[28px] text-txt-secondary cursor-pointer p-0 w-8 h-8 flex items-center justify-center rounded-sm transition-all duration-200 hover:bg-bg-hover hover:text-txt-primary" onClick={onClose}>×</button>
        </div>

        {/* Scrollable body */}
        <div className="modal-body-scrollable flex-1 overflow-y-auto overflow-x-hidden p-0 min-h-0 dark:!bg-[#0F0C15]">
          {/* Book Info */}
          <div className="book-info-compact py-6 px-6 pb-4 text-center border-b border-border bg-bg dark:!bg-[#0F0C15] dark:!border-b-[#3a3642] max-[480px]:px-4">
            <h3 className="text-[1.25rem] font-bold text-txt-primary dark:!text-[#f0ecf7] m-0 mb-2 leading-[1.4] tracking-[-0.01em] max-[480px]:text-base">{book.title}</h3>
            <p className="author-text text-sm text-txt-secondary dark:!text-[#b8b0c8] m-0 font-medium max-[480px]:text-xs">by {book.author}</p>
          </div>

          <form onSubmit={handleSubmit} id="update-book-form" className="p-6 max-[480px]:p-4">
            {/* Status Segmented Control */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-txt-primary dark:!text-[#E2D9F3] mb-2">Status</label>
              <div className="status-segmented flex bg-bg-secondary dark:!bg-[#1E1B24] dark:!border dark:!border-[#3a3642] rounded-md p-1 gap-1 mt-xs">
                {['WANT_TO_READ', 'READING', 'FINISHED'].map(s => (
                  <button key={s} type="button"
                    className={`status-segment flex-1 py-2 px-3 border-none text-sm font-semibold rounded-sm cursor-pointer transition-all duration-200 max-[480px]:py-1.5 max-[480px]:px-1 max-[480px]:text-[11px] ${status === s ? 'bg-gradient-primary text-white shadow-[0_2px_4px_rgba(99,102,241,0.3)]' : 'bg-transparent text-txt-secondary dark:!text-[#b8b0c8] hover:bg-[rgba(99,102,241,0.1)] dark:hover:!bg-[rgba(124,77,255,0.15)] dark:hover:!text-[#d4ccf0]'}`}
                    onClick={() => handleStatusChange(s)}
                  >
                    {s === 'WANT_TO_READ' ? 'Want to Read' : s === 'READING' ? 'Reading' : 'Finished'}
                  </button>
                ))}
              </div>
            </div>

            {/* Progress Section */}
            {status === 'READING' && (
              <div className="progress-compact-section bg-bg-secondary dark:!bg-[#1a1722] dark:!border-[#3a3642] rounded-xl p-5 mt-4 border border-border max-[480px]:p-sm">
                <label className="block text-sm font-semibold text-txt-primary dark:!text-[#E2D9F3] mb-3">Progress</label>
                <div className="slider-row flex items-center gap-3 mb-4 max-[480px]:mb-1.5">
                  <input
                    type="range" value={pagesRead}
                    onChange={(e) => { setPagesRead(parseInt(e.target.value)); setError(''); }}
                    min="0" max={book.totalPages}
                    className="pages-slider-compact flex-1 h-2 rounded-full outline-none cursor-pointer appearance-none"
                    style={{ background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${progress}%, var(--color-border) ${progress}%, var(--color-border) 100%)` }}
                  />
                  <span className="progress-percent text-base font-bold text-primary dark:!text-[#a78bfa] min-w-[55px] text-right max-[480px]:text-xs max-[480px]:min-w-[40px]">{progress}%</span>
                </div>
                <div className="progress-controls-row flex items-center gap-3 max-md:gap-xs">
                  <div className="pages-input-compact flex items-center gap-2">
                    <input type="number" value={pagesRead}
                      onChange={(e) => { setPagesRead(parseInt(e.target.value) || 0); setError(''); }}
                      min="0" max={book.totalPages}
                      className={`input-pages w-20 py-2.5 px-3 border border-border rounded-lg text-[1.125rem] font-bold text-center bg-bg dark:!bg-[#2D2A35] dark:!border-[#4a4556] dark:!text-[#f0ecf7] text-txt-primary transition-all duration-200 focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(109,40,217,0.15)] max-[480px]:w-[70px] max-[480px]:py-1.5 max-[480px]:px-2.5 max-[480px]:text-sm ${error ? '!border-danger' : ''}`}
                    />
                    <span className="pages-total-text text-base font-semibold text-txt-secondary dark:!text-[#c6b9de] whitespace-nowrap max-[480px]:text-xs">/ {book.totalPages}</span>
                  </div>
                  <div className="quick-buttons-inline flex gap-0 ml-auto bg-bg dark:!bg-[#2D2A35] rounded-lg border border-border dark:!border-[#4a4556] overflow-hidden">
                    {[5, 10, 25].map(n => (
                      <button key={n} type="button" onClick={() => handleQuickUpdate(n)}
                        className="py-2 px-3.5 border-none border-r border-r-border dark:!border-r-[#4a4556] bg-transparent text-primary dark:!text-[#a78bfa] text-[0.8125rem] font-bold cursor-pointer transition-all duration-150 hover:bg-primary dark:hover:!bg-[#7C4DFF] hover:text-white dark:hover:!text-[#f0ecf7] active:opacity-85 last:border-r-0 max-[480px]:py-1.5 max-[480px]:px-2.5 max-[480px]:text-[11px]"
                      >+{n}</button>
                    ))}
                  </div>
                </div>
                {error && <span className="block text-danger text-xs mt-xs">{error}</span>}
              </div>
            )}

            {/* Dates */}
            {(status === 'READING' || status === 'FINISHED') && (
              <div className="form-row-inline flex gap-4 mt-4 max-[480px]:gap-xs">
                {(status === 'READING' || status === 'FINISHED') && (
                  <div className="form-group-half flex-1">
                    <label htmlFor="startDate" className="block text-sm font-semibold text-txt-primary dark:!text-[#E2D9F3] mb-2">Start Date</label>
                    <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                      className="w-full py-2.5 px-3 border border-border rounded-lg text-sm bg-bg-secondary dark:!bg-[#2D2A35] dark:!border-[#4a4556] dark:!text-[#f0ecf7] text-txt-primary font-medium transition-all duration-200 focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(109,40,217,0.15)] max-[480px]:py-2 max-[480px]:px-2.5 max-[480px]:text-xs" />
                  </div>
                )}
                {status === 'FINISHED' && (
                  <div className="form-group-half flex-1">
                    <label htmlFor="completeDate" className="block text-sm font-semibold text-txt-primary dark:!text-[#E2D9F3] mb-2">Complete Date</label>
                    <input type="date" id="completeDate" value={completeDate} onChange={(e) => setCompleteDate(e.target.value)}
                      className="w-full py-2.5 px-3 border border-border rounded-lg text-sm bg-bg-secondary dark:!bg-[#2D2A35] dark:!border-[#4a4556] dark:!text-[#f0ecf7] text-txt-primary font-medium transition-all duration-200 focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(109,40,217,0.15)] max-[480px]:py-2 max-[480px]:px-2.5 max-[480px]:text-xs" />
                  </div>
                )}
              </div>
            )}

            {/* Rating */}
            {status === 'FINISHED' && (
              <div className="mb-4 mt-4">
                <label className="block text-sm font-semibold text-txt-primary dark:!text-[#E2D9F3] mb-2">Rating</label>
                <div className="rating-input-compact flex items-center gap-xs mt-xs">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button"
                      className={`star-btn bg-none border-none text-[32px] cursor-pointer p-0 transition-all duration-200 hover:scale-110 max-[480px]:text-2xl max-[480px]:p-1 ${star <= rating ? 'text-amber-400' : 'text-gray-300'}`}
                      onClick={() => setRating(star)}
                    >★</button>
                  ))}
                  {rating > 0 && (
                    <button type="button" className="clear-rating-btn ml-sm py-1 px-3 text-xs bg-bg-secondary border border-border rounded-sm text-txt-secondary cursor-pointer transition-all duration-200 hover:bg-danger hover:text-white hover:border-danger" onClick={() => setRating(0)}>Clear</button>
                  )}
                </div>
              </div>
            )}

            {/* Review */}
            {status === 'FINISHED' && (
              <div className="mb-4">
                <label htmlFor="review" className="block text-sm font-semibold text-txt-primary dark:!text-[#E2D9F3] mb-2">Review</label>
                <textarea id="review" value={review} onChange={(e) => setReview(e.target.value)}
                  placeholder="Share your thoughts about this book..."
                  rows="3" maxLength="2000"
                  className="review-compact w-full py-3 px-3.5 border border-border rounded-lg text-sm leading-[1.6] resize-y min-h-[80px] bg-bg-secondary dark:!bg-[#2D2A35] dark:!border-[#4a4556] dark:!text-[#f0ecf7] text-txt-primary font-medium transition-all duration-200 font-[inherit] placeholder:text-txt-light dark:placeholder:!text-[#8a8296] focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(109,40,217,0.15)] max-[480px]:min-h-[50px] max-[480px]:py-2 max-[480px]:px-2.5"
                />
                <span className="block text-right text-xs text-txt-secondary mt-xs">{review.length}/2000</span>
              </div>
            )}

            {/* Tags */}
            <div className="mb-4">
              <label htmlFor="tags" className="block text-sm font-semibold text-txt-primary dark:!text-[#E2D9F3] mb-2">Tags</label>
              <div className="tags-input-container flex gap-2 items-center">
                <input type="text" id="tags" value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown} placeholder="Add tags (press Enter)"
                  className="tags-input-compact flex-1 py-2.5 px-3.5 border border-border rounded-lg text-sm bg-bg-secondary dark:!bg-[#2D2A35] dark:!border-[#4a4556] dark:!text-[#f0ecf7] text-txt-primary font-medium transition-all duration-200 placeholder:text-txt-light dark:placeholder:!text-[#8a8296] focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(109,40,217,0.15)]" />
                <button type="button" onClick={handleAddTag} disabled={!tagInput.trim()}
                  className="tags-add-btn py-2.5 px-4 border border-border bg-bg-secondary dark:!bg-[#2D2A35] dark:!border-[#4a4556] text-primary dark:!text-[#a78bfa] text-[1.125rem] font-bold rounded-lg cursor-pointer transition-all duration-200 leading-none min-w-[44px] hover:bg-primary dark:hover:!bg-[#7C4DFF] hover:text-white dark:hover:!text-[#f0ecf7] hover:border-primary dark:hover:!border-[#7C4DFF] disabled:opacity-40 disabled:cursor-not-allowed">+</button>
              </div>
              {tags.length > 0 && (
                <div className="tags-display-compact flex flex-wrap gap-xs mt-sm">
                  {tags.map((tag, index) => (
                    <span key={index} className="tag-chip inline-flex items-center gap-xs py-1.5 px-3 bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white rounded-[20px] text-sm font-medium animate-[tagFadeIn_0.2s_ease] even:bg-gradient-to-br even:from-[#f093fb] even:to-[#f5576c]">
                      {tag}
                      <button type="button" onClick={() => handleRemoveTag(tag)}
                        className="tag-remove bg-white/30 border-none text-white text-lg font-bold w-5 h-5 rounded-full cursor-pointer flex items-center justify-center p-0 leading-none transition-colors duration-200 hover:bg-white/50">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Privacy Toggle */}
            <div className="mt-md">
              <label className="privacy-toggle flex items-center gap-sm cursor-pointer select-none">
                <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-[18px] h-[18px] accent-primary cursor-pointer" />
                <span className="privacy-toggle__label text-[0.9rem] text-txt-secondary">
                  {isPublic ? '🌍 Public — visible to your followers' : '🔒 Private — only you can see this book'}
                </span>
              </label>
            </div>
          </form>
        </div>

        {/* Sticky Actions */}
        <div className="modal-actions-sticky flex gap-3 p-6 border-t border-border bg-bg dark:!bg-[#0F0C15] dark:!border-t-[#3a3642] flex-shrink-0 sticky bottom-0 z-10 max-[480px]:pt-sm max-[480px]:gap-sm">
          <button type="button" className="btn-cancel flex-1 py-3 px-6 border border-border dark:!border-[#4a4556] bg-transparent text-txt-primary dark:!text-[#E2D9F3] text-sm font-semibold rounded-md cursor-pointer transition-all duration-200 hover:bg-bg-secondary dark:hover:!bg-[#2D2A35] hover:border-txt-secondary dark:hover:!border-[#7C4DFF] dark:hover:!text-[#f0ecf7] max-[480px]:py-2.5 max-[480px]:px-4 max-[480px]:text-sm" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form="update-book-form" className="btn-update flex-[2] py-3 px-6 border-none bg-primary dark:!bg-[#7C4DFF] text-white dark:!text-[#f0ecf7] text-sm font-bold rounded-md cursor-pointer transition-all duration-200 shadow-[0_2px_8px_rgba(109,40,217,0.25)] dark:!shadow-[0_2px_12px_rgba(124,77,255,0.3)] hover:bg-primary-hover dark:hover:!bg-[#6A3DE8] hover:shadow-[0_4px_12px_rgba(109,40,217,0.35)] dark:hover:!shadow-[0_4px_16px_rgba(124,77,255,0.4)] disabled:opacity-60 disabled:cursor-not-allowed max-[480px]:py-2.5 max-[480px]:px-4 max-[480px]:text-sm" disabled={isSubmitting}>
            {isSubmitting ? 'Updating...' : 'Update Book'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default UpdateProgressModal;
