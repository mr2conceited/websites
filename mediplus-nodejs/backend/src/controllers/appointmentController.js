const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @route   POST /api/appointments
 * @desc    Book a new appointment
 * @access  Private
 */
const bookAppointment = asyncHandler(async (req, res) => {
  const { doctorId, department, date, time, reason } = req.body;

  // Validate required fields
  if (!doctorId || !department || !date || !time) {
    return res.status(400).json({
      success: false,
      message: 'Please provide doctor, department, date, and time'
    });
  }

  // Verify doctor exists and has correct role
  const doctor = await User.findOne({ _id: doctorId, role: 'doctor', isActive: true });
  if (!doctor) {
    return res.status(404).json({
      success: false,
      message: 'Doctor not found or inactive'
    });
  }

  // Check if slot is available
  const isAvailable = await Appointment.isSlotAvailable(doctorId, date, time);
  if (!isAvailable) {
    return res.status(400).json({
      success: false,
      message: 'This time slot is already booked'
    });
  }

  // Get patient info
  const patient = await User.findById(req.userId);

  // Generate appointmentId manually before validation runs
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substr(2, 5).toUpperCase();
  const generatedId = `APT${timestamp}${random}`;

  // Fix doctor name - avoid duplicate "Dr." prefix
  const doctorDisplayName = doctor.name.startsWith('Dr.') ? doctor.name : `Dr. ${doctor.name}`;

  // Use new + save to ensure pre-save hooks run properly
  const appointment = new Appointment({
    appointmentId: generatedId,
    patient: req.userId,
    patientName: patient.name,
    patientEmail: patient.email,
    patientPhone: patient.phone,
    doctor: doctorId,
    doctorName: doctorDisplayName,
    department,
    date,
    time,
    reason,
    status: 'pending'
  });

  await appointment.save();

  // Populate references
  await appointment.populate('patient', 'name email phone');
  await appointment.populate('doctor', 'name specialization');

  res.status(201).json({
    success: true,
    message: 'Appointment booked successfully',
    data: appointment
  });
});

/**
 * @route   GET /api/appointments
 * @desc    Get appointments (filtered by user role)
 * @access  Private
 */
const getAppointments = asyncHandler(async (req, res) => {
  const { status, date, department, page = 1, limit = 10 } = req.query;

  let query = {};

  // Filter by role
  if (req.userRole === 'patient') {
    query.patient = req.userId;
  } else if (req.userRole === 'doctor') {
    query.doctor = req.userId;
  }

  // Additional filters
  if (status) query.status = status;
  if (department) query.department = department;
  if (date) {
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    query.date = { $gte: startDate, $lte: endDate };
  }

  const appointments = await Appointment.find(query)
    .populate('patient', 'name email phone')
    .populate('doctor', 'name specialization')
    .sort({ date: -1, time: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const count = await Appointment.countDocuments(query);

  res.json({
    success: true,
    data: appointments,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      pages: Math.ceil(count / limit)
    }
  });
});

/**
 * @route   GET /api/appointments/upcoming
 * @desc    Get upcoming appointments
 * @access  Private
 */
const getUpcomingAppointments = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 5;

  const appointments = await Appointment.getUpcoming(req.userId, req.userRole, limit);

  res.json({
    success: true,
    data: appointments
  });
});

/**
 * @route   GET /api/appointments/history
 * @desc    Get appointment history
 * @access  Private
 */
const getAppointmentHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const query = {
    date: { $lt: today },
    status: { $in: ['completed', 'cancelled', 'no-show'] }
  };

  if (req.userRole === 'patient') {
    query.patient = req.userId;
  } else if (req.userRole === 'doctor') {
    query.doctor = req.userId;
  }

  const appointments = await Appointment.find(query)
    .populate('patient', 'name email phone')
    .populate('doctor', 'name specialization')
    .sort({ date: -1, time: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const count = await Appointment.countDocuments(query);

  res.json({
    success: true,
    data: appointments,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      pages: Math.ceil(count / limit)
    }
  });
});

/**
 * @route   GET /api/appointments/:id
 * @desc    Get single appointment
 * @access  Private
 */
const getAppointmentById = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate('patient', 'name email phone address')
    .populate('doctor', 'name specialization email phone');

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found'
    });
  }

  // Check if user has access to this appointment
  const hasAccess = 
    req.userRole === 'admin' ||
    appointment.patient._id.toString() === req.userId.toString() ||
    appointment.doctor._id.toString() === req.userId.toString();

  if (!hasAccess) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  res.json({
    success: true,
    data: appointment
  });
});

/**
 * @route   PUT /api/appointments/:id/confirm
 * @desc    Confirm appointment (doctor/admin only)
 * @access  Private (Doctor/Admin)
 */
const confirmAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found'
    });
  }

  // Check if doctor is the assigned doctor or user is admin
  const canConfirm = 
    req.userRole === 'admin' ||
    (req.userRole === 'doctor' && appointment.doctor.toString() === req.userId.toString());

  if (!canConfirm) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to confirm this appointment'
    });
  }

  if (appointment.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: `Cannot confirm appointment with status: ${appointment.status}`
    });
  }

  await appointment.confirm();

  res.json({
    success: true,
    message: 'Appointment confirmed successfully',
    data: appointment
  });
});

/**
 * @route   PUT /api/appointments/:id/cancel
 * @desc    Cancel appointment
 * @access  Private
 */
const cancelAppointment = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found'
    });
  }

  // Check if user can cancel
  const canCancel = 
    req.userRole === 'admin' ||
    appointment.patient.toString() === req.userId.toString() ||
    appointment.doctor.toString() === req.userId.toString();

  if (!canCancel) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to cancel this appointment'
    });
  }

  if (!appointment.canCancel) {
    return res.status(400).json({
      success: false,
      message: 'Appointment cannot be cancelled (less than 1 hour away or already processed)'
    });
  }

  await appointment.cancel(req.userId, reason || 'No reason provided');

  res.json({
    success: true,
    message: 'Appointment cancelled successfully',
    data: appointment
  });
});

/**
 * @route   PUT /api/appointments/:id/complete
 * @desc    Complete appointment with diagnosis (doctor only)
 * @access  Private (Doctor)
 */
const completeAppointment = asyncHandler(async (req, res) => {
  const { diagnosis, prescription, notes } = req.body;

  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found'
    });
  }

  // Only assigned doctor can complete
  if (appointment.doctor.toString() !== req.userId.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to complete this appointment'
    });
  }

  if (appointment.status !== 'confirmed') {
    return res.status(400).json({
      success: false,
      message: `Cannot complete appointment with status: ${appointment.status}`
    });
  }

  await appointment.complete(diagnosis, prescription, notes);

  res.json({
    success: true,
    message: 'Appointment completed successfully',
    data: appointment
  });
});

/**
 * @route   GET /api/appointments/slots/available
 * @desc    Get available time slots for a doctor on a specific date
 * @access  Public
 */
const getAvailableSlots = asyncHandler(async (req, res) => {
  const { doctorId, date } = req.query;

  if (!doctorId || !date) {
    return res.status(400).json({
      success: false,
      message: 'Please provide doctorId and date'
    });
  }

  const availableSlots = await Appointment.getAvailableSlots(doctorId, date);

  res.json({
    success: true,
    data: availableSlots
  });
});

/**
 * @route   GET /api/appointments/stats
 * @desc    Get appointment statistics
 * @access  Private
 */
const getAppointmentStats = asyncHandler(async (req, res) => {
  let query = {};

  if (req.userRole === 'patient') {
    query.patient = req.userId;
  } else if (req.userRole === 'doctor') {
    query.doctor = req.userId;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const stats = {
    total: await Appointment.countDocuments(query),
    pending: await Appointment.countDocuments({ ...query, status: 'pending' }),
    confirmed: await Appointment.countDocuments({ ...query, status: 'confirmed' }),
    completed: await Appointment.countDocuments({ ...query, status: 'completed' }),
    cancelled: await Appointment.countDocuments({ ...query, status: 'cancelled' }),
    today: await Appointment.countDocuments({
      ...query,
      date: { $gte: today },
      status: { $ne: 'cancelled' }
    }),
    upcoming: await Appointment.countDocuments({
      ...query,
      date: { $gte: today },
      status: { $in: ['pending', 'confirmed'] }
    })
  };

  res.json({
    success: true,
    data: stats
  });
});

module.exports = {
  bookAppointment,
  getAppointments,
  getUpcomingAppointments,
  getAppointmentHistory,
  getAppointmentById,
  confirmAppointment,
  cancelAppointment,
  completeAppointment,
  getAvailableSlots,
  getAppointmentStats
};