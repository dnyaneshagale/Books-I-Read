import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import listApi from '../api/listApi';
import CreateListModal from '../components/CreateListModal';
import './MyListsPage.css';

export default function MyListsPage() {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = async () => {
    try {
      const res = await listApi.getMyLists();
      setLists(res.data);
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
        <button className="my-lists-page__create-btn" onClick={() => setShowCreateModal(true)}>
          + New List
        </button>
      </div>

      {loading ? (
        <div className="my-lists-page__loading">Loading your lists...</div>
      ) : lists.length === 0 ? (
        <div className="my-lists-page__empty">
          <span className="my-lists-page__empty-icon">📋</span>
          <h3>No lists yet</h3>
          <p>Create your first reading list and start curating!</p>
          <button className="my-lists-page__create-btn" onClick={() => setShowCreateModal(true)}>
            + Create Your First List
          </button>
        </div>
      ) : (
        <div className="my-lists-page__grid">
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
