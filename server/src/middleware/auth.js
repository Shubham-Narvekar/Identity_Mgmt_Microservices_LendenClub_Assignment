const { verifyToken } = require('../utils/jwt');
const { AuthenticationError } = require('./errorHandler');

/**
 * JWT Authentication Middleware
 * Verifies JWT token from Authorization header and attaches user info to request
 * 
 * Usage:
 * router.get('/protected-route', authenticateToken, controller);
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    // Check if Authorization header exists
    if (!authHeader) {
      throw new AuthenticationError('Authorization header is missing. Please provide a token.');
    }

    // Check if header starts with 'Bearer '
    if (!authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Invalid authorization format. Use: Bearer <token>');
    }

    // Extract token (remove 'Bearer ' prefix)
    const token = authHeader.substring(7); // 'Bearer '.length = 7

    // Check if token exists after 'Bearer '
    if (!token || token.trim() === '') {
      throw new AuthenticationError('Token is missing. Please provide a valid token.');
    }

    // Verify and decode the token
    const decoded = verifyToken(token);

    // Attach user information to request object
    req.user = {
      userId: decoded.userId,
      email: decoded.email
    };

    // Continue to next middleware/route handler
    next();
  } catch (error) {
    // If error is already an AuthenticationError, pass it along
    if (error instanceof AuthenticationError) {
      return next(error);
    }

    // Handle JWT-specific errors
    if (error.message.includes('expired')) {
      return next(new AuthenticationError('Token has expired. Please login again.'));
    }

    if (error.message.includes('Invalid token') || error.message.includes('Token')) {
      return next(new AuthenticationError('Invalid token. Please login again.'));
    }

    // Handle any other errors
    return next(new AuthenticationError('Authentication failed. Please login again.'));
  }
};

/**
 * Optional: Middleware to check if user is authenticated (doesn't throw error if not)
 * Useful for optional authentication routes
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      if (token && token.trim() !== '') {
        const decoded = verifyToken(token);
        req.user = {
          userId: decoded.userId,
          email: decoded.email
        };
      }
    }

    // Continue regardless of authentication status
    next();
  } catch (error) {
    // If token is invalid, just continue without user info
    // This allows the route to work for both authenticated and unauthenticated users
    next();
  }
};

/**
 * Optional: Middleware to extract user info from token without throwing errors
 * Useful for logging or analytics
 */
const extractUserInfo = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      if (token && token.trim() !== '') {
        try {
          const decoded = verifyToken(token);
          req.user = {
            userId: decoded.userId,
            email: decoded.email
          };
        } catch (error) {
          // Silently fail - don't attach user info
          req.user = null;
        }
      }
    }

    next();
  } catch (error) {
    // Continue without user info
    next();
  }
};

module.exports = {
  authenticateToken,
  optionalAuth,
  extractUserInfo
};