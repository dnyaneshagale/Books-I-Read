import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { Lock } from 'lucide-react';
import { useAuth } from '../AuthContext';
import socialApi from '../api/socialApi';
import {
  addReplyToCache,
  addTopLevelCommentToCache,
  reflectionCommentKeys,
  removeCommentFromCache,
  updateReflectionCaches,
  updateReflectionCommentCountCaches,
} from '../reflectionCommentCache';
import { fetchUserSearchResults, userSearchQueryKeys, USER_SEARCH_STALE_TIME_MS } from '../userSearchQuery';
import toast from 'react-hot-toast';

// â”€â”€ Tailwind class constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const shimmerCls = [
  'bg-[linear-gradient(90deg,#e2e8f0_25%,#f1f5f9_50%,#e2e8f0_75%)]',
  'bg-[length:200%_100%] animate-[rvd-shimmer_1.5s_ease-in-out_infinite]',
  'dark:bg-[linear-gradient(90deg,var(--color-border)_25%,var(--color-border-light)_50%,var(--color-border)_75%)]',
  'dark:bg-[length:200%_100%]',
].join(' ');

const pageCls = [
  'min-h-screen bg-gradient-to-br from-slate-50 to-slate-100',
  'p-6 px-4 pb-[calc(80px+env(safe-area-inset-bottom,0px))] transition-[background] duration-300',
  'md:pt-20 md:pb-6 dark:from-[var(--color-bg-secondary)] dark:to-[var(--color-bg)]',
  'max-[480px]:p-3 max-[480px]:px-2 max-[480px]:pb-[calc(80px+env(safe-area-inset-bottom,0px))]',
].join(' ');

const containerCls = 'max-w-[680px] mx-auto animate-[g-fadeInUp_0.5s_cubic-bezier(0.16,1,0.3,1)_both] lg:max-w-[740px]';

const actionIconCls = 'w-5 h-5 fill-current transition-transform duration-150';

const actionBtnBase = [
  'flex-1 flex items-center justify-center gap-2 py-3 px-1',
  'border-none bg-transparent text-slate-500 text-xs font-semibold',
  'cursor-pointer rounded-lg transition-all duration-200',
  'hover:bg-slate-100 hover:text-slate-900',
  'dark:text-[var(--color-text-secondary)] dark:hover:bg-[var(--color-border)] dark:hover:text-[var(--color-text-primary)]',
  'max-[480px]:[&>span]:hidden',
].join(' ');

const commentInputBase = [
  'w-full border border-slate-200 outline-none box-border',
  'transition-[border-color,box-shadow] duration-200',
  'bg-slate-50 text-slate-900',
  'focus:border-violet-700 focus:shadow-[0_0_0_3px_rgba(109,40,217,0.08)]',
  'dark:bg-[var(--color-border)] dark:border-[var(--color-border-light)] dark:text-[var(--color-text-primary)]',
  'dark:focus:border-[var(--color-primary)] dark:focus:shadow-[0_0_0_3px_rgba(124,77,255,0.12)]',
].join(' ');

const mentionDropdownCls = [
  'absolute bottom-full left-0 right-0 mb-1 z-[100]',
  'bg-white border border-slate-200 rounded-xl',
  'shadow-[0_10px_40px_rgba(15,23,42,0.12)] max-h-[200px] overflow-y-auto',
  'animate-[rvd-fadeIn_0.15s_ease]',
  'dark:bg-[var(--color-bg-secondary)] dark:border-[var(--color-border)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)]',
].join(' ');

const mentionAvatarCls = [
  'w-8 h-8 rounded-full bg-gradient-to-br from-violet-700 to-violet-500',
  'text-white flex items-center justify-center text-[0.8rem] font-bold',
  'overflow-hidden shrink-0',
].join(' ');

const commentAvatarCls = [
  'w-8 h-8 rounded-full bg-gradient-to-br from-violet-700 to-violet-500',
  'text-white flex items-center justify-center text-[0.78rem] font-bold',
  'cursor-pointer overflow-hidden shrink-0',
  'transition-transform duration-150 hover:scale-[1.08]',
].join(' ');

const commentBubbleCls = 'bg-slate-50 rounded-xl py-2 px-3 flex-1 min-w-0 dark:bg-[var(--color-border)]';

const commentAuthorCls = [
  'font-bold text-[0.82rem] text-slate-900 cursor-pointer',
  'transition-colors duration-150 hover:text-violet-700',
  'dark:text-[var(--color-text-primary)] dark:hover:text-[var(--color-primary)]',
].join(' ');

const metaBtnCls = [
  'bg-transparent border-none cursor-pointer text-xs font-bold',
  'text-slate-500 p-0 transition-colors duration-150',
  'hover:text-violet-700 dark:text-[var(--color-text-secondary)] dark:hover:text-[var(--color-primary)]',
].join(' ');

const deleteYesCls = [
  'bg-red-500 border-none text-white font-bold cursor-pointer',
  'text-[0.72rem] py-[3px] px-2.5 rounded-lg',
  'transition-colors duration-150 hover:bg-red-600',
].join(' ');

const deleteNoCls = [
  'bg-transparent border border-slate-200 text-slate-500 font-semibold',
  'cursor-pointer text-[0.72rem] py-[3px] px-2.5 rounded-lg',
  'transition-all duration-150 hover:border-violet-700 hover:text-violet-700',
  'dark:border-[var(--color-border)] dark:text-[var(--color-text-secondary)]',
  'dark:hover:border-[var(--color-primary)] dark:hover:text-[var(--color-primary)]',
].join(' ');

const loadMoreCls = [
  'block w-full p-2.5 mt-3 bg-transparent',
  'border border-slate-200 rounded-lg text-violet-700',
  'text-[0.85rem] font-semibold cursor-pointer transition-all duration-200',
  'hover:bg-violet-700/[0.04] hover:border-violet-700',
  'disabled:opacity-60 disabled:cursor-default',
  'dark:border-[var(--color-border)] dark:text-[var(--color-primary)]',
  'dark:hover:bg-[rgba(124,77,255,0.08)] dark:hover:border-[var(--color-primary)]',
].join(' ');

const ownerDangerBtnCls = [
  'inline-flex items-center gap-1.5 bg-transparent',
  'border border-slate-200 cursor-pointer py-2 px-3.5 rounded-lg',
  'text-[0.82rem] font-semibold text-slate-500 transition-all duration-200',
  'hover:bg-red-500/[0.06] hover:border-red-500/30 hover:text-red-500',
  'dark:border-[var(--color-border)] dark:text-[var(--color-text-secondary)]',
  'dark:hover:bg-red-500/[0.08] dark:hover:border-red-500/30 dark:hover:text-red-400',
].join(' ');

// ============================================
// Helpers
// ============================================

/** Relative time â€” "just now", "2h", "3d", "Jan 4" */
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
  <svg viewBox="0 0 24 24" className={actionIconCls}>
    <path d={filled
      ? "M7.24 2C4.37 2 2 4.43 2 7.35c0 5.6 6.25 10.27 10 12.65 3.75-2.38 10-7.05 10-12.65C22 4.43 19.63 2 16.76 2c-1.63 0-3.19.79-4.22 2.07L12 4.74l-.54-.67C10.43 2.79 8.87 2 7.24 2z"
      : "M7.24 2C4.37 2 2 4.43 2 7.35c0 5.6 6.25 10.27 10 12.65 3.75-2.38 10-7.05 10-12.65C22 4.43 19.63 2 16.76 2c-1.63 0-3.19.79-4.22 2.07L12 4.74l-.54-.67C10.43 2.79 8.87 2 7.24 2zM12 18.55l-.36-.24C7.39 15.42 4 11.85 4 7.35 4 5.56 5.45 4 7.24 4c1.18 0 2.31.65 2.98 1.69L12 7.99l1.78-2.3A3.505 3.505 0 0116.76 4C18.55 4 20 5.56 20 7.35c0 4.5-3.39 8.07-7.64 10.96L12 18.55z"
    } />
  </svg>
);

const CommentIcon = () => (
  <svg viewBox="0 0 24 24" className={actionIconCls}>
    <path d="M7 9h10v1.5H7V9zm0 4h7v1.5H7V13z" />
    <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14h-4.83L12 19.17 8.83 16H4V4h16v12z" />
  </svg>
);

const ShareIcon = () => (
  <svg viewBox="0 0 24 24" className={actionIconCls}>
    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
  </svg>
);

const BookmarkIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" className={actionIconCls}>
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
  <div className={pageCls}>
    <div className={containerCls}>
      <div className={`w-[72px] h-8 rounded-lg mb-4 ${shimmerCls}`} />
      <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-md dark:bg-[var(--color-bg-secondary)] dark:border-[var(--color-border)]">
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-12 h-12 rounded-full shrink-0 ${shimmerCls}`} />
          <div className="flex-1 flex flex-col gap-2">
            <div className={`w-[140px] h-3.5 rounded-md ${shimmerCls}`} />
            <div className={`w-[90px] h-2.5 rounded-md ${shimmerCls}`} />
          </div>
        </div>
        <div className="flex flex-col gap-2.5 mb-6">
          <div className={`w-full h-3 rounded-md ${shimmerCls}`} />
          <div className={`w-full h-3 rounded-md ${shimmerCls}`} />
          <div className={`w-3/5 h-3 rounded-md ${shimmerCls}`} />
        </div>
        <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-[var(--color-border)]">
          <div className={`flex-1 h-9 rounded-lg ${shimmerCls}`} />
          <div className={`flex-1 h-9 rounded-lg ${shimmerCls}`} />
          <div className={`flex-1 h-9 rounded-lg ${shimmerCls}`} />
          <div className={`flex-1 h-9 rounded-lg ${shimmerCls}`} />
        </div>
      </div>
    </div>
  </div>
);

// ============================================
// Sub-components (shared comment logic)
// ============================================

/**
 * CommentMentionText â€” Renders @mentions as clickable purple links
 */
const CommentMentionText = ({ content, navigate }) => {
  const parts = content.split(/(@\w+)/g);
  return (
    <>
      {parts.map((part, i) =>
        /^@\w+$/.test(part) ? (
          <span
            key={i}
            className="text-violet-700 font-semibold cursor-pointer transition-opacity duration-150 hover:underline hover:opacity-85 dark:text-[var(--color-primary)]"
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
 * ReflectionCommentInput â€” Input with @mention autocomplete dropdown
 */
const ReflectionCommentInput = ({ onSubmit, placeholder, initialValue = '', isReply = false, onCancel }) => {
  const [text, setText] = useState(initialValue);
  const [mentionResults, setMentionResults] = useState([]);
  const [showMentions, setShowMentions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);
  const queryClient = useQueryClient();

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
            const users = await queryClient.fetchQuery({
              queryKey: userSearchQueryKeys.list(query, 0, 6),
              queryFn: () => fetchUserSearchResults({ query, page: 0, size: 6 }),
              staleTime: USER_SEARCH_STALE_TIME_MS,
            });
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
    <div className="relative mb-4">
      <input
        ref={inputRef}
        type="text"
        className={`${commentInputBase} ${isReply ? 'rounded-lg py-2 px-3 text-[0.82rem]' : 'rounded-full py-2.5 px-3.5 text-[0.88rem]'}`}
        placeholder={placeholder || 'Add a comment...'}
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      {isReply && onCancel && (
        <button
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-[0.9rem] text-slate-400 p-1 transition-colors duration-150 hover:text-red-500"
          onClick={onCancel}
        >
          âœ•
        </button>
      )}
      {showMentions && mentionResults.length > 0 && (
        <div className={mentionDropdownCls}>
          {mentionResults.map((u, idx) => (
            <div
              key={u.id || u.username}
              className={`flex items-center gap-2.5 py-2 px-3 cursor-pointer transition-colors duration-150 hover:bg-violet-700/[0.06] dark:hover:bg-[rgba(124,77,255,0.1)] ${idx === activeIndex ? 'bg-violet-700/[0.06] dark:bg-[rgba(124,77,255,0.1)]' : ''}`}
              onClick={() => insertMention(u.username)}
            >
              <span className={mentionAvatarCls}>
                {u.profilePictureUrl
                  ? <img src={u.profilePictureUrl} alt="" className="w-full h-full object-cover" />
                  : (u.displayName || u.username || '?').charAt(0).toUpperCase()
                }
              </span>
              <span className="flex flex-col">
                <span className="text-[0.82rem] font-semibold text-slate-900 dark:text-[var(--color-text-primary)]">{u.displayName || u.username}</span>
                <span className="text-xs text-slate-400">@{u.username}</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * ReflectionCommentItem â€” Single comment with threaded replies (recursive)
 */
const ReflectionCommentItem = ({ comment, reflectionId, depth, onReply, onDelete, navigate }) => {
  const [showReplies, setShowReplies] = useState(false);
  const [replyingTo, setReplyingTo] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const repliesQuery = useQuery({
    queryKey: reflectionCommentKeys.replies(comment.id),
    queryFn: async () => {
      const res = await socialApi.getReflectionCommentReplies(comment.id);
      return res.data || [];
    },
    enabled: showReplies && (comment.replyCount > 0 || (comment.replies || []).length > 0),
    staleTime: 1000 * 60 * 5,
  });

  const replies = repliesQuery.data || comment.replies || [];
  const loadingReplies = repliesQuery.isLoading;

  const handleToggleReplies = () => {
    setShowReplies(!showReplies);
  };

  const handleReplySubmit = async (text) => {
    await onReply(text, comment.id);
    setShowReplies(true);
    setReplyingTo(false);
  };

  const handleDeleteComment = async () => {
    try {
      await socialApi.deleteReflectionComment(comment.id);
      onDelete(comment.id, comment.parentId || null);
    } catch {
      toast.error('Failed to delete comment');
    }
    setConfirmingDelete(false);
  };

  return (
    <div className={`py-2 animate-[rvd-fadeIn_0.2s_ease] ${depth > 0 ? 'ml-9 border-l-2 border-slate-200 pl-3 dark:border-[var(--color-border)] max-[480px]:ml-5' : ''}`}>
      <div className="flex items-start gap-2">
        <span
          className={commentAvatarCls}
          onClick={() => navigate(`/profile/${comment.user?.username}`)}
        >
          {comment.user?.profilePictureUrl
            ? <img src={comment.user.profilePictureUrl} alt="" className="w-full h-full object-cover" />
            : (comment.user?.displayName || comment.user?.username || '?').charAt(0).toUpperCase()
          }
        </span>
        <div className={commentBubbleCls}>
          <div className="flex items-baseline gap-2 mb-0.5">
            <span
              className={commentAuthorCls}
              onClick={() => navigate(`/profile/${comment.user?.username}`)}
            >
              {comment.user?.displayName || comment.user?.username}
            </span>
            <span className="text-[0.7rem] text-slate-400 whitespace-nowrap dark:text-[var(--color-text-light)]" title={fullDate(comment.createdAt)}>
              {timeAgo(comment.createdAt)}
            </span>
          </div>
          <span className="text-[0.85rem] text-slate-900 leading-normal break-words dark:text-[var(--color-text-primary)]">
            <CommentMentionText content={comment.content} navigate={navigate} />
          </span>
        </div>
        {!confirmingDelete ? (
          <button
            className="bg-transparent border-none cursor-pointer p-1 opacity-50 transition-[opacity,color] duration-150 shrink-0 text-slate-500 flex items-center hover:opacity-100 hover:text-red-500 dark:text-[var(--color-text-secondary)] dark:hover:text-red-400"
            title="Delete"
            onClick={() => setConfirmingDelete(true)}
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
            </svg>
          </button>
        ) : (
          <span className="flex items-center gap-1 shrink-0 animate-[rvd-fadeIn_0.15s_ease]">
            <button className={deleteYesCls} onClick={handleDeleteComment}>Delete</button>
            <button className={deleteNoCls} onClick={() => setConfirmingDelete(false)}>Cancel</button>
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 pl-10 mt-1 max-[480px]:pl-7">
        <button className={metaBtnCls} onClick={() => setReplyingTo(!replyingTo)}>Reply</button>
        {comment.replyCount > 0 && (
          <button className={`${metaBtnCls} font-semibold`} onClick={handleToggleReplies}>
            â”€â”€ {showReplies ? 'Hide replies' : `View ${comment.replyCount} ${comment.replyCount === 1 ? 'reply' : 'replies'}`}
          </button>
        )}
      </div>

      {replyingTo && (
        <div className="ml-10 mt-2 max-[480px]:ml-7">
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
        <div className="mt-1">
          {loadingReplies ? (
            <span className="text-[0.78rem] text-slate-400 py-2 pl-10 block">Loading replies...</span>
          ) : (
            replies.map(reply => (
              <ReflectionCommentItem
                key={reply.id}
                comment={reply}
                reflectionId={reflectionId}
                depth={depth + 1}
                onReply={onReply}
                onDelete={onDelete}
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
  const queryClient = useQueryClient();
  const [showComments, setShowComments] = useState(true);

  const reflectionQuery = useQuery({
    queryKey: reflectionCommentKeys.detail(reflectionId),
    queryFn: async () => {
      const res = await socialApi.getReflection(reflectionId);
      return res.data;
    },
    enabled: Boolean(reflectionId),
  });

  const commentsQuery = useInfiniteQuery({
    queryKey: reflectionCommentKeys.comments(reflectionId),
    queryFn: async ({ pageParam = 0 }) => {
      const res = await socialApi.getReflectionComments(reflectionId, pageParam, 20);
      return res.data;
    },
    initialPageParam: 0,
    enabled: Boolean(reflectionId) && showComments,
    getNextPageParam: (lastPage) => {
      const pageInfo = lastPage?.page;
      if (!pageInfo || pageInfo.number == null || pageInfo.totalPages == null) return undefined;
      return pageInfo.number < pageInfo.totalPages - 1 ? pageInfo.number + 1 : undefined;
    },
  });

  const reflection = reflectionQuery.data || null;
  const loading = reflectionQuery.isLoading;
  const comments = commentsQuery.data?.pages?.flatMap((page) => page?.content || []) || [];
  const hasMoreComments = commentsQuery.hasNextPage;
  const loadingComments = commentsQuery.isFetchingNextPage;

  useEffect(() => {
    if (reflectionQuery.isError) {
      toast.error('Reflection not found');
      navigate(-1);
    }
  }, [navigate, reflectionQuery.isError]);

  const handleLike = async () => {
    if (!reflection) return;

    const previousReflection = reflection;
    updateReflectionCaches(queryClient, reflectionId, (item) => ({
      ...item,
      hasLiked: !item.hasLiked,
      likesCount: item.hasLiked ? Math.max(0, (item.likesCount || 0) - 1) : (item.likesCount || 0) + 1,
    }));

    try {
      const res = await socialApi.toggleLikeReflection(reflectionId);
      updateReflectionCaches(queryClient, reflectionId, (item) => ({
        ...item,
        ...res.data,
      }));
    } catch {
      queryClient.setQueryData(reflectionCommentKeys.detail(reflectionId), previousReflection);
      updateReflectionCaches(queryClient, reflectionId, (item) => ({
        ...item,
        hasLiked: previousReflection.hasLiked,
        likesCount: previousReflection.likesCount,
      }));
      toast.error('Failed to like');
    }
  };

  const handleSave = async () => {
    if (!reflection) return;

    const previousReflection = reflection;
    updateReflectionCaches(queryClient, reflectionId, (item) => ({
      ...item,
      hasSaved: !item.hasSaved,
      savesCount: item.hasSaved ? Math.max(0, (item.savesCount || 0) - 1) : (item.savesCount || 0) + 1,
    }));

    try {
      const res = await socialApi.toggleSaveReflection(reflectionId);
      updateReflectionCaches(queryClient, reflectionId, (item) => ({
        ...item,
        ...res.data,
      }));
    } catch {
      queryClient.setQueryData(reflectionCommentKeys.detail(reflectionId), previousReflection);
      updateReflectionCaches(queryClient, reflectionId, (item) => ({
        ...item,
        hasSaved: previousReflection.hasSaved,
        savesCount: previousReflection.savesCount,
      }));
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
      queryClient.removeQueries({ queryKey: reflectionCommentKeys.detail(reflectionId) });
      queryClient.removeQueries({ queryKey: reflectionCommentKeys.comments(reflectionId) });
      toast.success('Reflection deleted');
      navigate(-1);
    } catch {
      toast.error('Failed to delete reflection');
    }
  };

  const handleAddComment = async (text) => {
    try {
      const res = await socialApi.addReflectionComment(reflectionId, text, null);
      addTopLevelCommentToCache(queryClient, reflectionId, res.data);
      updateReflectionCommentCountCaches(queryClient, reflectionId, 1);
    } catch {
      toast.error('Failed to add comment');
    }
  };

  const handleReply = async (text, parentId) => {
    try {
      const res = await socialApi.addReflectionComment(reflectionId, text, parentId);
      addReplyToCache(queryClient, reflectionId, parentId, res.data);
      updateReflectionCommentCountCaches(queryClient, reflectionId, 1);
    } catch {
      toast.error('Failed to post reply');
    }
  };

  const handleDeleteComment = (commentId, parentId = null) => {
    removeCommentFromCache(queryClient, reflectionId, commentId, parentId);
    updateReflectionCommentCountCaches(queryClient, reflectionId, -1);
  };

  if (!loading && !reflection) return null;

  const isOwn = user && reflection?.user?.id === user.id;
  const liked = reflection?.hasLiked || false;
  const likesCount = reflection?.likesCount || 0;
  const commentsCount = reflection?.commentsCount || 0;
  const saved = reflection?.hasSaved || false;
  const savesCount = reflection?.savesCount || 0;

  return (
    <div className={pageCls}>
      {loading ? (
        <SkeletonLoader />
      ) : (
      <>
      <div className={containerCls}>
        {/* Back Button */}
        <button className="page-back-btn" onClick={() => navigate(-1)}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
          Back
        </button>

        {/* Reflection Card */}
        <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-md animate-[rvd-fadeIn_0.35s_ease] dark:bg-[var(--color-bg-secondary)] dark:border-[var(--color-border)] dark:shadow-[0_6px_24px_rgba(0,0,0,0.3)] max-[480px]:rounded-xl">
          {/* Author Header */}
          <div className="flex justify-between items-start px-6 pt-5 max-[480px]:px-4 max-[480px]:pt-4 max-[480px]:flex-col max-[480px]:gap-3">
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => navigate(`/profile/${reflection.user?.username}`)}
            >
              <div className="w-[52px] h-[52px] rounded-full overflow-hidden shrink-0 transition-transform duration-200 group-hover:scale-105">
                {reflection.user?.profilePictureUrl ? (
                  <img src={reflection.user.profilePictureUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-violet-700 to-violet-500 text-white flex items-center justify-center font-bold text-xl">
                    {(reflection.user?.displayName || reflection.user?.username || '?')[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[0.95rem] text-slate-900 transition-colors duration-150 leading-snug group-hover:text-violet-700 dark:text-[var(--color-text-primary)] dark:group-hover:text-[var(--color-primary)]">
                  {reflection.user?.displayName || reflection.user?.username}
                </span>
                <span className="text-xs text-slate-500 leading-snug dark:text-[var(--color-text-secondary)]">@{reflection.user?.username}</span>
                <span className="text-xs text-slate-400 leading-snug dark:text-[var(--color-text-light)]" title={fullDate(reflection.createdAt)}>
                  {timeAgo(reflection.createdAt)}
                  {reflection.visibleToFollowersOnly && <span className="text-[0.7rem] inline-flex items-center ml-1" title="Followers only"><Lock className="w-3 h-3" /></span>}
                </span>
              </div>
            </div>

            {isOwn && (
              <div className="flex gap-2 shrink-0">
                <button onClick={handleDelete} className={ownerDangerBtnCls} title="Delete reflection">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                  </svg>
                  Delete
                </button>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="px-6 pt-[18px] pb-5 max-[480px]:px-4 max-[480px]:pt-3.5 max-[480px]:pb-4">
            <p className="m-0 text-[0.95rem] text-slate-900 leading-[1.75] whitespace-pre-wrap break-words dark:text-[var(--color-text-primary)]">
              {reflection.content}
            </p>
          </div>

          {/* Attached Book */}
          {reflection.book && (
            <div className={[
              'flex items-center gap-3.5 mx-6 mb-4 py-3.5 px-4',
              'bg-[linear-gradient(135deg,rgba(109,40,217,0.04),rgba(37,99,235,0.03))]',
              'border border-slate-200 rounded-xl cursor-pointer transition-all duration-200',
              'hover:bg-[linear-gradient(135deg,rgba(109,40,217,0.08),rgba(37,99,235,0.05))]',
              'hover:border-violet-700/20 hover:-translate-y-px',
              'dark:bg-[rgba(124,77,255,0.06)] dark:border-[var(--color-border)]',
              'dark:hover:bg-[rgba(124,77,255,0.1)] dark:hover:border-[rgba(124,77,255,0.2)]',
              'max-[480px]:mx-4 max-[480px]:mb-3',
            ].join(' ')}>
              <div className="w-[42px] h-[42px] rounded-lg bg-gradient-to-br from-violet-700 to-violet-500 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" className="fill-white/90">
                  <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z" />
                </svg>
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="font-bold text-[0.92rem] text-slate-900 overflow-hidden text-ellipsis whitespace-nowrap dark:text-[var(--color-text-primary)]">
                  {reflection.book.title}
                </span>
                {reflection.book.author && (
                  <span className="text-[0.8rem] text-slate-500 dark:text-[var(--color-text-secondary)]">by {reflection.book.author}</span>
                )}
              </div>
            </div>
          )}

          {/* Engagement Stats Row */}
          {(likesCount > 0 || commentsCount > 0 || savesCount > 0) && (
            <div className="flex items-center justify-between px-6 py-2.5 border-t border-slate-200 text-xs text-slate-500 dark:border-[var(--color-border)] dark:text-[var(--color-text-secondary)] max-[480px]:px-4">
              {likesCount > 0 && (
                <span className="inline-flex items-center gap-1">
                  <span className="inline-flex items-center justify-center w-[18px] h-[18px] bg-gradient-to-br from-violet-700 to-violet-500 rounded-full leading-none">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="#fff">
                      <path d="M7.24 2C4.37 2 2 4.43 2 7.35c0 5.6 6.25 10.27 10 12.65 3.75-2.38 10-7.05 10-12.65C22 4.43 19.63 2 16.76 2c-1.63 0-3.19.79-4.22 2.07L12 4.74l-.54-.67C10.43 2.79 8.87 2 7.24 2z" />
                    </svg>
                  </span>
                  {likesCount}
                </span>
              )}
              <div className="flex gap-3.5">
                {commentsCount > 0 && (
                  <span
                    className="inline-flex items-center gap-1 cursor-pointer transition-colors duration-150 hover:text-violet-700 dark:hover:text-[var(--color-primary)]"
                    onClick={() => setShowComments(!showComments)}
                  >
                    {commentsCount} comment{commentsCount !== 1 ? 's' : ''}
                  </span>
                )}
                {savesCount > 0 && (
                  <span className="inline-flex items-center gap-1">
                    {savesCount} save{savesCount !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Actions Bar â€” LinkedIn-style SVG buttons */}
          <div className="flex border-t border-slate-200 px-3 py-1 dark:border-[var(--color-border)] max-[480px]:px-2 max-[480px]:py-1">
            <button
              className={`${actionBtnBase} ${liked ? 'text-violet-700 dark:text-[var(--color-primary)]' : ''}`}
              onClick={handleLike}
            >
              <HeartIcon filled={liked} />
              <span>Like</span>
            </button>
            <button
              className={`${actionBtnBase} ${showComments ? 'text-violet-700 dark:text-[var(--color-primary)]' : ''}`}
              onClick={() => setShowComments(!showComments)}
            >
              <CommentIcon />
              <span>Comment</span>
            </button>
            <button className={actionBtnBase} onClick={handleShare}>
              <ShareIcon />
              <span>Share</span>
            </button>
            <button
              className={`${actionBtnBase} ${saved ? 'text-violet-700 dark:text-[var(--color-primary)]' : ''}`}
              onClick={handleSave}
            >
              <BookmarkIcon filled={saved} />
              <span>Save</span>
            </button>
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="px-6 pt-4 pb-5 animate-[rvd-fadeIn_0.25s_ease] max-[480px]:px-4 max-[480px]:pt-3 max-[480px]:pb-4">
              <ReflectionCommentInput
                reflectionId={reflection.id}
                onSubmit={handleAddComment}
                placeholder="Add a comment..."
              />

              <div className="flex flex-col gap-0.5">
                {comments.map(c => (
                  <ReflectionCommentItem
                    key={c.id}
                    comment={c}
                    reflectionId={reflection.id}
                    depth={0}
                    onReply={handleReply}
                    onDelete={handleDeleteComment}
                    navigate={navigate}
                  />
                ))}
              </div>

              {hasMoreComments && (
                <button
                  className={loadMoreCls}
                  onClick={() => commentsQuery.fetchNextPage()}
                  disabled={loadingComments}
                >
                  {loadingComments ? 'Loading...' : 'Load more comments'}
                </button>
              )}

              {!loadingComments && comments.length === 0 && (
                <div className="text-center py-6 px-4 text-slate-400 dark:text-[var(--color-text-light)]">
                  <svg viewBox="0 0 24 24" className="w-7 h-7 fill-slate-400 opacity-50 mb-2 mx-auto dark:fill-[var(--color-text-light)]">
                    <path d="M7 9h10v1.5H7V9zm0 4h7v1.5H7V13z" />
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14h-4.83L12 19.17 8.83 16H4V4h16v12z" />
                  </svg>
                  <p className="m-0 text-[0.85rem]">No comments yet. Be the first!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      </>
      )}
    </div>
  );
};

export default ReflectionDetailPage;


