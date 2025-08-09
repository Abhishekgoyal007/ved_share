import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useUserStore = create((set, get) => ({
	user: null,
	loading: false,
	checkingAuth: true,
	otpEmail: null,  
	error: null,     
	signup: async ({ name, email, password, confirmPassword }) => {
		set({ loading: true });

		if (password !== confirmPassword) {
			set({ loading: false });
			return toast.error("Passwords do not match");
		}

		try {
			const res = await axios.post("/auth/signup", { name, email, password });
			set({ 
      user: res.data.user,
      accessToken: res.data.accessToken,
      refreshToken: res.data.refreshToken,
      otpEmail: email,
      loading: false
    });
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
  } catch (error) {
    set({ loading: false });
    toast.error(error.response?.data?.message || "An error occurred");
  }
},

	login: async (email, password) => {
		set({ loading: true });

		try {
			const res = await axios.post("/auth/login", { email, password });

			set({ user: res.data, loading: false });
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

forgotPassword: async (email) => {
  set({ loading: true, error: null });
  try {
    await axios.post('/auth/forgot-password', { email });
    set({ loading: false });
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
    return res.data; 
  } catch (error) {
    set({ loading: false });
    throw error.response?.data || error;
  }
},



	checkAuth: async () => {
		set({ checkingAuth: true });
		try {
			const response = await axios.get("/auth/profile");
			set({ user: response.data, checkingAuth: false });
		} catch (error) {
			console.log(error.message);
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
