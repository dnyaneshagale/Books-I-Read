import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import reviewApi from '../api/reviewApi';
import ReviewCard from '../components/social/ReviewCard';

/**
 * ReviewsFeedPage - Shows reviews from people you follow + popular reviews
 * Supports relevance-based ranking (Instagram/LinkedIn style)
 */
const ReviewsFeedPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('following');
  const [sortMode, setSortMode] = useState('relevant');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!isSearching) {
      fetchReviews();
    }
  }, [activeTab, sortMode]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!searchQuery.trim()) {
      if (isSearching) {
        setIsSearching(false);
        fetchReviews();
      }
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      setLoading(true);
      try {
        const res = await reviewApi.searchReviews(searchQuery.trim(), 0, 20);
        setReviews(res.data.content || []);
      } catch {
        setReviews([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(debounceRef.current);
  }, [searchQuery]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const sort = activeTab === 'popular' ? 'relevant' : sortMode;
      const res = await reviewApi.getFollowingReviews(0, 20, sort);
      setReviews(res.data.content || []);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-secondary dark:bg-bg py-6 px-4 pb-24">
      <div className="max-w-[680px] lg:max-w-[740px] mx-auto animate-fade-in-up">
        {/* Header */}
        <div className="mb-5">
          <button className="page-back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h1 className="m-0 text-2xl font-bold text-txt-primary dark:text-[#E2D9F3] tracking-tight">Reviews</h1>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-2.5 bg-bg dark:bg-[#1a1625] border border-border dark:border-[#2D2640] rounded-2xl py-2.5 px-4 mb-4 transition-all duration-200 focus-within:border-primary dark:focus-within:border-[#A78BFA] focus-within:shadow-[0_0_0_3px_rgba(109,40,217,0.1)] dark:focus-within:shadow-[0_0_0_3px_rgba(167,139,250,0.15)]">
          <svg className="w-[18px] h-[18px] text-txt-secondary dark:text-[#9E95A8] flex-shrink-0" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
          <input
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-sm text-txt-primary dark:text-[#E2D9F3] font-[inherit] placeholder:text-txt-secondary dark:placeholder:text-[#6b6580]"
            placeholder="Search reviews by book, author, content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="bg-bg-secondary dark:bg-[#2D2640] border-none rounded-full w-6 h-6 flex items-center justify-center text-txt-secondary dark:text-[#9E95A8] cursor-pointer text-xs hover:bg-border dark:hover:bg-[#3b3670]" onClick={() => setSearchQuery('')}>✕</button>
          )}
        </div>

        {/* Tabs + Sort */}
        <div className="flex items-center justify-between gap-3 mb-5 max-[600px]:flex-col max-[600px]:items-stretch">
          <div className="flex gap-1 bg-bg dark:bg-[#1E1B24] border border-border dark:border-[#2D2A35] rounded-2xl p-1 shadow-xs">
            <button
              className={`flex-1 py-2.5 px-4 border-none bg-none rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200 ${activeTab === 'following' ? 'bg-primary dark:bg-[#7C4DFF] text-white shadow-sm' : 'text-txt-secondary dark:text-[#9E95A8] hover:text-txt-primary dark:hover:text-[#E2D9F3] hover:bg-bg-secondary dark:hover:bg-[#2D2A35]'}`}
              onClick={() => setActiveTab('following')}
            >
              Following
            </button>
            <button
              className={`flex-1 py-2.5 px-4 border-none bg-none rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200 ${activeTab === 'popular' ? 'bg-primary dark:bg-[#7C4DFF] text-white shadow-sm' : 'text-txt-secondary dark:text-[#9E95A8] hover:text-txt-primary dark:hover:text-[#E2D9F3] hover:bg-bg-secondary dark:hover:bg-[#2D2A35]'}`}
              onClick={() => setActiveTab('popular')}
            >
              Popular
            </button>
          </div>
          {activeTab !== 'popular' && (
            <div className="flex gap-1 bg-bg dark:bg-[#1E1B24] border border-border dark:border-[#2D2A35] rounded-xl p-[3px] shadow-xs max-[600px]:self-end">
              <button
                className={`flex items-center gap-1 py-1.5 px-2.5 border-none bg-none rounded-lg text-xs font-semibold cursor-pointer transition-all duration-200 ${sortMode === 'relevant' ? 'bg-primary/10 dark:bg-[rgba(124,77,255,0.15)] text-primary dark:text-[#7C4DFF]' : 'text-txt-secondary dark:text-[#9E95A8] hover:bg-bg-secondary dark:hover:bg-[#2D2A35]'}`}
                onClick={() => setSortMode('relevant')}
                title="Show most relevant first"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
                Top
              </button>
              <button
                className={`flex items-center gap-1 py-1.5 px-2.5 border-none bg-none rounded-lg text-xs font-semibold cursor-pointer transition-all duration-200 ${sortMode === 'recent' ? 'bg-primary/10 dark:bg-[rgba(124,77,255,0.15)] text-primary dark:text-[#7C4DFF]' : 'text-txt-secondary dark:text-[#9E95A8] hover:bg-bg-secondary dark:hover:bg-[#2D2A35]'}`}
                onClick={() => setSortMode('recent')}
                title="Show newest first"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" /></svg>
                New
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div>
          {loading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton-card" style={{ animationDelay: `${(i - 1) * 80}ms` }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
                    <div className="skeleton skeleton-avatar" />
                    <div style={{ flex: 1 }}>
                      <div className="skeleton skeleton-text skeleton-text--md" />
                      <div className="skeleton skeleton-text skeleton-text--sm" style={{ marginBottom: 0 }} />
                    </div>
                  </div>
                  <div className="skeleton skeleton-text skeleton-text--full" />
                  <div className="skeleton skeleton-text skeleton-text--lg" />
                  <div className="skeleton skeleton-text skeleton-text--sm" style={{ marginBottom: 16 }} />
                  <div style={{ display: 'flex', gap: 12 }}>
                    <div className="skeleton" style={{ width: 80, height: 24, borderRadius: 12 }} />
                    <div className="skeleton" style={{ width: 60, height: 24, borderRadius: 12 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-[72px] px-8 bg-bg-secondary dark:bg-[#1E1B24] border border-border dark:border-[#2D2A35] rounded-2xl">
              <p className="text-[3rem] m-0 mb-4">📖</p>
              <h3 className="m-0 mb-2 text-lg font-bold text-txt-primary dark:text-[#E2D9F3]">{isSearching ? 'No reviews found' : 'No reviews yet'}</h3>
              <p className="text-sm text-txt-secondary dark:text-[#9E95A8] m-0">
                {isSearching
                  ? `No results for "${searchQuery}". Try a different search.`
                  : activeTab === 'following'
                    ? 'Follow more readers to see their book reviews here.'
                    : 'Be the first to write a review!'}
              </p>
              {!isSearching && (
                <button
                  className="mt-5 py-2.5 px-7 rounded-full border-none bg-gradient-to-br from-primary to-[#7c3aed] to-[#2563eb] text-white text-sm font-bold cursor-pointer shadow-[0_4px_14px_rgba(109,40,217,0.3)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(109,40,217,0.4)]"
                  onClick={() => navigate('/discover')}
                >
                  Discover Readers
                </button>
              )}
            </div>
          ) : (
            <div className="stagger-children" key={activeTab + sortMode}>
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  currentUserId={user?.id}
                  onUpdate={fetchReviews}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewsFeedPage;
