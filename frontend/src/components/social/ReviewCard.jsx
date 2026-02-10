import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import reviewApi from '../../api/reviewApi';
import toast from 'react-hot-toast';
import './ReviewCard.css';

/**
 * ReviewCard - Displays a single book review with like/comment actions
 */
const ReviewCard = ({ review, currentUserId, onUpdate, compact = false }) => {
  const [liked, setLiked] = useState(review.likedByViewer || false);
  const [likesCount, setLikesCount] = useState(review.likesCount || 0);
  const [showSpoiler, setShowSpoiler] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [saved, setSaved] = useState(review.savedByViewer || false);
  const navigate = useNavigate();

  const handleLike = async (e) => {
    e.stopPropagation();
    try {
      const res = await reviewApi.toggleLike(review.id);
      setLiked(res.data.liked);
      setLikesCount(res.data.likesCount);
      if (onUpdate) onUpdate();
    } catch {
      // silently fail
    }
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    const reviewUrl = `${window.location.origin}/reviews/${review.id}`;
    try {
      await navigator.clipboard.writeText(reviewUrl);
      toast.success('Review link copied!');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleSave = async (e) => {
    e.stopPropagation();
    try {
      const res = await reviewApi.toggleSave(review.id);
      setSaved(res.data.saved);
      toast.success(res.data.saved ? 'Review saved!' : 'Review unsaved');
    } catch {
      toast.error('Failed to save review');
    }
  };

  const handleAuthorClick = (e) => {
    e.stopPropagation();
    navigate(`/profile/${review.authorUsername}`);
  };

  const handleReviewClick = () => {
    navigate(`/reviews/${review.id}`);
  };

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className={`review-card ${compact ? 'compact' : ''}`} onClick={handleReviewClick}>
      {/* Header */}
      <div className="review-card__header">
        <div className="review-card__author" onClick={handleAuthorClick}>
          {review.authorProfilePictureUrl ? (
            <img src={review.authorProfilePictureUrl} alt="" className="review-card__avatar" />
          ) : (
            <div className="review-card__avatar-placeholder">
              {(review.authorDisplayName || review.authorUsername || '?')[0].toUpperCase()}
            </div>
          )}
          <div className="review-card__author-info">
            <span className="review-card__author-name">
              {review.authorDisplayName || review.authorUsername}
            </span>
            <span className="review-card__date">{formatDate(review.createdAt)}</span>
          </div>
        </div>
        <div className="review-card__rating">
          <span className="review-card__stars">{renderStars(review.rating)}</span>
        </div>
      </div>

      {/* Book Info */}
      {!compact && review.bookTitle && (
        <div className="review-card__book">
          <span className="review-card__book-label">Review of</span>
          <span className="review-card__book-title">{review.bookTitle}</span>
          {review.bookAuthor && (
            <span className="review-card__book-author">by {review.bookAuthor}</span>
          )}
        </div>
      )}

      {/* Content */}
      <div className="review-card__content">
        {review.containsSpoilers && !showSpoiler ? (
          <div className="review-card__spoiler-guard">
            <p>⚠️ This review contains spoilers</p>
            <button
              className="review-card__spoiler-btn"
              onClick={(e) => { e.stopPropagation(); setShowSpoiler(true); }}
            >
              Show anyway
            </button>
          </div>
        ) : (
          <p className="review-card__text">
            {compact && review.content.length > 200
              ? review.content.substring(0, 200) + '...'
              : review.content}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="review-card__actions">
        <button
          className={`review-card__action-btn ${liked ? 'liked' : ''}`}
          onClick={handleLike}
        >
          {liked ? '❤️' : '🤍'} {likesCount > 0 && <span>{likesCount}</span>}
        </button>
        <button
          className="review-card__action-btn"
          onClick={(e) => { e.stopPropagation(); setShowComments(!showComments); }}
        >
          💬 {(review.commentsCount || 0) > 0 && <span>{review.commentsCount}</span>}
        </button>
        <button
          className="review-card__action-btn"
          onClick={handleShare}
          title="Share"
        >
          🔗
        </button>
        <button
          className={`review-card__action-btn ${saved ? 'saved' : ''}`}
          onClick={handleSave}
          title={saved ? 'Unsave' : 'Save'}
        >
          {saved ? '🔖' : '🏷️'}
        </button>
      </div>

      {/* Inline Comments Preview */}
      {showComments && review.recentComments && review.recentComments.length > 0 && (
        <div className="review-card__comments-preview">
          {review.recentComments.map((comment) => (
            <div key={comment.id} className="review-card__comment">
              <span
                className="review-card__comment-author"
                onClick={(e) => { e.stopPropagation(); navigate(`/profile/${comment.authorUsername}`); }}
              >
                {comment.authorDisplayName || comment.authorUsername}
              </span>
              <span className="review-card__comment-text">{comment.content}</span>
            </div>
          ))}
          {review.commentsCount > review.recentComments.length && (
            <button
              className="review-card__view-all"
              onClick={(e) => { e.stopPropagation(); navigate(`/reviews/${review.id}`); }}
            >
              View all {review.commentsCount} comments
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
