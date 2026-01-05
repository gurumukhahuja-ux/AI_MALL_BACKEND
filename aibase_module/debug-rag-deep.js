const mongoose = require('mongoose');
const { HuggingFaceTransformersEmbeddings } = require("@langchain/community/embeddings/huggingface_transformers");
const { MongoDBAtlasVectorSearch } = require("@langchain/mongodb");
require('dotenv').config();

const runDebug = async () => {
    try {
        console.log("1. Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
        });
        console.log("   ✅ Connected.");

        const collection = mongoose.connection.db.collection("knowledge_vectors");

        // 2. Check Data
        const count = await collection.countDocuments();
        console.log(`\n2. Data Check:`);
        console.log(`   - Total Documents in 'knowledge_vectors': ${count}`);

        if (count === 0) {
            console.error("   ❌ Collection is EMPTY. Upload failed to stick.");
            process.exit(1);
        }

        const sample = await collection.findOne({});
        console.log(`   - Sample Document Structure:`);
        console.log(JSON.stringify(sample, null, 2));

        const hasEmbedding = sample.embedding && Array.isArray(sample.embedding) && sample.embedding.length > 0;
        const hasText = !!sample.text;

        if (!hasEmbedding) console.error("   ❌ Missing 'embedding' field in doc!");
        else console.log(`   ✅ 'embedding' field present. Length: ${sample.embedding.length}`);

        if (!hasText) console.error("   ❌ Missing 'text' field (configured as textKey)!");
        else console.log(`   ✅ 'text' field present.`);

        // 3. Test Vector Search
        console.log(`\n3. Testing Vector Search (Raw)...`);
        console.log("   - Initializing Embeddings...");
        constembeddings = new HuggingFaceTransformersEmbeddings({
            modelName: "Xenova/all-MiniLM-L6-v2",
        });

        const vectorStore = new MongoDBAtlasVectorSearch(embeddings, {
            collection: collection,
            indexName: "default",
            textKey: "text",
            embeddingKey: "embedding",
        });

        console.log("   - Running Similarity Search for 'test'...");
        const results = await vectorStore.similaritySearch("test", 1);

        if (results.length > 0) {
            console.log("   ✅ Search SUCCESS!");
            console.log(`   - Found: "${results[0].pageContent.substring(0, 50)}..."`);
        } else {
            console.error("   ❌ Search returned 0 results. Index 'default' might be missing or misconfigured.");
        }

        process.exit(0);
    } catch (error) {
        console.error("\n❌ DEBUG FAILED:", error);
        process.exit(1);
    }
};

runDebug();
