import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

// Firebase configuration - These will be replaced with environment variables
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Check if Firebase is configured
const isFirebaseConfigured = () => {
    return firebaseConfig.apiKey && firebaseConfig.projectId;
};

// Initialize Firebase only if configured
let app = null;
let auth = null;
let googleProvider = null;

if (isFirebaseConfigured()) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();

    // Add scopes for additional user info
    googleProvider.addScope('email');
    googleProvider.addScope('profile');

    console.log("Firebase initialized successfully");
} else {
    console.warn("Firebase not configured. Google Sign-In will not be available.");
}

// Sign in with Google
export const signInWithGoogle = async () => {
    if (!auth || !googleProvider) {
        throw new Error("Firebase not configured");
    }

    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        // Get the Firebase ID token
        const idToken = await user.getIdToken();

        return {
            idToken,
            user: {
                uid: user.uid,
                email: user.email,
                name: user.displayName,
                photoURL: user.photoURL,
            },
        };
    } catch (error) {
        console.error("Google Sign-In error:", error);
        throw error;
    }
};

// Sign out from Firebase
export const signOutFromFirebase = async () => {
    if (!auth) return;

    try {
        await signOut(auth);
    } catch (error) {
        console.error("Firebase sign out error:", error);
    }
};

// Check if Firebase is available
export const isFirebaseAvailable = () => isFirebaseConfigured();

export { auth, googleProvider };
