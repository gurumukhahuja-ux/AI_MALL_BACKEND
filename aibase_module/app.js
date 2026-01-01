const express = require('express');
const { NODE_ENV } = require('./config/env');
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();

// Middleware - Main app handles cors/json/urlencoded
// specific middleware for this module can remain if needed, but avoiding duplicates

// Routes
// Mounted at /api/aibase in main server
app.get('/', (req, res) => {
    res.json({ success: true, message: 'AIBASE Module API is running' });
});

app.use('/chat', require('./routes/chat.routes'));
app.use('/knowledge', require('./routes/knowledge.routes'));

// 404 Handler for AIBASE Module
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found in AIBASE Module` });
});
// app.use('/auth', require('./routes/auth.routes'));
// app.use('/dashboard', require('./routes/dashboard.routes'));

// Error Handling
app.use(errorMiddleware);

module.exports = app;
