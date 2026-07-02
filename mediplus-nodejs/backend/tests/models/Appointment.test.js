const Appointment = require('../../src/models/Appointment');
const User = require('../../src/models/User');

describe('Appointment Model', () => {
  let patient, doctor, tomorrow;

  beforeEach(async () => {
    // Create test users
    patient = await User.create({
      name: 'John Patient',
      email: 'patient@example.com',
      username: 'patient123',
      password: 'password123',
      role: 'patient'
    });

    doctor = await User.create({
      name: 'Jane Doctor',
      email: 'doctor@example.com',
      username: 'doctor123',
      password: 'password123',
      role: 'doctor',
      specialization: 'Cardiology'
    });

    tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
  });

  describe('Appointment Creation', () => {
    it('should create an appointment with valid data', async () => {
      const appointmentData = {
        patient: patient._id,
        patientName: patient.name,
        patientEmail: patient.email,
        patientPhone: patient.phone,
        doctor: doctor._id,
        doctorName: doctor.name,
        department: 'Cardiology',
        date: tomorrow,
        time: '10:00'
      };

      const appointment = await Appointment.create(appointmentData);

      expect(appointment).toBeDefined();
      expect(appointment.patient.toString()).toBe(patient._id.toString());
      expect(appointment.doctor.toString()).toBe(doctor._id.toString());
      expect(appointment.status).toBe('pending');
      expect(appointment.appointmentId).toBeDefined();
    });

    it('should generate unique appointment ID', async () => {
      const appointmentData1 = {
        patient: patient._id,
        patientName: patient.name,
        doctor: doctor._id,
        doctorName: doctor.name,
        department: 'Cardiology',
        date: tomorrow,
        time: '10:00'
      };

      const appointmentData2 = {
        patient: patient._id,
        patientName: patient.name,
        doctor: doctor._id,
        doctorName: doctor.name,
        department: 'Cardiology',
        date: tomorrow,
        time: '11:00'
      };

      const apt1 = await Appointment.create(appointmentData1);
      const apt2 = await Appointment.create(appointmentData2);

      expect(apt1.appointmentId).not.toBe(apt2.appointmentId);
    });

    it('should require patient field', async () => {
      const appointmentData = {
        patientName: patient.name,
        doctor: doctor._id,
        doctorName: doctor.name,
        department: 'Cardiology',
        date: tomorrow,
        time: '10:00'
      };

      await expect(Appointment.create(appointmentData)).rejects.toThrow();
    });

    it('should require doctor field', async () => {
      const appointmentData = {
        patient: patient._id,
        patientName: patient.name,
        doctorName: 'Dr. Smith',
        department: 'Cardiology',
        date: tomorrow,
        time: '10:00'
      };

      await expect(Appointment.create(appointmentData)).rejects.toThrow();
    });

    it('should require department field', async () => {
      const appointmentData = {
        patient: patient._id,
        patientName: patient.name,
        doctor: doctor._id,
        doctorName: doctor.name,
        date: tomorrow,
        time: '10:00'
      };

      await expect(Appointment.create(appointmentData)).rejects.toThrow();
    });

    it('should only allow valid departments', async () => {
      const appointmentData = {
        patient: patient._id,
        patientName: patient.name,
        doctor: doctor._id,
        doctorName: doctor.name,
        department: 'Invalid Department',
        date: tomorrow,
        time: '10:00'
      };

      await expect(Appointment.create(appointmentData)).rejects.toThrow();
    });

    it('should not allow past dates', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const appointmentData = {
        patient: patient._id,
        patientName: patient.name,
        doctor: doctor._id,
        doctorName: doctor.name,
        department: 'Cardiology',
        date: pastDate,
        time: '10:00'
      };

      await expect(Appointment.create(appointmentData)).rejects.toThrow();
    });

    it('should validate time format (HH:MM)', async () => {
      const appointmentData = {
        patient: patient._id,
        patientName: patient.name,
        doctor: doctor._id,
        doctorName: doctor.name,
        department: 'Cardiology',
        date: tomorrow,
        time: 'invalid-time'
      };

      await expect(Appointment.create(appointmentData)).rejects.toThrow();
    });

    it('should set default status to pending', async () => {
      const appointmentData = {
        patient: patient._id,
        patientName: patient.name,
        doctor: doctor._id,
        doctorName: doctor.name,
        department: 'Cardiology',
        date: tomorrow,
        time: '10:00'
      };

      const appointment = await Appointment.create(appointmentData);
      expect(appointment.status).toBe('pending');
    });
  });

  describe('Slot Availability', () => {
    it('should return true for available slot', async () => {
      const isAvailable = await Appointment.isSlotAvailable(doctor._id, tomorrow, '10:00');
      expect(isAvailable).toBe(true);
    });

    it('should return false for booked slot', async () => {
      const appointmentData = {
        patient: patient._id,
        patientName: patient.name,
        doctor: doctor._id,
        doctorName: doctor.name,
        department: 'Cardiology',
        date: tomorrow,
        time: '10:00',
        status: 'confirmed'
      };

      await Appointment.create(appointmentData);

      const isAvailable = await Appointment.isSlotAvailable(doctor._id, tomorrow, '10:00');
      expect(isAvailable).toBe(false);
    });

    it('should ignore cancelled appointments when checking availability', async () => {
      const appointmentData = {
        patient: patient._id,
        patientName: patient.name,
        doctor: doctor._id,
        doctorName: doctor.name,
        department: 'Cardiology',
        date: tomorrow,
        time: '10:00',
        status: 'cancelled'
      };

      await Appointment.create(appointmentData);

      const isAvailable = await Appointment.isSlotAvailable(doctor._id, tomorrow, '10:00');
      expect(isAvailable).toBe(true);
    });
  });

  describe('Appointment Status Changes', () => {
    let appointment;

    beforeEach(async () => {
      appointment = await Appointment.create({
        patient: patient._id,
        patientName: patient.name,
        doctor: doctor._id,
        doctorName: doctor.name,
        department: 'Cardiology',
        date: tomorrow,
        time: '10:00'
      });
    });

    it('should confirm appointment', async () => {
      await appointment.confirm();
      expect(appointment.status).toBe('confirmed');
      expect(appointment.confirmedAt).toBeDefined();
    });

    it('should complete appointment', async () => {
      await appointment.confirm();
      await appointment.complete('Diagnosis', 'Prescription', 'Notes');

      expect(appointment.status).toBe('completed');
      expect(appointment.completedAt).toBeDefined();
      expect(appointment.diagnosis).toBe('Diagnosis');
      expect(appointment.prescription).toBe('Prescription');
      expect(appointment.notes).toBe('Notes');
    });

    it('should cancel appointment', async () => {
      await appointment.cancel(doctor._id, 'Doctor unavailable');

      expect(appointment.status).toBe('cancelled');
      expect(appointment.cancelledAt).toBeDefined();
      expect(appointment.cancelledBy.toString()).toBe(doctor._id.toString());
      expect(appointment.cancellationReason).toBe('Doctor unavailable');
    });
  });

  describe('Upcoming Appointments', () => {
    beforeEach(async () => {
      // Create a future appointment
      await Appointment.create({
        patient: patient._id,
        patientName: patient.name,
        doctor: doctor._id,
        doctorName: doctor.name,
        department: 'Cardiology',
        date: tomorrow,
        time: '10:00',
        status: 'pending'
      });

      // Create a past appointment (should not be returned)
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      await Appointment.create({
        patient: patient._id,
        patientName: patient.name,
        doctor: doctor._id,
        doctorName: doctor.name,
        department: 'Cardiology',
        date: pastDate,
        time: '10:00',
        status: 'completed'
      });
    });

    it('should get upcoming appointments for patient', async () => {
      const upcoming = await Appointment.getUpcoming(patient._id, 'patient');
      expect(upcoming.length).toBeGreaterThan(0);
      expect(upcoming[0].patient.toString()).toBe(patient._id.toString());
    });

    it('should get upcoming appointments for doctor', async () => {
      const upcoming = await Appointment.getUpcoming(doctor._id, 'doctor');
      expect(upcoming.length).toBeGreaterThan(0);
      expect(upcoming[0].doctor.toString()).toBe(doctor._id.toString());
    });

    it('should populate patient and doctor fields', async () => {
      const upcoming = await Appointment.getUpcoming(patient._id, 'patient');
      expect(upcoming[0].patient).toBeDefined();
      expect(upcoming[0].patient.name).toBe(patient.name);
      expect(upcoming[0].doctor).toBeDefined();
    });
  });

  describe('Formatted Date Virtual', () => {
    it('should provide formatted date', async () => {
      const appointment = await Appointment.create({
        patient: patient._id,
        patientName: patient.name,
        doctor: doctor._id,
        doctorName: doctor.name,
        department: 'Cardiology',
        date: tomorrow,
        time: '10:00'
      });

      expect(appointment.formattedDate).toBeDefined();
      expect(typeof appointment.formattedDate).toBe('string');
    });
  });

  describe('Validation Messages', () => {
    it('should have clear validation error messages', async () => {
      const appointmentData = {
        patientName: patient.name,
        doctor: doctor._id,
        doctorName: doctor.name,
        department: 'Cardiology',
        date: tomorrow,
        time: '10:00'
      };

      try {
        await Appointment.create(appointmentData);
      } catch (error) {
        expect(error.message).toContain('Patient is required');
      }
    });
  });
});
