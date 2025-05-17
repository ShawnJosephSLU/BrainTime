import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file

import mongoose from 'mongoose';
// ... other imports and server setup (Express, etc.)

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('FATAL ERROR: MONGODB_URI is not defined.');
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Successfully connected to MongoDB.'))
  .catch(err => console.error('MongoDB connection error:', err));

// ... rest of your server setup
// TODO: Uncomment and configure Express app before using app.listen
// import express from 'express';
// const app = express();
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
