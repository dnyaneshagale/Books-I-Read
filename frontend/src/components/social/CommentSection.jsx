import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import reviewApi from '../../api/reviewApi';
import socialApi from '../../api/socialApi';
import toast from 'react-hot-toast';
import './CommentSection.css';

/**
 * Renders comment text with @mentions as clickable links
 */
const CommentText = ({ content, navigate }) => {
  const parts = content.split(/(@\w+)/g);
  return (
    <p className="comment-item__text">
      {parts.map((part, i) =>
        part.startsWith('@') ? (
          <span
            key={i}
            className="comment-item__mention"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/profile/${part.slice(1)}`);
            }}
          >
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </p>
  );
};

/**
 * Comment input with @mention autocomplete
 */
const CommentInput = ({ value, onChange, onSubmit, placeholder, posting, inputRef }) => {
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionResults, setMentionResults] = useState([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionIndex, setMentionIndex] = useState(0);
  const [cursorPos, setCursorPos] = useState(0);
  const searchTimeout = useRef(null);
  const mentionListRef = useRef(null);

  const handleChange = (e) => {
    const val = e.target.value;
    const cursor = e.target.selectionStart;
    setCursorPos(cursor);
    onChange(val);

    // Detect @mention in progress
    const textBefore = val.slice(0, cursor);
    const mentionMatch = textBefore.match(/@(\w*)$/);

    if (mentionMatch) {
      const query = mentionMatch[1];
      setMentionQuery(query);
      if (query.length >= 1) {
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(async () => {
          try {
            const res = await socialApi.searchUsers(query, 0, 6);
            const users = res.data.content || res.data || [];
            setMentionResults(users);
            setShowMentions(users.length > 0);
            setMentionIndex(0);
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
    const textBefore = value.slice(0, cursorPos);
    const textAfter = value.slice(cursorPos);
    const beforeMention = textBefore.replace(/@\w*$/, '');
    const newValue = `${beforeMention}@${username} ${textAfter}`;
    onChange(newValue);
    setShowMentions(false);
    setMentionResults([]);
    // Focus back
    setTimeout(() => {
      if (inputRef?.current) {
        const pos = beforeMention.length + username.length + 2;
        inputRef.current.focus();
        inputRef.current.setSelectionRange(pos, pos);
      }
    }, 0);
  };

  const handleKeyDown = (e) => {
    if (showMentions && mentionResults.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMentionIndex(prev => Math.min(prev + 1, mentionResults.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMentionIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertMention(mentionResults[mentionIndex].username);
        return;
      } else if (e.key === 'Escape') {
        setShowMentions(false);
        return;
      }
    }
    if (e.key === 'Enter' && !e.shiftKey && !showMentions) {
      e.preventDefault();
      onSubmit(e);
    }
  };

  useEffect(() => {
    return () => clearTimeout(searchTimeout.current);
  }, []);

  return (
    <div className="comment-input-wrapper">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        maxLength={1000}
        className="comment-section__input"
        disabled={posting}
      />
      {showMentions && (
        <div className="mention-dropdown" ref={mentionListRef}>
          {mentionResults.map((user, idx) => (
            <div
              key={user.id || user.username}
              className={`mention-dropdown__item ${idx === mentionIndex ? 'active' : ''}`}
              onMouseDown={(e) => {
                e.preventDefault();
                insertMention(user.username);
              }}
            >
              <div className="mention-dropdown__avatar">
                {user.profilePictureUrl ? (
                  <img src={user.profilePictureUrl} alt="" />
                ) : (
                  <div className="mention-dropdown__avatar-placeholder">
                    {(user.displayName || user.username || '?')[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div className="mention-dropdown__info">
                <span className="mention-dropdown__name">{user.displayName || user.username}</span>
                <span className="mention-dropdown__username">@{user.username}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Single comment with reply support
 */
const CommentItem = ({ comment, currentUserId, reviewId, onDelete, onReplyAdded, navigate, depth = 0 }) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const replyInputRef = useRef(null);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleReply = async (e) => {
    e?.preventDefault();
    if (!replyText.trim()) return;
    setReplying(true);
    try {
      const res = await reviewApi.addComment(reviewId, replyText.trim(), comment.id);
      setReplyText('');
      setShowReplyInput(false);
      onReplyAdded(comment.id, res.data);
      toast.success('Reply posted');
    } catch {
      toast.error('Failed to post reply');
    } finally {
      setReplying(false);
    }
  };

  const handleReplyClick = () => {
    setShowReplyInput(true);
    setReplyText(`@${comment.authorUsername} `);
    setTimeout(() => replyInputRef.current?.focus(), 50);
  };

  const replies = comment.replies || [];

  return (
    <div className={`comment-item ${depth > 0 ? 'comment-item--reply' : ''}`}>
      <div className="comment-item__avatar">
        {comment.authorProfilePictureUrl ? (
          <img src={comment.authorProfilePictureUrl} alt="" />
        ) : (
          <div className="comment-item__avatar-placeholder">
            {(comment.authorDisplayName || comment.authorUsername || '?')[0].toUpperCase()}
          </div>
        )}
      </div>
      <div className="comment-item__content-wrap">
        <div className="comment-item__body">
          <div className="comment-item__header">
            <span
              className="comment-item__author"
              onClick={() => navigate(`/profile/${comment.authorUsername}`)}
            >
              {comment.authorDisplayName || comment.authorUsername}
            </span>
            <span className="comment-item__time">{formatTime(comment.createdAt)}</span>
          </div>
          <CommentText content={comment.content} navigate={navigate} />
          <div className="comment-item__actions">
            {depth < 2 && (
              <button className="comment-item__reply-btn" onClick={handleReplyClick}>
                Reply
              </button>
            )}
            {comment.authorId === currentUserId && (
              confirmingDelete ? (
                <div className="comment-item__delete-confirm">
                  <span className="comment-item__delete-confirm-text">Delete?</span>
                  <button
                    className="comment-item__delete-yes"
                    onClick={() => { onDelete(comment.id); setConfirmingDelete(false); }}
                  >
                    Yes
                  </button>
                  <button
                    className="comment-item__delete-no"
                    onClick={() => setConfirmingDelete(false)}
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  className="comment-item__delete"
                  onClick={() => setConfirmingDelete(true)}
                  title="Delete comment"
                >
                  🗑️ Delete
                </button>
              )
            )}
          </div>
        </div>

        {/* Reply input */}
        {showReplyInput && (
          <form className="comment-section__form comment-section__form--reply" onSubmit={handleReply}>
            <CommentInput
              value={replyText}
              onChange={setReplyText}
              onSubmit={handleReply}
              placeholder={`Reply to ${comment.authorDisplayName || comment.authorUsername}...`}
              posting={replying}
              inputRef={replyInputRef}
            />
            <div className="comment-reply__actions">
              <button
                type="button"
                className="comment-reply__cancel"
                onClick={() => { setShowReplyInput(false); setReplyText(''); }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="comment-section__post-btn comment-section__post-btn--reply"
                disabled={replying || !replyText.trim()}
              >
                {replying ? '...' : 'Reply'}
              </button>
            </div>
          </form>
        )}

        {/* Replies — Instagram-style show/hide toggle */}
        {replies.length > 0 && (
          <>
            <button
              className="comment-item__show-replies"
              onClick={() => setShowReplies(!showReplies)}
            >
              {showReplies
                ? `── Hide replies`
                : `── View ${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}`
              }
            </button>
            {showReplies && (
              <div className="comment-item__replies">
                {replies.map(reply => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    currentUserId={currentUserId}
                    reviewId={reviewId}
                    onDelete={onDelete}
                    onReplyAdded={onReplyAdded}
                    navigate={navigate}
                    depth={depth + 1}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

/**
 * CommentSection - Full comment list with threaded replies and @mentions
 */
const CommentSection = ({ reviewId, currentUserId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const navigate = useNavigate();
  const mainInputRef = useRef(null);

  useEffect(() => {
    fetchComments();
  }, [reviewId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await reviewApi.getComments(reviewId);
      setComments(res.data.content || res.data || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async (e) => {
    e?.preventDefault();
    if (!newComment.trim()) return;

    setPosting(true);
    try {
      await reviewApi.addComment(reviewId, newComment.trim());
      setNewComment('');
      fetchComments();
      toast.success('Comment added');
    } catch (err) {
      toast.error('Failed to post comment');
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await reviewApi.deleteComment(commentId);
      // Remove from top-level or from replies
      setComments(prev => {
        const removeFromList = (list) =>
          list
            .filter(c => c.id !== commentId)
            .map(c => ({
              ...c,
              replies: c.replies ? removeFromList(c.replies) : []
            }));
        return removeFromList(prev);
      });
      toast.success('Comment deleted');
    } catch {
      toast.error('Failed to delete comment');
    }
  };

  const handleReplyAdded = useCallback((parentId, newReply) => {
    setComments(prev => {
      const addReply = (list) =>
        list.map(c => {
          if (c.id === parentId) {
            return { ...c, replies: [...(c.replies || []), newReply], replyCount: (c.replyCount || 0) + 1 };
          }
          return { ...c, replies: c.replies ? addReply(c.replies) : [] };
        });
      return addReply(prev);
    });
  }, []);

  return (
    <div className="comment-section">
      {/* Add Comment */}
      <form className="comment-section__form" onSubmit={handlePost}>
        <CommentInput
          value={newComment}
          onChange={setNewComment}
          onSubmit={handlePost}
          placeholder="Write a comment... Use @ to mention someone"
          posting={posting}
          inputRef={mainInputRef}
        />
        <button
          type="submit"
          className="comment-section__post-btn"
          disabled={posting || !newComment.trim()}
        >
          {posting ? '...' : 'Post'}
        </button>
      </form>

      {/* Comments List */}
      <div className="comment-section__list">
        {loading ? (
          <div className="comment-section__loading">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="comment-section__empty">
            No comments yet. Be the first to share your thoughts!
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              reviewId={reviewId}
              onDelete={handleDelete}
              onReplyAdded={handleReplyAdded}
              navigate={navigate}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;
