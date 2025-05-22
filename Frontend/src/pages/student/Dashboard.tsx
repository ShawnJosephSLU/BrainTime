import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';
import { CircularProgress } from '@mui/material';
import EnrollmentForm from '../../components/student/EnrollmentForm';
import SessionInfo from '../../components/common/SessionInfo';

interface Group {
  _id: string;
  name: string;
  description: string;
  creatorId: {
    email: string;
  };
  exams: Exam[];
}

interface Exam {
  _id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  duration: number;
  isLive: boolean;
}

const StudentDashboard = () => {
  const { user, logout, setAuthHeaders, refreshAuth } = useAuth();
  const navigate = useNavigate();
  const [enrolledGroups, setEnrolledGroups] = useState<Group[]>([]);
  const [availableExams, setAvailableExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [enrollmentSuccess, setEnrollmentSuccess] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    refreshAuth();
    setAuthHeaders();
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!setAuthHeaders()) {
        if (!refreshAuth()) {
          setError('Authentication failed. Please log in again.');
          setLoading(false);
          return;
        }
      }
      
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      const response = await axios.get(`${API_URL}/api/groups/student`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Student groups response:', response.data);
      setEnrolledGroups(response.data);
      
      const allExams: Exam[] = [];
      response.data.forEach((group: Group) => {
        if (group.exams && group.exams.length > 0) {
          group.exams.forEach(exam => {
            if (!allExams.some(e => e._id === exam._id)) {
              allExams.push(exam);
            }
          });
        }
      });
      
      setAvailableExams(allExams);
    } catch (err: any) {
      console.error('Error fetching student data:', err);
      if (err.response) {
        console.error('Error response:', err.response.data);
        console.error('Error status:', err.response.status);
      }
      setError(err.response?.data?.message || 'Failed to fetch your groups and exams');
    } finally {
      setLoading(false);
    }
  };

  const testAuthentication = async () => {
    try {
      if (!setAuthHeaders()) {
        if (!refreshAuth()) {
          setError('Authentication failed. Please log in again.');
          return;
        }
      }
      
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      console.log('Using token for test:', token);
      
      const response = await axios.get(`${API_URL}/api/groups/test-auth`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Auth test successful:', response.data);
      setSuccess('Authentication test successful! Check console for details.');
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err: any) {
      console.error('Auth test failed:', err);
      if (err.response) {
        console.error('Error response:', err.response.data);
        console.error('Error status:', err.response.status);
      }
      setError('Authentication test failed. See console for details.');
      
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };

  const handleEnrollment = async (enrollmentCode: string) => {
    try {
      if (!setAuthHeaders()) {
        if (!refreshAuth()) {
          setError('Authentication failed. Please log in again.');
          return;
        }
      }
      
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      const response = await axios.post(
        `${API_URL}/api/groups/enroll`, 
        { enrollmentCode },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      setEnrollmentSuccess(`Successfully enrolled in group: ${response.data.groupName}`);
      
      setTimeout(() => {
        setEnrollmentSuccess(null);
      }, 3000);
      
      fetchStudentData();
    } catch (err: any) {
      console.error('Error enrolling in group:', err);
      if (err.response) {
        console.error('Error response:', err.response.data);
        console.error('Error status:', err.response.status);
      }
      setError(err.response?.data?.message || 'Failed to enroll in group');
      
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };

  const handleStartExam = (examId: string) => {
    navigate(`/student/exams/${examId}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-primary-500">BrainTime</h1>
            <span className="ml-2 px-2 py-1 bg-primary-900 text-primary-300 text-xs rounded-md">Student</span>
          </div>
          <div className="flex items-center">
            <div className="mr-3">
              <SessionInfo showDetailedInfo={true} />
            </div>
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
        <h2 className="text-2xl font-bold mb-6">Student Dashboard</h2>
        
        {error && (
          <div className="bg-red-900/50 border border-red-800 text-red-200 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        {enrollmentSuccess && (
          <div className="bg-green-900/50 border border-green-800 text-green-200 px-4 py-3 rounded mb-6">
            {enrollmentSuccess}
          </div>
        )}
        
        {success && (
          <div className="bg-green-900/50 border border-green-800 text-green-200 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}
        
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Test Authentication</h3>
          <p className="mb-4">Click the button below to test your authentication status.</p>
          <button
            onClick={testAuthentication}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-md text-white font-medium transition duration-150"
          >
            Test Auth
          </button>
        </div>
        
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Enroll in a Group</h3>
          <p className="mb-4">Enter the enrollment code provided by your instructor to join their group.</p>
          <EnrollmentForm onEnroll={handleEnrollment} />
        </div>
        
        {loading ? (
          <div className="flex justify-center my-8">
            <CircularProgress color="primary" />
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Your Enrolled Groups</h3>
              {enrolledGroups.length === 0 ? (
                <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                  <p className="text-gray-400 italic">You are not enrolled in any groups yet. Use an enrollment code to join a group.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {enrolledGroups.map(group => (
                    <div key={group._id} className="bg-gray-800 rounded-lg shadow-lg p-6">
                      <h4 className="text-md font-semibold mb-2">{group.name}</h4>
                      <p className="text-sm text-gray-400 mb-2">{group.description}</p>
                      <p className="text-xs text-gray-500">Created by: {group.creatorId.email}</p>
                      <div className="mt-3">
                        <span className="text-xs font-medium bg-primary-900/50 text-primary-300 px-2 py-1 rounded">
                          {group.exams.length} Available Exam{group.exams.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Available Exams</h3>
              {availableExams.length === 0 ? (
                <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                  <p className="text-gray-400 italic">No exams are currently available. Check back later or enroll in more groups.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {availableExams.map(exam => {
                    const startTime = new Date(exam.startTime);
                    const endTime = new Date(exam.endTime);
                    const now = new Date();
                    const isActive = exam.isLive && startTime <= now && now <= endTime;
                    
                    return (
                      <div key={exam._id} className="bg-gray-800 rounded-lg shadow-lg p-6">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="text-md font-semibold">{exam.title}</h4>
                          <span className={`text-xs rounded-full px-2 py-1 ${isActive ? 'bg-green-900/50 text-green-300' : 'bg-gray-700 text-gray-400'}`}>
                            {isActive ? 'Active' : 'Not Available'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mb-4">{exam.description}</p>
                        <div className="text-xs text-gray-500 mb-1">
                          Start: {startTime.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500 mb-1">
                          End: {endTime.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500 mb-4">
                          Duration: {exam.duration} minutes
                        </div>
                        <button
                          onClick={() => handleStartExam(exam._id)}
                          disabled={!isActive}
                          className={`w-full px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-primary-600 hover:bg-primary-700 text-white' : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`}
                        >
                          {isActive ? 'Start Exam' : 'Not Available'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;