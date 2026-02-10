import axiosClient from './axiosClient';

/**
 * Reviews API
 * Handles book reviews, likes, and comments
 */
const reviewApi = {
  // ============================================
  // Reviews
  // ============================================

  /** Create a review for a book */
  createReview: (bookId, data) =>
    axiosClient.post(`/reviews/book/${bookId}`, data),

  /** Update a review */
  updateReview: (reviewId, data) =>
    axiosClient.put(`/reviews/${reviewId}`, data),

  /** Delete a review */
  deleteReview: (reviewId) =>
    axiosClient.delete(`/reviews/${reviewId}`),

  /** Get a single review */
  getReview: (reviewId) =>
    axiosClient.get(`/reviews/${reviewId}`),

  /** Get all reviews for a book */
  getBookReviews: (bookId, page = 0, size = 10) =>
    axiosClient.get(`/reviews/book/${bookId}`, { params: { page, size } }),

  /** Get all reviews by a user */
  getUserReviews: (userId, page = 0, size = 10) =>
    axiosClient.get(`/reviews/user/${userId}`, { params: { page, size } }),

  /** Get reviews from followed users (feed) */
  getFollowingReviews: (page = 0, size = 10, sort = 'relevant') =>
    axiosClient.get('/reviews/feed', { params: { page, size, sort } }),

  // ============================================
  // Likes
  // ============================================

  /** Toggle like on a review */
  toggleLike: (reviewId) =>
    axiosClient.post(`/reviews/${reviewId}/like`),

  // ============================================
  // Save/Bookmark
  // ============================================

  /** Toggle save (bookmark) on a review */
  toggleSave: (reviewId) =>
    axiosClient.post(`/reviews/${reviewId}/save`),

  /** Get saved reviews */
  getSavedReviews: (page = 0, size = 20) =>
    axiosClient.get('/reviews/saved', { params: { page, size } }),

  // ============================================
  // Comments
  // ============================================

  /** Add a comment to a review (optionally as a reply) */
  addComment: (reviewId, content, parentId = null) => {
    const body = { content };
    if (parentId) body.parentId = parentId;
    return axiosClient.post(`/reviews/${reviewId}/comments`, body);
  },

  /** Get top-level comments for a review (with replies) */
  getComments: (reviewId, page = 0, size = 20) =>
    axiosClient.get(`/reviews/${reviewId}/comments`, { params: { page, size } }),

  /** Get replies for a specific comment */
  getReplies: (commentId) =>
    axiosClient.get(`/reviews/comments/${commentId}/replies`),

  /** Delete a comment */
  deleteComment: (commentId) =>
    axiosClient.delete(`/reviews/comments/${commentId}`),
};

export default reviewApi;
