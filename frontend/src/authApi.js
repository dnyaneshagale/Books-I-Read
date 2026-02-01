import axiosClient from './api/axiosClient';

/**
 * Authentication API
 * Handles user registration and login
 */
const authApi = {
  /**
   * Register a new user
   * @param {Object} data - { username, email, password }
   * @returns {Promise} - { token, type, id, username, email }
   */
  register: (data) => {
    return axiosClient.post('/auth/register', data);
  },

  /**
   * Login user
   * @param {Object} data - { username, password }
   * @returns {Promise} - { token, type, id, username, email }
   */
  login: (data) => {
    return axiosClient.post('/auth/login', data);
  },

  /**
   * Validate current token
   * @returns {Promise} - 200 if valid, 401/403 if invalid
   */
  validate: () => {
    return axiosClient.get('/auth/validate');
  },
};

export default authApi;
