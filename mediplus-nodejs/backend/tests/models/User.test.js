const User = require('../../src/models/User');

describe('User Model', () => {
  describe('User Creation', () => {
    it('should create a user with valid data', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        username: 'johndoe',
        password: 'password123',
        role: 'patient',
        phone: '1234567890'
      };

      const user = await User.create(userData);

      expect(user).toBeDefined();
      expect(user.name).toBe('John Doe');
      expect(user.email).toBe('john@example.com');
      expect(user.username).toBe('johndoe');
      expect(user.role).toBe('patient');
      expect(user._id).toBeDefined();
    });

    it('should require name field', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123'
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should require email field', async () => {
      const userData = {
        name: 'Test User',
        username: 'testuser',
        password: 'password123'
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should require unique email', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        username: 'johndoe1',
        password: 'password123'
      };

      await User.create(userData);

      const duplicateUser = {
        name: 'Jane Doe',
        email: 'john@example.com',
        username: 'janedoe',
        password: 'password456'
      };

      await expect(User.create(duplicateUser)).rejects.toThrow();
    });

    it('should require unique username', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        username: 'johndoe',
        password: 'password123'
      };

      await User.create(userData);

      const duplicateUser = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        username: 'johndoe',
        password: 'password456'
      };

      await expect(User.create(duplicateUser)).rejects.toThrow();
    });

    it('should validate email format', async () => {
      const userData = {
        name: 'John Doe',
        email: 'invalid-email',
        username: 'johndoe',
        password: 'password123'
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should validate phone format', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        username: 'johndoe',
        password: 'password123',
        phone: 'invalid-phone'
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should hash password before saving', async () => {
      const password = 'password123';
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        username: 'johndoe',
        password
      };

      const user = await User.create(userData);
      expect(user.password).not.toBe(password);
    });
  });

  describe('Password Methods', () => {
    let user;

    beforeEach(async () => {
      user = await User.create({
        name: 'John Doe',
        email: 'john@example.com',
        username: 'johndoe',
        password: 'password123'
      });
    });

    it('should compare password correctly', async () => {
      const isMatch = await user.comparePassword('password123');
      expect(isMatch).toBe(true);
    });

    it('should not match incorrect password', async () => {
      const isMatch = await user.comparePassword('wrongpassword');
      expect(isMatch).toBe(false);
    });
  });

  describe('Authentication Token', () => {
    let user;

    beforeEach(async () => {
      user = await User.create({
        name: 'John Doe',
        email: 'john@example.com',
        username: 'johndoe',
        password: 'password123',
        role: 'patient'
      });
    });

    it('should generate authentication token', () => {
      const token = user.generateAuthToken();
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    it('should create valid JWT token with user data', () => {
      const jwt = require('jsonwebtoken');
      const token = user.generateAuthToken();
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      expect(decoded).toBeDefined();
      expect(decoded.id).toBe(user._id.toString());
      expect(decoded.email).toBe(user.email);
      expect(decoded.role).toBe('patient');
    });
  });

  describe('Find By Credentials', () => {
    let user;

    beforeEach(async () => {
      user = await User.create({
        name: 'John Doe',
        email: 'john@example.com',
        username: 'johndoe',
        password: 'password123',
        isActive: true
      });
    });

    it('should find user by email and password', async () => {
      const foundUser = await User.findByCredentials('john@example.com', 'password123');
      expect(foundUser).toBeDefined();
      expect(foundUser.email).toBe('john@example.com');
    });

    it('should find user by username and password', async () => {
      const foundUser = await User.findByCredentials('johndoe', 'password123');
      expect(foundUser).toBeDefined();
      expect(foundUser.username).toBe('johndoe');
    });

    it('should throw error for invalid credentials', async () => {
      await expect(User.findByCredentials('john@example.com', 'wrongpassword')).rejects.toThrow();
    });

    it('should throw error for non-existent user', async () => {
      await expect(User.findByCredentials('nonexistent@example.com', 'password123')).rejects.toThrow();
    });

    it('should throw error for deactivated account', async () => {
      user.isActive = false;
      await user.save();
      await expect(User.findByCredentials('john@example.com', 'password123')).rejects.toThrow('Account is deactivated');
    });
  });

  describe('Public Profile', () => {
    it('should return public profile without password', async () => {
      const user = await User.create({
        name: 'John Doe',
        email: 'john@example.com',
        username: 'johndoe',
        password: 'password123',
        role: 'patient',
        phone: '1234567890'
      });

      const profile = user.getPublicProfile();
      expect(profile).toBeDefined();
      expect(profile.name).toBe('John Doe');
      expect(profile.email).toBe('john@example.com');
      expect(profile.password).toBeUndefined();
    });

    it('should include display name for doctors', async () => {
      const doctor = await User.create({
        name: 'Jane Smith',
        email: 'jane@example.com',
        username: 'janesmith',
        password: 'password123',
        role: 'doctor',
        specialization: 'Cardiology'
      });

      const profile = doctor.getPublicProfile();
      expect(profile.displayName).toBe('Dr. Jane Smith');
    });

    it('should not have display name prefix for patients', async () => {
      const patient = await User.create({
        name: 'John Doe',
        email: 'john@example.com',
        username: 'johndoe',
        password: 'password123',
        role: 'patient'
      });

      const profile = patient.getPublicProfile();
      expect(profile.displayName).toBe('John Doe');
    });
  });

  describe('User Roles', () => {
    it('should set default role to patient', async () => {
      const user = await User.create({
        name: 'John Doe',
        email: 'john@example.com',
        username: 'johndoe',
        password: 'password123'
      });

      expect(user.role).toBe('patient');
    });

    it('should allow admin role', async () => {
      const admin = await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        username: 'admin',
        password: 'password123',
        role: 'admin'
      });

      expect(admin.role).toBe('admin');
    });

    it('should allow doctor role', async () => {
      const doctor = await User.create({
        name: 'Dr. Smith',
        email: 'doctor@example.com',
        username: 'doctor',
        password: 'password123',
        role: 'doctor'
      });

      expect(doctor.role).toBe('doctor');
    });

    it('should reject invalid role', async () => {
      const userData = {
        name: 'Invalid User',
        email: 'invalid@example.com',
        username: 'invalid',
        password: 'password123',
        role: 'invalid_role'
      };

      await expect(User.create(userData)).rejects.toThrow();
    });
  });

  describe('Email Case Insensitivity', () => {
    it('should convert email to lowercase before saving', async () => {
      const user = await User.create({
        name: 'John Doe',
        email: 'JOHN@EXAMPLE.COM',
        username: 'johndoe',
        password: 'password123'
      });

      expect(user.email).toBe('john@example.com');
    });

    it('should handle case-insensitive email login', async () => {
      await User.create({
        name: 'John Doe',
        email: 'john@example.com',
        username: 'johndoe',
        password: 'password123'
      });

      const foundUser = await User.findByCredentials('JOHN@EXAMPLE.COM', 'password123');
      expect(foundUser).toBeDefined();
    });
  });
});
