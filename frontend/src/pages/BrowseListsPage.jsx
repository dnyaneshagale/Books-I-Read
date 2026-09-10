import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
    <div className="max-w-[900px] lg:max-w-[960px] mx-auto py-8 px-5 pb-20 min-h-screen animate-fade-in-up">
      <button className="page-back-btn" onClick={() => navigate(-1)}>← Back</button>
      <div className="mb-7">
        <h1 className="m-0 text-[1.6rem] font-extrabold text-txt-primary dark:text-[#E2D9F3] tracking-tight">🔍 Discover Lists</h1>
        <p className="mt-1.5 mb-0 text-sm text-txt-secondary dark:text-[#9E95A8]">Explore curated book collections from the community</p>
      </div>

      <div className="flex gap-2.5 mb-7 max-[600px]:flex-col">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search lists..."
          className="flex-1 py-3 px-[18px] border border-border dark:border-[#2D2A35] rounded-xl text-sm outline-none text-txt-primary dark:text-[#E2D9F3] bg-bg dark:bg-[#1E1B24] transition-all duration-200 font-[inherit] focus:border-primary dark:focus:border-[#7C4DFF] focus:shadow-[0_0_0_3px_rgba(109,40,217,0.08)]"
        />
        {searchQuery && (
          <button type="button" onClick={() => setSearchQuery('')} className="py-3 px-[22px] border-none rounded-xl text-sm font-bold cursor-pointer transition-all duration-200 bg-bg-tertiary dark:bg-[#2D2A35] text-txt-primary dark:text-[#E2D9F3] border border-border dark:border-[#2D2A35] hover:bg-bg-hover dark:hover:bg-[#3a3642]">
            ✕
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4 max-[600px]:grid-cols-1">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="skeleton-card animate-fade-in" style={{ animationDelay: `${(i - 1) * 50}ms` }}>
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
        <div className="text-center py-20 text-txt-secondary dark:text-[#9E95A8] text-sm">
          <p>{searching ? 'No lists found for your search.' : 'No public lists yet. Be the first to create one!'}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4 stagger-children max-[600px]:grid-cols-1">
            {lists.map((list) => (
              <div
                key={list.id}
                className="bg-bg dark:bg-[#1E1B24] border border-border dark:border-[#2D2A35] rounded-2xl p-[22px] cursor-pointer shadow-xs transition-all duration-[250ms] hover:border-[rgba(109,40,217,0.2)] dark:hover:border-[rgba(124,77,255,0.3)] hover:shadow-md dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)] hover:-translate-y-[3px]"
                onClick={() => navigate(`/lists/${list.id}`)}
              >
                <div className="flex justify-between items-start mb-3.5">
                  <span className="text-[2rem] w-[52px] h-[52px] flex items-center justify-center bg-gradient-to-br from-[rgba(109,40,217,0.06)] dark:from-[rgba(124,77,255,0.12)] to-[rgba(37,99,235,0.04)] dark:to-[rgba(149,117,255,0.06)] rounded-xl">{list.coverEmoji}</span>
                  <button
                    className={`bg-none border border-border dark:border-[#2D2A35] rounded-full py-1.5 px-3.5 text-xs cursor-pointer transition-all duration-200 font-semibold text-txt-secondary dark:text-[#9E95A8] active:scale-[0.92] hover:border-[rgba(239,68,68,0.3)] hover:bg-[rgba(239,68,68,0.04)] dark:hover:bg-[rgba(239,68,68,0.08)] hover:text-red-500 ${list.likedByViewer ? '!border-[rgba(239,68,68,0.3)] !bg-[rgba(239,68,68,0.06)] dark:!bg-[rgba(239,68,68,0.1)] !text-red-500 dark:!text-red-400 heart-pop' : ''}`}
                    onClick={(e) => handleToggleLike(list.id, e)}
                  >
                    {list.likedByViewer ? '❤️' : '🤍'} {list.likesCount}
                  </button>
                </div>
                <h3 className="m-0 mb-2 text-[1.05rem] font-bold text-txt-primary dark:text-[#E2D9F3] line-clamp-2">{list.name}</h3>
                {list.description && (
                  <p className="m-0 mb-3.5 text-xs text-txt-secondary dark:text-[#9E95A8] line-clamp-2 leading-normal">{list.description}</p>
                )}
                <div className="flex justify-between text-xs text-txt-light dark:text-[#7a7181]">
                  <span className="text-primary dark:text-[#7C4DFF] font-semibold">
                    @{list.ownerUsername}
                  </span>
                  <span>
                    📖 {list.booksCount}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="text-center mt-7">
              <button onClick={() => loadLists(page + 1)} className="py-3 px-8 border border-border dark:border-[#2D2A35] rounded-xl bg-bg dark:bg-[#1E1B24] text-primary dark:text-[#7C4DFF] text-sm font-bold cursor-pointer transition-all duration-200 shadow-xs hover:bg-bg-hover dark:hover:bg-[#2D2A35] hover:border-primary dark:hover:border-[#7C4DFF] hover:shadow-sm">Load More</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
