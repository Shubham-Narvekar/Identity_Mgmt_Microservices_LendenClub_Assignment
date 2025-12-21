# Testing Documentation

This directory contains unit tests for the Identity Management Microservice backend.

## Setup

1. Install dependencies:
```bash
pnpm install
# or
npm install
```

2. Ensure test environment variables are set (see `setup.js` for defaults):
- `JWT_SECRET` - Secret key for JWT tokens (min 32 characters)
- `AES_SECRET_KEY` - Secret key for AES encryption (exactly 32 characters)
- `JWT_EXPIRES_IN` - Token expiration time (default: '7d')
- `MONGODB_URI` - MongoDB connection string (optional for unit tests)

## Running Tests

### Run all tests:
```bash
pnpm test
# or
npm test
```

### Run tests in watch mode:
```bash
pnpm test:watch
# or
npm run test:watch
```

### Run tests with coverage:
```bash
pnpm test:coverage
# or
npm run test:coverage
```

### Run specific test file:
```bash
pnpm test tests/utils/encryption.test.js
```

## Test Structure

```
tests/
├── setup.js                    # Test configuration and setup
├── utils/
│   ├── encryption.test.js      # Encryption/decryption tests
│   └── tokenValidator.test.js  # Token validation tests
└── README.md                   # This file
```

## Test Utilities

### Token Validator (`src/utils/tokenValidator.js`)

Utility functions for comprehensive token validation:

- `validateToken(token)` - Validates token and returns detailed result
- `validateTokenStructure(token)` - Validates JWT token structure
- `validateTokenExpiration(token)` - Checks token expiration
- `generateTestToken(userId, email, expiresIn)` - Generates test tokens
- `comprehensiveTokenValidation(token)` - Performs all validation checks

### Example Usage:

```javascript
const { validateToken, comprehensiveTokenValidation } = require('../src/utils/tokenValidator');

// Validate a token
const result = validateToken(token);
if (result.valid) {
  console.log('Token is valid:', result.details);
} else {
  console.log('Token error:', result.error);
}

// Comprehensive validation
const comprehensive = comprehensiveTokenValidation(token);
console.log('Overall valid:', comprehensive.overallValid);
console.log('Summary:', comprehensive.summary);
```

## Test Coverage

Current test coverage includes:

1. **Encryption Tests** (`encryption.test.js`):
   - Encrypt function tests
   - Decrypt function tests
   - Encrypt-decrypt round trip tests
   - Edge cases (empty strings, special characters, unicode)
   - Security tests (data integrity, format validation)

2. **Token Validator Tests** (`tokenValidator.test.js`):
   - Token structure validation
   - Token verification
   - Token expiration checks
   - Test token generation
   - Comprehensive validation
   - Edge cases

## Writing New Tests

1. Create test file in appropriate directory: `tests/`
2. Import functions to test
3. Use Jest's `describe` and `test`/`it` blocks
4. Follow existing test patterns

Example:
```javascript
const { functionToTest } = require('../../src/utils/moduleToTest');

describe('Module Tests', () => {
  test('should do something', () => {
    const result = functionToTest(input);
    expect(result).toBe(expected);
  });
});
```

## Notes

- Tests run in `test` environment by default
- Test environment variables are set in `setup.js`
- Timeout is set to 10 seconds for async operations
- Coverage reports are generated in `coverage/` directory

