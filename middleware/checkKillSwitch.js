import Settings from "../models/Settings.js";

export const checkKillSwitch = async (req, res, next) => {
    try {
        const settings = await Settings.findOne();
        if (settings && settings.globalKillSwitch) {
            // Check if user is admin (optional: admins might still need access, but "Global Kill" usually implies everything)
            // For safety, let's block everyone for inference.
            return res.status(503).json({
                error: "Service Unavailable: Global Kill-Switch Enabled",
                message: "AI inference services have been temporarily disabled by the administrator."
            });
        }
        next();
    } catch (err) {
        console.error("Kill Switch Check Error:", err);
        // Fail open or closed? Fail open might be safer for casual errors, but closed for safety.
        // Let's log and proceed for now to avoid accidental blocking on DB errors.
        next();
    }
};
