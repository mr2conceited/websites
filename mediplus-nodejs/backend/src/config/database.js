const mongoose = require('mongoose');

class Database {
  constructor() {
    this.connection = null;
  }

  async connect() {
    try {
      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      };

      const uri = process.env.NODE_ENV === 'test' 
        ? process.env.MONGODB_TEST_URI 
        : process.env.MONGODB_URI;

      this.connection = await mongoose.connect(uri, options);

      console.log('✅ MongoDB connected successfully');
      console.log(`📦 Database: ${this.connection.connection.name}`);

      // Handle connection events
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        console.log('⚠️  MongoDB disconnected');
      });

      // Graceful shutdown
      process.on('SIGINT', async () => {
        await this.disconnect();
        process.exit(0);
      });

      return this.connection;
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      process.exit(1);
    }
  }

  async disconnect() {
    try {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    } catch (error) {
      console.error('Error closing MongoDB connection:', error);
    }
  }

  isConnected() {
    return mongoose.connection.readyState === 1;
  }

  getConnection() {
    return this.connection;
  }
}

module.exports = new Database();
