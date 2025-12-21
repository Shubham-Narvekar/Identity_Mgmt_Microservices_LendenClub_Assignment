const { encrypt, decrypt } = require('../../src/utils/encryption');

describe('Encryption Utility Tests', () => {
  // Test data
  const testData = {
    aadhaar: '123456789012',
    email: 'test@example.com',
    longText: 'A'.repeat(1000),
    specialChars: '!@#$%^&*()_+-=[]{}|;:",.<>?',
    unicode: '测试 テスト 🚀',
    numbers: '9876543210',
    mixed: 'Abc123!@# Test 测试'
  };

  describe('Encrypt Function', () => {
    test('should encrypt plain text successfully', () => {
      const encrypted = encrypt(testData.aadhaar);
      
      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('string');
      expect(encrypted.length).toBeGreaterThan(0);
      expect(encrypted).not.toBe(testData.aadhaar);
    });

    test('should produce different encrypted values for same input (due to random IV)', () => {
      const encrypted1 = encrypt(testData.aadhaar);
      const encrypted2 = encrypt(testData.aadhaar);
      
      // Should be different due to random IV
      expect(encrypted1).not.toBe(encrypted2);
    });

    test('should encrypt Aadhaar number correctly', () => {
      const encrypted = encrypt(testData.aadhaar);
      
      expect(encrypted).toContain(':');
      const parts = encrypted.split(':');
      expect(parts.length).toBe(2);
    });

    test('should encrypt email addresses', () => {
      const encrypted = encrypt(testData.email);
      
      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(testData.email);
      expect(encrypted).toContain(':');
    });

    test('should encrypt long text', () => {
      const encrypted = encrypt(testData.longText);
      
      expect(encrypted).toBeDefined();
      expect(encrypted.length).toBeGreaterThan(testData.longText.length);
    });

    test('should encrypt special characters', () => {
      const encrypted = encrypt(testData.specialChars);
      
      expect(encrypted).toBeDefined();
      expect(encrypted).toContain(':');
    });

    test('should encrypt unicode characters', () => {
      const encrypted = encrypt(testData.unicode);
      
      expect(encrypted).toBeDefined();
      expect(encrypted).toContain(':');
    });

    test('should throw error for empty string', () => {
      expect(() => encrypt('')).toThrow();
      expect(() => encrypt('')).toThrow('Text to encrypt cannot be empty');
    });

    test('should throw error for null input', () => {
      expect(() => encrypt(null)).toThrow();
    });

    test('should throw error for undefined input', () => {
      expect(() => encrypt(undefined)).toThrow();
    });
  });

  describe('Decrypt Function', () => {
    test('should decrypt encrypted text correctly', () => {
      const encrypted = encrypt(testData.aadhaar);
      const decrypted = decrypt(encrypted);
      
      expect(decrypted).toBe(testData.aadhaar);
    });

    test('should decrypt Aadhaar number correctly', () => {
      const encrypted = encrypt(testData.aadhaar);
      const decrypted = decrypt(encrypted);
      
      expect(decrypted).toBe(testData.aadhaar);
      expect(decrypted.length).toBe(12);
      expect(/^\d{12}$/.test(decrypted)).toBe(true);
    });

    test('should decrypt email addresses correctly', () => {
      const encrypted = encrypt(testData.email);
      const decrypted = decrypt(encrypted);
      
      expect(decrypted).toBe(testData.email);
    });

    test('should decrypt long text correctly', () => {
      const encrypted = encrypt(testData.longText);
      const decrypted = decrypt(encrypted);
      
      expect(decrypted).toBe(testData.longText);
      expect(decrypted.length).toBe(testData.longText.length);
    });

    test('should decrypt special characters correctly', () => {
      const encrypted = encrypt(testData.specialChars);
      const decrypted = decrypt(encrypted);
      
      expect(decrypted).toBe(testData.specialChars);
    });

    test('should decrypt unicode characters correctly', () => {
      const encrypted = encrypt(testData.unicode);
      const decrypted = decrypt(encrypted);
      
      expect(decrypted).toBe(testData.unicode);
    });

    test('should decrypt numbers correctly', () => {
      const encrypted = encrypt(testData.numbers);
      const decrypted = decrypt(encrypted);
      
      expect(decrypted).toBe(testData.numbers);
    });

    test('should decrypt mixed content correctly', () => {
      const encrypted = encrypt(testData.mixed);
      const decrypted = decrypt(encrypted);
      
      expect(decrypted).toBe(testData.mixed);
    });

    test('should throw error for empty string', () => {
      expect(() => decrypt('')).toThrow();
      expect(() => decrypt('')).toThrow('Encrypted data cannot be empty');
    });

    test('should throw error for invalid format (no colon)', () => {
      expect(() => decrypt('invalidformat')).toThrow();
      expect(() => decrypt('invalidformat')).toThrow('Invalid encrypted data format');
    });

    test('should throw error for invalid format (multiple colons)', () => {
      expect(() => decrypt('part1:part2:part3')).toThrow();
    });

    test('should throw error for null input', () => {
      expect(() => decrypt(null)).toThrow();
    });

    test('should throw error for undefined input', () => {
      expect(() => decrypt(undefined)).toThrow();
    });

    test('should throw error for invalid base64 IV', () => {
      expect(() => decrypt('invalidBase64:encryptedData')).toThrow();
    });

    test('should throw error for invalid encrypted data', () => {
      const validIV = Buffer.alloc(16).toString('base64');
      expect(() => decrypt(`${validIV}:invalidEncryptedData`)).toThrow();
    });
  });

  describe('Encrypt-Decrypt Round Trip', () => {
    test('should maintain data integrity after encrypt-decrypt cycle', () => {
      const original = testData.aadhaar;
      const encrypted = encrypt(original);
      const decrypted = decrypt(encrypted);
      
      expect(decrypted).toBe(original);
    });

    test('should handle multiple encrypt-decrypt cycles', () => {
      let data = testData.aadhaar;
      
      for (let i = 0; i < 5; i++) {
        const encrypted = encrypt(data);
        data = decrypt(encrypted);
      }
      
      expect(data).toBe(testData.aadhaar);
    });

    test('should handle different data types correctly', () => {
      const testCases = [
        testData.aadhaar,
        testData.email,
        testData.longText,
        testData.specialChars,
        testData.unicode,
        testData.numbers,
        testData.mixed
      ];

      testCases.forEach(testCase => {
        const encrypted = encrypt(testCase);
        const decrypted = decrypt(encrypted);
        expect(decrypted).toBe(testCase);
      });
    });

    test('should produce consistent results for same data', () => {
      const encrypted1 = encrypt(testData.aadhaar);
      const encrypted2 = encrypt(testData.aadhaar);
      
      // Encrypted values should be different (due to random IV)
      expect(encrypted1).not.toBe(encrypted2);
      
      // But both should decrypt to the same value
      expect(decrypt(encrypted1)).toBe(testData.aadhaar);
      expect(decrypt(encrypted2)).toBe(testData.aadhaar);
    });
  });

  describe('Edge Cases', () => {
    test('should handle single character', () => {
      const encrypted = encrypt('a');
      const decrypted = decrypt(encrypted);
      expect(decrypted).toBe('a');
    });

    test('should handle very long strings', () => {
      const longString = 'A'.repeat(10000);
      const encrypted = encrypt(longString);
      const decrypted = decrypt(encrypted);
      expect(decrypted).toBe(longString);
    });

    test('should handle strings with newlines', () => {
      const textWithNewlines = 'Line 1\nLine 2\nLine 3';
      const encrypted = encrypt(textWithNewlines);
      const decrypted = decrypt(encrypted);
      expect(decrypted).toBe(textWithNewlines);
    });

    test('should handle strings with tabs', () => {
      const textWithTabs = 'Column1\tColumn2\tColumn3';
      const encrypted = encrypt(textWithTabs);
      const decrypted = decrypt(encrypted);
      expect(decrypted).toBe(textWithTabs);
    });

    test('should handle empty strings after trimming', () => {
      expect(() => encrypt('   ')).toThrow();
    });
  });

  describe('Security Tests', () => {
    test('encrypted data should not contain original text', () => {
      const original = testData.aadhaar;
      const encrypted = encrypt(original);
      
      expect(encrypted).not.toContain(original);
      expect(encrypted.toLowerCase()).not.toContain(original.toLowerCase());
    });

    test('different inputs should produce different encrypted outputs', () => {
      const encrypted1 = encrypt('123456789012');
      const encrypted2 = encrypt('123456789013');
      
      expect(encrypted1).not.toBe(encrypted2);
    });

    test('encrypted format should be consistent (iv:data)', () => {
      const encrypted = encrypt(testData.aadhaar);
      const parts = encrypted.split(':');
      
      expect(parts.length).toBe(2);
      expect(parts[0].length).toBeGreaterThan(0); // IV
      expect(parts[1].length).toBeGreaterThan(0); // Encrypted data
    });

    test('IV should be valid base64 and 16 bytes when decoded', () => {
      const encrypted = encrypt(testData.aadhaar);
      const parts = encrypted.split(':');
      const iv = Buffer.from(parts[0], 'base64');
      
      expect(iv.length).toBe(16); // 16 bytes for AES-256-CBC
    });
  });
});

