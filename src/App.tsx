import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ComplaintProvider } from './contexts/ComplaintContext';
import Layout from './components/common/Layout';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import HomePage from './pages/HomePage';
import UserProfile from './pages/common/UserProfile';

// Citizen Pages
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import SubmitComplaint from './pages/citizen/SubmitComplaint';
import TrackComplaints from './pages/citizen/TrackComplaints';
import CommunityPage from './pages/citizen/CommunityPage';

// Provider Pages
import ProviderDashboard from './pages/provider/ProviderDashboard';
import ComplaintManagement from './pages/provider/ComplaintManagement';
import TaskManagement from './pages/provider/TaskManagement';
import ProviderAnalytics from './pages/provider/ProviderAnalytics';
import RoutePlanning from './pages/provider/RoutePlanning';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import DepartmentManagement from './pages/admin/DepartmentManagement';
import SystemAnalytics from './pages/admin/SystemAnalytics';
import IssueManagement from './pages/admin/IssueManagement';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ 
  children, 
  allowedRoles 
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-300 border-t-blue-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const redirectPath = user.role === 'citizen' ? '/citizen' : 
                        user.role === 'provider' ? '/provider' : '/admin';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Home page is now the default route */}
        <Route index element={<HomePage />} />
        
        <Route path="/login" element={
          user ? (
            user.role === 'citizen' ? <Navigate to="/citizen" replace /> :
            user.role === 'provider' ? <Navigate to="/provider" replace /> :
            <Navigate to="/admin" replace />
          ) : (
            <LoginPage />
          )
        } />

        <Route path="/signup" element={
          user ? (
            user.role === 'citizen' ? <Navigate to="/citizen" replace /> :
            user.role === 'provider' ? <Navigate to="/provider" replace /> :
            <Navigate to="/admin" replace />
          ) : (
            <SignUpPage />
          )
        } />

        {/* User Profile - Available to all authenticated users */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        } />

        {/* Citizen Routes */}
        <Route path="/citizen" element={
          <ProtectedRoute allowedRoles={['citizen']}>
            <CitizenDashboard />
          </ProtectedRoute>
        } />
        <Route path="/citizen/submit" element={
          <ProtectedRoute allowedRoles={['citizen']}>
            <SubmitComplaint />
          </ProtectedRoute>
        } />
        <Route path="/citizen/track" element={
          <ProtectedRoute allowedRoles={['citizen']}>
            <TrackComplaints />
          </ProtectedRoute>
        } />
        <Route path="/citizen/community" element={
          <ProtectedRoute allowedRoles={['citizen']}>
            <CommunityPage />
          </ProtectedRoute>
        } />

        {/* Provider Routes */}
        <Route path="/provider" element={
          <ProtectedRoute allowedRoles={['provider']}>
            <ProviderDashboard />
          </ProtectedRoute>
        } />
        <Route path="/provider/complaints" element={
          <ProtectedRoute allowedRoles={['provider']}>
            <ComplaintManagement />
          </ProtectedRoute>
        } />
        <Route path="/provider/tasks" element={
          <ProtectedRoute allowedRoles={['provider']}>
            <TaskManagement />
          </ProtectedRoute>
        } />
        <Route path="/provider/analytics" element={
          <ProtectedRoute allowedRoles={['provider']}>
            <ProviderAnalytics />
          </ProtectedRoute>
        } />
        <Route path="/provider/routes" element={
          <ProtectedRoute allowedRoles={['provider']}>
            <RoutePlanning />
          </ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <UserManagement />
          </ProtectedRoute>
        } />
        <Route path="/admin/departments" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DepartmentManagement />
          </ProtectedRoute>
        } />
        <Route path="/admin/issue-management" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <IssueManagement />
          </ProtectedRoute>
        } />
        <Route path="/admin/analytics" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <SystemAnalytics />
          </ProtectedRoute>
        } />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <ComplaintProvider>
        <Router>
          <AppRoutes />
        </Router>
      </ComplaintProvider>
    </AuthProvider>
  );
}

export default App;