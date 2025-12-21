const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';

/**
 * Get and validate encryption key
 * Validates lazily (when needed) to allow test setup to configure it first
 */
const getEncryptionKey = () => {
  const ENCRYPTION_KEY = process.env.AES_SECRET_KEY;

  if (!ENCRYPTION_KEY) {
    throw new Error('AES_SECRET_KEY is not defined in environment variables');
  }

  if (ENCRYPTION_KEY.length !== 32) {
    throw new Error(
      `AES_SECRET_KEY must be exactly 32 characters long for AES-256. ` +
      `Current length: ${ENCRYPTION_KEY.length}`
    );
  }

  return ENCRYPTION_KEY;
};

/**
 * Encrypts data using AES-256-CBC
 * @param {string} text - The plain text to encrypt
 * @returns {string} - Encrypted data in format: iv:encryptedData (both base64 encoded)
 */
const encrypt = (text) => {
  try {
    // Check if text is empty, null, undefined, or whitespace-only
    if (!text || (typeof text === 'string' && text.trim().length === 0)) {
      throw new Error('Text to encrypt cannot be empty');
    }

    // Get and validate encryption key
    const ENCRYPTION_KEY = getEncryptionKey();

    // Generate a random 16-byte IV (Initialization Vector)
    const iv = crypto.randomBytes(16);

    // Create cipher using AES-256-CBC algorithm
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);

    // Encrypt the text
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    // Combine IV and encrypted data, separated by colon
    // Both are base64 encoded for easy storage
    const result = `${iv.toString('base64')}:${encrypted}`;

    return result;
  } catch (error) {
    throw new Error(`Encryption failed: ${error.message}`);
  }
};

/**
 * Decrypts data using AES-256-CBC
 * @param {string} encryptedData - Encrypted data in format: iv:encryptedData
 * @returns {string} - Decrypted plain text
 */
const decrypt = (encryptedData) => {
  try {
    if (!encryptedData) {
      throw new Error('Encrypted data cannot be empty');
    }

    // Get and validate encryption key
    const ENCRYPTION_KEY = getEncryptionKey();

    // Split IV and encrypted data
    const parts = encryptedData.split(':');
    
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted data format. Expected format: iv:encryptedData');
    }

    const [ivBase64, encrypted] = parts;

    // Convert IV from base64 to buffer
    const iv = Buffer.from(ivBase64, 'base64');

    // Create decipher using AES-256-CBC algorithm
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);

    // Decrypt the data
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    throw new Error(`Decryption failed: ${error.message}`);
  }
};

module.exports = {
  encrypt,
  decrypt
};