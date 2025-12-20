const userService = require('../services/userService');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Get user profile with decrypted Aadhaar
 * GET /api/profile
 * 
 * Requires: Authentication token in Authorization header
 * Headers: Authorization: Bearer <token>
 */
const getProfile = asyncHandler(async (req, res, next) => {
  // Get userId from req.user (set by authenticateToken middleware)
  const userId = req.user.userId;

  // Get user profile with decrypted Aadhaar
  const profile = await userService.getUserProfile(userId);

  // Return success response with profile data
  res.status(200).json({
    success: true,
    message: 'Profile retrieved successfully',
    data: {
      profile: {
        _id: profile._id,
        email: profile.email,
        name: profile.name,
        aadhaar: profile.aadhaar, // Decrypted Aadhaar
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt
      }
    }
  });
});

module.exports = {
  getProfile
};