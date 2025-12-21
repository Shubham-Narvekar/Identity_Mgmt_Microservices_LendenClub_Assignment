const { verifyToken, generateToken, decodeToken } = require('./jwt');

/**
 * Token Validation Utility for Testing
 * Provides comprehensive token validation functions for testing purposes
 */

/**
 * Validates a JWT token and returns detailed validation result
 * @param {string} token - The JWT token to validate
 * @returns {Object} - Validation result with status and details
 */
const validateToken = (token) => {
  const result = {
    valid: false,
    decoded: null,
    error: null,
    expired: false,
    invalid: false,
    details: {}
  };

  try {
    if (!token) {
      result.error = 'Token is required';
      result.invalid = true;
      return result;
    }

    // Try to verify the token
    try {
      const decoded = verifyToken(token);
      result.valid = true;
      result.decoded = decoded;
      result.details = {
        userId: decoded.userId,
        email: decoded.email,
        iat: decoded.iat,
        exp: decoded.exp,
        issuer: decoded.iss,
        audience: decoded.aud
      };
    } catch (error) {
      // Token verification failed
      result.error = error.message;
      
      if (error.message.includes('expired')) {
        result.expired = true;
      } else {
        result.invalid = true;
      }

      // Try to decode anyway (for debugging)
      try {
        const decoded = decodeToken(token);
        result.decoded = decoded;
        result.details = {
          userId: decoded?.userId,
          email: decoded?.email,
          expired: true,
          expiredAt: decoded?.exp ? new Date(decoded.exp * 1000).toISOString() : null
        };
      } catch (decodeError) {
        // Token is completely invalid
        result.decoded = null;
      }
    }
  } catch (error) {
    result.error = error.message;
    result.invalid = true;
  }

  return result;
};

/**
 * Validates token structure without verifying signature (for testing)
 * @param {string} token - The JWT token to validate
 * @returns {Object} - Structure validation result
 */
const validateTokenStructure = (token) => {
  const result = {
    validStructure: false,
    hasHeader: false,
    hasPayload: false,
    hasSignature: false,
    parts: [],
    error: null
  };

  try {
    if (!token || typeof token !== 'string') {
      result.error = 'Token must be a non-empty string';
      return result;
    }

    // JWT tokens have 3 parts separated by dots
    const parts = token.split('.');
    result.parts = parts;

    if (parts.length !== 3) {
      result.error = `Invalid token structure. Expected 3 parts, got ${parts.length}`;
      return result;
    }

    result.hasHeader = !!parts[0];
    result.hasPayload = !!parts[1];
    result.hasSignature = !!parts[2];
    result.validStructure = true;
  } catch (error) {
    result.error = error.message;
  }

  return result;
};

/**
 * Validates token expiration (checks if token is expired)
 * @param {string} token - The JWT token to check
 * @returns {Object} - Expiration validation result
 */
const validateTokenExpiration = (token) => {
  const result = {
    expired: false,
    expiresAt: null,
    expiresIn: null,
    isExpiringSoon: false,
    timeUntilExpiry: null,
    error: null
  };

  try {
    const decoded = decodeToken(token);
    
    if (!decoded || !decoded.exp) {
      result.error = 'Token does not have expiration claim';
      return result;
    }

    const expiresAt = new Date(decoded.exp * 1000);
    const now = new Date();
    const timeUntilExpiry = expiresAt.getTime() - now.getTime();

    result.expiresAt = expiresAt.toISOString();
    result.expired = timeUntilExpiry <= 0;
    result.timeUntilExpiry = timeUntilExpiry;
    result.expiresIn = Math.max(0, Math.floor(timeUntilExpiry / 1000)); // seconds
    result.isExpiringSoon = timeUntilExpiry > 0 && timeUntilExpiry < 3600000; // expires in less than 1 hour
  } catch (error) {
    result.error = error.message;
  }

  return result;
};

/**
 * Generates a test token with custom expiration (for testing)
 * Note: This uses the jwt library directly to avoid environment variable issues
 * @param {string} userId - User ID
 * @param {string} email - User email
 * @param {string} expiresIn - Expiration time (e.g., '1h', '30m', '1d')
 * @returns {string} - Generated test token
 */
const generateTestToken = (userId, email, expiresIn = '1h') => {
  const jwt = require('jsonwebtoken');
  const JWT_SECRET = process.env.JWT_SECRET;
  
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  const payload = {
    userId: userId.toString(),
    email: email.toLowerCase().trim()
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: expiresIn,
    issuer: 'identity-management-service',
    audience: 'identity-management-client'
  });
};

/**
 * Comprehensive token validation (all checks)
 * @param {string} token - The JWT token to validate
 * @returns {Object} - Comprehensive validation result
 */
const comprehensiveTokenValidation = (token) => {
  const structure = validateTokenStructure(token);
  const validation = validateToken(token);
  const expiration = validateTokenExpiration(token);

  return {
    structure,
    validation,
    expiration,
    overallValid: structure.validStructure && validation.valid && !expiration.expired,
    summary: {
      hasValidStructure: structure.validStructure,
      isValid: validation.valid,
      isExpired: expiration.expired,
      canBeUsed: structure.validStructure && validation.valid && !expiration.expired
    }
  };
};

module.exports = {
  validateToken,
  validateTokenStructure,
  validateTokenExpiration,
  generateTestToken,
  comprehensiveTokenValidation
};

