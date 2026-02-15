import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import reviewApi from '../api/reviewApi';
import CommentSection from '../components/social/CommentSection';
import ReviewForm from '../components/social/ReviewForm';
import toast from 'react-hot-toast';

/* ---- Helpers ---- */
const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const fullDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

/* ---- Tailwind class constants ---- */
const actionIconCls = 'w-5 h-5 fill-current transition-transform duration-150';
const actionBtnBase = 'flex-1 flex items-center justify-center gap-2 py-3 px-1 border-none bg-none text-[var(--color-text-secondary)] text-xs font-semibold cursor-pointer rounded-lg transition-all duration-200 hover:bg-[var(--color-bg-hover,#f1f5f9)] hover:text-[var(--color-text-primary)] dark:text-[var(--color-text-secondary)] dark:hover:bg-[var(--color-bg-tertiary,#2D2A35)] dark:hover:text-[var(--color-text-primary)] max-[480px]:[&>span]:hidden active:[&>svg]:animate-[rvd-pulse_0.3s_ease]';
const actionBtnActive = '!text-[var(--color-primary)] dark:!text-[var(--color-primary)]';
const ownerBtnCls = 'inline-flex items-center gap-1.5 bg-none border border-[var(--color-border)] cursor-pointer py-2 px-3.5 rounded-lg text-[0.82rem] font-semibold text-[var(--color-text-secondary)] transition-all duration-200 hover:bg-[var(--color-bg-hover,#f1f5f9)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] dark:border-[var(--color-border)] dark:text-[var(--color-text-secondary)] dark:hover:bg-[var(--color-bg-tertiary,#2D2A35)] dark:hover:border-[var(--color-primary)] dark:hover:text-[var(--color-primary)]';
const dangerBtnCls = ownerBtnCls + ' hover:!bg-[rgba(239,68,68,0.06)] hover:!border-[rgba(239,68,68,0.3)] hover:!text-[var(--color-danger,#ef4444)] dark:hover:!bg-[rgba(239,68,68,0.08)] dark:hover:!text-[#f87171]';
const shimmerCls = 'bg-[length:200%_100%] bg-[linear-gradient(90deg,#e2e8f0_25%,#f1f5f9_50%,#e2e8f0_75%)] animate-[rvd-shimmer_1.5s_ease-in-out_infinite] dark:bg-[linear-gradient(90deg,#2D2A35_25%,#3a3644_50%,#2D2A35_75%)]';

/* ---- SVG Icon Components ---- */
const HeartIcon = ({ filled }) =>
  filled ? (
    <svg className={actionIconCls} viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#ef4444" /></svg>
  ) : (
    <svg className={actionIconCls} viewBox="0 0 24 24"><path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z" /></svg>
  );

const CommentIcon = () => (
  <svg className={actionIconCls} viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>
);

const ShareIcon = () => (
  <svg className={actionIconCls} viewBox="0 0 24 24"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><polyline points="16 6 12 2 8 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><line x1="12" y1="2" x2="12" y2="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
);

const BookmarkIcon = ({ filled }) =>
  filled ? (
    <svg className={actionIconCls} viewBox="0 0 24 24"><path d="M17 3H7a2 2 0 00-2 2v16l7-3 7 3V5a2 2 0 00-2-2z" /></svg>
  ) : (
    <svg className={actionIconCls} viewBox="0 0 24 24"><path d="M17 3H7a2 2 0 00-2 2v16l7-3 7 3V5a2 2 0 00-2-2z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>
  );

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
);

/* ---- Skeleton Loader ---- */
const SkeletonLoader = () => (
  <div className="max-w-[680px] mx-auto animate-[g-fadeInUp_0.5s_cubic-bezier(0.16,1,0.3,1)_both] lg:max-w-[740px]">
    <div className={`w-[72px] h-8 rounded-lg mb-4 ${shimmerCls}`} />
    <div className="bg-[var(--color-bg)] rounded-2xl p-7 border border-[var(--color-border)] shadow-[0_6px_18px_rgba(15,23,42,0.08)] dark:bg-[var(--color-bg-secondary)] dark:border-[var(--color-border)]">
      <div className="flex items-center gap-3 mb-5">
        <div className={`w-13 h-13 rounded-full shrink-0 ${shimmerCls}`} />
        <div className="flex-1 flex flex-col gap-2">
          <div className={`h-3 rounded-md w-[140px] !h-3.5 ${shimmerCls}`} />
          <div className={`h-3 rounded-md w-[90px] !h-2.5 ${shimmerCls}`} />
        </div>
      </div>
      <div className="flex flex-col gap-2 py-3.5 px-4 bg-[rgba(109,40,217,0.03)] rounded-xl mb-5 dark:bg-[rgba(124,77,255,0.04)]">
        <div className={`h-3 rounded-md w-full ${shimmerCls}`} />
        <div className={`h-3 rounded-md w-3/5 ${shimmerCls}`} />
      </div>
      <div className="flex flex-col gap-2.5 mb-6">
        <div className={`h-3 rounded-md w-full ${shimmerCls}`} />
        <div className={`h-3 rounded-md w-full ${shimmerCls}`} />
        <div className={`h-3 rounded-md w-3/5 ${shimmerCls}`} />
      </div>
      <div className="flex gap-3 pt-4 border-t border-[var(--color-border)] dark:border-[var(--color-border)]">
        {[1, 2, 3, 4].map((i) => <div key={i} className={`flex-1 h-9 rounded-lg ${shimmerCls}`} />)}
      </div>
    </div>
  </div>
);

/* ---- Star Rating ---- */
const StarRating = ({ rating }) => (
  <div className="flex items-center gap-0.5 mt-1">
    {[1, 2, 3, 4, 5].map((i) => (
      <svg key={i} className={`w-4 h-4 fill-[var(--color-border,#cbd5e1)] transition-[fill,transform] duration-150 dark:fill-[#3a3644] ${i <= rating ? '!fill-[#fbbf24] dark:!fill-[#fbbf24]' : ''}`} viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ))}
    <span className="text-xs text-[var(--color-text-light,#94a3b8)] ml-1.5 font-semibold dark:text-[#7a7181]">{rating}/5</span>
  </div>
);

/**
 * ReviewDetailPage — Full view of a single review with all comments
 */
const ReviewDetailPage = () => {
  const { reviewId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [showEditForm, setShowEditForm] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showComments, setShowComments] = useState(true);

  useEffect(() => {
    fetchReview();
  }, [reviewId]);

  const fetchReview = async () => {
    setLoading(true);
    try {
      const res = await reviewApi.getReview(reviewId);
      setReview(res.data);
      setLiked(res.data.likedByViewer || false);
      setLikesCount(res.data.likesCount || 0);
      setSaved(res.data.savedByViewer || false);
    } catch {
      toast.error('Review not found');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      const res = await reviewApi.toggleLike(reviewId);
      setLiked(res.data.liked);
      setLikesCount(res.data.likesCount);
    } catch {
      toast.error('Failed to like');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this review? This cannot be undone.')) return;
    try {
      await reviewApi.deleteReview(reviewId);
      toast.success('Review deleted');
      navigate(-1);
    } catch {
      toast.error('Failed to delete review');
    }
  };

  const handleShare = async () => {
    const reviewUrl = `${window.location.origin}/reviews/${review.id}`;
    try {
      await navigator.clipboard.writeText(reviewUrl);
      toast.success('Review link copied!');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleSave = async () => {
    try {
      const res = await reviewApi.toggleSave(reviewId);
      setSaved(res.data.saved);
      toast.success(res.data.saved ? 'Review saved!' : 'Review unsaved');
    } catch {
      toast.error('Failed to save review');
    }
  };

  if (!loading && !review) return null;

  const isOwnReview = user && review?.authorId === user.id;
  const commentsCount = review?.commentsCount || 0;

  return (
    <div className="review-detail-page min-h-screen bg-gradient-to-br from-[var(--color-bg-secondary)] to-[var(--color-bg-tertiary,#f1f5f9)] p-6 px-4 pb-20 transition-[background] duration-300 md:pt-20 dark:from-[var(--color-bg-secondary)] dark:to-[var(--color-bg)] max-[480px]:p-3 max-[480px]:px-2 max-[480px]:pb-20">
      {loading ? (
        <SkeletonLoader />
      ) : (
      <>
      <div className="max-w-[680px] mx-auto animate-[g-fadeInUp_0.5s_cubic-bezier(0.16,1,0.3,1)_both] lg:max-w-[740px]">
        {/* Back Button */}
        <button className="page-back-btn" onClick={() => navigate(-1)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          Back
        </button>

        {/* Review Card */}
        <div className="bg-[var(--color-bg)] rounded-2xl overflow-hidden border border-[var(--color-border)] shadow-[0_6px_18px_rgba(15,23,42,0.08)] animate-[rvd-fadeIn_0.35s_ease] dark:bg-[var(--color-bg-secondary)] dark:border-[var(--color-border)] dark:shadow-[0_6px_24px_rgba(0,0,0,0.3)] max-[480px]:rounded-xl">
          {/* Author Header */}
          <div className="flex justify-between items-start px-6 pt-5 max-[480px]:px-4 max-[480px]:pt-4 max-[480px]:flex-col max-[480px]:gap-3">
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => navigate(`/profile/${review.authorUsername}`)}
            >
              <div className="w-13 h-13 rounded-full overflow-hidden shrink-0 transition-transform duration-200 group-hover:scale-105">
                {review.authorProfilePictureUrl ? (
                  <img src={review.authorProfilePictureUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-violet-700 to-violet-600 text-white flex items-center justify-center font-bold text-[1.2rem]">
                    {(review.authorDisplayName || review.authorUsername || '?')[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[0.95rem] text-[var(--color-text-primary)] transition-colors duration-150 leading-[1.4] group-hover:text-[var(--color-primary)] dark:text-[var(--color-text-primary)] dark:group-hover:text-[var(--color-primary)]">
                  {review.authorDisplayName || review.authorUsername}
                </span>
                <span className="text-xs text-[var(--color-text-secondary)] leading-[1.4] dark:text-[var(--color-text-secondary)]">@{review.authorUsername}</span>
                <span className="text-xs text-[var(--color-text-light,#94a3b8)] leading-[1.4] dark:text-[#7a7181]" title={fullDate(review.createdAt)}>
                  {timeAgo(review.createdAt)}
                </span>
              </div>
            </div>

            {isOwnReview && (
              <div className="flex gap-2 shrink-0">
                <button className={ownerBtnCls} onClick={() => setShowEditForm(true)}>
                  <EditIcon /> Edit
                </button>
                <button className={dangerBtnCls} onClick={handleDelete}>
                  <TrashIcon /> Delete
                </button>
              </div>
            )}
          </div>

          {/* Book Info with SVG icon + Star Rating */}
          <div className="flex items-start gap-3.5 mx-6 my-4 p-4 px-[18px] bg-[linear-gradient(135deg,rgba(109,40,217,0.04),rgba(37,99,235,0.03))] border border-[var(--color-border)] rounded-xl transition-all duration-200 hover:bg-[linear-gradient(135deg,rgba(109,40,217,0.08),rgba(37,99,235,0.05))] hover:border-[rgba(109,40,217,0.2)] hover:-translate-y-px dark:bg-[rgba(124,77,255,0.06)] dark:border-[var(--color-border)] dark:hover:bg-[rgba(124,77,255,0.1)] dark:hover:border-[rgba(124,77,255,0.2)] max-[480px]:mx-4 max-[480px]:my-3">
            <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-violet-700 to-violet-600 flex items-center justify-center shrink-0">
              <svg className="fill-white/90" width="22" height="22" viewBox="0 0 24 24"><path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H6zm1 2h4v8l-2-2-2 2V4z" /></svg>
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="font-bold text-[0.95rem] text-[var(--color-text-primary)] overflow-hidden text-ellipsis whitespace-nowrap dark:text-[var(--color-text-primary)]">{review.bookTitle}</span>
              {review.bookAuthor && (
                <span className="text-[0.82rem] text-[var(--color-text-secondary)] dark:text-[var(--color-text-secondary)]">by {review.bookAuthor}</span>
              )}
              <StarRating rating={review.rating} />
            </div>
          </div>

          {/* Content */}
          <div className="py-2 px-6 pb-5 max-[480px]:px-4 max-[480px]:pb-4">
            {review.containsSpoilers && (
              <div className="inline-flex items-center gap-1.5 py-[5px] px-3.5 bg-[var(--color-warning-soft,#fef3c7)] text-[#92400e] rounded-lg text-xs font-semibold mb-3.5 [&>svg]:stroke-[#92400e] [&>svg]:shrink-0 dark:bg-[rgba(245,158,11,0.12)] dark:text-[#fbbf24] dark:[&>svg]:stroke-[#fbbf24]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                Contains Spoilers
              </div>
            )}
            <p className="m-0 text-[0.95rem] text-[var(--color-text-primary)] leading-[1.75] whitespace-pre-wrap break-words dark:text-[var(--color-text-primary)]">{review.content}</p>
          </div>

          {/* Engagement Stats Row */}
          <div className="flex items-center justify-between px-6 py-2.5 border-t border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] dark:border-[var(--color-border)] dark:text-[var(--color-text-secondary)] max-[480px]:px-4">
            <div className="inline-flex items-center gap-1">
              {likesCount > 0 && (
                <>
                  <span className="inline-flex items-center justify-center w-[18px] h-[18px] bg-gradient-to-br from-violet-700 to-violet-600 rounded-full leading-none">
                    <svg width="10" height="10" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#fff" /></svg>
                  </span>
                  {likesCount}
                </>
              )}
            </div>
            <div className="flex gap-3.5">
              {commentsCount > 0 && (
                <span
                  className="inline-flex items-center gap-1 cursor-pointer transition-colors duration-150 hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)]"
                  onClick={() => setShowComments((p) => !p)}
                >
                  {commentsCount} comment{commentsCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex border-t border-[var(--color-border)] px-3 py-1 dark:border-[var(--color-border)] max-[480px]:px-2">
            <button
              className={`${actionBtnBase} ${liked ? actionBtnActive : ''}`}
              onClick={handleLike}
            >
              <HeartIcon filled={liked} />
              <span>Like</span>
            </button>
            <button
              className={actionBtnBase}
              onClick={() => setShowComments((p) => !p)}
            >
              <CommentIcon />
              <span>Comment</span>
            </button>
            <button
              className={actionBtnBase}
              onClick={handleShare}
            >
              <ShareIcon />
              <span>Share</span>
            </button>
            <button
              className={`${actionBtnBase} ${saved ? actionBtnActive : ''}`}
              onClick={handleSave}
            >
              <BookmarkIcon filled={saved} />
              <span>Save</span>
            </button>
          </div>

          {/* Comments */}
          {showComments && (
            <CommentSection reviewId={review.id} currentUserId={user?.id} />
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditForm && (
        <ReviewForm
          bookId={review.bookId}
          bookTitle={review.bookTitle}
          existingReview={review}
          onClose={() => setShowEditForm(false)}
          onSaved={fetchReview}
        />
      )}
      </>
      )}
    </div>
  );
};

export default ReviewDetailPage;
