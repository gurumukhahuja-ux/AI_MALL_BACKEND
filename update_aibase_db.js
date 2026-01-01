import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const AgentSchema = new mongoose.Schema({}, { strict: false });
const Agent = mongoose.model('Agent', AgentSchema);

async function updateAIBASE() {
    try {
        await mongoose.connect(process.env.MONGODB_ATLAS_URI);
        const result = await Agent.findOneAndUpdate(
            { agentName: /AIBASE/i },
            {
                agentName: "AIBASE ™",
                description: "Advanced AI Knowledge Base with RAG (Retrieval-Augmented Generation), Document Intelligence, and Real-time Chat capabilities.",
                url: "/agents/aibase",
                category: "Data & Intelligence",
                status: "Live"
            },
            { new: true }
        );
        if (result) {
            console.log("UPDATE_SUCCESS");
            console.log(JSON.stringify(result, null, 2));
        } else {
            console.log("AGENT_NOT_FOUND");
        }
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

updateAIBASE();
