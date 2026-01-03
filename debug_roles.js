import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const checkRoles = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || "mongodb+srv://Bhoom:bhoom123@cluster0.acdskxu.mongodb.net/AIBASE";
        await mongoose.connect(mongoUri);
        console.log("Connected to DB");

        const users = await User.find({}, 'name email role agents');
        console.log(`Total Users: ${users.length}`);

        const roles = {};
        users.forEach(u => {
            roles[u.role] = (roles[u.role] || 0) + 1;
        });

        console.log("Roles Distribution:", roles);

        // Also check if any users have 'company' field? No, schema doesn't have it.
        // Check if any users have agents
        const usersWithAgents = users.filter(u => u.agents && u.agents.length > 0).length;
        console.log(`Users with agents: ${usersWithAgents}`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkRoles();
