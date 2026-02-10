import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import listApi from '../api/listApi';
import bookApi from '../api/bookApi';
import CreateListModal from '../components/CreateListModal';
import './ListDetailPage.css';

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

  useEffect(() => {
    loadList();
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

  const handleDelete = async () => {
    if (!confirm('Delete this entire list? This cannot be undone.')) return;
    try {
      await listApi.deleteList(listId);
      navigate('/lists');
    } catch (err) {
      console.error('Failed to delete list:', err);
    }
  };

  if (loading) {
    return <div className="list-detail-page"><div className="list-detail-page__loading">Loading...</div></div>;
  }

  if (!list) {
    return (
      <div className="list-detail-page">
        <div className="list-detail-page__not-found">
          <h2>List not found</h2>
          <button onClick={() => navigate('/lists')}>← Back to Lists</button>
        </div>
      </div>
    );
  }

  return (
    <div className="list-detail-page">
      {/* Header */}
      <div className="list-detail-page__header">
        <button className="page-back-btn" onClick={() => navigate('/lists')}>
          ← Back
        </button>

        <div className="list-detail-page__title-row">
          <span className="list-detail-page__emoji">{list.coverEmoji}</span>
          <div className="list-detail-page__title-info">
            <h1>{list.name}</h1>
            {list.description && <p className="list-detail-page__desc">{list.description}</p>}
            <div className="list-detail-page__meta">
              <span
                className="list-detail-page__owner"
                onClick={() => navigate(`/profile/${list.ownerUsername}`)}
              >
                by @{list.ownerUsername}
              </span>
              <span>📖 {list.booksCount} book{list.booksCount !== 1 ? 's' : ''}</span>
              <span>{list.public ? '🌍 Public' : '🔒 Private'}</span>
            </div>
          </div>
        </div>

        <div className="list-detail-page__actions">
          <button
            className={`list-detail-page__like-btn ${list.likedByViewer ? 'liked' : ''}`}
            onClick={handleToggleLike}
          >
            {list.likedByViewer ? '❤️' : '🤍'} {list.likesCount}
          </button>
          {list.ownedByViewer && (
            <>
              <button className="list-detail-page__edit-btn" onClick={() => setShowEditModal(true)}>
                ✏️ Edit
              </button>
              <button className="list-detail-page__delete-btn" onClick={handleDelete}>
                🗑️ Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Add Book Section */}
      {list.ownedByViewer && (
        <div className="list-detail-page__add-section">
          {/* Book Picker from Library */}
          {showBookPicker ? (
            <div className="list-detail-page__book-picker">
              <div className="book-picker__header">
                <h3>Add from your library</h3>
                <button className="book-picker__close" onClick={() => setShowBookPicker(false)}>✕</button>
              </div>
              <input
                type="text"
                className="book-picker__search"
                placeholder="Search your books..."
                value={bookSearchQuery}
                onChange={(e) => setBookSearchQuery(e.target.value)}
                autoFocus
              />
              <div className="book-picker__list">
                {loadingBooks ? (
                  <p className="book-picker__empty">Loading your books...</p>
                ) : filteredBooks.length === 0 ? (
                  <p className="book-picker__empty">
                    {myBooks.length === 0 ? 'No books in your library yet' : 'No matching books (or already added)'}
                  </p>
                ) : (
                  filteredBooks.map(book => (
                    <div key={book.id} className="book-picker__item">
                      <div className="book-picker__item-info">
                        <span className="book-picker__item-title">{book.title}</span>
                        <span className="book-picker__item-author">by {book.author}</span>
                      </div>
                      <button
                        className="book-picker__add-btn"
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
            <form className="list-detail-page__add-form" onSubmit={handleAddItem}>
              <input
                type="text"
                value={addTitle}
                onChange={(e) => setAddTitle(e.target.value)}
                placeholder="Book title *"
                autoFocus
              />
              <input
                type="text"
                value={addAuthor}
                onChange={(e) => setAddAuthor(e.target.value)}
                placeholder="Author"
              />
              <input
                type="text"
                value={addNote}
                onChange={(e) => setAddNote(e.target.value)}
                placeholder="Note (optional)"
                maxLength={300}
              />
              <div className="list-detail-page__add-actions">
                <button type="submit" disabled={!addTitle.trim() || adding}>
                  {adding ? 'Adding...' : '+ Add Book'}
                </button>
                <button type="button" onClick={() => setShowAddForm(false)}>Cancel</button>
              </div>
            </form>
          ) : (
            <div className="list-detail-page__add-buttons">
              <button
                className="list-detail-page__add-btn list-detail-page__add-btn--library"
                onClick={handleOpenBookPicker}
              >
                📚 Add from Library
              </button>
              <button
                className="list-detail-page__add-btn list-detail-page__add-btn--manual"
                onClick={() => setShowAddForm(true)}
              >
                ✏️ Add Manually
              </button>
            </div>
          )}
        </div>
      )}

      {/* Items List */}
      <div className="list-detail-page__items">
        {(!list.items || list.items.length === 0) ? (
          <div className="list-detail-page__items-empty">
            <p>No books in this list yet.</p>
          </div>
        ) : (
          list.items.map((item, index) => (
            <div key={item.id} className="list-item">
              <span className="list-item__number">{index + 1}</span>
              <div className="list-item__info">
                <h4 className="list-item__title">{item.bookTitle}</h4>
                <span className="list-item__author">by {item.bookAuthor}</span>
                {item.note && <p className="list-item__note">"{item.note}"</p>}
              </div>
              {list.ownedByViewer && (
                <button
                  className="list-item__remove"
                  onClick={() => handleRemoveItem(item.id)}
                  title="Remove from list"
                >
                  ✕
                </button>
              )}
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
    </div>
  );
}
