import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import listApi from '../api/listApi';
import bookApi from '../api/bookApi';
import CreateListModal from '../components/CreateListModal';
import toast from 'react-hot-toast';
import './MyListsPage.css';

export default function MyListsPage() {
  const [lists, setLists] = useState([]);
  const [savedLists, setSavedLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('my'); // 'my' | 'saved'
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedSaved, setExpandedSaved] = useState(null);
  const [addingBook, setAddingBook] = useState(null); // track which book is being added
  const navigate = useNavigate();

  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = async () => {
    try {
      const [myRes, savedRes] = await Promise.all([
        listApi.getMyLists(),
        listApi.getSavedLists(),
      ]);
      setLists(myRes.data);
      setSavedLists(savedRes.data);
    } catch (err) {
      console.error('Failed to load lists:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateList = async (data) => {
    await listApi.createList(data);
    await loadLists();
  };

  const handleDeleteList = async (listId, e) => {
    e.stopPropagation();
    if (!confirm('Delete this list? This cannot be undone.')) return;
    try {
      await listApi.deleteList(listId);
      setLists((prev) => prev.filter((l) => l.id !== listId));
    } catch (err) {
      console.error('Failed to delete list:', err);
    }
  };

  const handleUnsaveList = async (listId, e) => {
    e.stopPropagation();
    try {
      await listApi.toggleLike(listId);
      setSavedLists((prev) => prev.filter((l) => l.id !== listId));
      toast.success('List removed from saved');
    } catch (err) {
      console.error('Failed to unsave list:', err);
    }
  };

  const handleAddBookToLibrary = async (item) => {
    const key = `${item.bookTitle}-${item.bookAuthor}`;
    setAddingBook(key);
    try {
      await bookApi.createBook({
        title: item.bookTitle,
        author: item.bookAuthor || 'Unknown',
        status: 'WANT_TO_READ',
        totalPages: 1,
        pagesRead: 0,
      });
      toast.success(`"${item.bookTitle}" added to your library!`);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || '';
      if (typeof msg === 'string' && msg.toLowerCase().includes('already')) {
        toast.error('This book is already in your library');
      } else {
        toast.error('Failed to add book');
      }
    } finally {
      setAddingBook(null);
    }
  };

  const toggleExpandSaved = (listId, e) => {
    e.stopPropagation();
    setExpandedSaved((prev) => (prev === listId ? null : listId));
  };

  return (
    <div className="my-lists-page">
      <button className="page-back-btn" onClick={() => navigate(-1)}>← Back</button>
      <div className="my-lists-page__header">
        <div>
          <h1>📚 My Lists</h1>
          <p className="my-lists-page__subtitle">
            Curate and share your favourite book collections
          </p>
        </div>
        <div className="my-lists-page__header-actions">
          <button className="my-lists-page__browse-btn" onClick={() => navigate('/lists/browse')}>
            🔍 Browse Lists
          </button>
          {activeTab === 'my' && (
            <button className="my-lists-page__create-btn" onClick={() => setShowCreateModal(true)}>
              + New List
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="my-lists-page__tabs">
        <button
          className={`my-lists-page__tab ${activeTab === 'my' ? 'active' : ''}`}
          onClick={() => setActiveTab('my')}
        >
          My Lists
          {lists.length > 0 && <span className="my-lists-page__tab-count">{lists.length}</span>}
        </button>
        <button
          className={`my-lists-page__tab ${activeTab === 'saved' ? 'active' : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          Saved Lists
          {savedLists.length > 0 && <span className="my-lists-page__tab-count">{savedLists.length}</span>}
        </button>
      </div>

      {loading ? (
        <div className="my-lists-page__grid">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton-card my-lists__skeleton-card">
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <div className="skeleton" style={{ width: 48, height: 48, borderRadius: 12 }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton skeleton-text skeleton-text--lg" />
                  <div className="skeleton skeleton-text skeleton-text--md" />
                  <div className="skeleton skeleton-text skeleton-text--sm" style={{ marginBottom: 0 }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : activeTab === 'my' ? (
        /* ── My Lists Tab ── */
        lists.length === 0 ? (
          <div className="my-lists-page__empty">
            <span className="my-lists-page__empty-icon">📋</span>
            <h3>No lists yet</h3>
            <p>Create your first reading list and start curating!</p>
            <button className="my-lists-page__create-btn" onClick={() => setShowCreateModal(true)}>
              + Create Your First List
            </button>
          </div>
        ) : (
          <div className="my-lists-page__grid stagger-children" key={activeTab}>
            {lists.map((list) => (
              <div
                key={list.id}
                className="list-card"
                onClick={() => navigate(`/lists/${list.id}`)}
              >
                <div className="list-card__emoji">{list.coverEmoji}</div>
                <div className="list-card__body">
                  <h3 className="list-card__name">{list.name}</h3>
                  {list.description && (
                    <p className="list-card__desc">{list.description}</p>
                  )}
                  <div className="list-card__meta">
                    <span>📖 {list.booksCount} book{list.booksCount !== 1 ? 's' : ''}</span>
                    <span>❤️ {list.likesCount}</span>
                    <span className={`list-card__visibility ${list.public ? '' : 'private'}`}>
                      {list.public ? '🌍 Public' : '🔒 Private'}
                    </span>
                  </div>
                </div>
                <button
                  className="list-card__delete"
                  onClick={(e) => handleDeleteList(list.id, e)}
                  title="Delete list"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )
      ) : (
        /* ── Saved Lists Tab ── */
        savedLists.length === 0 ? (
          <div className="my-lists-page__empty">
            <span className="my-lists-page__empty-icon">🔖</span>
            <h3>No saved lists</h3>
            <p>Like lists from other users to save them here for quick access.</p>
            <button className="my-lists-page__create-btn" onClick={() => navigate('/lists/browse')}>
              Browse Lists
            </button>
          </div>
        ) : (
          <div className="my-lists-page__grid stagger-children" key={activeTab}>
            {savedLists.map((list) => (
              <div key={list.id} className="saved-list-card">
                <div
                  className="saved-list-card__header"
                  onClick={() => navigate(`/lists/${list.id}`)}
                >
                  <div className="list-card__emoji">{list.coverEmoji}</div>
                  <div className="list-card__body">
                    <h3 className="list-card__name">{list.name}</h3>
                    <p className="saved-list-card__owner">by @{list.ownerUsername}</p>
                    <div className="list-card__meta">
                      <span>📖 {list.booksCount} book{list.booksCount !== 1 ? 's' : ''}</span>
                      <span>❤️ {list.likesCount}</span>
                    </div>
                  </div>
                  <div className="saved-list-card__actions">
                    <button
                      className="saved-list-card__expand-btn"
                      onClick={(e) => toggleExpandSaved(list.id, e)}
                      title={expandedSaved === list.id ? 'Collapse' : 'View books'}
                    >
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {expandedSaved === list.id ? (
                          <polyline points="18 15 12 9 6 15" />
                        ) : (
                          <polyline points="6 9 12 15 18 9" />
                        )}
                      </svg>
                    </button>
                    <button
                      className="saved-list-card__unsave-btn"
                      onClick={(e) => handleUnsaveList(list.id, e)}
                      title="Remove from saved"
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                    </button>
                  </div>
                </div>

                {/* Expanded book list */}
                {expandedSaved === list.id && list.items && (
                  <div className="saved-list-card__books">
                    {list.items.length === 0 ? (
                      <p className="saved-list-card__no-books">No books in this list yet.</p>
                    ) : (
                      list.items.map((item) => {
                        const bookKey = `${item.bookTitle}-${item.bookAuthor}`;
                        return (
                          <div key={item.id} className="saved-list-card__book-row">
                            <div className="saved-list-card__book-info">
                              <span className="saved-list-card__book-title">{item.bookTitle}</span>
                              <span className="saved-list-card__book-author">{item.bookAuthor}</span>
                            </div>
                            <button
                              className="saved-list-card__add-btn"
                              onClick={() => handleAddBookToLibrary(item)}
                              disabled={addingBook === bookKey}
                              title="Add to my library"
                            >
                              {addingBook === bookKey ? (
                                <span className="saved-list-card__spinner" />
                              ) : (
                                <>
                                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                  Add
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {showCreateModal && (
        <CreateListModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateList}
        />
      )}
    </div>
  );
}
