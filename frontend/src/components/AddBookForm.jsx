import React, { useState } from 'react';
import bookApi from '../api/bookApi';
import toast from 'react-hot-toast';

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
    <div className="bg-bg border border-border rounded-lg p-xl max-md:px-lg max-md:py-xl max-[400px]:p-md">
      <h2 className="text-2xl font-semibold text-txt-primary mb-xl max-md:mb-lg max-[400px]:text-lg">Add New Book</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-lg">
          <label htmlFor="title" className="block text-sm font-medium text-txt-primary mb-sm max-md:text-base max-md:mb-2.5">
            Title <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`w-full py-3 px-4 border-2 border-slate-400 rounded-md text-base text-txt-primary bg-bg transition-all duration-200 focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(109,40,217,0.1)] max-md:py-3.5 max-md:px-4 max-md:text-base max-md:min-h-[48px] max-[400px]:text-xs ${errors.title ? 'border-danger focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]' : ''}`}
            placeholder="Enter book title"
          />
          {errors.title && <span className="block text-xs text-danger mt-xs">{errors.title}</span>}
        </div>

        <div className="mb-lg">
          <label htmlFor="author" className="block text-sm font-medium text-txt-primary mb-sm max-md:text-base max-md:mb-2.5">
            Author <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            id="author"
            name="author"
            value={formData.author}
            onChange={handleChange}
            className={`w-full py-3 px-4 border-2 border-slate-400 rounded-md text-base text-txt-primary bg-bg transition-all duration-200 focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(109,40,217,0.1)] max-md:py-3.5 max-md:px-4 max-md:text-base max-md:min-h-[48px] max-[400px]:text-xs ${errors.author ? 'border-danger focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]' : ''}`}
            placeholder="Enter author name"
          />
          {errors.author && <span className="block text-xs text-danger mt-xs">{errors.author}</span>}
        </div>

        <div className="grid grid-cols-2 gap-md max-md:grid-cols-1 max-md:gap-lg">
          <div className="mb-lg">
            <label htmlFor="totalPages" className="block text-sm font-medium text-txt-primary mb-sm max-md:text-base max-md:mb-2.5">
              Total Pages <span className="text-danger">*</span>
            </label>
            <input
              type="number"
              id="totalPages"
              name="totalPages"
              value={formData.totalPages}
              onChange={handleChange}
              className={`w-full py-3 px-4 border-2 border-slate-400 rounded-md text-base text-txt-primary bg-bg transition-all duration-200 focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(109,40,217,0.1)] max-md:py-3.5 max-md:px-4 max-md:text-base max-md:min-h-[48px] max-[400px]:text-xs ${errors.totalPages ? 'border-danger focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]' : ''}`}
              placeholder="e.g., 350"
              min="1"
            />
            {errors.totalPages && <span className="block text-xs text-danger mt-xs">{errors.totalPages}</span>}
          </div>

          <div className="mb-lg">
            <label htmlFor="pagesRead" className="block text-sm font-medium text-txt-primary mb-sm max-md:text-base max-md:mb-2.5">
              Pages Read <span className="text-danger">*</span>
            </label>
            <input
              type="number"
              id="pagesRead"
              name="pagesRead"
              value={formData.pagesRead}
              onChange={handleChange}
              className={`w-full py-3 px-4 border-2 border-slate-400 rounded-md text-base text-txt-primary bg-bg transition-all duration-200 focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(109,40,217,0.1)] max-md:py-3.5 max-md:px-4 max-md:text-base max-md:min-h-[48px] max-[400px]:text-xs ${errors.pagesRead ? 'border-danger focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]' : ''}`}
              placeholder="e.g., 0"
              min="0"
            />
            {errors.pagesRead && <span className="block text-xs text-danger mt-xs">{errors.pagesRead}</span>}
          </div>
        </div>

        <div className="mb-lg">
          <label htmlFor="tags" className="block text-sm font-medium text-txt-primary mb-sm max-md:text-base max-md:mb-2.5">
            Tags / Genres
          </label>
          <div className="flex gap-sm">
            <input
              type="text"
              id="tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagInputKeyDown}
              placeholder="Add tags (press Enter or comma)"
              className="flex-1 py-3 px-4 border-2 border-slate-400 rounded-md text-base bg-bg text-txt-primary transition-all duration-200 focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(109,40,217,0.1)] max-md:py-3 max-md:px-3.5 max-md:text-base max-md:min-h-[48px]"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="py-2.5 px-5 bg-primary text-white border-none rounded-md text-lg font-semibold cursor-pointer transition-colors duration-200 min-w-[50px] hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!tagInput.trim()}
            >
              +
            </button>
          </div>
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-sm mt-sm">
              {formData.tags.map((tag, index) => (
                <span key={index} className="tag-chip inline-flex items-center gap-xs py-1.5 px-3 bg-gradient-to-br from-indigo-400 to-purple-700 text-white rounded-[20px] text-sm font-medium animate-[tagFadeIn_0.2s_ease] max-md:py-1.5 max-md:px-3 max-md:text-xs max-md:min-h-[32px]">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="bg-white/30 border-none text-white text-lg font-bold w-5 h-5 rounded-full cursor-pointer flex items-center justify-center p-0 leading-none transition-colors duration-200 hover:bg-white/50 max-md:text-base max-md:min-w-[24px] max-md:min-h-[24px]"
                    aria-label="Remove tag"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="mb-lg mt-md">
          <label className="flex items-center gap-sm cursor-pointer select-none">
            <input
              type="checkbox"
              checked={!formData.isPublic}
              onChange={(e) => setFormData(prev => ({ ...prev, isPublic: !e.target.checked }))}
              className="w-[18px] h-[18px] accent-primary cursor-pointer"
            />
            <span className="text-[0.9rem] text-txt-secondary">
              {formData.isPublic ? '🌍 Public — visible to your followers' : '🔒 Private — only you can see this book'}
            </span>
          </label>
        </div>

        <div className="flex gap-md justify-end mt-xl pt-lg border-t border-border max-md:flex-col-reverse max-md:gap-md">
          <button
            type="button"
            className="btn-secondary bg-bg text-txt-primary border-2 border-border py-3 px-6 rounded-md text-sm font-semibold cursor-pointer transition-all duration-200 shadow-xs hover:bg-bg-hover hover:border-primary hover:text-primary hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed max-md:w-full max-md:py-4 max-md:px-5 max-md:text-base max-md:min-h-[52px]"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary bg-gradient-to-br from-primary to-accent text-white border-none py-3 px-6 rounded-md text-sm font-semibold cursor-pointer transition-all duration-200 shadow-sm relative overflow-hidden hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed max-md:w-full max-md:py-4 max-md:px-5 max-md:text-base max-md:min-h-[52px]"
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
