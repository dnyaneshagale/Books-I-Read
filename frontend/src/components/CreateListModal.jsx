import { useState } from 'react';

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
      <div className="bg-bg dark:bg-bg-secondary rounded-xl w-full max-w-[480px] max-h-[90vh] overflow-y-auto shadow-[0_24px_64px_rgba(0,0,0,0.14),0_0_0_1px_rgba(109,40,217,0.06)] dark:shadow-[0_24px_64px_rgba(0,0,0,0.5),0_0_0_1px_rgba(124,77,255,0.08)]" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center px-[26px] pt-[22px]">
          <h2 className="m-0 text-[1.2rem] font-extrabold text-txt-primary">{isEditing ? 'Edit List' : 'Create New List'}</h2>
          <button className="bg-none border-none text-[1.2rem] text-txt-secondary cursor-pointer p-1.5 px-2 rounded-sm transition-all duration-200 hover:bg-bg-tertiary hover:text-txt-primary" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="px-[26px] pt-[22px] pb-[26px] flex flex-col gap-5">
          {/* Emoji Picker */}
          <div className="flex items-center gap-4">
            <span className="text-[2.5rem] w-[62px] h-[62px] flex items-center justify-center bg-gradient-to-br from-[rgba(109,40,217,0.06)] to-[rgba(37,99,235,0.04)] dark:from-[rgba(124,77,255,0.12)] dark:to-[rgba(149,117,255,0.06)] rounded-md flex-shrink-0">{coverEmoji}</span>
            <div className="flex flex-wrap gap-1">
              {EMOJI_OPTIONS.map((em) => (
                <button
                  key={em}
                  type="button"
                  className={`w-[34px] h-[34px] flex items-center justify-center text-[1.1rem] border-2 border-transparent rounded-sm bg-none cursor-pointer transition-all duration-150 hover:bg-bg-tertiary ${coverEmoji === em ? 'border-primary bg-[rgba(109,40,217,0.06)] dark:bg-[rgba(124,77,255,0.12)] dark:border-primary' : ''}`}
                  onClick={() => setCoverEmoji(em)}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div className="flex flex-col gap-1.5 relative">
            <label className="text-[0.78rem] font-bold text-txt-secondary uppercase tracking-[0.06em]">List Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Best Sci-Fi of All Time"
              maxLength={100}
              autoFocus
              className="py-3 px-4 border border-border rounded-md text-sm text-txt-primary bg-bg outline-none transition-all duration-200 font-[inherit] focus:border-primary focus:shadow-[0_0_0_3px_rgba(109,40,217,0.08)] dark:bg-[#0F0C15] dark:border-border dark:text-txt-primary dark:focus:border-primary dark:focus:shadow-[0_0_0_3px_rgba(124,77,255,0.1)]"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5 relative">
            <label className="text-[0.78rem] font-bold text-txt-secondary uppercase tracking-[0.06em]">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this list about?"
              maxLength={500}
              rows={3}
              className="py-3 px-4 border border-border rounded-md text-sm text-txt-primary bg-bg outline-none transition-all duration-200 font-[inherit] resize-y focus:border-primary focus:shadow-[0_0_0_3px_rgba(109,40,217,0.08)] dark:bg-[#0F0C15] dark:border-border dark:text-txt-primary dark:focus:border-primary dark:focus:shadow-[0_0_0_3px_rgba(124,77,255,0.1)]"
            />
            <span className="absolute right-3 bottom-3 text-[0.7rem] text-txt-light dark:text-[#7a7181]">{description.length}/500</span>
          </div>

          {/* Visibility */}
          <div className="flex justify-between items-center py-3.5 px-[18px] bg-bg-tertiary dark:bg-bg-tertiary rounded-md">
            <div>
              <span className="text-[0.9rem] font-bold text-txt-primary block">
                {isPublic ? '🌍 Public' : '🔒 Private'}
              </span>
              <span className="text-[0.75rem] text-txt-secondary block mt-0.5">
                {isPublic ? 'Anyone can see this list' : 'Only you can see this list'}
              </span>
            </div>
            <button
              type="button"
              className={`w-[46px] h-[26px] rounded-[13px] border-none relative cursor-pointer transition-colors duration-200 flex-shrink-0 ${isPublic ? 'bg-primary dark:bg-primary' : 'bg-border dark:bg-[#3D3A45]'}`}
              onClick={() => setIsPublic(!isPublic)}
            >
              <span className={`absolute top-[3px] left-[3px] w-5 h-5 rounded-full bg-white transition-transform duration-200 shadow-[0_1px_4px_rgba(0,0,0,0.12)] ${isPublic ? 'translate-x-5' : ''}`} />
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-2.5 justify-end pt-2.5 border-t border-border dark:border-border">
            <button type="button" onClick={onClose} className="py-2.5 px-[22px] border border-border rounded-md bg-bg text-txt-primary text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-bg-tertiary dark:bg-bg-tertiary dark:border-border dark:text-txt-primary dark:hover:bg-[#3D3A45]">
              Cancel
            </button>
            <button type="submit" disabled={!name.trim() || saving} className="py-2.5 px-[26px] border-none rounded-md bg-gradient-to-br from-primary via-primary-light to-accent text-white text-sm font-bold cursor-pointer transition-all duration-200 shadow-[0_2px_8px_rgba(109,40,217,0.25)] hover:-translate-y-[1px] hover:shadow-[0_4px_14px_rgba(109,40,217,0.35)] disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0 dark:shadow-[0_2px_8px_rgba(124,77,255,0.3)] dark:hover:shadow-[0_4px_14px_rgba(124,77,255,0.4)]">
              {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create List'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
