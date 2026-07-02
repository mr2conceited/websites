const crypto = require('crypto');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { generateToken, sendTokenCookie } = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide name, email and password');
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({ name, email, password });

  const token = generateToken(user._id);
  sendTokenCookie(res, token);

  res.status(201).json({
    success: true,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    token,
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const token = generateToken(user._id);
  sendTokenCookie(res, token);

  res.json({
    success: true,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    token,
  });
});

// @desc    Google auth login / register
// @route   POST /api/auth/google
// @access  Public
const googleAuthUser = asyncHandler(async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    res.status(400);
    throw new Error('Google credential is required');
  }

  const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
  const payload = await response.json();

  if (!response.ok || !payload.email || payload.email_verified !== 'true') {
    res.status(401);
    throw new Error('Google authentication failed');
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (clientId && payload.aud && payload.aud !== clientId) {
    res.status(401);
    throw new Error('Google authentication failed');
  }

  let user = await User.findOne({ email: payload.email.toLowerCase() });

  if (!user) {
    user = await User.create({
      name: payload.name || payload.email.split('@')[0],
      email: payload.email.toLowerCase(),
      password: crypto.randomBytes(24).toString('hex'),
      avatar: payload.picture || '',
    });
  } else if (!user.avatar && payload.picture) {
    user.avatar = payload.picture;
    await user.save();
  }

  const token = generateToken(user._id);
  sendTokenCookie(res, token);

  res.json({
    success: true,
    user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    token,
  });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie(process.env.COOKIE_NAME);
  res.json({ success: true, message: 'Logged out' });
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = { registerUser, loginUser, googleAuthUser, logoutUser, getMe };
