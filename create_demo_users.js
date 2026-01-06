import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const createUsers = async () => {
    try {
        if (!MONGO_URI) {
            throw new Error("MONGO_URI is missing in .env");
        }
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB');

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        // Create Vendor
        const vendorEmail = 'demo_vendor@example.com';
        let vendor = await User.findOne({ email: vendorEmail });
        if (!vendor) {
            vendor = new User({
                name: 'Demo Vendor',
                email: vendorEmail,
                password: hashedPassword,
                role: 'vendor'
            });
            await vendor.save();
            console.log('Created Vendor: demo_vendor@example.com / password123');
        } else {
            vendor.password = hashedPassword;
            vendor.role = 'vendor';
            await vendor.save();
            console.log('Updated Vendor: demo_vendor@example.com / password123');
        }

        // Create Admin
        const adminEmail = 'demo_admin@example.com';
        let admin = await User.findOne({ email: adminEmail });
        if (!admin) {
            admin = new User({
                name: 'Demo Admin',
                email: adminEmail,
                password: hashedPassword,
                role: 'admin'
            });
            await admin.save();
            console.log('Created Admin: demo_admin@example.com / password123');
        } else {
            admin.password = hashedPassword;
            admin.role = 'admin';
            await admin.save();
            console.log('Updated Admin: demo_admin@example.com / password123');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

createUsers();
