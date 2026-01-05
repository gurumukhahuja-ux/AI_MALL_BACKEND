
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function checkIndex() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_ATLAS_URI);
        console.log('Connected.');

        const db = mongoose.connection.db;
        const collection = db.collection('knowledge_vectors');

        console.log('\n--- Collection Stats ---');
        const count = await collection.countDocuments();
        console.log(`Total documents in knowledge_vectors: ${count}`);

        if (count > 0) {
            const sample = await collection.findOne();
            console.log('Sample document fields:', Object.keys(sample));
            if (sample.embedding) {
                console.log(`Embedding size: ${sample.embedding.length}`);
            } else {
                console.log('❌ CRITICAL: No "embedding" field found in sample document!');
            }
        }

        console.log('\n--- Checking Search Indexes ---');
        try {
            const cursor = collection.listSearchIndexes();
            const indexes = await cursor.toArray();

            if (indexes.length === 0) {
                console.log('❌ NO Atlas Search/Vector indexes found on this collection.');
            } else {
                console.log(`Found ${indexes.length} search index(es):`);
                indexes.forEach(idx => {
                    console.log(`- Name: ${idx.name}`);
                    console.log(`  State: ${idx.queryable ? 'Queryable' : 'Building/Error'}`);
                    // Use definition or latestDefinition depending on driver version
                    const def = idx.latestDefinition || idx.definition;
                    console.log(`  Definition: ${JSON.stringify(def, null, 2)}`);
                });

                const hasDefault = indexes.find(i => i.name === 'default');
                if (hasDefault) {
                    console.log('\n✅ "default" index exists.');
                } else {
                    console.log('\n❌ "default" index NOT found. AIBASE expects a vector search index named "default".');
                }
            }
        } catch (e) {
            console.log('⚠️ Could not list search indexes programmatically.');
            console.log('Error:', e.message);
            console.log('\nMANUAL CHECK REQUIRED:');
            console.log('1. Go to MongoDB Atlas UI');
            console.log('2. Navigate to "Atlas Search"');
            console.log('3. Ensure there is a "Vector Search" index on "AIBASE.knowledge_vectors"');
            console.log('4. The index MUST be named "default"');
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

checkIndex();
