import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 60000, // 60 seconds for AI operations
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
      
      // Handle 401/403 - Invalid or expired token
      if (isAuthError) {
        // Clear invalid token
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Emit logout event for AuthContext to handle
        window.dispatchEvent(new CustomEvent('auth:logout'));
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
