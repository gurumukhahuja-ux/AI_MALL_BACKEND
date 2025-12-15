import mongoose from 'mongoose';
import { MONGODB_URI } from '../utils/consts.js';


// Using the exact string requested, appending db name for safety
const URI = process.env.MONGODB_URI || MONGODB_URI;
const connectDB = async () => {
  try {
    await mongoose.connect(URI);
    console.log('MongoDB Connected Successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1); // Exit process with failure
  }
};

export default  connectDB;