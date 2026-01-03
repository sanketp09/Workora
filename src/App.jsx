import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ToastProvider } from './context/ToastContext';

// Layout
import Layout from './components/Layout';

// Pages
import SignIn from './pages/SignIn';
import ChangePassword from './pages/ChangePassword';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import CreateEmployee from './pages/CreateEmployee';
import Attendance from './pages/Attendance';
import TimeOff from './pages/TimeOff';
import Salary from './pages/Salary';
import Payroll from './pages/Payroll';
import Reports from './pages/Reports';

import './App.css';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading Workora...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  // Check if user needs to change password
  if (user.must_change_password) {
    return <Navigate to="/change-password" replace />;
  }

  return children;
}

// Public Route Component (redirect to dashboard if logged in)
function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading Workora...</p>
      </div>
    );
  }

  if (user && !user.must_change_password) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/signin" element={
        <PublicRoute>
          <SignIn />
        </PublicRoute>
      } />
      
      {/* Password Change Route - Accessible when logged in */}
      <Route path="/change-password" element={<ChangePassword />} />

      {/* Protected Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="employees" element={<Employees />} />
        <Route path="employees/create" element={<CreateEmployee />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="time-off" element={<TimeOff />} />
        <Route path="salary" element={<Salary />} />
        <Route path="payroll" element={<Payroll />} />
        <Route path="reports" element={<Reports />} />
      </Route>

      {/* Catch all - redirect to dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <DataProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </DataProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
