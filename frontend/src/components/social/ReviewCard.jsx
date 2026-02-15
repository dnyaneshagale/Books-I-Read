import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import reviewApi from '../../api/reviewApi';
import toast from 'react-hot-toast';

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
    const wasLiked = liked;
    const prevCount = likesCount;
    
    // Optimistic update
    setLiked(!wasLiked);
    setLikesCount(wasLiked ? likesCount - 1 : likesCount + 1);
    
    try {
      const res = await reviewApi.toggleLike(review.id);
      setLiked(res.data.liked);
      setLikesCount(res.data.likesCount);
      
      // Update parent state if provided
      if (onUpdate) {
        onUpdate({
          likedByViewer: res.data.liked,
          likesCount: res.data.likesCount
        });
      }
    } catch {
      // Rollback on error
      setLiked(wasLiked);
      setLikesCount(prevCount);
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
    const wasSaved = saved;
    
    // Optimistic update
    setSaved(!wasSaved);
    
    try {
      const res = await reviewApi.toggleSave(review.id);
      setSaved(res.data.saved);
      toast.success(res.data.saved ? 'Review saved!' : 'Review unsaved');
      
      // Update parent state if provided
      if (onUpdate) {
        onUpdate({
          savedByViewer: res.data.saved
        });
      }
    } catch {
      // Rollback on error
      setSaved(wasSaved);
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

  const formatLikesCount = (count) => {
    if (count === 0) return null;
    if (count === 1) return '1 like';
    return `${count.toLocaleString()} likes`;
  };

  const actionBtnBase = 'bg-transparent border-none cursor-pointer p-0 transition-all duration-200 active:scale-90';

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 cursor-pointer shadow-sm transition-all duration-[250ms] hover:shadow-md hover:-translate-y-0.5 dark:bg-[#1E1B24] dark:border-[#2D2A35] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)] dark:hover:border-[#3a3642] max-[480px]:rounded-xl max-[480px]:mb-2 ${compact ? 'p-3.5 mb-3' : 'p-5 mb-3'}`}
      onClick={handleReviewClick}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2.5 cursor-pointer group" onClick={handleAuthorClick}>
          {review.authorProfilePictureUrl ? (
            <img src={review.authorProfilePictureUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-700 to-violet-500 text-white flex items-center justify-center font-bold text-[0.9rem]">
              {(review.authorDisplayName || review.authorUsername || '?')[0].toUpperCase()}
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-bold text-[0.9rem] text-slate-900 transition-colors duration-150 group-hover:text-violet-700 dark:text-[#E2D9F3] dark:group-hover:text-[#7C4DFF]">
              {review.authorDisplayName || review.authorUsername}
            </span>
            <span className="text-xs text-slate-500 dark:text-[#7a7181]">{formatDate(review.createdAt)}</span>
          </div>
        </div>
        <div className="shrink-0">
          <span className="text-[0.95rem] text-amber-400 tracking-wider">{renderStars(review.rating)}</span>
        </div>
      </div>

      {/* Book Info */}
      {!compact && review.bookTitle && (
        <div className="flex flex-wrap items-baseline gap-1.5 py-2.5 px-3.5 bg-gradient-to-br from-violet-700/[0.04] to-blue-600/[0.03] border border-slate-200 rounded-lg mb-3 text-[0.85rem] dark:bg-[rgba(124,77,255,0.06)] dark:border-[#2D2A35]">
          <span className="text-slate-500 dark:text-[#7a7181]">Review of</span>
          <span className="font-semibold text-slate-900 dark:text-[#E2D9F3]">{review.bookTitle}</span>
          {review.bookAuthor && (
            <span className="text-slate-600 dark:text-[#9E95A8]">by {review.bookAuthor}</span>
          )}
        </div>
      )}

      {/* Content */}
      <div className="mb-3.5">
        {review.containsSpoilers && !showSpoiler ? (
          <div className="text-center py-[18px] px-4 bg-amber-50 rounded-lg dark:bg-amber-500/10">
            <p className="m-0 mb-2.5 text-[0.85rem] text-amber-800 dark:text-amber-400">⚠️ This review contains spoilers</p>
            <button
              className="bg-transparent border border-amber-600 text-amber-600 py-1.5 px-3.5 rounded-lg cursor-pointer text-[0.82rem] font-semibold transition-all duration-200 hover:bg-amber-600/10"
              onClick={(e) => { e.stopPropagation(); setShowSpoiler(true); }}
            >
              Show anyway
            </button>
          </div>
        ) : (
          <p className="m-0 text-sm text-slate-900 leading-[1.65] whitespace-pre-wrap dark:text-[#E2D9F3]">
            {compact && review.content.length > 200
              ? review.content.substring(0, 200) + '...'
              : review.content}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-1 mb-2">
        <button
          className={`${actionBtnBase} ${liked ? 'text-red-500 animate-[g-heartPop_0.4s_cubic-bezier(0.16,1,0.3,1)]' : 'text-gray-700 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-400'}`}
          onClick={handleLike}
          title={liked ? 'Unlike' : 'Like'}
        >
          <Heart className="w-6 h-6" fill={liked ? 'currentColor' : 'none'} />
        </button>
        <button
          className={`${actionBtnBase} text-gray-700 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-400`}
          onClick={(e) => { e.stopPropagation(); navigate(`/reviews/${review.id}`); }}
          title="View comments"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
        <button 
          className={`${actionBtnBase} text-gray-700 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-400`}
          onClick={handleShare} 
          title="Share"
        >
          <Share2 className="w-6 h-6" />
        </button>
        <button
          className={`${actionBtnBase} ml-auto ${saved ? 'text-violet-600 dark:text-violet-400' : 'text-gray-700 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-400'}`}
          onClick={handleSave}
          title={saved ? 'Unsave' : 'Save'}
        >
          <Bookmark className="w-6 h-6" fill={saved ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Likes Count */}
      {likesCount > 0 && (
        <div className="mb-2">
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {formatLikesCount(likesCount)}
          </span>
        </div>
      )}

      {/* Comments Preview */}
      {review.recentComments && review.recentComments.length > 0 && (
        <div className="space-y-1 mb-1">
          {review.recentComments.slice(0, 2).map((comment) => (
            <div key={comment.id} className="text-sm leading-relaxed">
              <span
                className="font-semibold text-gray-900 dark:text-gray-100 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                onClick={(e) => { e.stopPropagation(); navigate(`/profile/${comment.authorUsername}`); }}
              >
                {comment.authorDisplayName || comment.authorUsername}
              </span>
              {' '}
              <span className="text-gray-900 dark:text-gray-100">{comment.content}</span>
            </div>
          ))}
        </div>
      )}

      {/* View all comments link */}
      {review.commentsCount > 0 && (
        <button
          className="bg-transparent border-none text-sm text-gray-500 dark:text-gray-400 cursor-pointer p-0 mb-1 transition-opacity hover:opacity-70"
          onClick={(e) => { e.stopPropagation(); navigate(`/reviews/${review.id}`); }}
        >
          {review.commentsCount === 1 
            ? 'View 1 comment'
            : review.recentComments?.length > 0 
              ? `View all ${review.commentsCount} comments`
              : `View ${review.commentsCount} comments`
          }
        </button>
      )}
    </div>
  );
};

export default ReviewCard;
