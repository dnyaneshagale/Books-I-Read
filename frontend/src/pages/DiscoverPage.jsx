import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import socialApi from '../api/socialApi';
import UserCard from '../components/social/UserCard';
import FollowButton from '../components/social/FollowButton';
import toast from 'react-hot-toast';
import './DiscoverPage.css';

/**
 * DiscoverPage - Discover and search for users to follow
 * LinkedIn/Instagram-style instant search with live suggestions
 */
const DiscoverPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [similarUsers, setSimilarUsers] = useState([]);
  const [discoverUsers, setDiscoverUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('recentSearches') || '[]');
    } catch { return []; }
  });

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceTimer = useRef(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        inputRef.current && !inputRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [suggestionsRes, discoverRes] = await Promise.all([
        socialApi.getSuggestedUsers(0, 10),
        socialApi.discoverUsers(0, 20),
      ]);
      setSuggestedUsers(suggestionsRes.data.content || []);
      setDiscoverUsers(discoverRes.data.content || []);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }

    // Load similar users independently so it doesn't block the page
    try {
      const similarRes = await socialApi.getSimilarUsers(0, 10);
      setSimilarUsers(similarRes.data.content || []);
    } catch (error) {
      console.error('Failed to load similar users:', error);
      // Silently fail — section just won't show
    }
  };

  // Debounced live search
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setHighlightIndex(-1);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (!value.trim()) {
      setSuggestions([]);
      setShowDropdown(value.length === 0 && recentSearches.length > 0);
      return;
    }

    setShowDropdown(true);
    setSearching(true);

    debounceTimer.current = setTimeout(async () => {
      try {
        const response = await socialApi.searchUsers(value.trim(), 0, 8);
        setSuggestions(response.data.content || []);
      } catch (error) {
        console.error('Search failed:', error);
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 250);
  };

  const handleInputFocus = () => {
    if (searchQuery.trim()) {
      setShowDropdown(true);
    } else if (recentSearches.length > 0) {
      setShowDropdown(true);
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!showDropdown) return;

    const items = searchQuery.trim() ? suggestions : recentSearches;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightIndex >= 0 && highlightIndex < items.length) {
        const user = items[highlightIndex];
        navigateToUser(user);
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      inputRef.current?.blur();
    }
  };

  const navigateToUser = (user) => {
    // Save to recent searches
    saveRecentSearch(user);
    setShowDropdown(false);
    setSearchQuery('');
    navigate(`/profile/${user.username}`);
  };

  const saveRecentSearch = (user) => {
    const updated = [user, ...recentSearches.filter((u) => u.id !== user.id)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const removeRecentSearch = (e, userId) => {
    e.stopPropagation();
    const updated = recentSearches.filter((u) => u.id !== userId);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
    if (updated.length === 0) setShowDropdown(false);
  };

  const clearAllRecent = (e) => {
    e.stopPropagation();
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
    setShowDropdown(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const handleFollowChange = (userId, status) => {
    const updateUser = (users) =>
      users.map((user) =>
        user.id === userId
          ? { ...user, isFollowing: status.isFollowing, hasPendingRequest: status.hasPendingRequest }
          : user
      );
    setSuggestedUsers(updateUser);
    setSimilarUsers(updateUser);
    setDiscoverUsers(updateUser);
  };

  // Get initials for avatar
  const getInitials = (user) => {
    const name = user.displayName || user.username;
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="discover-page">
      <div className="discover-page__container">
        {/* Back Button */}
        <button className="page-back-btn" onClick={() => navigate(-1)}>← Back</button>

        {/* Search Section — LinkedIn/Instagram style */}
        <header className="discover-header">
          <h1>Discover Readers</h1>
          <p>Find and follow other book lovers</p>

          <div className="discover-search-container">
            <div className="discover-search-box">
              <svg
                className="discover-search-box__icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>

              <input
                ref={inputRef}
                type="text"
                placeholder="Search people..."
                value={searchQuery}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onKeyDown={handleKeyDown}
                autoComplete="off"
              />

              {searchQuery && (
                <button
                  type="button"
                  className="discover-search-box__clear"
                  onClick={clearSearch}
                >
                  ✕
                </button>
              )}

              {searching && (
                <div className="discover-search-box__spinner" />
              )}
            </div>

            {/* Live Search Dropdown */}
            {showDropdown && (
              <div className="discover-dropdown" ref={dropdownRef}>
                {/* Show recent searches when input is empty */}
                {!searchQuery.trim() && recentSearches.length > 0 && (
                  <>
                    <div className="discover-dropdown__header">
                      <span>Recent</span>
                      <button onClick={clearAllRecent}>Clear all</button>
                    </div>
                    {recentSearches.map((user, index) => (
                      <div
                        key={user.id}
                        className={`discover-dropdown__item ${highlightIndex === index ? 'discover-dropdown__item--active' : ''}`}
                        onClick={() => navigateToUser(user)}
                        onMouseEnter={() => setHighlightIndex(index)}
                      >
                        <div className="discover-dropdown__avatar">
                          {user.profilePictureUrl ? (
                            <img src={user.profilePictureUrl} alt="" />
                          ) : (
                            <div className="discover-dropdown__avatar-fallback">
                              {getInitials(user)}
                            </div>
                          )}
                        </div>
                        <div className="discover-dropdown__info">
                          <span className="discover-dropdown__name">
                            {user.displayName || user.username}
                          </span>
                          <span className="discover-dropdown__username">
                            @{user.username}
                          </span>
                        </div>
                        <button
                          className="discover-dropdown__remove"
                          onClick={(e) => removeRecentSearch(e, user.id)}
                          title="Remove"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </>
                )}

                {/* Live search results */}
                {searchQuery.trim() && !searching && suggestions.length > 0 && (
                  <>
                    {suggestions.map((user, index) => (
                      <div
                        key={user.id}
                        className={`discover-dropdown__item ${highlightIndex === index ? 'discover-dropdown__item--active' : ''}`}
                        onClick={() => navigateToUser(user)}
                        onMouseEnter={() => setHighlightIndex(index)}
                      >
                        <div className="discover-dropdown__avatar">
                          {user.profilePictureUrl ? (
                            <img src={user.profilePictureUrl} alt="" />
                          ) : (
                            <div className="discover-dropdown__avatar-fallback">
                              {getInitials(user)}
                            </div>
                          )}
                        </div>
                        <div className="discover-dropdown__info">
                          <span className="discover-dropdown__name">
                            {user.displayName || user.username}
                          </span>
                          <span className="discover-dropdown__username">
                            @{user.username}
                            {user.bio && (
                              <span className="discover-dropdown__bio"> · {user.bio}</span>
                            )}
                          </span>
                        </div>
                        <div className="discover-dropdown__meta">
                          {user.followersCount > 0 && (
                            <span className="discover-dropdown__followers">
                              {user.followersCount} follower{user.followersCount !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {/* Searching indicator */}
                {searchQuery.trim() && searching && (
                  <div className="discover-dropdown__status">
                    <div className="discover-dropdown__status-spinner" />
                    <span>Searching...</span>
                  </div>
                )}

                {/* No results */}
                {searchQuery.trim() && !searching && suggestions.length === 0 && (
                  <div className="discover-dropdown__status">
                    <span className="discover-dropdown__status-icon">🔍</span>
                    <span>No results for "<strong>{searchQuery}</strong>"</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Discover Content */}
        <div className="discover-content">
          {loading ? (
            <div className="discover-page__loading">
              <div className="discover-loading-spinner" />
              <span>Finding readers for you...</span>
            </div>
          ) : (
          <>
          {/* Suggested Users */}
          {suggestedUsers.length > 0 && (
            <section className="discover-section">
              <h2>Suggested for You</h2>
              <p className="discover-section__subtitle">
                People you might want to follow
              </p>
              <div className="user-card-list">
                {suggestedUsers.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    onFollowChange={handleFollowChange}
                  />
                ))}
              </div>
            </section>
          )}

          {/* People with Similar Interests */}
          {similarUsers.length > 0 && (
            <section className="discover-section discover-similar-section">
              <h2>People with Similar Interests</h2>
              <p className="discover-section__subtitle">
                Readers who share your taste in books
              </p>
              <div className="similar-users-list">
                {similarUsers.map((user) => (
                  <div key={user.id} className="similar-user-card" onClick={() => navigate(`/profile/${user.username}`)}>
                    <div className="similar-user-card__left">
                      <div className="similar-user-card__avatar">
                        {user.profilePictureUrl ? (
                          <img src={user.profilePictureUrl} alt={user.username} />
                        ) : (
                          <div className="similar-user-card__avatar-fallback">
                            {(user.displayName || user.username).charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="similar-user-card__info">
                        <span className="similar-user-card__name">{user.displayName || user.username}</span>
                        <span className="similar-user-card__username">@{user.username}</span>
                        {/* Shared interests badges */}
                        <div className="similar-user-card__tags">
                          {user.sharedGenres?.map((genre) => (
                            <span key={genre} className="similar-tag similar-tag--genre">{genre}</span>
                          ))}
                          {user.sharedAuthors?.slice(0, 2).map((author) => (
                            <span key={author} className="similar-tag similar-tag--author">{author}</span>
                          ))}
                          {user.commonBooksCount > 0 && (
                            <span className="similar-tag similar-tag--books">
                              {user.commonBooksCount} book{user.commonBooksCount !== 1 ? 's' : ''} in common
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="similar-user-card__right" onClick={(e) => e.stopPropagation()}>
                      <FollowButton
                        userId={user.id}
                        isFollowing={user.isFollowing}
                        hasPendingRequest={user.hasPendingRequest}
                        isPublic={user.isPublic}
                        onFollowChange={(status) => handleFollowChange(user.id, status)}
                        size="small"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* All Users */}
          {discoverUsers.length > 0 && (
            <section className="discover-section">
              <h2>Explore</h2>
              <p className="discover-section__subtitle">
                Discover readers from around the world
              </p>
              <div className="user-card-grid">
                {discoverUsers.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    onFollowChange={handleFollowChange}
                  />
                ))}
              </div>
            </section>
          )}

          {suggestedUsers.length === 0 && discoverUsers.length === 0 && (
            <div className="discover-empty">
              <div className="discover-empty__icon">📚</div>
              <h3>No users to discover yet</h3>
              <p>Be the first to invite your friends!</p>
            </div>
          )}
          </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiscoverPage;
