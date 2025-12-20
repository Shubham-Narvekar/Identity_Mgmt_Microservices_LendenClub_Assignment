const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address'
      ]
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false // Don't return password in queries by default
    },
    encryptedAadhaar: {
      type: String,
      required: [true, 'Aadhaar number is required']
      // This will store the encrypted Aadhaar + IV
    },
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    }
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    toJSON: {
      transform: function(doc, ret) {
        // Remove sensitive fields from JSON output
        delete ret.password;
        delete ret.encryptedAadhaar;
        delete ret.__v;
        return ret;
      }
    },
    toObject: {
      transform: function(doc, ret) {
        // Remove sensitive fields from object output
        delete ret.password;
        delete ret.encryptedAadhaar;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Index for faster email lookups
userSchema.index({ email: 1 });

// Prevent duplicate emails
userSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    next(new Error('Email already exists'));
  } else {
    next(error);
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;