import React, { useState } from 'react';
import { FileText, PenLine, BookOpen, Lightbulb, Save } from 'lucide-react';
import bookApi from '../api/bookApi';
import toast from 'react-hot-toast';
import ModalShell from './ui/modal-shell';
import useBodyScrollLock from '../hooks/useBodyScrollLock';
import {
  modalAmberAccentBtn,
  modalAmberPrimaryBtn,
  modalAmberPrimaryLargeBtn,
  modalEmeraldPrimaryBtn,
  modalNeutralSecondaryBtn,
} from './ui/modal-button-tokens';

/**
 * NotesModal Component
 * 
 * Modal to view and edit book notes
 */
function NotesModal({ book, onClose, onUpdated }) {
  useBodyScrollLock();

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
    } catch {
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
        <div className="text-center py-[var(--spacing-2xl)] px-[var(--spacing-lg)]">
          <div className="text-[64px] mb-[var(--spacing-md)] opacity-30"><FileText className="w-16 h-16 mx-auto" /></div>
          <p className="text-[var(--font-size-lg)] font-[var(--font-weight-semibold)] text-[var(--color-text-primary)] m-0 mb-[var(--spacing-sm)]">No notes yet</p>
          <p className="text-[var(--font-size-sm)] text-[var(--color-text-secondary)] m-0 leading-[1.6]">
            Click the Edit button to add your reading notes, quotes, or key takeaways.
          </p>
        </div>
      );
    }

    return (
      <div className="bg-amber-400/5 border-l-4 border-l-amber-400 rounded-[var(--radius-md)] p-[var(--spacing-lg)] mb-[var(--spacing-lg)]">
        <div className="text-[var(--font-size-md)] text-[var(--color-text-primary)] leading-[1.8]">
          {currentNotes.split('\n').map((paragraph, index) => {
            const trimmed = paragraph.trim();
            const isBullet = trimmed.startsWith('•') || trimmed.startsWith('-');
            
            return (
              <p key={index} className={`m-0 mb-[var(--spacing-md)] last:mb-0 whitespace-pre-wrap break-words ${isBullet ? 'pl-[var(--spacing-md)]' : ''}`}>
                {isBullet ? trimmed : paragraph}
              </p>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <ModalShell
      onClose={onClose}
      title="Reading Notes"
      icon={<FileText className="w-5 h-5" />}
      contentClassName="max-w-[700px] max-h-[calc(100dvh-40px)] border-2 border-amber-400 m-auto flex flex-col max-md:max-w-full max-md:max-h-[calc(100dvh-20px)]"
      headerClassName="p-[var(--spacing-lg)] border-b-2 border-b-amber-400 bg-gradient-to-br from-amber-400/10 to-amber-500/5 shrink-0 max-md:p-[var(--spacing-md)]"
      closeBtnClassName="bg-transparent border-none text-[28px] text-[var(--color-text-secondary)] p-0 w-8 h-8 rounded-[var(--radius-sm)] hover:bg-amber-400/20 hover:text-amber-500"
      bodyClassName="flex flex-col flex-1 min-h-0"
    >
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-[var(--spacing-lg)] min-h-0 max-md:p-[var(--spacing-md)]" style={{ scrollbarWidth: 'thin', scrollbarColor: '#ffc107 transparent' }}>
          <div className="text-center mb-[var(--spacing-xl)] pb-[var(--spacing-lg)] border-b border-[var(--color-border)]">
            <h3 className="text-[var(--font-size-xl)] font-[var(--font-weight-bold)] text-[var(--color-text-primary)] m-0 mb-[var(--spacing-xs)] leading-[1.3] max-md:text-[var(--font-size-lg)]">{book.title}</h3>
            <p className="text-[var(--font-size-md)] text-[var(--color-text-secondary)] m-0 mb-[var(--spacing-sm)] italic">by {book.author}</p>
            {book.startDate && (
              <p className="text-[var(--font-size-sm)] text-[var(--color-text-secondary)] m-0">
                Started: {formatDate(book.startDate)}
                {book.completeDate && ` • Finished: ${formatDate(book.completeDate)}`}
              </p>
            )}
          </div>

          {isEditing ? (
            <div className="mt-[var(--spacing-lg)]">
              <div className="flex justify-between items-center mb-[var(--spacing-sm)]">
                <label htmlFor="notes-textarea" className="font-[var(--font-weight-semibold)] text-[var(--color-text-primary)] text-[var(--font-size-md)] m-0"><PenLine className="w-4 h-4 inline mr-1" /> Edit Notes</label>
                <button 
                  className={modalAmberAccentBtn}
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
                className="w-full p-[var(--spacing-md)] border-2 border-amber-400 rounded-[var(--radius-md)] text-[var(--font-size-md)] font-[inherit] leading-[1.8] resize-y transition-all duration-200 bg-amber-400/5 focus:outline-none focus:border-amber-500 focus:shadow-[0_0_0_3px_rgba(255,193,7,0.1)] focus:bg-white"
                autoFocus
              />
              <div className="mt-[var(--spacing-sm)] py-[var(--spacing-sm)] px-[var(--spacing-md)] bg-amber-400/10 border-l-[3px] border-l-amber-400 rounded-[var(--radius-sm)] text-[var(--font-size-sm)] text-[var(--color-text-secondary)]">
                <Lightbulb className="w-3.5 h-3.5 inline mr-1" /> Tip: Start lines with • or - for bullet points
              </div>
            </div>
          ) : (
            renderNotesContent()
          )}

          {book.review && (
            <div className="mt-[var(--spacing-lg)] pt-[var(--spacing-lg)] border-t border-[var(--color-border)]">
              <h4 className="text-[var(--font-size-md)] font-[var(--font-weight-semibold)] text-[var(--color-primary)] m-0 mb-[var(--spacing-md)]"><BookOpen className="w-4 h-4 inline mr-1" /> Review</h4>
              <div className="bg-[var(--color-bg-secondary)] border-l-4 border-l-[var(--color-primary)] rounded-[var(--radius-md)] p-[var(--spacing-md)] text-[var(--font-size-sm)] text-[var(--color-text-secondary)] italic leading-[1.7] whitespace-pre-wrap">{book.review}</div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center p-[var(--spacing-lg)] border-t border-[var(--color-border)] bg-[var(--color-bg)] shrink-0 max-md:p-[var(--spacing-md)]">
          {isEditing ? (
            <div className="flex gap-[var(--spacing-sm)]">
              <button className={modalNeutralSecondaryBtn} onClick={handleCancel} disabled={isSaving}>
                Cancel
              </button>
              <button className={modalEmeraldPrimaryBtn} onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : <><Save className="w-4 h-4 inline mr-1" /> Save Notes</>}
              </button>
            </div>
          ) : (
            <>
              <button className={modalAmberPrimaryLargeBtn} onClick={onClose}>Close</button>
              <button className={modalAmberPrimaryBtn} onClick={() => setIsEditing(true)}>✏️ Edit Notes</button>
            </>
          )}
        </div>
    </ModalShell>
  );
}

export default NotesModal;
