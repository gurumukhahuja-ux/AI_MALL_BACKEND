import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
    maintenanceMode: {
        type: Boolean,
        default: false
    },
    globalKillSwitch: {
        type: Boolean,
        default: false
    },
    platformName: {
        type: String,
        default: 'AI-Mall'
    },
    contactEmail: {
        type: String,
        default: 'support@aimall.com'
    },
    globalRateLimit: {
        type: Number,
        default: 1000
    }
}, { timestamps: true });

export default mongoose.model("Settings", settingsSchema);
