import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Library } from 'lucide-react';
import socialApi from '../api/socialApi';
import UserCard from '../components/social/UserCard';
import FollowButton from '../components/social/FollowButton';
import toast from 'react-hot-toast';

/* ── Tailwind class constants ── */

const ddItemCls =
  'flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-[background] duration-[120ms] hover:bg-[var(--color-bg-secondary)] dark:hover:bg-[rgba(124,77,255,0.08)]';
const ddItemActiveCls = 'bg-[var(--color-bg-secondary)] dark:bg-[rgba(124,77,255,0.08)]';

const ddAvatarCls = 'w-11 h-11 rounded-full overflow-hidden shrink-0 max-sm:w-10 max-sm:h-10';
const ddAvatarFallbackCls =
  'w-full h-full flex items-center justify-center bg-gradient-to-br from-[#7c3aed] to-[#a78bfa] text-white font-bold text-[1.1rem]';
const ddInfoCls = 'flex-1 min-w-0 flex flex-col gap-0.5';
const ddNameCls =
  'text-[0.9375rem] font-semibold text-[var(--color-text-primary)] whitespace-nowrap overflow-hidden text-ellipsis dark:text-[var(--color-text-primary)]';
const ddUsernameCls =
  'text-[0.8125rem] text-[var(--color-text-secondary)] whitespace-nowrap overflow-hidden text-ellipsis dark:text-[var(--color-text-secondary)]';

const TAG_STYLES = {
  genre:
    'bg-[rgba(109,40,217,0.1)] text-[var(--color-primary)] dark:bg-[rgba(124,77,255,0.15)] dark:text-[#a78bfa]',
  author:
    'bg-[rgba(16,185,129,0.1)] text-[#059669] dark:bg-[rgba(16,185,129,0.15)] dark:text-[#34d399]',
  books:
    'bg-[rgba(245,158,11,0.1)] text-[#d97706] dark:bg-[rgba(245,158,11,0.15)] dark:text-[#fbbf24]',
};
const tagBase =
  'inline-flex items-center py-0.5 px-2.5 rounded-full text-[0.6875rem] font-semibold tracking-[0.01em] whitespace-nowrap';

const inputCls =
  'w-full py-3.5 pr-20 pl-11 border-2 border-[var(--color-border)] rounded-xl text-base bg-[var(--color-bg)] text-[var(--color-text-primary)] transition-all duration-200 placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] focus:shadow-[0_0_0_4px_rgba(109,40,217,0.1)] dark:bg-[var(--color-bg-secondary)] dark:border-[var(--color-border)] dark:text-[var(--color-text-primary)] dark:focus:border-[var(--color-primary)] dark:focus:shadow-[0_0_0_4px_rgba(124,77,255,0.2)]';

const dropdownCls =
  'absolute top-[calc(100%+6px)] left-0 right-0 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[14px] shadow-[0_12px_40px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.06)] overflow-hidden z-[100] max-h-[400px] overflow-y-auto animate-[dropdownSlide_0.18s_ease-out] max-sm:rounded-xl max-sm:max-h-80 dark:bg-[var(--color-bg-secondary)] dark:border-[var(--color-border)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.4),0_4px_12px_rgba(0,0,0,0.2)]';

const similarCardCls =
  'flex items-center justify-between gap-3 p-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[14px] cursor-pointer transition-all duration-200 hover:border-[var(--color-primary)] hover:shadow-[0_4px_16px_rgba(109,40,217,0.08)] hover:-translate-y-px dark:bg-[var(--color-bg-secondary)] dark:border-[var(--color-border)] dark:hover:border-[var(--color-primary)] dark:hover:shadow-[0_4px_16px_rgba(124,77,255,0.12)] max-sm:p-3';

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
    <div className="discover-page min-h-screen bg-[var(--color-bg)] p-6 dark:bg-[var(--color-bg)] max-sm:p-4">
      <div className="max-w-[800px] mx-auto animate-[g-fadeInUp_0.5s_cubic-bezier(0.16,1,0.3,1)_both]">
        {/* Back Button */}
        <button className="page-back-btn" onClick={() => navigate(-1)}>← Back</button>

        {/* Search Section — LinkedIn/Instagram style */}
        <header className="mb-9 text-center">
          <h1 className="text-[1.75rem] font-bold text-[var(--color-text-primary)] mb-1.5 dark:text-[var(--color-text-primary)]">
            Discover Readers
          </h1>
          <p className="text-[var(--color-text-secondary)] mb-6 text-[0.9375rem]">
            Find and follow other book lovers
          </p>

          <div className="relative max-w-[520px] mx-auto max-sm:max-w-full">
            <div className="relative flex items-center">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)] pointer-events-none z-[1]"
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
                className={inputCls}
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
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 w-[26px] h-[26px] border-none bg-[var(--color-bg-secondary)] rounded-full text-[var(--color-text-secondary)] cursor-pointer text-[0.7rem] flex items-center justify-center transition-all duration-150 z-[1] hover:bg-[var(--color-border)] hover:text-[var(--color-text-primary)] dark:bg-[var(--color-bg)] dark:text-[var(--color-text-secondary)] dark:hover:bg-[var(--color-border)]"
                  onClick={clearSearch}
                >
                  ✕
                </button>
              )}

              {searching && (
                <div className="absolute right-12 top-1/2 -translate-y-1/2 w-[18px] h-[18px] border-2 border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin dark:border-[var(--color-border)] dark:border-t-[var(--color-primary)]" />
              )}
            </div>

            {/* Live Search Dropdown */}
            {showDropdown && (
              <div
                className={dropdownCls}
                ref={dropdownRef}
                style={{ scrollbarWidth: 'thin' }}
              >
                {/* Show recent searches when input is empty */}
                {!searchQuery.trim() && recentSearches.length > 0 && (
                  <>
                    <div className="flex items-center justify-between px-4 pt-3 pb-2 text-[0.8125rem] font-semibold text-[var(--color-text-secondary)] uppercase tracking-[0.04em] dark:text-[var(--color-text-secondary)]">
                      <span>Recent</span>
                      <button
                        className="bg-none border-none text-[var(--color-primary)] text-[0.8125rem] font-semibold cursor-pointer p-0 normal-case tracking-normal hover:underline"
                        onClick={clearAllRecent}
                      >
                        Clear all
                      </button>
                    </div>
                    {recentSearches.map((user, index) => (
                      <div
                        key={user.id}
                        className={`${ddItemCls} ${highlightIndex === index ? ddItemActiveCls : ''}`}
                        onClick={() => navigateToUser(user)}
                        onMouseEnter={() => setHighlightIndex(index)}
                      >
                        <div className={ddAvatarCls}>
                          {user.profilePictureUrl ? (
                            <img className="w-full h-full object-cover" src={user.profilePictureUrl} alt="" />
                          ) : (
                            <div className={ddAvatarFallbackCls}>
                              {getInitials(user)}
                            </div>
                          )}
                        </div>
                        <div className={ddInfoCls}>
                          <span className={ddNameCls}>
                            {user.displayName || user.username}
                          </span>
                          <span className={ddUsernameCls}>
                            @{user.username}
                          </span>
                        </div>
                        <button
                          className="shrink-0 w-6 h-6 border-none bg-none text-[var(--color-text-muted)] cursor-pointer text-[0.7rem] flex items-center justify-center rounded-full transition-all duration-150 hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)] dark:hover:bg-[var(--color-border)] dark:hover:text-[var(--color-text-primary)]"
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
                        className={`${ddItemCls} ${highlightIndex === index ? ddItemActiveCls : ''}`}
                        onClick={() => navigateToUser(user)}
                        onMouseEnter={() => setHighlightIndex(index)}
                      >
                        <div className={ddAvatarCls}>
                          {user.profilePictureUrl ? (
                            <img className="w-full h-full object-cover" src={user.profilePictureUrl} alt="" />
                          ) : (
                            <div className={ddAvatarFallbackCls}>
                              {getInitials(user)}
                            </div>
                          )}
                        </div>
                        <div className={ddInfoCls}>
                          <span className={ddNameCls}>
                            {user.displayName || user.username}
                          </span>
                          <span className={ddUsernameCls}>
                            @{user.username}
                            {user.bio && (
                              <span className="text-[var(--color-text-muted)]"> · {user.bio}</span>
                            )}
                          </span>
                        </div>
                        <div className="shrink-0 text-right">
                          {user.followersCount > 0 && (
                            <span className="text-xs text-[var(--color-text-muted)] whitespace-nowrap">
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
                  <div className="flex items-center justify-center gap-2.5 py-6 px-4 text-[var(--color-text-secondary)] text-sm dark:text-[var(--color-text-secondary)]">
                    <div className="w-[18px] h-[18px] border-2 border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin dark:border-[var(--color-border)] dark:border-t-[var(--color-primary)]" />
                    <span>Searching...</span>
                  </div>
                )}

                {/* No results */}
                {searchQuery.trim() && !searching && suggestions.length === 0 && (
                  <div className="flex items-center justify-center gap-2.5 py-6 px-4 text-[var(--color-text-secondary)] text-sm dark:text-[var(--color-text-secondary)]">
                    <span className="text-xl"><Search className="w-5 h-5" /></span>
                    <span>No results for "<strong>{searchQuery}</strong>"</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Discover Content */}
        <div>
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-4 min-h-[50vh] text-base text-[var(--color-text-secondary)]">
              <div className="w-8 h-8 border-3 border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-[g-spin_0.7s_linear_infinite] dark:border-[var(--color-border)] dark:border-t-[var(--color-primary)]" />
              <span>Finding readers for you...</span>
            </div>
          ) : (
          <>
          {/* Suggested Users */}
          {suggestedUsers.length > 0 && (
            <section className="mb-10">
              <h2 className="text-xl font-semibold text-[var(--color-text-primary)] m-0 dark:text-[var(--color-text-primary)]">
                Suggested for You
              </h2>
              <p className="text-[var(--color-text-secondary)] text-sm mt-1 mb-4">
                People you might want to follow
              </p>
              <div className="flex flex-col gap-3">
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
            <section className="mb-10">
              <h2 className="text-xl font-semibold text-[var(--color-text-primary)] m-0 dark:text-[var(--color-text-primary)]">
                People with Similar Interests
              </h2>
              <p className="text-[var(--color-text-secondary)] text-sm mt-1 mb-4">
                Readers who share your taste in books
              </p>
              <div className="flex flex-col gap-3">
                {similarUsers.map((user) => (
                  <div
                    key={user.id}
                    className={similarCardCls}
                    onClick={() => navigate(`/profile/${user.username}`)}
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div className="w-13 h-13 rounded-full overflow-hidden shrink-0 max-sm:w-11 max-sm:h-11">
                        {user.profilePictureUrl ? (
                          <img className="w-full h-full object-cover" src={user.profilePictureUrl} alt={user.username} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#7c3aed] to-[#a78bfa] text-white font-bold text-[1.2rem]">
                            {(user.displayName || user.username).charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-[0.9375rem] font-semibold text-[var(--color-text-primary)] whitespace-nowrap overflow-hidden text-ellipsis dark:text-[var(--color-text-primary)]">
                          {user.displayName || user.username}
                        </span>
                        <span className="text-[0.8125rem] text-[var(--color-text-secondary)] dark:text-[var(--color-text-secondary)]">
                          @{user.username}
                        </span>
                        {/* Shared interests badges */}
                        <div className="flex flex-wrap gap-1.5 mt-1.5 max-sm:gap-1">
                          {user.sharedGenres?.map((genre) => (
                            <span key={genre} className={`${tagBase} ${TAG_STYLES.genre}`}>
                              {genre}
                            </span>
                          ))}
                          {user.sharedAuthors?.slice(0, 2).map((author) => (
                            <span key={author} className={`${tagBase} ${TAG_STYLES.author}`}>
                              {author}
                            </span>
                          ))}
                          {user.commonBooksCount > 0 && (
                            <span className={`${tagBase} ${TAG_STYLES.books}`}>
                              {user.commonBooksCount} book{user.commonBooksCount !== 1 ? 's' : ''} in common
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
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
            <section className="mb-10">
              <h2 className="text-xl font-semibold text-[var(--color-text-primary)] m-0 dark:text-[var(--color-text-primary)]">
                Explore
              </h2>
              <p className="text-[var(--color-text-secondary)] text-sm mt-1 mb-4">
                Discover readers from around the world
              </p>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4 max-sm:grid-cols-1">
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
            <div className="text-center py-16 px-6 bg-[var(--color-bg-secondary)] rounded-xl border border-[var(--color-border)] dark:bg-[var(--color-bg-secondary)] dark:border-[var(--color-border)]">
              <div className="text-5xl mb-4"><Library className="w-14 h-14 mx-auto" /></div>
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2 dark:text-[var(--color-text-primary)]">
                No users to discover yet
              </h3>
              <p className="text-[var(--color-text-secondary)] m-0">Be the first to invite your friends!</p>
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
