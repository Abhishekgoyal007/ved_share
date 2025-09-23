import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useProfileStore = create((set) => ({
  profileData: null,
  loading: false,
  error: null,

  fetchProfileData: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get("/profile");
      set({ profileData: res.data, loading: false });
    } catch (error) {
      set({ loading: false, error: error.response?.data?.message || "Failed to load profile" });
      toast.error(error.response?.data?.message || "Failed to load profile");
    }
  },
}));
