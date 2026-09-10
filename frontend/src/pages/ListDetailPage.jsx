import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import listApi from '../api/listApi';
import bookApi from '../api/bookApi';
import CreateListModal from '../components/CreateListModal';
import toast from 'react-hot-toast';

export default function ListDetailPage() {
  const { listId } = useParams();
  const navigate = useNavigate();
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addTitle, setAddTitle] = useState('');
  const [addAuthor, setAddAuthor] = useState('');
  const [addNote, setAddNote] = useState('');
  const [adding, setAdding] = useState(false);

  const [showBookPicker, setShowBookPicker] = useState(false);
  const [myBooks, setMyBooks] = useState([]);
  const [bookSearchQuery, setBookSearchQuery] = useState('');
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [addingBookId, setAddingBookId] = useState(null);
  const [addingToLibrary, setAddingToLibrary] = useState(null);

  useEffect(() => { loadList(); }, [listId]);

  const loadList = async () => {
    try { const res = await listApi.getList(listId); setList(res.data); }
    catch (err) { console.error('Failed to load list:', err); }
    finally { setLoading(false); }
  };

  const handleUpdateList = async (data) => { await listApi.updateList(listId, data); await loadList(); };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!addTitle.trim()) return;
    setAdding(true);
    try {
      await listApi.addItem(listId, { bookTitle: addTitle.trim(), bookAuthor: addAuthor.trim() || 'Unknown', note: addNote.trim() || null });
      setAddTitle(''); setAddAuthor(''); setAddNote(''); setShowAddForm(false);
      await loadList();
    } catch (err) { alert(err.response?.data?.message || 'Failed to add book'); }
    finally { setAdding(false); }
  };

  const handleRemoveItem = async (itemId) => {
    if (!confirm('Remove this book from the list?')) return;
    try { await listApi.removeItem(listId, itemId); await loadList(); }
    catch (err) { console.error('Failed to remove item:', err); }
  };

  const handleToggleLike = async () => {
    try { const res = await listApi.toggleLike(listId); setList(res.data); }
    catch (err) { console.error('Failed to toggle like:', err); }
  };

  const loadMyBooks = async () => {
    if (myBooks.length > 0) return;
    setLoadingBooks(true);
    try { const books = await bookApi.getAllBooks(); setMyBooks(Array.isArray(books) ? books : []); }
    catch (err) { console.error('Failed to load books:', err); }
    finally { setLoadingBooks(false); }
  };

  const handleOpenBookPicker = () => { setShowBookPicker(true); setBookSearchQuery(''); loadMyBooks(); };

  const filteredBooks = useMemo(() => {
    if (!myBooks.length) return [];
    const existingTitles = new Set((list?.items || []).map(item => `${item.bookTitle}||${item.bookAuthor}`.toLowerCase()));
    return myBooks.filter(book => {
      const key = `${book.title}||${book.author}`.toLowerCase();
      if (existingTitles.has(key)) return false;
      if (!bookSearchQuery.trim()) return true;
      const q = bookSearchQuery.toLowerCase();
      return book.title.toLowerCase().includes(q) || book.author.toLowerCase().includes(q);
    });
  }, [myBooks, list?.items, bookSearchQuery]);

  const handleQuickAddBook = async (book) => {
    setAddingBookId(book.id);
    try { await listApi.addItem(listId, { bookId: book.id, bookTitle: book.title, bookAuthor: book.author }); await loadList(); }
    catch (err) { alert(err.response?.data?.message || 'Failed to add book'); }
    finally { setAddingBookId(null); }
  };

  const handleAddBookToLibrary = async (item) => {
    const key = `${item.bookTitle}-${item.bookAuthor}`;
    setAddingToLibrary(key);
    try {
      await bookApi.createBook({ title: item.bookTitle, author: item.bookAuthor || 'Unknown', status: 'WANT_TO_READ', totalPages: 1, pagesRead: 0 });
      toast.success(`"${item.bookTitle}" added to your library!`);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || '';
      if (typeof msg === 'string' && msg.toLowerCase().includes('already')) toast.error('This book is already in your library');
      else toast.error('Failed to add book');
    } finally { setAddingToLibrary(null); }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this entire list? This cannot be undone.')) return;
    try { await listApi.deleteList(listId); navigate('/lists'); }
    catch (err) { console.error('Failed to delete list:', err); }
  };

  // Shared styles
  const inputCls = "w-full py-3 px-4 bg-bg dark:bg-bg border border-border dark:border-[#2D2A35] rounded-lg text-sm text-txt-primary dark:text-[#E2D9F3] outline-none transition-all duration-200 focus:border-primary dark:focus:border-[#7C4DFF] focus:shadow-[0_0_0_3px_rgba(109,40,217,0.1)] placeholder:text-txt-light";
  const actionBtnCls = "py-2 px-[18px] rounded-xl text-[0.85rem] font-semibold cursor-pointer transition-all duration-200 border border-border dark:border-[#2D2A35]";

  if (!loading && !list) {
    return (
      <div className="max-w-[700px] mx-auto py-8 px-5 pb-20 min-h-screen animate-fade-in-up">
        <div className="text-center py-16">
          <h2 className="text-xl font-bold text-txt-primary dark:text-[#E2D9F3]">List not found</h2>
          <button className="mt-4 py-2.5 px-5 bg-primary text-white rounded-xl border-none cursor-pointer font-semibold" onClick={() => navigate('/lists')}>← Back to Lists</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[700px] mx-auto py-8 px-5 pb-20 min-h-screen animate-fade-in-up">
      {loading ? (
        <div className="text-center py-20 text-txt-secondary dark:text-[#9E95A8]">Loading...</div>
      ) : (
        <>
          {/* Header */}
          <div className="mb-7">
            <button className="page-back-btn" onClick={() => navigate('/lists')}>← Back</button>

            <div className="flex gap-[18px] items-start mb-[18px]">
              <span className="text-[3rem] w-[76px] h-[76px] flex items-center justify-center bg-gradient-to-br from-[rgba(109,40,217,0.06)] dark:from-[rgba(124,77,255,0.12)] to-[rgba(37,99,235,0.04)] dark:to-[rgba(149,117,255,0.06)] rounded-2xl flex-shrink-0">{list.coverEmoji}</span>
              <div className="flex-1 min-w-0 pt-1">
                <h1 className="m-0 text-[1.5rem] font-extrabold text-txt-primary dark:text-[#E2D9F3] tracking-tight leading-tight">{list.name}</h1>
                {list.description && <p className="mt-1.5 mb-0 text-sm text-txt-secondary dark:text-[#9E95A8] leading-relaxed">{list.description}</p>}
                <div className="flex flex-wrap gap-3 mt-2 text-xs text-txt-light dark:text-[#7a7181]">
                  <span
                    className="text-primary dark:text-[#7C4DFF] font-semibold cursor-pointer transition-opacity duration-150 hover:opacity-80"
                    onClick={() => navigate(`/profile/${list.ownerUsername}`)}
                  >
                    by @{list.ownerUsername}
                  </span>
                  <span>📖 {list.booksCount} book{list.booksCount !== 1 ? 's' : ''}</span>
                  <span>{list.public ? '🌍 Public' : '🔒 Private'}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2.5 flex-wrap">
              <button
                className={`${actionBtnCls} ${list.likedByViewer ? 'bg-[rgba(239,68,68,0.06)] dark:bg-[rgba(239,68,68,0.1)] border-[rgba(239,68,68,0.2)] text-red-500' : 'bg-bg dark:bg-[#1E1B24] text-txt-secondary dark:text-[#9E95A8] hover:border-[rgba(109,40,217,0.2)] dark:hover:border-[rgba(124,77,255,0.3)] hover:text-primary dark:hover:text-[#7C4DFF]'}`}
                onClick={handleToggleLike}
              >
                {list.likedByViewer ? '❤️' : '🤍'} {list.likesCount}
              </button>
              {list.ownedByViewer && (
                <>
                  <button className={`${actionBtnCls} bg-bg dark:bg-[#1E1B24] text-txt-secondary dark:text-[#9E95A8] hover:border-primary dark:hover:border-[#7C4DFF] hover:text-primary dark:hover:text-[#7C4DFF]`} onClick={() => setShowEditModal(true)}>✏️ Edit</button>
                  <button className={`${actionBtnCls} bg-bg dark:bg-[#1E1B24] text-txt-secondary dark:text-[#9E95A8] hover:border-[rgba(239,68,68,0.3)] hover:text-red-500 hover:bg-[rgba(239,68,68,0.04)]`} onClick={handleDelete}>🗑️ Delete</button>
                </>
              )}
            </div>
          </div>

          {/* Add Book Section */}
          {list.ownedByViewer && (
            <div className="mb-6">
              {showBookPicker ? (
                <div className="bg-bg dark:bg-[#1E1B24] border border-border dark:border-[#2D2A35] rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3.5">
                    <h3 className="m-0 text-base font-bold text-txt-primary dark:text-[#E2D9F3]">Add from your library</h3>
                    <button className="bg-none border-none text-txt-secondary dark:text-[#9E95A8] cursor-pointer p-1.5 rounded-lg transition-all duration-150 hover:bg-bg-hover dark:hover:bg-[#2D2A35] hover:text-txt-primary dark:hover:text-[#E2D9F3]" onClick={() => setShowBookPicker(false)}>✕</button>
                  </div>
                  <input type="text" className={`${inputCls} mb-3.5`} placeholder="Search your books..." value={bookSearchQuery} onChange={(e) => setBookSearchQuery(e.target.value)} autoFocus />
                  <div className="max-h-[280px] overflow-y-auto">
                    {loadingBooks ? (
                      <p className="text-center py-6 text-sm text-txt-secondary dark:text-[#9E95A8]">Loading your books...</p>
                    ) : filteredBooks.length === 0 ? (
                      <p className="text-center py-6 text-sm text-txt-secondary dark:text-[#9E95A8]">{myBooks.length === 0 ? 'No books in your library yet' : 'No matching books (or already added)'}</p>
                    ) : (
                      filteredBooks.map(book => (
                        <div key={book.id} className="flex items-center gap-3 py-2.5 px-2 rounded-lg transition-colors duration-150 hover:bg-bg-secondary dark:hover:bg-[#2D2A35]">
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-[0.88rem] text-txt-primary dark:text-[#E2D9F3] whitespace-nowrap overflow-hidden text-ellipsis">{book.title}</span>
                            <span className="text-xs text-txt-secondary dark:text-[#9E95A8]">by {book.author}</span>
                          </div>
                          <button
                            className="ml-auto py-1.5 px-3 rounded-lg bg-primary/10 dark:bg-[rgba(124,77,255,0.15)] text-primary dark:text-[#7C4DFF] border-none text-xs font-bold cursor-pointer transition-all duration-200 hover:bg-primary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => handleQuickAddBook(book)}
                            disabled={addingBookId === book.id}
                          >
                            {addingBookId === book.id ? '...' : '+ Add'}
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : showAddForm ? (
                <form className="flex flex-col gap-3 p-[18px] bg-bg-secondary dark:bg-[#1E1B24] border border-border dark:border-[#2D2A35] rounded-2xl" onSubmit={handleAddItem}>
                  <input type="text" className={inputCls} value={addTitle} onChange={(e) => setAddTitle(e.target.value)} placeholder="Book title *" autoFocus />
                  <input type="text" className={inputCls} value={addAuthor} onChange={(e) => setAddAuthor(e.target.value)} placeholder="Author" />
                  <input type="text" className={inputCls} value={addNote} onChange={(e) => setAddNote(e.target.value)} placeholder="Note (optional)" maxLength={300} />
                  <div className="flex gap-2.5 mt-1">
                    <button type="submit" disabled={!addTitle.trim() || adding} className="py-2.5 px-5 border-none rounded-xl text-sm font-bold cursor-pointer transition-all duration-200 bg-gradient-to-br from-primary to-[#7c3aed] text-white shadow-[0_2px_8px_rgba(109,40,217,0.25)] hover:-translate-y-px hover:shadow-[0_4px_14px_rgba(109,40,217,0.35)] disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none">
                      {adding ? 'Adding...' : '+ Add Book'}
                    </button>
                    <button type="button" className="py-2.5 px-5 rounded-xl border border-border dark:border-[#2D2A35] bg-none text-sm font-semibold text-txt-secondary dark:text-[#9E95A8] cursor-pointer transition-all duration-200 hover:bg-bg-hover dark:hover:bg-[#2D2A35]" onClick={() => setShowAddForm(false)}>Cancel</button>
                  </div>
                </form>
              ) : (
                <div className="flex gap-2.5 flex-wrap">
                  <button className={`${actionBtnCls} bg-none text-primary dark:text-[#7C4DFF] font-bold hover:border-primary dark:hover:border-[#7C4DFF] hover:bg-[rgba(109,40,217,0.04)] dark:hover:bg-[rgba(124,77,255,0.06)]`} onClick={handleOpenBookPicker}>📚 Add from Library</button>
                  <button className={`${actionBtnCls} bg-none text-success hover:border-success hover:bg-[rgba(5,150,105,0.04)]`} onClick={() => setShowAddForm(true)}>✏️ Add Manually</button>
                </div>
              )}
            </div>
          )}

          {/* Items List */}
          <div className="flex flex-col gap-2">
            {(!list.items || list.items.length === 0) ? (
              <div className="text-center py-12 text-txt-secondary dark:text-[#9E95A8] text-sm">
                <p>No books in this list yet.</p>
              </div>
            ) : (
              list.items.map((item, index) => (
                <div key={item.id} className="flex items-start gap-3 p-3.5 bg-bg dark:bg-[#1E1B24] border border-border dark:border-[#2D2A35] rounded-xl transition-all duration-200 hover:border-[rgba(109,40,217,0.15)] dark:hover:border-[rgba(124,77,255,0.2)] hover:bg-bg-hover dark:hover:bg-[#2D2A35] hover:shadow-xs">
                  <span className="w-[30px] h-[30px] flex items-center justify-center bg-gradient-to-br from-[rgba(109,40,217,0.06)] dark:from-[rgba(124,77,255,0.12)] to-[rgba(37,99,235,0.04)] rounded-lg text-xs font-bold text-primary dark:text-[#7C4DFF] flex-shrink-0">{index + 1}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className="m-0 text-[0.95rem] font-bold text-txt-primary dark:text-[#E2D9F3] leading-snug">{item.bookTitle}</h4>
                    <span className="text-xs text-txt-secondary dark:text-[#9E95A8] mt-0.5 inline-block">by {item.bookAuthor}</span>
                    {item.note && <p className="mt-1.5 mb-0 text-xs text-txt-light dark:text-[#7a7181] italic leading-relaxed">"{item.note}"</p>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!list.ownedByViewer && (
                      <button
                        className="flex items-center gap-1.5 py-1.5 px-3 border border-border dark:border-[#2D2A35] bg-none text-primary dark:text-[#7C4DFF] rounded-full text-xs font-semibold cursor-pointer transition-all duration-[200ms] whitespace-nowrap hover:-translate-y-px hover:bg-[rgba(109,40,217,0.06)] dark:hover:bg-[rgba(124,77,255,0.1)] hover:border-primary dark:hover:border-[#7C4DFF] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                        onClick={() => handleAddBookToLibrary(item)}
                        disabled={addingToLibrary === `${item.bookTitle}-${item.bookAuthor}`}
                        title="Add to my library"
                      >
                        {addingToLibrary === `${item.bookTitle}-${item.bookAuthor}` ? (
                          <span className="inline-block w-3.5 h-3.5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                        ) : (
                          <>
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                            Add
                          </>
                        )}
                      </button>
                    )}
                    {list.ownedByViewer && (
                      <button
                        className="bg-none border-none text-txt-light dark:text-[#5a5268] p-1.5 rounded-lg cursor-pointer text-sm transition-all duration-200 hover:text-red-500 dark:hover:text-red-400 hover:bg-[rgba(239,68,68,0.06)] dark:hover:bg-[rgba(239,68,68,0.1)]"
                        onClick={() => handleRemoveItem(item.id)}
                        title="Remove from list"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {showEditModal && (
            <CreateListModal
              onClose={() => setShowEditModal(false)}
              onSave={handleUpdateList}
              initialData={{
                name: list.name,
                description: list.description,
                isPublic: list.public,
                coverEmoji: list.coverEmoji,
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
