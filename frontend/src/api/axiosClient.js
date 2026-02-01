import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 10000,
});

/**
 * Request Interceptor
 * Add authentication token to headers
 */
axiosClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage and add to request
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handle authentication errors and global error handling
 */
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle specific error cases
    if (error.response) {
      const isAuthError = error.response.status === 401 || error.response.status === 403;
      
      // Only log non-auth errors to avoid clutter
      if (!isAuthError) {
        console.error('API Error Response:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      }
      
      // Handle 401/403 - Invalid or expired token
      if (isAuthError) {
        // Clear invalid token
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Emit logout event for AuthContext to handle
        window.dispatchEvent(new CustomEvent('auth:logout'));
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('Network Error:', error.request);
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
