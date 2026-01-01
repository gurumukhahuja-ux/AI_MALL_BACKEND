import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const AgentSchema = new mongoose.Schema({}, { strict: false });
const Agent = mongoose.model('Agent', AgentSchema);

async function checkAgents() {
    try {
        await mongoose.connect(process.env.MONGODB_ATLAS_URI);
        const agents = await Agent.find({ agentName: /AIBASE/i });
        console.log("AGENTS_DATA_START");
        console.log(JSON.stringify(agents, null, 2));
        console.log("AGENTS_DATA_END");
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkAgents();
