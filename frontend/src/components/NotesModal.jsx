import React, { useState } from 'react';
import bookApi from '../api/bookApi';
import toast from 'react-hot-toast';
import './NotesModal.css';

/**
 * NotesModal Component
 * 
 * Modal to view and edit book notes
 */
function NotesModal({ book, onClose, onUpdated }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNotes, setEditedNotes] = useState(book.notes || '');
  const [currentNotes, setCurrentNotes] = useState(book.notes || '');
  const [isSaving, setIsSaving] = useState(false);
  
  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updateData = {
        title: book.title,
        author: book.author,
        totalPages: book.totalPages,
        pagesRead: book.pagesRead,
        status: book.status || 'WANT_TO_READ',
        rating: book.rating || null,
        review: book.review || null,
        notes: editedNotes.trim() || null,
        startDate: book.startDate || null,
        completeDate: book.completeDate || null,
        tags: book.tags || []
      };
      
      await bookApi.updateBook(book.id, updateData);
      
      // Update local state for real-time display
      const trimmedNotes = editedNotes.trim();
      setCurrentNotes(trimmedNotes);
      
      toast.success('Notes updated successfully!');
      setIsEditing(false);
      onUpdated?.();
    } catch (error) {
      toast.error('Failed to update notes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedNotes(currentNotes);
    setIsEditing(false);
  };

  const handleAddBullet = () => {
    const textarea = document.getElementById('notes-textarea');
    if (!textarea) return;
    
    const cursorPos = textarea.selectionStart;
    const textBefore = editedNotes.substring(0, cursorPos);
    const textAfter = editedNotes.substring(cursorPos);
    const needsNewLine = textBefore && !textBefore.endsWith('\n');
    
    const newText = textBefore + (needsNewLine ? '\n' : '') + '• ' + textAfter;
    setEditedNotes(newText);
    
    // Set cursor after the bullet
    setTimeout(() => {
      const newPos = textBefore.length + (needsNewLine ? 3 : 2);
      textarea.focus();
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const renderNotesContent = () => {
    if (!currentNotes) {
      return (
        <div className="notes-empty">
          <div className="notes-empty-icon">📝</div>
          <p className="notes-empty-title">No notes yet</p>
          <p className="notes-empty-subtitle">
            Click the Edit button to add your reading notes, quotes, or key takeaways.
          </p>
        </div>
      );
    }

    return (
      <div className="notes-content">
        <div className="notes-text">
          {currentNotes.split('\n').map((paragraph, index) => {
            const trimmed = paragraph.trim();
            const isBullet = trimmed.startsWith('•') || trimmed.startsWith('-');
            
            return (
              <p key={index} className={isBullet ? 'notes-list-item' : ''}>
                {isBullet ? trimmed : paragraph}
              </p>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="notes-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="notes-modal-content">
        <div className="notes-modal-header">
          <h2>📝 Reading Notes</h2>
          <button className="notes-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="notes-modal-body">
          <div className="notes-book-info">
            <h3>{book.title}</h3>
            <p className="notes-author">by {book.author}</p>
            {book.startDate && (
              <p className="notes-date">
                Started: {formatDate(book.startDate)}
                {book.completeDate && ` • Finished: ${formatDate(book.completeDate)}`}
              </p>
            )}
          </div>

          {isEditing ? (
            <div className="notes-edit-section">
              <div className="notes-edit-header">
                <label htmlFor="notes-textarea">✍️ Edit Notes</label>
                <button 
                  className="btn-add-bullet" 
                  onClick={handleAddBullet}
                  type="button"
                  title="Add bullet point"
                >
                  + Add Bullet
                </button>
              </div>
              <textarea
                id="notes-textarea"
                value={editedNotes}
                onChange={(e) => setEditedNotes(e.target.value)}
                placeholder="Add your notes, quotes, or key takeaways...&#10;&#10;• Use bullet points for lists&#10;- Or dashes for notes&#10;&#10;Example:&#10;• Key theme: Character development&#10;• Favorite quote: &quot;...&quot;&#10;- Reminded me of..."
                rows="12"
                className="notes-textarea"
                autoFocus
              />
              <div className="notes-edit-hint">
                💡 Tip: Start lines with • or - for bullet points
              </div>
            </div>
          ) : (
            renderNotesContent()
          )}

          {book.review && (
            <div className="notes-review-section">
              <h4>📖 Review</h4>
              <div className="notes-review-content">{book.review}</div>
            </div>
          )}
        </div>

        <div className="notes-modal-footer">
          {isEditing ? (
            <div className="notes-modal-actions">
              <button className="btn-notes-cancel" onClick={handleCancel} disabled={isSaving}>
                Cancel
              </button>
              <button className="btn-notes-save" onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : '💾 Save Notes'}
              </button>
            </div>
          ) : (
            <>
              <button className="btn-notes-close" onClick={onClose}>Close</button>
              <button className="btn-notes-edit" onClick={() => setIsEditing(true)}>✏️ Edit Notes</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default NotesModal;
