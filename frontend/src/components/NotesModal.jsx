import React, { useState } from 'react';
import bookApi from '../api/bookApi';
import toast from 'react-hot-toast';

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

    setTimeout(() => {
      const newPos = textBefore.length + (needsNewLine ? 3 : 2);
      textarea.focus();
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const renderNotesContent = () => {
    if (!currentNotes) {
      return (
        <div className="text-center py-2xl px-lg">
          <div className="text-[64px] mb-md opacity-30">📝</div>
          <p className="text-lg font-semibold text-txt-primary m-0 mb-sm">No notes yet</p>
          <p className="text-sm text-txt-secondary m-0 leading-[1.6]">
            Click the Edit button to add your reading notes, quotes, or key takeaways.
          </p>
        </div>
      );
    }

    return (
      <div className="bg-[rgba(255,193,7,0.05)] border-l-4 border-l-amber-400 rounded-md p-lg mb-lg">
        <div className="text-base text-txt-primary leading-[1.8]">
          {currentNotes.split('\n').map((paragraph, index) => {
            const trimmed = paragraph.trim();
            const isBullet = trimmed.startsWith('•') || trimmed.startsWith('-');

            return (
              <p key={index} className={`m-0 mb-md last:mb-0 whitespace-pre-wrap break-words ${isBullet ? 'pl-md' : ''}`}>
                {isBullet ? trimmed : paragraph}
              </p>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[1000] p-md animate-fade-in overflow-y-auto" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-bg rounded-xl max-w-[700px] w-full max-h-[calc(100vh-40px)] flex flex-col animate-slide-up shadow-xl border-2 border-amber-400 m-auto max-md:max-w-full max-md:max-h-[calc(100vh-20px)]">
        <div className="flex justify-between items-center p-lg max-md:p-md border-b-2 border-b-amber-400 bg-gradient-to-br from-[rgba(255,193,7,0.1)] to-[rgba(245,158,11,0.05)] flex-shrink-0">
          <h2 className="text-xl font-bold text-amber-500 m-0">📝 Reading Notes</h2>
          <button className="bg-none border-none text-[28px] text-txt-secondary cursor-pointer p-0 w-8 h-8 flex items-center justify-center rounded-sm transition-all duration-200 hover:bg-[rgba(255,193,7,0.2)] hover:text-amber-500" onClick={onClose}>×</button>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-lg max-md:p-md min-h-0">
          <div className="text-center mb-xl pb-lg border-b border-border">
            <h3 className="text-xl font-bold text-txt-primary m-0 mb-xs leading-[1.3] max-md:text-lg">{book.title}</h3>
            <p className="text-base text-txt-secondary m-0 mb-sm italic">by {book.author}</p>
            {book.startDate && (
              <p className="text-sm text-txt-secondary m-0">
                Started: {formatDate(book.startDate)}
                {book.completeDate && ` • Finished: ${formatDate(book.completeDate)}`}
              </p>
            )}
          </div>

          {isEditing ? (
            <div className="mt-lg">
              <div className="flex justify-between items-center mb-sm">
                <label htmlFor="notes-textarea" className="font-semibold text-txt-primary text-base m-0">✍️ Edit Notes</label>
                <button
                  className="py-xs px-md bg-gradient-to-br from-amber-400 to-amber-500 text-white border-none rounded-md text-sm font-semibold cursor-pointer transition-all duration-200 shadow-[0_2px_6px_rgba(255,193,7,0.3)] hover:-translate-y-0.5 hover:shadow-[0_4px_10px_rgba(255,193,7,0.4)] active:translate-y-0"
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
                placeholder={"Add your notes, quotes, or key takeaways...\n\n• Use bullet points for lists\n- Or dashes for notes\n\nExample:\n• Key theme: Character development\n• Favorite quote: \"...\"\n- Reminded me of..."}
                rows="12"
                className="w-full p-md border-2 border-amber-400 rounded-md text-base font-[inherit] leading-[1.8] resize-y transition-all duration-200 bg-[rgba(255,193,7,0.05)] focus:outline-none focus:border-amber-500 focus:shadow-[0_0_0_3px_rgba(255,193,7,0.1)] focus:bg-white"
                autoFocus
              />
              <div className="mt-sm py-sm px-md bg-[rgba(255,193,7,0.1)] border-l-[3px] border-l-amber-400 rounded-sm text-sm text-txt-secondary">
                💡 Tip: Start lines with • or - for bullet points
              </div>
            </div>
          ) : (
            renderNotesContent()
          )}

          {book.review && (
            <div className="mt-lg pt-lg border-t border-border">
              <h4 className="text-base font-semibold text-primary m-0 mb-md">📖 Review</h4>
              <div className="bg-bg-secondary border-l-4 border-l-primary rounded-md p-md text-sm text-txt-secondary italic leading-[1.7] whitespace-pre-wrap">{book.review}</div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center p-lg max-md:p-md border-t border-border bg-bg flex-shrink-0">
          {isEditing ? (
            <div className="flex gap-sm mx-auto">
              <button className="py-sm px-lg border border-border rounded-md text-sm font-semibold cursor-pointer transition-all duration-200 bg-bg-secondary text-txt-primary hover:bg-bg-tertiary disabled:opacity-60 disabled:cursor-not-allowed" onClick={handleCancel} disabled={isSaving}>
                Cancel
              </button>
              <button className="py-sm px-lg border-none rounded-md text-sm font-semibold cursor-pointer transition-all duration-200 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-[0_2px_8px_rgba(16,185,129,0.3)] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(16,185,129,0.4)] disabled:opacity-60 disabled:cursor-not-allowed" onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : '💾 Save Notes'}
              </button>
            </div>
          ) : (
            <>
              <button className="py-3 px-8 bg-gradient-to-br from-amber-400 to-amber-500 text-white border-none rounded-md text-sm font-semibold cursor-pointer transition-all duration-200 shadow-[0_2px_8px_rgba(255,193,7,0.3)] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(255,193,7,0.4)] active:translate-y-0" onClick={onClose}>Close</button>
              <button className="py-sm px-lg border-none rounded-md text-sm font-semibold cursor-pointer transition-all duration-200 bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-[0_2px_8px_rgba(255,193,7,0.3)] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(255,193,7,0.4)]" onClick={() => setIsEditing(true)}>✏️ Edit Notes</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default NotesModal;
