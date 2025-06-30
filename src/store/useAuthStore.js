import { create } from "zustand";
import { persist } from "zustand/middleware";

import { api } from "../lib";

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const response = await api.post("/api/v1/auth/login", {
          email,
          password,
        });
        
        console.log('Login response:', response.data);
        
        // Extract data from your actual response structure  
        const { accessToken, refreshToken, email: userEmail, firstName, lastName, role, verified, isVerified } = response.data;
        
        console.log('Extracted accessToken:', accessToken);
        console.log('Extracted refreshToken:', refreshToken);
        
        // Create user object with email as ID (temporary workaround)
        const user = {
          id: userEmail, // Use email as ID temporarily
          email: userEmail,
          firstName,
          lastName,
          role,
          verified: verified || isVerified
        };
        
        set({ user, accessToken, refreshToken, isAuthenticated: true });
        
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("userId", userEmail); // Store email as userId
        
        console.log('Stored in localStorage:');
        console.log('accessToken:', localStorage.getItem('accessToken'));
        console.log('userId:', localStorage.getItem('userId'));
      },

      // Add method to update tokens after refresh
      updateTokens: (newAccessToken, userData = null) => {
        set((state) => ({
          accessToken: newAccessToken,
          user: userData ? { ...state.user, ...userData } : state.user
        }));
        
        localStorage.setItem("accessToken", newAccessToken);
        if (userData) {
          localStorage.setItem("user", JSON.stringify({ ...get().user, ...userData }));
        }
      },

      // Method to check if user is authenticated
      checkAuth: () => {
        const token = localStorage.getItem("accessToken");
        const refreshToken = localStorage.getItem("refreshToken");
        const user = localStorage.getItem("user");
        
        if (token && refreshToken && user) {
          set({
            accessToken: token,
            refreshToken: refreshToken,
            user: JSON.parse(user),
            isAuthenticated: true
          });
          return true;
        }
        
        return false;
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        localStorage.removeItem("userId");
      },

      // Method to force logout (called when refresh fails)
      forceLogout: () => {
        get().logout();
        // Optionally redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }),
    {
      name: "auth-storage",
    }
  )
);

export default useAuthStore;