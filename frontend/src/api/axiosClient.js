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
      const { status, config } = error.response;
      const isAuthError = status === 401 || status === 403;
      
      // Skip auth redirect for login/register/reset-password requests
      const authPaths = ['/auth/login', '/auth/register', '/auth/reset-password', '/auth/forgot-password'];
      const isAuthRequest = authPaths.some((p) => config.url?.includes(p));

      // Handle 401/403 - Invalid or expired token (only for authenticated requests)
      if (isAuthError && !isAuthRequest && localStorage.getItem('token')) {
        // Clear invalid token
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Emit logout event for AuthContext to handle + redirect
        window.dispatchEvent(new CustomEvent('auth:logout', { detail: { expired: true } }));
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
