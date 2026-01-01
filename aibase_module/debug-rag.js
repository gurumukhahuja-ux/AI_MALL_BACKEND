const mongoose = require('mongoose');
const { MongoDBAtlasVectorSearch } = require("@langchain/mongodb");
const { HuggingFaceTransformersEmbeddings } = require("@langchain/community/embeddings/hf_transformers");
require('dotenv').config();

const runDebug = async () => {
    try {
        if (!process.env.MONGODB_ATLAS_URI) {
            throw new Error("MONGODB_ATLAS_URI is not defined in .env");
        }
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGODB_ATLAS_URI);
        console.log("Connected.");

        // Initialize Embeddings
        console.log("Initializing Embeddings...");
        const embeddings = new HuggingFaceTransformersEmbeddings({
            modelName: "Xenova/all-MiniLM-L6-v2",
        });

        const collection = mongoose.connection.db.collection("knowledge_vectors");

        const vectorStore = new MongoDBAtlasVectorSearch(embeddings, {
            collection: collection,
            indexName: "default", // Ensure this matches Atlas UI
            textKey: "text",
            embeddingKey: "embedding",
        });

        const query = "What are the company requirements?"; // Adjust based on sample text seen
        console.log(`\nPerforming Similarity Search for: "${query}"`);

        const results = await vectorStore.similaritySearchWithScore(query, 3);

        console.log(`\nFound ${results.length} results:`);
        results.forEach(([doc, score], i) => {
            console.log(`\n[${i + 1}] Score: ${score}`);
            console.log(`Content: ${doc.pageContent ? doc.pageContent.substring(0, 100) : "No Content"}...`);
        });

        process.exit(0);

    } catch (error) {
        console.error("Debug Error:", error);
        process.exit(1);
    }
};

runDebug();
