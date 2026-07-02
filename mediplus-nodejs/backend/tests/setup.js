require('dotenv').config({ path: '.env.test' });
const mongoose = require('mongoose');

// Global test setup
beforeAll(async () => {
  // Connect to test database
  try {
    await mongoose.connect(process.env.MONGODB_TEST_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  } catch (error) {
    console.error('Failed to connect to test database:', error);
  }
});

beforeEach(async () => {
  // Clear all collections before each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  // Close database connection after all tests
  await mongoose.connection.close();
});
