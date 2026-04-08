import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useUserStore = create((set, get) => ({
	user: null,
	loading: false,
	checkingAuth: true,
	otpEmail: null,
	error: null,
	signup: async ({ name, email, password, confirmPassword, captchaToken }) => {
		set({ loading: true });

		if (password !== confirmPassword) {
			set({ loading: false });
			return toast.error("Passwords do not match");
		}

		try {
			const res = await axios.post("/auth/signup", { name, email, password, captchaToken });
			set({
				user: res.data.user,
				accessToken: res.data.accessToken,
				refreshToken: res.data.refreshToken,
				otpEmail: email,
				loading: false
			});
			toast.success("Signup successful. Please verify your email.");
			return { success: true };
		} catch (error) {
			set({ loading: false });
			toast.error(error.response.data.message || "An error occurred");
			return { success: false };
		}
	},

	verifyOtp: async (otp) => {
		set({ loading: true });
		try {
			const res = await axios.post('/auth/verify-otp', {
				email: get().otpEmail,
				otp
			});
			set({
				user: res.data,
				loading: false,
				otpEmail: null,
			});
			toast.success("OTP verified successfully!");
			return true; // Return success status
		} catch (error) {
			set({ loading: false });
			toast.error(error.response?.data?.message || "Invalid verification code");
			return false; // Return failure status
		}
	},

	resendOtp: async () => {
		set({ loading: true, error: null });
		try {
			await axios.post('/auth/resend-otp', { email: get().otpEmail });
			set({ loading: false });
			toast.success("OTP resent to your email");
		} catch (error) {
			set({ loading: false });
			toast.error(error.response?.data?.message || "An error occurred");
		}
	},

	login: async (email, password, captchaToken = null) => {
		set({ loading: true });

		try {
			const res = await axios.post("/auth/login", { email, password, captchaToken });
			set({ user: res.data, loading: false });
			toast.success("Logged in successfully");
		} catch (error) {
			set({ loading: false });
			toast.error(error.response.data.message || "An error occurred");
		}
	},

	logout: async () => {
		try {
			await axios.post("/auth/logout");
			set({ user: null });
			toast.success("Logged out successfully");
		} catch (error) {
			toast.error(error.response?.data?.message || "An error occurred during logout");
		}
	},

	// Google Auth Login
	googleLogin: async (idToken) => {
		set({ loading: true });
		try {
			const res = await axios.post("/auth/google", { idToken });
			set({ user: res.data, loading: false });
			toast.success("Signed in with Google successfully!");
			return { success: true };
		} catch (error) {
			set({ loading: false });
			const message = error.response?.data?.message || "Google sign-in failed";
			toast.error(message);
			return { success: false, error: message };
		}
	},

	// Update user profile
	updateProfile: async (profileData) => {
		set({ loading: true });
		try {
			const res = await axios.patch("/users/profile", profileData);
			set({ user: res.data, loading: false });
			toast.success("Profile updated successfully!");
			return { success: true };
		} catch (error) {
			set({ loading: false });
			toast.error(error.response?.data?.message || "Failed to update profile");
			return { success: false };
		}
	},

	// Upload profile picture
	uploadProfilePicture: async (file) => {
		set({ loading: true });
		try {
			const formData = new FormData();
			formData.append("profilePicture", file);

			const res = await axios.post("/users/profile-picture", formData, {
				headers: { "Content-Type": "multipart/form-data" },
			});

			set({ user: res.data.user, loading: false });
			toast.success("Profile picture updated!");
			return { success: true, profilePicture: res.data.profilePicture };
		} catch (error) {
			set({ loading: false });
			toast.error(error.response?.data?.message || "Failed to upload image");
			return { success: false };
		}
	},

	forgotPassword: async (email, captchaToken = null) => {
		set({ loading: true, error: null });
		try {
			await axios.post('/auth/forgot-password', { email, captchaToken });
			set({ loading: false });
			toast.success("Password reset email sent!");
		} catch (error) {
			set({ loading: false });
			toast.error(error.response?.data?.message || "An error occurred");
		}
	},


	resetPassword: async (token, newPassword) => {
		set({ loading: true, error: null });
		try {
			const res = await axios.post(`/auth/reset-password/${token}`, {
				newPassword
			});
			set({ loading: false });
			toast.success("Password reset successful!");
			return res.data;
		} catch (error) {
			set({ loading: false });
			toast.error(error.response?.data?.message || "Reset failed");
			throw error.response?.data || error;
		}
	},



	checkAuth: async () => {
		set({ checkingAuth: true });
        
        // Add a safety timeout to prevent infinite loading if server/redis is unresponsive
        const timeoutId = setTimeout(() => {
            const { checkingAuth } = get();
            if (checkingAuth) {
                console.warn("Auth check timed out, defaulting to guest state");
                set({ checkingAuth: false, user: null });
            }
        }, 8000);

		try {
			const response = await axios.get("/auth/profile");
            clearTimeout(timeoutId);
			set({ user: response.data, checkingAuth: false });
		} catch (error) {
            clearTimeout(timeoutId);
			console.log("Auth check error:", error.message);
			set({ checkingAuth: false, user: null });
		}
	},

	refreshToken: async () => {
		// Prevent multiple simultaneous refresh attempts
		if (get().checkingAuth) return;

		set({ checkingAuth: true });
		try {
			const response = await axios.post("/auth/refresh-token");
			set({ checkingAuth: false });
			return response.data;
		} catch (error) {
			set({ user: null, checkingAuth: false });
			toast.error("Session expired. Please login again.");
			throw error;
		}
	},
}));

// TODO: Implement the axios interceptors for refreshing access token

// Axios interceptor for token refresh
let refreshPromise = null;

axios.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;
		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;

			try {
				// If a refresh is already in progress, wait for it to complete
				if (refreshPromise) {
					await refreshPromise;
					return axios(originalRequest);
				}

				// Start a new refresh process
				refreshPromise = useUserStore.getState().refreshToken();
				await refreshPromise;
				refreshPromise = null;

				return axios(originalRequest);
			} catch (refreshError) {
				// If refresh fails, redirect to login or handle as needed
				useUserStore.getState().logout();
				return Promise.reject(refreshError);
			}
		}
		return Promise.reject(error);
	}
);
