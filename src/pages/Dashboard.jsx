import React from 'react';
import { Book, Trophy, Clock, TrendingUp, FileText, Brain, Target, Calendar } from 'lucide-react';

export const Dashboard = () => {
  const stats = [
    { label: 'Notes Uploaded', value: '24', icon: FileText, color: 'blue' },
    { label: 'Quizzes Completed', value: '15', icon: Trophy, color: 'green' },
    { label: 'Study Streak', value: '3 days', icon: Calendar, color: 'orange' },
    { label: 'Average Score', value: '82%', icon: Target, color: 'purple' }
  ];

  const recentActivity = [
    { action: 'Completed quiz "Biology Chapter 1"', score: '9/10', time: '2 hours ago' },
    { action: 'Generated summary for "Physics Notes"', score: null, time: '4 hours ago' },
    { action: 'Uploaded "Mathematics Calculus.pdf"', score: null, time: '1 day ago' },
    { action: 'Completed quiz "Chemistry Basics"', score: '7/8', time: '2 days ago' }
  ];

  const weakAreas = [
    { subject: 'Physics Notes', errorRate: '45%', recommendation: 'Review recommended' },
    { subject: 'Advanced Math', errorRate: '38%', recommendation: 'Practice more problems' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">Welcome back, John! 👋</h1>
        <div className="text-right">
          <p className="text-sm text-slate-500">Today</p>
          <p className="text-lg font-semibold text-slate-700">{new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: 'bg-blue-500 text-blue-500',
            green: 'bg-green-500 text-green-500',
            orange: 'bg-orange-500 text-orange-500',
            purple: 'bg-purple-500 text-purple-500'
          };

          return (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-800 mt-2">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg bg-opacity-10 flex items-center justify-center ${colorClasses[stat.color]}`}>
                  <Icon className={`w-6 h-6 ${colorClasses[stat.color].split(' ')[1]}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Overview */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Performance Trends</h2>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-100">
              <div>
                <p className="font-medium text-green-800">Improving Performance</p>
                <p className="text-sm text-green-600">Your scores are up by 8% this week</p>
              </div>
              <div className="text-2xl font-bold text-green-600">+8%</div>
            </div>
            <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white">
              <div className="flex items-center space-x-2 mb-2">
                <Brain className="w-5 h-5" />
                <span className="font-medium">AI Recommendation</span>
              </div>
              <p className="text-sm opacity-90">Keep up your 3-day study streak! Consistency is key to improvement.</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 hover:bg-slate-50 rounded-lg transition-colors">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{activity.action}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-slate-500">{activity.time}</p>
                    {activity.score && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        {activity.score}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weak Areas & Recommendations */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Areas for Improvement</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {weakAreas.map((area, index) => (
            <div key={index} className="p-4 bg-red-50 border border-red-100 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-red-800">{area.subject}</h3>
                <span className="text-sm bg-red-200 text-red-700 px-2 py-1 rounded-full">
                  {area.errorRate} error rate
                </span>
              </div>
              <p className="text-sm text-red-600">{area.recommendation}</p>
              <button className="mt-2 text-sm text-red-700 hover:text-red-800 font-medium">
                Start Review Session →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
