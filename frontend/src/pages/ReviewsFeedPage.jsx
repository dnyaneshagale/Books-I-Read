import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import reviewApi from '../api/reviewApi';
import ReviewCard from '../components/social/ReviewCard';
import './ReviewsFeedPage.css';

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

  useEffect(() => {
    fetchReviews();
  }, [activeTab, sortMode]);

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
    <div className="reviews-feed-page">
      <div className="reviews-feed__container">
        {/* Header */}
        <div className="reviews-feed__header">
          <button className="page-back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h1>Reviews</h1>
        </div>

        {/* Tabs + Sort */}
        <div className="reviews-feed__tabs-row">
          <div className="reviews-feed__tabs">
            <button
              className={`reviews-feed__tab ${activeTab === 'following' ? 'active' : ''}`}
              onClick={() => setActiveTab('following')}
            >
              Following
            </button>
            <button
              className={`reviews-feed__tab ${activeTab === 'popular' ? 'active' : ''}`}
              onClick={() => setActiveTab('popular')}
            >
              Popular
            </button>
          </div>
          {activeTab !== 'popular' && (
            <div className="reviews-feed__sort-toggle">
              <button
                className={`reviews-feed__sort-btn ${sortMode === 'relevant' ? 'active' : ''}`}
                onClick={() => setSortMode('relevant')}
                title="Show most relevant first"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                Top
              </button>
              <button
                className={`reviews-feed__sort-btn ${sortMode === 'recent' ? 'active' : ''}`}
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
        <div className="reviews-feed__content">
          {loading ? (
            <div className="reviews-feed__loading">Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <div className="reviews-feed__empty">
              <p>📖</p>
              <h3>No reviews yet</h3>
              <p>
                {activeTab === 'following'
                  ? 'Follow more readers to see their book reviews here.'
                  : 'Be the first to write a review!'}
              </p>
              <button
                className="reviews-feed__discover-btn"
                onClick={() => navigate('/discover')}
              >
                Discover Readers
              </button>
            </div>
          ) : (
            reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                currentUserId={user?.id}
                onUpdate={fetchReviews}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewsFeedPage;
