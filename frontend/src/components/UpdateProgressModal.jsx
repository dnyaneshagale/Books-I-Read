import React, { useState, useEffect } from 'react';
import { Globe, Lock } from 'lucide-react';
import bookApi from '../api/bookApi';
import toast from 'react-hot-toast';
import ModalShell from './ui/modal-shell';
import useBodyScrollLock from '../hooks/useBodyScrollLock';
import { modalNeutralOutlineBtn, modalVioletPrimaryBtn } from './ui/modal-button-tokens';

// ── Tailwind class constants ──────────────────────────────────────────────────

const labelCls = 'block text-sm font-semibold text-slate-900 mb-2 dark:text-[#E2D9F3]';

const segmentCls = [
  'flex-1 py-2 px-3 border-none bg-transparent text-slate-500',
  'text-sm font-semibold rounded-lg cursor-pointer transition-all duration-200',
  'hover:bg-violet-500/10 dark:text-[#b8b0c8] dark:hover:bg-[rgba(124,77,255,0.15)]',
  'max-[480px]:py-1.5 max-[480px]:px-1 max-[480px]:text-[11px]',
].join(' ');

const segmentActiveCls = '!bg-gradient-to-br !from-violet-700 !to-violet-500 !text-white shadow-[0_2px_4px_rgba(99,102,241,0.3)]';

const inputPagesCls = [
  'w-20 py-2.5 px-3 border border-slate-200 rounded-lg',
  'text-lg font-bold text-center bg-white text-slate-900',
  'transition-all duration-200 focus:outline-none focus:border-violet-700',
  'focus:shadow-[0_0_0_3px_rgba(109,40,217,0.15)]',
  'dark:bg-[#2D2A35] dark:border-[#4a4556] dark:text-[#f0ecf7]',
  'max-[480px]:w-[70px] max-[480px]:py-1.5 max-[480px]:px-2.5 max-[480px]:text-sm',
].join(' ');

const dateInputCls = [
  'w-full py-2.5 px-3 border border-slate-200 rounded-lg upm-date',
  'text-sm bg-slate-50 text-slate-900 font-medium',
  'transition-all duration-200 focus:outline-none focus:border-violet-700',
  'focus:shadow-[0_0_0_3px_rgba(109,40,217,0.15)]',
  'dark:bg-[#2D2A35] dark:border-[#4a4556] dark:text-[#f0ecf7]',
  'max-[480px]:py-2 max-[480px]:px-2.5 max-[480px]:text-xs',
].join(' ');

const starBtnCls = [
  'bg-transparent border-none text-[32px] text-gray-300 cursor-pointer',
  'p-0 transition-all duration-200 hover:scale-110',
  'max-[480px]:text-2xl max-[480px]:p-1',
].join(' ');

const clearRatingCls = [
  'ml-2 py-1 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg',
  'text-slate-500 cursor-pointer transition-all duration-200',
  'hover:bg-red-500 hover:text-white hover:border-red-500',
].join(' ');

const reviewCls = [
  'w-full py-3 px-3.5 border border-slate-200 rounded-lg',
  'text-sm leading-relaxed resize-y min-h-[80px] bg-slate-50',
  'text-slate-900 font-medium transition-all duration-200 font-[inherit]',
  'placeholder:text-slate-400 focus:outline-none focus:border-violet-700',
  'focus:shadow-[0_0_0_3px_rgba(109,40,217,0.15)]',
  'dark:bg-[#2D2A35] dark:border-[#4a4556] dark:text-[#f0ecf7] dark:placeholder:text-[#8a8296]',
  'max-[480px]:min-h-[50px] max-[480px]:py-2 max-[480px]:px-2.5',
].join(' ');

const tagsInputCls = [
  'flex-1 py-2.5 px-3.5 border border-slate-200 rounded-lg',
  'text-sm bg-slate-50 text-slate-900 font-medium',
  'transition-all duration-200 placeholder:text-slate-400',
  'focus:outline-none focus:border-violet-700',
  'focus:shadow-[0_0_0_3px_rgba(109,40,217,0.15)]',
  'dark:bg-[#2D2A35] dark:border-[#4a4556] dark:text-[#f0ecf7] dark:placeholder:text-[#8a8296]',
].join(' ');

const tagAddBtnCls = [
  'py-2.5 px-4 border border-slate-200 bg-slate-50',
  'text-violet-700 text-lg font-bold rounded-lg cursor-pointer',
  'transition-all duration-200 leading-none min-w-[44px]',
  'enabled:hover:bg-violet-700 enabled:hover:text-white enabled:hover:border-violet-700',
  'disabled:opacity-40 disabled:cursor-not-allowed',
  'dark:bg-[#2D2A35] dark:border-[#4a4556] dark:text-violet-400',
  'dark:enabled:hover:bg-[#7C4DFF] dark:enabled:hover:text-[#f0ecf7] dark:enabled:hover:border-[#7C4DFF]',
].join(' ');

const TAG_GRADIENTS = [
  'from-indigo-400 to-purple-700',
  'from-fuchsia-400 to-rose-500',
  'from-sky-400 to-cyan-300',
  'from-emerald-400 to-teal-300',
  'from-rose-400 to-yellow-300',
];

/**
 * UpdateProgressModal Component - Compact Version
 *
 * Modal for updating book reading progress with context-aware fields
 */
function UpdateProgressModal({ book, onClose, onUpdated }) {
  useBodyScrollLock();

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
    <ModalShell
      onClose={onClose}
      title="Update Book"
      contentClassName="max-w-[500px] w-full max-h-[85vh] flex flex-col mx-auto dark:bg-[#0F0C15] dark:border-[#2D2A35] max-[480px]:max-w-full max-[480px]:max-h-[100dvh] max-[480px]:m-0 max-[480px]:rounded-none max-[480px]:pb-[env(safe-area-inset-bottom,0px)] min-[481px]:max-[768px]:max-w-[90%]"
      headerClassName="py-4 px-6 border-b border-slate-200 bg-gradient-to-br from-white to-slate-50 dark:from-[#0F0C15] dark:to-[#1E1B24] dark:border-[#3a3642]"
      closeBtnClassName="bg-transparent border-none text-[28px] text-slate-500 p-0 w-8 h-8 hover:bg-slate-100 hover:text-slate-900"
      bodyClassName="flex flex-col flex-1 min-h-0"
    >
        <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 upm-scrollable dark:bg-[#0F0C15]">
          {/* Book Info */}
          <div className="px-6 pt-6 pb-4 text-center border-b border-slate-200 dark:border-[#3a3642] dark:bg-[#0F0C15]">
            <h3 className="text-xl font-bold text-slate-900 m-0 mb-2 leading-snug tracking-tight dark:text-[#f0ecf7] max-[480px]:text-base">
              {book.title}
            </h3>
            <p className="text-sm text-slate-500 m-0 font-medium dark:text-[#b8b0c8] max-[480px]:text-xs">
              by {book.author}
            </p>
          </div>

          <form onSubmit={handleSubmit} id="update-book-form" className="p-6">
            {/* Compact Segmented Status Control */}
            <div className="mb-4">
              <label className={labelCls}>Status</label>
              <div className="flex bg-slate-50 rounded-xl p-1 gap-1 mt-1 dark:bg-[#1E1B24] dark:border dark:border-[#3a3642]">
                <button
                  type="button"
                  className={`${segmentCls} ${status === 'WANT_TO_READ' ? segmentActiveCls : ''}`}
                  onClick={() => handleStatusChange('WANT_TO_READ')}
                >
                  Want to Read
                </button>
                <button
                  type="button"
                  className={`${segmentCls} ${status === 'READING' ? segmentActiveCls : ''}`}
                  onClick={() => handleStatusChange('READING')}
                >
                  Reading
                </button>
                <button
                  type="button"
                  className={`${segmentCls} ${status === 'FINISHED' ? segmentActiveCls : ''}`}
                  onClick={() => handleStatusChange('FINISHED')}
                >
                  Finished
                </button>
              </div>
            </div>

            {/* Conditional: Show Progress Only for READING */}
            {status === 'READING' && (
              <div className="bg-slate-50 rounded-xl p-5 mt-4 border border-slate-200 dark:bg-[#1a1722] dark:border-[#3a3642] max-[480px]:p-3">
                <label className={labelCls}>Progress</label>

                {/* Slider with percentage */}
                <div className="flex items-center gap-3 mb-4 max-[480px]:mb-1.5">
                  <input
                    type="range"
                    value={pagesRead}
                    onChange={(e) => {
                      setPagesRead(parseInt(e.target.value));
                      setError('');
                    }}
                    min="0"
                    max={book.totalPages}
                    className="upm-slider flex-1 h-2 rounded-full outline-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${progress}%, var(--color-border) ${progress}%, var(--color-border) 100%)`
                    }}
                  />
                  <span className="text-base font-bold text-violet-700 min-w-[55px] text-right dark:text-violet-400 max-[480px]:text-xs max-[480px]:min-w-[40px]">
                    {progress}%
                  </span>
                </div>

                {/* Input + Total + Quick Buttons Row */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={pagesRead}
                      onChange={(e) => {
                        setPagesRead(parseInt(e.target.value) || 0);
                        setError('');
                      }}
                      min="0"
                      max={book.totalPages}
                      className={`${inputPagesCls} ${error ? '!border-red-500' : ''}`}
                    />
                    <span className="text-base text-slate-500 font-semibold whitespace-nowrap dark:text-[#c6b9de] max-[480px]:text-xs">
                      / {book.totalPages}
                    </span>
                  </div>

                  <div className="flex ml-auto bg-white rounded-lg border border-slate-200 overflow-hidden divide-x divide-slate-200 dark:bg-[#2D2A35] dark:border-[#4a4556] dark:divide-[#4a4556] max-[480px]:gap-1">
                    {[5, 10, 25].map(n => (
                      <button
                        key={n}
                        type="button"
                        className="py-2 px-3.5 bg-transparent border-none text-violet-700 text-[0.8125rem] font-bold cursor-pointer transition-all duration-150 hover:bg-violet-700 hover:text-white active:opacity-85 dark:text-violet-400 dark:hover:bg-[#7C4DFF] dark:hover:text-[#f0ecf7] max-[480px]:py-1.5 max-[480px]:px-2.5 max-[480px]:text-[11px]"
                        onClick={() => handleQuickUpdate(n)}
                      >
                        +{n}
                      </button>
                    ))}
                  </div>
                </div>
                {error && <span className="block text-red-500 text-xs mt-1">{error}</span>}
              </div>
            )}

            {/* Conditional: Show Dates Side-by-Side */}
            {(status === 'READING' || status === 'FINISHED') && (
              <div className="flex gap-4 mt-4 max-[480px]:gap-2">
                {status === 'READING' && (
                  <div className="flex-1">
                    <label htmlFor="startDate" className={labelCls}>Start Date</label>
                    <input
                      type="date"
                      id="startDate"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className={dateInputCls}
                    />
                  </div>
                )}
                {status === 'FINISHED' && (
                  <>
                    <div className="flex-1">
                      <label htmlFor="startDate" className={labelCls}>Start Date</label>
                      <input
                        type="date"
                        id="startDate"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className={dateInputCls}
                      />
                    </div>
                    <div className="flex-1">
                      <label htmlFor="completeDate" className={labelCls}>Complete Date</label>
                      <input
                        type="date"
                        id="completeDate"
                        value={completeDate}
                        onChange={(e) => setCompleteDate(e.target.value)}
                        className={dateInputCls}
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Conditional: Show Rating Only for FINISHED */}
            {status === 'FINISHED' && (
              <div className="mb-4 mt-4">
                <label className={labelCls}>Rating</label>
                <div className="flex items-center gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`${starBtnCls} ${star <= rating ? '!text-amber-400' : ''}`}
                      onClick={() => setRating(star)}
                    >
                      ★
                    </button>
                  ))}
                  {rating > 0 && (
                    <button type="button" className={clearRatingCls} onClick={() => setRating(0)}>
                      Clear
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Conditional: Show Review Only for FINISHED */}
            {status === 'FINISHED' && (
              <div className="mb-4">
                <label htmlFor="review" className={labelCls}>Review</label>
                <textarea
                  id="review"
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Share your thoughts about this book..."
                  rows="3"
                  maxLength="2000"
                  className={reviewCls}
                />
                <span className="block text-right text-xs text-slate-500 mt-1">{review.length}/2000</span>
              </div>
            )}

            {/* Tags - Always Show */}
            <div className="mb-4">
              <label htmlFor="tags" className={labelCls}>Tags</label>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder="Add tags (press Enter)"
                  className={tagsInputCls}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className={tagAddBtnCls}
                  disabled={!tagInput.trim()}
                >
                  +
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className={`inline-flex items-center gap-1 py-1.5 px-3 bg-gradient-to-br ${TAG_GRADIENTS[index % TAG_GRADIENTS.length]} text-white rounded-full text-sm font-medium animate-[tagFadeIn_0.2s_ease]`}
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="bg-white/30 border-none text-white text-lg font-bold w-5 h-5 rounded-full cursor-pointer flex items-center justify-center p-0 leading-none transition-colors duration-200 hover:bg-white/50"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Privacy Toggle */}
            <div className="mb-4 mt-4">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-[18px] h-[18px] accent-violet-700 cursor-pointer"
                />
                <span className="text-[0.9rem] text-slate-500">
                  {isPublic ? <><Globe className="w-3.5 h-3.5 inline mr-1" />Public — visible to your followers</> : <><Lock className="w-3.5 h-3.5 inline mr-1" />Private — only you can see this book</>}
                </span>
              </label>
            </div>
          </form>
        </div>

        {/* Sticky Actions */}
        <div className="flex gap-3 p-6 border-t border-slate-200 bg-white shrink-0 sticky bottom-0 z-10 dark:bg-[#0F0C15] dark:border-[#3a3642] max-[480px]:pt-3 max-[480px]:gap-2">
          <button type="button" className={modalNeutralOutlineBtn} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form="update-book-form" className={modalVioletPrimaryBtn} disabled={isSubmitting}>
            {isSubmitting ? 'Updating...' : 'Update Book'}
          </button>
        </div>
    </ModalShell>
  );
}

export default UpdateProgressModal;
