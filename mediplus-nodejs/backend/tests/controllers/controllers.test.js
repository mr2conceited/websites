const request = require('supertest');
const express = require('express');
const authController = require('../../src/controllers/authController');
const appointmentController = require('../../src/controllers/appointmentController');
const userController = require('../../src/controllers/userController');
const User = require('../../src/models/User');
const Appointment = require('../../src/models/Appointment');
const { asyncHandler } = require('../../src/middleware/errorHandler');

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(express.json());

  // Auth Routes for testing
  app.post('/auth/register', authController.register);
  app.post('/auth/login', authController.login);
  app.post('/auth/logout', (req, res, next) => {
    req.userId = 'test-id';
    authController.logout(req, res, next);
  });

  return app;
};

describe('Auth Controller', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          username: 'johndoe',
          password: 'password123',
          phone: '1234567890'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('john@example.com');
      expect(response.body.data.token).toBeDefined();
    });

    it('should reject registration with existing email', async () => {
      await User.create({
        name: 'Existing User',
        email: 'existing@example.com',
        username: 'existing',
        password: 'password123'
      });

      const response = await request(app)
        .post('/auth/register')
        .send({
          name: 'John Doe',
          email: 'existing@example.com',
          username: 'johndoe',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject registration with existing username', async () => {
      await User.create({
        name: 'Existing User',
        email: 'existing@example.com',
        username: 'existing',
        password: 'password123'
      });

      const response = await request(app)
        .post('/auth/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          username: 'existing',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should set default role to patient', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          username: 'johndoe',
          password: 'password123'
        });

      expect(response.body.data.user.role).toBe('patient');
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      await User.create({
        name: 'John Doe',
        email: 'john@example.com',
        username: 'johndoe',
        password: 'password123'
      });
    });

    it('should login user with email and password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'john@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('john@example.com');
      expect(response.body.data.token).toBeDefined();
    });

    it('should login user with username and password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'johndoe',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should reject login with incorrect password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'john@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject login with non-existent user', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should update lastLogin timestamp', async () => {
      const userBefore = await User.findOne({ email: 'john@example.com' });
      const lastLoginBefore = userBefore.lastLogin;

      await new Promise(resolve => setTimeout(resolve, 100));

      await request(app)
        .post('/auth/login')
        .send({
          email: 'john@example.com',
          password: 'password123'
        });

      const userAfter = await User.findOne({ email: 'john@example.com' });
      expect(userAfter.lastLogin).not.toEqual(lastLoginBefore);
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/auth/logout');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logged out successfully');
    });
  });
});

describe('User Controller', () => {
  let adminUser, testUser;

  beforeEach(async () => {
    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      username: 'admin',
      password: 'password123',
      role: 'admin'
    });

    testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
      role: 'patient'
    });
  });

  describe('getAllUsers', () => {
    it('should get all users', async () => {
      const app = express();
      app.use(express.json());
      app.get('/users', async (req, res, next) => {
        await userController.getAllUsers(req, res, next);
      });

      const response = await request(app).get('/users');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.pagination).toBeDefined();
    });

    it('should filter users by role', async () => {
      const app = express();
      app.use(express.json());
      app.get('/users', async (req, res, next) => {
        await userController.getAllUsers(req, res, next);
      });

      const response = await request(app).get('/users?role=admin');

      expect(response.status).toBe(200);
      expect(response.body.data.every(user => user.role === 'admin')).toBe(true);
    });

    it('should search users by name', async () => {
      const app = express();
      app.use(express.json());
      app.get('/users', async (req, res, next) => {
        await userController.getAllUsers(req, res, next);
      });

      const response = await request(app).get('/users?search=Admin');

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should support pagination', async () => {
      const app = express();
      app.use(express.json());
      app.get('/users', async (req, res, next) => {
        await userController.getAllUsers(req, res, next);
      });

      const response = await request(app).get('/users?page=1&limit=5');

      expect(response.status).toBe(200);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
    });
  });

  describe('getAllDoctors', () => {
    beforeEach(async () => {
      await User.create({
        name: 'Dr. Jane Smith',
        email: 'doctor1@example.com',
        username: 'doctor1',
        password: 'password123',
        role: 'doctor',
        specialization: 'Cardiology',
        isActive: true
      });

      await User.create({
        name: 'Dr. John Brown',
        email: 'doctor2@example.com',
        username: 'doctor2',
        password: 'password123',
        role: 'doctor',
        specialization: 'Neurology',
        isActive: true
      });
    });

    it('should get all active doctors', async () => {
      const app = express();
      app.use(express.json());
      app.get('/doctors', async (req, res, next) => {
        await userController.getAllDoctors(req, res, next);
      });

      const response = await request(app).get('/doctors');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].role).toBeUndefined(); // password excluded
    });

    it('should filter doctors by department', async () => {
      const app = express();
      app.use(express.json());
      app.get('/doctors', async (req, res, next) => {
        await userController.getAllDoctors(req, res, next);
      });

      const response = await request(app).get('/doctors?department=Cardiology');

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });
});

describe('Appointment Controller', () => {
  let patient, doctor, app;

  beforeEach(async () => {
    patient = await User.create({
      name: 'John Patient',
      email: 'patient@example.com',
      username: 'patient123',
      password: 'password123',
      role: 'patient'
    });

    doctor = await User.create({
      name: 'Dr. Jane Doctor',
      email: 'doctor@example.com',
      username: 'doctor123',
      password: 'password123',
      role: 'doctor',
      specialization: 'Cardiology',
      isActive: true
    });

    app = express();
    app.use(express.json());
  });

  describe('bookAppointment', () => {
    it('should book appointment successfully', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const req = {
        userId: patient._id,
        body: {
          doctorId: doctor._id,
          department: 'Cardiology',
          date: tomorrow,
          time: '10:00',
          reason: 'Regular checkup'
        }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await appointmentController.bookAppointment(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: expect.stringContaining('booked')
        })
      );
    });

    it('should reject if doctor not found', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const req = {
        userId: patient._id,
        body: {
          doctorId: '000000000000000000000000',
          department: 'Cardiology',
          date: tomorrow,
          time: '10:00'
        }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await appointmentController.bookAppointment(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should reject if slot not available', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Book an appointment first
      await Appointment.create({
        patient: patient._id,
        patientName: patient.name,
        doctor: doctor._id,
        doctorName: doctor.name,
        department: 'Cardiology',
        date: tomorrow,
        time: '10:00',
        status: 'confirmed'
      });

      const req = {
        userId: patient._id,
        body: {
          doctorId: doctor._id,
          department: 'Cardiology',
          date: tomorrow,
          time: '10:00'
        }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await appointmentController.bookAppointment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'This time slot is already booked'
        })
      );
    });
  });
});
