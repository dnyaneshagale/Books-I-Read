import React, { useState } from 'react';
import { Globe, Lock } from 'lucide-react';
import bookApi from '../api/bookApi';
import toast from 'react-hot-toast';

const TAG_GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
];

/**
 * AddBookForm Component
 * 
 * Form to add a new book with validation
 */
function AddBookForm({ onBookAdded, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    totalPages: '',
    pagesRead: '0',
    status: 'WANT_TO_READ',
    isPublic: true,
    tags: []
  });

  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setTagInput('');
    }
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.author.trim()) {
      newErrors.author = 'Author is required';
    }

    if (!formData.totalPages || formData.totalPages <= 0) {
      newErrors.totalPages = 'Total pages must be greater than 0';
    }

    const pagesRead = parseInt(formData.pagesRead);
    const totalPages = parseInt(formData.totalPages);

    if (pagesRead < 0) {
      newErrors.pagesRead = 'Pages read cannot be negative';
    }

    if (pagesRead > totalPages) {
      newErrors.pagesRead = 'Pages read cannot exceed total pages';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);

    try {
      const bookData = {
        title: formData.title.trim(),
        author: formData.author.trim(),
        totalPages: parseInt(formData.totalPages),
        pagesRead: parseInt(formData.pagesRead),
        status: formData.status,
        isPublic: formData.isPublic,
        tags: formData.tags
      };

      await bookApi.createBook(bookData);
      toast.success('📚 Book added successfully!');
      
      // Reset form
      setFormData({
        title: '',
        author: '',
        totalPages: '',
        pagesRead: '0',
        status: 'WANT_TO_READ',
        isPublic: true,
        tags: []
      });
      setTagInput('');

      if (onBookAdded) {
        onBookAdded();
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        // Handle validation errors from backend
        setErrors(error.response.data.errors);
        toast.error('Validation failed. Please check the form.');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to add book. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-[var(--spacing-xl)] max-md:px-[var(--spacing-lg)] max-[400px]:p-[var(--spacing-md)]">
      <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-[var(--spacing-xl)] max-md:mb-[var(--spacing-lg)] max-[400px]:text-lg">Add New Book</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-[var(--spacing-lg)]">
          <label htmlFor="title" className="block text-sm font-medium text-[var(--color-text-primary)] mb-[var(--spacing-sm)] max-md:text-base max-md:mb-2.5">
            Title <span className="text-[var(--color-danger)]">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`w-full py-3 px-4 border-2 border-slate-400 rounded-[var(--radius-md)] text-base text-[var(--color-text-primary)] bg-[var(--color-bg)] transition-all duration-200 focus:outline-none focus:border-[var(--color-primary)] focus:shadow-[0_0_0_4px_rgba(109,40,217,0.1)] max-md:py-3.5 max-md:min-h-[48px] max-[400px]:text-xs ${errors.title ? 'border-[var(--color-danger)] focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]' : ''}`}
            placeholder="Enter book title"
          />
          {errors.title && <span className="block text-xs text-[var(--color-danger)] mt-[var(--spacing-xs)]">{errors.title}</span>}
        </div>

        <div className="mb-[var(--spacing-lg)]">
          <label htmlFor="author" className="block text-sm font-medium text-[var(--color-text-primary)] mb-[var(--spacing-sm)] max-md:text-base max-md:mb-2.5">
            Author <span className="text-[var(--color-danger)]">*</span>
          </label>
          <input
            type="text"
            id="author"
            name="author"
            value={formData.author}
            onChange={handleChange}
            className={`w-full py-3 px-4 border-2 border-slate-400 rounded-[var(--radius-md)] text-base text-[var(--color-text-primary)] bg-[var(--color-bg)] transition-all duration-200 focus:outline-none focus:border-[var(--color-primary)] focus:shadow-[0_0_0_4px_rgba(109,40,217,0.1)] max-md:py-3.5 max-md:min-h-[48px] max-[400px]:text-xs ${errors.author ? 'border-[var(--color-danger)] focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]' : ''}`}
            placeholder="Enter author name"
          />
          {errors.author && <span className="block text-xs text-[var(--color-danger)] mt-[var(--spacing-xs)]">{errors.author}</span>}
        </div>

        <div className="grid grid-cols-2 gap-[var(--spacing-md)] max-md:grid-cols-1 max-md:gap-[var(--spacing-lg)]">
          <div className="mb-[var(--spacing-lg)]">
            <label htmlFor="totalPages" className="block text-sm font-medium text-[var(--color-text-primary)] mb-[var(--spacing-sm)] max-md:text-base max-md:mb-2.5">
              Total Pages <span className="text-[var(--color-danger)]">*</span>
            </label>
            <input
              type="number"
              id="totalPages"
              name="totalPages"
              value={formData.totalPages}
              onChange={handleChange}
              className={`w-full py-3 px-4 border-2 border-slate-400 rounded-[var(--radius-md)] text-base text-[var(--color-text-primary)] bg-[var(--color-bg)] transition-all duration-200 focus:outline-none focus:border-[var(--color-primary)] focus:shadow-[0_0_0_4px_rgba(109,40,217,0.1)] max-md:py-3.5 max-md:min-h-[48px] max-[400px]:text-xs ${errors.totalPages ? 'border-[var(--color-danger)] focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]' : ''}`}
              placeholder="e.g., 350"
              min="1"
            />
            {errors.totalPages && <span className="block text-xs text-[var(--color-danger)] mt-[var(--spacing-xs)]">{errors.totalPages}</span>}
          </div>

          <div className="mb-[var(--spacing-lg)]">
            <label htmlFor="pagesRead" className="block text-sm font-medium text-[var(--color-text-primary)] mb-[var(--spacing-sm)] max-md:text-base max-md:mb-2.5">
              Pages Read <span className="text-[var(--color-danger)]">*</span>
            </label>
            <input
              type="number"
              id="pagesRead"
              name="pagesRead"
              value={formData.pagesRead}
              onChange={handleChange}
              className={`w-full py-3 px-4 border-2 border-slate-400 rounded-[var(--radius-md)] text-base text-[var(--color-text-primary)] bg-[var(--color-bg)] transition-all duration-200 focus:outline-none focus:border-[var(--color-primary)] focus:shadow-[0_0_0_4px_rgba(109,40,217,0.1)] max-md:py-3.5 max-md:min-h-[48px] max-[400px]:text-xs ${errors.pagesRead ? 'border-[var(--color-danger)] focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]' : ''}`}
              placeholder="e.g., 0"
              min="0"
            />
            {errors.pagesRead && <span className="block text-xs text-[var(--color-danger)] mt-[var(--spacing-xs)]">{errors.pagesRead}</span>}
          </div>
        </div>

        <div className="mb-[var(--spacing-lg)]">
          <label htmlFor="tags" className="block text-sm font-medium text-[var(--color-text-primary)] mb-[var(--spacing-sm)] max-md:text-base max-md:mb-2.5">
            Tags / Genres
          </label>
          <div className="flex gap-[var(--spacing-sm)]">
            <input
              type="text"
              id="tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagInputKeyDown}
              placeholder="Add tags (press Enter or comma)"
              className="flex-1 py-3 px-4 border-2 border-slate-400 rounded-[var(--radius-md)] text-base bg-[var(--color-bg)] text-[var(--color-text-primary)] transition-all duration-200 focus:outline-none focus:border-[var(--color-primary)] focus:shadow-[0_0_0_4px_rgba(109,40,217,0.1)] max-md:py-3 max-md:px-3.5 max-md:min-h-[48px]"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="py-2.5 px-5 bg-[var(--color-primary)] text-white border-none rounded-[var(--radius-md)] text-lg font-semibold cursor-pointer transition-colors duration-200 min-w-[50px] hover:not-disabled:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!tagInput.trim()}
            >
              +
            </button>
          </div>
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-[var(--spacing-sm)] mt-[var(--spacing-sm)]">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-[var(--spacing-xs)] py-1.5 px-3 text-white rounded-[20px] text-sm font-medium animate-[tagFadeIn_0.2s_ease] max-md:text-xs max-md:min-h-[32px]"
                  style={{ background: TAG_GRADIENTS[index % TAG_GRADIENTS.length] }}
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="bg-white/30 border-none text-white text-[18px] font-bold w-5 h-5 rounded-full cursor-pointer flex items-center justify-center p-0 leading-none transition-colors duration-200 hover:bg-white/50"
                    aria-label="Remove tag"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="mb-[var(--spacing-lg)] mt-[var(--spacing-md)]">
          <label className="flex items-center gap-[var(--spacing-sm)] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={!formData.isPublic}
              onChange={(e) => setFormData(prev => ({ ...prev, isPublic: !e.target.checked }))}
              className="w-[18px] h-[18px] accent-[var(--color-primary)] cursor-pointer"
            />
            <span className="flex items-center gap-1.5 text-[0.9rem] text-[var(--color-text-secondary)]">
              {formData.isPublic ? <><Globe className="w-4 h-4" /> Public — visible to your followers</> : <><Lock className="w-4 h-4" /> Private — only you can see this book</>}
            </span>
          </label>
        </div>

        <div className="flex gap-[var(--spacing-md)] justify-end mt-[var(--spacing-xl)] pt-[var(--spacing-lg)] border-t border-[var(--color-border)] max-md:flex-col-reverse max-md:*:w-full max-md:*:py-4 max-md:*:px-5 max-md:*:text-base max-md:*:min-h-[52px]">
          <button
            type="button"
            className="btn-secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding...' : 'Add Book'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddBookForm;
