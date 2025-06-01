import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config/api';

interface AnalyticsOverview {
  totalAttempts: number;
  averageScore: number;
  totalStudents: number;
  completionRate: number;
  recentActivity: Array<{
    studentName: string;
    quizTitle: string;
    score: number;
    completedAt: string;
    timeSpent: number;
  }>;
  topPerformingQuizzes: Array<{
    title: string;
    attempts: number;
    averageScore: number;
  }>;
  performanceTrends: Array<{
    date: string;
    averageScore: number;
    attempts: number;
  }>;
}

const AnalyticsDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    fetchAnalyticsOverview();
  }, [selectedTimeRange]);

  const fetchAnalyticsOverview = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/analytics/overview?range=${selectedTimeRange}`);
      setAnalytics(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="text-lg font-semibold">Error Loading Analytics</h3>
          </div>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchAnalyticsOverview}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
              <p className="text-gray-400 mt-1">Track performance and engagement across your assessments</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value as '7d' | '30d' | '90d')}
                className="bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              <button
                onClick={() => navigate('/creator/dashboard')}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition duration-150"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-600 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Total Attempts</p>
                <p className="text-2xl font-bold text-white">{analytics?.totalAttempts || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-600 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Average Score</p>
                <p className="text-2xl font-bold text-white">{analytics?.averageScore.toFixed(1) || 0}%</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-600 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Total Students</p>
                <p className="text-2xl font-bold text-white">{analytics?.totalStudents || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-600 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Completion Rate</p>
                <p className="text-2xl font-bold text-white">{analytics?.completionRate || 0}%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Performance Trends Chart */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Performance Trends</h3>
            <div className="h-64 flex items-end justify-between space-x-2">
              {analytics?.performanceTrends.slice(-14).map((trend, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div
                    className="bg-primary-600 rounded-t w-full transition-all duration-300 hover:bg-primary-500"
                    style={{
                      height: `${Math.max((trend.averageScore / 100) * 200, 4)}px`,
                      minHeight: '4px'
                    }}
                    title={`${trend.date}: ${trend.averageScore}% (${trend.attempts} attempts)`}
                  ></div>
                  <span className="text-xs text-gray-400 mt-2 transform rotate-45 origin-left">
                    {new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm text-gray-400 mt-4">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Top Performing Quizzes */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Top Performing Quizzes</h3>
            <div className="space-y-4">
              {analytics?.topPerformingQuizzes.slice(0, 5).map((quiz, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-white font-medium truncate">{quiz.title}</p>
                    <p className="text-sm text-gray-400">{quiz.attempts} attempts</p>
                  </div>
                  <div className="ml-4 text-right">
                    <p className="text-lg font-bold text-green-400">{quiz.averageScore.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
              {(!analytics?.topPerformingQuizzes || analytics.topPerformingQuizzes.length === 0) && (
                <div className="text-center py-8">
                  <p className="text-gray-400">No quiz data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
            <button
              onClick={() => navigate('/creator/analytics/detailed')}
              className="text-primary-400 hover:text-primary-300 text-sm"
            >
              View All →
            </button>
          </div>
          
          {analytics?.recentActivity && analytics.recentActivity.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Student</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Quiz</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Score</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Time Spent</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.recentActivity.map((activity, index) => (
                    <tr key={index} className="border-b border-gray-700 hover:bg-gray-700">
                      <td className="py-3 px-4">
                        <p className="text-white font-medium">{activity.studentName}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-gray-300">{activity.quizTitle}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          activity.score >= 80 
                            ? 'bg-green-900 text-green-200' 
                            : activity.score >= 60 
                            ? 'bg-yellow-900 text-yellow-200' 
                            : 'bg-red-900 text-red-200'
                        }`}>
                          {activity.score.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-300">
                        {formatTime(activity.timeSpent)}
                      </td>
                      <td className="py-3 px-4 text-gray-400 text-sm">
                        {formatDate(activity.completedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-400 mb-2">No Recent Activity</h3>
              <p className="text-gray-500">Student activity will appear here once they start taking your quizzes.</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => navigate('/creator/analytics/quizzes')}
            className="bg-gray-800 hover:bg-gray-700 rounded-lg p-6 text-left transition duration-150"
          >
            <div className="flex items-center">
              <div className="p-3 bg-blue-600 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-semibold text-white">Quiz Analytics</h4>
                <p className="text-gray-400">Detailed performance by quiz</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/creator/analytics/groups')}
            className="bg-gray-800 hover:bg-gray-700 rounded-lg p-6 text-left transition duration-150"
          >
            <div className="flex items-center">
              <div className="p-3 bg-green-600 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-semibold text-white">Group Analytics</h4>
                <p className="text-gray-400">Performance by student groups</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/creator/analytics/export')}
            className="bg-gray-800 hover:bg-gray-700 rounded-lg p-6 text-left transition duration-150"
          >
            <div className="flex items-center">
              <div className="p-3 bg-purple-600 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-semibold text-white">Export Data</h4>
                <p className="text-gray-400">Download analytics reports</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard; 