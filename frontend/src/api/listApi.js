import axiosClient from './axiosClient';

const listApi = {
  // ─── CRUD ─────────────────────────────────────────────────
  createList: (data) =>
    axiosClient.post('/lists', data),

  updateList: (listId, data) =>
    axiosClient.put(`/lists/${listId}`, data),

  deleteList: (listId) =>
    axiosClient.delete(`/lists/${listId}`),

  // ─── Get Lists ────────────────────────────────────────────
  getList: (listId) =>
    axiosClient.get(`/lists/${listId}`),

  getMyLists: () =>
    axiosClient.get('/lists/mine'),

  getUserLists: (userId) =>
    axiosClient.get(`/lists/user/${userId}`),

  browseLists: (page = 0) =>
    axiosClient.get(`/lists/browse?page=${page}`),

  searchLists: (query, page = 0) =>
    axiosClient.get(`/lists/search?q=${encodeURIComponent(query)}&page=${page}`),

  // ─── Items ────────────────────────────────────────────────
  addItem: (listId, data) =>
    axiosClient.post(`/lists/${listId}/items`, data),

  removeItem: (listId, itemId) =>
    axiosClient.delete(`/lists/${listId}/items/${itemId}`),

  // ─── Likes ────────────────────────────────────────────────
  toggleLike: (listId) =>
    axiosClient.post(`/lists/${listId}/like`),
};

export default listApi;
