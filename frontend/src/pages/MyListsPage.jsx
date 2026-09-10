import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import listApi from '../api/listApi';
import bookApi from '../api/bookApi';
import CreateListModal from '../components/CreateListModal';
import toast from 'react-hot-toast';
import { Library, Search, BookOpen, Heart, Globe, Lock, Trash2, Bookmark } from 'lucide-react';

const pageCls = 'my-lists-page max-w-[800px] lg:max-w-[860px] mx-auto px-5 pt-8 min-h-screen animate-[g-fadeInUp_0.5s_cubic-bezier(0.16,1,0.3,1)_both]';

const browseBtnCls = 'py-2.5 px-5 border border-slate-300 bg-white text-slate-700 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200 whitespace-nowrap hover:border-violet-400 hover:text-violet-700 hover:bg-violet-50 hover:-translate-y-px hover:shadow-[0_2px_8px_rgba(109,40,217,0.1)] dark:bg-[#1E1B24] dark:border-[#2D2A35] dark:text-[#E2D9F3] dark:hover:border-[#7C4DFF] dark:hover:text-[#9575FF] dark:hover:bg-[rgba(124,77,255,0.08)] max-[600px]:flex-1 max-[600px]:text-center';

const createBtnCls = 'bg-gradient-to-br from-violet-700 via-violet-600 to-blue-600 text-white border-none rounded-xl py-2.5 px-[22px] text-sm font-bold cursor-pointer transition-all duration-200 whitespace-nowrap shadow-[0_2px_8px_rgba(109,40,217,0.25)] relative overflow-hidden before:content-[""] before:absolute before:top-1/2 before:left-1/2 before:w-0 before:h-0 before:rounded-full before:bg-white/30 before:-translate-x-1/2 before:-translate-y-1/2 before:transition-[width,height] before:duration-400 hover:before:w-[200px] hover:before:h-[200px] hover:-translate-y-px hover:shadow-[0_4px_14px_rgba(109,40,217,0.35)] max-[600px]:flex-1 max-[600px]:text-center';

const tabBase = 'flex-1 py-2.5 px-4 border-none bg-transparent rounded-xl text-sm font-semibold text-slate-600 cursor-pointer transition-all duration-[250ms] flex items-center justify-center gap-2 hover:text-slate-900 hover:bg-slate-100 dark:text-[#9E95A8] dark:hover:text-[#E2D9F3] dark:hover:bg-[#2D2A35]';
const tabActive = 'bg-gradient-to-br from-violet-700 via-violet-600 to-blue-600 !text-white shadow-[0_2px_8px_rgba(109,40,217,0.25)] dark:from-[#7C4DFF] dark:to-[#9575FF] dark:shadow-[0_2px_8px_rgba(124,77,255,0.3)]';

const listCardCls = 'flex items-center gap-4 py-[18px] px-[22px] bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-[250ms] relative hover:border-[rgba(109,40,217,0.2)] hover:shadow-[0_6px_18px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 dark:bg-[var(--color-bg-secondary)] dark:border-[var(--color-border)] dark:hover:border-[rgba(124,77,255,0.3)] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)] group';

const emojiCls = 'text-[2rem] w-14 h-14 flex items-center justify-center bg-[linear-gradient(135deg,rgba(109,40,217,0.06),rgba(37,99,235,0.04))] rounded-xl shrink-0 dark:bg-[linear-gradient(135deg,rgba(124,77,255,0.12),rgba(149,117,255,0.06))]';

const savedCardCls = 'bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden transition-all duration-[250ms] hover:border-[rgba(109,40,217,0.2)] hover:shadow-[0_6px_18px_rgba(15,23,42,0.08)] dark:bg-[var(--color-bg-secondary)] dark:border-[var(--color-border)] dark:hover:border-[rgba(124,77,255,0.3)] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)]';

const addBtnCls = 'flex items-center gap-1 py-[5px] px-3 border border-[rgba(109,40,217,0.2)] bg-[rgba(109,40,217,0.06)] text-[#6d28d9] rounded-full text-xs font-semibold cursor-pointer transition-all duration-200 whitespace-nowrap shrink-0 hover:enabled:bg-[#6d28d9] hover:enabled:text-white hover:enabled:border-[#6d28d9] disabled:opacity-60 disabled:cursor-not-allowed dark:border-[rgba(124,77,255,0.25)] dark:bg-[rgba(124,77,255,0.1)] dark:text-[#9575FF] dark:hover:enabled:bg-[#7C4DFF] dark:hover:enabled:text-white dark:hover:enabled:border-[#7C4DFF]';

export default function MyListsPage() {
  const [activeTab, setActiveTab] = useState('my');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedSaved, setExpandedSaved] = useState(null);
  const [addingBook, setAddingBook] = useState(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const myListsQuery = useQuery({
    queryKey: ['lists', 'mine'],
    queryFn: async () => {
      const res = await listApi.getMyLists();
      return res.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  const savedListsQuery = useQuery({
    queryKey: ['lists', 'saved'],
    queryFn: async () => {
      const res = await listApi.getSavedLists();
      return res.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  const lists = myListsQuery.data || [];
  const savedLists = savedListsQuery.data || [];
  const loading = myListsQuery.isLoading || savedListsQuery.isLoading;

  const handleCreateList = async (data) => {
    await listApi.createList(data);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['lists', 'mine'] }),
      queryClient.invalidateQueries({ queryKey: ['lists', 'saved'] }),
      queryClient.invalidateQueries({ queryKey: ['lists', 'browse'] }),
    ]);
  };
  const handleDeleteList = async (listId, e) => {
    e.stopPropagation();
    if (!confirm('Delete this list? This cannot be undone.')) return;
    try {
      await listApi.deleteList(listId);
      queryClient.setQueryData(['lists', 'mine'], (prev = []) => prev.filter((l) => l.id !== listId));
      queryClient.setQueryData(['lists', 'saved'], (prev = []) => prev.filter((l) => l.id !== listId));
      await queryClient.invalidateQueries({ queryKey: ['lists', 'browse'] });
    }
    catch (err) { console.error('Failed to delete list:', err); }
  };
  const handleUnsaveList = async (listId, e) => {
    e.stopPropagation();
    try {
      await listApi.toggleLike(listId);
      queryClient.setQueryData(['lists', 'saved'], (prev = []) => prev.filter((l) => l.id !== listId));
      await queryClient.invalidateQueries({ queryKey: ['lists', 'browse'] });
      toast.success('List removed from saved');
    }
    catch (err) { console.error('Failed to unsave list:', err); }
  };
  const handleAddBookToLibrary = async (item) => {
    const key = `${item.bookTitle}-${item.bookAuthor}`;
    setAddingBook(key);
    try {
      await bookApi.createBook({ title: item.bookTitle, author: item.bookAuthor || 'Unknown', status: 'WANT_TO_READ', totalPages: 1, pagesRead: 0 });
      toast.success(`"${item.bookTitle}" added to your library!`);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || '';
      if (typeof msg === 'string' && msg.toLowerCase().includes('already')) toast.error('This book is already in your library');
      else toast.error('Failed to add book');
    } finally { setAddingBook(null); }
  };
  const toggleExpandSaved = (listId, e) => { e.stopPropagation(); setExpandedSaved((prev) => (prev === listId ? null : listId)); };

  return (
    <div className={pageCls}>
      <button className="page-back-btn" onClick={() => navigate(-1)}>← Back</button>
      <div className="flex justify-between items-start mb-7 max-[600px]:flex-col max-[600px]:gap-3.5">
        <div>
          <h1 className="m-0 text-[1.6rem] font-extrabold text-[var(--color-text-primary)] tracking-tight dark:text-[var(--color-text-primary)]"><Library className="w-7 h-7 inline mr-2" />My Lists</h1>
          <p className="mt-1.5 text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-secondary)]">Curate and share your favourite book collections</p>
        </div>
        <div className="flex gap-2.5 items-center shrink-0 max-[600px]:w-full">
          <button className={browseBtnCls} onClick={() => navigate('/lists/browse')}><Search className="w-4 h-4 inline mr-1" />Browse Lists</button>
          {activeTab === 'my' && (
            <button className={createBtnCls} onClick={() => setShowCreateModal(true)}>+ New List</button>
          )}
        </div>
      </div>

      <div className="flex gap-1 mb-5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl p-1 shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:bg-[var(--color-bg-secondary)] dark:border-[var(--color-border)]">
        <button className={`${tabBase} ${activeTab === 'my' ? tabActive : ''}`} onClick={() => setActiveTab('my')}>
          My Lists
          {lists.length > 0 && <span className={activeTab === 'my' ? 'text-[11px] font-bold bg-white/20 py-px px-[7px] rounded-[10px] min-w-5 text-center' : 'text-[11px] font-bold bg-[rgba(109,40,217,0.08)] text-[#6d28d9] py-px px-[7px] rounded-[10px] min-w-5 text-center dark:bg-[rgba(124,77,255,0.15)] dark:text-[#9575FF]'}>{lists.length}</span>}
        </button>
        <button className={`${tabBase} ${activeTab === 'saved' ? tabActive : ''}`} onClick={() => setActiveTab('saved')}>
          Saved Lists
          {savedLists.length > 0 && <span className={activeTab === 'saved' ? 'text-[11px] font-bold bg-white/20 py-px px-[7px] rounded-[10px] min-w-5 text-center' : 'text-[11px] font-bold bg-[rgba(109,40,217,0.08)] text-[#6d28d9] py-px px-[7px] rounded-[10px] min-w-5 text-center dark:bg-[rgba(124,77,255,0.15)] dark:text-[#9575FF]'}>{savedLists.length}</span>}
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton-card animate-[g-fadeIn_0.4s_ease_both]" style={{ animationDelay: `${(i - 1) * 0.08}s` }}>
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
        lists.length === 0 ? (
          <div className="text-center py-[72px] px-8 bg-[var(--color-bg)] rounded-2xl border border-[var(--color-border)] shadow-[0_1px_2px_rgba(0,0,0,0.06)] dark:bg-[var(--color-bg-secondary)] dark:border-[var(--color-border)]">
            <span className="text-[3.5rem] block mb-3 mx-auto w-fit"><Bookmark className="w-14 h-14" /></span>
            <h3 className="m-0 mb-2 text-lg font-bold text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]">No lists yet</h3>
            <p className="mb-6 text-[var(--color-text-secondary)] text-sm dark:text-[var(--color-text-secondary)]">Create your first reading list and start curating!</p>
            <button className={createBtnCls} onClick={() => setShowCreateModal(true)}>+ Create Your First List</button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 stagger-children" key={activeTab}>
            {lists.map((list) => (
              <div key={list.id} className={listCardCls} onClick={() => navigate(`/lists/${list.id}`)}>
                <div className={emojiCls}>{list.coverEmoji}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="m-0 text-base font-bold text-[var(--color-text-primary)] whitespace-nowrap overflow-hidden text-ellipsis dark:text-[var(--color-text-primary)]">{list.name}</h3>
                  {list.description && <p className="mt-1 text-xs text-[var(--color-text-secondary)] whitespace-nowrap overflow-hidden text-ellipsis dark:text-[var(--color-text-secondary)]">{list.description}</p>}
                  <div className="flex gap-3.5 mt-2 text-xs text-[var(--color-text-light,#94a3b8)] dark:text-[#7a7181]">
                      <span><BookOpen className="w-3.5 h-3.5 inline mr-1" />{list.booksCount} book{list.booksCount !== 1 ? 's' : ''}</span>
                      <span><Heart className="w-3.5 h-3.5 inline mr-1" />{list.likesCount}</span>
                    <span className={list.public ? '' : 'text-[#d97706]'}>
                      {list.public ? <><Globe className="w-3.5 h-3.5 inline mr-1" />Public</> : <><Lock className="w-3.5 h-3.5 inline mr-1" />Private</>}
                    </span>
                  </div>
                </div>
                <button className="bg-none border-none text-base cursor-pointer p-2 rounded-lg opacity-0 transition-all duration-200 text-[var(--color-text-light,#94a3b8)] group-hover:opacity-60 hover:!opacity-100 hover:bg-[rgba(239,68,68,0.06)] hover:text-[var(--color-danger,#ef4444)] dark:hover:bg-[rgba(239,68,68,0.1)] dark:hover:text-[#f87171]" onClick={(e) => handleDeleteList(list.id, e)} title="Delete list"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        )
      ) : (
        savedLists.length === 0 ? (
          <div className="text-center py-[72px] px-8 bg-[var(--color-bg)] rounded-2xl border border-[var(--color-border)] shadow-[0_1px_2px_rgba(0,0,0,0.06)] dark:bg-[var(--color-bg-secondary)] dark:border-[var(--color-border)]">
            <span className="text-[3.5rem] block mb-3 mx-auto w-fit"><Bookmark className="w-14 h-14" /></span>
            <h3 className="m-0 mb-2 text-lg font-bold text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]">No saved lists</h3>
            <p className="mb-6 text-[var(--color-text-secondary)] text-sm dark:text-[var(--color-text-secondary)]">Like lists from other users to save them here for quick access.</p>
            <button className={createBtnCls} onClick={() => navigate('/lists/browse')}>Browse Lists</button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 stagger-children" key={activeTab}>
            {savedLists.map((list) => (
              <div key={list.id} className={savedCardCls}>
                <div className="flex items-center gap-4 py-[18px] px-[22px] cursor-pointer" onClick={() => navigate(`/lists/${list.id}`)}>
                  <div className={emojiCls}>{list.coverEmoji}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="m-0 text-base font-bold text-[var(--color-text-primary)] whitespace-nowrap overflow-hidden text-ellipsis dark:text-[var(--color-text-primary)]">{list.name}</h3>
                    <p className="mt-0.5 text-xs text-[#6d28d9] font-semibold dark:text-[#9575FF]">by @{list.ownerUsername}</p>
                    <div className="flex gap-3.5 mt-2 text-xs text-[var(--color-text-light,#94a3b8)] dark:text-[#7a7181]">
                      <span><BookOpen className="w-3.5 h-3.5 inline mr-1" />{list.booksCount} book{list.booksCount !== 1 ? 's' : ''}</span>
                      <span><Heart className="w-3.5 h-3.5 inline mr-1" />{list.likesCount}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button className="bg-none border-none p-1.5 rounded-lg cursor-pointer text-[var(--color-text-light,#94a3b8)] transition-all duration-200 flex items-center justify-center hover:bg-[rgba(109,40,217,0.08)] hover:text-[#6d28d9] dark:hover:bg-[rgba(124,77,255,0.12)] dark:hover:text-[#9575FF]" onClick={(e) => toggleExpandSaved(list.id, e)} title={expandedSaved === list.id ? 'Collapse' : 'View books'}>
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {expandedSaved === list.id ? <polyline points="18 15 12 9 6 15" /> : <polyline points="6 9 12 15 18 9" />}
                      </svg>
                    </button>
                    <button className="bg-none border-none p-1.5 rounded-lg cursor-pointer text-[var(--color-text-light,#94a3b8)] transition-all duration-200 flex items-center justify-center hover:bg-[rgba(239,68,68,0.08)] hover:text-[var(--color-danger,#ef4444)] dark:hover:bg-[rgba(239,68,68,0.12)] dark:hover:text-[#f87171]" onClick={(e) => handleUnsaveList(list.id, e)} title="Remove from saved">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                    </button>
                  </div>
                </div>
                {expandedSaved === list.id && list.items && (
                  <div className="border-t border-[var(--color-border)] px-4 pt-2 pb-3 max-h-80 overflow-y-auto dark:border-[var(--color-border)]">
                    {list.items.length === 0 ? (
                      <p className="text-center text-[var(--color-text-secondary)] text-sm py-4">No books in this list yet.</p>
                    ) : (
                      list.items.map((item) => {
                        const bookKey = `${item.bookTitle}-${item.bookAuthor}`;
                        return (
                          <div key={item.id} className="flex items-center justify-between gap-3 py-2.5 px-2 rounded-lg transition-[background] duration-150 hover:bg-[var(--color-bg-hover,#f8fafc)] dark:hover:bg-[var(--color-bg-tertiary,#2D2A35)]">
                            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                              <span className="text-sm font-semibold text-[var(--color-text-primary)] whitespace-nowrap overflow-hidden text-ellipsis dark:text-[var(--color-text-primary)]">{item.bookTitle}</span>
                              <span className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-text-secondary)]">{item.bookAuthor}</span>
                            </div>
                            <button className={addBtnCls} onClick={() => handleAddBookToLibrary(item)} disabled={addingBook === bookKey} title="Add to my library">
                              {addingBook === bookKey ? (
                                <span className="w-3.5 h-3.5 border-2 border-[rgba(109,40,217,0.2)] border-t-[#6d28d9] rounded-full animate-[g-spin_0.6s_linear_infinite] dark:border-[rgba(124,77,255,0.2)] dark:border-t-[#9575FF]" />
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
      {showCreateModal && <CreateListModal onClose={() => setShowCreateModal(false)} onSave={handleCreateList} />}
    </div>
  );
}
