import axiosClient from './axiosClient';

/**
 * Book API Service
 * 
 * All API calls for book CRUD operations
 * Extension Notes:
 * - Add pagination parameters: getBooks(page, size, sort)
 * - Add filtering: getBooksByStatus(status)
 * - Add search: searchBooks(query)
 * - Add statistics: getBookStats()
 */

const bookApi = {
  /**
   * Get all books
   * @returns {Promise} Array of books
   */
  getAllBooks: async () => {
    const response = await axiosClient.get('/books');
    return response.data;
  },

  /**
   * Get a single book by ID
   * @param {number} id - Book ID
   * @returns {Promise} Book object
   */
  getBookById: async (id) => {
    const response = await axiosClient.get(`/books/${id}`);
    return response.data;
  },

  /**
   * Create a new book
   * @param {Object} bookData - Book details {title, author, totalPages, pagesRead}
   * @returns {Promise} Created book
   */
  createBook: async (bookData) => {
    const response = await axiosClient.post('/books', bookData);
    return response.data;
  },

  /**
   * Update a book (including progress)
   * @param {number} id - Book ID
   * @param {Object} bookData - Updated book details
   * @returns {Promise} Updated book
   */
  updateBook: async (id, bookData) => {
    const response = await axiosClient.put(`/books/${id}`, bookData);
    return response.data;
  },

  /**
   * Toggle book privacy
   */
  togglePrivacy: async (id, isPublic) => {
    const response = await axiosClient.patch(`/books/${id}/privacy`, { isPublic });
    return response.data;
  },

  /**
   * Delete a book
   * @param {number} id - Book ID
   * @returns {Promise} void
   */
  deleteBook: async (id) => {
    await axiosClient.delete(`/books/${id}`);
  },

  /**
   * Delete multiple books in batch
   * @param {Array<number>} bookIds - Array of book IDs to delete
   * @returns {Promise} void
   */
  deleteBooksInBatch: async (bookIds) => {
    await axiosClient.delete('/books/batch', { data: bookIds });
  },

  /**
   * Get all reading activity dates for streak calculation
   * @returns {Promise} Object with activityDates array
   */
  getActivityDates: async () => {
    const response = await axiosClient.get('/activities/dates');
    return response.data;
  },

  getActivityDetails: async () => {
    const response = await axiosClient.get('/activities/details');
    return response.data;
  },

  /**
   * Get daily reading statistics for the last 7 days
   * @returns {Promise} Object with dailyStats array
   */
  getDailyStats: async () => {
    const response = await axiosClient.get('/activities/daily-stats');
    return response.data;
  },

  /**
   * Get pages read for week/month/year periods
   * @returns {Promise} Object with pagesThisWeek, pagesThisMonth, pagesThisYear
   */
  getPeriodStats: async () => {
    const response = await axiosClient.get('/activities/period-stats');
    return response.data;
  },

  /**
   * Generate AI notes for a book
   * @param {number} id - Book ID
   * @returns {Promise} void
   */
  generateAiNotes: async (id) => {
    const response = await axiosClient.post(`/ai/generate-notes/${id}`);
    return response.data;
  },

  // Extension: Add future methods
  // getBookStats: async () => { ... },
  // searchBooks: async (query) => { ... },
  // getBooksByStatus: async (status) => { ... },
};

export default bookApi;
