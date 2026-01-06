import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

// Define Settings schema inline to avoid import issues
const settingsSchema = new mongoose.Schema({
    globalKillSwitch: { type: Boolean, default: false }
}, { timestamps: true });

const Settings = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);

async function checkAndDisableKillSwitch() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const settings = await Settings.findOne();

        if (!settings) {
            console.log('⚠️  No settings document found. Creating one with kill switch OFF...');
            await Settings.create({ globalKillSwitch: false });
            console.log('✅ Settings created with kill switch OFF');
        } else {
            console.log('Current kill switch status:', settings.globalKillSwitch);

            if (settings.globalKillSwitch) {
                console.log('🔧 Disabling kill switch...');
                settings.globalKillSwitch = false;
                await settings.save();
                console.log('✅ Kill switch disabled successfully!');
            } else {
                console.log('✅ Kill switch is already off');
            }
        }

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkAndDisableKillSwitch();
