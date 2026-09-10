import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import socialApi from '../api/socialApi';
import bookApi from '../api/bookApi';
import toast from 'react-hot-toast';

/* ---- Shared Tailwind class fragments ---- */
const mentionCls = "text-primary dark:text-[#7C4DFF] font-semibold cursor-pointer transition-opacity hover:opacity-75";
const avatarGrad = "bg-gradient-to-br from-[rgba(109,40,217,0.1)] to-[rgba(37,99,235,0.06)] dark:from-[rgba(124,77,255,0.15)] dark:to-[rgba(149,117,255,0.08)]";
const actionBtnBase = "flex-1 flex items-center justify-center gap-2 py-3 px-1 border-none bg-none text-xs font-semibold cursor-pointer rounded-lg transition-all duration-200 active:scale-[0.94]";
const actionInactive = "text-txt-secondary dark:text-[#9E95A8] hover:bg-bg-hover dark:hover:bg-[#2D2A35] hover:text-txt-primary dark:hover:text-[#E2D9F3]";
const actionActive = "text-primary dark:text-[#7C4DFF]";
const iconCls = "w-5 h-5 fill-current";
const cardCls = "bg-bg dark:bg-[#1E1B24] rounded-2xl border border-border dark:border-[#2D2A35] overflow-hidden shadow-sm transition-all duration-[250ms] hover:shadow-md hover:-translate-y-px dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)]";
const metaBtnCls = "bg-none border-none text-xs font-bold text-txt-light dark:text-[#5a5268] cursor-pointer p-0 py-0.5 transition-colors hover:text-primary dark:hover:text-[#7C4DFF]";

const CommentMentionText = ({ content, navigate }) => {
  const parts = content.split(/(@\w+)/g);
  return <>{parts.map((p, i) => /^@\w+$/.test(p) ? <span key={i} className={mentionCls} onClick={e => { e.stopPropagation(); navigate(`/profile/${p.slice(1)}`); }}>{p}</span> : <span key={i}>{p}</span>)}</>;
};

const ReflectionCommentInput = ({ reflectionId, onSubmit, placeholder, initialValue = '', isReply = false, onCancel }) => {
  const [text, setText] = useState(initialValue);
  const [mentionResults, setMentionResults] = useState([]);
  const [showMentions, setShowMentions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);
  const handleChange = e => {
    const val = e.target.value; setText(val);
    const m = val.slice(0, e.target.selectionStart).match(/@(\w*)$/);
    if (m && m[1].length >= 1) {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        try { const r = await socialApi.searchUsers(m[1], 0, 6); const u = r.data?.content || r.data || []; setMentionResults(u); setShowMentions(u.length > 0); setActiveIndex(0); } catch { setShowMentions(false); }
      }, 200);
    } else setShowMentions(false);
  };
  const insertMention = u => {
    const cp = inputRef.current.selectionStart, tb = text.slice(0, cp), ta = text.slice(cp), nb = tb.replace(/@\w*$/, `@${u} `);
    setText(nb + ta); setShowMentions(false);
    setTimeout(() => { if (inputRef.current) { inputRef.current.focus(); inputRef.current.setSelectionRange(nb.length, nb.length); } }, 0);
  };
  const handleKeyDown = e => {
    if (showMentions && mentionResults.length > 0) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(p => (p + 1) % mentionResults.length); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(p => (p - 1 + mentionResults.length) % mentionResults.length); return; }
      if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); insertMention(mentionResults[activeIndex]?.username); return; }
      if (e.key === 'Escape') { setShowMentions(false); return; }
    }
    if (e.key === 'Enter' && !e.shiftKey && text.trim()) { e.preventDefault(); onSubmit(text.trim()); setText(''); }
  };
  const wrapCls = "flex-1 flex items-center border border-border dark:border-[#2D2A35] rounded-full bg-bg-secondary dark:bg-bg transition-all focus-within:border-primary dark:focus-within:border-[#7C4DFF] focus-within:bg-bg dark:focus-within:bg-[#1E1B24] focus-within:shadow-[0_0_0_3px_rgba(109,40,217,0.08)] dark:focus-within:shadow-[0_0_0_3px_rgba(124,77,255,0.1)]";
  return (
    <div className={`flex items-center gap-2.5 mb-3.5 pt-1.5 ${isReply ? 'mt-2 mb-1' : ''}`}>
      {!isReply && <div className={`w-8 h-8 rounded-full ${avatarGrad} flex items-center justify-center flex-shrink-0 text-[0.85rem]`}>💬</div>}
      <div className="flex-1 relative">
        <div className={`${wrapCls} ${isReply ? 'py-px px-0.5 pl-3' : 'py-0.5 px-1 pl-4'}`}>
          <input ref={inputRef} className="flex-1 border-none bg-transparent text-[0.85rem] py-2.5 text-txt-primary dark:text-[#E2D9F3] outline-none font-[inherit] placeholder:text-txt-light dark:placeholder:text-[#5a5268]" placeholder={placeholder || 'Add a comment...'} value={text} onChange={handleChange} onKeyDown={handleKeyDown} />
          <button className={`bg-none border-none text-primary dark:text-[#7C4DFF] font-bold cursor-pointer rounded-full transition-colors hover:bg-[rgba(109,40,217,0.08)] dark:hover:bg-[rgba(124,77,255,0.1)] disabled:text-txt-light dark:disabled:text-[#5a5268] disabled:cursor-not-allowed ${isReply ? 'text-[0.78rem] py-1.5 px-3' : 'text-[0.82rem] py-2 px-4'}`} onClick={() => { if (text.trim()) { onSubmit(text.trim()); setText(''); } }} disabled={!text.trim()}>{isReply ? 'Reply' : 'Post'}</button>
        </div>
        {showMentions && <div className="absolute bottom-full left-0 right-0 max-h-[220px] overflow-y-auto bg-bg dark:bg-[#1E1B24] border border-border dark:border-[#2D2A35] rounded-xl shadow-lg dark:shadow-[0_10px_30px_rgba(0,0,0,0.4)] z-[100] mb-1">
          {mentionResults.map((u, idx) => (
            <div key={u.id || idx} className={`flex items-center gap-2.5 py-2.5 px-3.5 cursor-pointer transition-colors ${idx === activeIndex ? 'bg-[rgba(109,40,217,0.04)] dark:bg-[rgba(124,77,255,0.08)]' : 'hover:bg-[rgba(109,40,217,0.04)] dark:hover:bg-[rgba(124,77,255,0.08)]'}`} onMouseDown={e => { e.preventDefault(); insertMention(u.username); }} onMouseEnter={() => setActiveIndex(idx)}>
              <div className={`w-[30px] h-[30px] rounded-full overflow-hidden flex-shrink-0 ${avatarGrad} flex items-center justify-center text-xs font-bold text-primary dark:text-[#7C4DFF]`}>{u.profilePictureUrl ? <img src={u.profilePictureUrl} alt="" className="w-full h-full object-cover" /> : <span>{(u.displayName || u.username || 'U').charAt(0).toUpperCase()}</span>}</div>
              <div className="flex flex-col min-w-0"><span className="font-bold text-[0.85rem] text-txt-primary dark:text-[#E2D9F3] truncate">{u.displayName || u.username}</span><span className="text-xs text-txt-light dark:text-[#5a5268]">@{u.username}</span></div>
            </div>))}
        </div>}
        {isReply && onCancel && <button className="bg-none border-none text-txt-secondary dark:text-[#9E95A8] text-xs font-semibold cursor-pointer py-1 mt-1 transition-colors hover:text-primary dark:hover:text-[#7C4DFF]" onClick={onCancel}>Cancel</button>}
      </div>
    </div>
  );
};

const ReflectionCommentItem = ({ comment, reflectionId, depth, onReply, onDelete, navigate, formatDate }) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState(comment.replies || []);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const maxDepth = 2;
  const handleToggleReplies = async () => {
    if (!showReplies && replies.length === 0 && comment.replyCount > 0) { setLoadingReplies(true); try { const r = await socialApi.getReflectionCommentReplies(comment.id); setReplies(r.data || []); } catch { toast.error('Failed to load replies'); } finally { setLoadingReplies(false); } }
    setShowReplies(!showReplies);
  };
  const handleReplySubmit = c => { onReply(c, comment.id); setShowReplyInput(false); setShowReplies(true); };
  useEffect(() => { if (comment.replies) setReplies(comment.replies); }, [comment.replies]);

  return (
    <div className={`flex gap-2.5 py-2 relative ${depth > 0 ? 'py-1.5' : ''}`}>
      <div className={`${depth > 0 ? 'w-[26px] h-[26px] text-[0.7rem]' : 'w-8 h-8 text-[0.8rem]'} rounded-full overflow-hidden flex-shrink-0 cursor-pointer ${avatarGrad} flex items-center justify-center font-bold text-primary dark:text-[#7C4DFF]`} onClick={() => navigate(`/profile/${comment.user?.username}`)}>
        {comment.user?.profilePictureUrl ? <img src={comment.user.profilePictureUrl} alt="" className="w-full h-full object-cover" /> : <span>{(comment.user?.displayName || comment.user?.username || 'U').charAt(0).toUpperCase()}</span>}
      </div>
      <div className="flex-1 min-w-0">
        <div className="bg-bg-tertiary dark:bg-[#2D2A35] rounded-tr-lg rounded-br-lg rounded-bl-lg py-2.5 px-3.5 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-semibold text-[0.82rem] text-txt-primary dark:text-[#E2D9F3] cursor-pointer transition-colors hover:text-primary dark:hover:text-[#7C4DFF]" onClick={() => navigate(`/profile/${comment.user?.username}`)}>{comment.user?.displayName || comment.user?.username}</span>
            <span className="text-[0.72rem] text-txt-light dark:text-[#7a7181]">{formatDate(comment.createdAt)}</span>
          </div>
          <div className="text-[0.85rem] text-txt-primary dark:text-[#E2D9F3] leading-normal break-words"><CommentMentionText content={comment.content} navigate={navigate} /></div>
        </div>
        <div className="flex gap-3 mt-1 items-center">
          {depth < maxDepth && <button className={metaBtnCls} onClick={() => setShowReplyInput(!showReplyInput)}>Reply</button>}
          {confirmingDelete ? (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-danger dark:text-red-400">Delete?</span>
              <button className="bg-danger text-white border-none rounded-lg px-2.5 py-0.5 text-[0.72rem] font-bold cursor-pointer transition-colors hover:bg-red-600" onClick={() => { onDelete(comment.id, comment.parentId || null); setConfirmingDelete(false); }}>Yes</button>
              <button className="bg-none border border-border dark:border-[#2D2A35] text-txt-secondary dark:text-[#9E95A8] rounded-lg px-2.5 py-0.5 text-[0.72rem] font-bold cursor-pointer transition-all hover:bg-bg-tertiary dark:hover:bg-[#2D2A35]" onClick={() => setConfirmingDelete(false)}>No</button>
            </div>
          ) : <button className={`${metaBtnCls} font-semibold`} onClick={() => setConfirmingDelete(true)}>🗑️ Delete</button>}
        </div>
        {showReplyInput && <ReflectionCommentInput reflectionId={reflectionId} onSubmit={handleReplySubmit} placeholder={`Reply to @${comment.user?.username}...`} initialValue={`@${comment.user?.username} `} isReply onCancel={() => setShowReplyInput(false)} />}
        {(comment.replyCount > 0 || replies.length > 0) && <button className={`${metaBtnCls} font-bold pt-1.5 pb-0.5`} onClick={handleToggleReplies}>{loadingReplies ? 'Loading...' : showReplies ? '── Hide replies' : `── View ${comment.replyCount || replies.length} ${(comment.replyCount || replies.length) === 1 ? 'reply' : 'replies'}`}</button>}
        {showReplies && replies.length > 0 && <div className="mt-1 pl-3 border-l-2 border-border dark:border-[#2D2A35] ml-1">{replies.map(r => <ReflectionCommentItem key={r.id} comment={r} reflectionId={reflectionId} depth={depth + 1} onReply={onReply} onDelete={onDelete} navigate={navigate} formatDate={formatDate} />)}</div>}
      </div>
    </div>
  );
};

/* ==== MAIN FEEDPAGE COMPONENT ==== */
const FeedPage = () => {
  const [activeTab, setActiveTab] = useState('following');
  const [sortMode, setSortMode] = useState('relevant');
  const [reflections, setReflections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const searchDebounceRef = useRef(null);
  const [showComposer, setShowComposer] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newBookId, setNewBookId] = useState('');
  const [newPrivacy, setNewPrivacy] = useState(false);
  const [posting, setPosting] = useState(false);
  const [myBooks, setMyBooks] = useState([]);
  const textareaRef = useRef(null);
  const [expandedComments, setExpandedComments] = useState({});
  const [loadingComments, setLoadingComments] = useState({});
  const [allComments, setAllComments] = useState({});
  const [commentPages, setCommentPages] = useState({});
  const [hasMoreComments, setHasMoreComments] = useState({});
  const [expandedContent, setExpandedContent] = useState({});
  const [deletingId, setDeletingId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => { if (!isSearching) loadReflections(0, true); }, [activeTab, sortMode]);
  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    if (!searchQuery.trim()) { if (isSearching) { setIsSearching(false); loadReflections(0, true); } return; }
    searchDebounceRef.current = setTimeout(async () => {
      setIsSearching(true); setLoading(true);
      try { const r = await socialApi.searchReflections(searchQuery.trim(), 0, 20); setReflections(r.data.content || []); setHasMore(false); } catch { setReflections([]); } finally { setLoading(false); }
    }, 250);
    return () => clearTimeout(searchDebounceRef.current);
  }, [searchQuery]);
  useEffect(() => {
    if (showComposer && myBooks.length === 0) bookApi.getAllBooks().then(r => setMyBooks(r || [])).catch(() => { });
    if (showComposer && textareaRef.current) textareaRef.current.focus();
  }, [showComposer]);
  useEffect(() => { const h = () => setOpenMenuId(null); document.addEventListener('click', h); return () => document.removeEventListener('click', h); }, []);

  const loadReflections = async (pg = 0, reset = false) => {
    if (reset) setLoading(true);
    try {
      const fetcher = activeTab === 'following' ? socialApi.getFollowingReflections : socialApi.getEveryoneReflections;
      const response = await fetcher(pg, 15, sortMode);
      const content = response.data.content || []; const pageInfo = response.data.page || {};
      if (reset) setReflections(content); else setReflections(prev => [...prev, ...content]);
      setPage(pg);
      setHasMore(pageInfo.number != null && pageInfo.totalPages != null ? pageInfo.number < pageInfo.totalPages - 1 : false);
    } catch (e) { console.error('Failed to load reflections:', e); if (reset) setReflections([]); } finally { setLoading(false); }
  };
  const loadMore = () => { if (hasMore) loadReflections(page + 1, false); };
  const handleTabChange = tab => { if (tab !== activeTab) { setActiveTab(tab); setReflections([]); setPage(0); setHasMore(true); } };
  const handlePost = async () => {
    if (!newContent.trim()) return; setPosting(true);
    try {
      const payload = { content: newContent.trim(), visibleToFollowersOnly: newPrivacy }; if (newBookId) payload.bookId = Number(newBookId);
      const res = await socialApi.createReflection(payload); toast.success('Reflection posted!'); setNewContent(''); setNewBookId(''); setNewPrivacy(false); setShowComposer(false); setReflections(prev => [res.data, ...prev]);
    } catch (e) { console.error(e); toast.error('Failed to post reflection'); } finally { setPosting(false); }
  };
  const handleDelete = async id => { try { await socialApi.deleteReflection(id); setReflections(prev => prev.filter(r => r.id !== id)); toast.success('Reflection deleted'); } catch { toast.error('Failed to delete'); } setDeletingId(null); setOpenMenuId(null); };
  const handleTogglePrivacy = async reflection => {
    const nv = !reflection.visibleToFollowersOnly;
    try { const r = await socialApi.updateReflectionPrivacy(reflection.id, nv); setReflections(prev => prev.map(x => x.id === reflection.id ? { ...x, ...r.data } : x)); toast.success(nv ? 'Visible to followers only' : 'Visible to everyone'); } catch { toast.error('Failed to update privacy'); }
    setOpenMenuId(null);
  };
  const handleToggleLike = async reflection => {
    const wl = reflection.hasLiked;
    setReflections(prev => prev.map(r => r.id === reflection.id ? { ...r, hasLiked: !wl, likesCount: wl ? r.likesCount - 1 : r.likesCount + 1 } : r));
    try { const res = await socialApi.toggleLikeReflection(reflection.id); setReflections(prev => prev.map(r => r.id === reflection.id ? { ...r, ...res.data } : r)); }
    catch { setReflections(prev => prev.map(r => r.id === reflection.id ? { ...r, hasLiked: wl, likesCount: wl ? r.likesCount + 1 : r.likesCount - 1 } : r)); toast.error('Failed to update like'); }
  };
  const handleToggleSave = async reflection => {
    const ws = reflection.hasSaved;
    setReflections(prev => prev.map(r => r.id === reflection.id ? { ...r, hasSaved: !ws, savesCount: ws ? r.savesCount - 1 : r.savesCount + 1 } : r));
    try { const res = await socialApi.toggleSaveReflection(reflection.id); setReflections(prev => prev.map(r => r.id === reflection.id ? { ...r, ...res.data } : r)); toast.success(ws ? 'Removed from saved' : 'Reflection saved'); }
    catch { setReflections(prev => prev.map(r => r.id === reflection.id ? { ...r, hasSaved: ws, savesCount: ws ? r.savesCount + 1 : r.savesCount - 1 } : r)); toast.error('Failed to update save'); }
  };
  const toggleCommentSection = rid => { setExpandedComments(p => ({ ...p, [rid]: !p[rid] })); if (!expandedComments[rid] && !allComments[rid]) loadComments(rid, 0, true); };
  const loadComments = async (rid, pg = 0, reset = false) => {
    setLoadingComments(p => ({ ...p, [rid]: true }));
    try { const r = await socialApi.getReflectionComments(rid, pg, 10); const c = r.data.content || []; const pi = r.data.page || {}; if (reset) setAllComments(p => ({ ...p, [rid]: c })); else setAllComments(p => ({ ...p, [rid]: [...(p[rid] || []), ...c] })); setCommentPages(p => ({ ...p, [rid]: pg })); setHasMoreComments(p => ({ ...p, [rid]: pi.number != null && pi.totalPages != null ? pi.number < pi.totalPages - 1 : false })); }
    catch { toast.error('Failed to load comments'); } finally { setLoadingComments(p => ({ ...p, [rid]: false })); }
  };
  const handlePostComment = async (rid, content, parentId = null) => {
    if (!content.trim()) return;
    try { const r = await socialApi.addReflectionComment(rid, content.trim(), parentId); if (parentId) { setAllComments(p => ({ ...p, [rid]: (p[rid] || []).map(c => c.id === parentId ? { ...c, replyCount: (c.replyCount || 0) + 1, replies: [...(c.replies || []), r.data] } : c) })); } else { setAllComments(p => ({ ...p, [rid]: [...(p[rid] || []), r.data] })); } setReflections(p => p.map(x => x.id === rid ? { ...x, commentsCount: (x.commentsCount || 0) + 1 } : x)); }
    catch { toast.error('Failed to post comment'); }
  };
  const handleDeleteComment = async (rid, cid, parentId = null) => {
    try { await socialApi.deleteReflectionComment(cid); if (parentId) { setAllComments(p => ({ ...p, [rid]: (p[rid] || []).map(c => c.id === parentId ? { ...c, replyCount: Math.max(0, (c.replyCount || 0) - 1), replies: (c.replies || []).filter(x => x.id !== cid) } : c) })); } else { setAllComments(p => ({ ...p, [rid]: (p[rid] || []).filter(c => c.id !== cid) })); } setReflections(p => p.map(x => x.id === rid ? { ...x, commentsCount: Math.max(0, (x.commentsCount || 0) - 1) } : x)); toast.success('Comment deleted'); }
    catch { toast.error('Failed to delete comment'); }
  };
  const handleShare = reflection => { navigator.clipboard.writeText(`${window.location.origin}/reflections/${reflection.id}`).then(() => toast.success('Link copied to clipboard!')).catch(() => toast.error('Failed to copy link')); };
  const formatDate = ds => { const d = new Date(ds), now = new Date(), dm = Math.floor((now - d) / 60000), dh = Math.floor((now - d) / 3600000), dd = Math.floor((now - d) / 86400000), dw = Math.floor(dd / 7); if (dm < 1) return 'Just now'; if (dm < 60) return `${dm}m`; if (dh < 24) return `${dh}h`; if (dd < 7) return `${dd}d`; if (dw < 4) return `${dw}w`; return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); };
  const CONTENT_LIMIT = 300;

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-secondary dark:from-[#1E1B24] to-bg-tertiary dark:to-bg p-6 pb-20 md:pt-20 md:pb-10 max-sm:py-3 max-sm:px-2 max-sm:pb-20 transition-colors duration-300">
      <div className="max-w-[620px] lg:max-w-[680px] mx-auto animate-fade-in-up">
        <button className="page-back-btn" onClick={() => navigate(-1)}>← Back</button>

        {/* Composer */}
        <div className={`${cardCls} !rounded-2xl p-4 px-5 mb-3 !shadow-sm hover:!shadow-md`}>
          <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => setShowComposer(!showComposer)}>
            <div className={`w-12 h-12 max-sm:w-10 max-sm:h-10 rounded-full ${avatarGrad} flex items-center justify-center text-xl flex-shrink-0 transition-transform hover:scale-105`}>✍️</div>
            <div className="flex-1 py-3 px-5 border border-border dark:border-[#2D2A35] rounded-full text-txt-secondary dark:text-[#9E95A8] text-sm transition-all hover:bg-bg-hover dark:hover:bg-[#2D2A35] hover:border-primary dark:hover:border-[#7C4DFF]">Share a reading insight or reflection...</div>
          </div>
          {showComposer && (
            <div className="mt-3.5 animate-fade-in">
              <textarea ref={textareaRef} className="w-full border border-border dark:border-[#2D2A35] rounded-xl p-3.5 text-sm font-[inherit] leading-relaxed resize-y min-h-[110px] text-txt-primary dark:text-[#E2D9F3] bg-bg dark:bg-bg outline-none box-border transition-all focus:border-primary dark:focus:border-[#7C4DFF] focus:shadow-[0_0_0_3px_rgba(109,40,217,0.1)] dark:focus:shadow-[0_0_0_3px_rgba(124,77,255,0.15)] placeholder:text-txt-light dark:placeholder:text-[#5a5268]" placeholder="What's on your mind about what you're reading?" value={newContent} onChange={e => setNewContent(e.target.value)} maxLength={2000} rows={4} />
              <div className="mt-3">
                <div className="flex gap-2.5 flex-wrap mb-3 max-sm:flex-col">
                  <select className="flex-1 min-w-[170px] py-2.5 px-3 border border-border dark:border-[#2D2A35] rounded-lg text-[0.83rem] text-txt-primary dark:text-[#E2D9F3] bg-bg dark:bg-bg cursor-pointer transition-colors focus:border-primary dark:focus:border-[#7C4DFF] focus:outline-none" value={newBookId} onChange={e => setNewBookId(e.target.value)}>
                    <option value="">📚 Link a book</option>
                    {myBooks.map(b => <option key={b.id} value={b.id}>{b.title} — {b.author}</option>)}
                  </select>
                  <button type="button" className={`py-2 px-4 rounded-full border text-[0.82rem] font-semibold cursor-pointer transition-all whitespace-nowrap ${newPrivacy ? 'bg-[rgba(245,158,11,0.12)] dark:bg-[rgba(245,158,11,0.12)] text-amber-600 dark:text-amber-400 border-amber-300 dark:border-[rgba(245,158,11,0.3)]' : 'bg-green-50 dark:bg-[rgba(16,185,129,0.12)] text-green-600 dark:text-emerald-400 border-green-300 dark:border-[rgba(16,185,129,0.3)]'}`} onClick={() => setNewPrivacy(!newPrivacy)}>{newPrivacy ? '🔒 Followers' : '🌐 Anyone'}</button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-txt-light">{newContent.length}/2000</span>
                  <button className="py-2 px-6 bg-gradient-to-br from-primary via-[#7c3aed] to-blue-600 text-white border-none rounded-full font-bold text-[0.88rem] cursor-pointer transition-all shadow-[0_2px_8px_rgba(109,40,217,0.25)] hover:not-disabled:-translate-y-px hover:not-disabled:shadow-[0_4px_14px_rgba(109,40,217,0.35)] disabled:opacity-40 disabled:cursor-not-allowed" onClick={handlePost} disabled={posting || !newContent.trim()}>{posting ? 'Posting...' : 'Post'}</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2.5 bg-bg dark:bg-[#1a1625] border border-border dark:border-[#2D2640] rounded-2xl py-2.5 px-4 mb-3 shadow-xs transition-all focus-within:border-primary dark:focus-within:border-[#A78BFA] focus-within:shadow-[0_0_0_3px_rgba(124,58,237,0.1)] dark:focus-within:shadow-[0_0_0_3px_rgba(167,139,250,0.15)]">
          <svg className="text-txt-light flex-shrink-0" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" /></svg>
          <input type="text" className="flex-1 border-none outline-none bg-none text-[0.95rem] text-txt-primary dark:text-[#E2D9F3] font-[inherit] placeholder:text-txt-light" placeholder="Search reflections by content, book, user..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          {searchQuery && <button className="bg-none border-none cursor-pointer text-txt-light text-base py-0.5 px-1.5 rounded-full transition-all hover:bg-bg-secondary dark:hover:bg-[#2D2640] hover:text-txt-primary dark:hover:text-[#E2D9F3]" onClick={() => setSearchQuery('')}>✕</button>}
        </div>

        {/* Tabs + Sort */}
        <div className="flex items-center gap-2.5 mb-3 max-[480px]:flex-col max-[480px]:gap-2">
          <div className="flex-1 flex relative bg-bg dark:bg-[#1E1B24] rounded-2xl border border-border dark:border-[#2D2A35] overflow-hidden shadow-xs max-[480px]:w-full">
            {['following', 'everyone'].map(t => <button key={t} className={`flex-1 py-3.5 border-none bg-transparent text-sm font-semibold cursor-pointer relative z-[1] transition-colors capitalize ${activeTab === t ? 'text-primary dark:text-[#7C4DFF]' : 'text-txt-secondary dark:text-[#9E95A8] hover:text-primary dark:hover:text-[#7C4DFF]'}`} onClick={() => handleTabChange(t)}>{t === 'following' ? 'Following' : 'Everyone'}</button>)}
            <div className="absolute bottom-0 left-0 w-1/2 h-[3px] bg-gradient-to-r from-primary to-[#7c3aed] dark:from-[#7C4DFF] dark:to-[#9575FF] transition-transform duration-300 rounded-t" style={{ transform: activeTab === 'everyone' ? 'translateX(100%)' : 'translateX(0)' }} />
          </div>
          <div className="flex bg-bg dark:bg-[#1E1B24] border border-border dark:border-[#2D2A35] rounded-[10px] overflow-hidden flex-shrink-0 shadow-xs max-[480px]:self-end">
            {[{ k: 'relevant', l: 'Top', d: 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z' }, { k: 'recent', l: 'New', d: 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z' }].map(s => <button key={s.k} className={`flex items-center gap-1 py-2 px-3 border-none bg-transparent text-xs font-semibold cursor-pointer transition-all whitespace-nowrap ${sortMode === s.k ? 'bg-primary dark:bg-[#7C4DFF] text-white' : 'text-txt-secondary dark:text-[#9E95A8] hover:bg-[rgba(109,40,217,0.08)] dark:hover:bg-[rgba(124,77,255,0.12)] hover:text-primary dark:hover:text-[#7C4DFF]'}`} onClick={() => setSortMode(s.k)}><svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d={s.d} /></svg>{s.l}</button>)}
          </div>
        </div>

        {/* Feed */}
        {loading ? (
          <div className="flex flex-col gap-3">{[1, 2, 3].map(i => <div key={i} className="skeleton-card animate-fade-in" style={{ animationDelay: `${(i - 1) * 80}ms` }}><div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}><div className="skeleton skeleton-avatar" /><div style={{ flex: 1 }}><div className="skeleton skeleton-text skeleton-text--md" /><div className="skeleton skeleton-text skeleton-text--sm" style={{ marginBottom: 0 }} /></div></div><div className="skeleton skeleton-text skeleton-text--full" /><div className="skeleton skeleton-text skeleton-text--lg" /><div className="skeleton skeleton-text skeleton-text--md" style={{ marginBottom: 16 }} /><div style={{ display: 'flex', gap: 16 }}>{[1, 2, 3].map(j => <div key={j} className="skeleton" style={{ width: 60, height: 28, borderRadius: 14 }} />)}</div></div>)}</div>
        ) : reflections.length === 0 ? (
          <div className={`${cardCls} text-center py-[72px] px-8 animate-fade-in-up`}>
            <div className="text-[3.5rem] mb-3">{isSearching ? '🔍' : activeTab === 'following' ? '👥' : '🌍'}</div>
            <h3 className="text-lg font-bold text-txt-primary dark:text-[#E2D9F3] m-0 mb-2">{isSearching ? 'No reflections found' : activeTab === 'following' ? 'No reflections from your network yet' : 'No reflections to show'}</h3>
            <p className="text-txt-secondary dark:text-[#9E95A8] m-0 mb-6 text-sm">{isSearching ? `No results for "${searchQuery}". Try a different search.` : activeTab === 'following' ? 'Follow some readers or share the first reflection!' : 'Be the first to share a reflection with the community!'}</p>
            {!isSearching && activeTab === 'following' && <button className="py-2.5 px-6 bg-gradient-to-br from-primary via-[#7c3aed] to-blue-600 text-white border-none rounded-full font-bold text-sm cursor-pointer shadow-[0_4px_14px_rgba(109,40,217,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(109,40,217,0.4)]" onClick={() => navigate('/discover')}>Discover Readers</button>}
          </div>
        ) : (
          <div className="flex flex-col gap-3 stagger-children" key={activeTab + sortMode}>
            {reflections.map(r => (
              <div key={r.id} className={cardCls}>
                {/* Post Header */}
                <div className="flex items-start gap-3 pt-4 px-5 max-sm:px-3.5 max-sm:pt-3">
                  <div className={`w-12 h-12 max-sm:w-10 max-sm:h-10 rounded-full overflow-hidden flex-shrink-0 cursor-pointer ${avatarGrad} transition-transform hover:scale-105`} onClick={() => navigate(`/profile/${r.user?.username}`)}>
                    {r.user?.profilePictureUrl ? <img src={r.user.profilePictureUrl} alt="" className="w-full h-full object-cover animate-fade-in" /> : <span className={`w-full h-full flex items-center justify-center text-xl font-bold text-primary dark:text-[#7C4DFF] ${avatarGrad}`}>{(r.user?.displayName || r.user?.username || 'U').charAt(0).toUpperCase()}</span>}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <span className="font-bold text-sm text-txt-primary dark:text-[#E2D9F3] cursor-pointer leading-snug transition-colors hover:text-primary dark:hover:text-[#7C4DFF]" onClick={() => navigate(`/profile/${r.user?.username}`)}>{r.user?.displayName || r.user?.username}</span>
                    <span className="text-xs text-txt-secondary dark:text-[#9E95A8] leading-snug">@{r.user?.username}</span>
                    <span className="text-xs text-txt-light dark:text-[#7a7181] leading-snug">{formatDate(r.createdAt)}{r.visibleToFollowersOnly && <span className="text-[0.7rem]" title="Followers only"> 🔒</span>}</span>
                  </div>
                  <div className="relative flex-shrink-0">
                    <button className="bg-none border-none text-xl leading-none text-txt-secondary dark:text-[#9E95A8] cursor-pointer py-1.5 px-2 rounded-full transition-all hover:bg-bg-hover dark:hover:bg-[#2D2A35] hover:text-txt-primary dark:hover:text-[#E2D9F3]" onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === r.id ? null : r.id); }}>⋯</button>
                    {openMenuId === r.id && (
                      <div className="absolute right-0 top-full bg-bg dark:bg-[#1E1B24] border border-border dark:border-[#2D2A35] rounded-xl shadow-lg dark:shadow-[0_12px_40px_rgba(0,0,0,0.5)] min-w-[200px] z-[100] overflow-hidden animate-fade-in" onClick={e => e.stopPropagation()}>
                        <button className="block w-full py-3 px-[18px] border-none bg-none text-sm text-txt-primary dark:text-[#E2D9F3] cursor-pointer text-left transition-colors hover:bg-bg-hover dark:hover:bg-[#2D2A35]" onClick={() => handleTogglePrivacy(r)}>{r.visibleToFollowersOnly ? '🌐 Make public' : '🔒 Followers only'}</button>
                        {deletingId === r.id ? (
                          <div className="flex gap-1.5 py-2 px-3.5">
                            <button className="py-[7px] px-4 rounded-lg text-[0.82rem] font-semibold bg-danger text-white border-none cursor-pointer" onClick={() => handleDelete(r.id)}>Confirm delete</button>
                            <button className="py-[7px] px-4 rounded-lg text-[0.82rem] font-semibold bg-none border-none text-txt-primary dark:text-[#E2D9F3] cursor-pointer hover:bg-bg-hover dark:hover:bg-[#2D2A35]" onClick={() => setDeletingId(null)}>Cancel</button>
                          </div>
                        ) : <button className="block w-full py-3 px-[18px] border-none bg-none text-sm text-danger dark:text-red-400 cursor-pointer text-left transition-colors hover:bg-bg-hover dark:hover:bg-[#2D2A35]" onClick={() => setDeletingId(r.id)}>🗑️ Delete</button>}
                      </div>
                    )}
                  </div>
                </div>

                {/* Body */}
                <div className="py-3.5 px-5 max-sm:px-3.5 text-sm leading-relaxed text-txt-primary dark:text-[#E2D9F3] whitespace-pre-wrap break-words cursor-pointer" onClick={() => navigate(`/reflections/${r.id}`)}>
                  {r.content.length > CONTENT_LIMIT && !expandedContent[r.id] ? <>{r.content.slice(0, CONTENT_LIMIT)}...<button className="bg-none border-none text-primary dark:text-[#7C4DFF] font-semibold text-[0.85rem] cursor-pointer p-0 ml-1 transition-opacity hover:opacity-80 hover:underline" onClick={() => setExpandedContent(p => ({ ...p, [r.id]: true }))}>see more</button></> : <>{r.content}{r.content.length > CONTENT_LIMIT && <button className="bg-none border-none text-primary dark:text-[#7C4DFF] font-semibold text-[0.85rem] cursor-pointer p-0 ml-1 transition-opacity hover:opacity-80 hover:underline" onClick={() => setExpandedContent(p => ({ ...p, [r.id]: false }))}>see less</button>}</>}
                </div>

                {/* Book */}
                {r.book && <div className="flex items-center gap-3.5 mx-5 max-sm:mx-3.5 mb-3.5 max-sm:mb-3 p-3.5 px-4 bg-gradient-to-br from-[rgba(109,40,217,0.04)] to-[rgba(37,99,235,0.03)] dark:from-[rgba(124,77,255,0.06)] dark:to-transparent border border-border dark:border-[#2D2A35] rounded-xl transition-all hover:from-[rgba(109,40,217,0.08)] hover:to-[rgba(37,99,235,0.05)] dark:hover:from-[rgba(124,77,255,0.1)] hover:border-[rgba(109,40,217,0.2)] dark:hover:border-[rgba(124,77,255,0.2)]"><div className="text-2xl flex-shrink-0">📖</div><div className="flex flex-col gap-0.5 min-w-0"><span className="font-semibold text-sm text-txt-primary dark:text-[#E2D9F3] truncate">{r.book.title}</span><span className="text-xs text-txt-secondary dark:text-[#9E95A8]">by {r.book.author}</span></div></div>}

                {/* Stats */}
                {(r.likesCount > 0 || r.commentsCount > 0 || r.savesCount > 0) && <div className="flex items-center justify-between py-2.5 px-5 max-sm:px-3.5 border-t border-border dark:border-[#2D2A35] text-xs text-txt-secondary dark:text-[#9E95A8]">{r.likesCount > 0 && <span className="inline-flex items-center gap-1"><span className="inline-flex items-center justify-center w-[18px] h-[18px] bg-gradient-to-br from-primary to-[#7c3aed] rounded-full text-[0.6rem] leading-none">👍</span>{r.likesCount}</span>}<div className="flex gap-3.5">{r.commentsCount > 0 && <span className="cursor-pointer transition-colors hover:text-primary dark:hover:text-[#7C4DFF]" onClick={() => toggleCommentSection(r.id)}>{r.commentsCount} comment{r.commentsCount !== 1 ? 's' : ''}</span>}{r.savesCount > 0 && <span>{r.savesCount} save{r.savesCount !== 1 ? 's' : ''}</span>}</div></div>}

                {/* Actions */}
                <div className="flex border-t border-border dark:border-[#2D2A35] py-1 px-3 max-sm:px-1.5">
                  <button className={`${actionBtnBase} ${r.hasLiked ? actionActive : actionInactive} max-sm:gap-0`} onClick={() => handleToggleLike(r)}><svg viewBox="0 0 24 24" className={`${iconCls} max-sm:w-6 max-sm:h-6`}><path d={r.hasLiked ? "M7.24 2C4.37 2 2 4.43 2 7.35c0 5.6 6.25 10.27 10 12.65 3.75-2.38 10-7.05 10-12.65C22 4.43 19.63 2 16.76 2c-1.63 0-3.19.79-4.22 2.07L12 4.74l-.54-.67C10.43 2.79 8.87 2 7.24 2z" : "M7.24 2C4.37 2 2 4.43 2 7.35c0 5.6 6.25 10.27 10 12.65 3.75-2.38 10-7.05 10-12.65C22 4.43 19.63 2 16.76 2c-1.63 0-3.19.79-4.22 2.07L12 4.74l-.54-.67C10.43 2.79 8.87 2 7.24 2zM12 18.55l-.36-.24C7.39 15.42 4 11.85 4 7.35 4 5.56 5.45 4 7.24 4c1.18 0 2.31.65 2.98 1.69L12 7.99l1.78-2.3A3.505 3.505 0 0116.76 4C18.55 4 20 5.56 20 7.35c0 4.5-3.39 8.07-7.64 10.96L12 18.55z"} /></svg><span className="max-sm:hidden">Like</span></button>
                  <button className={`${actionBtnBase} ${expandedComments[r.id] ? actionActive : actionInactive} max-sm:gap-0`} onClick={() => toggleCommentSection(r.id)}><svg viewBox="0 0 24 24" className={`${iconCls} max-sm:w-6 max-sm:h-6`}><path d="M7 9h10v1.5H7V9zm0 4h7v1.5H7V13z" /><path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14h-4.83L12 19.17 8.83 16H4V4h16v12z" /></svg><span className="max-sm:hidden">Comment</span></button>
                  <button className={`${actionBtnBase} ${actionInactive} max-sm:gap-0`} onClick={() => handleShare(r)}><svg viewBox="0 0 24 24" className={`${iconCls} max-sm:w-6 max-sm:h-6`}><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" /></svg><span className="max-sm:hidden">Share</span></button>
                  <button className={`${actionBtnBase} ${r.hasSaved ? actionActive : actionInactive} max-sm:gap-0`} onClick={() => handleToggleSave(r)}><svg viewBox="0 0 24 24" className={`${iconCls} max-sm:w-6 max-sm:h-6`}><path d={r.hasSaved ? "M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" : "M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z"} /></svg><span className="max-sm:hidden">Save</span></button>
                </div>

                {/* Comments */}
                {expandedComments[r.id] && (
                  <div className="px-5 max-sm:px-3.5 pb-3.5 animate-content-fade">
                    <ReflectionCommentInput reflectionId={r.id} onSubmit={c => handlePostComment(r.id, c)} />
                    {loadingComments[r.id] && <div className="text-center py-3.5 text-txt-light text-[0.82rem]">Loading comments...</div>}
                    {(allComments[r.id] || r.recentComments || []).map(c => <ReflectionCommentItem key={c.id} comment={c} reflectionId={r.id} depth={0} onReply={(ct, pid) => handlePostComment(r.id, ct, pid)} onDelete={(cid, pid) => handleDeleteComment(r.id, cid, pid)} navigate={navigate} formatDate={formatDate} />)}
                    {hasMoreComments[r.id] && <button className="bg-none border-none text-primary dark:text-[#7C4DFF] text-[0.82rem] font-semibold cursor-pointer py-2 transition-opacity hover:opacity-80 hover:underline" onClick={() => loadComments(r.id, (commentPages[r.id] || 0) + 1, false)}>Load more comments</button>}
                  </div>
                )}
              </div>
            ))}
            {hasMore && <button className="block w-full py-3.5 mt-1.5 bg-bg dark:bg-[#1E1B24] border border-border dark:border-[#2D2A35] rounded-2xl text-primary dark:text-[#7C4DFF] text-sm font-bold cursor-pointer transition-all shadow-xs hover:bg-bg-hover dark:hover:bg-[#2D2A35] hover:border-primary dark:hover:border-[#7C4DFF]" onClick={loadMore}>Load More</button>}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedPage;
