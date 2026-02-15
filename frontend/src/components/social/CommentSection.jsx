import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import reviewApi from '../../api/reviewApi';
import socialApi from '../../api/socialApi';
import toast from 'react-hot-toast';

/**
 * Renders comment text with @mentions as clickable links
 */
const CommentText = ({ content, navigate }) => {
  const parts = content.split(/(@\w+)/g);
  return (
    <p className="m-0 text-[0.88rem] text-[var(--color-text-secondary,#475569)] dark:text-[#9E95A8] leading-normal break-words">
      {parts.map((part, i) =>
        part.startsWith('@') ? (
          <span
            key={i}
            className="text-[var(--color-primary,#6d28d9)] dark:text-[#7C4DFF] font-semibold cursor-pointer transition-opacity duration-150 hover:opacity-75"
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
    <div className="flex-1 relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        maxLength={1000}
        className="w-full py-2.5 px-4 border border-[var(--color-border,#e2e8f0)] dark:border-[#2D2A35] rounded-full text-[0.88rem] outline-none transition-all duration-200 font-[inherit] bg-[var(--color-bg,#ffffff)] dark:bg-[#1E1B24] text-[var(--color-text-primary,#0f172a)] dark:text-[#E2D9F3] box-border focus:border-[var(--color-primary,#6d28d9)] dark:focus:border-[#7C4DFF] focus:shadow-[0_0_0_3px_rgba(109,40,217,0.08)] dark:focus:shadow-[0_0_0_3px_rgba(124,77,255,0.1)]"
        disabled={posting}
      />
      {showMentions && (
        <div className="absolute bottom-full left-0 right-0 max-h-[220px] overflow-y-auto bg-[var(--color-bg,#ffffff)] dark:bg-[#1E1B24] border border-[var(--color-border,#e2e8f0)] dark:border-[#2D2A35] rounded-xl shadow-lg dark:shadow-[0_10px_30px_rgba(0,0,0,0.4)] z-[100] mb-1" ref={mentionListRef}>
          {mentionResults.map((user, idx) => (
            <div
              key={user.id || user.username}
              className={`flex items-center gap-2.5 py-2.5 px-3.5 cursor-pointer transition-colors duration-[120ms] ${idx === mentionIndex ? 'bg-violet-600/[0.04] dark:bg-violet-400/[0.08]' : 'hover:bg-violet-600/[0.04] dark:hover:bg-violet-400/[0.08]'}`}
              onMouseDown={(e) => {
                e.preventDefault();
                insertMention(user.username);
              }}
            >
              <div className="shrink-0">
                {user.profilePictureUrl ? (
                  <img src={user.profilePictureUrl} alt="" className="w-[30px] h-[30px] rounded-full object-cover" />
                ) : (
                  <div className="w-[30px] h-[30px] rounded-full bg-gradient-to-br from-violet-700 to-violet-500 text-white flex items-center justify-center font-bold text-xs">
                    {(user.displayName || user.username || '?')[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-[0.85rem] text-[var(--color-text-primary,#0f172a)] dark:text-[#E2D9F3] truncate">{user.displayName || user.username}</span>
                <span className="text-xs text-[var(--color-text-light,#94a3b8)] dark:text-[#5a5268]">@{user.username}</span>
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
    <div className={`flex items-start gap-2.5 py-2.5 ${depth > 0 ? 'border-none py-2' : 'border-b border-[var(--color-border,#f1f5f9)] dark:border-[#2D2A35] last:border-none'}`}>
      <div className="shrink-0">
        {comment.authorProfilePictureUrl ? (
          <img src={comment.authorProfilePictureUrl} alt="" className={`${depth > 0 ? 'w-[26px] h-[26px]' : 'w-8 h-8'} rounded-full object-cover`} />
        ) : (
          <div className={`${depth > 0 ? 'w-[26px] h-[26px] text-[0.7rem]' : 'w-8 h-8 text-[0.8rem]'} rounded-full bg-gradient-to-br from-violet-700 to-violet-500 text-white flex items-center justify-center font-bold`}>
            {(comment.authorDisplayName || comment.authorUsername || '?')[0].toUpperCase()}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="min-w-0">
          <div className="flex items-baseline gap-2 mb-0.5">
            <span
              className="font-bold text-[0.85rem] text-[var(--color-text-primary,#0f172a)] dark:text-[#E2D9F3] cursor-pointer transition-colors duration-150 hover:text-[var(--color-primary,#6d28d9)] dark:hover:text-[#7C4DFF]"
              onClick={() => navigate(`/profile/${comment.authorUsername}`)}
            >
              {comment.authorDisplayName || comment.authorUsername}
            </span>
            <span className="text-[0.72rem] text-[var(--color-text-light,#94a3b8)] dark:text-[#5a5268]">{formatTime(comment.createdAt)}</span>
          </div>
          <CommentText content={comment.content} navigate={navigate} />
          <div className="flex gap-3 mt-1">
            {depth < 2 && (
              <button className="bg-none border-none text-xs font-bold text-[var(--color-text-light,#94a3b8)] dark:text-[#5a5268] cursor-pointer py-0.5 px-0 transition-colors duration-150 hover:text-[var(--color-primary,#6d28d9)] dark:hover:text-[#7C4DFF]" onClick={handleReplyClick}>
                Reply
              </button>
            )}
            {comment.authorId === currentUserId && (
              confirmingDelete ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-red-500 dark:text-red-400">Delete?</span>
                  <button
                    className="bg-red-500 dark:bg-red-600 text-white border-none rounded-lg px-2.5 py-0.5 text-[0.72rem] font-bold cursor-pointer transition-colors duration-150 hover:bg-red-600 dark:hover:bg-red-500"
                    onClick={() => { onDelete(comment.id); setConfirmingDelete(false); }}
                  >
                    Yes
                  </button>
                  <button
                    className="bg-none border border-[var(--color-border,#e2e8f0)] dark:border-[#2D2A35] text-[var(--color-text-secondary,#475569)] dark:text-[#9E95A8] rounded-lg px-2.5 py-0.5 text-[0.72rem] font-bold cursor-pointer transition-all duration-150 hover:bg-slate-100 dark:hover:bg-[#2D2A35]"
                    onClick={() => setConfirmingDelete(false)}
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  className="bg-none border-none cursor-pointer text-xs font-semibold text-[var(--color-text-light,#94a3b8)] dark:text-[#5a5268] py-0.5 px-0 transition-colors duration-150 hover:text-red-500 dark:hover:text-red-400"
                  onClick={() => setConfirmingDelete(true)}
                  title="Delete comment"
                >
                  <Trash2 className="w-3.5 h-3.5 inline mr-1" /> Delete
                </button>
              )
            )}
          </div>
        </div>

        {/* Reply input */}
        {showReplyInput && (
          <form className="flex flex-col gap-2 my-2.5 mb-1" onSubmit={handleReply}>
            <CommentInput
              value={replyText}
              onChange={setReplyText}
              onSubmit={handleReply}
              placeholder={`Reply to ${comment.authorDisplayName || comment.authorUsername}...`}
              posting={replying}
              inputRef={replyInputRef}
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                className="bg-none border-none text-[var(--color-text-secondary,#475569)] dark:text-[#9E95A8] text-[0.8rem] font-semibold cursor-pointer py-1.5 px-3 rounded-lg transition-colors duration-150 hover:bg-slate-100 dark:hover:bg-[#2D2A35]"
                onClick={() => { setShowReplyInput(false); setReplyText(''); }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-1.5 px-4 rounded-full border-none bg-gradient-to-br from-violet-700 via-violet-500 to-blue-600 text-white text-[0.8rem] font-bold cursor-pointer transition-all duration-200 whitespace-nowrap shadow-[0_2px_6px_rgba(109,40,217,0.2)] shrink-0 hover:not-disabled:-translate-y-px hover:not-disabled:shadow-[0_4px_12px_rgba(109,40,217,0.3)] disabled:opacity-40 disabled:cursor-not-allowed"
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
              className="bg-none border-none text-[0.78rem] font-bold text-[var(--color-primary,#6d28d9)] dark:text-[#7C4DFF] cursor-pointer py-1 px-0 mb-0.5 transition-opacity duration-150 hover:opacity-75"
              onClick={() => setShowReplies(!showReplies)}
            >
              {showReplies
                ? `── Hide replies`
                : `── View ${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}`
              }
            </button>
            {showReplies && (
              <div className="mt-1 pl-3 border-l-2 border-[var(--color-border,#e2e8f0)] dark:border-[#2D2A35] ml-1">
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
    <div className="mt-4">
      {/* Add Comment */}
      <form className="flex gap-2 mb-4 items-start" onSubmit={handlePost}>
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
          className="py-2 px-5 rounded-full border-none bg-gradient-to-br from-violet-700 via-violet-500 to-blue-600 text-white text-[0.85rem] font-bold cursor-pointer transition-all duration-200 whitespace-nowrap shadow-[0_2px_6px_rgba(109,40,217,0.2)] shrink-0 hover:not-disabled:-translate-y-px hover:not-disabled:shadow-[0_4px_12px_rgba(109,40,217,0.3)] disabled:opacity-40 disabled:cursor-not-allowed"
          disabled={posting || !newComment.trim()}
        >
          {posting ? '...' : 'Post'}
        </button>
      </form>

      {/* Comments List */}
      <div className="flex flex-col gap-0.5">
        {loading ? (
          <div className="text-center py-6 text-[var(--color-text-light,#94a3b8)] dark:text-[#5a5268] text-[0.85rem]">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-center py-6 text-[var(--color-text-light,#94a3b8)] dark:text-[#5a5268] text-[0.85rem]">
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
