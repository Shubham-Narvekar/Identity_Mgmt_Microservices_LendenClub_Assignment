import api from './api';

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.email - User email
 * @param {string} userData.password - User password
 * @param {string} userData.aadhaar - Aadhaar number (12 digits)
 * @param {string} [userData.name] - User name (optional)
 * @returns {Promise<Object>} - Response with token and user data
 */
export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    
    // Store token and user data in localStorage
    if (response.data && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  } catch (error) {
    // Re-throw error so it can be handled by the component
    throw error;
  }
};

/**
 * Login user
 * @param {Object} credentials - User login credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - User password
 * @returns {Promise<Object>} - Response with token and user data
 */
export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    
    // Store token and user data in localStorage
    if (response.data && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  } catch (error) {
    // Re-throw error so it can be handled by the component
    throw error;
  }
};

/**
 * Logout user
 * Removes token and user data from localStorage
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/**
 * Get stored token from localStorage
 * @returns {string|null} - JWT token or null if not found
 */
export const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Get stored user data from localStorage
 * @returns {Object|null} - User object or null if not found
 */
export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

/**
 * Check if user is authenticated
 * @returns {boolean} - True if token exists, false otherwise
 */
export const isAuthenticated = () => {
  return !!getToken();
};

/**
 * Get user profile (protected route)
 * @returns {Promise<Object>} - User profile with decrypted Aadhaar
 */
export const getProfile = async () => {
  try {
    const response = await api.get('/profile');
    return response;
  } catch (error) {
    // Re-throw error so it can be handled by the component
    throw error;
  }
};