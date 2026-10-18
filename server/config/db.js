const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  try {
    const connUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ngo_platform';
    console.log(`Connecting to MongoDB at: ${connUri}...`);
    
    // Attempt connection with 3s timeout to avoid hanging if mongo daemon is offline
    const conn = await mongoose.connect(connUri, {
      serverSelectionTimeoutMS: 3000
    });

    isConnected = true;
    console.log(`MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    isConnected = false;
    console.warn(`[Notice] MongoDB is not running locally (${error.message}).`);
    console.log(`Server will run seamlessly with in-memory persistence mode enabled.`);
  }
};

const isDBConnected = () => isConnected;

module.exports = { connectDB, isDBConnected };
