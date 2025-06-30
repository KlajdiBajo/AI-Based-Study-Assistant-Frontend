import { useEffect } from "react";
import {
  Brain,
  Calendar,
  FileText,
  Lightbulb,
  Target,
  TrendingUp,
  Trophy,
} from "lucide-react";

import { StatCard } from "../components";
import { useAuthStore, useDashboardStore } from "../store";

const Dashboard = () => {
  const {
    overview,
    performanceTrends,
    recentActivities,
    recommendations,
    weakAreas,
    studyStreak,
    notePerformance,
    isLoading,
    error,
    fetchDashboardData,
  } = useDashboardStore();

  const { user } = useAuthStore();

  useEffect(() => {
    if (user && localStorage.getItem('accessToken')) {
      console.log('User and token exist, calling fetchDashboardData');
      fetchDashboardData();
    } else {
      console.log('No user or token, skipping dashboard fetch');
    }
  }, [fetchDashboardData, user]);

  useEffect(() => {
    console.log('Dashboard Data:');
    console.log('Overview:', overview);
    console.log('Performance Trends:', performanceTrends);
    console.log('Recent Activities:', recentActivities);
    console.log('Recommendations:', recommendations);
    console.log('Weak Areas:', weakAreas);
    console.log('Study Streak:', studyStreak);
    console.log('Note Performance:', notePerformance);
  }, [overview, performanceTrends, recentActivities, recommendations, weakAreas, studyStreak, notePerformance]);

  const loadUserData = async () => {
    try {
      const response = await api.get("/api/v1/auth/myProfile");
      setUser(response.data);
    } catch (error) {
      console.error("Failed to load user:", error);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  if (isLoading) {
    return <div className="text-center p-8">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  }

  const stats = [
    {
      label: "Notes Available",
      value: notePerformance?.length || 0,
      icon: FileText,
      color: "blue",
    },
    {
      label: "Quizzes Completed",
      value: overview?.totalQuizzesTaken || 0,
      icon: Trophy,
      color: "green",
    },
    {
      label: "Study Streak",
      value: `${studyStreak?.currentStreak || 0} days`,
      icon: Calendar,
      color: "orange",
    },
    {
      label: "Average Score",
      value: overview?.averageScore ? `${Math.round(overview.averageScore)}%` : "N/A",
      icon: Target,
      color: "purple",
    },
  ];

  return (
    // ✅ Removed wrapper divs and Navbar - Wrapper component handles layout
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {user?.firstName || "User"}! 👋
        </h1>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Today</p>
          <p className="text-lg font-semibold text-foreground">
            {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Performance Trends
            </h2>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="space-y-4">
            {performanceTrends?.dailyScores?.length > 0 ? (
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  {performanceTrends.summary}
                </p>
                <div className="text-sm">
                  <span className={`font-medium ${
                    performanceTrends.trendDirection === 'IMPROVING' ? 'text-green-600' :
                    performanceTrends.trendDirection === 'DECLINING' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {performanceTrends.trendDirection}
                  </span>
                  {performanceTrends.trendPercentage !== 0 && (
                    <span className="ml-2 text-muted-foreground">
                      ({Math.abs(performanceTrends.trendPercentage).toFixed(1)}%)
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Not enough data to show performance trends.
              </p>
            )}
            <div className="p-4 bg-gradient-to-r from-primary to-primary/80 rounded-lg text-primary-foreground">
              <div className="flex items-center space-x-2 mb-2">
                <Brain className="w-5 h-5" />
                <span className="font-medium">AI Recommendation</span>
              </div>
              <p className="text-sm opacity-90">
                {recommendations?.length > 0
                  ? recommendations[0]?.description || recommendations[0]?.title
                  : "Keep up the great work!"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Recent Activity
          </h2>
          <div className="space-y-3">
            {recentActivities?.length > 0 ? (
              recentActivities.map((activity, index) => (
                <div
                  key={activity.relatedId || index}
                  className="flex items-start space-x-3 p-3 hover:bg-accent rounded-lg transition-colors"
                >
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                    {activity.score && (
                      <p className="text-xs text-blue-600 mt-1">
                        Score: {activity.score}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No recent activity.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Areas for Improvement
        </h2>
        {weakAreas?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {weakAreas.map((area, index) => (
              <div
                key={area.fileName || index}
                className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-destructive">{area.fileName}</h3>
                  <span className="text-sm bg-destructive/20 text-destructive px-2 py-1 rounded-full">
                    {Math.round(area.errorRate)}% error rate
                  </span>
                </div>
                <p className="text-sm text-destructive/80 mb-2">
                  {area.mistakeCount} mistakes out of {area.questionsAttempted} questions
                </p>
                <p className="text-sm text-destructive/80">
                  {area.recommendedAction}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-6">
            <Lightbulb className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">
              No specific weak areas identified. Great job!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;