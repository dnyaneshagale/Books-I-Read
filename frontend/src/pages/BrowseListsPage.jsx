import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import listApi from '../api/listApi';
import './BrowseListsPage.css';

export default function BrowseListsPage() {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadLists();
  }, []);

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

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) {
      setSearching(false);
      setLoading(true);
      await loadLists(0);
      return;
    }
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
    <div className="browse-lists-page">
      <button className="page-back-btn" onClick={() => navigate(-1)}>← Back</button>
      <div className="browse-lists-page__header">
        <h1>🔍 Discover Lists</h1>
        <p>Explore curated book collections from the community</p>
      </div>

      <form className="browse-lists-page__search" onSubmit={handleSearch}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search lists..."
        />
        <button type="submit">Search</button>
        {searching && (
          <button type="button" onClick={() => { setSearchQuery(''); setSearching(false); loadLists(0); }}>
            Clear
          </button>
        )}
      </form>

      {loading ? (
        <div className="browse-lists-page__loading">Loading lists...</div>
      ) : lists.length === 0 ? (
        <div className="browse-lists-page__empty">
          <p>{searching ? 'No lists found for your search.' : 'No public lists yet. Be the first to create one!'}</p>
        </div>
      ) : (
        <>
          <div className="browse-lists-page__grid">
            {lists.map((list) => (
              <div
                key={list.id}
                className="browse-list-card"
                onClick={() => navigate(`/lists/${list.id}`)}
              >
                <div className="browse-list-card__top">
                  <span className="browse-list-card__emoji">{list.coverEmoji}</span>
                  <button
                    className={`browse-list-card__like ${list.likedByViewer ? 'liked' : ''}`}
                    onClick={(e) => handleToggleLike(list.id, e)}
                  >
                    {list.likedByViewer ? '❤️' : '🤍'} {list.likesCount}
                  </button>
                </div>
                <h3 className="browse-list-card__name">{list.name}</h3>
                {list.description && (
                  <p className="browse-list-card__desc">{list.description}</p>
                )}
                <div className="browse-list-card__footer">
                  <span className="browse-list-card__owner">
                    @{list.ownerUsername}
                  </span>
                  <span className="browse-list-card__count">
                    📖 {list.booksCount}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="browse-lists-page__load-more">
              <button onClick={() => loadLists(page + 1)}>Load More</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
