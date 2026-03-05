import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { useAuth } from '../AuthContext';
import reviewApi from '../api/reviewApi';
import ReviewCard from '../components/social/ReviewCard';
import toast from 'react-hot-toast';

/**
 * ReviewsFeedPage - Shows reviews from people you follow + popular reviews
 * Supports relevance-based ranking (Instagram/LinkedIn style)
 */
const ReviewsFeedPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('following');
  const [sortMode, setSortMode] = useState('relevant'); // 'relevant' | 'recent'
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!isSearching) {
      fetchReviews();
    }
  }, [activeTab, sortMode]);

  // Real-time debounced search
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

  // Optimistic update for likes - no page reload
  const handleUpdateReview = (reviewId, updates) => {
    setReviews(prev =>
      prev.map(r => r.id === reviewId ? { ...r, ...updates } : r)
    );
  };

  return (
    <div className="reviews-feed-page min-h-screen bg-gradient-to-br from-[var(--color-bg-secondary,#f8fafc)] to-[var(--color-bg-tertiary,#f1f5f9)] py-6 px-4 transition-[background] duration-300 dark:from-[var(--color-bg-secondary,#1E1B24)] dark:to-[var(--color-bg,#0F0C15)]">
      <div className="max-w-[680px] mx-auto animate-[g-fadeInUp_0.5s_cubic-bezier(0.16,1,0.3,1)_both] lg:max-w-[740px]">
        {/* Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <button className="page-back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h1 className="m-0 text-2xl font-[var(--font-weight-bold,700)] text-[var(--color-text-primary,#0f172a)] tracking-[-0.01em] dark:text-[var(--color-text-primary,#E2D9F3)]">Reviews</h1>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-2.5 bg-[var(--color-bg,#fff)] border border-[var(--color-border,#e2e8f0)] rounded-[var(--radius-lg,16px)] py-2.5 px-4 mb-4 shadow-[var(--shadow-xs,0_1px_2px_rgba(0,0,0,0.04))] transition-all duration-200 focus-within:border-[var(--color-primary,#7C3AED)] focus-within:shadow-[0_0_0_3px_rgba(124,58,237,0.1)] dark:bg-[var(--color-bg,#1a1625)] dark:border-[var(--color-border,#2D2640)] dark:focus-within:border-[var(--color-primary,#A78BFA)] dark:focus-within:shadow-[0_0_0_3px_rgba(167,139,250,0.15)]">
          <svg className="text-[var(--color-text-tertiary,#94a3b8)] shrink-0" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input
            type="text"
            className="flex-1 border-none outline-none bg-transparent text-[0.95rem] text-[var(--color-text-primary,#0f172a)] font-[inherit] placeholder:text-[var(--color-text-tertiary,#94a3b8)] dark:text-[var(--color-text-primary,#E2D9F3)]"
            placeholder="Search reviews by book, author, content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="bg-transparent border-none cursor-pointer text-[var(--color-text-tertiary,#94a3b8)] text-base py-0.5 px-1.5 rounded-full transition-all duration-150 hover:bg-[var(--color-bg-secondary,#f1f5f9)] hover:text-[var(--color-text-primary,#0f172a)] dark:hover:bg-[var(--color-bg-secondary,#2D2640)] dark:hover:text-[var(--color-text-primary,#E2D9F3)]" onClick={() => setSearchQuery('')}>✕</button>
          )}
        </div>

        {/* Tabs + Sort */}
        <div className="flex items-center gap-3 mb-5 max-[640px]:flex-col max-[640px]:items-stretch">
          <div className="flex gap-1 flex-1 bg-white border border-slate-200 rounded-2xl p-1 shadow-sm dark:bg-[#1E1B24] dark:border-[#2D2A35] max-[640px]:w-full">
            <button
              className={`flex-1 py-2.5 px-4 border-none bg-transparent rounded-xl text-sm font-semibold cursor-pointer transition-all duration-[250ms] max-[640px]:text-xs max-[640px]:py-2 max-[640px]:px-2 ${activeTab === 'following' ? 'bg-gradient-to-br from-violet-700 via-violet-600 to-blue-600 text-white shadow-[0_2px_8px_rgba(109,40,217,0.25)] dark:from-[#7C4DFF] dark:to-[#9575FF] dark:shadow-[0_2px_8px_rgba(124,77,255,0.3)]' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-[#9E95A8] dark:hover:text-[#E2D9F3] dark:hover:bg-[#2D2A35]'}`}
              onClick={() => setActiveTab('following')}
            >
              Following
            </button>
            <button
              className={`flex-1 py-2.5 px-4 border-none bg-transparent rounded-xl text-sm font-semibold cursor-pointer transition-all duration-[250ms] max-[640px]:text-xs max-[640px]:py-2 max-[640px]:px-2 ${activeTab === 'popular' ? 'bg-gradient-to-br from-violet-700 via-violet-600 to-blue-600 text-white shadow-[0_2px_8px_rgba(109,40,217,0.25)] dark:from-[#7C4DFF] dark:to-[#9575FF] dark:shadow-[0_2px_8px_rgba(124,77,255,0.3)]' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-[#9E95A8] dark:hover:text-[#E2D9F3] dark:hover:bg-[#2D2A35]'}`}
              onClick={() => setActiveTab('popular')}
            >
              Popular
            </button>
          </div>
          {activeTab !== 'popular' && (
            <div className="flex gap-0.5 bg-white border border-slate-200 rounded-xl p-[3px] shadow-sm dark:bg-[#1E1B24] dark:border-[#2D2A35] max-[640px]:w-full">
              <button
                className={`flex items-center justify-center gap-1 py-1.5 px-2.5 border-none bg-transparent rounded-lg text-xs font-semibold cursor-pointer transition-all duration-200 whitespace-nowrap max-[640px]:flex-1 max-[640px]:px-2 ${sortMode === 'relevant' ? 'bg-violet-100 text-violet-700 dark:bg-[rgba(124,77,255,0.18)] dark:text-[#9575FF]' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-[#9E95A8] dark:hover:text-[#E2D9F3] dark:hover:bg-[#2D2A35]'}`}
                onClick={() => setSortMode('relevant')}
                title="Show most relevant first"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                Top
              </button>
              <button
                className={`flex items-center justify-center gap-1 py-1.5 px-2.5 border-none bg-transparent rounded-lg text-xs font-semibold cursor-pointer transition-all duration-200 whitespace-nowrap max-[640px]:flex-1 max-[640px]:px-2 ${sortMode === 'recent' ? 'bg-violet-100 text-violet-700 dark:bg-[rgba(124,77,255,0.18)] dark:text-[#9575FF]' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-[#9E95A8] dark:hover:text-[#E2D9F3] dark:hover:bg-[#2D2A35]'}`}
                onClick={() => setSortMode('recent')}
                title="Show newest first"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
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
                <div key={i} className={`skeleton-card animate-[g-fadeIn_0.4s_ease_both] ${i === 2 ? '[animation-delay:80ms]' : i === 3 ? '[animation-delay:160ms]' : ''}`}>
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
            <div className="text-center py-[72px] px-8 bg-[var(--color-bg,#fff)] rounded-[var(--radius-lg,16px)] border border-[var(--color-border,#e2e8f0)] shadow-[var(--shadow-sm,0_1px_2px_rgba(0,0,0,0.06))] animate-[g-fadeInUp_0.4s_cubic-bezier(0.16,1,0.3,1)_both] dark:bg-[var(--color-bg-secondary,#1E1B24)] dark:border-[var(--color-border,#2D2A35)]">
              <p className="text-5xl m-0 mb-3"><BookOpen className="w-14 h-14 mx-auto" /></p>
              <h3 className="m-0 mb-2 text-[var(--color-text-primary,#0f172a)] text-[var(--font-size-lg,18px)] font-[var(--font-weight-bold,700)] dark:text-[var(--color-text-primary,#E2D9F3)]">{isSearching ? 'No reviews found' : 'No reviews yet'}</h3>
              <p className="text-[var(--font-size-sm,14px)] text-[var(--color-text-secondary,#475569)] dark:text-[var(--color-text-secondary,#9E95A8)]">
                {isSearching
                  ? `No results for "${searchQuery}". Try a different search.`
                  : activeTab === 'following'
                  ? 'Follow more readers to see their book reviews here.'
                  : 'Be the first to write a review!'}
              </p>
              {!isSearching && (
                <button
                  className="mt-5 py-2.5 px-7 rounded-full border-none bg-gradient-to-br from-violet-700 via-violet-600 to-blue-600 text-white text-[var(--font-size-sm,14px)] font-bold cursor-pointer shadow-[0_4px_14px_rgba(109,40,217,0.3)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(109,40,217,0.4)]"
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
                onUpdate={(updates) => handleUpdateReview(review.id, updates)}
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
