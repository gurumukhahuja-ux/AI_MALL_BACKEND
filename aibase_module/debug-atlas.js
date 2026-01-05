const mongoose = require('mongoose');
require('dotenv').config();

const runDebug = async () => {
    try {
        if (!process.env.MONGODB_ATLAS_URI) {
            throw new Error("MONGODB_ATLAS_URI is not defined in .env");
        }
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGODB_ATLAS_URI, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
        });
        console.log("Connected.");

        const db = mongoose.connection.db;

        // 1. List Collections
        const collections = await db.listCollections().toArray();
        console.log("\n--- Collections Found ---");
        collections.forEach(c => console.log(` - ${c.name}`));

        // 2. Check knowledge_vectors
        const vectorCollection = db.collection('knowledge_vectors');
        const count = await vectorCollection.countDocuments();
        console.log(`\n--- 'knowledge_vectors' Count: ${count} ---`);

        if (count > 0) {
            const sample = await vectorCollection.findOne({});
            console.log("\n--- Sample Document (Keys Only) ---");
            console.log(Object.keys(sample));

            console.log("\n--- Checking Critical Fields ---");
            console.log(`Has 'embedding'? ${!!sample.embedding} (Length: ${sample.embedding?.length})`);
            console.log(`Has 'text'? ${!!sample.text}`);
            console.log(`Has 'pageContent'? ${!!sample.pageContent}`);

            if (sample.text) {
                console.log(`Sample Text: "${sample.text.substring(0, 50)}..."`);
            }
        } else {
            console.log("Collection is EMPTY. RAG will not work.");
        }

        process.exit(0);

    } catch (error) {
        console.error("Debug Error:", error);
        process.exit(1);
    }
};

runDebug();
