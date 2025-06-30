import { api } from "../lib";

export const getCurrentUser = () => {
  return api.get("/api/v1/profile/myProfile");
};

export const updateUserProfile = (userData) => {
  return api.put("/user/profile", userData);
};