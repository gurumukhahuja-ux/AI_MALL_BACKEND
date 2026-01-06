import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';
import path from 'path';

// Fix for windows path issue with dotenv if needed, or just rely on default
dotenv.config();

const promoteUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_ATLAS_URI);
        console.log("Connected to DB");

        const user = await User.findOne({}); // Get ANY user (the first one)

        if (!user) {
            console.log("No users found in DB to promote.");
            process.exit(1);
        }

        user.role = 'admin';
        await user.save();
        console.log(`User '${user.name}' (${user.email}) promoted to admin.`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

promoteUser();
