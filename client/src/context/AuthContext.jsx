import { createContext, useContext, useState, useEffect } from 'react';
import { login as loginService, register as registerService, logout as logoutService, getUser, getProfile } from '../services/authService';

// Create Auth Context
const AuthContext = createContext(null);

/**
 * AuthProvider Component
 * Provides authentication state and functions to child components
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * Check authentication status on app load
   */
  const checkAuth = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user from localStorage
      const storedUser = getUser();

      if (storedUser) {
        // Verify token is still valid by fetching profile
        try {
          const response = await getProfile();
          // Update user with latest profile data
          setUser(response.data.profile);
        } catch (error) {
          // Token is invalid or expired, clear storage
          logoutService();
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      logoutService();
    } finally {
      setLoading(false);
    }
  };

  /**
   * Login function
   * @param {Object} credentials - { email, password }
   */
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);

      const response = await loginService(credentials);

      if (response.data && response.data.user) {
        setUser(response.data.user);
        return { success: true, data: response.data };
      }

      throw new Error('Login failed: Invalid response');
    } catch (error) {
      const errorMessage = error.message || 'Login failed. Please try again.';
      setError(errorMessage);
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register function
   * @param {Object} userData - { email, password, aadhaar, name }
   */
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await registerService(userData);

      if (response.data && response.data.user) {
        setUser(response.data.user);
        return { success: true, data: response.data };
      }

      throw new Error('Registration failed: Invalid response');
    } catch (error) {
      const errorMessage = error.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout function
   */
  const logout = () => {
    try {
      logoutService();
      setUser(null);
      setError(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  /**
   * Clear error message
   */
  const clearError = () => {
    setError(null);
  };

  /**
   * Fetch user profile (with decrypted Aadhaar)
   */
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getProfile();

      if (response.data && response.data.profile) {
        setUser(response.data.profile);
        return response.data.profile;
      }

      throw new Error('Failed to fetch profile');
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch profile';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    clearError,
    fetchProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use AuthContext
 * @returns {Object} Auth context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

export default AuthContext;