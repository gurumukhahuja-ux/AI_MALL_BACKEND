
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function checkDB() {
    try {
        await mongoose.connect(process.env.MONGODB_ATLAS_URI);
        console.log('--- Connection Info ---');
        console.log('Database Name:', mongoose.connection.db.databaseName);
        console.log('Collection Name: knowledge_vectors');

        const count = await mongoose.connection.db.collection('knowledge_vectors').countDocuments();
        console.log('Documents in collection:', count);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

checkDB();
