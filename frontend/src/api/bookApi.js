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
    try {
      const response = await axiosClient.get('/books');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get a single book by ID
   * @param {number} id - Book ID
   * @returns {Promise} Book object
   */
  getBookById: async (id) => {
    try {
      const response = await axiosClient.get(`/books/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create a new book
   * @param {Object} bookData - Book details {title, author, totalPages, pagesRead}
   * @returns {Promise} Created book
   */
  createBook: async (bookData) => {
    try {
      const response = await axiosClient.post('/books', bookData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update a book (including progress)
   * @param {number} id - Book ID
   * @param {Object} bookData - Updated book details
   * @returns {Promise} Updated book
   */
  updateBook: async (id, bookData) => {
    try {
      const response = await axiosClient.put(`/books/${id}`, bookData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete a book
   * @param {number} id - Book ID
   * @returns {Promise} void
   */
  deleteBook: async (id) => {
    try {
      await axiosClient.delete(`/books/${id}`);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get all reading activity dates for streak calculation
   * @returns {Promise} Object with activityDates array
   */
  getActivityDates: async () => {
    try {
      const response = await axiosClient.get('/activities/dates');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get daily reading statistics for the last 7 days
   * @returns {Promise} Object with dailyStats array
   */
  getDailyStats: async () => {
    try {
      const response = await axiosClient.get('/activities/daily-stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get pages read for week/month/year periods
   * @returns {Promise} Object with pagesThisWeek, pagesThisMonth, pagesThisYear
   */
  getPeriodStats: async () => {
    try {
      const response = await axiosClient.get('/activities/period-stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Extension: Add future methods
  // getBookStats: async () => { ... },
  // searchBooks: async (query) => { ... },
  // getBooksByStatus: async (status) => { ... },
};

export default bookApi;
