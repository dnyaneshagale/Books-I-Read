import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import socialApi from '../api/socialApi';
import toast from 'react-hot-toast';
import './ReflectionDetailPage.css';

// ============================================
// Helpers
// ============================================

/** Relative time — "just now", "2h", "3d", "Jan 4" */
const timeAgo = (dateStr) => {
  const now = new Date();
  const d = new Date(dateStr);
  const secs = Math.floor((now - d) / 1000);
  if (secs < 60) return 'just now';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  if (days < 365) return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const fullDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

// ============================================
// SVG Icon Components
// ============================================

const HeartIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" className="rd-action__icon">
    <path d={filled
      ? "M7.24 2C4.37 2 2 4.43 2 7.35c0 5.6 6.25 10.27 10 12.65 3.75-2.38 10-7.05 10-12.65C22 4.43 19.63 2 16.76 2c-1.63 0-3.19.79-4.22 2.07L12 4.74l-.54-.67C10.43 2.79 8.87 2 7.24 2z"
      : "M7.24 2C4.37 2 2 4.43 2 7.35c0 5.6 6.25 10.27 10 12.65 3.75-2.38 10-7.05 10-12.65C22 4.43 19.63 2 16.76 2c-1.63 0-3.19.79-4.22 2.07L12 4.74l-.54-.67C10.43 2.79 8.87 2 7.24 2zM12 18.55l-.36-.24C7.39 15.42 4 11.85 4 7.35 4 5.56 5.45 4 7.24 4c1.18 0 2.31.65 2.98 1.69L12 7.99l1.78-2.3A3.505 3.505 0 0116.76 4C18.55 4 20 5.56 20 7.35c0 4.5-3.39 8.07-7.64 10.96L12 18.55z"
    } />
  </svg>
);

const CommentIcon = () => (
  <svg viewBox="0 0 24 24" className="rd-action__icon">
    <path d="M7 9h10v1.5H7V9zm0 4h7v1.5H7V13z" />
    <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14h-4.83L12 19.17 8.83 16H4V4h16v12z" />
  </svg>
);

const ShareIcon = () => (
  <svg viewBox="0 0 24 24" className="rd-action__icon">
    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
  </svg>
);

const BookmarkIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" className="rd-action__icon">
    <path d={filled
      ? "M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"
      : "M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z"
    } />
  </svg>
);

// ============================================
// Skeleton Loader
// ============================================

const SkeletonLoader = () => (
  <div className="reflection-detail-page">
    <div className="reflection-detail__container">
      <div className="rd-skeleton__back" />
      <div className="rd-skeleton__card">
        <div className="rd-skeleton__header">
          <div className="rd-skeleton__avatar" />
          <div className="rd-skeleton__meta">
            <div className="rd-skeleton__line rd-skeleton__line--name" />
            <div className="rd-skeleton__line rd-skeleton__line--date" />
          </div>
        </div>
        <div className="rd-skeleton__body">
          <div className="rd-skeleton__line rd-skeleton__line--full" />
          <div className="rd-skeleton__line rd-skeleton__line--full" />
          <div className="rd-skeleton__line rd-skeleton__line--half" />
        </div>
        <div className="rd-skeleton__actions">
          <div className="rd-skeleton__btn" />
          <div className="rd-skeleton__btn" />
          <div className="rd-skeleton__btn" />
          <div className="rd-skeleton__btn" />
        </div>
      </div>
    </div>
  </div>
);

// ============================================
// Sub-components (shared comment logic)
// ============================================

/**
 * CommentMentionText — Renders @mentions as clickable purple links
 */
const CommentMentionText = ({ content, navigate }) => {
  const parts = content.split(/(@\w+)/g);
  return (
    <>
      {parts.map((part, i) =>
        /^@\w+$/.test(part) ? (
          <span
            key={i}
            className="rd-comments__mention"
            onClick={(e) => { e.stopPropagation(); navigate(`/profile/${part.slice(1)}`); }}
          >
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
};

/**
 * ReflectionCommentInput — Input with @mention autocomplete dropdown
 */
const ReflectionCommentInput = ({ reflectionId, onSubmit, placeholder, initialValue = '', isReply = false, onCancel }) => {
  const [text, setText] = useState(initialValue);
  const [mentionResults, setMentionResults] = useState([]);
  const [showMentions, setShowMentions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  const handleChange = (e) => {
    const val = e.target.value;
    setText(val);
    const cursorPos = e.target.selectionStart;
    const textBefore = val.slice(0, cursorPos);
    const mentionMatch = textBefore.match(/@(\w*)$/);

    if (mentionMatch) {
      const query = mentionMatch[1];
      if (query.length >= 1) {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
          try {
            const res = await socialApi.searchUsers(query, 0, 6);
            const users = res.data?.content || res.data || [];
            setMentionResults(users);
            setShowMentions(users.length > 0);
            setActiveIndex(0);
          } catch {
            setShowMentions(false);
          }
        }, 200);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (username) => {
    const cursorPos = inputRef.current.selectionStart;
    const textBefore = text.slice(0, cursorPos);
    const textAfter = text.slice(cursorPos);
    const newBefore = textBefore.replace(/@\w*$/, `@${username} `);
    setText(newBefore + textAfter);
    setShowMentions(false);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        const pos = newBefore.length;
        inputRef.current.setSelectionRange(pos, pos);
      }
    }, 0);
  };

  const handleKeyDown = (e) => {
    if (showMentions && mentionResults.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(prev => (prev + 1) % mentionResults.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(prev => (prev - 1 + mentionResults.length) % mentionResults.length);
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        insertMention(mentionResults[activeIndex].username);
        return;
      }
      if (e.key === 'Escape') {
        setShowMentions(false);
        return;
      }
    }
    if (e.key === 'Enter' && !e.shiftKey && text.trim()) {
      e.preventDefault();
      onSubmit(text.trim());
      setText('');
    }
  };

  return (
    <div className="rd-comments__input-wrap">
      <input
        ref={inputRef}
        type="text"
        className={`rd-comments__input ${isReply ? 'rd-comments__input--reply' : ''}`}
        placeholder={placeholder || 'Add a comment...'}
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      {isReply && onCancel && (
        <button className="rd-comments__cancel-reply" onClick={onCancel}>✕</button>
      )}
      {showMentions && mentionResults.length > 0 && (
        <div className="rd-comments__mention-dropdown">
          {mentionResults.map((u, idx) => (
            <div
              key={u.id || u.username}
              className={`rd-comments__mention-item ${idx === activeIndex ? 'active' : ''}`}
              onClick={() => insertMention(u.username)}
            >
              <span className="rd-comments__mention-avatar">
                {u.profilePictureUrl
                  ? <img src={u.profilePictureUrl} alt="" />
                  : (u.displayName || u.username || '?').charAt(0).toUpperCase()
                }
              </span>
              <span className="rd-comments__mention-info">
                <span className="rd-comments__mention-name">{u.displayName || u.username}</span>
                <span className="rd-comments__mention-handle">@{u.username}</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * ReflectionCommentItem — Single comment with threaded replies (recursive)
 */
const ReflectionCommentItem = ({ comment, reflectionId, depth, onReply, onDelete, navigate }) => {
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState(comment.replies || []);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [replyingTo, setReplyingTo] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const loadReplies = async () => {
    setLoadingReplies(true);
    try {
      const res = await socialApi.getReflectionCommentReplies(comment.id);
      setReplies(res.data || []);
    } catch {
      toast.error('Failed to load replies');
    } finally {
      setLoadingReplies(false);
    }
  };

  const handleToggleReplies = () => {
    if (!showReplies && replies.length === 0 && comment.replyCount > 0) {
      loadReplies();
    }
    setShowReplies(!showReplies);
  };

  const handleReplySubmit = async (text) => {
    try {
      const res = await socialApi.addReflectionComment(reflectionId, text, comment.id);
      setReplies(prev => [...prev, res.data]);
      setShowReplies(true);
      setReplyingTo(false);
      comment.replyCount = (comment.replyCount || 0) + 1;
    } catch {
      toast.error('Failed to post reply');
    }
  };

  const handleDeleteComment = async () => {
    try {
      await socialApi.deleteReflectionComment(comment.id);
      onDelete(comment.id);
    } catch {
      toast.error('Failed to delete comment');
    }
    setConfirmingDelete(false);
  };

  return (
    <div className={`rd-comments__item ${depth > 0 ? 'rd-comments__item--reply' : ''}`}>
      <div className="rd-comments__item-body">
        <span
          className="rd-comments__avatar"
          onClick={() => navigate(`/profile/${comment.user?.username}`)}
        >
          {comment.user?.profilePictureUrl
            ? <img src={comment.user.profilePictureUrl} alt="" />
            : (comment.user?.displayName || comment.user?.username || '?').charAt(0).toUpperCase()
          }
        </span>
        <div className="rd-comments__bubble">
          <div className="rd-comments__bubble-header">
            <span
              className="rd-comments__author"
              onClick={() => navigate(`/profile/${comment.user?.username}`)}
            >
              {comment.user?.displayName || comment.user?.username}
            </span>
            <span className="rd-comments__time" title={fullDate(comment.createdAt)}>
              {timeAgo(comment.createdAt)}
            </span>
          </div>
          <span className="rd-comments__text">
            <CommentMentionText content={comment.content} navigate={navigate} />
          </span>
        </div>
        {!confirmingDelete ? (
          <button
            className="rd-comments__delete-btn"
            title="Delete"
            onClick={() => setConfirmingDelete(true)}
          >
            <svg viewBox="0 0 24 24" className="rd-comments__delete-icon">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
            </svg>
          </button>
        ) : (
          <span className="rd-comments__delete-confirm">
            <button className="rd-comments__delete-yes" onClick={handleDeleteComment}>Delete</button>
            <button className="rd-comments__delete-no" onClick={() => setConfirmingDelete(false)}>Cancel</button>
          </span>
        )}
      </div>

      <div className="rd-comments__meta">
        <button className="rd-comments__reply-btn" onClick={() => setReplyingTo(!replyingTo)}>Reply</button>
        {comment.replyCount > 0 && (
          <button className="rd-comments__toggle-replies" onClick={handleToggleReplies}>
            ── {showReplies ? 'Hide replies' : `View ${comment.replyCount} ${comment.replyCount === 1 ? 'reply' : 'replies'}`}
          </button>
        )}
      </div>

      {replyingTo && (
        <div className="rd-comments__reply-input-wrap">
          <ReflectionCommentInput
            reflectionId={reflectionId}
            onSubmit={handleReplySubmit}
            placeholder={`Reply to @${comment.user?.username}...`}
            isReply
            onCancel={() => setReplyingTo(false)}
          />
        </div>
      )}

      {showReplies && (
        <div className="rd-comments__replies">
          {loadingReplies ? (
            <span className="rd-comments__loading">Loading replies...</span>
          ) : (
            replies.map(reply => (
              <ReflectionCommentItem
                key={reply.id}
                comment={reply}
                reflectionId={reflectionId}
                depth={depth + 1}
                onReply={onReply}
                onDelete={(id) => {
                  setReplies(prev => prev.filter(r => r.id !== id));
                  comment.replyCount = Math.max(0, (comment.replyCount || 1) - 1);
                }}
                navigate={navigate}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

// ============================================
// Main ReflectionDetailPage Component
// ============================================

const ReflectionDetailPage = () => {
  const { reflectionId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reflection, setReflection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const [savesCount, setSavesCount] = useState(0);
  const [showComments, setShowComments] = useState(true);

  // Comments state
  const [comments, setComments] = useState([]);
  const [commentsPage, setCommentsPage] = useState(0);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);

  useEffect(() => {
    fetchReflection();
  }, [reflectionId]);

  const fetchReflection = async () => {
    setLoading(true);
    try {
      const res = await socialApi.getReflection(reflectionId);
      setReflection(res.data);
      setLiked(res.data.hasLiked || false);
      setLikesCount(res.data.likesCount || 0);
      setSaved(res.data.hasSaved || false);
      setSavesCount(res.data.savesCount || 0);
      if (res.data.recentComments) {
        setComments(res.data.recentComments);
      }
    } catch {
      toast.error('Reflection not found');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async (pg = 0, reset = false) => {
    setLoadingComments(true);
    try {
      const res = await socialApi.getReflectionComments(reflectionId, pg, 20);
      const content = res.data?.content || [];
      const pageInfo = res.data?.page || {};
      if (reset) {
        setComments(content);
      } else {
        setComments(prev => [...prev, ...content]);
      }
      setCommentsPage(pg);
      setHasMoreComments(pageInfo.number != null && pageInfo.totalPages != null
        ? pageInfo.number < pageInfo.totalPages - 1
        : false);
    } catch {
      toast.error('Failed to load comments');
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    if (reflection) {
      loadComments(0, true);
    }
  }, [reflection?.id]);

  const handleLike = async () => {
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikesCount(prev => wasLiked ? prev - 1 : prev + 1);
    try {
      const res = await socialApi.toggleLikeReflection(reflectionId);
      setLiked(res.data.hasLiked);
      setLikesCount(res.data.likesCount);
    } catch {
      setLiked(wasLiked);
      setLikesCount(prev => wasLiked ? prev + 1 : prev - 1);
      toast.error('Failed to like');
    }
  };

  const handleSave = async () => {
    const wasSaved = saved;
    setSaved(!wasSaved);
    setSavesCount(prev => wasSaved ? prev - 1 : prev + 1);
    try {
      const res = await socialApi.toggleSaveReflection(reflectionId);
      setSaved(res.data.hasSaved);
      setSavesCount(res.data.savesCount);
    } catch {
      setSaved(wasSaved);
      setSavesCount(prev => wasSaved ? prev + 1 : prev - 1);
      toast.error('Failed to save');
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/reflections/${reflection.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied!');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this reflection? This cannot be undone.')) return;
    try {
      await socialApi.deleteReflection(reflectionId);
      toast.success('Reflection deleted');
      navigate(-1);
    } catch {
      toast.error('Failed to delete reflection');
    }
  };

  const handleAddComment = async (text) => {
    try {
      const res = await socialApi.addReflectionComment(reflectionId, text, null);
      setComments(prev => [...prev, res.data]);
      setReflection(prev => prev ? { ...prev, commentsCount: (prev.commentsCount || 0) + 1 } : prev);
    } catch {
      toast.error('Failed to add comment');
    }
  };

  const handleDeleteComment = (commentId) => {
    setComments(prev => prev.filter(c => c.id !== commentId));
    setReflection(prev => prev ? { ...prev, commentsCount: Math.max(0, (prev.commentsCount || 1) - 1) } : prev);
  };

  if (loading) return <SkeletonLoader />;
  if (!reflection) return null;

  const isOwn = user && reflection.user?.id === user.id;
  const commentsCount = reflection.commentsCount || 0;

  return (
    <div className="reflection-detail-page">
      <div className="reflection-detail__container">
        {/* Back Button */}
        <button className="page-back-btn" onClick={() => navigate(-1)}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
          Back
        </button>

        {/* Reflection Card */}
        <div className="reflection-detail__card">
          {/* Author Header */}
          <div className="reflection-detail__header">
            <div
              className="reflection-detail__author"
              onClick={() => navigate(`/profile/${reflection.user?.username}`)}
            >
              <div className="reflection-detail__avatar-wrap">
                {reflection.user?.profilePictureUrl ? (
                  <img src={reflection.user.profilePictureUrl} alt="" className="reflection-detail__avatar" />
                ) : (
                  <div className="reflection-detail__avatar-placeholder">
                    {(reflection.user?.displayName || reflection.user?.username || '?')[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div className="reflection-detail__author-info">
                <span className="reflection-detail__author-name">
                  {reflection.user?.displayName || reflection.user?.username}
                </span>
                <span className="reflection-detail__handle">@{reflection.user?.username}</span>
                <span className="reflection-detail__date" title={fullDate(reflection.createdAt)}>
                  {timeAgo(reflection.createdAt)}
                  {reflection.visibleToFollowersOnly && <span className="reflection-detail__lock" title="Followers only"> 🔒</span>}
                </span>
              </div>
            </div>

            {isOwn && (
              <div className="reflection-detail__owner-actions">
                <button onClick={handleDelete} className="danger" title="Delete reflection">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                  </svg>
                  Delete
                </button>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="reflection-detail__content">
            <p>{reflection.content}</p>
          </div>

          {/* Attached Book */}
          {reflection.book && (
            <div className="reflection-detail__book-card">
              <div className="reflection-detail__book-cover">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" className="reflection-detail__book-svg">
                  <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z" />
                </svg>
              </div>
              <div className="reflection-detail__book-info">
                <span className="reflection-detail__book-title">{reflection.book.title}</span>
                {reflection.book.author && (
                  <span className="reflection-detail__book-author">by {reflection.book.author}</span>
                )}
              </div>
            </div>
          )}

          {/* Engagement Stats Row */}
          {(likesCount > 0 || commentsCount > 0 || savesCount > 0) && (
            <div className="reflection-detail__stats">
              {likesCount > 0 && (
                <span className="reflection-detail__stat">
                  <span className="reflection-detail__stat-icon">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="#fff">
                      <path d="M7.24 2C4.37 2 2 4.43 2 7.35c0 5.6 6.25 10.27 10 12.65 3.75-2.38 10-7.05 10-12.65C22 4.43 19.63 2 16.76 2c-1.63 0-3.19.79-4.22 2.07L12 4.74l-.54-.67C10.43 2.79 8.87 2 7.24 2z" />
                    </svg>
                  </span>
                  {likesCount}
                </span>
              )}
              <div className="reflection-detail__stat-right">
                {commentsCount > 0 && (
                  <span
                    className="reflection-detail__stat reflection-detail__stat--clickable"
                    onClick={() => setShowComments(!showComments)}
                  >
                    {commentsCount} comment{commentsCount !== 1 ? 's' : ''}
                  </span>
                )}
                {savesCount > 0 && (
                  <span className="reflection-detail__stat">
                    {savesCount} save{savesCount !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Actions Bar — LinkedIn-style SVG buttons */}
          <div className="reflection-detail__actions">
            <button
              className={`reflection-detail__action-btn ${liked ? 'active' : ''}`}
              onClick={handleLike}
            >
              <HeartIcon filled={liked} />
              <span>Like</span>
            </button>
            <button
              className={`reflection-detail__action-btn ${showComments ? 'active' : ''}`}
              onClick={() => setShowComments(!showComments)}
            >
              <CommentIcon />
              <span>Comment</span>
            </button>
            <button className="reflection-detail__action-btn" onClick={handleShare}>
              <ShareIcon />
              <span>Share</span>
            </button>
            <button
              className={`reflection-detail__action-btn ${saved ? 'active' : ''}`}
              onClick={handleSave}
            >
              <BookmarkIcon filled={saved} />
              <span>Save</span>
            </button>
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="reflection-detail__comments">
              <ReflectionCommentInput
                reflectionId={reflection.id}
                onSubmit={handleAddComment}
                placeholder="Add a comment..."
              />

              <div className="rd-comments__list">
                {comments.map(c => (
                  <ReflectionCommentItem
                    key={c.id}
                    comment={c}
                    reflectionId={reflection.id}
                    depth={0}
                    onReply={() => {}}
                    onDelete={handleDeleteComment}
                    navigate={navigate}
                  />
                ))}
              </div>

              {hasMoreComments && (
                <button
                  className="rd-comments__load-more"
                  onClick={() => loadComments(commentsPage + 1)}
                  disabled={loadingComments}
                >
                  {loadingComments ? 'Loading...' : 'Load more comments'}
                </button>
              )}

              {!loadingComments && comments.length === 0 && (
                <div className="rd-comments__empty">
                  <CommentIcon />
                  <p>No comments yet. Be the first!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReflectionDetailPage;
