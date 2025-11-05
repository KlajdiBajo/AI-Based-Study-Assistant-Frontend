import { api } from "../lib";

export const getCurrentUser = () => {
  return api.get("/api/v1/myProfile");
};

export const updateUserProfile = (userData) => {
  return api.put("/user/profile", userData);
};
