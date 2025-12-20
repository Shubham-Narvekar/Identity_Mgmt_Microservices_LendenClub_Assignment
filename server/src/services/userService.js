const User = require('../models/User');
const { hashPassword, comparePassword } = require('../utils/passwordHash');
const { encrypt, decrypt } = require('../utils/encryption');
const { NotFoundError, ValidationError } = require('../middleware/errorHandler');

/**
 * Create a new user
 * @param {Object} userData - User data containing email, password, aadhaar, and optional name
 * @returns {Promise<Object>} - Created user object (without sensitive data)
 */
const createUser = async (userData) => {
  try {
    const { email, password, aadhaar, name } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      throw new ValidationError('User with this email already exists');
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Encrypt the Aadhaar number
    const encryptedAadhaar = encrypt(aadhaar);

    // Create user object
    const newUser = new User({
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      encryptedAadhaar: encryptedAadhaar,
      name: name ? name.trim() : undefined
    });

    // Save user to database
    const savedUser = await newUser.save();

    // Return user without sensitive data (transform is handled by schema)
    return {
      _id: savedUser._id,
      email: savedUser.email,
      name: savedUser.name,
      createdAt: savedUser.createdAt,
      updatedAt: savedUser.updatedAt
    };
  } catch (error) {
    // Re-throw known errors
    if (error instanceof ValidationError) {
      throw error;
    }

    // Handle MongoDB duplicate key error
    if (error.code === 11000 || error.message.includes('duplicate')) {
      throw new ValidationError('User with this email already exists');
    }

    // Handle validation errors from Mongoose
    if (error.name === 'ValidationError') {
      throw new ValidationError(error.message);
    }

    // Handle other errors
    throw new Error(`Failed to create user: ${error.message}`);
  }
};

/**
 * Find user by email (includes password for login verification)
 * @param {string} email - User's email address
 * @param {boolean} includePassword - Whether to include password in result (default: false)
 * @returns {Promise<Object|null>} - User object or null if not found
 */
const findUserByEmail = async (email, includePassword = false) => {
  try {
    const query = User.findOne({ email: email.toLowerCase().trim() });

    // Include password if needed (for login verification)
    if (includePassword) {
      query.select('+password');
    }

    const user = await query.exec();

    return user;
  } catch (error) {
    throw new Error(`Failed to find user: ${error.message}`);
  }
};

/**
 * Find user by ID
 * @param {string} userId - User's ID
 * @returns {Promise<Object|null>} - User object or null if not found
 */
const findUserById = async (userId) => {
  try {
    const user = await User.findById(userId);

    return user;
  } catch (error) {
    if (error.name === 'CastError') {
      throw new ValidationError('Invalid user ID format');
    }
    throw new Error(`Failed to find user: ${error.message}`);
  }
};

/**
 * Get user profile with decrypted Aadhaar
 * @param {string} userId - User's ID
 * @returns {Promise<Object>} - User profile with decrypted Aadhaar
 */
const getUserProfile = async (userId) => {
  try {
    // Find user by ID
    const user = await findUserById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Decrypt Aadhaar number
    let decryptedAadhaar = null;
    try {
      decryptedAadhaar = decrypt(user.encryptedAadhaar);
    } catch (error) {
      throw new Error(`Failed to decrypt Aadhaar: ${error.message}`);
    }

    // Return profile with decrypted Aadhaar
    return {
      _id: user._id,
      email: user.email,
      name: user.name,
      aadhaar: decryptedAadhaar, // Decrypted Aadhaar
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  } catch (error) {
    // Re-throw known errors
    if (error instanceof NotFoundError || error instanceof ValidationError) {
      throw error;
    }

    // Handle other errors
    throw new Error(`Failed to get user profile: ${error.message}`);
  }
};

/**
 * Verify user password (for login)
 * @param {string} plainPassword - Plain text password
 * @param {string} hashedPassword - Hashed password from database
 * @returns {Promise<boolean>} - True if password matches, false otherwise
 */
const verifyPassword = async (plainPassword, hashedPassword) => {
  try {
    const isMatch = await comparePassword(plainPassword, hashedPassword);
    return isMatch;
  } catch (error) {
    throw new Error(`Password verification failed: ${error.message}`);
  }
};

/**
 * Update user profile (optional - for future use)
 * @param {string} userId - User's ID
 * @param {Object} updateData - Data to update (name, etc.)
 * @returns {Promise<Object>} - Updated user object
 */
const updateUserProfile = async (userId, updateData) => {
  try {
    const user = await findUserById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Update allowed fields
    if (updateData.name !== undefined) {
      user.name = updateData.name.trim();
    }

    const updatedUser = await user.save();

    return {
      _id: updatedUser._id,
      email: updatedUser.email,
      name: updatedUser.name,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt
    };
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ValidationError) {
      throw error;
    }
    throw new Error(`Failed to update user profile: ${error.message}`);
  }
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  getUserProfile,
  verifyPassword,
  updateUserProfile
};