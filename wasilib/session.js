const {
    useMultiFileAuthState,
    fetchLatestWaWebVersion,
    makeCacheableSignalKeyStore,
    makeWASocket,
    Browsers
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const config = require('../wasi');

// Define Schema for Session Data
const SessionSchema = new mongoose.Schema({
    _id: String, // We will use the filename as ID (e.g. "creds.json", "app-state-sync-key-....json")
    data: Object // The JSON content
});

async function wasi_connectSession(usePairingCode = false) {
    const sessionId = config.sessionId || 'wasi_session';
    const COLLECTION_NAME = `${sessionId}_auth_backup`; // Distinct collection for backup

    // Dynamic Model
    let SessionModel;
    try {
        SessionModel = mongoose.model(`${sessionId}_Session_Backup`);
    } catch {
        SessionModel = mongoose.model(`${sessionId}_Session_Backup`, SessionSchema, COLLECTION_NAME); // Force collection name
    }

    const AUTH_DIR = path.join(__dirname, '../auth_info');

    // -------------------------------------------------------------------------
    // 1. RESTORE PHASE: If local folder empty/missing, try restore from DB
    // -------------------------------------------------------------------------
    if (!fs.existsSync(AUTH_DIR)) {
        fs.mkdirSync(AUTH_DIR, { recursive: true });
    }

    const localFiles = fs.readdirSync(AUTH_DIR);
    if (localFiles.length === 0 && process.env.MONGODB_URI) {
        console.log('🔄 Session: Local cache empty. Attempting restore from MongoDB...');
        try {
            const docs = await SessionModel.find({});
            if (docs.length > 0) {
                for (const doc of docs) {
                    const filePath = path.join(AUTH_DIR, doc._id);
                    fs.writeFileSync(filePath, JSON.stringify(doc.data, null, 2));
                }
                console.log(`✅ Session: Restored ${docs.length} files from MongoDB.`);
            } else {
                console.log('ℹ️ Session: No backup found in MongoDB. Starting fresh.');
            }
        } catch (err) {
            console.error('❌ Session Restore Failed:', err);
        }
    }

    // -------------------------------------------------------------------------
    // 2. INITIALIZE LOCAL AUTH STATE
    // -------------------------------------------------------------------------
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');

    // -------------------------------------------------------------------------
    // 3. BACKUP INTERCEPTOR
    // -------------------------------------------------------------------------
    // We wrap the saveCreds and keys.set to perform async backups

    const backupToDB = async (id, data) => {
        if (!process.env.MONGODB_URI) return;
        try {
            await SessionModel.findOneAndUpdate(
                { _id: id },
                { data: data },
                { upsert: true, new: true }
            );
        } catch (e) {
            console.error(`Warning: Failed to backup ${id} to DB`, e.message);
        }
    };

    const deleteFromDB = async (id) => {
        if (!process.env.MONGODB_URI) return;
        try {
            await SessionModel.findOneAndDelete({ _id: id });
        } catch (e) { /* ignore */ }
    }

    // Wrap saveCreds
    const originalSaveCreds = saveCreds;
    const wrappedSaveCreds = async () => {
        await originalSaveCreds(); // Save to disk first
        // Fire and forget backup (or await if critical, but for speed let's dont block too long)
        // creds.json is the most important file
        /* 
           Note: valid 'creds' object is in 'state.creds'. 
           useMultiFileAuthState saves it to 'creds.json'.
        */
        backupToDB('creds.json', state.creds);
    };

    // Wrap keys.set
    // valid keys are in state.keys
    // But useMultiFileAuthState returns a `keys` object that handles get/set.
    const originalKeysSet = state.keys.set;
    state.keys.set = async (data) => {
        await originalKeysSet(data); // Save to disk

        // Backup changed keys
        const tasks = [];
        for (const category in data) {
            for (const id in data[category]) {
                const val = data[category][id];
                const filename = `${category}-${id}.json`;
                if (val) {
                    tasks.push(backupToDB(filename, val));
                } else {
                    tasks.push(deleteFromDB(filename));
                }
            }
        }
        await Promise.all(tasks);
    };


    let version;
    try {
        const v = await fetchLatestWaWebVersion();
        version = v.version;
    } catch (e) {
        version = [2, 3000, 1015901307];
    }

    const socketOptions = {
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        auth: {
            creds: state.creds,
            // We use the filesystem store, but we wrap it to intercept writes?
            // Actually `state.keys` IS the set/get interface. We successfully wrapped `set` above.
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
        },
        browser: Browsers.ubuntu('Chrome'),
        generateHighQualityLinkPreview: true,
        syncFullHistory: false,
        retryRequestDelayMs: 5000,
        keepAliveIntervalMs: 10000,
        connectTimeoutMs: 60000,
    };

    const wasi_sock = makeWASocket(socketOptions);

    return { wasi_sock, saveCreds: wrappedSaveCreds };
}

module.exports = { wasi_connectSession };
