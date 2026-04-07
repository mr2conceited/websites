# Mediplus Medical System - Node.js Backend

A modern, scalable healthcare management system built with Node.js, Express, MongoDB, and Socket.io.

## 🌟 Features

### Core Features
- ✅ **User Authentication** - JWT-based secure authentication
- 👥 **Role-Based Access Control** - Admin, Doctor, Patient roles
- 📅 **Appointment Management** - Book, confirm, cancel, complete appointments
- 🔄 **Real-time Updates** - WebSocket integration for instant notifications
- 👨‍⚕️ **Doctor Management** - Browse doctors by department
- 📊 **Dashboard Statistics** - Comprehensive stats for all user roles
- 🔍 **Search & Filter** - Advanced search and filtering capabilities
- 📱 **RESTful API** - Clean, well-documented REST endpoints

### Advanced Features
- 🔐 **Password Encryption** - Bcrypt hashing
- 🛡️ **Security Headers** - Helmet.js protection
- 🚦 **Rate Limiting** - Prevent API abuse
- 📝 **Input Validation** - Express-validator
- 🗜️ **Response Compression** - Gzip compression
- 📊 **Request Logging** - Morgan logger
- ⚡ **Performance Optimized** - Indexed queries
- 🔄 **CORS Enabled** - Cross-origin support

## 🏗️ Architecture

```
mediplus-nodejs/
├── src/
│   ├── models/              # Mongoose models
│   │   ├── User.js
│   │   └── Appointment.js
│   ├── controllers/         # Request handlers
│   │   ├── authController.js
│   │   ├── appointmentController.js
│   │   └── userController.js
│   ├── routes/              # API routes
│   │   ├── authRoutes.js
│   │   ├── appointmentRoutes.js
│   │   └── userRoutes.js
│   ├── middleware/          # Custom middleware
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── validator.js
│   ├── config/              # Configuration
│   │   └── database.js
│   └── app.js               # Main application
├── tests/                   # Test files
├── .env.example            # Environment variables template
├── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **MongoDB** >= 4.0
- **npm** >= 9.0.0

### Installation

1. **Clone or extract the project**
   ```bash
   cd mediplus-nodejs
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/mediplus_hospital
   JWT_SECRET=your-secret-key-change-this
   JWT_EXPIRE=7d
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Start MongoDB**
   ```bash
   # Linux/Mac
   sudo service mongod start
   
   # Or with Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

5. **Run the application**
   ```bash
   # Development mode (with auto-restart)
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Server is running! 🎉**
   ```
   HTTP Server: http://localhost:5000
   WebSocket: ws://localhost:5000
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "username": "johndoe",
  "password": "password123",
  "role": "patient",
  "phone": "+1234567890"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {...},
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/auth/update-profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated",
  "phone": "+1234567890",
  "address": "123 Main St"
}
```

#### Change Password
```http
PUT /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

### Appointment Endpoints

#### Book Appointment
```http
POST /api/appointments
Authorization: Bearer <token>
Content-Type: application/json

{
  "doctorId": "65abc123...",
  "department": "Cardiology",
  "date": "2026-02-20",
  "time": "10:00",
  "reason": "Regular checkup"
}
```

#### Get Appointments
```http
GET /api/appointments?status=pending&page=1&limit=10
Authorization: Bearer <token>
```

#### Get Upcoming Appointments
```http
GET /api/appointments/upcoming?limit=5
Authorization: Bearer <token>
```

#### Get Appointment History
```http
GET /api/appointments/history?page=1&limit=10
Authorization: Bearer <token>
```

#### Get Appointment by ID
```http
GET /api/appointments/:id
Authorization: Bearer <token>
```

#### Confirm Appointment (Doctor/Admin)
```http
PUT /api/appointments/:id/confirm
Authorization: Bearer <token>
```

#### Cancel Appointment
```http
PUT /api/appointments/:id/cancel
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Cannot make it"
}
```

#### Complete Appointment (Doctor)
```http
PUT /api/appointments/:id/complete
Authorization: Bearer <token>
Content-Type: application/json

{
  "diagnosis": "Patient is healthy",
  "prescription": "Vitamin supplements",
  "notes": "Follow-up in 6 months"
}
```

#### Get Available Slots
```http
GET /api/appointments/slots/available?doctorId=65abc...&date=2026-02-20
```

#### Get Appointment Statistics
```http
GET /api/appointments/stats
Authorization: Bearer <token>
```

### User Endpoints

#### Get All Doctors
```http
GET /api/users/doctors?page=1&limit=20
```

#### Get Departments
```http
GET /api/users/departments
```

#### Get User by ID
```http
GET /api/users/:id
Authorization: Bearer <token>
```

#### Search Users
```http
POST /api/users/search
Authorization: Bearer <token>
Content-Type: application/json

{
  "query": "john",
  "role": "patient",
  "limit": 10
}
```

#### Get All Users (Admin)
```http
GET /api/users?role=patient&page=1&limit=10
Authorization: Bearer <admin-token>
```

#### Update User (Admin)
```http
PUT /api/users/:id
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Updated Name",
  "isActive": true
}
```

#### Delete User (Admin)
```http
DELETE /api/users/:id
Authorization: Bearer <admin-token>
```

#### Get User Statistics (Admin)
```http
GET /api/users/stats/overview
Authorization: Bearer <admin-token>
```

## 🔌 WebSocket Events

### Client → Server Events

```javascript
// Join user's room
socket.emit('join', {
  userId: '65abc123...',
  role: 'patient'
});

// New appointment created
socket.emit('appointment:new', {
  appointmentId: 'APT123',
  doctorId: '65abc...',
  patientId: '65def...'
});

// Appointment status updated
socket.emit('appointment:update', {
  appointmentId: 'APT123',
  patientId: '65def...',
  status: 'confirmed'
});
```

### Server → Client Events

```javascript
// Listen for new appointments (doctors)
socket.on('appointment:new', (data) => {
  console.log('New appointment:', data);
  // Update UI
});

// Listen for appointment updates (patients)
socket.on('appointment:update', (data) => {
  console.log('Appointment updated:', data);
  // Update UI
});

// Listen for cancellations
socket.on('appointment:cancel', (data) => {
  console.log('Appointment cancelled:', data);
  // Update UI
});

// Listen for confirmations
socket.on('appointment:confirm', (data) => {
  console.log('Appointment confirmed:', data);
  // Update UI
});
```

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Watch Mode
```bash
npm run test:watch
```

## 🐳 Docker Deployment

### Build Docker Image
```bash
docker build -t mediplus-backend .
```

### Run with Docker Compose
```bash
docker-compose up -d
```

## 📦 Production Deployment

### 1. Environment Setup
```bash
# Set production environment variables
export NODE_ENV=production
export MONGODB_URI=mongodb://your-production-db
export JWT_SECRET=your-production-secret
```

### 2. Build & Start
```bash
npm install --production
npm start
```

### 3. Process Manager (PM2)
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start src/app.js --name mediplus-api

# Setup auto-restart on server reboot
pm2 startup
pm2 save
```

### 4. Nginx Reverse Proxy
```nginx
server {
    listen 80;
    server_name api.mediplus.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔒 Security Best Practices

1. **Change JWT Secret** - Use a strong, random secret in production
2. **Enable HTTPS** - Use SSL certificates
3. **Update Dependencies** - Regularly update npm packages
4. **Rate Limiting** - Adjust limits based on your needs
5. **Input Validation** - All inputs are validated
6. **Password Hashing** - Bcrypt with salt rounds
7. **MongoDB Security** - Enable authentication
8. **CORS Configuration** - Restrict origins in production

## 🛠️ Development Tips

### Hot Reload
The project uses `nodemon` for auto-restart during development:
```bash
npm run dev
```

### Debug Mode
```bash
DEBUG=* npm run dev
```

### MongoDB GUI
Use MongoDB Compass or Studio 3T to view your database:
```
Connection String: mongodb://localhost:27017/mediplus_hospital
```

## 📊 Database Schema

### Users Collection
```javascript
{
  name: String,
  email: String (unique),
  username: String (unique),
  password: String (hashed),
  role: String (admin/doctor/patient),
  phone: String,
  address: String,
  isActive: Boolean,
  specialization: String (for doctors),
  experience: Number (for doctors)
}
```

### Appointments Collection
```javascript
{
  appointmentId: String (unique),
  patient: ObjectId (ref: User),
  doctor: ObjectId (ref: User),
  department: String,
  date: Date,
  time: String,
  status: String (pending/confirmed/completed/cancelled),
  reason: String,
  diagnosis: String,
  prescription: String,
  notes: String
}
```

## 🐛 Troubleshooting

### MongoDB Connection Failed
```bash
# Check if MongoDB is running
sudo service mongod status

# Start MongoDB
sudo service mongod start
```

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

### JWT Token Issues
- Ensure JWT_SECRET is set in .env
- Check token expiration time
- Verify Bearer token format in Authorization header

## 📝 License

MIT License - See LICENSE file for details

## 👥 Support

For support, email support@mediplus.com or create an issue in the repository.

## 🎉 Success!

Your Node.js backend for Mediplus is now running! The key improvements over PHP:

✅ Real-time updates via WebSocket  
✅ Modern async/await syntax  
✅ Same language (JavaScript) for frontend & backend  
✅ Better performance under load  
✅ Comprehensive API documentation  
✅ Production-ready security features  

Happy coding! 🚀
