const bcrypt = require('bcrypt');

// Salt rounds for password hashing (10 is a good balance between security and performance)
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;

/**
 * Hashes a plain text password using bcrypt
 * @param {string} password - The plain text password to hash
 * @returns {Promise<string>} - The hashed password
 */
const hashPassword = async (password) => {
  try {
    if (!password) {
      throw new Error('Password cannot be empty');
    }

    if (typeof password !== 'string') {
      throw new Error('Password must be a string');
    }

    // Generate salt and hash the password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    return hashedPassword;
  } catch (error) {
    throw new Error(`Password hashing failed: ${error.message}`);
  }
};

/**
 * Compares a plain text password with a hashed password
 * @param {string} password - The plain text password to compare
 * @param {string} hashedPassword - The hashed password to compare against
 * @returns {Promise<boolean>} - True if passwords match, false otherwise
 */
const comparePassword = async (password, hashedPassword) => {
  try {
    if (!password || !hashedPassword) {
      throw new Error('Password and hashed password are required');
    }

    // Compare the plain password with the hashed password
    const isMatch = await bcrypt.compare(password, hashedPassword);

    return isMatch;
  } catch (error) {
    throw new Error(`Password comparison failed: ${error.message}`);
  }
};

module.exports = {
  hashPassword,
  comparePassword
};