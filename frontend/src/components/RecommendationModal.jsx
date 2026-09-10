import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axiosClient from '../api/axiosClient';

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
        className="w-full py-3 px-4 bg-white dark:bg-[var(--color-bg-dark,#1a1a1a)] border-2 border-border dark:border-[var(--color-border-dark,#333)] rounded-md text-base text-txt-primary dark:text-[var(--color-text-primary-dark,#e2e8f0)] cursor-pointer flex items-center justify-between transition-all duration-200 text-left hover:border-primary focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)] max-md:min-h-[48px] max-md:py-3.5 max-md:px-4"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={!value ? 'text-txt-light' : ''}>{displayValue}</span>
        <svg className={`transition-transform duration-200 text-txt-secondary flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[999]" onClick={() => setIsOpen(false)} />
          <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white dark:bg-[var(--color-bg-dark,#1a1a1a)] border border-border dark:border-[var(--color-border-dark,#333)] rounded-md shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] max-h-[200px] overflow-y-auto z-[1000] animate-[slideDownFade_0.2s_ease]">
            {options.map((option) => (
              <div
                key={option}
                className={`py-3 px-4 cursor-pointer transition-all duration-150 text-base text-txt-primary dark:text-[var(--color-text-primary-dark,#e2e8f0)] hover:bg-[#F3E8FF] dark:hover:bg-[rgba(98,0,234,0.2)] hover:text-[#6200EA] dark:hover:text-violet-400 ${value === option ? 'bg-[#F3E8FF] dark:bg-[rgba(98,0,234,0.2)] text-[#6200EA] dark:text-violet-400 font-semibold' : ''}`}
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
 */
function RecommendationModal({ onClose, userBooks, onAddToWishlist }) {
  const [activeTab, setActiveTab] = useState('library');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState(null);
  const [addedBooks, setAddedBooks] = useState(new Set());

  const [genre, setGenre] = useState('');
  const [mood, setMood] = useState('');
  const [length, setLength] = useState('');
  const [topics, setTopics] = useState('');

  const genres = ['Fiction', 'Non-Fiction', 'Sci-Fi', 'Fantasy', 'Mystery', 'Thriller', 'Romance', 'History', 'Biography', 'Self-Help', 'Business', 'Philosophy', 'Science', 'Poetry', 'Horror', 'Adventure'];
  const moods = ['Uplifting', 'Dark', 'Educational', 'Fast-paced', 'Thought-provoking', 'Light-hearted', 'Emotional', 'Inspiring', 'Suspenseful', 'Relaxing'];
  const lengths = ['Short (< 200 pages)', 'Medium (200-400 pages)', 'Long (400-500 pages)', 'Epic (> 500 pages)'];

  const handleLibraryRecommendation = async () => {
    setLoading(true); setError(null); setRecommendations([]);
    try {
      const relevantBooks = userBooks.filter(book => book.status === 'FINISHED' || book.status === 'READING');
      if (relevantBooks.length === 0) { setError('You need at least one book marked as "Reading" or "Finished" to get library-based recommendations.'); setLoading(false); return; }
      const bookList = relevantBooks.map(book => `"${book.title}" by ${book.author}`).join(', ');
      const response = await axiosClient.post('/ai/recommendations/library', { books: bookList });
      setRecommendations(response.data.recommendations || []);
    } catch (err) { setError(err.response?.data?.message || err.message || 'Failed to generate recommendations.'); }
    finally { setLoading(false); }
  };

  const handleCustomRecommendation = async () => {
    if (!genre && !mood && !length && !topics) { setError('Please select at least one preference.'); return; }
    setLoading(true); setError(null); setRecommendations([]);
    try {
      const response = await axiosClient.post('/ai/recommendations/custom', { genre: genre || null, mood: mood || null, length: length || null, topics: topics || null });
      setRecommendations(response.data.recommendations || []);
    } catch (err) { setError(err.response?.data?.message || err.message || 'Failed to generate recommendations.'); }
    finally { setLoading(false); }
  };

  const handleAddBook = (book) => {
    const bookKey = `${book.title}-${book.author}`;
    if (addedBooks.has(bookKey)) return;
    onAddToWishlist(book);
    setAddedBooks(prev => new Set([...prev, bookKey]));
  };

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = originalOverflow || 'unset'; };
  }, []);

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-lg max-mobile:p-0 max-md:p-0 max-md:items-end animate-fade-in" onClick={onClose}>
      <div className="bg-bg dark:bg-[var(--color-bg-dark,#1a1a1a)] rounded-xl w-full max-w-[700px] max-h-[90vh] flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.3)] border border-border dark:border-[var(--color-border-dark,#333)] animate-slide-up overflow-hidden relative z-[10000] max-mobile:w-[95%] max-mobile:m-auto max-mobile:rounded-lg max-md:max-w-full max-md:max-h-screen max-md:h-screen max-md:rounded-none" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between p-6 max-mobile:p-4 max-md:p-4 border-b-2 border-border dark:border-[var(--color-border-dark,#333)] bg-bg dark:bg-[var(--color-bg-dark,#1a1a1a)] flex-shrink-0 max-md:sticky max-md:top-0 max-md:z-10">
          <h2 className="text-2xl max-mobile:text-lg max-md:text-xl font-bold text-txt-primary m-0">🪄 AI Book Recommender</h2>
          <button className="bg-bg-tertiary dark:bg-[var(--color-bg-tertiary-dark,#2a2a2a)] border border-border dark:border-[var(--color-border-dark,#333)] py-2 px-3.5 rounded-md text-lg cursor-pointer transition-all duration-200 text-txt-secondary dark:text-[var(--color-text-secondary-dark,#94a3b8)] hover:bg-danger hover:text-white hover:border-danger hover:scale-105 max-md:min-w-[44px] max-md:min-h-[44px] max-md:text-xl" onClick={onClose} title="Close">✕</button>
        </div>

        {/* Content Area */}
        <div className="p-6 max-mobile:p-4 max-md:p-4 max-md:pb-10 overflow-y-auto flex-1 min-h-0 [scrollbar-width:thin] [scrollbar-color:var(--color-border)_transparent] [-webkit-overflow-scrolling:touch]">

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 dark:bg-[var(--color-bg-secondary-dark,#2a2a2a)] p-1 rounded-xl mb-lg w-full flex-shrink-0 max-mobile:gap-0.5 max-mobile:p-[3px] max-mobile:mb-md">
            <button
              className={`flex-1 py-3 px-4 bg-transparent border-none rounded-[10px] text-base max-mobile:text-xs max-md:text-base font-medium cursor-pointer transition-all duration-300 whitespace-nowrap overflow-hidden text-ellipsis max-md:min-h-[48px] ${activeTab === 'library' ? 'bg-white dark:bg-[var(--color-bg-dark,#1a1a1a)] text-primary font-semibold shadow-[0_2px_4px_rgba(0,0,0,0.1)] scale-[1.02]' : 'text-txt-secondary dark:text-[var(--color-text-secondary-dark,#94a3b8)] hover:text-txt-primary'}`}
              onClick={() => { setActiveTab('library'); setRecommendations([]); setError(null); }}
            >
              📚 Based on My Library
            </button>
            <button
              className={`flex-1 py-3 px-4 bg-transparent border-none rounded-[10px] text-base max-mobile:text-xs max-md:text-base font-medium cursor-pointer transition-all duration-300 whitespace-nowrap overflow-hidden text-ellipsis max-md:min-h-[48px] ${activeTab === 'custom' ? 'bg-white dark:bg-[var(--color-bg-dark,#1a1a1a)] text-primary font-semibold shadow-[0_2px_4px_rgba(0,0,0,0.1)] scale-[1.02]' : 'text-txt-secondary dark:text-[var(--color-text-secondary-dark,#94a3b8)] hover:text-txt-primary'}`}
              onClick={() => { setActiveTab('custom'); setRecommendations([]); setError(null); }}
            >
              🔍 Custom Discovery
            </button>
          </div>

          {/* Library Mode */}
          {activeTab === 'library' && (
            <div className="flex flex-col gap-lg min-h-min">
              <p className="text-base max-md:text-sm text-txt-secondary leading-[1.6] m-0 p-4 max-md:p-3.5 bg-bg-secondary dark:bg-[var(--color-bg-secondary-dark,#2a2a2a)] rounded-md border-l-4 border-l-primary">
                Gemini will analyze your current reading list to find books matching your taste.
              </p>
              <button className="py-3.5 px-6 max-md:min-h-[52px] max-md:py-4 max-md:px-6 bg-gradient-to-br from-primary to-blue-800 text-white border-none rounded-md text-base font-semibold cursor-pointer transition-all duration-200 shadow-[0_4px_12px_rgba(37,99,235,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(37,99,235,0.4)] disabled:opacity-60 disabled:cursor-not-allowed" onClick={handleLibraryRecommendation} disabled={loading}>
                {loading ? 'Analyzing...' : '🔮 Analyze & Recommend'}
              </button>
            </div>
          )}

          {/* Custom Mode */}
          {activeTab === 'custom' && (
            <div className="flex flex-col gap-lg min-h-min">
              <div className="flex flex-col gap-lg max-md:gap-md">
                <div className="flex flex-col gap-2">
                  <label className="text-sm max-md:text-base font-medium text-txt-primary mb-2">Genre</label>
                  <CustomSelect value={genre} onChange={setGenre} options={genres} placeholder="Select a genre..." />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm max-md:text-base font-medium text-txt-primary mb-2">Mood/Vibe</label>
                  <CustomSelect value={mood} onChange={setMood} options={moods} placeholder="Select a mood..." />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm max-md:text-base font-medium text-txt-primary mb-2">Book Length</label>
                  <CustomSelect value={length} onChange={setLength} options={lengths} placeholder="Select length..." />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm max-md:text-base font-medium text-txt-primary mb-2">Specific Topics (Optional)</label>
                  <input type="text" placeholder="e.g., Time travel in the 19th century" value={topics} onChange={(e) => setTopics(e.target.value)} className="py-3 px-4 border-2 border-border dark:border-[var(--color-border-dark,#333)] rounded-md text-base bg-bg dark:bg-[var(--color-bg-dark,#1a1a1a)] text-txt-primary dark:text-[var(--color-text-primary-dark,#e2e8f0)] transition-all duration-200 focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)] placeholder:text-txt-light max-md:min-h-[48px] max-md:py-3.5 max-md:px-4" />
                </div>
                <button className="py-3.5 px-6 max-md:min-h-[52px] max-md:py-4 max-md:px-6 bg-gradient-to-br from-primary to-blue-800 text-white border-none rounded-md text-base font-semibold cursor-pointer transition-all duration-200 shadow-[0_4px_12px_rgba(37,99,235,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(37,99,235,0.4)] disabled:opacity-60 disabled:cursor-not-allowed" onClick={handleCustomRecommendation} disabled={loading}>
                  {loading ? 'Finding Books...' : '🎯 Find Books'}
                </button>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-100 border-2 border-red-500 rounded-md mt-md">
              <p className="m-0 text-red-900 text-sm font-medium">⚠️ {error}</p>
            </div>
          )}

          {/* Recommendations Display */}
          {recommendations.length > 0 && (
            <div className="mt-lg">
              <h3 className="text-xl font-bold text-txt-primary m-0 mb-md">✨ Recommended for You</h3>
              {recommendations.map((book, index) => {
                const bookKey = `${book.title}-${book.author}`;
                const isAdded = addedBooks.has(bookKey);
                return (
                  <div key={index} className="flex items-start justify-between gap-md p-4 bg-bg-secondary dark:bg-[var(--color-bg-secondary-dark,#2a2a2a)] border border-border dark:border-[var(--color-border-dark,#333)] rounded-md mb-md transition-all duration-200 hover:border-primary hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] max-md:flex-col max-md:items-stretch max-md:p-5 max-md:gap-4">
                    <div className="flex-1">
                      <h4 className="text-lg max-md:text-lg font-bold text-txt-primary m-0 mb-1">{book.title}</h4>
                      <p className="text-sm max-md:text-base italic text-txt-secondary m-0 mb-2">{book.author}</p>
                      <p className="text-sm max-md:text-base text-txt-secondary leading-[1.5] m-0">{book.reason}</p>
                    </div>
                    <button
                      className={`border-none rounded-md py-2 px-4 text-sm font-semibold cursor-pointer transition-all duration-200 whitespace-nowrap flex-shrink-0 max-md:w-full max-md:min-h-[48px] max-md:py-3.5 max-md:px-5 ${isAdded ? 'bg-bg-tertiary dark:bg-[rgba(16,163,74,0.15)] text-success dark:text-emerald-400 cursor-default border border-success dark:border-emerald-400' : 'bg-success text-white hover:bg-emerald-600 hover:scale-105'}`}
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
            <div className="flex flex-col items-center justify-center py-[60px] px-5 text-center">
              <div className="w-12 h-12 border-4 border-bg-tertiary border-t-primary rounded-full animate-spin-slow mb-lg"></div>
              <p className="text-base text-txt-secondary m-0">Analyzing your preferences...</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.getElementById('modal-root'));
}

export default RecommendationModal;
