const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, username, password, role, phone } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User with this email or username already exists'
    });
  }

  // Create user
  const user = await User.create({
    name,
    email,
    username,
    password,
    role: role || 'patient',
    phone
  });

  // Generate token
  const token = user.generateAuthToken();

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      user: user.getPublicProfile(),
      token
    }
  });
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email/username and password'
    });
  }

  // Find user and validate credentials
  const user = await User.findByCredentials(email, password);

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate token
  const token = user.generateAuthToken();

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: user.getPublicProfile(),
      token
    }
  });
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side token removal)
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
  // In JWT, logout is handled client-side by removing the token
  // This endpoint is for consistency and could be used for logging/analytics
  
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    data: user.getPublicProfile()
  });
});

/**
 * @route   PUT /api/auth/update-profile
 * @desc    Update user profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const allowedUpdates = ['name', 'phone', 'address', 'dateOfBirth', 'gender'];
  const updates = {};

  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No valid fields to update'
    });
  }

  const user = await User.findByIdAndUpdate(
    req.userId,
    updates,
    { new: true, runValidators: true }
  );

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: user.getPublicProfile()
  });
});

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Please provide current password and new password'
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'New password must be at least 6 characters'
    });
  }

  // Get user with password
  const user = await User.findById(req.userId).select('+password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Check current password
  const isPasswordMatch = await user.comparePassword(currentPassword);
  if (!isPasswordMatch) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});

/**
 * @route   POST /api/auth/verify-token
 * @desc    Verify if token is valid
 * @access  Private
 */
const verifyToken = asyncHandler(async (req, res) => {
  // If we reach here, the authenticate middleware has already verified the token
  res.json({
    success: true,
    message: 'Token is valid',
    data: {
      user: req.user.getPublicProfile()
    }
  });
});

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  verifyToken
};
