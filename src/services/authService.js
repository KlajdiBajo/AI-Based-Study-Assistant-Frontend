import { api } from "../lib";

export const registerUser = (userData) => {
  return api.post("/api/v1/auth/register", userData);
};

export const verifyRegistration = (otpData) => {
  return api.post("/api/v1/auth/verify", otpData);
};

export const loginUser = (loginData) => {
  return api.post("/api/v1/auth/login", loginData);
};

export const verifyOtp = (otpData) => {
  return api.post("/api/v1/auth/verify-otp", otpData);
};

export const forgotPassword = (email) => {
  return api.post("/api/v1/auth/forgot-password", { email });
};

export const resetPassword = (passwordData) => {
  return api.post("/api/v1/auth/reset-password", passwordData);
};

export const refreshToken = (token) => {
  return api.post("/api/v1/auth/getRefreshToken", { 
    refreshToken: token 
  });
};