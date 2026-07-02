const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc Update own profile
// @route PUT /api/users/me
// @access Private
const updateMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  user.name = req.body.name || user.name;
  user.avatar = req.body.avatar || user.avatar;
  if (req.body.password) user.password = req.body.password;

  const updated = await user.save();
  res.json({
    success: true,
    user: { id: updated._id, name: updated.name, email: updated.email, role: updated.role },
  });
});

// @desc Add/update address
// @route POST /api/users/me/addresses
// @access Private
const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (req.body.isDefault) {
    user.addresses.forEach((a) => (a.isDefault = false));
  }
  user.addresses.push(req.body);
  await user.save();
  res.status(201).json({ success: true, addresses: user.addresses });
});

// @desc Delete address
// @route DELETE /api/users/me/addresses/:addressId
// @access Private
const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses = user.addresses.filter((a) => a._id.toString() !== req.params.addressId);
  await user.save();
  res.json({ success: true, addresses: user.addresses });
});

// @desc Toggle wishlist item
// @route POST /api/users/me/wishlist/:productId
// @access Private
const toggleWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const idx = user.wishlist.findIndex((p) => p.toString() === req.params.productId);
  if (idx > -1) {
    user.wishlist.splice(idx, 1);
  } else {
    user.wishlist.push(req.params.productId);
  }
  await user.save();
  res.json({ success: true, wishlist: user.wishlist });
});

// --- Admin ---

// @desc Get all users
// @route GET /api/users
// @access Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password');
  res.json({ success: true, users });
});

// @desc Delete user
// @route DELETE /api/users/:id
// @access Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  await user.deleteOne();
  res.json({ success: true, message: 'User removed' });
});

// @desc Update user role
// @route PUT /api/users/:id/role
// @access Private/Admin
const updateUserRole = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  user.role = req.body.role;
  await user.save();
  res.json({ success: true, user });
});

module.exports = {
  updateMe,
  addAddress,
  deleteAddress,
  toggleWishlist,
  getUsers,
  deleteUser,
  updateUserRole,
};
