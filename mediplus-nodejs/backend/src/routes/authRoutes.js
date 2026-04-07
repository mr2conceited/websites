const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validator');

// Validation rules
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['admin', 'doctor', 'patient']).withMessage('Invalid role'),
  validate
];

const loginValidation = [
  body('email').trim().notEmpty().withMessage('Email/Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  validate
];

// Routes
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getMe);
router.put('/update-profile', authenticate, authController.updateProfile);
router.put('/change-password', authenticate, changePasswordValidation, authController.changePassword);
router.get('/verify-token', authenticate, authController.verifyToken);

module.exports = router;
