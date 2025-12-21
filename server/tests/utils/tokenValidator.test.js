const {
  validateToken,
  validateTokenStructure,
  validateTokenExpiration,
  generateTestToken,
  comprehensiveTokenValidation
} = require('../../src/utils/tokenValidator');
const { generateToken, verifyToken } = require('../../src/utils/jwt');

describe('Token Validator Utility Tests', () => {
  let validToken;
  let testUserId;
  let testEmail;

  beforeAll(() => {
    testUserId = '507f1f77bcf86cd799439011';
    testEmail = 'test@example.com';
    validToken = generateToken(testUserId, testEmail);
  });

  describe('validateTokenStructure', () => {
    test('should validate correct token structure', () => {
      const result = validateTokenStructure(validToken);
      
      expect(result.validStructure).toBe(true);
      expect(result.hasHeader).toBe(true);
      expect(result.hasPayload).toBe(true);
      expect(result.hasSignature).toBe(true);
      expect(result.parts.length).toBe(3);
      expect(result.error).toBeNull();
    });

    test('should reject token with invalid structure (missing parts)', () => {
      const invalidToken = 'invalid.token';
      const result = validateTokenStructure(invalidToken);
      
      expect(result.validStructure).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.parts.length).toBe(2);
    });

    test('should reject empty token', () => {
      const result = validateTokenStructure('');
      
      expect(result.validStructure).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should reject null token', () => {
      const result = validateTokenStructure(null);
      
      expect(result.validStructure).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should reject non-string token', () => {
      const result = validateTokenStructure(12345);
      
      expect(result.validStructure).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('validateToken', () => {
    test('should validate correct token', () => {
      const result = validateToken(validToken);
      
      expect(result.valid).toBe(true);
      expect(result.decoded).toBeDefined();
      expect(result.decoded.userId).toBe(testUserId);
      expect(result.decoded.email).toBe(testEmail);
      expect(result.error).toBeNull();
      expect(result.expired).toBe(false);
      expect(result.invalid).toBe(false);
      expect(result.details.userId).toBe(testUserId);
      expect(result.details.email).toBe(testEmail);
    });

    test('should reject empty token', () => {
      const result = validateToken('');
      
      expect(result.valid).toBe(false);
      expect(result.invalid).toBe(true);
      expect(result.error).toBeDefined();
    });

    test('should reject null token', () => {
      const result = validateToken(null);
      
      expect(result.valid).toBe(false);
      expect(result.invalid).toBe(true);
      expect(result.error).toBeDefined();
    });

    test('should reject invalid token', () => {
      const invalidToken = 'invalid.token.here';
      const result = validateToken(invalidToken);
      
      expect(result.valid).toBe(false);
      expect(result.invalid).toBe(true);
      expect(result.error).toBeDefined();
    });

    test('should handle expired token', () => {
      // Generate an expired token (1 second expiration, then wait)
      const expiredToken = generateTestToken(testUserId, testEmail, '1s');
      
      // Wait for token to expire
      return new Promise((resolve) => {
        setTimeout(() => {
          const result = validateToken(expiredToken);
          
          expect(result.valid).toBe(false);
          expect(result.expired).toBe(true);
          expect(result.error).toBeDefined();
          expect(result.decoded).toBeDefined(); // Should still decode for debugging
          resolve();
        }, 2000);
      });
    });

    test('should return correct token details', () => {
      const result = validateToken(validToken);
      
      expect(result.details).toBeDefined();
      expect(result.details.userId).toBe(testUserId);
      expect(result.details.email).toBe(testEmail);
      expect(result.details.issuer).toBe('identity-management-service');
      expect(result.details.audience).toBe('identity-management-client');
      expect(result.details.iat).toBeDefined();
      expect(result.details.exp).toBeDefined();
    });
  });

  describe('validateTokenExpiration', () => {
    test('should validate non-expired token', () => {
      const result = validateTokenExpiration(validToken);
      
      expect(result.expired).toBe(false);
      expect(result.expiresAt).toBeDefined();
      expect(result.timeUntilExpiry).toBeGreaterThan(0);
      expect(result.error).toBeNull();
    });

    test('should detect expired token', () => {
      const expiredToken = generateTestToken(testUserId, testEmail, '1s');
      
      return new Promise((resolve) => {
        setTimeout(() => {
          const result = validateTokenExpiration(expiredToken);
          
          expect(result.expired).toBe(true);
          expect(result.timeUntilExpiry).toBeLessThanOrEqual(0);
          resolve();
        }, 2000);
      });
    });

    test('should calculate expiration time correctly', () => {
      const result = validateTokenExpiration(validToken);
      
      expect(result.expiresAt).toBeDefined();
      expect(result.expiresIn).toBeGreaterThan(0);
      expect(result.timeUntilExpiry).toBeGreaterThan(0);
    });

    test('should detect token expiring soon', () => {
      const shortLivedToken = generateTestToken(testUserId, testEmail, '30s');
      const result = validateTokenExpiration(shortLivedToken);
      
      // Token expires in 30 seconds, which is less than 1 hour
      expect(result.isExpiringSoon).toBe(true);
    });

    test('should handle invalid token gracefully', () => {
      const result = validateTokenExpiration('invalid.token.here');
      
      expect(result.error).toBeDefined();
    });
  });

  describe('generateTestToken', () => {
    test('should generate test token with custom expiration', () => {
      const token = generateTestToken(testUserId, testEmail, '1h');
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      
      const validation = validateToken(token);
      expect(validation.valid).toBe(true);
    });

    test('should generate token with different expiration times', () => {
      const token1h = generateTestToken(testUserId, testEmail, '1h');
      const token30m = generateTestToken(testUserId, testEmail, '30m');
      
      expect(token1h).not.toBe(token30m);
      
      const exp1h = validateTokenExpiration(token1h);
      const exp30m = validateTokenExpiration(token30m);
      
      expect(exp1h.expiresIn).toBeGreaterThan(exp30m.expiresIn);
    });
  });

  describe('comprehensiveTokenValidation', () => {
    test('should perform comprehensive validation on valid token', () => {
      const result = comprehensiveTokenValidation(validToken);
      
      expect(result.structure).toBeDefined();
      expect(result.validation).toBeDefined();
      expect(result.expiration).toBeDefined();
      expect(result.overallValid).toBe(true);
      expect(result.summary.hasValidStructure).toBe(true);
      expect(result.summary.isValid).toBe(true);
      expect(result.summary.isExpired).toBe(false);
      expect(result.summary.canBeUsed).toBe(true);
    });

    test('should detect invalid token structure', () => {
      const result = comprehensiveTokenValidation('invalid.token');
      
      expect(result.overallValid).toBe(false);
      expect(result.summary.hasValidStructure).toBe(false);
      expect(result.summary.canBeUsed).toBe(false);
    });

    test('should detect expired token', () => {
      const expiredToken = generateTestToken(testUserId, testEmail, '1s');
      
      return new Promise((resolve) => {
        setTimeout(() => {
          const result = comprehensiveTokenValidation(expiredToken);
          
          expect(result.overallValid).toBe(false);
          expect(result.summary.isExpired).toBe(true);
          expect(result.summary.canBeUsed).toBe(false);
          resolve();
        }, 2000);
      });
    });

    test('should provide detailed summary', () => {
      const result = comprehensiveTokenValidation(validToken);
      
      expect(result.summary).toBeDefined();
      expect(typeof result.summary.hasValidStructure).toBe('boolean');
      expect(typeof result.summary.isValid).toBe('boolean');
      expect(typeof result.summary.isExpired).toBe('boolean');
      expect(typeof result.summary.canBeUsed).toBe('boolean');
    });
  });

  describe('Edge Cases', () => {
    test('should handle tokens with different user IDs', () => {
      const token1 = generateToken('user1', 'user1@test.com');
      const token2 = generateToken('user2', 'user2@test.com');
      
      const result1 = validateToken(token1);
      const result2 = validateToken(token2);
      
      expect(result1.valid).toBe(true);
      expect(result2.valid).toBe(true);
      expect(result1.details.userId).not.toBe(result2.details.userId);
    });

    test('should handle tokens with different emails', () => {
      const token1 = generateToken(testUserId, 'user1@test.com');
      const token2 = generateToken(testUserId, 'user2@test.com');
      
      const result1 = validateToken(token1);
      const result2 = validateToken(token2);
      
      expect(result1.valid).toBe(true);
      expect(result2.valid).toBe(true);
      expect(result1.details.email).not.toBe(result2.details.email);
    });
  });
});

