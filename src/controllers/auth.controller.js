const jwt = require('jsonwebtoken');
const { AppError } = require('../middleware/error.middleware');
const User = require('../models/user.model');

// Generate JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// Create and send token response
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user }
  });
};

// Register new user
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, passwordConfirm } = req.body;

    // Validate required fields
    if (!name || !email || !password || !passwordConfirm) {
      return next(new AppError('Please provide all required fields', 400));
    }

    // Validate email format
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return next(new AppError('Please provide a valid email address', 400));
    }

    // Validate password strength
    if (password.length < 8) {
      return next(new AppError('Password must be at least 8 characters long', 400));
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email already in use', 400));
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      passwordConfirm
    });

    createSendToken(user, 201, res);
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    // Validate email format
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return next(new AppError('Please provide a valid email address', 400));
    }

    // Check if user exists && password is correct
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new AppError('No user found with this email', 401));
    }

    // Check if password is correct
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return next(new AppError('Incorrect password', 401));
    }

    createSendToken(user, 200, res);
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

// Get current user
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

// Update user profile
exports.updateMe = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    // Validate at least one field is provided
    if (!name && !email) {
      return next(new AppError('Please provide at least one field to update', 400));
    }

    // Validate email format if provided
    if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return next(new AppError('Please provide a valid email address', 400));
    }

    // Check if email is already in use
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.user.id } });
      if (existingUser) {
        return next(new AppError('Email already in use', 400));
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name, email },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { user: updatedUser }
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

// Delete user account
exports.deleteMe = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.user.id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
}; 