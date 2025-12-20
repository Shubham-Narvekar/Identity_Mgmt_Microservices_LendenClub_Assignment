const userService = require('../services/userService');
const { generateToken } = require('../utils/jwt');
const { AuthenticationError } = require('../middleware/errorHandler');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Register a new user
 * POST /api/auth/register
 * 
 * Request Body:
 * {
 *   "email": "user@example.com",
 *   "password": "SecurePass123",
 *   "aadhaar": "123456789012",
 *   "name": "John Doe" (optional)
 * }
 */
const register = asyncHandler(async (req, res, next) => {
  const { email, password, aadhaar, name } = req.body;

  // Create user (password is hashed and Aadhaar is encrypted in service)
  const user = await userService.createUser({
    email,
    password,
    aadhaar,
    name
  });

  // Generate JWT token
  const token = generateToken(user._id.toString(), user.email);

  // Return success response with token and user data
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt
      }
    }
  });
});

/**
 * Login user
 * POST /api/auth/login
 * 
 * Request Body:
 * {
 *   "email": "user@example.com",
 *   "password": "SecurePass123"
 * }
 */
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Find user by email (include password for verification)
  const user = await userService.findUserByEmail(email, true);

  // Check if user exists
  if (!user) {
    throw new AuthenticationError('Invalid email or password');
  }

  // Verify password
  const isPasswordValid = await userService.verifyPassword(password, user.password);

  if (!isPasswordValid) {
    throw new AuthenticationError('Invalid email or password');
  }

  // Generate JWT token
  const token = generateToken(user._id.toString(), user.email);

  // Return success response with token and user data
  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt
      }
    }
  });
});

module.exports = {
  register,
  login
};