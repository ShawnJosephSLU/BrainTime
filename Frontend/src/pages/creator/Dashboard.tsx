import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CircularProgress } from '@mui/material';

interface DashboardStats {
  activeExams: number;
  studentEnrollments: number;
  completedExams: number;
}

const CreatorDashboard = () => {
  const { user, logout, setAuthHeaders, refreshAuth } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    activeExams: 0,
    studentEnrollments: 0,
    completedExams: 0
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [exams, setExams] = useState<any[]>([]);

  useEffect(() => {
    // Ensure auth is refreshed
    refreshAuth();
    setAuthHeaders();
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Ensure auth headers are set
      setAuthHeaders();
      
      // Fetch exams
      const examResponse = await axios.get(`${API_URL}/api/quizzes/creator`);
      setExams(examResponse.data);
      
      // Calculate stats
      const activeExams = examResponse.data.filter((exam: any) => exam.isLive).length;
      
      // In a real implementation, we would fetch these from separate endpoints
      // For now, we'll just use placeholders based on exams data
      setStats({
        activeExams,
        studentEnrollments: examResponse.data.length * 3, // Placeholder
        completedExams: Math.floor(examResponse.data.length * 1.5) // Placeholder
      });
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.message || 'Failed to fetch dashboard data');
      
      if (err.response?.status === 401) {
        setError('Authentication error. Try refreshing your login.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    const didRefresh = refreshAuth();
    if (didRefresh) {
      fetchDashboardData();
    } else {
      setError('Authentication failed. Please log in again.');
      setTimeout(() => {
        navigate('/signin?returnUrl=/creator/dashboard');
      }, 2000);
    }
  };

  const handleCreateExam = () => {
    navigate('/creator/exams/create');
  };

  const goToExamsList = () => {
    navigate('/creator/exams');
  };

  const goToGroupsList = () => {
    navigate('/creator/groups');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-primary-500">BrainTime</h1>
            <span className="ml-2 px-2 py-1 bg-secondary-900 text-secondary-300 text-xs rounded-md">Creator</span>
          </div>
          <div className="flex items-center">
            <span className="mr-4">{user?.email}</span>
            <button 
              onClick={logout}
              className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded-md transition duration-150"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Creator Dashboard</h2>
        
        {error && (
          <div className="bg-red-900/50 border border-red-800 text-red-200 px-4 py-3 rounded mb-6 flex justify-between items-center">
            <span>{error}</span>
            <button 
              onClick={handleRetry}
              className="px-3 py-1 text-sm bg-red-800 hover:bg-red-700 rounded-md transition duration-150"
            >
              Retry
            </button>
          </div>
        )}
        
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Welcome to BrainTime</h3>
          <p>This is your creator dashboard where you can create and manage examinations for your students.</p>
        </div>
        
        {loading ? (
          <div className="flex justify-center my-8">
            <CircularProgress color="primary" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col items-center">
                <div className="text-3xl font-bold text-primary-500 mb-2">{stats.activeExams}</div>
                <div className="text-gray-400">Active Exams</div>
              </div>
              
              <div className="bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col items-center">
                <div className="text-3xl font-bold text-primary-500 mb-2">{stats.studentEnrollments}</div>
                <div className="text-gray-400">Student Enrollments</div>
              </div>
              
              <div className="bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col items-center">
                <div className="text-3xl font-bold text-primary-500 mb-2">{stats.completedExams}</div>
                <div className="text-gray-400">Completed Exams</div>
              </div>
            </div>
            
            <div className="flex justify-end mb-6 gap-4">
              <button 
                onClick={goToGroupsList}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition duration-150"
              >
                Manage Groups
              </button>
              <button 
                onClick={goToExamsList}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition duration-150"
              >
                View All Exams
              </button>
              <button 
                onClick={handleCreateExam}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-md transition duration-150"
              >
                Create New Examination
              </button>
            </div>
            
            <div className="bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Your Exams</h3>
              {exams.length === 0 ? (
                <p className="text-gray-400 italic">No exams created yet. Click "Create New Examination" to get started.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Title</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Students</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {exams.slice(0, 5).map((exam) => (
                        <tr key={exam._id} className="hover:bg-gray-750">
                          <td className="px-4 py-3 text-sm">{exam.title}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 text-xs rounded-full ${exam.isLive ? 'bg-green-900/50 text-green-300' : 'bg-gray-700 text-gray-300'}`}>
                              {exam.isLive ? 'Live' : 'Offline'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">0 enrolled</td>
                          <td className="px-4 py-3 text-sm text-right">
                            <button 
                              onClick={() => navigate(`/creator/exams/${exam._id}`)}
                              className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded-md transition duration-150 mr-2"
                            >
                              View
                            </button>
                            <button 
                              onClick={() => navigate(`/creator/exams/${exam._id}/submissions`)}
                              className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded-md transition duration-150 mr-2"
                            >
                              Submissions
                            </button>
                            <button 
                              onClick={() => navigate(`/creator/exams/edit/${exam._id}`)}
                              className="px-2 py-1 text-xs bg-primary-600 hover:bg-primary-700 rounded-md transition duration-150"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {exams.length > 5 && (
                    <div className="mt-4 text-center">
                      <button 
                        onClick={goToExamsList}
                        className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded-md transition duration-150"
                      >
                        View All {exams.length} Exams
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default CreatorDashboard; 