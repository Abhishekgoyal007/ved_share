import { useState } from "react";
import { motion } from "framer-motion";
import { Loader } from "lucide-react";
import { signInWithGoogle, isFirebaseAvailable } from "../lib/firebase";
import { useUserStore } from "../stores/useUserStore";
import toast from "react-hot-toast";

const GoogleAuthButton = ({ onSuccess, className = "" }) => {
    const [loading, setLoading] = useState(false);
    const { googleLogin } = useUserStore();

    // Don't render if Firebase is not configured
    if (!isFirebaseAvailable()) {
        return null;
    }

    const handleGoogleSignIn = async () => {
        setLoading(true);
        try {
            // Sign in with Google via Firebase
            const { idToken } = await signInWithGoogle();

            // Send token to backend for verification
            const result = await googleLogin(idToken);

            if (result.success && onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error("Google Sign-In error:", error);

            // Handle specific error codes
            if (error.code === "auth/popup-closed-by-user") {
                toast.error("Sign-in cancelled");
            } else if (error.code === "auth/network-request-failed") {
                toast.error("Network error. Please check your connection.");
            } else if (error.message?.includes("Firebase not configured")) {
                toast.error("Google Sign-In is not configured");
            } else {
                toast.error("Failed to sign in with Google");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className={`w-full flex justify-center items-center gap-3 py-3 px-4 
        bg-white hover:bg-gray-100 text-gray-700 font-medium
        border border-gray-300 rounded-xl shadow-sm
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}`}
        >
            {loading ? (
                <>
                    <Loader className="animate-spin h-5 w-5" />
                    <span>Signing in...</span>
                </>
            ) : (
                <>
                    {/* Google Icon SVG */}
                    <svg
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                        />
                        <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                        />
                        <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                        />
                        <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                        />
                    </svg>
                    <span>Continue with Google</span>
                </>
            )}
        </motion.button>
    );
};

export default GoogleAuthButton;
