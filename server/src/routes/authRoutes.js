const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middleware/validator');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 * 
 * Request Body:
 * {
 *   "email": "user@example.com",
 *   "password": "SecurePass123",
 *   "aadhaar": "123456789012",
 *   "name": "John Doe" (optional)
 * }
 */
router.post('/register', validateRegister, register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and get JWT token
 * @access  Public
 * 
 * Request Body:
 * {
 *   "email": "user@example.com",
 *   "password": "SecurePass123"
 * }
 */
router.post('/login', validateLogin, login);

module.exports = router;