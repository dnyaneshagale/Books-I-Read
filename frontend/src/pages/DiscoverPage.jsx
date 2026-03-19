import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import socialApi from '../api/socialApi';
import UserCard from '../components/social/UserCard';
import FollowButton from '../components/social/FollowButton';
import toast from 'react-hot-toast';

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

    try {
      const similarRes = await socialApi.getSimilarUsers(0, 10);
      setSimilarUsers(similarRes.data.content || []);
    } catch (error) {
      console.error('Failed to load similar users:', error);
    }
  };

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
        navigateToUser(items[highlightIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      inputRef.current?.blur();
    }
  };

  const navigateToUser = (user) => {
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

  const getInitials = (user) => {
    const name = user.displayName || user.username;
    return name.charAt(0).toUpperCase();
  };

  // Reusable dropdown item
  const DropdownItem = ({ user, index, showRemove, showMeta }) => (
    <div
      className={`flex items-center gap-3 py-2.5 px-4 cursor-pointer transition-colors duration-100 ${highlightIndex === index ? 'bg-bg-secondary dark:bg-[rgba(124,77,255,0.08)]' : 'hover:bg-bg-secondary dark:hover:bg-[rgba(124,77,255,0.08)]'}`}
      onClick={() => navigateToUser(user)}
      onMouseEnter={() => setHighlightIndex(index)}
    >
      <div className="w-11 h-11 max-[640px]:w-10 max-[640px]:h-10 rounded-full overflow-hidden flex-shrink-0">
        {user.profilePictureUrl ? (
          <img src={user.profilePictureUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#7c3aed] to-[#a78bfa] text-white font-bold text-lg">
            {getInitials(user)}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <span className="text-[0.9375rem] font-semibold text-txt-primary dark:text-[#e2e8f0] whitespace-nowrap overflow-hidden text-ellipsis">
          {user.displayName || user.username}
        </span>
        <span className="text-[0.8125rem] text-txt-secondary dark:text-[#a5b4fc] whitespace-nowrap overflow-hidden text-ellipsis">
          @{user.username}
          {user.bio && <span className="text-txt-light dark:text-[#94a3b8]"> · {user.bio}</span>}
        </span>
      </div>
      {showMeta && user.followersCount > 0 && (
        <div className="flex-shrink-0 text-right">
          <span className="text-xs text-txt-light dark:text-[#94a3b8] whitespace-nowrap">
            {user.followersCount} follower{user.followersCount !== 1 ? 's' : ''}
          </span>
        </div>
      )}
      {showRemove && (
        <button
          className="flex-shrink-0 w-6 h-6 border-none bg-none text-txt-light dark:text-[#94a3b8] cursor-pointer text-[0.7rem] flex items-center justify-center rounded-full transition-all duration-150 hover:bg-bg-secondary dark:hover:bg-[#3b3670] hover:text-txt-primary dark:hover:text-[#e2e8f0]"
          onClick={(e) => removeRecentSearch(e, user.id)}
          title="Remove"
        >
          ✕
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-bg dark:bg-bg p-6 max-[640px]:p-4">
      <div className="max-w-[800px] mx-auto animate-fade-in-up">
        {/* Back Button */}
        <button className="page-back-btn" onClick={() => navigate(-1)}>← Back</button>

        {/* Search Section */}
        <header className="mb-9 text-center">
          <h1 className="text-[1.75rem] font-bold text-txt-primary dark:text-[#e2e8f0] m-0 mb-1.5">Discover Readers</h1>
          <p className="text-txt-secondary dark:text-[#a5b4fc] m-0 mb-6 text-[0.9375rem]">Find and follow other book lovers</p>

          <div className="relative max-w-[520px] max-[640px]:max-w-full mx-auto">
            <div className="relative flex items-center">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-txt-light dark:text-[#94a3b8] pointer-events-none z-[1]"
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
                className="w-full py-3.5 pr-20 pl-11 border-2 border-border dark:border-[#3b3670] rounded-xl text-base bg-bg dark:bg-[#1e1b4b] text-txt-primary dark:text-[#e2e8f0] transition-all duration-200 outline-none focus:border-primary dark:focus:border-[#7C4DFF] focus:shadow-[0_0_0_4px_rgba(109,40,217,0.1)] dark:focus:shadow-[0_0_0_4px_rgba(124,77,255,0.2)] placeholder:text-txt-light dark:placeholder:text-[#94a3b8]"
              />

              {searchQuery && (
                <button
                  type="button"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 w-[26px] h-[26px] border-none bg-bg-secondary dark:bg-bg rounded-full text-txt-secondary dark:text-[#a5b4fc] cursor-pointer text-[0.7rem] flex items-center justify-center transition-all duration-150 z-[1] hover:bg-border dark:hover:bg-[#3b3670] hover:text-txt-primary dark:hover:text-[#e2e8f0]"
                  onClick={clearSearch}
                >
                  ✕
                </button>
              )}

              {searching && (
                <div className="absolute right-12 top-1/2 -translate-y-1/2 w-[18px] h-[18px] border-2 border-border dark:border-[#3b3670] border-t-primary dark:border-t-[#7C4DFF] rounded-full animate-spin" />
              )}
            </div>

            {/* Live Search Dropdown */}
            {showDropdown && (
              <div ref={dropdownRef} className="absolute top-[calc(100%+6px)] left-0 right-0 bg-bg dark:bg-[#1a1744] border border-border dark:border-[#3b3670] rounded-[14px] max-[640px]:rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.4),0_4px_12px_rgba(0,0,0,0.2)] overflow-hidden z-[100] max-h-[400px] max-[640px]:max-h-[320px] overflow-y-auto animate-fade-in-up">
                {/* Recent searches */}
                {!searchQuery.trim() && recentSearches.length > 0 && (
                  <>
                    <div className="flex items-center justify-between py-3 px-4 pb-2 text-[0.8125rem] font-semibold text-txt-secondary dark:text-[#a5b4fc] uppercase tracking-wider">
                      <span>Recent</span>
                      <button className="bg-none border-none text-primary text-[0.8125rem] font-semibold cursor-pointer p-0 normal-case tracking-normal hover:underline" onClick={clearAllRecent}>Clear all</button>
                    </div>
                    {recentSearches.map((user, index) => (
                      <DropdownItem key={user.id} user={user} index={index} showRemove />
                    ))}
                  </>
                )}

                {/* Live search results */}
                {searchQuery.trim() && !searching && suggestions.length > 0 && (
                  <>
                    {suggestions.map((user, index) => (
                      <DropdownItem key={user.id} user={user} index={index} showMeta />
                    ))}
                  </>
                )}

                {/* Searching indicator */}
                {searchQuery.trim() && searching && (
                  <div className="flex items-center justify-center gap-2.5 py-6 px-4 text-txt-secondary dark:text-[#a5b4fc] text-sm">
                    <div className="w-[18px] h-[18px] border-2 border-border dark:border-[#3b3670] border-t-primary dark:border-t-[#7C4DFF] rounded-full animate-spin" />
                    <span>Searching...</span>
                  </div>
                )}

                {/* No results */}
                {searchQuery.trim() && !searching && suggestions.length === 0 && (
                  <div className="flex items-center justify-center gap-2.5 py-6 px-4 text-txt-secondary dark:text-[#a5b4fc] text-sm">
                    <span className="text-xl">🔍</span>
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
            <div className="flex flex-col items-center justify-center gap-4 min-h-[50vh] text-base text-txt-secondary dark:text-[#a5b4fc]">
              <div className="w-8 h-8 border-[3px] border-border dark:border-[#3b3670] border-t-primary dark:border-t-[#7C4DFF] rounded-full animate-spin" />
              <span>Finding readers for you...</span>
            </div>
          ) : (
            <>
              {/* Suggested Users */}
              {suggestedUsers.length > 0 && (
                <section className="mb-10">
                  <h2 className="text-xl font-semibold text-txt-primary dark:text-[#e2e8f0] m-0">Suggested for You</h2>
                  <p className="text-txt-secondary dark:text-[#a5b4fc] text-sm mt-1 mb-4">
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
                <section className="mb-10">
                  <h2 className="text-xl font-semibold text-txt-primary dark:text-[#e2e8f0] m-0">People with Similar Interests</h2>
                  <p className="text-txt-secondary dark:text-[#a5b4fc] text-sm mt-1 mb-4">
                    Readers who share your taste in books
                  </p>
                  <div className="flex flex-col gap-3">
                    {similarUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between gap-3 p-4 max-[640px]:p-3 bg-bg dark:bg-[#1a1744] border border-border dark:border-[#3b3670] rounded-[14px] cursor-pointer transition-all duration-200 hover:border-primary dark:hover:border-[#7C4DFF] hover:shadow-[0_4px_16px_rgba(109,40,217,0.08)] dark:hover:shadow-[0_4px_16px_rgba(124,77,255,0.12)] hover:-translate-y-px" onClick={() => navigate(`/profile/${user.username}`)}>
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                          <div className="w-[52px] h-[52px] max-[640px]:w-11 max-[640px]:h-11 rounded-full overflow-hidden flex-shrink-0">
                            {user.profilePictureUrl ? (
                              <img src={user.profilePictureUrl} alt={user.username} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#7c3aed] to-[#a78bfa] text-white font-bold text-xl">
                                {(user.displayName || user.username).charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <span className="text-[0.9375rem] font-semibold text-txt-primary dark:text-[#e2e8f0] whitespace-nowrap overflow-hidden text-ellipsis">{user.displayName || user.username}</span>
                            <span className="text-[0.8125rem] text-txt-secondary dark:text-[#a5b4fc]">@{user.username}</span>
                            {/* Shared interests badges */}
                            <div className="flex flex-wrap gap-1.5 max-[640px]:gap-1 mt-1.5">
                              {user.sharedGenres?.map((genre) => (
                                <span key={genre} className="inline-flex items-center py-0.5 px-2.5 rounded-full text-[0.6875rem] font-semibold tracking-tight whitespace-nowrap bg-[rgba(109,40,217,0.1)] dark:bg-[rgba(124,77,255,0.15)] text-primary dark:text-[#a78bfa]">{genre}</span>
                              ))}
                              {user.sharedAuthors?.slice(0, 2).map((author) => (
                                <span key={author} className="inline-flex items-center py-0.5 px-2.5 rounded-full text-[0.6875rem] font-semibold tracking-tight whitespace-nowrap bg-[rgba(16,185,129,0.1)] dark:bg-[rgba(16,185,129,0.15)] text-[#059669] dark:text-[#34d399]">{author}</span>
                              ))}
                              {user.commonBooksCount > 0 && (
                                <span className="inline-flex items-center py-0.5 px-2.5 rounded-full text-[0.6875rem] font-semibold tracking-tight whitespace-nowrap bg-[rgba(245,158,11,0.1)] dark:bg-[rgba(245,158,11,0.15)] text-[#d97706] dark:text-[#fbbf24]">
                                  {user.commonBooksCount} book{user.commonBooksCount !== 1 ? 's' : ''} in common
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
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
                  <h2 className="text-xl font-semibold text-txt-primary dark:text-[#e2e8f0] m-0">Explore</h2>
                  <p className="text-txt-secondary dark:text-[#a5b4fc] text-sm mt-1 mb-4">
                    Discover readers from around the world
                  </p>
                  <div className="user-card-grid max-[640px]:!grid-cols-1">
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
                <div className="text-center py-16 px-6 bg-bg-secondary dark:bg-[#1e1b4b] rounded-xl border border-border dark:border-[#3b3670]">
                  <div className="text-[3rem] mb-4">📚</div>
                  <h3 className="text-lg font-semibold text-txt-primary dark:text-[#e2e8f0] m-0 mb-2">No users to discover yet</h3>
                  <p className="text-txt-secondary dark:text-[#a5b4fc] m-0">Be the first to invite your friends!</p>
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
