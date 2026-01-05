const { PORT } = require('./config/env'); // Must be first to load .env
const app = require('./app');
const connectDB = require('./config/db');
const logger = require('./utils/logger');
const aiService = require('./services/ai.service');

// Connect to Database
connectDB().then(async () => {
    // Initialize AI Context from DB
    await aiService.initializeFromDB();

    // Start Server ONLY after DB is connected
    const server = app.listen(PORT, () => {
        logger.info(`Server running on port ${PORT}`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err, promise) => {
        logger.error(`Error: ${err.message}`);
        // Close server & exit process
        server.close(() => process.exit(1));
    });
});


