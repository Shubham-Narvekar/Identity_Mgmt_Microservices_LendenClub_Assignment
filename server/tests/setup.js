// Test setup file
// This file runs BEFORE test framework is installed (setupFiles)
// Set environment variables BEFORE any modules are loaded

// Set test environment variables
process.env.NODE_ENV = 'test';

// Only set if not already set (allows override via .env or command line)
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-purposes-only-min-32-chars';
}

// Set AES_SECRET_KEY - use test value if not set or if invalid length
// Must be exactly 32 characters for AES-256
if (!process.env.AES_SECRET_KEY || process.env.AES_SECRET_KEY.length !== 32) {
  // This is exactly 32 characters: "0123456789abcdef0123456789abcdef"
  process.env.AES_SECRET_KEY = '0123456789abcdef0123456789abcdef';
}

if (!process.env.JWT_EXPIRES_IN) {
  process.env.JWT_EXPIRES_IN = '7d';
}

if (!process.env.MONGODB_URI) {
  process.env.MONGODB_URI = 'mongodb://localhost:27017/identity-management-test';
}

