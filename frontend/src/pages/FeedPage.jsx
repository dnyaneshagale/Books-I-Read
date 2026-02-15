import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Trash2, Library, Lock, Globe, Search, Users, BookOpen, ThumbsUp, PenLine } from 'lucide-react';
import socialApi from '../api/socialApi';
import bookApi from '../api/bookApi';
import toast from 'react-hot-toast';

/* ── Tailwind class constants ──────────────────────────── */

// Page layout
const feedCls = [
  'feed-page',
  'min-h-screen bg-gradient-to-br from-slate-50 to-slate-100',
  'px-4 py-6 pb-20 transition-all duration-300',
  'dark:from-[#1E1B24] dark:to-[#0F0C15]',
  'md:pt-20 md:pb-10',
  'max-[640px]:px-2 max-[640px]:py-3 max-[640px]:pb-20',
].join(' ');

const containerCls = 'max-w-[620px] mx-auto animate-[g-fadeInUp_0.5s_cubic-bezier(0.16,1,0.3,1)_both] lg:max-w-[680px]';

// Composer card
const composerCardCls = [
  'bg-white rounded-2xl border border-slate-200 py-4 px-5 mb-3',
  'shadow-sm transition-all duration-300 hover:shadow-md',
  'dark:bg-[#1E1B24] dark:border-[#2D2A35]',
].join(' ');

const composerTextareaCls = [
  'w-full border border-slate-200 rounded-xl p-3.5 text-sm font-[inherit]',
  'leading-relaxed resize-y min-h-[110px] text-slate-900 bg-white',
  'box-border transition-[border-color,box-shadow] duration-200',
  'focus:outline-none focus:border-violet-700 focus:shadow-[0_0_0_3px_rgba(109,40,217,0.1)]',
  'placeholder:text-slate-400',
  'dark:bg-[#0F0C15] dark:border-[#2D2A35] dark:text-[#E2D9F3]',
  'dark:focus:border-[#7C4DFF] dark:focus:shadow-[0_0_0_3px_rgba(124,77,255,0.15)]',
  'dark:placeholder:text-[#5a5268]',
].join(' ');

const composerPostBtnCls = [
  'py-2 px-6 bg-violet-600/90',
  'text-white border-none rounded-full font-bold text-[0.88rem]',
  'cursor-pointer transition-all duration-200',
  'shadow-[0_2px_8px_rgba(109,40,217,0.15)] relative overflow-hidden',
  'enabled:hover:bg-violet-700 enabled:hover:-translate-y-px enabled:hover:shadow-[0_4px_14px_rgba(109,40,217,0.25)]',
  'disabled:opacity-40 disabled:cursor-not-allowed',
  'dark:bg-[#7C4DFF]/80 dark:hover:bg-[#7C4DFF]',
].join(' ');

// Post card
const postCls = [
  'bg-white rounded-2xl border border-slate-200 overflow-hidden',
  'shadow-sm transition-all duration-[250ms]',
  'hover:shadow-md hover:-translate-y-px',
  'dark:bg-[#1E1B24] dark:border-[#2D2A35]',
  'dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)] dark:hover:border-[#3a3642]',
].join(' ');

const postAvatarCls = [
  'w-12 h-12 rounded-full overflow-hidden shrink-0 cursor-pointer',
  'bg-gradient-to-br from-violet-700/10 to-blue-600/[0.06]',
  'transition-transform duration-200 hover:scale-105',
  'dark:from-[rgba(124,77,255,0.15)] dark:to-[rgba(149,117,255,0.08)]',
  'max-[640px]:w-10 max-[640px]:h-10',
].join(' ');

const postNameCls = [
  'font-bold text-sm text-slate-900 cursor-pointer leading-snug',
  'transition-colors duration-150 hover:text-violet-700',
  'dark:text-[#E2D9F3] dark:hover:text-[#7C4DFF]',
].join(' ');

const actionBtnBaseCls = [
  'flex-1 flex items-center justify-center gap-2 py-3 px-1',
  'border-none bg-transparent text-slate-500 text-xs font-semibold',
  'cursor-pointer rounded-lg transition-all duration-200',
  'ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.94]',
  'hover:bg-slate-100 hover:text-slate-900',
  'dark:text-[#9E95A8] dark:hover:bg-[#2D2A35] dark:hover:text-[#E2D9F3]',
  'max-[640px]:gap-0',
].join(' ');

const seeMoreCls = [
  'bg-transparent border-none text-violet-700 font-semibold text-[0.85rem]',
  'cursor-pointer p-0 ml-1 transition-opacity duration-150',
  'hover:opacity-80 hover:underline dark:text-[#7C4DFF]',
].join(' ');

// Comments
const commentInputWrapCls = [
  'flex-1 flex items-center border border-slate-200 rounded-full',
  'py-0.5 pr-1 pl-4 bg-slate-50 transition-all duration-200',
  'focus-within:border-violet-700 focus-within:bg-white',
  'focus-within:shadow-[0_0_0_3px_rgba(109,40,217,0.08)]',
  'dark:bg-[#0F0C15] dark:border-[#2D2A35]',
  'dark:focus-within:border-[#7C4DFF] dark:focus-within:bg-[#1E1B24]',
  'dark:focus-within:shadow-[0_0_0_3px_rgba(124,77,255,0.1)]',
].join(' ');

const commentInputCls = [
  'flex-1 border-none bg-transparent text-[0.85rem] py-[9px]',
  'text-slate-900 outline-none font-[inherit]',
  'placeholder:text-slate-400',
  'dark:text-[#E2D9F3] dark:placeholder:text-[#5a5268]',
].join(' ');

const commentSendBtnCls = [
  'py-[7px] px-4 bg-transparent border-none text-violet-700',
  'text-[0.82rem] font-bold cursor-pointer rounded-full',
  'transition-[background] duration-150',
  'enabled:hover:bg-violet-700/[0.08]',
  'disabled:text-slate-400 disabled:cursor-not-allowed',
  'dark:text-[#7C4DFF] dark:disabled:text-[#5a5268]',
  'dark:enabled:hover:bg-[rgba(124,77,255,0.1)]',
].join(' ');

const commentAvatarCls = [
  'w-8 h-8 rounded-full overflow-hidden shrink-0 cursor-pointer',
  'bg-gradient-to-br from-violet-700/10 to-blue-600/[0.06]',
  'flex items-center justify-center text-[0.8rem] font-bold text-violet-700',
  'dark:bg-[rgba(124,77,255,0.12)] dark:text-[#7C4DFF]',
].join(' ');

const commentBubbleCls = [
  'flex-1 bg-slate-100 rounded-tr-lg rounded-br-lg rounded-bl-lg',
  'py-2.5 px-3.5 relative min-w-0',
  'dark:bg-[#2D2A35]',
].join(' ');

const commentAuthorCls = [
  'font-semibold text-[0.82rem] text-slate-900 cursor-pointer',
  'transition-colors duration-150 hover:text-violet-700',
  'dark:text-[#E2D9F3] dark:hover:text-[#7C4DFF]',
].join(' ');

const deleteYesCls = [
  'bg-red-500 text-white border-none rounded-lg py-[3px] px-2.5',
  'text-[0.72rem] font-bold cursor-pointer transition-[background] duration-150',
  'hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500',
].join(' ');

const deleteNoCls = [
  'bg-transparent border border-slate-200 text-slate-500 rounded-lg',
  'py-[3px] px-2.5 text-[0.72rem] font-bold cursor-pointer',
  'transition-all duration-150 hover:bg-slate-100',
  'dark:border-[#2D2A35] dark:text-[#9E95A8] dark:hover:bg-[#2D2A35]',
].join(' ');

const mentionDropdownCls = [
  'absolute bottom-full left-0 right-0 max-h-[220px] overflow-y-auto',
  'bg-white border border-slate-200 rounded-xl shadow-lg z-[100] mb-1',
  'dark:bg-[#1E1B24] dark:border-[#2D2A35] dark:shadow-[0_10px_30px_rgba(0,0,0,0.4)]',
].join(' ');

const mentionAvatarCls = [
  'w-[30px] h-[30px] rounded-full overflow-hidden shrink-0',
  'bg-gradient-to-br from-violet-700/10 to-blue-600/[0.06]',
  'flex items-center justify-center text-xs font-bold text-violet-700',
  'dark:bg-[rgba(124,77,255,0.12)] dark:text-[#7C4DFF]',
].join(' ');

/* ── Sub-components ────────────────────────────────────── */

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
            className="text-violet-700 font-semibold cursor-pointer transition-opacity duration-150 hover:opacity-75 dark:text-[#7C4DFF]"
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
    <div className={`flex items-center gap-2.5 ${isReply ? 'mt-2 mb-1' : 'mb-3.5 pt-1.5'}`}>
      {!isReply && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-700/10 to-blue-600/[0.06] flex items-center justify-center shrink-0 text-[0.85rem] dark:bg-[rgba(124,77,255,0.12)]">
          <MessageCircle className="w-4 h-4" />
        </div>
      )}
      <div className="flex-1 relative">
        <div className={`${commentInputWrapCls} ${isReply ? 'py-px pr-[3px] pl-3' : ''}`}>
          <input
            ref={inputRef}
            className={commentInputCls}
            placeholder={placeholder || 'Add a comment...'}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />
          <button
            className={`${commentSendBtnCls} ${isReply ? 'text-[0.78rem] py-[5px] px-3' : ''}`}
            onClick={() => { if (text.trim()) { onSubmit(text.trim()); setText(''); } }}
            disabled={!text.trim()}
          >
            {isReply ? 'Reply' : 'Post'}
          </button>
        </div>

        {/* @Mention dropdown */}
        {showMentions && (
          <div className={mentionDropdownCls}>
            {mentionResults.map((user, idx) => (
              <div
                key={user.id || idx}
                className={`flex items-center gap-2.5 py-2.5 px-3.5 cursor-pointer transition-[background] duration-[120ms] hover:bg-violet-700/[0.04] dark:hover:bg-[rgba(124,77,255,0.08)] ${idx === activeIndex ? 'bg-violet-700/[0.04] dark:bg-[rgba(124,77,255,0.08)]' : ''}`}
                onMouseDown={(e) => { e.preventDefault(); insertMention(user.username); }}
                onMouseEnter={() => setActiveIndex(idx)}
              >
                <div className={mentionAvatarCls}>
                  {user.profilePictureUrl ? (
                    <img src={user.profilePictureUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span>{(user.displayName || user.username || 'U').charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-[0.85rem] text-slate-900 whitespace-nowrap overflow-hidden text-ellipsis dark:text-[#E2D9F3]">
                    {user.displayName || user.username}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-[#5a5268]">@{user.username}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {isReply && onCancel && (
          <button
            className="bg-transparent border-none text-slate-500 text-xs font-semibold cursor-pointer py-1 mt-1 transition-colors duration-150 hover:text-violet-700 dark:text-[#9E95A8] dark:hover:text-[#7C4DFF]"
            onClick={onCancel}
          >
            Cancel
          </button>
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

  useEffect(() => {
    if (comment.replies) setReplies(comment.replies);
  }, [comment.replies]);

  const isReply = depth > 0;
  const avatarSize = isReply ? 'w-[26px] h-[26px] text-[0.7rem]' : 'w-8 h-8 text-[0.8rem]';

  return (
    <div className={`flex gap-2.5 ${isReply ? 'py-1.5' : 'py-2'} relative`}>
      <div
        className={`${commentAvatarCls} ${avatarSize}`}
        onClick={() => navigate(`/profile/${comment.user?.username}`)}
      >
        {comment.user?.profilePictureUrl ? (
          <img src={comment.user.profilePictureUrl} alt="" className={`object-cover ${isReply ? 'w-[26px] h-[26px]' : 'w-full h-full'}`} />
        ) : (
          <span>
            {(comment.user?.displayName || comment.user?.username || 'U').charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className={commentBubbleCls}>
          <div className="flex items-center gap-2 mb-[3px]">
            <span
              className={commentAuthorCls}
              onClick={() => navigate(`/profile/${comment.user?.username}`)}
            >
              {comment.user?.displayName || comment.user?.username}
            </span>
            <span className="text-[0.72rem] text-slate-400 dark:text-[#7a7181]">
              {formatDate(comment.createdAt)}
            </span>
          </div>
          <div className="text-[0.85rem] text-slate-900 leading-normal break-words dark:text-[#E2D9F3]">
            <CommentMentionText content={comment.content} navigate={navigate} />
          </div>
        </div>

        {/* Actions: Reply / Delete */}
        <div className="flex gap-3 mt-1 items-center">
          {depth < maxDepth && (
            <button
              className="bg-transparent border-none text-xs font-bold text-slate-400 cursor-pointer py-0.5 transition-colors duration-150 hover:text-violet-700 dark:text-[#5a5268] dark:hover:text-[#7C4DFF]"
              onClick={() => setShowReplyInput(!showReplyInput)}
            >
              Reply
            </button>
          )}
          {confirmingDelete ? (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-red-500 dark:text-red-400">Delete?</span>
              <button
                className={deleteYesCls}
                onClick={() => { onDelete(comment.id, comment.parentId || null); setConfirmingDelete(false); }}
              >
                Yes
              </button>
              <button
                className={deleteNoCls}
                onClick={() => setConfirmingDelete(false)}
              >
                No
              </button>
            </div>
          ) : (
            <button
              className="bg-transparent border-none text-slate-400 text-xs font-semibold cursor-pointer py-0.5 transition-colors duration-150 hover:text-red-500 dark:text-[#7a7181] dark:hover:text-red-400"
              onClick={() => setConfirmingDelete(true)}
            >
              <Trash2 className="w-3.5 h-3.5 inline mr-1" /> Delete
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
          <button
            className="bg-transparent border-none text-[0.78rem] font-bold text-slate-400 cursor-pointer py-1.5 pb-0.5 transition-colors duration-150 hover:text-violet-700 dark:text-[#5a5268] dark:hover:text-[#7C4DFF]"
            onClick={handleToggleReplies}
          >
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
          <div className="mt-1 pl-3 border-l-2 border-slate-200 ml-1 dark:border-[#2D2A35]">
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

/* ── Main Component ────────────────────────────────────── */

/**
 * FeedPage — LinkedIn-style reflections feed
 * Features: Like, Comment, Share, Save, Book linking, Following/Everyone tabs
 */
const FeedPage = () => {
  const [activeTab, setActiveTab] = useState('following');
  const [sortMode, setSortMode] = useState('relevant');
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

  // Comment sections
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

  // Real-time debounced search
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

  const handleToggleLike = async (reflection) => {
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
      setReflections(prev =>
        prev.map(r => r.id === reflection.id
          ? { ...r, hasLiked: wasLiked, likesCount: wasLiked ? r.likesCount + 1 : r.likesCount - 1 }
          : r)
      );
      toast.error('Failed to update like');
    }
  };

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

  const toggleCommentSection = (reflectionId) => {
    setExpandedComments(prev => ({ ...prev, [reflectionId]: !prev[reflectionId] }));
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
        setAllComments(prev => ({
          ...prev,
          [reflectionId]: [...(prev[reflectionId] || []), res.data],
        }));
      }
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

  const handleShare = (reflection) => {
    const url = `${window.location.origin}/reflections/${reflection.id}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Link copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy link');
    });
  };

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
    <div className={feedCls}>
      <div className={containerCls}>

        {/* ---- Back Button ---- */}
        <button className="page-back-btn" onClick={() => navigate(-1)}>← Back</button>

        {/* ---- Composer Card ---- */}
        <div className={composerCardCls}>
          <div className="flex items-center gap-3.5 cursor-pointer group" onClick={() => setShowComposer(!showComposer)}>
            <div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-700/10 to-blue-600/[0.08] flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 dark:from-[rgba(124,77,255,0.15)] dark:to-[rgba(149,117,255,0.08)] max-[640px]:w-10 max-[640px]:h-10">
                <PenLine className="w-5 h-5 text-violet-700 dark:text-[#7C4DFF]" strokeWidth={2} />
              </div>
            </div>
            <div className="flex-1 py-3 px-5 border border-slate-200 rounded-full text-slate-500 text-sm transition-all duration-200 hover:bg-slate-100 hover:border-violet-700 dark:border-[#2D2A35] dark:text-[#9E95A8] dark:hover:bg-[#2D2A35] dark:hover:border-[#7C4DFF]">
              Share a reading insight or reflection...
            </div>
          </div>

          {showComposer && (
            <div className="mt-3.5 animate-[ln-fadeIn_0.25s_ease]">
              <textarea
                ref={textareaRef}
                className={composerTextareaCls}
                placeholder="What's on your mind about what you're reading?"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                maxLength={2000}
                rows={4}
              />

              <div className="mt-3">
                <div className="flex gap-2.5 flex-wrap mb-3 max-[640px]:flex-col">
                  <select
                    className="flex-1 min-w-[170px] py-2 px-3 border border-slate-200 rounded-lg text-[0.83rem] text-slate-900 bg-white cursor-pointer transition-[border-color] duration-200 focus:border-violet-700 focus:outline-none dark:bg-[#0F0C15] dark:border-[#2D2A35] dark:text-[#E2D9F3]"
                    value={newBookId}
                    onChange={(e) => setNewBookId(e.target.value)}
                  >
                    <option value=""><Library className="w-3.5 h-3.5 inline mr-1" /> Link a book</option>
                    {myBooks.map(book => (
                      <option key={book.id} value={book.id}>
                        {book.title} — {book.author}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    className={`py-2 px-4 rounded-full border text-[0.82rem] font-semibold cursor-pointer transition-all duration-200 whitespace-nowrap ${
                      newPrivacy
                        ? 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30'
                        : 'bg-green-100 text-green-600 border-green-300 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30'
                    }`}
                    onClick={() => setNewPrivacy(!newPrivacy)}
                  >
                    {newPrivacy ? <><Lock className="w-3.5 h-3.5 inline mr-1" />Followers</> : <><Globe className="w-3.5 h-3.5 inline mr-1" />Anyone</>}
                  </button>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">{newContent.length}/2000</span>
                  <button
                    className={composerPostBtnCls}
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
        <div className="flex items-center gap-2.5 bg-white border border-slate-200 rounded-2xl px-4 py-2.5 mb-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-[border-color,box-shadow] duration-200 focus-within:border-violet-600 focus-within:shadow-[0_0_0_3px_rgba(124,58,237,0.1)] dark:bg-[#1a1625] dark:border-[#2D2640] dark:focus-within:border-violet-400 dark:focus-within:shadow-[0_0_0_3px_rgba(167,139,250,0.15)]">
          <svg className="text-slate-400 shrink-0" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input
            type="text"
            className="flex-1 border-none outline-none bg-transparent text-[0.95rem] text-slate-900 font-[inherit] placeholder:text-slate-400 dark:text-[#E2D9F3]"
            placeholder="Search reflections by content, book, user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="bg-transparent border-none cursor-pointer text-slate-400 text-base py-0.5 px-1.5 rounded-full transition-[background,color] duration-150 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-[#2D2640] dark:hover:text-[#E2D9F3]"
              onClick={() => setSearchQuery('')}
            >
              ✕
            </button>
          )}
        </div>

        {/* ---- Tabs + Sort ---- */}
        <div className="flex items-center gap-2.5 mb-3 max-[640px]:flex-col max-[640px]:gap-2">
          <div className="flex relative flex-1 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:bg-[#1E1B24] dark:border-[#2D2A35] max-[640px]:w-full">
            <button
              className={`flex-1 py-3 border-none bg-transparent text-sm font-semibold cursor-pointer relative z-[1] transition-colors duration-200 max-[640px]:text-xs max-[640px]:py-2.5 ${activeTab === 'following' ? 'text-violet-700 dark:text-[#7C4DFF]' : 'text-slate-500 hover:text-violet-700 dark:text-[#9E95A8] dark:hover:text-[#7C4DFF]'}`}
              onClick={() => handleTabChange('following')}
            >
              Following
            </button>
            <button
              className={`flex-1 py-3 border-none bg-transparent text-sm font-semibold cursor-pointer relative z-[1] transition-colors duration-200 max-[640px]:text-xs max-[640px]:py-2.5 ${activeTab === 'everyone' ? 'text-violet-700 dark:text-[#7C4DFF]' : 'text-slate-500 hover:text-violet-700 dark:text-[#9E95A8] dark:hover:text-[#7C4DFF]'}`}
              onClick={() => handleTabChange('everyone')}
            >
              Everyone
            </button>
            <div
              className="absolute bottom-0 left-0 w-1/2 h-[3px] bg-gradient-to-r from-violet-700 to-violet-600 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] rounded-t dark:from-[#7C4DFF] dark:to-[#9575FF]"
              style={{ transform: activeTab === 'everyone' ? 'translateX(100%)' : 'translateX(0)' }}
            />
          </div>
          <div className="flex bg-white border border-slate-200 rounded-[10px] overflow-hidden shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:bg-[#1E1B24] dark:border-[#2D2A35] max-[640px]:w-full">
            <button
              className={`flex items-center justify-center gap-1 py-2 px-3 border-none text-xs font-semibold cursor-pointer transition-all duration-200 whitespace-nowrap max-[640px]:flex-1 max-[640px]:px-2 ${sortMode === 'relevant' ? 'bg-violet-700 text-white dark:bg-[#7C4DFF]' : 'bg-transparent text-slate-500 hover:bg-violet-700/[0.08] hover:text-violet-700 dark:text-[#9E95A8] dark:hover:bg-[rgba(124,77,255,0.12)] dark:hover:text-[#7C4DFF]'}`}
              onClick={() => setSortMode('relevant')}
              title="Show most relevant first"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
              Top
            </button>
            <button
              className={`flex items-center justify-center gap-1 py-2 px-3 border-none text-xs font-semibold cursor-pointer transition-all duration-200 whitespace-nowrap max-[640px]:flex-1 max-[640px]:px-2 ${sortMode === 'recent' ? 'bg-violet-700 text-white dark:bg-[#7C4DFF]' : 'bg-transparent text-slate-500 hover:bg-violet-700/[0.08] hover:text-violet-700 dark:text-[#9E95A8] dark:hover:bg-[rgba(124,77,255,0.12)] dark:hover:text-[#7C4DFF]'}`}
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
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton-card animate-[g-fadeIn_0.4s_ease_both]" style={{ animationDelay: `${(i - 1) * 80}ms` }}>
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
          <div className="text-center py-[72px] px-8 bg-white rounded-2xl border border-slate-200 shadow-sm animate-[g-fadeInUp_0.4s_cubic-bezier(0.16,1,0.3,1)_both] dark:bg-[#1E1B24] dark:border-[#2D2A35]">
            <div className="flex items-center justify-center mb-3 text-slate-400 dark:text-[#9E95A8]">
              {isSearching ? <Search className="w-14 h-14" /> : activeTab === 'following' ? <Users className="w-14 h-14" /> : <Globe className="w-14 h-14" />}
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-0 mb-2 dark:text-[#E2D9F3]">
              {isSearching ? 'No reflections found' : activeTab === 'following' ? 'No reflections from your network yet' : 'No reflections to show'}
            </h3>
            <p className="text-slate-500 mt-0 mb-6 text-sm dark:text-[#9E95A8]">
              {isSearching
                ? `No results for "${searchQuery}". Try a different search.`
                : activeTab === 'following'
                ? 'Follow some readers or share the first reflection!'
                : 'Be the first to share a reflection with the community!'}
            </p>
            {!isSearching && activeTab === 'following' && (
              <button
                className="py-2.5 px-6 bg-violet-600/90 text-white border-none rounded-full font-bold text-sm cursor-pointer shadow-[0_2px_8px_rgba(109,40,217,0.15)] transition-all duration-200 hover:bg-violet-700 hover:-translate-y-0.5 hover:shadow-[0_4px_14px_rgba(109,40,217,0.25)] dark:bg-[#7C4DFF]/80 dark:hover:bg-[#7C4DFF]"
                onClick={() => navigate('/discover')}
              >
                Discover Readers
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3 stagger-children" key={activeTab + sortMode}>
            {reflections.map((r) => (
              <div key={r.id} className={postCls}>
                {/* ---- Post Header ---- */}
                <div className="flex items-start gap-3 px-5 pt-4 max-[640px]:px-3.5 max-[640px]:pt-3">
                  <div
                    className={postAvatarCls}
                    onClick={() => navigate(`/profile/${r.user?.username}`)}
                  >
                    {r.user?.profilePictureUrl ? (
                      <img src={r.user.profilePictureUrl} alt="" className="w-full h-full object-cover animate-[g-fadeIn_0.3s_ease_both]" />
                    ) : (
                      <span className="w-full h-full flex items-center justify-center text-xl font-bold text-violet-700 bg-gradient-to-br from-violet-700/[0.12] to-blue-600/[0.08] dark:from-[rgba(124,77,255,0.2)] dark:to-[rgba(149,117,255,0.1)] dark:text-[#7C4DFF]">
                        {(r.user?.displayName || r.user?.username || 'U').charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <span
                      className={postNameCls}
                      onClick={() => navigate(`/profile/${r.user?.username}`)}
                    >
                      {r.user?.displayName || r.user?.username}
                    </span>
                    <span className="text-xs text-slate-500 leading-snug dark:text-[#9E95A8]">@{r.user?.username}</span>
                    <span className="text-xs text-slate-400 leading-snug dark:text-[#7a7181]">
                      {formatDate(r.createdAt)}
                      {r.visibleToFollowersOnly && <span className="text-[0.7rem]" title="Followers only"> <Lock className="w-3 h-3 inline" /></span>}
                    </span>
                  </div>

                  {/* Three-dot menu */}
                  <div className="relative shrink-0">
                    <button
                      className="bg-transparent border-none text-xl leading-none text-slate-500 cursor-pointer py-1.5 px-2 rounded-full transition-all duration-150 hover:bg-slate-100 hover:text-slate-900 dark:text-[#9E95A8] dark:hover:bg-[#2D2A35] dark:hover:text-[#E2D9F3]"
                      onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === r.id ? null : r.id); }}
                    >
                      ⋯
                    </button>
                    {openMenuId === r.id && (
                      <div
                        className="absolute right-0 top-full bg-white border border-slate-200 rounded-xl shadow-lg min-w-[200px] z-[100] overflow-hidden animate-[ln-fadeIn_0.15s_ease] dark:bg-[#1E1B24] dark:border-[#2D2A35] dark:shadow-[0_12px_40px_rgba(0,0,0,0.5)]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className="block w-full py-3 px-[18px] border-none bg-transparent text-sm text-slate-900 cursor-pointer text-left transition-[background] duration-150 hover:bg-slate-100 dark:text-[#E2D9F3] dark:hover:bg-[#2D2A35]"
                          onClick={() => handleTogglePrivacy(r)}
                        >
                          {r.visibleToFollowersOnly ? <><Globe className="w-3.5 h-3.5 inline mr-1" />Make public</> : <><Lock className="w-3.5 h-3.5 inline mr-1" />Followers only</>}
                        </button>
                        {deletingId === r.id ? (
                          <div className="flex gap-1.5 py-2 px-3.5">
                            <button
                              className="py-[7px] px-4 rounded-lg text-[0.82rem] font-semibold bg-red-500 text-white border-none cursor-pointer"
                              onClick={() => handleDelete(r.id)}
                            >
                              Confirm delete
                            </button>
                            <button
                              className="py-[7px] px-4 rounded-lg text-[0.82rem] font-semibold bg-transparent border-none text-slate-900 cursor-pointer dark:text-[#E2D9F3]"
                              onClick={() => setDeletingId(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            className="block w-full py-3 px-[18px] border-none bg-transparent text-sm text-red-500 cursor-pointer text-left transition-[background] duration-150 hover:bg-slate-100 dark:text-red-400 dark:hover:bg-[#2D2A35]"
                            onClick={() => setDeletingId(r.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5 inline mr-1" /> Delete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* ---- Post Content ---- */}
                <div
                  className="py-3.5 px-5 text-sm leading-relaxed text-slate-900 whitespace-pre-wrap break-words cursor-pointer dark:text-[#E2D9F3] max-[640px]:px-3.5 max-[640px]:py-3"
                  onClick={() => navigate(`/reflections/${r.id}`)}
                >
                  {r.content.length > CONTENT_LIMIT && !expandedContent[r.id] ? (
                    <>
                      {r.content.slice(0, CONTENT_LIMIT)}...
                      <button
                        className={seeMoreCls}
                        onClick={(e) => { e.stopPropagation(); setExpandedContent(prev => ({ ...prev, [r.id]: true })); }}
                      >
                        see more
                      </button>
                    </>
                  ) : (
                    <>
                      {r.content}
                      {r.content.length > CONTENT_LIMIT && (
                        <button
                          className={seeMoreCls}
                          onClick={(e) => { e.stopPropagation(); setExpandedContent(prev => ({ ...prev, [r.id]: false })); }}
                        >
                          see less
                        </button>
                      )}
                    </>
                  )}
                </div>

                {/* ---- Attached Book ---- */}
                {r.book && (
                  <div className="flex items-center gap-3.5 mx-5 mb-3.5 py-3.5 px-4 bg-gradient-to-br from-violet-700/[0.04] to-blue-600/[0.03] border border-slate-200 rounded-xl transition-all duration-200 hover:from-violet-700/[0.08] hover:to-blue-600/[0.05] hover:border-violet-700/20 dark:from-[rgba(124,77,255,0.06)] dark:border-[#2D2A35] dark:hover:from-[rgba(124,77,255,0.1)] dark:hover:border-[rgba(124,77,255,0.2)] max-[640px]:mx-3.5 max-[640px]:mb-3">
                    <div className="text-[1.6rem] shrink-0"><BookOpen className="w-6 h-6" /></div>
                    <div className="flex flex-col gap-[3px] min-w-0">
                      <span className="font-semibold text-sm text-slate-900 overflow-hidden text-ellipsis whitespace-nowrap dark:text-[#E2D9F3]">{r.book.title}</span>
                      <span className="text-xs text-slate-500 dark:text-[#9E95A8]">by {r.book.author}</span>
                    </div>
                  </div>
                )}

                {/* ---- Engagement Stats (LinkedIn-style counts) ---- */}
                {(r.likesCount > 0 || r.commentsCount > 0 || r.savesCount > 0) && (
                  <div className="flex items-center justify-between px-5 py-2.5 border-t border-slate-200 text-xs text-slate-500 dark:border-[#2D2A35] dark:text-[#9E95A8] max-[640px]:px-3.5 max-[640px]:py-2">
                    {r.likesCount > 0 && (
                      <span className="inline-flex items-center gap-1">
                        <span className="inline-flex items-center justify-center w-[18px] h-[18px] bg-gradient-to-br from-violet-700 to-violet-600 rounded-full text-[0.6rem] leading-none"><ThumbsUp className="w-2.5 h-2.5 text-white" /></span>
                        {r.likesCount}
                      </span>
                    )}
                    <div className="flex gap-3.5">
                      {r.commentsCount > 0 && (
                        <span
                          className="inline-flex items-center gap-1 cursor-pointer transition-colors duration-150 hover:text-violet-700 dark:hover:text-[#7C4DFF]"
                          onClick={() => toggleCommentSection(r.id)}
                        >
                          {r.commentsCount} comment{r.commentsCount !== 1 ? 's' : ''}
                        </span>
                      )}
                      {r.savesCount > 0 && (
                        <span className="inline-flex items-center gap-1">{r.savesCount} save{r.savesCount !== 1 ? 's' : ''}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* ---- Action Bar (LinkedIn-style) ---- */}
                <div className="flex border-t border-slate-200 px-3 py-1 dark:border-[#2D2A35] max-[640px]:px-1.5 max-[640px]:py-0.5">
                  <button
                    className={`${actionBtnBaseCls} ${r.hasLiked ? '!text-violet-700 dark:!text-[#7C4DFF]' : ''}`}
                    onClick={() => handleToggleLike(r)}
                  >
                    <svg viewBox="0 0 24 24" className={`w-5 h-5 fill-current max-[640px]:w-6 max-[640px]:h-6 ${r.hasLiked ? 'animate-[g-heartPop_0.4s_cubic-bezier(0.16,1,0.3,1)]' : ''}`}>
                      <path d={r.hasLiked
                        ? "M7.24 2C4.37 2 2 4.43 2 7.35c0 5.6 6.25 10.27 10 12.65 3.75-2.38 10-7.05 10-12.65C22 4.43 19.63 2 16.76 2c-1.63 0-3.19.79-4.22 2.07L12 4.74l-.54-.67C10.43 2.79 8.87 2 7.24 2z"
                        : "M7.24 2C4.37 2 2 4.43 2 7.35c0 5.6 6.25 10.27 10 12.65 3.75-2.38 10-7.05 10-12.65C22 4.43 19.63 2 16.76 2c-1.63 0-3.19.79-4.22 2.07L12 4.74l-.54-.67C10.43 2.79 8.87 2 7.24 2zM12 18.55l-.36-.24C7.39 15.42 4 11.85 4 7.35 4 5.56 5.45 4 7.24 4c1.18 0 2.31.65 2.98 1.69L12 7.99l1.78-2.3A3.505 3.505 0 0116.76 4C18.55 4 20 5.56 20 7.35c0 4.5-3.39 8.07-7.64 10.96L12 18.55z"
                      } />
                    </svg>
                    <span className="max-[640px]:hidden">Like</span>
                  </button>
                  <button
                    className={`${actionBtnBaseCls} ${expandedComments[r.id] ? '!text-violet-700 dark:!text-[#7C4DFF]' : ''}`}
                    onClick={() => toggleCommentSection(r.id)}
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current max-[640px]:w-6 max-[640px]:h-6">
                      <path d="M7 9h10v1.5H7V9zm0 4h7v1.5H7V13z" />
                      <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14h-4.83L12 19.17 8.83 16H4V4h16v12z" />
                    </svg>
                    <span className="max-[640px]:hidden">Comment</span>
                  </button>
                  <button
                    className={actionBtnBaseCls}
                    onClick={() => handleShare(r)}
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current max-[640px]:w-6 max-[640px]:h-6">
                      <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
                    </svg>
                    <span className="max-[640px]:hidden">Share</span>
                  </button>
                  <button
                    className={`${actionBtnBaseCls} ${r.hasSaved ? '!text-violet-700 dark:!text-[#7C4DFF]' : ''}`}
                    onClick={() => handleToggleSave(r)}
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current max-[640px]:w-6 max-[640px]:h-6">
                      <path d={r.hasSaved
                        ? "M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"
                        : "M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z"
                      } />
                    </svg>
                    <span className="max-[640px]:hidden">Save</span>
                  </button>
                </div>

                {/* ---- Threaded Comments Section ---- */}
                {expandedComments[r.id] && (
                  <div className="px-5 pb-3.5 animate-[g-contentFade_0.3s_cubic-bezier(0.16,1,0.3,1)_both] max-[640px]:px-3.5 max-[640px]:pb-3">
                    {/* Top-level comment input */}
                    <ReflectionCommentInput
                      reflectionId={r.id}
                      onSubmit={(content) => handlePostComment(r.id, content)}
                    />

                    {/* Comment list */}
                    {loadingComments[r.id] && (
                      <div className="text-center py-3.5 text-slate-400 text-[0.82rem]">Loading comments...</div>
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
                        className="bg-transparent border-none text-violet-700 text-[0.82rem] font-semibold cursor-pointer py-2 transition-opacity duration-150 hover:opacity-80 hover:underline dark:text-[#7C4DFF]"
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
              <button
                className="block w-full py-3.5 mt-1.5 bg-white border border-slate-200 rounded-2xl text-violet-700 text-sm font-bold cursor-pointer transition-all duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:bg-slate-100 hover:border-violet-700 hover:shadow-sm dark:bg-[#1E1B24] dark:border-[#2D2A35] dark:text-[#7C4DFF] dark:hover:bg-[#2D2A35] dark:hover:border-[#7C4DFF]"
                onClick={loadMore}
              >
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
