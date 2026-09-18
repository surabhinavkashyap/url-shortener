const mongoose = require('mongoose');

let connectPromise;

async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  const dbUrl = process.env.MONGODB_URI;
  if (!dbUrl) {
    throw new Error('MONGODB_URI is not set');
  }

  if (!connectPromise) {
    connectPromise = mongoose.connect(dbUrl).then(() => {
      console.log('Connected to MongoDB Atlas');
    });
  }

  try {
    await connectPromise;
  } catch (error) {
    connectPromise = null;
    throw error;
  }
}

module.exports = connectDB;
