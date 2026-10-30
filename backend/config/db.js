import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer = null;

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  // CASE 1 — An Atlas (or any real) URI is explicitly configured.
  // If this connection fails we THROW. We do NOT silently fall back to the
  // in-memory server, because that would hide a real production/database
  // problem and serve the app against throwaway data.
  if (mongoUri && mongoUri.trim() !== '') {
    try {
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 15000,
      });
      console.log(`🌸 MongoDB Connected successfully: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      // Note: error.message may include the host but never the password.
      console.error(`❌ MongoDB (configured MONGO_URI) connection failed: ${error.message}`);
      throw error;
    }
  }

  // CASE 2 — No MONGO_URI at all: local development convenience only.
  // Spin up an embedded in-memory MongoDB. Data here is ephemeral.
  try {
    console.log('🌿 No MONGO_URI provided, starting embedded MongoDB Memory Server (local dev only)...');
    mongoMemoryServer = await MongoMemoryServer.create();
    const uri = mongoMemoryServer.getUri();
    const conn = await mongoose.connect(uri);
    console.log(`🌸 MongoDB Memory Server running at: ${conn.connection.host}`);
    console.log('💡 Tip: set MONGO_URI in backend/.env to use your MongoDB Atlas cluster.');
    return conn;
  } catch (error) {
    console.error(`❌ In-memory MongoDB failed to start: ${error.message}`);
    throw error;
  }
};

export default connectDB;
