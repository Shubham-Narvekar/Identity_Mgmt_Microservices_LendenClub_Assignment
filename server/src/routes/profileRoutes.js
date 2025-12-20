const express = require('express');
const router = express.Router();
const { getProfile } = require('../controllers/profileController');
const { authenticateToken } = require('../middleware/auth');

/**
 * @route   GET /api/profile
 * @desc    Get user profile with decrypted Aadhaar
 * @access  Private (requires authentication)
 * 
 * Headers:
 * Authorization: Bearer <token>
 */
router.get('/', authenticateToken, getProfile);

module.exports = router;