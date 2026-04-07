const express = require('express');
const { body, query } = require('express-validator');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validator');

// Validation rules
const bookAppointmentValidation = [
  body('doctorId').notEmpty().withMessage('Doctor is required'),
  body('department').notEmpty().withMessage('Department is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time in HH:MM format is required'),
  validate
];

const completeAppointmentValidation = [
  body('diagnosis').optional().isString(),
  body('prescription').optional().isString(),
  body('notes').optional().isString(),
  validate
];

// Public routes
router.get('/slots/available', appointmentController.getAvailableSlots);

// Protected routes - All authenticated users
router.use(authenticate);

router.post('/', bookAppointmentValidation, appointmentController.bookAppointment);
router.get('/', appointmentController.getAppointments);
router.get('/upcoming', appointmentController.getUpcomingAppointments);
router.get('/history', appointmentController.getAppointmentHistory);
router.get('/stats', appointmentController.getAppointmentStats);
router.get('/:id', appointmentController.getAppointmentById);
router.put('/:id/cancel', appointmentController.cancelAppointment);

// Doctor/Admin only routes
router.put('/:id/confirm', authorize('doctor', 'admin'), appointmentController.confirmAppointment);
router.put('/:id/complete', authorize('doctor'), completeAppointmentValidation, appointmentController.completeAppointment);

module.exports = router;
