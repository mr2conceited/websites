const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  appointmentId: {
    type: String,
    unique: true,
    required: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Patient is required']
  },
  patientName: {
    type: String,
    required: true
  },
  patientEmail: {
    type: String
  },
  patientPhone: {
    type: String
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Doctor is required']
  },
  doctorName: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: [
      'Cardiology',
      'Neurology', 
      'Orthopedics',
      'Pediatrics',
      'General Medicine',
      'Dermatology',
      'ENT',
      'Ophthalmology',
      'Psychiatry',
      'Radiology'
    ]
  },
  date: {
    type: Date,
    required: [true, 'Appointment date is required'],
    validate: {
      validator: function(value) {
        // Date should not be in the past
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return value >= today;
      },
      message: 'Appointment date cannot be in the past'
    }
  },
  time: {
    type: String,
    required: [true, 'Appointment time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide valid time in HH:MM format']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'],
    default: 'pending'
  },
  reason: {
    type: String,
    trim: true,
    maxlength: [500, 'Reason cannot exceed 500 characters']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  diagnosis: {
    type: String,
    trim: true
  },
  prescription: {
    type: String,
    trim: true
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancelledAt: {
    type: Date
  },
  cancellationReason: {
    type: String,
    trim: true
  },
  confirmedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
appointmentSchema.index({ patient: 1, date: -1 });
appointmentSchema.index({ doctor: 1, date: 1 });
appointmentSchema.index({ date: 1, time: 1, doctor: 1 }, { unique: true });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ appointmentId: 1 });
appointmentSchema.index({ department: 1 });

// Generate unique appointment ID before saving
appointmentSchema.pre('save', async function(next) {
  if (!this.appointmentId) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    this.appointmentId = `APT${timestamp}${random}`;
  }
  next();
});

// Static method to check slot availability
appointmentSchema.statics.isSlotAvailable = async function(doctorId, date, time, excludeId = null) {
  const query = {
    doctor: doctorId,
    date: new Date(date),
    time: time,
    status: { $ne: 'cancelled' }
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const existing = await this.findOne(query);
  return !existing;
};

// Static method to get available time slots
appointmentSchema.statics.getAvailableSlots = async function(doctorId, date) {
  // Default working hours (should come from doctor profile in production)
  const workingHours = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

  // Get booked slots for the day
  const bookedAppointments = await this.find({
    doctor: doctorId,
    date: new Date(date),
    status: { $ne: 'cancelled' }
  }).select('time');

  const bookedSlots = bookedAppointments.map(apt => apt.time);

  // Return available slots
  return workingHours.filter(slot => !bookedSlots.includes(slot));
};

// Static method to get upcoming appointments
appointmentSchema.statics.getUpcoming = async function(userId, role, limit = 10) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const query = {
    date: { $gte: today },
    status: { $in: ['pending', 'confirmed'] }
  };

  if (role === 'patient') {
    query.patient = userId;
  } else if (role === 'doctor') {
    query.doctor = userId;
  }

  return this.find(query)
    .sort({ date: 1, time: 1 })
    .limit(limit)
    .populate('patient', 'name email phone')
    .populate('doctor', 'name specialization');
};

// Instance method to cancel appointment
appointmentSchema.methods.cancel = function(userId, reason) {
  this.status = 'cancelled';
  this.cancelledBy = userId;
  this.cancelledAt = new Date();
  this.cancellationReason = reason;
  return this.save();
};

// Instance method to confirm appointment
appointmentSchema.methods.confirm = function() {
  this.status = 'confirmed';
  this.confirmedAt = new Date();
  return this.save();
};

// Instance method to complete appointment
appointmentSchema.methods.complete = function(diagnosis, prescription, notes) {
  this.status = 'completed';
  this.completedAt = new Date();
  if (diagnosis) this.diagnosis = diagnosis;
  if (prescription) this.prescription = prescription;
  if (notes) this.notes = notes;
  return this.save();
};

// Virtual for formatted date
appointmentSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual to check if appointment is upcoming
appointmentSchema.virtual('isUpcoming').get(function() {
  const now = new Date();
  const appointmentDateTime = new Date(this.date);
  const [hours, minutes] = this.time.split(':');
  appointmentDateTime.setHours(parseInt(hours), parseInt(minutes));
  
  return appointmentDateTime > now && ['pending', 'confirmed'].includes(this.status);
});

// Virtual to check if appointment can be cancelled
appointmentSchema.virtual('canCancel').get(function() {
  const now = new Date();
  const appointmentDateTime = new Date(this.date);
  const [hours, minutes] = this.time.split(':');
  appointmentDateTime.setHours(parseInt(hours), parseInt(minutes));
  
  // Can cancel if appointment is more than 1 hour away
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
  return appointmentDateTime > oneHourFromNow && ['pending', 'confirmed'].includes(this.status);
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
