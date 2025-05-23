import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import './index.css';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import VerifyEmail from './pages/VerifyEmail';
import StudentDashboard from './pages/student/Dashboard';
import CreatorDashboard from './pages/creator/Dashboard';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/common/Layout';
import { AuthProvider } from './contexts/AuthContext';
import ExamCreator from './components/creator/ExamCreator';
import ExamsList from './components/creator/ExamsList';
import ExamSession from './components/student/ExamSession';
import AvailableExams from './components/student/AvailableExams';
import ExamDetail from './components/creator/ExamDetail';
import GroupsList from './components/creator/GroupsList';
import SubmissionsList from './components/creator/SubmissionsList';
import GradeSubmission from './components/creator/GradeSubmission';

// Wrapper component to provide Layout with children from Outlet
const LayoutWrapper = () => (
  <Layout>
    <Outlet />
  </Layout>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes - no layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          
          {/* Protected student routes with layout */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route element={<LayoutWrapper />}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/exams" element={<AvailableExams />} />
              <Route path="/student/exams/:quizId" element={<ExamSession />} />
              {/* Add more student routes as needed */}
            </Route>
          </Route>
          
          {/* Protected creator routes with layout */}
          <Route element={<ProtectedRoute allowedRoles={['creator']} />}>
            <Route element={<LayoutWrapper />}>
              <Route path="/creator/dashboard" element={<CreatorDashboard />} />
              <Route path="/creator/exams" element={<ExamsList />} />
              <Route path="/creator/exams/create" element={<ExamCreator />} />
              <Route path="/creator/exams/edit/:examId" element={<ExamCreator />} />
              <Route path="/creator/exams/:examId" element={<ExamDetail />} />
              <Route path="/creator/groups" element={<GroupsList />} />
              <Route path="/creator/exams/:examId/submissions" element={<SubmissionsList />} />
              <Route path="/creator/exams/:examId/submissions/:submissionId/grade" element={<GradeSubmission />} />
              {/* Add more creator routes as needed */}
            </Route>
          </Route>
          
          {/* Protected admin routes with layout */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route element={<LayoutWrapper />}>
              <Route path="/admin/dashboard" element={<div>Admin Dashboard</div>} />
              {/* Add more admin routes as needed */}
            </Route>
          </Route>
          
          {/* Default redirects */}
          <Route path="/" element={<Navigate to="/signin" replace />} />
          <Route path="*" element={<Navigate to="/signin" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
