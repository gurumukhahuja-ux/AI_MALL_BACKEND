const mongoose = require('mongoose');
const { MONGO_URI } = require('./env');
const logger = require('../utils/logger');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 30000, // Wait 30s before giving up
            socketTimeoutMS: 45000,          // Close socket after 45s of inactivity
        });
        logger.info(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        logger.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
