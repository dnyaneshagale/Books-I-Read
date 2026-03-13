import { useState } from 'react';
import { Globe, Lock } from 'lucide-react';

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
    <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-[1000] p-5 backdrop-blur-[8px]" onClick={onClose}>
      <div className="bg-[var(--color-bg,#fff)] rounded-[var(--radius-xl,20px)] w-full max-w-[480px] max-h-[90vh] overflow-y-auto shadow-[0_24px_64px_rgba(0,0,0,0.14),0_0_0_1px_rgba(109,40,217,0.06)] dark:bg-[var(--color-bg-secondary,#1E1B24)] dark:shadow-[0_24px_64px_rgba(0,0,0,0.5),0_0_0_1px_rgba(124,77,255,0.08)]" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center px-[26px] pt-[22px]">
          <h2 className="m-0 text-[1.2rem] font-[var(--font-weight-extrabold,800)] text-[var(--color-text-primary,#0f172a)] dark:text-[var(--color-text-primary,#E2D9F3)]">{isEditing ? 'Edit List' : 'Create New List'}</h2>
          <button className="bg-transparent border-none text-[1.2rem] text-[var(--color-text-secondary,#475569)] cursor-pointer py-1.5 px-2 rounded-[var(--radius-sm,8px)] transition-all duration-200 hover:bg-[var(--color-bg-tertiary,#f1f5f9)] hover:text-[var(--color-text-primary,#0f172a)] dark:text-[var(--color-text-secondary,#9E95A8)] dark:hover:bg-[var(--color-bg-tertiary,#2D2A35)] dark:hover:text-[var(--color-text-primary,#E2D9F3)]" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="px-[26px] pt-[22px] pb-[26px] flex flex-col gap-5">
          {/* Emoji Picker */}
          <div className="flex items-center gap-4">
            <span className="text-[2.5rem] w-[62px] h-[62px] flex items-center justify-center bg-gradient-to-br from-violet-700/[0.06] to-blue-600/[0.04] rounded-[var(--radius-md,12px)] shrink-0 dark:from-[rgba(124,77,255,0.12)] dark:to-[rgba(149,117,255,0.06)]">{coverEmoji}</span>
            <div className="flex flex-wrap gap-1">
              {EMOJI_OPTIONS.map((em) => (
                <button
                  key={em}
                  type="button"
                  className={`w-[34px] h-[34px] flex items-center justify-center text-[1.1rem] border-2 rounded-[var(--radius-sm,8px)] bg-transparent cursor-pointer transition-all duration-150 hover:bg-[var(--color-bg-tertiary,#f1f5f9)] dark:hover:bg-[var(--color-bg-tertiary,#2D2A35)] ${coverEmoji === em ? 'border-[var(--color-primary,#6d28d9)] bg-[rgba(109,40,217,0.06)] dark:bg-[rgba(124,77,255,0.12)] dark:border-[var(--color-primary,#7C4DFF)]' : 'border-transparent'}`}
                  onClick={() => setCoverEmoji(em)}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.78rem] font-bold text-[var(--color-text-secondary,#475569)] uppercase tracking-[0.06em] dark:text-[var(--color-text-secondary,#9E95A8)]">List Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Best Sci-Fi of All Time"
              maxLength={100}
              autoFocus
              className="py-3 px-4 border border-[var(--color-border,#e2e8f0)] rounded-[var(--radius-md,12px)] text-[var(--font-size-sm,14px)] text-[var(--color-text-primary,#0f172a)] bg-[var(--color-bg,#fff)] outline-none transition-all duration-200 font-[inherit] focus:border-[var(--color-primary,#6d28d9)] focus:shadow-[0_0_0_3px_rgba(109,40,217,0.08)] dark:bg-[var(--color-bg,#0F0C15)] dark:border-[var(--color-border,#2D2A35)] dark:text-[var(--color-text-primary,#E2D9F3)] dark:focus:border-[var(--color-primary,#7C4DFF)] dark:focus:shadow-[0_0_0_3px_rgba(124,77,255,0.1)]"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5 relative">
            <label className="text-[0.78rem] font-bold text-[var(--color-text-secondary,#475569)] uppercase tracking-[0.06em] dark:text-[var(--color-text-secondary,#9E95A8)]">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this list about?"
              maxLength={500}
              rows={3}
              className="py-3 px-4 border border-[var(--color-border,#e2e8f0)] rounded-[var(--radius-md,12px)] text-[var(--font-size-sm,14px)] text-[var(--color-text-primary,#0f172a)] bg-[var(--color-bg,#fff)] outline-none transition-all duration-200 font-[inherit] resize-y focus:border-[var(--color-primary,#6d28d9)] focus:shadow-[0_0_0_3px_rgba(109,40,217,0.08)] dark:bg-[var(--color-bg,#0F0C15)] dark:border-[var(--color-border,#2D2A35)] dark:text-[var(--color-text-primary,#E2D9F3)] dark:focus:border-[var(--color-primary,#7C4DFF)] dark:focus:shadow-[0_0_0_3px_rgba(124,77,255,0.1)]"
            />
            <span className="absolute right-3 bottom-3 text-[0.7rem] text-[var(--color-text-light,#94a3b8)] dark:text-[#7a7181]">{description.length}/500</span>
          </div>

          {/* Visibility */}
          <div className="flex justify-between items-center py-3.5 px-[18px] bg-[var(--color-bg-tertiary,#f1f5f9)] rounded-[var(--radius-md,12px)] dark:bg-[var(--color-bg-tertiary,#2D2A35)]">
            <div>
              <span className="flex items-center gap-1.5 text-[0.9rem] font-bold text-[var(--color-text-primary,#0f172a)] dark:text-[var(--color-text-primary,#E2D9F3)]">
                {isPublic ? <><Globe className="w-4 h-4" /> Public</> : <><Lock className="w-4 h-4" /> Private</>}
              </span>
              <span className="block text-[0.75rem] text-[var(--color-text-secondary,#475569)] mt-0.5 dark:text-[var(--color-text-secondary,#9E95A8)]">
                {isPublic ? 'Anyone can see this list' : 'Only you can see this list'}
              </span>
            </div>
            <button
              type="button"
              className={`w-[46px] h-[26px] rounded-[13px] border-none relative cursor-pointer transition-colors duration-200 shrink-0 ${isPublic ? 'bg-[var(--color-primary,#6d28d9)] dark:bg-[var(--color-primary,#7C4DFF)]' : 'bg-[var(--color-border,#e2e8f0)] dark:bg-[#3D3A45]'}`}
              onClick={() => setIsPublic(!isPublic)}
            >
              <span className={`absolute top-[3px] left-[3px] w-5 h-5 rounded-full bg-white transition-transform duration-200 shadow-[0_1px_4px_rgba(0,0,0,0.12)] ${isPublic ? 'translate-x-5' : ''}`} />
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-2.5 justify-end pt-2.5 border-t border-[var(--color-border,#e2e8f0)] dark:border-[var(--color-border,#2D2A35)]">
            <button type="button" onClick={onClose} className="py-2.5 px-[22px] border border-[var(--color-border,#e2e8f0)] rounded-[var(--radius-md,12px)] bg-[var(--color-bg,#fff)] text-[var(--color-text-primary,#0f172a)] text-[var(--font-size-sm,14px)] font-semibold cursor-pointer transition-all duration-200 hover:bg-[var(--color-bg-tertiary,#f1f5f9)] dark:bg-[var(--color-bg-tertiary,#2D2A35)] dark:border-[var(--color-border,#2D2A35)] dark:text-[var(--color-text-primary,#E2D9F3)] dark:hover:bg-[#3D3A45]">
              Cancel
            </button>
            <button type="submit" disabled={!name.trim() || saving} className="py-2.5 px-[26px] border-none rounded-[var(--radius-md,12px)] bg-gradient-to-br from-violet-700 via-violet-600 to-blue-600 text-white text-[var(--font-size-sm,14px)] font-bold cursor-pointer transition-all duration-200 shadow-[0_2px_8px_rgba(109,40,217,0.25)] hover:enabled:-translate-y-px hover:enabled:shadow-[0_4px_14px_rgba(109,40,217,0.35)] disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none dark:shadow-[0_2px_8px_rgba(124,77,255,0.3)] dark:hover:enabled:shadow-[0_4px_14px_rgba(124,77,255,0.4)]">
              {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create List'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
