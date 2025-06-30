import { create } from "zustand";

import * as dashboardService from "../services/dashboardService";

const useDashboardStore = create((set) => ({
  overview: null,
  performanceTrends: [],
  recentActivities: [],
  recommendations: [],
  weakAreas: [],
  studyStreak: null,
  notePerformance: [],
  isLoading: false,
  error: null,

  fetchDashboardData: async () => {
    try {
      set({ isLoading: true, error: null });

      const [
        overview,
        performanceTrends,
        recentActivities,
        recommendations,
        weakAreas,
        studyStreak,
        notePerformance,
      ] = await Promise.all([
        dashboardService.getDashboardOverview(),
        dashboardService.getPerformanceTrends(),
        dashboardService.getRecentActivities(),
        dashboardService.getStudyRecommendations(),
        dashboardService.getWeakAreas(),
        dashboardService.getStudyStreak(),
        dashboardService.getNotePerformance(),
      ]);

      set({
        overview: overview.data,
        performanceTrends: performanceTrends.data,
        recentActivities: recentActivities.data,
        recommendations: recommendations.data,
        weakAreas: weakAreas.data,
        studyStreak: studyStreak.data,
        notePerformance: notePerformance.data,
        isLoading: false,
      });
    } catch (err) {
      if (err.response?.status !== 401) {
        set({
        error: err.response?.data?.message || "Failed to fetch dashboard data.",
        isLoading: false,
        });
      } else {
        set({isLoading: false});
      }
    }
  },

  retryFetch: () => {
    const { fetchDashboardData } = get();
    fetchDashboardData();
  },

  clearError: () => {
    set({ error: null })
  }
}));

export default useDashboardStore;
