require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Appointment = require('./src/models/Appointment');
const database = require('./src/config/database');

// Sample data
const sampleUsers = [
  // Admin
  {
    name: 'Admin User',
    email: 'admin@mediplus.com',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    phone: '+1234567890',
    isActive: true
  },
  // Doctors
  {
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@mediplus.com',
    username: 'dr.sarah',
    password: 'doctor123',
    role: 'doctor',
    specialization: 'Cardiology',
    experience: 10,
    phone: '+1234567891',
    isActive: true
  },
  {
    name: 'Dr. Michael Chen',
    email: 'michael.chen@mediplus.com',
    username: 'dr.michael',
    password: 'doctor123',
    role: 'doctor',
    specialization: 'Neurology',
    experience: 8,
    phone: '+1234567892',
    isActive: true
  },
  {
    name: 'Dr. Emily Williams',
    email: 'emily.williams@mediplus.com',
    username: 'dr.emily',
    password: 'doctor123',
    role: 'doctor',
    specialization: 'Pediatrics',
    experience: 12,
    phone: '+1234567893',
    isActive: true
  },
  {
    name: 'Dr. James Brown',
    email: 'james.brown@mediplus.com',
    username: 'dr.james',
    password: 'doctor123',
    role: 'doctor',
    specialization: 'Orthopedics',
    experience: 15,
    phone: '+1234567894',
    isActive: true
  },
  // Patients
  {
    name: 'John Doe',
    email: 'john.doe@email.com',
    username: 'johndoe',
    password: 'patient123',
    role: 'patient',
    phone: '+1234567895',
    address: '123 Main St, City, State 12345',
    dateOfBirth: new Date('1990-05-15'),
    gender: 'male',
    isActive: true
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@email.com',
    username: 'janesmith',
    password: 'patient123',
    role: 'patient',
    phone: '+1234567896',
    address: '456 Oak Ave, City, State 12345',
    dateOfBirth: new Date('1985-08-22'),
    gender: 'female',
    isActive: true
  },
  {
    name: 'Robert Wilson',
    email: 'robert.wilson@email.com',
    username: 'robertw',
    password: 'patient123',
    role: 'patient',
    phone: '+1234567897',
    address: '789 Pine Rd, City, State 12345',
    dateOfBirth: new Date('1975-12-10'),
    gender: 'male',
    isActive: true
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Connect to database
    await database.connect();

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Appointment.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // Create users
    console.log('👥 Creating users...');
    const createdUsers = await User.create(sampleUsers);
    console.log(`✅ Created ${createdUsers.length} users\n`);

    // Get doctors and patients
    const doctors = createdUsers.filter(u => u.role === 'doctor');
    const patients = createdUsers.filter(u => u.role === 'patient');

    console.log('📅 Creating sample appointments...');
    
    // Get current date and time
    const now = new Date();
    const currentHour = now.getHours();
    
    // Create base date for tomorrow at 9 AM
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    
    // Day after tomorrow
    const dayAfter = new Date(now);
    dayAfter.setDate(dayAfter.getDate() + 2);
    dayAfter.setHours(9, 0, 0, 0);
    
    // Next week
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(9, 0, 0, 0);
    
    // Two weeks from now
    const twoWeeks = new Date(now);
    twoWeeks.setDate(twoWeeks.getDate() + 14);
    twoWeeks.setHours(9, 0, 0, 0);

    // Create appointments one by one to ensure pre-save hook runs
    const appointments = [];
    
    try {
      // Appointment 1: Tomorrow 9:00 AM - Pending
      const apt1 = new Appointment({
        patient: patients[0]._id,
        patientName: patients[0].name,
        patientEmail: patients[0].email,
        patientPhone: patients[0].phone,
        doctor: doctors[0]._id,
        doctorName: doctors[0].name,
        department: doctors[0].specialization,
        date: tomorrow,
        time: '09:00',
        status: 'pending',
        reason: 'Regular checkup'
      });
      await apt1.save();
      appointments.push(apt1);
      console.log('   ✓ Appointment 1 created');

      // Appointment 2: Tomorrow 2:00 PM - Confirmed
      const tomorrow2pm = new Date(tomorrow);
      tomorrow2pm.setHours(14, 0, 0, 0);
      const apt2 = new Appointment({
        patient: patients[1]._id,
        patientName: patients[1].name,
        patientEmail: patients[1].email,
        patientPhone: patients[1].phone,
        doctor: doctors[1]._id,
        doctorName: doctors[1].name,
        department: doctors[1].specialization,
        date: tomorrow2pm,
        time: '14:00',
        status: 'confirmed',
        reason: 'Follow-up consultation'
      });
      await apt2.save();
      appointments.push(apt2);
      console.log('   ✓ Appointment 2 created');

      // Appointment 3: Day after tomorrow 10:00 AM - Pending
      const dayAfter10am = new Date(dayAfter);
      dayAfter10am.setHours(10, 0, 0, 0);
      const apt3 = new Appointment({
        patient: patients[2]._id,
        patientName: patients[2].name,
        patientEmail: patients[2].email,
        patientPhone: patients[2].phone,
        doctor: doctors[2]._id,
        doctorName: doctors[2].name,
        department: doctors[2].specialization,
        date: dayAfter10am,
        time: '10:00',
        status: 'pending',
        reason: 'Initial consultation'
      });
      await apt3.save();
      appointments.push(apt3);
      console.log('   ✓ Appointment 3 created');

      // Appointment 4: Next week 11:00 AM - Pending
      const nextWeek11am = new Date(nextWeek);
      nextWeek11am.setHours(11, 0, 0, 0);
      const apt4 = new Appointment({
        patient: patients[0]._id,
        patientName: patients[0].name,
        patientEmail: patients[0].email,
        patientPhone: patients[0].phone,
        doctor: doctors[3]._id,
        doctorName: doctors[3].name,
        department: doctors[3].specialization,
        date: nextWeek11am,
        time: '11:00',
        status: 'pending',
        reason: 'Sports injury checkup'
      });
      await apt4.save();
      appointments.push(apt4);
      console.log('   ✓ Appointment 4 created');

      // Appointment 5: Two weeks 3:00 PM - Confirmed
      const twoWeeks3pm = new Date(twoWeeks);
      twoWeeks3pm.setHours(15, 0, 0, 0);
      const apt5 = new Appointment({
        patient: patients[1]._id,
        patientName: patients[1].name,
        patientEmail: patients[1].email,
        patientPhone: patients[1].phone,
        doctor: doctors[0]._id,
        doctorName: doctors[0].name,
        department: doctors[0].specialization,
        date: twoWeeks3pm,
        time: '15:00',
        status: 'confirmed',
        reason: 'Routine checkup'
      });
      await apt5.save();
      appointments.push(apt5);
      console.log('   ✓ Appointment 5 created');

    } catch (aptError) {
      console.error('Error creating individual appointment:', aptError.message);
    }

    console.log(`✅ Created ${appointments.length} appointments\n`);

    // Summary
    console.log('═══════════════════════════════════════════════');
    console.log('✅ Database seeding completed successfully!');
    console.log('═══════════════════════════════════════════════');
    console.log('\n📊 Summary:');
    console.log(`   • Admins: 1`);
    console.log(`   • Doctors: ${doctors.length}`);
    console.log(`   • Patients: ${patients.length}`);
    console.log(`   • Appointments: ${appointments.length}`);
    console.log('\n🔐 Test Credentials:');
    console.log('   Admin:');
    console.log('     Email: admin@mediplus.com');
    console.log('     Password: admin123');
    console.log('\n   Doctor:');
    console.log('     Email: sarah.johnson@mediplus.com');
    console.log('     Password: doctor123');
    console.log('\n   Patient:');
    console.log('     Email: john.doe@email.com');
    console.log('     Password: patient123');
    console.log('═══════════════════════════════════════════════\n');

    await database.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    await database.disconnect();
    process.exit(1);
  }
}

// Run seeder
seedDatabase();
