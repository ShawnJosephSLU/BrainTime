import { useAuth } from '../../contexts/AuthContext';

const StudentDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-primary-500">BrainTime</h1>
            <span className="ml-2 px-2 py-1 bg-primary-900 text-primary-300 text-xs rounded-md">Student</span>
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
        <h2 className="text-2xl font-bold mb-6">Student Dashboard</h2>
        
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Welcome to BrainTime</h3>
          <p>This is your student dashboard where you can access quizzes and track your progress.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Upcoming Quizzes</h3>
            <p className="text-gray-400 italic">No upcoming quizzes at the moment.</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Results</h3>
            <p className="text-gray-400 italic">No recent results to display.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard; 