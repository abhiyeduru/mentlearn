const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    let serviceAccount = null;

    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        try {
            serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
            console.log('✅ Firebase credentials loaded from environment variable');
        } catch (e) {
            console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:', e.message);
        }
    }

    if (!serviceAccount && process.env.FIREBASE_CREDENTIALS_PATH) {
        const credPath = process.env.FIREBASE_CREDENTIALS_PATH;
        const resolvedPath = credPath.startsWith('/') ? credPath : path.join(__dirname, '..', credPath);
        if (fs.existsSync(resolvedPath)) {
            serviceAccount = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
            console.log('✅ Firebase credentials loaded from:', credPath);
        }
    }

    if (!serviceAccount) {
        const localPath = path.join(__dirname, '..', 'firebase-service-account.json');
        if (fs.existsSync(localPath)) {
            serviceAccount = JSON.parse(fs.readFileSync(localPath, 'utf8'));
            console.log('✅ Firebase credentials loaded from local file');
        }
    }

    if (serviceAccount) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('✅ Firebase Admin initialized in firebase-admin.js');
    } else {
        console.warn('⚠️ Firebase Admin not initialized - no credentials found');
    }
}

const db = admin.firestore();

module.exports = { admin, db };
