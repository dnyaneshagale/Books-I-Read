import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Heart, BookOpen } from 'lucide-react';
import listApi from '../api/listApi';

export default function BrowseListsPage() {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();
  const debounceRef = useRef(null);

  useEffect(() => {
    loadLists();
  }, []);

  // Real-time debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!searchQuery.trim()) {
      if (searching) {
        setSearching(false);
        setLoading(true);
        loadLists(0);
      }
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      setLoading(true);
      try {
        const res = await listApi.searchLists(searchQuery, 0);
        setLists(res.data.content);
        setHasMore(res.data.page ? res.data.page.number < res.data.page.totalPages - 1 : !res.data.last);
        setPage(0);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(debounceRef.current);
  }, [searchQuery]);

  const loadLists = async (pageNum = 0) => {
    try {
      const res = await listApi.browseLists(pageNum);
      const data = res.data;
      if (pageNum === 0) {
        setLists(data.content);
      } else {
        setLists((prev) => [...prev, ...data.content]);
      }
      setHasMore(data.page ? data.page.number < data.page.totalPages - 1 : !data.last);
      setPage(pageNum);
    } catch (err) {
      console.error('Failed to load lists:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLike = async (listId, e) => {
    e.stopPropagation();
    try {
      const res = await listApi.toggleLike(listId);
      setLists((prev) =>
        prev.map((l) => (l.id === listId ? { ...l, likedByViewer: res.data.likedByViewer, likesCount: res.data.likesCount } : l))
      );
    } catch (err) {
      console.error('Like failed:', err);
    }
  };

  return (
    <div className="browse-lists-page max-w-[900px] mx-auto py-8 px-5 pb-20 min-h-screen animate-[g-fadeInUp_0.5s_cubic-bezier(0.16,1,0.3,1)_both] lg:max-w-[960px]">
      <button className="page-back-btn" onClick={() => navigate(-1)}>← Back</button>
      <div className="mb-7">
        <h1 className="m-0 text-[1.6rem] font-[var(--font-weight-extrabold,800)] text-[var(--color-text-primary,#0f172a)] tracking-[-0.01em] dark:text-[var(--color-text-primary,#E2D9F3)]"><Search className="w-6 h-6 inline mr-2" /> Discover Lists</h1>
        <p className="mt-1.5 mb-0 text-[var(--font-size-sm,14px)] text-[var(--color-text-secondary,#475569)] dark:text-[var(--color-text-secondary,#9E95A8)]">Explore curated book collections from the community</p>
      </div>

      <div className="flex gap-2.5 mb-7 max-[600px]:flex-col">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search lists..."
          className="flex-1 py-3 px-[18px] border border-[var(--color-border,#e2e8f0)] rounded-[var(--radius-md,12px)] text-[var(--font-size-sm,14px)] outline-none text-[var(--color-text-primary,#0f172a)] bg-[var(--color-bg,#fff)] transition-all duration-200 font-[inherit] focus:border-[var(--color-primary,#6d28d9)] focus:shadow-[0_0_0_3px_rgba(109,40,217,0.08)] dark:bg-[var(--color-bg-secondary,#1E1B24)] dark:border-[var(--color-border,#2D2A35)] dark:text-[var(--color-text-primary,#E2D9F3)] dark:focus:border-[var(--color-primary,#7C4DFF)] dark:focus:shadow-[0_0_0_3px_rgba(124,77,255,0.1)]"
        />
        {searchQuery && (
          <button type="button" onClick={() => setSearchQuery('')} className="py-3 px-[22px] border border-[var(--color-border,#e2e8f0)] rounded-[var(--radius-md,12px)] text-[var(--font-size-sm,14px)] font-bold cursor-pointer transition-all duration-200 bg-[var(--color-bg-tertiary,#f1f5f9)] text-[var(--color-text-primary,#0f172a)] hover:bg-[var(--color-bg-hover,#e2e8f0)] dark:bg-[var(--color-bg-tertiary,#2D2A35)] dark:text-[var(--color-text-primary,#E2D9F3)] dark:border-[var(--color-border,#2D2A35)]">
            ✕
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4 max-[600px]:grid-cols-1">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className={`skeleton-card animate-[g-fadeIn_0.4s_ease_both]`} style={{ animationDelay: `${(i - 1) * 50}ms` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                <div className="skeleton" style={{ width: 52, height: 52, borderRadius: 12 }} />
                <div className="skeleton" style={{ width: 60, height: 28, borderRadius: 14 }} />
              </div>
              <div className="skeleton skeleton-text skeleton-text--lg" />
              <div className="skeleton skeleton-text skeleton-text--md" />
              <div className="skeleton skeleton-text skeleton-text--sm" style={{ marginTop: 14, marginBottom: 0 }} />
            </div>
          ))}
        </div>
      ) : lists.length === 0 ? (
        <div className="text-center py-20 text-[var(--color-text-secondary,#475569)] text-[var(--font-size-sm,14px)] dark:text-[var(--color-text-secondary,#9E95A8)]">
          <p>{searching ? 'No lists found for your search.' : 'No public lists yet. Be the first to create one!'}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4 stagger-children max-[600px]:grid-cols-1">
            {lists.map((list) => (
              <div
                key={list.id}
                className="bg-[var(--color-bg,#fff)] border border-[var(--color-border,#e2e8f0)] rounded-[var(--radius-lg,16px)] p-[22px] cursor-pointer shadow-[var(--shadow-xs,0_1px_2px_rgba(0,0,0,0.04))] transition-all duration-[250ms] hover:border-[rgba(109,40,217,0.2)] hover:shadow-[var(--shadow-md,0_6px_18px_rgba(15,23,42,0.08))] hover:-translate-y-[3px] dark:bg-[var(--color-bg-secondary,#1E1B24)] dark:border-[var(--color-border,#2D2A35)] dark:hover:border-[rgba(124,77,255,0.3)] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)]"
                onClick={() => navigate(`/lists/${list.id}`)}
              >
                <div className="flex justify-between items-start mb-3.5">
                  <span className="text-[2rem] w-[52px] h-[52px] flex items-center justify-center bg-gradient-to-br from-violet-700/[0.06] to-blue-600/[0.04] rounded-[var(--radius-md,12px)] dark:from-[rgba(124,77,255,0.12)] dark:to-[rgba(149,117,255,0.06)]">{list.coverEmoji}</span>
                  <button
                    className={`bg-transparent border border-[var(--color-border,#e2e8f0)] rounded-full py-1.5 px-3.5 text-[var(--font-size-xs,12px)] cursor-pointer transition-all duration-200 font-semibold active:scale-[0.92] ${list.likedByViewer ? 'border-red-500/30 bg-red-500/[0.06] text-red-500 animate-[g-heartPop_0.4s_cubic-bezier(0.16,1,0.3,1)] dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-400' : 'text-[var(--color-text-secondary,#475569)] hover:border-red-500/30 hover:bg-red-500/[0.04] hover:text-red-500 dark:border-[var(--color-border,#2D2A35)] dark:text-[var(--color-text-secondary,#9E95A8)] dark:hover:bg-red-500/[0.08] dark:hover:border-red-500/30'}`}
                    onClick={(e) => handleToggleLike(list.id, e)}
                  >
                    <Heart className={`w-3.5 h-3.5 inline mr-1 ${list.likedByViewer ? 'fill-current' : ''}`} /> {list.likesCount}
                  </button>
                </div>
                <h3 className="m-0 mb-2 text-[1.05rem] font-bold text-[var(--color-text-primary,#0f172a)] line-clamp-2 dark:text-[var(--color-text-primary,#E2D9F3)]">{list.name}</h3>
                {list.description && (
                  <p className="m-0 mb-3.5 text-[var(--font-size-xs,12px)] text-[var(--color-text-secondary,#475569)] line-clamp-2 leading-[1.5] dark:text-[var(--color-text-secondary,#9E95A8)]">{list.description}</p>
                )}
                <div className="flex justify-between text-[var(--font-size-xs,12px)] text-[var(--color-text-light,#94a3b8)] dark:text-[#7a7181]">
                  <span className="text-[var(--color-primary,#6d28d9)] font-semibold dark:text-[var(--color-primary,#7C4DFF)]">
                    @{list.ownerUsername}
                  </span>
                  <span>
                    <BookOpen className="w-3.5 h-3.5 inline mr-1" /> {list.booksCount}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="text-center mt-7">
              <button onClick={() => loadLists(page + 1)} className="py-3 px-8 border border-[var(--color-border,#e2e8f0)] rounded-[var(--radius-md,12px)] bg-[var(--color-bg,#fff)] text-[var(--color-primary,#6d28d9)] text-[var(--font-size-sm,14px)] font-bold cursor-pointer transition-all duration-200 shadow-[var(--shadow-xs,0_1px_2px_rgba(0,0,0,0.04))] hover:bg-[var(--color-bg-hover,#f1f5f9)] hover:border-[var(--color-primary,#6d28d9)] hover:shadow-[var(--shadow-sm,0_1px_2px_rgba(0,0,0,0.06))] dark:bg-[var(--color-bg-secondary,#1E1B24)] dark:border-[var(--color-border,#2D2A35)] dark:text-[var(--color-primary,#7C4DFF)] dark:hover:bg-[var(--color-bg-tertiary,#2D2A35)] dark:hover:border-[var(--color-primary,#7C4DFF)]">Load More</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
