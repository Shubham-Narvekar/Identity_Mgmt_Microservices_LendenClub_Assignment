const jwt = require('jsonwebtoken');

// Get JWT configuration from environment variables
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Validate JWT secret
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

/**
 * Generates a JWT token for a user
 * @param {string} userId - The user's ID from database
 * @param {string} email - The user's email
 * @returns {string} - The generated JWT token
 */
const generateToken = (userId, email) => {
  try {
    if (!userId || !email) {
      throw new Error('UserId and email are required to generate token');
    }

    // Create payload with user information
    const payload = {
      userId: userId.toString(), // Ensure it's a string
      email: email.toLowerCase().trim()
    };

    // Generate token with payload, secret, and expiration
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'identity-management-service',
      audience: 'identity-management-client'
    });

    return token;
  } catch (error) {
    throw new Error(`Token generation failed: ${error.message}`);
  }
};

/**
 * Verifies and decodes a JWT token
 * @param {string} token - The JWT token to verify
 * @returns {object} - Decoded token payload (contains userId and email)
 * @throws {Error} - If token is invalid, expired, or malformed
 */
const verifyToken = (token) => {
  try {
    if (!token) {
      throw new Error('Token is required');
    }

    // Verify and decode the token
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'identity-management-service',
      audience: 'identity-management-client'
    });

    return decoded;
  } catch (error) {
    // Handle specific JWT errors
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired. Please login again.');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token. Please login again.');
    } else if (error.name === 'NotBeforeError') {
      throw new Error('Token not active yet.');
    } else {
      throw new Error(`Token verification failed: ${error.message}`);
    }
  }
};

/**
 * Decodes a JWT token without verification (use with caution)
 * Useful for debugging or extracting payload from expired tokens
 * @param {string} token - The JWT token to decode
 * @returns {object} - Decoded token payload
 */
const decodeToken = (token) => {
  try {
    if (!token) {
      throw new Error('Token is required');
    }

    // Decode without verification (doesn't check signature or expiration)
    const decoded = jwt.decode(token);

    return decoded;
  } catch (error) {
    throw new Error(`Token decoding failed: ${error.message}`);
  }
};

module.exports = {
  generateToken,
  verifyToken,
  decodeToken
};