import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import reviewApi from '../../api/reviewApi';
import toast from 'react-hot-toast';

const ReviewCard = ({ review, currentUserId, onUpdate, compact = false }) => {
  const [liked, setLiked] = useState(review.likedByViewer || false);
  const [likesCount, setLikesCount] = useState(review.likesCount || 0);
  const [showSpoiler, setShowSpoiler] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [saved, setSaved] = useState(review.savedByViewer || false);
  const navigate = useNavigate();

  const handleLike = async (e) => {
    e.stopPropagation();
    try { const res = await reviewApi.toggleLike(review.id); setLiked(res.data.liked); setLikesCount(res.data.likesCount); if (onUpdate) onUpdate(); } catch { }
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    const reviewUrl = `${window.location.origin}/reviews/${review.id}`;
    try { await navigator.clipboard.writeText(reviewUrl); toast.success('Review link copied!'); } catch { toast.error('Failed to copy link'); }
  };

  const handleSave = async (e) => {
    e.stopPropagation();
    try { const res = await reviewApi.toggleSave(review.id); setSaved(res.data.saved); toast.success(res.data.saved ? 'Review saved!' : 'Review unsaved'); } catch { toast.error('Failed to save review'); }
  };

  const handleAuthorClick = (e) => { e.stopPropagation(); navigate(`/profile/${review.authorUsername}`); };
  const handleReviewClick = () => { navigate(`/reviews/${review.id}`); };
  const renderStars = (rating) => '★'.repeat(rating) + '☆'.repeat(5 - rating);

  const formatDate = (dateString) => {
    const date = new Date(dateString); const now = new Date(); const diffMs = now - date; const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays === 0) return 'Today'; if (diffDays === 1) return 'Yesterday'; if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className={`bg-bg dark:bg-[var(--color-bg-secondary,#1E1B24)] rounded-2xl border border-border dark:border-[var(--color-border,#2D2A35)] ${compact ? 'p-3.5' : 'p-5'} mb-3 cursor-pointer shadow-sm transition-all duration-[250ms] hover:shadow-md hover:-translate-y-0.5 dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)] dark:hover:border-[var(--color-border-light,#3a3642)] max-[480px]:rounded-xl max-[480px]:mb-2`} onClick={handleReviewClick}>
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2.5 cursor-pointer group" onClick={handleAuthorClick}>
          {review.authorProfilePictureUrl ? (
            <img src={review.authorProfilePictureUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-primary text-white flex items-center justify-center font-bold text-[0.9rem]">
              {(review.authorDisplayName || review.authorUsername || '?')[0].toUpperCase()}
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-bold text-[0.9rem] text-txt-primary dark:text-[var(--color-text-primary,#E2D9F3)] transition-colors duration-150 group-hover:text-primary dark:group-hover:text-[var(--color-primary,#7C4DFF)]">
              {review.authorDisplayName || review.authorUsername}
            </span>
            <span className="text-xs text-txt-light dark:text-[#7a7181]">{formatDate(review.createdAt)}</span>
          </div>
        </div>
        <div className="flex-shrink-0">
          <span className="text-[0.95rem] text-amber-400 tracking-wider">{renderStars(review.rating)}</span>
        </div>
      </div>

      {/* Book Info */}
      {!compact && review.bookTitle && (
        <div className="flex flex-wrap items-baseline gap-1.5 py-2.5 px-3.5 bg-gradient-to-br from-[rgba(109,40,217,0.04)] to-[rgba(37,99,235,0.03)] dark:bg-[rgba(124,77,255,0.06)] border border-border dark:border-[var(--color-border,#2D2A35)] rounded-lg mb-3 text-[0.85rem]">
          <span className="text-txt-light dark:text-[#7a7181]">Review of</span>
          <span className="font-semibold text-txt-primary dark:text-[var(--color-text-primary,#E2D9F3)]">{review.bookTitle}</span>
          {review.bookAuthor && <span className="text-txt-secondary dark:text-[var(--color-text-secondary,#9E95A8)]">by {review.bookAuthor}</span>}
        </div>
      )}

      {/* Content */}
      <div className="mb-3.5">
        {review.containsSpoilers && !showSpoiler ? (
          <div className="text-center p-[18px] bg-amber-50 dark:bg-[rgba(245,158,11,0.1)] rounded-lg">
            <p className="m-0 mb-2.5 text-[0.85rem] text-amber-800 dark:text-amber-400">⚠️ This review contains spoilers</p>
            <button className="bg-none border border-amber-600 text-amber-600 py-1.5 px-3.5 rounded-lg cursor-pointer text-[0.82rem] font-semibold transition-all duration-200 hover:bg-[rgba(217,119,6,0.1)]" onClick={(e) => { e.stopPropagation(); setShowSpoiler(true); }}>Show anyway</button>
          </div>
        ) : (
          <p className="m-0 text-sm text-txt-primary dark:text-[var(--color-text-primary,#E2D9F3)] leading-[1.65] whitespace-pre-wrap">
            {compact && review.content.length > 200 ? review.content.substring(0, 200) + '...' : review.content}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2.5 border-t border-border dark:border-[var(--color-border,#2D2A35)]">
        <button className={`bg-none border-none cursor-pointer text-[0.9rem] py-1.5 px-2.5 rounded-lg flex items-center gap-1.5 transition-all duration-200 active:scale-[0.92] hover:bg-bg-hover dark:hover:bg-[var(--color-bg-tertiary,#2D2A35)] ${liked ? 'text-red-500 animate-[heartPop_0.4s_cubic-bezier(0.16,1,0.3,1)]' : 'text-txt-secondary dark:text-[var(--color-text-secondary,#9E95A8)] hover:text-txt-primary dark:hover:text-[var(--color-text-primary,#E2D9F3)]'}`} onClick={handleLike}>
          {liked ? '❤️' : '🤍'} {likesCount > 0 && <span className="text-[0.8rem] text-txt-light dark:text-[#7a7181]">{likesCount}</span>}
        </button>
        <button className="bg-none border-none cursor-pointer text-[0.9rem] py-1.5 px-2.5 rounded-lg flex items-center gap-1.5 text-txt-secondary dark:text-[var(--color-text-secondary,#9E95A8)] transition-all duration-200 active:scale-[0.92] hover:bg-bg-hover dark:hover:bg-[var(--color-bg-tertiary,#2D2A35)] hover:text-txt-primary dark:hover:text-[var(--color-text-primary,#E2D9F3)]" onClick={(e) => { e.stopPropagation(); setShowComments(!showComments); }}>
          💬 {(review.commentsCount || 0) > 0 && <span className="text-[0.8rem] text-txt-light dark:text-[#7a7181]">{review.commentsCount}</span>}
        </button>
        <button className="bg-none border-none cursor-pointer text-[0.9rem] py-1.5 px-2.5 rounded-lg text-txt-secondary dark:text-[var(--color-text-secondary,#9E95A8)] transition-all duration-200 active:scale-[0.92] hover:bg-bg-hover dark:hover:bg-[var(--color-bg-tertiary,#2D2A35)] hover:text-txt-primary dark:hover:text-[var(--color-text-primary,#E2D9F3)]" onClick={handleShare} title="Share">🔗</button>
        <button className={`bg-none border-none cursor-pointer text-[0.9rem] py-1.5 px-2.5 rounded-lg transition-all duration-200 active:scale-[0.92] hover:bg-bg-hover dark:hover:bg-[var(--color-bg-tertiary,#2D2A35)] ${saved ? 'text-primary dark:text-[var(--color-primary,#7C4DFF)]' : 'text-txt-secondary dark:text-[var(--color-text-secondary,#9E95A8)] hover:text-txt-primary dark:hover:text-[var(--color-text-primary,#E2D9F3)]'}`} onClick={handleSave} title={saved ? 'Unsave' : 'Save'}>
          {saved ? '🔖' : '🏷️'}
        </button>
      </div>

      {/* Comments Preview */}
      {showComments && review.recentComments && review.recentComments.length > 0 && (
        <div className="pt-2.5 mt-1.5">
          {review.recentComments.map((comment) => (
            <div key={comment.id} className="py-1.5 text-[0.85rem]">
              <span className="font-semibold text-txt-primary dark:text-[var(--color-text-primary,#E2D9F3)] cursor-pointer mr-1.5 transition-colors duration-150 hover:text-primary dark:hover:text-[var(--color-primary,#7C4DFF)]" onClick={(e) => { e.stopPropagation(); navigate(`/profile/${comment.authorUsername}`); }}>
                {comment.authorDisplayName || comment.authorUsername}
              </span>
              <span className="text-txt-secondary dark:text-[var(--color-text-secondary,#9E95A8)]">{comment.content}</span>
            </div>
          ))}
          {review.commentsCount > review.recentComments.length && (
            <button className="bg-none border-none text-primary dark:text-[var(--color-primary,#7C4DFF)] cursor-pointer text-[0.82rem] font-semibold py-1 px-0 mt-1 transition-opacity duration-150 hover:opacity-80" onClick={(e) => { e.stopPropagation(); navigate(`/reviews/${review.id}`); }}>
              View all {review.commentsCount} comments
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
