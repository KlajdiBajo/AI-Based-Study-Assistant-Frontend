import { create } from "zustand";
import { persist } from "zustand/middleware";

import api from "../lib/api"; // Adjust path as needed

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      /**
       * Login user - tokens are automatically set in HttpOnly cookies by the server
       */
      login: async (email, password) => {
        const response = await api.post("/api/v1/auth/login", {
          email,
          password,
        });

        console.log("Login response:", response.data);

        // Extract user data from response (no tokens in response body)
        const {
          email: userEmail,
          firstName,
          lastName,
          role,
          isVerified,
        } = response.data;

        // Create user object
        const user = {
          email: userEmail,
          firstName,
          lastName,
          role,
          verified: isVerified,
        };

        // Store only user info, not tokens
        set({ user, isAuthenticated: true });

        console.log("User logged in:", user);
      },

      /**
       * Check if user is authenticated by calling a protected endpoint
       */
      checkAuth: async () => {
        try {
          console.log("Checking authentication...");

          const response = await api.get("/api/v1/myProfile");

          if (response.data) {
            const userData = {
              email: response.data.email,
              firstName: response.data.firstName,
              lastName: response.data.lastName,
              role: response.data.role,
              verified: response.data.isOfficiallyEnabled,
            };

            set({
              user: userData,
              isAuthenticated: true,
            });

            console.log("Auth valid:", userData.email);
            return true;
          }
        } catch (error) {
          console.error("Auth check failed:", error.message);

          // Don't set state here - let the interceptor handle redirect
          if (error.response?.status !== 401) {
            set({ user: null, isAuthenticated: false });
          }

          return false;
        }
      },

      /**
       * Logout user - calls backend to revoke refresh token and clear cookies
       */
      logout: async () => {
        try {
          // Call logout endpoint to revoke refresh token
          await api.post("/api/v1/auth/logout");
          console.log("Logout successful");
        } catch (error) {
          console.error("Logout error:", error);
          // Continue with local logout even if API call fails
        } finally {
          // Clear local state
          set({
            user: null,
            isAuthenticated: false,
          });
        }
      },

      /**
       * Force logout (called when auth fails)
       */
      forceLogout: () => {
        set({
          user: null,
          isAuthenticated: false,
        });

        // Redirect to login
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      },
    }),
    {
      name: "auth-storage",
      // CRITICAL: Only persist user info, NOT tokens
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
