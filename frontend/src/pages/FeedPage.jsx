import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import socialApi from '../api/socialApi';
import bookApi from '../api/bookApi';
import toast from 'react-hot-toast';
import './FeedPage.css';

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
            className="ln-comments__mention"
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
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionResults, setMentionResults] = useState([]);
  const [showMentions, setShowMentions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  const handleChange = (e) => {
    const val = e.target.value;
    setText(val);

    // Detect @mention being typed
    const cursorPos = e.target.selectionStart;
    const textBefore = val.slice(0, cursorPos);
    const mentionMatch = textBefore.match(/@(\w*)$/);

    if (mentionMatch) {
      const query = mentionMatch[1];
      setMentionQuery(query);
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
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertMention(mentionResults[activeIndex]?.username);
        return;
      }
      if (e.key === 'Escape') {
        setShowMentions(false);
        return;
      }
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (text.trim()) {
        onSubmit(text.trim());
        setText('');
      }
    }
  };

  return (
    <div className={`ln-comments__input-row ${isReply ? 'ln-comments__input-row--reply' : ''}`}>
      {!isReply && <div className="ln-comments__input-avatar">💬</div>}
      <div className="ln-comments__input-wrap-outer">
        <div className="ln-comments__input-wrap">
          <input
            ref={inputRef}
            className="ln-comments__input"
            placeholder={placeholder || 'Add a comment...'}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />
          <button
            className={`ln-comments__send-btn ${isReply ? 'ln-comments__send-btn--reply' : ''}`}
            onClick={() => { if (text.trim()) { onSubmit(text.trim()); setText(''); } }}
            disabled={!text.trim()}
          >
            {isReply ? 'Reply' : 'Post'}
          </button>
        </div>

        {/* @Mention dropdown */}
        {showMentions && (
          <div className="ln-comments__mention-dropdown">
            {mentionResults.map((user, idx) => (
              <div
                key={user.id || idx}
                className={`ln-comments__mention-item ${idx === activeIndex ? 'active' : ''}`}
                onMouseDown={(e) => { e.preventDefault(); insertMention(user.username); }}
                onMouseEnter={() => setActiveIndex(idx)}
              >
                <div className="ln-comments__mention-avatar">
                  {user.profilePictureUrl ? (
                    <img src={user.profilePictureUrl} alt="" />
                  ) : (
                    <span>{(user.displayName || user.username || 'U').charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="ln-comments__mention-info">
                  <span className="ln-comments__mention-name">{user.displayName || user.username}</span>
                  <span className="ln-comments__mention-username">@{user.username}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {isReply && onCancel && (
          <button className="ln-comments__reply-cancel" onClick={onCancel}>Cancel</button>
        )}
      </div>
    </div>
  );
};

/**
 * ReflectionCommentItem — Recursive threaded comment with Instagram-style show/hide replies
 */
const ReflectionCommentItem = ({ comment, reflectionId, depth, onReply, onDelete, navigate, formatDate }) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState(comment.replies || []);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const maxDepth = 2;

  const handleToggleReplies = async () => {
    if (!showReplies && replies.length === 0 && comment.replyCount > 0) {
      // Load replies from server
      setLoadingReplies(true);
      try {
        const res = await socialApi.getReflectionCommentReplies(comment.id);
        setReplies(res.data || []);
      } catch {
        toast.error('Failed to load replies');
      } finally {
        setLoadingReplies(false);
      }
    }
    setShowReplies(!showReplies);
  };

  const handleReplySubmit = (content) => {
    onReply(content, comment.id);
    setShowReplyInput(false);
    setShowReplies(true);
  };

  // Sync with parent state updates (optimistic)
  useEffect(() => {
    if (comment.replies) setReplies(comment.replies);
  }, [comment.replies]);

  return (
    <div className={`ln-comments__item ${depth > 0 ? 'ln-comments__item--reply' : ''}`}>
      <div
        className="ln-comments__item-avatar"
        onClick={() => navigate(`/profile/${comment.user?.username}`)}
      >
        {comment.user?.profilePictureUrl ? (
          <img src={comment.user.profilePictureUrl} alt="" />
        ) : (
          <span>
            {(comment.user?.displayName || comment.user?.username || 'U').charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <div className="ln-comments__item-content-wrap">
        <div className="ln-comments__item-body">
          <div className="ln-comments__item-header">
            <span
              className="ln-comments__item-name"
              onClick={() => navigate(`/profile/${comment.user?.username}`)}
            >
              {comment.user?.displayName || comment.user?.username}
            </span>
            <span className="ln-comments__item-time">{formatDate(comment.createdAt)}</span>
          </div>
          <div className="ln-comments__item-text">
            <CommentMentionText content={comment.content} navigate={navigate} />
          </div>
        </div>

        {/* Actions: Reply / Delete */}
        <div className="ln-comments__item-actions">
          {depth < maxDepth && (
            <button
              className="ln-comments__item-reply-btn"
              onClick={() => setShowReplyInput(!showReplyInput)}
            >
              Reply
            </button>
          )}
          {confirmingDelete ? (
            <div className="ln-comments__delete-confirm">
              <span className="ln-comments__delete-confirm-text">Delete?</span>
              <button
                className="ln-comments__delete-yes"
                onClick={() => { onDelete(comment.id, comment.parentId || null); setConfirmingDelete(false); }}
              >
                Yes
              </button>
              <button
                className="ln-comments__delete-no"
                onClick={() => setConfirmingDelete(false)}
              >
                No
              </button>
            </div>
          ) : (
            <button
              className="ln-comments__item-delete-btn"
              onClick={() => setConfirmingDelete(true)}
            >
              🗑️ Delete
            </button>
          )}
        </div>

        {/* Inline reply form */}
        {showReplyInput && (
          <ReflectionCommentInput
            reflectionId={reflectionId}
            onSubmit={handleReplySubmit}
            placeholder={`Reply to @${comment.user?.username}...`}
            initialValue={`@${comment.user?.username} `}
            isReply
            onCancel={() => setShowReplyInput(false)}
          />
        )}

        {/* Show/hide replies toggle (Instagram-style) */}
        {(comment.replyCount > 0 || replies.length > 0) && (
          <button className="ln-comments__show-replies" onClick={handleToggleReplies}>
            {loadingReplies
              ? 'Loading...'
              : showReplies
                ? `── Hide replies`
                : `── View ${comment.replyCount || replies.length} ${(comment.replyCount || replies.length) === 1 ? 'reply' : 'replies'}`
            }
          </button>
        )}

        {/* Nested replies */}
        {showReplies && replies.length > 0 && (
          <div className="ln-comments__replies">
            {replies.map(reply => (
              <ReflectionCommentItem
                key={reply.id}
                comment={reply}
                reflectionId={reflectionId}
                depth={depth + 1}
                onReply={onReply}
                onDelete={onDelete}
                navigate={navigate}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * FeedPage — LinkedIn-style reflections feed
 * Features: Like, Comment, Share, Save, Book linking, Following/Everyone tabs
 */
const FeedPage = () => {
  const [activeTab, setActiveTab] = useState('following');
  const [sortMode, setSortMode] = useState('relevant'); // 'relevant' | 'recent'
  const [reflections, setReflections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const searchDebounceRef = useRef(null);

  // Composer state
  const [showComposer, setShowComposer] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newBookId, setNewBookId] = useState('');
  const [newPrivacy, setNewPrivacy] = useState(false);
  const [posting, setPosting] = useState(false);
  const [myBooks, setMyBooks] = useState([]);
  const textareaRef = useRef(null);

  // Comment sections — track which reflections have expanded comments
  const [expandedComments, setExpandedComments] = useState({});
  const [loadingComments, setLoadingComments] = useState({});
  const [allComments, setAllComments] = useState({});
  const [commentPages, setCommentPages] = useState({});
  const [hasMoreComments, setHasMoreComments] = useState({});

  // Expanded content (See More / See Less)
  const [expandedContent, setExpandedContent] = useState({});

  // Delete confirmation
  const [deletingId, setDeletingId] = useState(null);

  // Three-dot menu
  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => {
    if (!isSearching) {
      loadReflections(0, true);
    }
  }, [activeTab, sortMode]);

  // Real-time debounced search for reflections
  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    if (!searchQuery.trim()) {
      if (isSearching) {
        setIsSearching(false);
        loadReflections(0, true);
      }
      return;
    }

    searchDebounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      setLoading(true);
      try {
        const res = await socialApi.searchReflections(searchQuery.trim(), 0, 20);
        setReflections(res.data.content || []);
        setHasMore(false);
      } catch {
        setReflections([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(searchDebounceRef.current);
  }, [searchQuery]);

  useEffect(() => {
    if (showComposer && myBooks.length === 0) {
      bookApi.getAllBooks()
        .then(res => setMyBooks(res || []))
        .catch(() => {});
    }
    if (showComposer && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [showComposer]);

  // Close menus on outside click
  useEffect(() => {
    const handler = () => setOpenMenuId(null);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const loadReflections = async (pg = 0, reset = false) => {
    if (reset) setLoading(true);
    try {
      const fetcher = activeTab === 'following'
        ? socialApi.getFollowingReflections
        : socialApi.getEveryoneReflections;
      const response = await fetcher(pg, 15, sortMode);
      const content = response.data.content || [];
      const pageInfo = response.data.page || {};

      if (reset) {
        setReflections(content);
      } else {
        setReflections(prev => [...prev, ...content]);
      }
      setPage(pg);
      setHasMore(pageInfo.number != null && pageInfo.totalPages != null
        ? pageInfo.number < pageInfo.totalPages - 1
        : false);
    } catch (error) {
      console.error('Failed to load reflections:', error);
      if (reset) setReflections([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (hasMore) loadReflections(page + 1, false);
  };

  const handleTabChange = (tab) => {
    if (tab !== activeTab) {
      setActiveTab(tab);
      setReflections([]);
      setPage(0);
      setHasMore(true);
    }
  };

  // ========================
  // Post a reflection
  // ========================
  const handlePost = async () => {
    if (!newContent.trim()) return;
    setPosting(true);
    try {
      const payload = {
        content: newContent.trim(),
        visibleToFollowersOnly: newPrivacy,
      };
      if (newBookId) payload.bookId = Number(newBookId);

      const res = await socialApi.createReflection(payload);
      toast.success('Reflection posted!');
      setNewContent('');
      setNewBookId('');
      setNewPrivacy(false);
      setShowComposer(false);
      setReflections(prev => [res.data, ...prev]);
    } catch (err) {
      console.error(err);
      toast.error('Failed to post reflection');
    } finally {
      setPosting(false);
    }
  };

  // ========================
  // Delete reflection
  // ========================
  const handleDelete = async (id) => {
    try {
      await socialApi.deleteReflection(id);
      setReflections(prev => prev.filter(r => r.id !== id));
      toast.success('Reflection deleted');
    } catch {
      toast.error('Failed to delete');
    }
    setDeletingId(null);
    setOpenMenuId(null);
  };

  // ========================
  // Toggle privacy
  // ========================
  const handleTogglePrivacy = async (reflection) => {
    const newVal = !reflection.visibleToFollowersOnly;
    try {
      const res = await socialApi.updateReflectionPrivacy(reflection.id, newVal);
      setReflections(prev =>
        prev.map(r => r.id === reflection.id ? { ...r, ...res.data } : r)
      );
      toast.success(newVal ? 'Visible to followers only' : 'Visible to everyone');
    } catch {
      toast.error('Failed to update privacy');
    }
    setOpenMenuId(null);
  };

  // ========================
  // Like / Unlike
  // ========================
  const handleToggleLike = async (reflection) => {
    // Optimistic update
    const wasLiked = reflection.hasLiked;
    setReflections(prev =>
      prev.map(r => r.id === reflection.id
        ? { ...r, hasLiked: !wasLiked, likesCount: wasLiked ? r.likesCount - 1 : r.likesCount + 1 }
        : r)
    );
    try {
      const res = await socialApi.toggleLikeReflection(reflection.id);
      setReflections(prev =>
        prev.map(r => r.id === reflection.id ? { ...r, ...res.data } : r)
      );
    } catch {
      // Revert
      setReflections(prev =>
        prev.map(r => r.id === reflection.id
          ? { ...r, hasLiked: wasLiked, likesCount: wasLiked ? r.likesCount + 1 : r.likesCount - 1 }
          : r)
      );
      toast.error('Failed to update like');
    }
  };

  // ========================
  // Save / Bookmark
  // ========================
  const handleToggleSave = async (reflection) => {
    const wasSaved = reflection.hasSaved;
    setReflections(prev =>
      prev.map(r => r.id === reflection.id
        ? { ...r, hasSaved: !wasSaved, savesCount: wasSaved ? r.savesCount - 1 : r.savesCount + 1 }
        : r)
    );
    try {
      const res = await socialApi.toggleSaveReflection(reflection.id);
      setReflections(prev =>
        prev.map(r => r.id === reflection.id ? { ...r, ...res.data } : r)
      );
      toast.success(wasSaved ? 'Removed from saved' : 'Reflection saved');
    } catch {
      setReflections(prev =>
        prev.map(r => r.id === reflection.id
          ? { ...r, hasSaved: wasSaved, savesCount: wasSaved ? r.savesCount + 1 : r.savesCount - 1 }
          : r)
      );
      toast.error('Failed to update save');
    }
  };

  // ========================
  // Comments
  // ========================
  const toggleCommentSection = (reflectionId) => {
    setExpandedComments(prev => ({ ...prev, [reflectionId]: !prev[reflectionId] }));
    // Load comments when opening
    if (!expandedComments[reflectionId] && !allComments[reflectionId]) {
      loadComments(reflectionId, 0, true);
    }
  };

  const loadComments = async (reflectionId, pg = 0, reset = false) => {
    setLoadingComments(prev => ({ ...prev, [reflectionId]: true }));
    try {
      const res = await socialApi.getReflectionComments(reflectionId, pg, 10);
      const content = res.data.content || [];
      const pageInfo = res.data.page || {};

      if (reset) {
        setAllComments(prev => ({ ...prev, [reflectionId]: content }));
      } else {
        setAllComments(prev => ({
          ...prev,
          [reflectionId]: [...(prev[reflectionId] || []), ...content],
        }));
      }
      setCommentPages(prev => ({ ...prev, [reflectionId]: pg }));
      setHasMoreComments(prev => ({
        ...prev,
        [reflectionId]: pageInfo.number != null && pageInfo.totalPages != null
          ? pageInfo.number < pageInfo.totalPages - 1
          : false,
      }));
    } catch {
      toast.error('Failed to load comments');
    } finally {
      setLoadingComments(prev => ({ ...prev, [reflectionId]: false }));
    }
  };

  const handlePostComment = async (reflectionId, content, parentId = null) => {
    if (!content.trim()) return;
    try {
      const res = await socialApi.addReflectionComment(reflectionId, content.trim(), parentId);
      if (parentId) {
        // Add reply to parent's replies array
        setAllComments(prev => ({
          ...prev,
          [reflectionId]: (prev[reflectionId] || []).map(c => {
            if (c.id === parentId) {
              return {
                ...c,
                replyCount: (c.replyCount || 0) + 1,
                replies: [...(c.replies || []), res.data],
              };
            }
            return c;
          }),
        }));
      } else {
        // Add top-level comment
        setAllComments(prev => ({
          ...prev,
          [reflectionId]: [...(prev[reflectionId] || []), res.data],
        }));
      }
      // Update comments count
      setReflections(prev =>
        prev.map(r => r.id === reflectionId
          ? { ...r, commentsCount: (r.commentsCount || 0) + 1 }
          : r)
      );
    } catch {
      toast.error('Failed to post comment');
    }
  };

  const handleDeleteComment = async (reflectionId, commentId, parentId = null) => {
    try {
      await socialApi.deleteReflectionComment(commentId);
      if (parentId) {
        // Remove reply from parent's replies
        setAllComments(prev => ({
          ...prev,
          [reflectionId]: (prev[reflectionId] || []).map(c => {
            if (c.id === parentId) {
              return {
                ...c,
                replyCount: Math.max(0, (c.replyCount || 0) - 1),
                replies: (c.replies || []).filter(r => r.id !== commentId),
              };
            }
            return c;
          }),
        }));
      } else {
        setAllComments(prev => ({
          ...prev,
          [reflectionId]: (prev[reflectionId] || []).filter(c => c.id !== commentId),
        }));
      }
      setReflections(prev =>
        prev.map(r => r.id === reflectionId
          ? { ...r, commentsCount: Math.max(0, (r.commentsCount || 0) - 1) }
          : r)
      );
      toast.success('Comment deleted');
    } catch {
      toast.error('Failed to delete comment');
    }
  };

  // ========================
  // Share (copy link)
  // ========================
  const handleShare = (reflection) => {
    const url = `${window.location.origin}/reflections/${reflection.id}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Link copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy link');
    });
  };

  // ========================
  // Formatting helpers
  // ========================
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const diffWeeks = Math.floor(diffDays / 7);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    if (diffWeeks < 4) return `${diffWeeks}w`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const CONTENT_LIMIT = 300;

  return (
    <div className="ln-feed">
      <div className="ln-feed__container">

        {/* ---- Back Button ---- */}
        <button className="page-back-btn" onClick={() => navigate(-1)}>← Back</button>

        {/* ---- Composer Card ---- */}
        <div className="ln-composer-card">
          <div className="ln-composer-card__trigger" onClick={() => setShowComposer(!showComposer)}>
            <div className="ln-composer-card__avatar">
              <div className="ln-composer-card__avatar-circle">✍️</div>
            </div>
            <div className="ln-composer-card__placeholder">
              Share a reading insight or reflection...
            </div>
          </div>

          {showComposer && (
            <div className="ln-composer-card__form">
              <textarea
                ref={textareaRef}
                className="ln-composer-card__textarea"
                placeholder="What's on your mind about what you're reading?"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                maxLength={2000}
                rows={4}
              />

              <div className="ln-composer-card__toolbar">
                <div className="ln-composer-card__tools">
                  <select
                    className="ln-composer-card__book-select"
                    value={newBookId}
                    onChange={(e) => setNewBookId(e.target.value)}
                  >
                    <option value="">📚 Link a book</option>
                    {myBooks.map(book => (
                      <option key={book.id} value={book.id}>
                        {book.title} — {book.author}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    className={`ln-composer-card__privacy ${newPrivacy ? 'private' : 'public'}`}
                    onClick={() => setNewPrivacy(!newPrivacy)}
                  >
                    {newPrivacy ? '🔒 Followers' : '🌐 Anyone'}
                  </button>
                </div>

                <div className="ln-composer-card__submit-row">
                  <span className="ln-composer-card__chars">{newContent.length}/2000</span>
                  <button
                    className="ln-composer-card__post-btn"
                    onClick={handlePost}
                    disabled={posting || !newContent.trim()}
                  >
                    {posting ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ---- Search Bar ---- */}
        <div className="ln-search-bar">
          <svg className="ln-search-bar__icon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input
            type="text"
            className="ln-search-bar__input"
            placeholder="Search reflections by content, book, user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="ln-search-bar__clear" onClick={() => setSearchQuery('')}>✕</button>
          )}
        </div>

        {/* ---- Tabs + Sort ---- */}
        <div className="ln-tabs-row">
          <div className="ln-tabs">
            <button
              className={`ln-tabs__btn ${activeTab === 'following' ? 'active' : ''}`}
              onClick={() => handleTabChange('following')}
            >
              Following
            </button>
            <button
              className={`ln-tabs__btn ${activeTab === 'everyone' ? 'active' : ''}`}
              onClick={() => handleTabChange('everyone')}
            >
              Everyone
            </button>
            <div
              className="ln-tabs__indicator"
              style={{ transform: activeTab === 'everyone' ? 'translateX(100%)' : 'translateX(0)' }}
            />
          </div>
          <div className="ln-sort-toggle">
            <button
              className={`ln-sort-toggle__btn ${sortMode === 'relevant' ? 'active' : ''}`}
              onClick={() => setSortMode('relevant')}
              title="Show most relevant first"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
              Top
            </button>
            <button
              className={`ln-sort-toggle__btn ${sortMode === 'recent' ? 'active' : ''}`}
              onClick={() => setSortMode('recent')}
              title="Show newest first"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
              New
            </button>
          </div>
        </div>

        {/* ---- Feed ---- */}
        {loading ? (
          <div className="ln-feed__skeleton-list">
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton-card ln-feed__skeleton-card">
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
                  <div className="skeleton skeleton-avatar" />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton skeleton-text skeleton-text--md" />
                    <div className="skeleton skeleton-text skeleton-text--sm" style={{ marginBottom: 0 }} />
                  </div>
                </div>
                <div className="skeleton skeleton-text skeleton-text--full" />
                <div className="skeleton skeleton-text skeleton-text--lg" />
                <div className="skeleton skeleton-text skeleton-text--md" style={{ marginBottom: 16 }} />
                <div style={{ display: 'flex', gap: 16 }}>
                  <div className="skeleton" style={{ width: 60, height: 28, borderRadius: 14 }} />
                  <div className="skeleton" style={{ width: 60, height: 28, borderRadius: 14 }} />
                  <div className="skeleton" style={{ width: 60, height: 28, borderRadius: 14 }} />
                </div>
              </div>
            ))}
          </div>
        ) : reflections.length === 0 ? (
          <div className="ln-empty">
            <div className="ln-empty__icon">
              {isSearching ? '🔍' : activeTab === 'following' ? '👥' : '🌍'}
            </div>
            <h3>{isSearching ? 'No reflections found' : activeTab === 'following' ? 'No reflections from your network yet' : 'No reflections to show'}</h3>
            <p>{isSearching
              ? `No results for "${searchQuery}". Try a different search.`
              : activeTab === 'following'
              ? 'Follow some readers or share the first reflection!'
              : 'Be the first to share a reflection with the community!'}</p>
            {!isSearching && activeTab === 'following' && (
              <button className="ln-empty__btn" onClick={() => navigate('/discover')}>
                Discover Readers
              </button>
            )}
          </div>
        ) : (
          <div className="ln-feed__list stagger-children" key={activeTab + sortMode}>
            {reflections.map((r) => (
              <div key={r.id} className="ln-post">
                {/* ---- Post Header ---- */}
                <div className="ln-post__header">
                  <div
                    className="ln-post__avatar"
                    onClick={() => navigate(`/profile/${r.user?.username}`)}
                  >
                    {r.user?.profilePictureUrl ? (
                      <img src={r.user.profilePictureUrl} alt="" />
                    ) : (
                      <span className="ln-post__avatar-letter">
                        {(r.user?.displayName || r.user?.username || 'U').charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="ln-post__author">
                    <span
                      className="ln-post__name"
                      onClick={() => navigate(`/profile/${r.user?.username}`)}
                    >
                      {r.user?.displayName || r.user?.username}
                    </span>
                    <span className="ln-post__headline">@{r.user?.username}</span>
                    <span className="ln-post__time">
                      {formatDate(r.createdAt)}
                      {r.visibleToFollowersOnly && <span className="ln-post__lock" title="Followers only"> 🔒</span>}
                    </span>
                  </div>

                  {/* Three-dot menu */}
                  <div className="ln-post__menu-wrap">
                    <button
                      className="ln-post__menu-btn"
                      onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === r.id ? null : r.id); }}
                    >
                      ⋯
                    </button>
                    {openMenuId === r.id && (
                      <div className="ln-post__dropdown" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => handleTogglePrivacy(r)}>
                          {r.visibleToFollowersOnly ? '🌐 Make public' : '🔒 Followers only'}
                        </button>
                        {deletingId === r.id ? (
                          <div className="ln-post__dropdown-confirm">
                            <button className="danger" onClick={() => handleDelete(r.id)}>Confirm delete</button>
                            <button onClick={() => setDeletingId(null)}>Cancel</button>
                          </div>
                        ) : (
                          <button className="danger" onClick={() => setDeletingId(r.id)}>🗑️ Delete</button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* ---- Post Content ---- */}
                <div className="ln-post__body" onClick={() => navigate(`/reflections/${r.id}`)} style={{ cursor: 'pointer' }}>
                  {r.content.length > CONTENT_LIMIT && !expandedContent[r.id] ? (
                    <>
                      {r.content.slice(0, CONTENT_LIMIT)}...
                      <button
                        className="ln-post__see-more"
                        onClick={() => setExpandedContent(prev => ({ ...prev, [r.id]: true }))}
                      >
                        see more
                      </button>
                    </>
                  ) : (
                    <>
                      {r.content}
                      {r.content.length > CONTENT_LIMIT && (
                        <button
                          className="ln-post__see-more"
                          onClick={() => setExpandedContent(prev => ({ ...prev, [r.id]: false }))}
                        >
                          see less
                        </button>
                      )}
                    </>
                  )}
                </div>

                {/* ---- Attached Book ---- */}
                {r.book && (
                  <div className="ln-post__book-card">
                    <div className="ln-post__book-icon">📖</div>
                    <div className="ln-post__book-info">
                      <span className="ln-post__book-title">{r.book.title}</span>
                      <span className="ln-post__book-author">by {r.book.author}</span>
                    </div>
                  </div>
                )}

                {/* ---- Engagement Stats (LinkedIn-style counts) ---- */}
                {(r.likesCount > 0 || r.commentsCount > 0 || r.savesCount > 0) && (
                  <div className="ln-post__stats">
                    {r.likesCount > 0 && (
                      <span className="ln-post__stat">
                        <span className="ln-post__stat-icon like-icon">👍</span>
                        {r.likesCount}
                      </span>
                    )}
                    <div className="ln-post__stat-right">
                      {r.commentsCount > 0 && (
                        <span
                          className="ln-post__stat clickable"
                          onClick={() => toggleCommentSection(r.id)}
                        >
                          {r.commentsCount} comment{r.commentsCount !== 1 ? 's' : ''}
                        </span>
                      )}
                      {r.savesCount > 0 && (
                        <span className="ln-post__stat">{r.savesCount} save{r.savesCount !== 1 ? 's' : ''}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* ---- Action Bar (LinkedIn-style) ---- */}
                <div className="ln-post__actions">
                  <button
                    className={`ln-post__action-btn ${r.hasLiked ? 'active' : ''}`}
                    onClick={() => handleToggleLike(r)}
                  >
                    <svg viewBox="0 0 24 24" className="ln-post__action-icon">
                      <path d={r.hasLiked
                        ? "M7.24 2C4.37 2 2 4.43 2 7.35c0 5.6 6.25 10.27 10 12.65 3.75-2.38 10-7.05 10-12.65C22 4.43 19.63 2 16.76 2c-1.63 0-3.19.79-4.22 2.07L12 4.74l-.54-.67C10.43 2.79 8.87 2 7.24 2z"
                        : "M7.24 2C4.37 2 2 4.43 2 7.35c0 5.6 6.25 10.27 10 12.65 3.75-2.38 10-7.05 10-12.65C22 4.43 19.63 2 16.76 2c-1.63 0-3.19.79-4.22 2.07L12 4.74l-.54-.67C10.43 2.79 8.87 2 7.24 2zM12 18.55l-.36-.24C7.39 15.42 4 11.85 4 7.35 4 5.56 5.45 4 7.24 4c1.18 0 2.31.65 2.98 1.69L12 7.99l1.78-2.3A3.505 3.505 0 0116.76 4C18.55 4 20 5.56 20 7.35c0 4.5-3.39 8.07-7.64 10.96L12 18.55z"
                      } />
                    </svg>
                    <span>Like</span>
                  </button>
                  <button
                    className={`ln-post__action-btn ${expandedComments[r.id] ? 'active' : ''}`}
                    onClick={() => toggleCommentSection(r.id)}
                  >
                    <svg viewBox="0 0 24 24" className="ln-post__action-icon">
                      <path d="M7 9h10v1.5H7V9zm0 4h7v1.5H7V13z" />
                      <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14h-4.83L12 19.17 8.83 16H4V4h16v12z" />
                    </svg>
                    <span>Comment</span>
                  </button>
                  <button
                    className="ln-post__action-btn"
                    onClick={() => handleShare(r)}
                  >
                    <svg viewBox="0 0 24 24" className="ln-post__action-icon">
                      <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
                    </svg>
                    <span>Share</span>
                  </button>
                  <button
                    className={`ln-post__action-btn ${r.hasSaved ? 'active' : ''}`}
                    onClick={() => handleToggleSave(r)}
                  >
                    <svg viewBox="0 0 24 24" className="ln-post__action-icon">
                      <path d={r.hasSaved
                        ? "M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"
                        : "M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z"
                      } />
                    </svg>
                    <span>Save</span>
                  </button>
                </div>

                {/* ---- Threaded Comments Section ---- */}
                {expandedComments[r.id] && (
                  <div className="ln-comments">
                    {/* Top-level comment input */}
                    <ReflectionCommentInput
                      reflectionId={r.id}
                      onSubmit={(content) => handlePostComment(r.id, content)}
                    />

                    {/* Comment list */}
                    {loadingComments[r.id] && (
                      <div className="ln-comments__loading">Loading comments...</div>
                    )}
                    {(allComments[r.id] || r.recentComments || []).map(comment => (
                      <ReflectionCommentItem
                        key={comment.id}
                        comment={comment}
                        reflectionId={r.id}
                        depth={0}
                        onReply={(content, parentId) => handlePostComment(r.id, content, parentId)}
                        onDelete={(commentId, parentId) => handleDeleteComment(r.id, commentId, parentId)}
                        navigate={navigate}
                        formatDate={formatDate}
                      />
                    ))}

                    {/* Load more comments */}
                    {hasMoreComments[r.id] && (
                      <button
                        className="ln-comments__load-more"
                        onClick={() => loadComments(r.id, (commentPages[r.id] || 0) + 1, false)}
                      >
                        Load more comments
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}

            {hasMore && (
              <button className="ln-feed__load-more" onClick={loadMore}>
                Load More
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedPage;
