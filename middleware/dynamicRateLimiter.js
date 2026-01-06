import Settings from "../models/Settings.js";

const WINDOW_SIZE_IN_SECONDS = 60;
const MAX_WINDOW_REQUEST_COUNT = 1000; // Fallback default
const WINDOW_LOG_INTERVAL_IN_SECONDS = 10; // Log status every 10s

// Simple in-memory store for rate limiting (per process)
// In a clustered environment, you'd use Redis.
let requestCount = 0;
let lastReset = Date.now();
let currentLimit = MAX_WINDOW_REQUEST_COUNT;

// Background sync to fetch limit from DB occasionally
setInterval(async () => {
    try {
        const settings = await Settings.findOne();
        if (settings && settings.globalRateLimit) {
            currentLimit = settings.globalRateLimit;
        }
    } catch (err) {
        // Silent fail, keep last known limit
    }
}, 30000); // Check every 30 seconds

export const dynamicRateLimiter = async (req, res, next) => {
    const now = Date.now();

    // Reset window if needed
    if (now - lastReset > WINDOW_SIZE_IN_SECONDS * 1000) {
        requestCount = 0;
        lastReset = now;

        // Refresh limit on window reset too, just in case
        try {
            const settings = await Settings.findOne();
            if (settings) currentLimit = settings.globalRateLimit || currentLimit;
        } catch (e) { }
    }

    if (requestCount >= currentLimit) {
        return res.status(429).json({
            error: "Too Many Requests",
            message: `Global rate limit exceeded. Please try again later. Limit: ${currentLimit} req/min`
        });
    }

    requestCount++;

    // Add headers so client knows
    res.setHeader('X-RateLimit-Limit', currentLimit);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, currentLimit - requestCount));

    next();
};

export const updateRateLimit = (newLimit) => {
    currentLimit = newLimit;
};
