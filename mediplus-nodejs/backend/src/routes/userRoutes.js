const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes
router.get('/doctors', userController.getAllDoctors);
router.get('/departments', userController.getDepartments);

// Protected routes
router.use(authenticate);

router.get('/:id', userController.getUserById);
router.post('/search', userController.searchUsers);

// Admin only routes
router.get('/', authorize('admin'), userController.getAllUsers);
router.put('/:id', authorize('admin'), userController.updateUser);
router.delete('/:id', authorize('admin'), userController.deleteUser);
router.get('/stats/overview', authorize('admin'), userController.getUserStats);

module.exports = router;
