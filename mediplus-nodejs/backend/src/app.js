require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

const database = require('./config/database');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const userRoutes = require('./routes/userRoutes');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Make io accessible to our routes
app.set('io', io);

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net', 'https://cdn.socket.io'],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net', 'https://cdnjs.cloudflare.com'],
      fontSrc: ["'self'", 'https://cdnjs.cloudflare.com', 'data:'],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'", 'ws:', 'wss:', 'https://cdn.jsdelivr.net', 'https://cdn.socket.io']
    }
  }
})); // Security headers
app.use(compression()); // Compress responses
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve frontend files
const frontendPath = path.join(__dirname, '../../frontend');
app.use(express.static(frontendPath));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100,
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  }
});

app.use('/api/', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Mediplus API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/users', userRoutes);

// Frontend entry point
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`✅ Client connected: ${socket.id}`);

  // Join room based on user role and ID
  socket.on('join', (data) => {
    const { userId, role } = data;
    
    if (role === 'doctor') {
      socket.join(`doctor-${userId}`);
      console.log(`👨‍⚕️ Doctor ${userId} joined their room`);
    } else if (role === 'patient') {
      socket.join(`patient-${userId}`);
      console.log(`🤒 Patient ${userId} joined their room`);
    }
    
    // Join general role room
    socket.join(role);
  });

  // New appointment notification
  socket.on('appointment:new', (data) => {
    // Notify the doctor
    io.to(`doctor-${data.doctorId}`).emit('appointment:new', data);
    console.log(`📅 New appointment notification sent to doctor ${data.doctorId}`);
  });

  // Appointment status update
  socket.on('appointment:update', (data) => {
    // Notify the patient
    io.to(`patient-${data.patientId}`).emit('appointment:update', data);
    console.log(`🔔 Appointment update sent to patient ${data.patientId}`);
  });

  // Appointment cancelled
  socket.on('appointment:cancel', (data) => {
    // Notify both doctor and patient
    io.to(`doctor-${data.doctorId}`).emit('appointment:cancel', data);
    io.to(`patient-${data.patientId}`).emit('appointment:cancel', data);
    console.log(`❌ Cancellation notification sent`);
  });

  // Appointment confirmed
  socket.on('appointment:confirm', (data) => {
    // Notify the patient
    io.to(`patient-${data.patientId}`).emit('appointment:confirm', data);
    console.log(`✅ Confirmation sent to patient ${data.patientId}`);
  });

  // Real-time queue updates
  socket.on('queue:update', (data) => {
    io.to('waiting-room').emit('queue:update', data);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });

  // Error handling
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to database
    await database.connect();

    // Start server
    server.listen(PORT, () => {
      console.log('');
      console.log('═══════════════════════════════════════════════════════');
      console.log('🏥 Mediplus Medical System - Backend API');
      console.log('═══════════════════════════════════════════════════════');
      console.log(`🚀 Server running in ${process.env.NODE_ENV} mode`);
      console.log(`📡 HTTP Server: http://localhost:${PORT}`);
      console.log(`🔌 WebSocket Server: ws://localhost:${PORT}`);
      console.log(`📚 API Docs: http://localhost:${PORT}/api/docs`);
      console.log('═══════════════════════════════════════════════════════');
      console.log('');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  server.close(() => process.exit(1));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    database.disconnect();
    process.exit(0);
  });
});

startServer();

module.exports = { app, server, io };
