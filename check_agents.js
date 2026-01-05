import mongoose from 'mongoose';
import Agent from './models/Agents.js';
import 'dotenv/config';

const checkAgents = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_ATLAS_URI);
        console.log("Connected to DB");

        // Get last 5 created agents
        const recentAgents = await Agent.find({}).sort({ createdAt: -1 }).limit(5);

        console.log("\n--- RECENTLY CREATED AGENTS ---");
        recentAgents.forEach(a => {
            console.log(`\nName: ${a.agentName}`);
            console.log(`ID: ${a._id}`);
            console.log(`Status: '${a.status}'`); // Check for case sensitivity or whitespace
            console.log(`ReviewStatus: '${a.reviewStatus}'`);
            console.log(`Owner: ${a.owner}`);
            console.log(`CreatedAt: ${a.createdAt}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkAgents();
