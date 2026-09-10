import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Wand2, Library, Search, Target, Sparkles } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import useBodyScrollLock from '../hooks/useBodyScrollLock';

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
    <div className="relative">
      <button
        type="button"
        className="w-full py-3 px-4 bg-white border-2 border-[var(--color-border)] rounded-xl text-base text-[var(--color-text-primary)] cursor-pointer flex items-center justify-between transition-all duration-200 text-left hover:border-violet-700 focus:outline-none focus:border-violet-700 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)] dark:bg-[#1a1a1a] dark:border-[#333] dark:text-[#e2e8f0] max-md:min-h-12 max-md:py-3.5 max-md:px-4"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={!value ? 'text-[var(--color-text-light)]' : ''}>{displayValue}</span>
        <svg
          className={`shrink-0 text-[var(--color-text-secondary)] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
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
          <div className="fixed inset-0 z-[999]" onClick={() => setIsOpen(false)} />
          <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white border border-[var(--color-border)] rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] max-h-[200px] overflow-y-auto z-[1000] animate-[dropdownSlide_0.2s_ease] dark:bg-[#1a1a1a] dark:border-[#333]" style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--color-border) transparent' }}>
            {options.map((option) => (
              <div
                key={option}
                className={`py-3 px-4 cursor-pointer transition-all duration-150 text-base text-[var(--color-text-primary)] hover:bg-purple-50 hover:text-[#6200EA] dark:text-[#e2e8f0] dark:hover:bg-[rgba(98,0,234,0.2)] dark:hover:text-violet-400 ${value === option ? 'bg-purple-50 text-[#6200EA] font-semibold dark:bg-[rgba(98,0,234,0.2)] dark:text-violet-400' : ''}`}
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
  useBodyScrollLock();

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

  const tabBase = 'flex-1 py-3 px-4 bg-transparent border-none rounded-[10px] text-base font-medium cursor-pointer transition-all duration-300 relative whitespace-nowrap overflow-hidden text-ellipsis max-sm:text-xs max-sm:py-2.5 max-sm:px-2 max-md:min-h-12';
  const tabActive = 'bg-white text-violet-700 font-semibold shadow-[0_2px_4px_rgba(0,0,0,0.1)] scale-[1.02] dark:bg-[#1a1a1a] dark:text-violet-700';
  const tabInactive = 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] dark:text-[#94a3b8] dark:hover:bg-[#3a3a3a]';
  const btnPrimary = 'py-3.5 px-6 bg-gradient-to-br from-violet-700 to-blue-800 text-white border-none rounded-xl text-base font-semibold cursor-pointer transition-all duration-200 shadow-[0_4px_12px_rgba(37,99,235,0.3)] hover:enabled:-translate-y-0.5 hover:enabled:shadow-[0_6px_20px_rgba(37,99,235,0.4)] disabled:opacity-60 disabled:cursor-not-allowed max-md:min-h-[52px] max-md:py-4 max-md:px-6';

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-[4px] flex items-center justify-center z-[9999] p-6 animate-[g-fadeIn_0.2s_ease] max-md:p-0 max-md:items-end" onClick={onClose}>
      <div className="bg-[var(--color-bg)] rounded-[20px] w-full max-w-[700px] max-h-[90vh] flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.3)] border border-[var(--color-border)] animate-[g-fadeInScale_0.3s_ease] overflow-hidden relative z-[10000] dark:bg-[#1a1a1a] dark:border-[#333] max-md:max-w-full max-md:max-h-[100dvh] max-md:h-[100dvh] max-md:rounded-none max-md:animate-[slideUpMobile_0.3s_ease] max-md:pb-[env(safe-area-inset-bottom,0px)] max-md:pt-[env(safe-area-inset-top,0px)]" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-[var(--color-border)] bg-[var(--color-bg)] shrink-0 dark:bg-[#1a1a1a] dark:border-[#333] max-md:p-4 max-md:sticky max-md:top-0 max-md:z-10">
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] m-0 max-md:text-xl max-sm:text-lg"><Wand2 className="w-6 h-6 inline mr-2" /> AI Book Recommender</h2>
          <button 
            className="bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] py-2 px-3.5 rounded-xl text-lg cursor-pointer transition-all duration-200 text-[var(--color-text-secondary)] hover:bg-red-500 hover:text-white hover:border-red-500 hover:scale-105 dark:bg-[#2a2a2a] dark:border-[#333] dark:text-[#94a3b8] max-md:min-w-11 max-md:min-h-11 max-md:text-xl" 
            onClick={onClose}
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 shrink-0 w-full dark:bg-[#2a2a2a] max-sm:gap-0.5 max-sm:p-[3px] max-sm:mb-4">
          <button
            className={`${tabBase} ${activeTab === 'library' ? tabActive : tabInactive}`}
            onClick={() => {
              setActiveTab('library');
              setRecommendations([]);
              setError(null);
            }}
          >
            <Library className="w-4 h-4 inline mr-1" /> Based on My Library
          </button>
          <button
            className={`${tabBase} ${activeTab === 'custom' ? tabActive : tabInactive}`}
            onClick={() => {
              setActiveTab('custom');
              setRecommendations([]);
              setError(null);
            }}
          >
            <Search className="w-4 h-4 inline mr-1" /> Custom Discovery
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto overflow-x-hidden flex-1 min-h-0 max-md:p-4 max-md:pb-10" style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--color-border) transparent' }}>
          
          {/* Library Mode */}
          {activeTab === 'library' && (
            <div className="flex flex-col gap-6">
              <p className="text-base text-[var(--color-text-secondary)] leading-relaxed m-0 p-4 bg-[var(--color-bg-secondary)] rounded-xl border-l-4 border-l-violet-700 dark:bg-[#2a2a2a] max-md:text-sm max-md:p-3.5">
                Gemini will analyze your current reading list to find books matching your taste.
              </p>
              <button
                className={btnPrimary}
                onClick={handleLibraryRecommendation}
                disabled={loading}
              >
                {loading ? 'Analyzing...' : <><Sparkles className="w-4 h-4 inline mr-1" /> Analyze & Recommend</>}
              </button>
            </div>
          )}

          {/* Custom Mode */}
          {activeTab === 'custom' && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-6 max-md:gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[var(--color-text-primary)] mb-2 max-md:text-base">Genre</label>
                  <CustomSelect
                    value={genre}
                    onChange={setGenre}
                    options={genres}
                    placeholder="Select a genre..."
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[var(--color-text-primary)] mb-2 max-md:text-base">Mood/Vibe</label>
                  <CustomSelect
                    value={mood}
                    onChange={setMood}
                    options={moods}
                    placeholder="Select a mood..."
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[var(--color-text-primary)] mb-2 max-md:text-base">Book Length</label>
                  <CustomSelect
                    value={length}
                    onChange={setLength}
                    options={lengths}
                    placeholder="Select length..."
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[var(--color-text-primary)] mb-2 max-md:text-base">Specific Topics (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g., Time travel in the 19th century"
                    value={topics}
                    onChange={(e) => setTopics(e.target.value)}
                    className="py-3 px-4 border-2 border-[var(--color-border)] rounded-xl text-base bg-[var(--color-bg)] text-[var(--color-text-primary)] transition-all duration-200 focus:outline-none focus:border-violet-700 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)] placeholder:text-[var(--color-text-light)] dark:bg-[#1a1a1a] dark:border-[#333] dark:text-[#e2e8f0] max-md:min-h-12 max-md:py-3.5 max-md:px-4"
                  />
                </div>

                <button
                  className={btnPrimary}
                  onClick={handleCustomRecommendation}
                  disabled={loading}
                >
                  {loading ? 'Finding Books...' : <><Target className="w-4 h-4 inline mr-1" /> Find Books</>}
                </button>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-100 border-2 border-red-500 rounded-xl mt-4">
              <p className="m-0 text-red-900 text-sm font-medium">⚠️ {error}</p>
            </div>
          )}

          {/* Recommendations Display */}
          {recommendations.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xl font-bold text-[var(--color-text-primary)] m-0 mb-4"><Sparkles className="w-5 h-5 inline mr-2" />Recommended for You</h3>
              {recommendations.map((book, index) => {
                const bookKey = `${book.title}-${book.author}`;
                const isAdded = addedBooks.has(bookKey);
                
                return (
                  <div key={index} className="flex items-start justify-between gap-4 p-4 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl mb-4 transition-all duration-200 hover:border-violet-700 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] dark:bg-[#2a2a2a] dark:border-[#333] max-md:flex-col max-md:items-stretch max-md:p-5 max-md:gap-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-[var(--color-text-primary)] m-0 mb-1">{book.title}</h4>
                      <p className="text-sm italic text-[var(--color-text-secondary)] m-0 mb-2 max-md:text-base">{book.author}</p>
                      <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed m-0 max-md:text-base">{book.reason}</p>
                    </div>
                    <button
                      className={`rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200 whitespace-nowrap shrink-0 max-md:w-full max-md:min-h-12 max-md:text-base max-md:py-3.5 max-md:px-5 ${
                        isAdded
                          ? 'bg-[var(--color-bg-tertiary)] text-emerald-500 border border-emerald-500 py-2 px-4 cursor-default hover:bg-[var(--color-bg-tertiary)] hover:scale-100 dark:bg-[rgba(16,163,74,0.15)] dark:text-emerald-400 dark:border-emerald-400'
                          : 'bg-emerald-500 text-white border-none py-2 px-4 hover:bg-emerald-600 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-70'
                      }`}
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
            <div className="flex flex-col items-center justify-center py-15 px-5 text-center">
              <div className="w-12 h-12 border-4 border-[var(--color-bg-tertiary)] border-t-violet-700 rounded-full animate-[g-spin_0.8s_linear_infinite] mb-6"></div>
              <p className="text-base text-[var(--color-text-secondary)] m-0">Analyzing your preferences...</p>
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
