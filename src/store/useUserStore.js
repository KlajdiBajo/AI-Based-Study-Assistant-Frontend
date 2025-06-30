import { create } from "zustand";
import { getCurrentUser } from "../services/userService";

const useUserStore = create((set, get) => ({
  user: null,
  isLoading: false,
  error: null,

  fetchCurrentUser: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await getCurrentUser();
      set({ 
        user: response.data, 
        isLoading: false 
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to fetch user data.",
        isLoading: false,
      });
    }
  },

  setUser: (userData) => {
    set({ user: userData });
  },

  clearUser: () => {
    set({ user: null, error: null });
  },

  reset: () => {
    set({
      user: null,
      isLoading: false,
      error: null,
    });
  },
}));

export default useUserStore;