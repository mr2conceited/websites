const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @route   GET /api/users
 * @desc    Get all users (admin only)
 * @access  Private (Admin)
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const { role, isActive, page = 1, limit = 10, search } = req.query;

  let query = {};

  if (role) query.role = role;
  if (isActive !== undefined) query.isActive = isActive === 'true';
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { username: { $regex: search, $options: 'i' } }
    ];
  }

  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const count = await User.countDocuments(query);

  res.json({
    success: true,
    data: users,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      pages: Math.ceil(count / limit)
    }
  });
});

/**
 * @route   GET /api/users/doctors
 * @desc    Get all doctors
 * @access  Public
 */
const getAllDoctors = asyncHandler(async (req, res) => {
  const { department, page = 1, limit = 20 } = req.query;

  let query = { role: 'doctor', isActive: true };

  if (department) {
    query.specialization = { $regex: department, $options: 'i' };
  }

  const doctors = await User.find(query)
    .select('name email specialization experience phone profileImage')
    .sort({ name: 1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const count = await User.countDocuments(query);

  res.json({
    success: true,
    data: doctors,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      pages: Math.ceil(count / limit)
    }
  });
});

/**
 * @route   GET /api/users/departments
 * @desc    Get list of departments
 * @access  Public
 */
const getDepartments = asyncHandler(async (req, res) => {
  const departments = await User.distinct('specialization', {
    role: 'doctor',
    isActive: true,
    specialization: { $exists: true, $ne: null }
  });

  res.json({
    success: true,
    data: departments.filter(dept => dept) // Remove null/empty values
  });
});

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private
 */
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Only admins or the user themselves can view full profile
  if (req.userRole !== 'admin' && req.userId.toString() !== req.params.id) {
    // Return limited public info
    return res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        role: user.role,
        specialization: user.specialization,
        experience: user.experience
      }
    });
  }

  res.json({
    success: true,
    data: user
  });
});

/**
 * @route   PUT /api/users/:id
 * @desc    Update user (admin only)
 * @access  Private (Admin)
 */
const updateUser = asyncHandler(async (req, res) => {
  const allowedUpdates = ['name', 'email', 'phone', 'address', 'role', 'isActive', 'specialization', 'experience'];
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
    req.params.id,
    updates,
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    message: 'User updated successfully',
    data: user
  });
});

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user (admin only)
 * @access  Private (Admin)
 */
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Don't allow deleting yourself
  if (req.userId.toString() === req.params.id) {
    return res.status(400).json({
      success: false,
      message: 'You cannot delete your own account'
    });
  }

  await User.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});

/**
 * @route   GET /api/users/stats/overview
 * @desc    Get user statistics (admin only)
 * @access  Private (Admin)
 */
const getUserStats = asyncHandler(async (req, res) => {
  const stats = {
    total: await User.countDocuments(),
    patients: await User.countDocuments({ role: 'patient' }),
    doctors: await User.countDocuments({ role: 'doctor' }),
    admins: await User.countDocuments({ role: 'admin' }),
    active: await User.countDocuments({ isActive: true }),
    inactive: await User.countDocuments({ isActive: false })
  };

  res.json({
    success: true,
    data: stats
  });
});

/**
 * @route   POST /api/users/search
 * @desc    Search users
 * @access  Private
 */
const searchUsers = asyncHandler(async (req, res) => {
  const { query, role, limit = 20 } = req.body;

  if (!query || query.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Search query must be at least 2 characters'
    });
  }

  let searchQuery = {
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } },
      { username: { $regex: query, $options: 'i' } }
    ],
    isActive: true
  };

  if (role) {
    searchQuery.role = role;
  }

  const users = await User.find(searchQuery)
    .select('name email username role specialization')
    .limit(parseInt(limit));

  res.json({
    success: true,
    data: users
  });
});

module.exports = {
  getAllUsers,
  getAllDoctors,
  getDepartments,
  getUserById,
  updateUser,
  deleteUser,
  getUserStats,
  searchUsers
};
