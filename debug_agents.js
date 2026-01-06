
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env from parent directory if needed, or assume default
dotenv.config({ path: join(__dirname, '.env') });

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_ATLAS_URI;
        if (!uri) throw new Error("MONGODB_ATLAS_URI is missing in .env");
        const conn = await mongoose.connect(uri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const agentSchema = new mongoose.Schema({
    agentName: String,
    status: String,
    reviewStatus: String
}, { strict: false });

const Agent = mongoose.model('Agent', agentSchema);

const checkAgents = async () => {
    await connectDB();
    const agents = await Agent.find({});
    console.log(`Found ${agents.length} agents.`);
    agents.forEach(a => {
        console.log(`- Name: ${a.agentName}, Status: ${a.status}, Review: ${a.reviewStatus}, Owner: ${a.owner}`);
    });
    process.exit();
};

checkAgents();
