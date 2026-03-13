import socialApi from './api/socialApi';

export const USER_SEARCH_STALE_TIME_MS = 1000 * 60 * 5;

const normalizeQuery = (query) => (query || '').trim().toLowerCase();

export const userSearchQueryKeys = {
  all: ['users', 'search'],
  list: (query, page = 0, size = 8) => ['users', 'search', normalizeQuery(query), page, size],
};

export const fetchUserSearchResults = async ({ query, page = 0, size = 8 }) => {
  const normalized = (query || '').trim();
  if (!normalized) return [];

  const response = await socialApi.searchUsers(normalized, page, size);
  return response.data?.content || response.data || [];
};
