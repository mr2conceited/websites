const { authenticate, authorize, optionalAuth } = require('../../src/middleware/auth');
const { errorHandler, asyncHandler, notFound } = require('../../src/middleware/errorHandler');
const User = require('../../src/models/User');
const jwt = require('jsonwebtoken');

describe('Authentication Middleware', () => {
  let user, token, req, res, next;

  beforeEach(async () => {
    user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
      role: 'patient'
    });

    token = user.generateAuthToken();

    req = {
      header: jest.fn()
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  describe('authenticate middleware', () => {
    it('should authenticate valid token', async () => {
      req.header.mockReturnValue(`Bearer ${token}`);

      await authenticate(req, res, next);

      expect(req.user).toBeDefined();
      expect(req.user.email).toBe('test@example.com');
      expect(req.userId).toBe(user._id.toString());
      expect(next).toHaveBeenCalled();
    });

    it('should reject request without token', async () => {
      req.header.mockReturnValue(null);

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Access denied. No token provided.'
        })
      );
    });

    it('should reject request with invalid Bearer format', async () => {
      req.header.mockReturnValue('InvalidFormat token');

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should reject invalid token', async () => {
      req.header.mockReturnValue('Bearer invalid.token.here');

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid token.'
        })
      );
    });

    it('should reject deactivated user', async () => {
      user.isActive = false;
      await user.save();

      req.header.mockReturnValue(`Bearer ${token}`);

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Account is deactivated.'
        })
      );
    });

    it('should reject expired token', async () => {
      const expiredToken = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '-1h' }
      );

      req.header.mockReturnValue(`Bearer ${expiredToken}`);

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Token expired.'
        })
      );
    });
  });

  describe('authorize middleware', () => {
    it('should allow user with required role', async () => {
      req.user = user;

      const authorizeAdmin = authorize('patient', 'doctor');
      await authorizeAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should reject user without required role', async () => {
      req.user = user;

      const authorizeAdmin = authorize('admin');
      await authorizeAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Access denied')
        })
      );
    });

    it('should reject request without authentication', async () => {
      req.user = null;

      const authorizeAdmin = authorize('admin');
      await authorizeAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should allow multiple roles', async () => {
      req.user = user;

      const authorize_CheckMultiple = authorize('admin', 'doctor', 'patient');
      await authorize_CheckMultiple(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('optionalAuth middleware', () => {
    it('should attach user if valid token provided', async () => {
      req.header.mockReturnValue(`Bearer ${token}`);

      await optionalAuth(req, res, next);

      expect(req.user).toBeDefined();
      expect(req.user.email).toBe('test@example.com');
      expect(next).toHaveBeenCalled();
    });

    it('should continue without user if no token provided', async () => {
      req.header.mockReturnValue(null);

      await optionalAuth(req, res, next);

      expect(req.user).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });

    it('should continue without user if invalid token provided', async () => {
      req.header.mockReturnValue('Bearer invalid.token');

      await optionalAuth(req, res, next);

      expect(req.user).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });
  });
});

describe('Error Handler Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  describe('errorHandler', () => {
    it('should handle Mongoose CastError', () => {
      const error = {
        name: 'CastError',
        message: 'Cast Error'
      };

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Resource not found'
        })
      );
    });

    it('should handle Mongoose duplicate key error', () => {
      const error = {
        code: 11000,
        keyValue: { email: 'test@example.com' },
        message: 'Duplicate key'
      };

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Email already exists')
        })
      );
    });

    it('should handle Mongoose ValidationError', () => {
      const error = {
        name: 'ValidationError',
        errors: {
          name: { message: 'Name is required' },
          email: { message: 'Email is invalid' }
        },
        message: 'Validation failed'
      };

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Name is required')
        })
      );
    });

    it('should handle JWT errors', () => {
      const error = {
        name: 'JsonWebTokenError',
        message: 'Invalid token'
      };

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid token'
        })
      );
    });

    it('should handle TokenExpiredError', () => {
      const error = {
        name: 'TokenExpiredError',
        message: 'Token expired'
      };

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Token expired'
        })
      );
    });

    it('should return 500 for unknown errors', () => {
      const error = {
        message: 'Some unknown error'
      };

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('asyncHandler', () => {
    it('should handle successful async operations', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');
      const wrapped = asyncHandler(mockFn);

      await wrapped(req, res, next);

      expect(mockFn).toHaveBeenCalledWith(req, res, next);
    });

    it('should catch async errors and pass to next', async () => {
      const error = new Error('Test error');
      const mockFn = jest.fn().mockRejectedValue(error);
      const wrapped = asyncHandler(mockFn);

      await wrapped(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('notFound middleware', () => {
    it('should return 404 for unknown routes', () => {
      req.originalUrl = '/api/unknown';

      notFound(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('/api/unknown')
        })
      );
    });
  });
});
