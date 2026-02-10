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

  /**
   * Request password reset
   * @param {Object} data - { email }
   * @returns {Promise} - Success message
   * @note Backend endpoint needs to be implemented at /auth/reset-password
   */
  resetPassword: (data) => {
    return axiosClient.post('/auth/reset-password', data);
  },

  /**
   * Check if a username is available
   * @param {string} username
   * @returns {Promise} - { available: boolean, username: string }
   */
  checkUsername: (username) => {
    return axiosClient.get(`/auth/check-username/${encodeURIComponent(username)}`);
  },
};

/**
 * Confirm password reset with token
 * @param {Object} data - { token, newPassword }
 * @returns {Promise} - Success message
 */
export const resetPasswordConfirm = (data) => {
  return axiosClient.post('/auth/reset-password/confirm', data);
};

export default authApi;
