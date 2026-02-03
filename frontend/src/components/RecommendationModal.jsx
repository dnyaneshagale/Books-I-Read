import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axiosClient from '../api/axiosClient';
import './RecommendationModal.css';

/**
 * Custom Select Component
 */
function CustomSelect({ value, onChange, options, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
  };

  const displayValue = value || placeholder;

  return (
    <div className="custom-select-wrapper">
      <button
        type="button"
        className="custom-select-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={!value ? 'placeholder-text' : ''}>{displayValue}</span>
        <svg
          className={`chevron-icon ${isOpen ? 'open' : ''}`}
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
        >
          <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      
      {isOpen && (
        <>
          <div className="select-backdrop" onClick={() => setIsOpen(false)} />
          <div className="custom-select-menu">
            {options.map((option) => (
              <div
                key={option}
                className={`select-option ${value === option ? 'selected' : ''}`}
                onClick={() => handleSelect(option)}
              >
                {option}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * RecommendationModal Component
 * 
 * AI-powered book recommendations with two modes:
 * - Library Mode: Analyze user's reading history
 * - Custom Mode: Discover books based on preferences
 */
function RecommendationModal({ onClose, userBooks, onAddToWishlist }) {
  const [activeTab, setActiveTab] = useState('library'); // 'library' or 'custom'
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState(null);
  const [addedBooks, setAddedBooks] = useState(new Set()); // Track added books

  // Custom discovery form state
  const [genre, setGenre] = useState('');
  const [mood, setMood] = useState('');
  const [length, setLength] = useState('');
  const [topics, setTopics] = useState('');

  const genres = [
    'Fiction', 'Non-Fiction', 'Sci-Fi', 'Fantasy', 'Mystery', 'Thriller',
    'Romance', 'History', 'Biography', 'Self-Help', 'Business', 'Philosophy',
    'Science', 'Poetry', 'Horror', 'Adventure'
  ];

  const moods = [
    'Uplifting', 'Dark', 'Educational', 'Fast-paced', 'Thought-provoking',
    'Light-hearted', 'Emotional', 'Inspiring', 'Suspenseful', 'Relaxing'
  ];

  const lengths = [
    'Short (< 200 pages)',
    'Medium (200-400 pages)',
    'Long (400-500 pages)',
    'Epic (> 500 pages)'
  ];

  const handleLibraryRecommendation = async () => {
    setLoading(true);
    setError(null);
    setRecommendations([]);

    try {
      // Filter finished and reading books
      const relevantBooks = userBooks.filter(
        book => book.status === 'FINISHED' || book.status === 'READING'
      );

      if (relevantBooks.length === 0) {
        setError('You need to have at least one book marked as "Reading" or "Finished" to get library-based recommendations.');
        setLoading(false);
        return;
      }

      const bookList = relevantBooks.map(book => `"${book.title}" by ${book.author}`).join(', ');

      const response = await axiosClient.post('/ai/recommendations/library', {
        books: bookList
      });

      setRecommendations(response.data.recommendations || []);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to generate recommendations. Please try again.';
      setError(errorMsg);
      console.error('Library recommendations error:', err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomRecommendation = async () => {
    if (!genre && !mood && !length && !topics) {
      setError('Please select at least one preference to get recommendations.');
      return;
    }

    setLoading(true);
    setError(null);
    setRecommendations([]);

    try {
      const response = await axiosClient.post('/ai/recommendations/custom', {
        genre: genre || null,
        mood: mood || null,
        length: length || null,
        topics: topics || null
      });

      setRecommendations(response.data.recommendations || []);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to generate recommendations. Please try again.';
      setError(errorMsg);
      console.error('Custom recommendations error:', err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBook = (book) => {
    const bookKey = `${book.title}-${book.author}`;
    
    // Prevent duplicate additions
    if (addedBooks.has(bookKey)) {
      return;
    }
    
    // Add to wishlist
    onAddToWishlist(book);
    
    // Mark as added
    setAddedBooks(prev => new Set([...prev, bookKey]));
  };

  // Prevent background scroll when modal is open
  useEffect(() => {
    // Save current overflow value
    const originalOverflow = document.body.style.overflow;
    
    // Disable scroll
    document.body.style.overflow = 'hidden';
    
    // Cleanup: restore scroll on unmount
    return () => {
      document.body.style.overflow = originalOverflow || 'unset';
    };
  }, []);

  const modalContent = (
    <div className="recommendation-modal-overlay" onClick={onClose}>
      <div className="recommendation-modal-content" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="recommendation-modal-header">
          <h2>🪄 AI Book Recommender</h2>
          <button 
            className="btn-close-recommendation" 
            onClick={onClose}
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="recommendation-tabs">
          <button
            className={`tab-button ${activeTab === 'library' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('library');
              setRecommendations([]);
              setError(null);
            }}
          >
            📚 Based on My Library
          </button>
          <button
            className={`tab-button ${activeTab === 'custom' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('custom');
              setRecommendations([]);
              setError(null);
            }}
          >
            🔍 Custom Discovery
          </button>
        </div>

        {/* Content Area */}
        <div className="recommendation-modal-body">
          
          {/* Library Mode */}
          {activeTab === 'library' && (
            <div className="mode-content">
              <p className="mode-description">
                Gemini will analyze your current reading list to find books matching your taste.
              </p>
              <button
                className="btn-primary-recommendation"
                onClick={handleLibraryRecommendation}
                disabled={loading}
              >
                {loading ? 'Analyzing...' : '🔮 Analyze & Recommend'}
              </button>
            </div>
          )}

          {/* Custom Mode */}
          {activeTab === 'custom' && (
            <div className="mode-content">
              <div className="custom-form">
                <div className="form-group">
                  <label>Genre</label>
                  <CustomSelect
                    value={genre}
                    onChange={setGenre}
                    options={genres}
                    placeholder="Select a genre..."
                  />
                </div>

                <div className="form-group">
                  <label>Mood/Vibe</label>
                  <CustomSelect
                    value={mood}
                    onChange={setMood}
                    options={moods}
                    placeholder="Select a mood..."
                  />
                </div>

                <div className="form-group">
                  <label>Book Length</label>
                  <CustomSelect
                    value={length}
                    onChange={setLength}
                    options={lengths}
                    placeholder="Select length..."
                  />
                </div>

                <div className="form-group">
                  <label>Specific Topics (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g., Time travel in the 19th century"
                    value={topics}
                    onChange={(e) => setTopics(e.target.value)}
                  />
                </div>

                <button
                  className="btn-primary-recommendation"
                  onClick={handleCustomRecommendation}
                  disabled={loading}
                >
                  {loading ? 'Finding Books...' : '🎯 Find Books'}
                </button>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="recommendation-error">
              <p>⚠️ {error}</p>
            </div>
          )}

          {/* Recommendations Display */}
          {recommendations.length > 0 && (
            <div className="recommendations-list">
              <h3>✨ Recommended for You</h3>
              {recommendations.map((book, index) => {
                const bookKey = `${book.title}-${book.author}`;
                const isAdded = addedBooks.has(bookKey);
                
                return (
                  <div key={index} className="recommendation-card">
                    <div className="recommendation-info">
                      <h4>{book.title}</h4>
                      <p className="recommendation-author">{book.author}</p>
                      <p className="recommendation-reason">{book.reason}</p>
                    </div>
                    <button
                      className={`btn-add-wishlist ${isAdded ? 'added' : ''}`}
                      onClick={() => handleAddBook(book)}
                      disabled={isAdded}
                      title={isAdded ? 'Already added' : 'Add to Want to Read'}
                    >
                      {isAdded ? '✓ Added' : '+ Add'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="recommendation-loading">
              <div className="recommendation-spinner"></div>
              <p>Analyzing your preferences...</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );

  // Render modal in portal to prevent z-index stacking issues
  return ReactDOM.createPortal(
    modalContent,
    document.getElementById('modal-root')
  );
}

export default RecommendationModal;
