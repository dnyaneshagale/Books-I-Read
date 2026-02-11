import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import reviewApi from '../api/reviewApi';
import CommentSection from '../components/social/CommentSection';
import ReviewForm from '../components/social/ReviewForm';
import toast from 'react-hot-toast';
import './ReviewDetailPage.css';

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

/* ---- SVG Icon Components ---- */
const HeartIcon = ({ filled }) =>
  filled ? (
    <svg className="rvd-action__icon" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#ef4444" /></svg>
  ) : (
    <svg className="rvd-action__icon" viewBox="0 0 24 24"><path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z" /></svg>
  );

const CommentIcon = () => (
  <svg className="rvd-action__icon" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>
);

const ShareIcon = () => (
  <svg className="rvd-action__icon" viewBox="0 0 24 24"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><polyline points="16 6 12 2 8 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><line x1="12" y1="2" x2="12" y2="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
);

const BookmarkIcon = ({ filled }) =>
  filled ? (
    <svg className="rvd-action__icon" viewBox="0 0 24 24"><path d="M17 3H7a2 2 0 00-2 2v16l7-3 7 3V5a2 2 0 00-2-2z" /></svg>
  ) : (
    <svg className="rvd-action__icon" viewBox="0 0 24 24"><path d="M17 3H7a2 2 0 00-2 2v16l7-3 7 3V5a2 2 0 00-2-2z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>
  );

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
);

/* ---- Skeleton Loader ---- */
const SkeletonLoader = () => (
  <div className="review-detail__container">
    <div className="rvd-skeleton__back" />
    <div className="rvd-skeleton__card">
      <div className="rvd-skeleton__header">
        <div className="rvd-skeleton__avatar" />
        <div className="rvd-skeleton__meta">
          <div className="rvd-skeleton__line rvd-skeleton__line--name" />
          <div className="rvd-skeleton__line rvd-skeleton__line--date" />
        </div>
      </div>
      <div className="rvd-skeleton__book-row">
        <div className="rvd-skeleton__line rvd-skeleton__line--full" />
        <div className="rvd-skeleton__line rvd-skeleton__line--half" />
      </div>
      <div className="rvd-skeleton__body">
        <div className="rvd-skeleton__line rvd-skeleton__line--full" />
        <div className="rvd-skeleton__line rvd-skeleton__line--full" />
        <div className="rvd-skeleton__line rvd-skeleton__line--half" />
      </div>
      <div className="rvd-skeleton__actions">
        {[1, 2, 3, 4].map((i) => <div key={i} className="rvd-skeleton__btn" />)}
      </div>
    </div>
  </div>
);

/* ---- Star Rating ---- */
const StarRating = ({ rating }) => (
  <div className="review-detail__stars-row">
    {[1, 2, 3, 4, 5].map((i) => (
      <svg key={i} className={`review-detail__star ${i <= rating ? 'review-detail__star--filled' : ''}`} viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ))}
    <span className="review-detail__rating-num">{rating}/5</span>
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
    <div className="review-detail-page">
      {loading ? (
        <SkeletonLoader />
      ) : (
      <>
      <div className="review-detail__container">
        {/* Back Button */}
        <button className="page-back-btn" onClick={() => navigate(-1)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          Back
        </button>

        {/* Review Card */}
        <div className="review-detail__card">
          {/* Author Header */}
          <div className="review-detail__header">
            <div
              className="review-detail__author"
              onClick={() => navigate(`/profile/${review.authorUsername}`)}
            >
              <div className="review-detail__avatar-wrap">
                {review.authorProfilePictureUrl ? (
                  <img src={review.authorProfilePictureUrl} alt="" className="review-detail__avatar" />
                ) : (
                  <div className="review-detail__avatar-placeholder">
                    {(review.authorDisplayName || review.authorUsername || '?')[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div className="review-detail__author-info">
                <span className="review-detail__author-name">
                  {review.authorDisplayName || review.authorUsername}
                </span>
                <span className="review-detail__handle">@{review.authorUsername}</span>
                <span className="review-detail__date" title={fullDate(review.createdAt)}>
                  {timeAgo(review.createdAt)}
                </span>
              </div>
            </div>

            {isOwnReview && (
              <div className="review-detail__owner-actions">
                <button onClick={() => setShowEditForm(true)}>
                  <EditIcon /> Edit
                </button>
                <button onClick={handleDelete} className="danger">
                  <TrashIcon /> Delete
                </button>
              </div>
            )}
          </div>

          {/* Book Info with SVG icon + Star Rating */}
          <div className="review-detail__book-card">
            <div className="review-detail__book-cover">
              <svg className="review-detail__book-svg" width="22" height="22" viewBox="0 0 24 24"><path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H6zm1 2h4v8l-2-2-2 2V4z" /></svg>
            </div>
            <div className="review-detail__book-info">
              <span className="review-detail__book-title">{review.bookTitle}</span>
              {review.bookAuthor && (
                <span className="review-detail__book-author">by {review.bookAuthor}</span>
              )}
              <StarRating rating={review.rating} />
            </div>
          </div>

          {/* Content */}
          <div className="review-detail__content">
            {review.containsSpoilers && (
              <div className="review-detail__spoiler-tag">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                Contains Spoilers
              </div>
            )}
            <p>{review.content}</p>
          </div>

          {/* Engagement Stats Row */}
          <div className="review-detail__stats">
            <div className="review-detail__stat">
              {likesCount > 0 && (
                <>
                  <span className="review-detail__stat-icon">
                    <svg width="10" height="10" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#fff" /></svg>
                  </span>
                  {likesCount}
                </>
              )}
            </div>
            <div className="review-detail__stat-right">
              {commentsCount > 0 && (
                <span
                  className="review-detail__stat review-detail__stat--clickable"
                  onClick={() => setShowComments((p) => !p)}
                >
                  {commentsCount} comment{commentsCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* Action Bar — LinkedIn-style */}
          <div className="review-detail__actions">
            <button
              className={`review-detail__action-btn ${liked ? 'active' : ''}`}
              onClick={handleLike}
            >
              <HeartIcon filled={liked} />
              <span>Like</span>
            </button>
            <button
              className="review-detail__action-btn"
              onClick={() => setShowComments((p) => !p)}
            >
              <CommentIcon />
              <span>Comment</span>
            </button>
            <button
              className="review-detail__action-btn"
              onClick={handleShare}
            >
              <ShareIcon />
              <span>Share</span>
            </button>
            <button
              className={`review-detail__action-btn ${saved ? 'active' : ''}`}
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
