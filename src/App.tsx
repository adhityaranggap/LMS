import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { AuthProvider, useAuth } from './context/AuthContext';

const Home = React.lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const ModuleDetail = React.lazy(() => import('./pages/ModuleDetail').then(m => ({ default: m.ModuleDetail })));
const LecturerDashboard = React.lazy(() => import('./pages/LecturerDashboard').then(m => ({ default: m.LecturerDashboard })));
const LecturerStudentDetail = React.lazy(() => import('./pages/LecturerStudentDetail').then(m => ({ default: m.LecturerStudentDetail })));
const SuperAdminDashboard = React.lazy(() => import('./pages/SuperAdminDashboard').then(m => ({ default: m.SuperAdminDashboard })));
const StudentProfile = React.lazy(() => import('./pages/StudentProfile').then(m => ({ default: m.StudentProfile })));

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
};

const LecturerRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'lecturer') return <Navigate to="/" replace />;
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'lecturer' && user.role !== 'tenant_admin' && user.role !== 'super_admin') return <Navigate to="/" replace />;
  return <>{children}</>;
};

const SuperAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'super_admin') return <Navigate to="/" replace />;
  return <>{children}</>;
};

const LoginRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to={user.role === 'lecturer' || user.role === 'tenant_admin' || user.role === 'super_admin' ? '/lecturer' : '/'} replace />;
  return <Login />;
};

export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/module/:id" element={<ProtectedRoute><ModuleDetail /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><StudentProfile /></ProtectedRoute>} />
          <Route path="/lecturer" element={<LecturerRoute><LecturerDashboard /></LecturerRoute>} />
          <Route path="/lecturer/student/:studentId" element={<LecturerRoute><LecturerStudentDetail /></LecturerRoute>} />
          <Route path="/admin" element={<SuperAdminRoute><SuperAdminDashboard /></SuperAdminRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}
