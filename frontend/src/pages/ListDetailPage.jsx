import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, Globe, Lock, Heart, Edit3, Trash2, Library } from 'lucide-react';
import listApi from '../api/listApi';
import bookApi from '../api/bookApi';
import CreateListModal from '../components/CreateListModal';
import toast from 'react-hot-toast';

const pageCls = 'list-detail-page max-w-[700px] lg:max-w-[760px] mx-auto px-5 pt-8 pb-20 min-h-screen animate-[g-fadeInUp_0.5s_cubic-bezier(0.16,1,0.3,1)_both]';

const actionBtnCls = 'px-[18px] py-2 rounded-xl text-[0.85rem] font-semibold cursor-pointer transition-all duration-200 border border-slate-200 bg-white text-slate-500 dark:bg-[#1E1B24] dark:border-[#2D2A35] dark:text-[#9E95A8]';

const formInputCls = 'px-4 py-3 border border-slate-200 rounded-lg text-sm outline-none text-slate-900 bg-white transition-all duration-200 font-[inherit] focus:border-violet-700 focus:ring-[3px] focus:ring-violet-700/[0.08] dark:bg-[#0F0C15] dark:border-[#2D2A35] dark:text-[#E2D9F3] dark:focus:border-[#7C4DFF] dark:focus:ring-[#7C4DFF]/10';

const gradientBtnCls = 'px-[18px] py-2.5 rounded-lg text-[0.85rem] font-semibold cursor-pointer border-none bg-gradient-to-br from-violet-700 via-violet-500 to-blue-600 text-white shadow-[0_2px_8px_rgba(109,40,217,0.25)] hover:translate-y-[-1px] hover:shadow-[0_4px_14px_rgba(109,40,217,0.35)] disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0 transition-all duration-200';

const listItemCls = 'group flex items-center gap-3.5 px-[18px] py-4 bg-white border border-slate-200 rounded-xl transition-all duration-200 hover:border-violet-700/15 hover:bg-slate-50 hover:shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:bg-[#1E1B24] dark:border-[#2D2A35] dark:hover:bg-[#2D2A35] dark:hover:border-[#7C4DFF]/15';

const addLibBtnCls = 'inline-flex items-center gap-[5px] bg-transparent border border-slate-200 rounded-full px-3.5 py-[5px] text-xs font-semibold text-violet-700 cursor-pointer transition-all duration-200 whitespace-nowrap hover:bg-violet-700/[0.06] hover:border-violet-700 hover:translate-y-[-1px] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 dark:border-[#2D2A35] dark:text-[#7C4DFF] dark:hover:bg-[#7C4DFF]/10 dark:hover:border-[#7C4DFF]';

const pickerItemCls = 'flex items-center justify-between gap-3.5 px-3.5 py-3 bg-white border border-slate-200 rounded-lg transition-all duration-200 hover:border-violet-700/20 hover:bg-slate-50 dark:bg-[#0F0C15] dark:border-[#2D2A35] dark:hover:border-[#7C4DFF]/20 dark:hover:bg-[#2D2A35]';

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

  // Book picker state
  const [showBookPicker, setShowBookPicker] = useState(false);
  const [myBooks, setMyBooks] = useState([]);
  const [bookSearchQuery, setBookSearchQuery] = useState('');
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [addingBookId, setAddingBookId] = useState(null);
  const [addingToLibrary, setAddingToLibrary] = useState(null);
  const [booksInLibrary, setBooksInLibrary] = useState(new Set());

  useEffect(() => {
    loadList();
    loadUserLibraryForComparison();
  }, [listId]);

  const loadList = async () => {
    try {
      const res = await listApi.getList(listId);
      setList(res.data);
    } catch (err) {
      console.error('Failed to load list:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load user's library books to check which ones are already added
  const loadUserLibraryForComparison = async () => {
    try {
      const books = await bookApi.getAllBooks();
      const bookKeys = new Set(
        (Array.isArray(books) ? books : []).map(book => 
          `${book.title}||${book.author}`.toLowerCase()
        )
      );
      setBooksInLibrary(bookKeys);
    } catch (err) {
      console.error('Failed to load user library:', err);
    }
  };

  const handleUpdateList = async (data) => {
    await listApi.updateList(listId, data);
    await loadList();
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!addTitle.trim()) return;
    setAdding(true);
    try {
      await listApi.addItem(listId, {
        bookTitle: addTitle.trim(),
        bookAuthor: addAuthor.trim() || 'Unknown',
        note: addNote.trim() || null,
      });
      setAddTitle('');
      setAddAuthor('');
      setAddNote('');
      setShowAddForm(false);
      await loadList();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add book');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (!confirm('Remove this book from the list?')) return;
    try {
      await listApi.removeItem(listId, itemId);
      await loadList();
    } catch (err) {
      console.error('Failed to remove item:', err);
    }
  };

  const handleToggleLike = async () => {
    try {
      const res = await listApi.toggleLike(listId);
      setList(res.data);
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  // Load user's library books for the picker
  const loadMyBooks = async () => {
    if (myBooks.length > 0) return; // already loaded
    setLoadingBooks(true);
    try {
      const books = await bookApi.getAllBooks();
      setMyBooks(Array.isArray(books) ? books : []);
    } catch (err) {
      console.error('Failed to load books:', err);
    } finally {
      setLoadingBooks(false);
    }
  };

  const handleOpenBookPicker = () => {
    setShowBookPicker(true);
    setBookSearchQuery('');
    loadMyBooks();
  };

  // Filter books not already in the list, and match search query
  const filteredBooks = useMemo(() => {
    if (!myBooks.length) return [];
    const existingTitles = new Set(
      (list?.items || []).map(item => `${item.bookTitle}||${item.bookAuthor}`.toLowerCase())
    );
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
    try {
      await listApi.addItem(listId, {
        bookId: book.id,
        bookTitle: book.title,
        bookAuthor: book.author,
      });
      await loadList();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add book');
    } finally {
      setAddingBookId(null);
    }
  };

  const handleAddBookToLibrary = async (item) => {
    const key = `${item.bookTitle}-${item.bookAuthor}`;
    setAddingToLibrary(key);
    try {
      await bookApi.createBook({
        title: item.bookTitle,
        author: item.bookAuthor || 'Unknown',
        status: 'WANT_TO_READ',
        totalPages: 1,
        pagesRead: 0,
      });
      toast.success(`"${item.bookTitle}" added to your library!`);
      // Add to the set of books in library so button becomes disabled
      const libraryKey = `${item.bookTitle}||${item.bookAuthor}`.toLowerCase();
      setBooksInLibrary(prev => new Set([...prev, libraryKey]));
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || '';
      if (typeof msg === 'string' && msg.toLowerCase().includes('already')) {
        toast.error('This book is already in your library');
        // Also add to the set since it's confirmed to be in library
        const libraryKey = `${item.bookTitle}||${item.bookAuthor}`.toLowerCase();
        setBooksInLibrary(prev => new Set([...prev, libraryKey]));
      } else {
        toast.error('Failed to add book');
      }
    } finally {
      setAddingToLibrary(null);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this entire list? This cannot be undone.')) return;
    try {
      await listApi.deleteList(listId);
      navigate('/lists');
    } catch (err) {
      console.error('Failed to delete list:', err);
    }
  };

  if (!loading && !list) {
    return (
      <div className={pageCls}>
        <div className="text-center py-20 text-slate-500 text-sm dark:text-[#9E95A8]">
          <h2 className="text-slate-900 mb-3.5 font-bold dark:text-[#E2D9F3]">List not found</h2>
          <button className={gradientBtnCls} onClick={() => navigate('/lists')}>← Back to Lists</button>
        </div>
      </div>
    );
  }

  return (
    <div className={pageCls}>
      {loading ? (
        <div className="text-center py-20 text-slate-500 text-sm dark:text-[#9E95A8]">Loading...</div>
      ) : (
      <>
      {/* Header */}
      <div className="mb-7">
        <button className="page-back-btn" onClick={() => navigate('/lists')}>
          ← Back
        </button>

        <div className="flex gap-[18px] items-start mb-[18px] max-sm:flex-col max-sm:items-center max-sm:text-center">
          <span className="text-5xl w-[76px] h-[76px] flex items-center justify-center bg-gradient-to-br from-violet-700/[0.06] to-blue-600/[0.04] rounded-2xl shrink-0 dark:from-[#7C4DFF]/[0.12] dark:to-[#9575FF]/[0.06]">{list.coverEmoji}</span>
          <div>
            <h1 className="m-0 text-2xl font-extrabold text-slate-900 tracking-tight dark:text-[#E2D9F3]">{list.name}</h1>
            {list.description && <p className="mt-2 text-sm text-slate-500 leading-relaxed dark:text-[#9E95A8]">{list.description}</p>}
            <div className="flex gap-3.5 flex-wrap mt-2.5 text-xs text-slate-400 dark:text-[#7a7181]">
              <span
                className="text-violet-700 cursor-pointer font-semibold hover:opacity-80 transition-opacity duration-150 dark:text-[#7C4DFF]"
                onClick={() => navigate(`/profile/${list.ownerUsername}`)}
              >
                by @{list.ownerUsername}
              </span>
              <span><BookOpen className="w-3.5 h-3.5 inline mr-1" />{list.booksCount} book{list.booksCount !== 1 ? 's' : ''}</span>
              <span>{list.public ? <><Globe className="w-3.5 h-3.5 inline mr-1" />Public</> : <><Lock className="w-3.5 h-3.5 inline mr-1" />Private</>}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2.5 flex-wrap max-sm:justify-center">
          <button
            className={`${actionBtnCls} ${list.likedByViewer ? 'border-red-500/30 bg-red-500/[0.06] text-red-500 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-400' : 'hover:border-red-500/30 hover:bg-red-500/[0.04] hover:text-red-500 dark:hover:bg-red-500/[0.08] dark:hover:border-red-500/30 dark:hover:text-red-400'}`}
            onClick={handleToggleLike}
          >
            <Heart className={`w-4 h-4 inline mr-1 ${list.likedByViewer ? 'fill-current' : ''}`} /> {list.likesCount}
          </button>
          {list.ownedByViewer && (
            <>
              <button className={`${actionBtnCls} hover:border-violet-700/30 hover:bg-violet-700/[0.04] hover:text-violet-700 dark:hover:bg-[#7C4DFF]/[0.08] dark:hover:border-[#7C4DFF]/30 dark:hover:text-[#7C4DFF]`} onClick={() => setShowEditModal(true)}>
                <Edit3 className="w-4 h-4 inline mr-1" /> Edit
              </button>
              <button className={`${actionBtnCls} hover:border-red-500/30 hover:bg-red-500/[0.04] hover:text-red-500 dark:hover:bg-red-500/[0.08] dark:hover:border-red-500/30 dark:hover:text-red-400`} onClick={handleDelete}>
                <Trash2 className="w-4 h-4 inline mr-1" /> Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Add Book Section */}
      {list.ownedByViewer && (
        <div className="mb-7">
          {/* Book Picker from Library */}
          {showBookPicker ? (
            <div className="bg-white border border-slate-200 rounded-xl p-[18px] mb-2.5 shadow-sm dark:bg-[#1E1B24] dark:border-[#2D2A35]">
              <div className="flex justify-between items-center mb-3.5">
                <h3 className="m-0 text-base font-bold text-slate-900 dark:text-[#E2D9F3]">Add from your library</h3>
                <button className="bg-transparent border-none text-lg text-slate-500 cursor-pointer p-[6px_10px] rounded-lg hover:bg-slate-100 hover:text-slate-900 dark:text-[#9E95A8] dark:hover:bg-[#2D2A35] dark:hover:text-[#E2D9F3]" onClick={() => setShowBookPicker(false)}>✕</button>
              </div>
              <input
                type="text"
                className={`${formInputCls} w-full mb-3.5 box-border`}
                placeholder="Search your books..."
                value={bookSearchQuery}
                onChange={(e) => setBookSearchQuery(e.target.value)}
                autoFocus
              />
              <div className="max-h-[280px] overflow-y-auto flex flex-col gap-1.5">
                {loadingBooks ? (
                  <p className="text-center py-7 text-slate-400 text-[0.85rem] m-0">Loading your books...</p>
                ) : filteredBooks.length === 0 ? (
                  <p className="text-center py-7 text-slate-400 text-[0.85rem] m-0">
                    {myBooks.length === 0 ? 'No books in your library yet' : 'No matching books (or already added)'}
                  </p>
                ) : (
                  filteredBooks.map(book => (
                    <div key={book.id} className={pickerItemCls}>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-[0.88rem] text-slate-900 whitespace-nowrap overflow-hidden text-ellipsis dark:text-[#E2D9F3]">{book.title}</span>
                        <span className="text-xs text-slate-500 dark:text-[#9E95A8]">by {book.author}</span>
                      </div>
                      <button
                        className={`shrink-0 px-4 py-2 border-none rounded-lg text-xs font-bold cursor-pointer ${gradientBtnCls}`}
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
            <form className="flex flex-col gap-3 p-[18px] bg-white rounded-xl border border-slate-200 shadow-sm dark:bg-[#1E1B24] dark:border-[#2D2A35]" onSubmit={handleAddItem}>
              <input
                type="text"
                className={formInputCls}
                value={addTitle}
                onChange={(e) => setAddTitle(e.target.value)}
                placeholder="Book title *"
                autoFocus
              />
              <input
                type="text"
                className={formInputCls}
                value={addAuthor}
                onChange={(e) => setAddAuthor(e.target.value)}
                placeholder="Author"
              />
              <input
                type="text"
                className={formInputCls}
                value={addNote}
                onChange={(e) => setAddNote(e.target.value)}
                placeholder="Note (optional)"
                maxLength={300}
              />
              <div className="flex gap-2.5 justify-end">
                <button type="submit" className={gradientBtnCls} disabled={!addTitle.trim() || adding}>
                  {adding ? 'Adding...' : '+ Add Book'}
                </button>
                <button type="button" className="px-[18px] py-2.5 rounded-lg text-[0.85rem] font-semibold cursor-pointer bg-slate-100 text-slate-900 border border-slate-200 hover:bg-slate-200 transition-all duration-200 dark:bg-[#2D2A35] dark:text-[#E2D9F3] dark:border-[#2D2A35]" onClick={() => setShowAddForm(false)}>Cancel</button>
              </div>
            </form>
          ) : (
            <div className="flex gap-3 max-sm:flex-col">
              <button
                className="flex-1 p-4 border-2 border-dashed border-slate-200 rounded-xl bg-transparent text-sm font-bold cursor-pointer transition-all duration-200 text-violet-700 hover:border-violet-700 hover:bg-violet-700/[0.04] dark:border-[#2D2A35] dark:text-[#7C4DFF] dark:hover:border-[#7C4DFF] dark:hover:bg-[#7C4DFF]/[0.06]"
                onClick={handleOpenBookPicker}
              >
                <Library className="w-4 h-4 inline mr-1" /> Add from Library
              </button>
              <button
                className="flex-1 p-4 border-2 border-dashed border-slate-200 rounded-xl bg-transparent text-sm font-bold cursor-pointer transition-all duration-200 text-emerald-600 hover:border-emerald-600 hover:bg-emerald-600/[0.04] dark:border-[#2D2A35] dark:text-emerald-400 dark:hover:border-emerald-400 dark:hover:bg-emerald-400/[0.06]"
                onClick={() => setShowAddForm(true)}
              >
                <Edit3 className="w-4 h-4 inline mr-1" /> Add Manually
              </button>
            </div>
          )}
        </div>
      )}

      {/* Items List */}
      <div className="flex flex-col gap-1">
        {(!list.items || list.items.length === 0) ? (
          <div className="text-center py-12 text-slate-400 text-sm dark:text-[#7a7181]">
            <p>No books in this list yet.</p>
          </div>
        ) : (
          list.items.map((item, index) => (
            <div key={item.id} className={listItemCls}>
              <span className="w-[30px] h-[30px] flex items-center justify-center bg-gradient-to-br from-violet-700/[0.06] to-blue-600/[0.04] rounded-lg text-xs font-bold text-violet-700 shrink-0 dark:from-[#7C4DFF]/[0.12] dark:to-[#9575FF]/[0.06] dark:text-[#7C4DFF]">{index + 1}</span>
              <div className="flex-1 min-w-0">
                <h4 className="m-0 text-[0.95rem] font-bold text-slate-900 dark:text-[#E2D9F3]">{item.bookTitle}</h4>
                <span className="text-xs text-slate-500 dark:text-[#9E95A8]">by {item.bookAuthor}</span>
                {item.note && <p className="mt-[5px] mb-0 text-xs text-slate-400 italic dark:text-[#7a7181]">"{item.note}"</p>}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {!list.ownedByViewer && (() => {
                  const libraryKey = `${item.bookTitle}||${item.bookAuthor}`.toLowerCase();
                  const isInLibrary = booksInLibrary.has(libraryKey);
                  const isAdding = addingToLibrary === `${item.bookTitle}-${item.bookAuthor}`;
                  
                  return (
                    <button
                      className={addLibBtnCls}
                      onClick={() => !isInLibrary && handleAddBookToLibrary(item)}
                      disabled={isInLibrary || isAdding}
                      title={isInLibrary ? "Already in your library" : "Add to my library"}
                      style={isInLibrary ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                    >
                      {isAdding ? (
                        <span className="inline-block w-3.5 h-3.5 border-2 border-slate-200 border-t-violet-700 rounded-full animate-[g-spin_0.7s_linear_infinite] dark:border-[#2D2A35] dark:border-t-[#7C4DFF]" />
                      ) : isInLibrary ? (
                        <>
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          In Library
                        </>
                      ) : (
                        <>
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                          Add
                        </>
                      )}
                    </button>
                  );
                })()}
                {list.ownedByViewer && (
                  <button
                    className="bg-transparent border-none text-[0.85rem] text-slate-400 cursor-pointer p-[6px_10px] rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:text-red-500 hover:bg-red-500/[0.06] dark:text-[#5a5268] dark:hover:text-red-400 dark:hover:bg-red-500/10"
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
