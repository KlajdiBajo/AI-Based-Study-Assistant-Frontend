import { api } from "../lib";

export const getDashboardOverview = () => {
  return api.get("/dashboard/overview");
};

export const getPerformanceTrends = (days = 30) => {
  return api.get("/dashboard/performance-trends", { params: { days } });
};

export const getRecentActivities = (limit = 10) => {
  return api.get("/dashboard/recent-activities", { params: { limit } });
};

export const getStudyRecommendations = () => {
  return api.get("/dashboard/recommendations");
};

export const getWeakAreas = () => {
  return api.get("/dashboard/weak-areas");
};

export const getStudyStreak = () => {
  return api.get("/dashboard/study-streak");
};

export const getNotePerformance = () => {
  return api.get("/dashboard/note-performance");
};
