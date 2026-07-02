const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes
router.get('/doctors', userController.getAllDoctors);
router.get('/departments', userController.getDepartments);

// Protected routes
router.use(authenticate);

// Specific routes must come before :id parameter routes
router.post('/search', userController.searchUsers);
router.get('/stats/overview', authorize('admin'), userController.getUserStats);

// Admin only routes - general routes
router.get('/', authorize('admin'), userController.getAllUsers);
router.put('/:id', authorize('admin'), userController.updateUser);
router.delete('/:id', authorize('admin'), userController.deleteUser);

// Generic :id route (must be last)
router.get('/:id', userController.getUserById);

module.exports = router;
