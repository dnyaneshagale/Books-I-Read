import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import listApi from '../api/listApi';
import bookApi from '../api/bookApi';
import CreateListModal from '../components/CreateListModal';
import toast from 'react-hot-toast';

export default function MyListsPage() {
  const [lists, setLists] = useState([]);
  const [savedLists, setSavedLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('my');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedSaved, setExpandedSaved] = useState(null);
  const [addingBook, setAddingBook] = useState(null);
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

  // Shared tab classes
  const tabCls = (active) => `flex-1 py-2.5 px-4 border-none rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200 ${active ? 'bg-primary dark:bg-[#7C4DFF] text-white shadow-sm' : 'bg-transparent text-txt-secondary dark:text-[#9E95A8] hover:text-txt-primary dark:hover:text-[#E2D9F3] hover:bg-bg-secondary dark:hover:bg-[#2D2A35]'}`;

  return (
    <div className="max-w-[800px] mx-auto py-8 px-5 pb-20 min-h-screen animate-fade-in-up">
      <button className="page-back-btn" onClick={() => navigate(-1)}>← Back</button>
      <div className="flex justify-between items-start mb-6 flex-wrap gap-4 max-[600px]:flex-col max-[600px]:gap-3.5">
        <div>
          <h1 className="m-0 text-[1.5rem] font-extrabold text-txt-primary dark:text-[#E2D9F3] tracking-tight">📚 My Lists</h1>
          <p className="mt-1.5 mb-0 text-sm text-txt-secondary dark:text-[#9E95A8]">
            Curate and share your favourite book collections
          </p>
        </div>
        <div className="flex gap-2.5 max-[600px]:w-full">
          <button className="py-2.5 px-5 border border-border dark:border-[#2D2A35] rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200 bg-bg dark:bg-[#1E1B24] text-txt-primary dark:text-[#E2D9F3] whitespace-nowrap hover:border-[rgba(109,40,217,0.3)] hover:text-primary hover:bg-[rgba(109,40,217,0.04)] hover:-translate-y-px hover:shadow-[0_2px_8px_rgba(109,40,217,0.1)] max-[600px]:flex-1 max-[600px]:text-center" onClick={() => navigate('/lists/browse')}>
            🔍 Browse Lists
          </button>
          {activeTab === 'my' && (
            <button className="py-2.5 px-5 bg-gradient-to-br from-primary to-[#7c3aed] text-white border-none rounded-xl text-sm font-bold cursor-pointer transition-all duration-200 shadow-[0_2px_8px_rgba(109,40,217,0.25)] whitespace-nowrap hover:-translate-y-px hover:shadow-[0_4px_14px_rgba(109,40,217,0.35)] max-[600px]:flex-1 max-[600px]:text-center" onClick={() => setShowCreateModal(true)}>
              + New List
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-bg dark:bg-[#1E1B24] border border-border dark:border-[#2D2A35] rounded-2xl p-1">
        <button className={tabCls(activeTab === 'my')} onClick={() => setActiveTab('my')}>
          My Lists
          {lists.length > 0 && <span className="ml-2 py-0.5 px-2 rounded-full text-xs font-semibold bg-[rgba(109,40,217,0.08)] text-primary dark:bg-[rgba(124,77,255,0.15)] dark:text-[#7C4DFF]">{lists.length}</span>}
        </button>
        <button className={tabCls(activeTab === 'saved')} onClick={() => setActiveTab('saved')}>
          Saved Lists
          {savedLists.length > 0 && <span className="ml-2 py-0.5 px-2 rounded-full text-xs font-semibold bg-[rgba(109,40,217,0.08)] text-primary dark:bg-[rgba(124,77,255,0.15)] dark:text-[#7C4DFF]">{savedLists.length}</span>}
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton-card" style={{ animationDelay: `${(i - 1) * 80}ms` }}>
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
        /* My Lists Tab */
        lists.length === 0 ? (
          <div className="text-center py-16 px-6 bg-bg-secondary dark:bg-[#1E1B24] border border-border dark:border-[#2D2A35] rounded-2xl">
            <span className="text-[3.5rem] block mb-3">📋</span>
            <h3 className="m-0 mb-2 text-lg font-bold text-txt-primary dark:text-[#E2D9F3]">No lists yet</h3>
            <p className="m-0 mb-6 text-sm text-txt-secondary dark:text-[#9E95A8]">Create your first reading list and start curating!</p>
            <button className="py-2.5 px-5 bg-gradient-to-br from-primary to-[#7c3aed] text-white border-none rounded-xl text-sm font-bold cursor-pointer shadow-[0_2px_8px_rgba(109,40,217,0.25)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_4px_14px_rgba(109,40,217,0.35)]" onClick={() => setShowCreateModal(true)}>
              + Create Your First List
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 stagger-children" key={activeTab}>
            {lists.map((list) => (
              <div
                key={list.id}
                className="flex items-center gap-3.5 p-4 bg-bg dark:bg-[#1E1B24] border border-border dark:border-[#2D2A35] rounded-xl cursor-pointer transition-all duration-200 shadow-xs hover:border-[rgba(109,40,217,0.15)] dark:hover:border-[rgba(124,77,255,0.2)] hover:bg-bg-hover dark:hover:bg-[#2D2A35] hover:shadow-sm hover:-translate-y-px"
                onClick={() => navigate(`/lists/${list.id}`)}
              >
                <div className="text-[1.8rem] w-12 h-12 flex items-center justify-center bg-gradient-to-br from-[rgba(109,40,217,0.06)] dark:from-[rgba(124,77,255,0.12)] to-[rgba(37,99,235,0.04)] dark:to-[rgba(149,117,255,0.06)] rounded-xl flex-shrink-0">{list.coverEmoji}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="m-0 text-base font-bold text-txt-primary dark:text-[#E2D9F3] whitespace-nowrap overflow-hidden text-ellipsis">{list.name}</h3>
                  {list.description && (
                    <p className="mt-1 mb-0 text-xs text-txt-secondary dark:text-[#9E95A8] whitespace-nowrap overflow-hidden text-ellipsis">{list.description}</p>
                  )}
                  <div className="flex gap-3.5 mt-2 text-xs text-txt-light dark:text-[#7a7181]">
                    <span>📖 {list.booksCount} book{list.booksCount !== 1 ? 's' : ''}</span>
                    <span>❤️ {list.likesCount}</span>
                    <span className={list.public ? 'text-primary dark:text-[#7C4DFF]' : 'text-amber-600 dark:text-amber-400'}>
                      {list.public ? '🌍 Public' : '🔒 Private'}
                    </span>
                  </div>
                </div>
                <button
                  className="bg-none border-none text-txt-light dark:text-[#5a5268] cursor-pointer p-1.5 rounded-lg transition-all duration-200 flex-shrink-0 hover:bg-[rgba(239,68,68,0.06)] dark:hover:bg-[rgba(239,68,68,0.1)] hover:text-red-500 dark:hover:text-red-400"
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
        /* Saved Lists Tab */
        savedLists.length === 0 ? (
          <div className="text-center py-16 px-6 bg-bg-secondary dark:bg-[#1E1B24] border border-border dark:border-[#2D2A35] rounded-2xl">
            <span className="text-[3.5rem] block mb-3">🔖</span>
            <h3 className="m-0 mb-2 text-lg font-bold text-txt-primary dark:text-[#E2D9F3]">No saved lists</h3>
            <p className="m-0 mb-6 text-sm text-txt-secondary dark:text-[#9E95A8]">Like lists from other users to save them here for quick access.</p>
            <button className="py-2.5 px-5 bg-gradient-to-br from-primary to-[#7c3aed] text-white border-none rounded-xl text-sm font-bold cursor-pointer shadow-[0_2px_8px_rgba(109,40,217,0.25)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_4px_14px_rgba(109,40,217,0.35)]" onClick={() => navigate('/lists/browse')}>
              Browse Lists
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 stagger-children" key={activeTab}>
            {savedLists.map((list) => (
              <div key={list.id} className="bg-bg dark:bg-[#1E1B24] border border-border dark:border-[#2D2A35] rounded-2xl shadow-xs overflow-hidden transition-all duration-200 hover:shadow-sm hover:-translate-y-px hover:border-[rgba(109,40,217,0.15)] dark:hover:border-[rgba(124,77,255,0.2)]">
                <div
                  className="flex items-center gap-3.5 p-4 cursor-pointer"
                  onClick={() => navigate(`/lists/${list.id}`)}
                >
                  <div className="text-[1.8rem] w-12 h-12 flex items-center justify-center bg-gradient-to-br from-[rgba(109,40,217,0.06)] dark:from-[rgba(124,77,255,0.12)] to-[rgba(37,99,235,0.04)] dark:to-[rgba(149,117,255,0.06)] rounded-xl flex-shrink-0">{list.coverEmoji}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="m-0 text-base font-bold text-txt-primary dark:text-[#E2D9F3] whitespace-nowrap overflow-hidden text-ellipsis">{list.name}</h3>
                    <p className="mt-0.5 mb-0 text-xs text-primary dark:text-[#7C4DFF] font-semibold">by @{list.ownerUsername}</p>
                    <div className="flex gap-3.5 mt-2 text-xs text-txt-light dark:text-[#7a7181]">
                      <span>📖 {list.booksCount} book{list.booksCount !== 1 ? 's' : ''}</span>
                      <span>❤️ {list.likesCount}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="bg-none border border-border dark:border-[#2D2A35] w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer text-txt-secondary dark:text-[#9E95A8] transition-all duration-200 hover:bg-bg-secondary dark:hover:bg-[#2D2A35] hover:border-primary dark:hover:border-[#7C4DFF] hover:text-primary dark:hover:text-[#7C4DFF]"
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
                      className="bg-none border border-border dark:border-[#2D2A35] w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer text-txt-secondary dark:text-[#9E95A8] transition-all duration-200 hover:bg-[rgba(239,68,68,0.08)] dark:hover:bg-[rgba(239,68,68,0.12)] hover:text-red-500 dark:hover:text-red-400"
                      onClick={(e) => handleUnsaveList(list.id, e)}
                      title="Remove from saved"
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
                    </button>
                  </div>
                </div>

                {/* Expanded book list */}
                {expandedSaved === list.id && list.items && (
                  <div className="border-t border-border dark:border-[#2D2A35] py-2 px-4 max-h-80 overflow-y-auto">
                    {list.items.length === 0 ? (
                      <p className="text-center text-txt-secondary dark:text-[#9E95A8] text-sm py-6">No books in this list yet.</p>
                    ) : (
                      list.items.map((item) => {
                        const bookKey = `${item.bookTitle}-${item.bookAuthor}`;
                        return (
                          <div key={item.id} className="flex items-center gap-3 py-2.5 px-2 rounded-lg transition-colors duration-150 hover:bg-bg-secondary dark:hover:bg-[#2D2A35]">
                            <div className="flex-1 min-w-0">
                              <span className="block text-sm font-semibold text-txt-primary dark:text-[#E2D9F3] whitespace-nowrap overflow-hidden text-ellipsis">{item.bookTitle}</span>
                              <span className="block text-xs text-txt-secondary dark:text-[#9E95A8] mt-0.5">{item.bookAuthor}</span>
                            </div>
                            <button
                              className="flex items-center gap-1.5 py-1 px-2.5 border border-border dark:border-[#2D2A35] bg-[rgba(109,40,217,0.06)] dark:bg-[rgba(124,77,255,0.1)] text-primary dark:text-[#7C4DFF] rounded-full text-xs font-semibold cursor-pointer transition-all duration-200 whitespace-nowrap flex-shrink-0 hover:not-disabled:bg-primary hover:not-disabled:text-white hover:not-disabled:border-primary disabled:opacity-60 disabled:cursor-not-allowed"
                              onClick={() => handleAddBookToLibrary(item)}
                              disabled={addingBook === bookKey}
                              title="Add to my library"
                            >
                              {addingBook === bookKey ? (
                                <span className="inline-block w-3.5 h-3.5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                              ) : (
                                <>
                                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
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
