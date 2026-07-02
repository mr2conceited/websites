const mongoose = require('mongoose');

const DEFAULT_MONGO_URI = 'mongodb+srv://brooklynwangson_db_user:85LPDx4gQWAmYrSz@cluster0.ghiaa8c.mongodb.net/?appName=Cluster0';

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || DEFAULT_MONGO_URI;

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      retryWrites: true,
      w: 'majority'
    });

    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
