import { useAuth } from '../../contexts/AuthContext';

const CreatorDashboard = () => {
  const { user, logout } = useAuth();

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
        
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Welcome to BrainTime</h3>
          <p>This is your creator dashboard where you can create and manage quizzes for your students.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col items-center">
            <div className="text-3xl font-bold text-primary-500 mb-2">0</div>
            <div className="text-gray-400">Active Quizzes</div>
          </div>
          
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col items-center">
            <div className="text-3xl font-bold text-primary-500 mb-2">0</div>
            <div className="text-gray-400">Student Enrollments</div>
          </div>
          
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col items-center">
            <div className="text-3xl font-bold text-primary-500 mb-2">0</div>
            <div className="text-gray-400">Completed Quizzes</div>
          </div>
        </div>
        
        <div className="flex justify-end mb-6">
          <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-md transition duration-150">
            Create New Quiz
          </button>
        </div>
        
        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Your Quizzes</h3>
          <p className="text-gray-400 italic">No quizzes created yet. Click "Create New Quiz" to get started.</p>
        </div>
      </main>
    </div>
  );
};

export default CreatorDashboard; 