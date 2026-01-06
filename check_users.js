import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_ATLAS_URI);
        console.log("Connected to DB");

        const users = await User.find({});
        console.log("Users found:", users.length);
        users.forEach(u => {
            console.log(`User: ${u.name}, Email: ${u.email}, Role: ${u.role}, ID: ${u._id}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkUsers();
