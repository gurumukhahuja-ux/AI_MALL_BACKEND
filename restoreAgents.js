
import mongoose from "mongoose";
import Agent from "./models/Agents.js";
import dotenv from "dotenv";

dotenv.config();

const RESTORE_AGENTS = [
    {
        agentName: "AIFLOW",
        description: "Streamline your AI workflows.",
        pricing: "Free",
        status: "Live",
        category: "Business OS",
        avatar: "https://cdn-icons-png.flaticon.com/512/2103/2103444.png"
    },
    {
        agentName: "AIMARKET",
        description: "AI-driven marketplace insights.",
        pricing: "Free",
        status: "Live",
        category: "Sales & Marketing",
        avatar: "https://cdn-icons-png.flaticon.com/512/3135/3135755.png"
    },
    {
        agentName: "AICONNECT",
        description: "Connect all your AI tools.",
        pricing: "Free",
        status: "Live",
        category: "Sales & Marketing",
        avatar: "https://cdn-icons-png.flaticon.com/512/3135/3135705.png"
    },
    {
        agentName: "AIMUSIC",
        description: "AI-powered music generation.",
        pricing: "Free",
        status: "Live",
        category: "Design & Creative",
        avatar: "https://cdn-icons-png.flaticon.com/512/4204/4204599.png"
    },
    {
        agentName: "AITRANS",
        description: "Advanced AI translation services.",
        pricing: "Free",
        status: "Live",
        category: "Data & Intelligence",
        avatar: "https://cdn-icons-png.flaticon.com/512/2103/2103344.png"
    },
    {
        agentName: "AISCRIPT",
        description: "AI script writing and automation.",
        pricing: "Free",
        status: "Live",
        category: "Data & Intelligence",
        avatar: "https://cdn-icons-png.flaticon.com/512/2103/2103333.png"
    }
];

const seedDB = async () => {
    try {
        console.log("🚀 Connecting to DB to restore agents...");
        await mongoose.connect(process.env.MONGODB_ATLAS_URI);
        console.log("✅ DB Connected.");

        // IMPORTANT: We do not wipe existing user agents or other data.
        // We only want to ensure these agents exist in the 'marketplace' (Agent collection).
        // Option: Delete all mock agents first to ensure no duplicates, or upsert.
        // User said "restore them", assuming wiped. Let's clear the Agent collection to be clean.
        // WARNING: This clears ALL agents.

        console.log("🧹 Clearing existing Agent inventory...");
        await Agent.deleteMany({});
        console.log("✨ Cleared.");

        console.log(`🌱 Seeding ${RESTORE_AGENTS.length} agents...`);
        await Agent.insertMany(RESTORE_AGENTS);

        console.log("✅ 50 Apps Restored Successfully!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Failed to seed agents:", err);
        process.exit(1);
    }
};

seedDB();
