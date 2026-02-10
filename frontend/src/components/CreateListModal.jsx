import { useState } from 'react';
import './CreateListModal.css';

const EMOJI_OPTIONS = ['📚', '📖', '🔥', '⭐', '💎', '🌙', '🎯', '🧠', '❤️', '🌍', '🚀', '🎭', '📝', '🌸', '🦋', '🎨'];

export default function CreateListModal({ onClose, onSave, initialData }) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [isPublic, setIsPublic] = useState(initialData?.isPublic ?? true);
  const [coverEmoji, setCoverEmoji] = useState(initialData?.coverEmoji || '📚');
  const [saving, setSaving] = useState(false);

  const isEditing = !!initialData;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSave({ name: name.trim(), description: description.trim(), isPublic, coverEmoji });
      onClose();
    } catch (err) {
      console.error('Failed to save list:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="create-list-overlay" onClick={onClose}>
      <div className="create-list-modal" onClick={(e) => e.stopPropagation()}>
        <div className="create-list-modal__header">
          <h2>{isEditing ? 'Edit List' : 'Create New List'}</h2>
          <button className="create-list-modal__close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="create-list-modal__form">
          {/* Emoji Picker */}
          <div className="create-list-modal__emoji-section">
            <span className="create-list-modal__emoji-selected">{coverEmoji}</span>
            <div className="create-list-modal__emoji-grid">
              {EMOJI_OPTIONS.map((em) => (
                <button
                  key={em}
                  type="button"
                  className={`create-list-modal__emoji-btn ${coverEmoji === em ? 'active' : ''}`}
                  onClick={() => setCoverEmoji(em)}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div className="create-list-modal__field">
            <label>List Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Best Sci-Fi of All Time"
              maxLength={100}
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="create-list-modal__field">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this list about?"
              maxLength={500}
              rows={3}
            />
            <span className="create-list-modal__char-count">{description.length}/500</span>
          </div>

          {/* Visibility */}
          <div className="create-list-modal__toggle-row">
            <div>
              <span className="create-list-modal__toggle-label">
                {isPublic ? '🌍 Public' : '🔒 Private'}
              </span>
              <span className="create-list-modal__toggle-hint">
                {isPublic ? 'Anyone can see this list' : 'Only you can see this list'}
              </span>
            </div>
            <button
              type="button"
              className={`create-list-modal__toggle ${isPublic ? 'active' : ''}`}
              onClick={() => setIsPublic(!isPublic)}
            >
              <span className="create-list-modal__toggle-knob" />
            </button>
          </div>

          {/* Actions */}
          <div className="create-list-modal__actions">
            <button type="button" onClick={onClose} className="create-list-modal__cancel-btn">
              Cancel
            </button>
            <button type="submit" disabled={!name.trim() || saving} className="create-list-modal__save-btn">
              {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create List'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
