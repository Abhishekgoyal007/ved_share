import admin from "firebase-admin";

// Initialize Firebase Admin SDK
// In production, use environment variables or a service account JSON file
const initializeFirebase = () => {
    if (admin.apps.length === 0) {
        // Check if we have a service account key file path
        if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
            // Parse the JSON service account key from environment variable
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
        } else if (process.env.FIREBASE_PROJECT_ID) {
            // Alternative: Use individual credentials (for deployment)
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                }),
            });
        } else {
            console.warn("Firebase not configured. Google Auth will not work.");
            return null;
        }
        console.log("Firebase Admin SDK initialized successfully");
    }
    return admin;
};

// Initialize on module load
const firebaseAdmin = initializeFirebase();

// Verify Firebase ID Token
export const verifyFirebaseToken = async (idToken) => {
    if (!firebaseAdmin) {
        throw new Error("Firebase Admin SDK not initialized");
    }

    try {
        const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
        return decodedToken;
    } catch (error) {
        console.error("Error verifying Firebase token:", error);
        throw error;
    }
};

export default firebaseAdmin;
