# 🚀 Quick Start Guide

## Get Running in 5 Minutes!

### Step 1: Prerequisites Check
```bash
node --version    # Should be >= 18.0.0
npm --version     # Should be >= 9.0.0
mongod --version  # Should be >= 4.0.0
```

If you don't have MongoDB installed:
```bash
# Ubuntu/Debian
sudo apt-get install mongodb

# Mac
brew install mongodb-community

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Step 2: Install & Configure
```bash
# Install dependencies (takes ~30 seconds)
npm install

# Copy environment file
cp .env.example .env

# Edit .env if needed (optional - defaults work fine)
nano .env
```

### Step 3: Start MongoDB
```bash
# Linux/Mac
sudo service mongod start

# Or if using Docker
docker start mongodb
```

### Step 4: Seed Sample Data (Optional but Recommended)
```bash
# Creates admin, doctors, and patients with sample appointments
node seed.js
```

This creates:
- 1 Admin
- 4 Doctors (Cardiology, Neurology, Pediatrics, Orthopedics)
- 3 Patients
- 5 Sample appointments

**Test Credentials:**
- Admin: admin@mediplus.com / admin123
- Doctor: sarah.johnson@mediplus.com / doctor123
- Patient: john.doe@email.com / patient123

### Step 5: Start the Server
```bash
# Development mode (auto-restarts on changes)
npm run dev

# Or production mode
npm start
```

You should see:
```
✅ MongoDB connected successfully
📦 Database: mediplus_hospital
═══════════════════════════════════════════════
🏥 Mediplus Medical System - Backend API
═══════════════════════════════════════════════
🚀 Server running in development mode
📡 HTTP Server: http://localhost:5000
🔌 WebSocket Server: ws://localhost:5000
═══════════════════════════════════════════════
```

### Step 6: Test the API

**Option A: Using Browser**
Open: http://localhost:5000

**Option B: Using curl**
```bash
# Test health endpoint
curl http://localhost:5000/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john.doe@email.com","password":"patient123"}'

# You'll get a token, copy it
# Then use it for authenticated requests:
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Option C: Using Postman**
1. Import the API collection (see POSTMAN_COLLECTION.json)
2. Set the base URL: http://localhost:5000
3. Login first to get a token
4. Use the token in Authorization header for other requests

---

## 🎯 Common Tasks

### Create a New Appointment
```bash
# First, get a doctor ID
curl http://localhost:5000/api/users/doctors | jq

# Then book (replace TOKEN and DOCTOR_ID)
curl -X POST http://localhost:5000/api/appointments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "doctorId": "DOCTOR_ID",
    "department": "Cardiology",
    "date": "2026-02-20",
    "time": "10:00",
    "reason": "Regular checkup"
  }'
```

### Get Your Appointments
```bash
curl http://localhost:5000/api/appointments \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Check Available Slots
```bash
curl "http://localhost:5000/api/appointments/slots/available?doctorId=DOCTOR_ID&date=2026-02-20"
```

---

## 🛠️ Development Workflow

### Watch Mode (Auto-restart)
```bash
npm run dev
```
Changes to any `.js` file will automatically restart the server.

### Check Database
```bash
# Using MongoDB Shell
mongosh mediplus_hospital

# View users
db.users.find().pretty()

# View appointments
db.appointments.find().pretty()
```

### View Logs
Logs are printed to console. In production, use:
```bash
pm2 logs mediplus-api
```

---

## 🐛 Troubleshooting

### "EADDRINUSE: Port already in use"
```bash
# Find what's using port 5000
lsof -i :5000

# Kill it
kill -9 PID_NUMBER

# Or change port in .env
PORT=5001
```

### "MongoServerError: connect ECONNREFUSED"
```bash
# MongoDB isn't running, start it
sudo service mongod start

# Or check status
sudo service mongod status
```

### "Cannot find module 'express'"
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### JWT Token Errors
- Make sure you're using `Bearer TOKEN` format
- Check if token is expired (default: 7 days)
- Verify JWT_SECRET is set in .env

---

## 📱 Frontend Integration

### React Example
```javascript
// api.js
const API_BASE = 'http://localhost:5000/api';

// Login
const login = async (email, password) => {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  
  if (data.success) {
    localStorage.setItem('token', data.data.token);
    return data.data.user;
  }
  throw new Error(data.message);
};

// Get appointments
const getAppointments = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/appointments`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

// Book appointment
const bookAppointment = async (appointmentData) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/appointments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(appointmentData)
  });
  return response.json();
};
```

### WebSocket Example
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

// Join your room
socket.emit('join', {
  userId: user.id,
  role: user.role
});

// Listen for updates
socket.on('appointment:new', (data) => {
  console.log('New appointment:', data);
  // Update UI
});

socket.on('appointment:update', (data) => {
  console.log('Appointment updated:', data);
  // Update UI
});

socket.on('appointment:confirm', (data) => {
  console.log('Appointment confirmed:', data);
  // Show notification
});
```

---

## ✅ You're All Set!

Your Mediplus backend is now running. Next steps:

1. **Test the API** using Postman or curl
2. **Connect your frontend** to the API
3. **Customize** models and controllers as needed
4. **Deploy** to production when ready

For detailed API documentation, see [README.md](README.md)

Need help? Check the troubleshooting section or review the code comments.

Happy coding! 🎉
