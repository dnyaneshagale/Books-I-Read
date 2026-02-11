import axiosClient from './axiosClient';

/**
 * Social Network API
 * Handles all social features: profiles, following, discovery, feed
 */
const socialApi = {
  // ============================================
  // Profile Endpoints
  // ============================================

  /**
   * Get current user's profile
   * @returns {Promise} - UserProfileResponse
   */
  getMyProfile: () => {
    return axiosClient.get('/social/profile/me');
  },

  /**
   * Get user profile by username
   * @param {string} username
   * @returns {Promise} - UserProfileResponse
   */
  getProfile: (username) => {
    return axiosClient.get(`/social/profile/${username}`);
  },

  /**
   * Get user profile by ID
   * @param {number} userId
   * @returns {Promise} - UserProfileResponse
   */
  getProfileById: (userId) => {
    return axiosClient.get(`/social/profile/id/${userId}`);
  },

  /**
   * Update current user's profile
   * @param {Object} data - { displayName, bio, profilePictureUrl, isPublic, favoriteGenres }
   * @returns {Promise} - Updated UserProfileResponse
   */
  updateProfile: (data) => {
    return axiosClient.put('/social/profile', data);
  },

  /**
   * Get a user's books (respects privacy settings)
   * @param {string} username
   * @returns {Promise} - Array of BookResponse
   */
  getUserBooks: (username) => {
    return axiosClient.get(`/social/profile/${username}/books`);
  },

  // ============================================
  // Follow/Unfollow Endpoints
  // ============================================

  /**
   * Follow a user (or send request for private accounts)
   * @param {number} userId
   * @returns {Promise} - { status: 'followed' | 'requested' | 'already_following' | 'already_requested' }
   */
  followUser: (userId) => {
    return axiosClient.post(`/social/follow/${userId}`);
  },

  /**
   * Unfollow a user
   * @param {number} userId
   * @returns {Promise}
   */
  unfollowUser: (userId) => {
    return axiosClient.delete(`/social/follow/${userId}`);
  },

  /**
   * Cancel a pending follow request
   * @param {number} userId
   * @returns {Promise}
   */
  cancelFollowRequest: (userId) => {
    return axiosClient.delete(`/social/follow/request/${userId}`);
  },

  /**
   * Get followers of a user
   * @param {number} userId
   * @param {number} page
   * @param {number} size
   * @returns {Promise} - Page<UserCardResponse>
   */
  getFollowers: (userId, page = 0, size = 20) => {
    return axiosClient.get(`/social/followers/${userId}`, { params: { page, size } });
  },

  /**
   * Get users that a user is following
   * @param {number} userId
   * @param {number} page
   * @param {number} size
   * @returns {Promise} - Page<UserCardResponse>
   */
  getFollowing: (userId, page = 0, size = 20) => {
    return axiosClient.get(`/social/following/${userId}`, { params: { page, size } });
  },

  // ============================================
  // Follow Request Endpoints (for private accounts)
  // ============================================

  /**
   * Get pending follow requests
   * @param {number} page
   * @param {number} size
   * @returns {Promise} - Page<FollowRequestResponse>
   */
  getPendingRequests: (page = 0, size = 20) => {
    return axiosClient.get('/social/requests', { params: { page, size } });
  },

  /**
   * Get count of pending follow requests
   * @returns {Promise} - { count: number }
   */
  getPendingRequestsCount: () => {
    return axiosClient.get('/social/requests/count');
  },

  /**
   * Approve a follow request
   * @param {number} requestId
   * @returns {Promise}
   */
  approveFollowRequest: (requestId) => {
    return axiosClient.post(`/social/requests/${requestId}/approve`);
  },

  /**
   * Reject a follow request
   * @param {number} requestId
   * @returns {Promise}
   */
  rejectFollowRequest: (requestId) => {
    return axiosClient.post(`/social/requests/${requestId}/reject`);
  },

  // ============================================
  // Discovery & Search Endpoints
  // ============================================

  /**
   * Search users by username or display name
   * @param {string} query
   * @param {number} page
   * @param {number} size
   * @returns {Promise} - Page<UserCardResponse>
   */
  searchUsers: (query, page = 0, size = 20) => {
    return axiosClient.get('/social/search', { params: { query, page, size } });
  },

  /**
   * Discover public users
   * @param {number} page
   * @param {number} size
   * @returns {Promise} - Page<UserCardResponse>
   */
  discoverUsers: (page = 0, size = 20) => {
    return axiosClient.get('/social/discover', { params: { page, size } });
  },

  /**
   * Get suggested users to follow
   * @param {number} page
   * @param {number} size
   * @returns {Promise} - Page<UserCardResponse>
   */
  getSuggestedUsers: (page = 0, size = 10) => {
    return axiosClient.get('/social/suggestions', { params: { page, size } });
  },

  /**
   * Get users with similar interests (shared genres, authors, books)
   * @param {number} page
   * @param {number} size
   * @returns {Promise} - Page<UserCardResponse> with sharedGenres, sharedAuthors, commonBooksCount
   */
  getSimilarUsers: (page = 0, size = 10) => {
    return axiosClient.get('/social/similar', { params: { page, size } });
  },

  // ============================================
  // Activity Feed Endpoints
  // ============================================

  /**
   * Get activity feed (from followed users)
   * @param {number} page
   * @param {number} size
   * @returns {Promise} - Page<ActivityResponse>
   */
  getFeed: (page = 0, size = 20) => {
    return axiosClient.get('/social/feed', { params: { page, size } });
  },

  /**
   * Get activities for a specific user
   * @param {number} userId
   * @param {number} page
   * @param {number} size
   * @returns {Promise} - Page<ActivityResponse>
   */
  getUserActivities: (userId, page = 0, size = 20) => {
    return axiosClient.get(`/social/activities/${userId}`, { params: { page, size } });
  },

  // ============================================
  // Reflections Endpoints
  // ============================================

  /**
   * Create a new reflection
   * @param {Object} data - { content, bookId?, visibleToFollowersOnly? }
   * @returns {Promise} - ReflectionResponse
   */
  createReflection: (data) => {
    return axiosClient.post('/social/reflections', data);
  },

  /**
   * Delete a reflection
   * @param {number} id
   * @returns {Promise}
   */
  deleteReflection: (id) => {
    return axiosClient.delete(`/social/reflections/${id}`);
  },

  /**
   * Update reflection privacy
   * @param {number} id
   * @param {boolean} visibleToFollowersOnly
   * @returns {Promise} - ReflectionResponse
   */
  updateReflectionPrivacy: (id, visibleToFollowersOnly) => {
    return axiosClient.patch(`/social/reflections/${id}/privacy`, { visibleToFollowersOnly });
  },

  /**
   * Get a single reflection by ID
   * @param {number} reflectionId
   * @returns {Promise} - ReflectionResponse
   */
  getReflection: (reflectionId) => {
    return axiosClient.get(`/social/reflections/${reflectionId}`);
  },

  /**
   * Get reflections from followed users (Following tab)
   * @param {number} page
   * @param {number} size
   * @returns {Promise} - Page<ReflectionResponse>
   */
  getFollowingReflections: (page = 0, size = 20, sort = 'relevant') => {
    return axiosClient.get('/social/reflections/following', { params: { page, size, sort } });
  },

  /**
   * Get reflections from everyone (public profiles)
   * @param {number} page
   * @param {number} size
   * @param {string} sort - 'relevant' or 'recent'
   * @returns {Promise} - Page<ReflectionResponse>
   */
  getEveryoneReflections: (page = 0, size = 20, sort = 'relevant') => {
    return axiosClient.get('/social/reflections/everyone', { params: { page, size, sort } });
  },

  /**
   * Get reflections by a specific user
   * @param {number} userId
   * @param {number} page
   * @param {number} size
   * @returns {Promise} - Page<ReflectionResponse>
   */
  getUserReflections: (userId, page = 0, size = 20) => {
    return axiosClient.get(`/social/reflections/user/${userId}`, { params: { page, size } });
  },

  /**
   * Search reflections by content, book, author, or user
   * @param {string} query
   * @param {number} page
   * @param {number} size
   * @returns {Promise} - Page<ReflectionResponse>
   */
  searchReflections: (query, page = 0, size = 20) => {
    return axiosClient.get('/social/reflections/search', { params: { query, page, size } });
  },

  // ============================================
  // Reflection Social Actions (LinkedIn-style)
  // ============================================

  /**
   * Toggle like on a reflection
   * @param {number} reflectionId
   * @returns {Promise} - Updated ReflectionResponse
   */
  toggleLikeReflection: (reflectionId) => {
    return axiosClient.post(`/social/reflections/${reflectionId}/like`);
  },

  /**
   * Add a comment to a reflection (supports replies via parentId)
   * @param {number} reflectionId
   * @param {string} content
   * @param {number|null} parentId - optional parent comment ID for replies
   * @returns {Promise} - CommentResponse
   */
  addReflectionComment: (reflectionId, content, parentId = null) => {
    const body = { content };
    if (parentId) body.parentId = parentId;
    return axiosClient.post(`/social/reflections/${reflectionId}/comments`, body);
  },

  /**
   * Get paginated top-level comments for a reflection
   * @param {number} reflectionId
   * @param {number} page
   * @param {number} size
   * @returns {Promise} - Page<CommentResponse>
   */
  getReflectionComments: (reflectionId, page = 0, size = 20) => {
    return axiosClient.get(`/social/reflections/${reflectionId}/comments`, { params: { page, size } });
  },

  /**
   * Get replies for a specific comment
   * @param {number} commentId
   * @returns {Promise} - List<CommentResponse>
   */
  getReflectionCommentReplies: (commentId) => {
    return axiosClient.get(`/social/reflections/comments/${commentId}/replies`);
  },

  /**
   * Delete a comment
   * @param {number} commentId
   * @returns {Promise}
   */
  deleteReflectionComment: (commentId) => {
    return axiosClient.delete(`/social/reflections/comments/${commentId}`);
  },

  /**
   * Toggle save/bookmark on a reflection
   * @param {number} reflectionId
   * @returns {Promise} - Updated ReflectionResponse
   */
  toggleSaveReflection: (reflectionId) => {
    return axiosClient.post(`/social/reflections/${reflectionId}/save`);
  },

  /**
   * Get saved/bookmarked reflections for current user
   * @param {number} page
   * @param {number} size
   * @returns {Promise} - Page of ReflectionResponse
   */
  getSavedReflections: (page = 0, size = 20) => {
    return axiosClient.get('/social/reflections/saved', { params: { page, size } });
  },
};

export default socialApi;
