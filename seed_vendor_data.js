import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Agent from './models/Agents.js';
import User from './models/User.js';

dotenv.config();

const URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-mall';

async function seed() {
    try {
        await mongoose.connect(URI);
        console.log('Connected to MongoDB');

        // Create a Vendor User
        let vendor = await User.findOne({ email: 'vendor@test.com' });
        if (!vendor) {
            vendor = new User({
                name: 'TechSolutions Vendor',
                email: 'vendor@test.com',
                password: 'password123', // In real app, this should be hashed
                isVerified: true,
                role: 'vendor'
            });
            await vendor.save();
            console.log('Vendor created:', vendor._id);
        }

        // Create some Agents for this vendor
        const apps = [
            {
                agentName: 'AI Chat Assistant',
                description: 'A powerful AI chat assistant for all your needs.',
                category: 'Business',
                avatar: '/agent1.png',
                url: '/agents/chat',
                status: 'Live',
                health: 'All Good',
                vendorId: vendor._id
            },
            {
                agentName: 'Image Generator Pro',
                description: 'Generate stunning images from text prompts.',
                category: 'Sales & Marketing',
                avatar: '/agent2.png',
                url: '/agents/image',
                status: 'Under Review',
                health: 'Needs Attention',
                vendorId: vendor._id
            },
            {
                agentName: 'Data Analyzer',
                description: 'Analyze complex data sets with ease.',
                category: 'Business',
                avatar: '/agent3.png',
                url: '/agents/data',
                status: 'Draft',
                health: 'Issue Detected',
                vendorId: vendor._id
            }
        ];

        for (const appData of apps) {
            const existing = await Agent.findOne({ agentName: appData.agentName });
            if (!existing) {
                await new Agent(appData).save();
                console.log(`App created: ${appData.agentName}`);
            } else {
                // Update to ensure vendorId and status are set
                await Agent.updateOne({ _id: existing._id }, { $set: { vendorId: vendor._id, status: appData.status, health: appData.health } });
                console.log(`App updated: ${appData.agentName}`);
            }
        }

        console.log('Seeding complete!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
}

seed();
