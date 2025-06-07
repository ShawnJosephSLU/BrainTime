import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import './index.css';
import theme from './theme';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
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
import ExamResults from './components/student/ExamResults';
import ExamDetail from './components/creator/ExamDetail';
import GroupsList from './components/creator/GroupsList';
import SubmissionsList from './components/creator/SubmissionsList';
import GradeSubmission from './components/creator/GradeSubmission';
import SubscriptionPlans from './pages/creator/SubscriptionPlans';
import SubscriptionSuccess from './pages/creator/SubscriptionSuccess';
import SubscriptionCancel from './pages/creator/SubscriptionCancel';
import AccountSettings from './pages/creator/AccountSettings';

// Wrapper component to provide Layout with children from Outlet
const LayoutWrapper = () => (
  <Layout>
    <Outlet />
  </Layout>
);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
        <Routes>
          {/* Public routes - no layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          
          {/* Protected student routes with layout */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route element={<LayoutWrapper />}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/exams" element={<AvailableExams />} />
              <Route path="/student/exams/:quizId" element={<ExamSession />} />
              <Route path="/student/results/:resultId" element={<ExamResults />} />
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
              {/* Subscription routes */}
              <Route path="/creator/subscription/plans" element={<SubscriptionPlans />} />
              <Route path="/creator/subscription/success" element={<SubscriptionSuccess />} />
              <Route path="/creator/subscription/cancel" element={<SubscriptionCancel />} />
              <Route path="/creator/account" element={<AccountSettings />} />
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
    </ThemeProvider>
  );
}

export default App;
