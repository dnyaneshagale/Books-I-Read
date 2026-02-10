import React, { useState } from 'react';
import bookApi from '../api/bookApi';
import toast from 'react-hot-toast';
import './AddBookForm.css';

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
    <div className="add-book-form">
      <h2>Add New Book</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">
            Title <span className="required">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={errors.title ? 'error' : ''}
            placeholder="Enter book title"
          />
          {errors.title && <span className="error-message">{errors.title}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="author">
            Author <span className="required">*</span>
          </label>
          <input
            type="text"
            id="author"
            name="author"
            value={formData.author}
            onChange={handleChange}
            className={errors.author ? 'error' : ''}
            placeholder="Enter author name"
          />
          {errors.author && <span className="error-message">{errors.author}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="totalPages">
              Total Pages <span className="required">*</span>
            </label>
            <input
              type="number"
              id="totalPages"
              name="totalPages"
              value={formData.totalPages}
              onChange={handleChange}
              className={errors.totalPages ? 'error' : ''}
              placeholder="e.g., 350"
              min="1"
            />
            {errors.totalPages && <span className="error-message">{errors.totalPages}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="pagesRead">
              Pages Read <span className="required">*</span>
            </label>
            <input
              type="number"
              id="pagesRead"
              name="pagesRead"
              value={formData.pagesRead}
              onChange={handleChange}
              className={errors.pagesRead ? 'error' : ''}
              placeholder="e.g., 0"
              min="0"
            />
            {errors.pagesRead && <span className="error-message">{errors.pagesRead}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="tags">
            Tags / Genres
          </label>
          <div className="tags-input-container">
            <input
              type="text"
              id="tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagInputKeyDown}
              placeholder="Add tags (press Enter or comma)"
              className="tags-input"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="btn-add-tag"
              disabled={!tagInput.trim()}
            >
              +
            </button>
          </div>
          {formData.tags.length > 0 && (
            <div className="tags-display">
              {formData.tags.map((tag, index) => (
                <span key={index} className="tag-chip">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="tag-remove"
                    aria-label="Remove tag"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="form-group form-group--toggle">
          <label className="privacy-toggle">
            <input
              type="checkbox"
              checked={!formData.isPublic}
              onChange={(e) => setFormData(prev => ({ ...prev, isPublic: !e.target.checked }))}
            />
            <span className="privacy-toggle__label">
              {formData.isPublic ? '🌍 Public — visible to your followers' : '🔒 Private — only you can see this book'}
            </span>
          </label>
        </div>

        <div className="form-actions">
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
