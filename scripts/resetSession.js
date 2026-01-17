const mongoose = require('mongoose');
const config = require('../wasi');

(async () => {
    // Connect to DB
    const uri = config.mongoDbUrl || process.env.MONGODB_URI;
    if (!uri) {
        console.error('No MONGODB_URI found.');
        process.exit(1);
    }

    await mongoose.connect(uri);
    console.log('Connected to MongoDB.');

    // Construct Collection Name
    // Logic from session.js + mongoAuth.js
    const sessionId = process.env.SESSION_ID || 'wasi_session';
    const collectionName = `${sessionId}_auth_authstates`; // Mongoose lowercases model names => collection. 
    // Wait, Mongoose model 'ModelName' -> collection 'modelnames' (pluralized, lowercased).
    // In mongoAuth.js: ModelName = `${collectionName}_AuthState`
    // e.g. "wasi_session_auth_AuthState"
    // Collection likely: "wasi_session_auth_authstates"

    // Let's list collections to be sure
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available Collections:', collections.map(c => c.name));

    const targetPattern = new RegExp(`${sessionId}.*auth`, 'i');

    for (const col of collections) {
        if (targetPattern.test(col.name)) {
            console.log(`Dropping collection: ${col.name}`);
            await mongoose.connection.db.dropCollection(col.name);
        }
    }

    console.log('Session Cleared from MongoDB.');
    process.exit(0);
})();
