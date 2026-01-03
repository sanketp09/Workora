import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ToastProvider } from './context/ToastContext';

// Layout
import Layout from './components/Layout';

// Employee Pages
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Attendance from './pages/Attendance';
import TimeOff from './pages/TimeOff';
import Salary from './pages/Salary';
import Payroll from './pages/Payroll';
import Reports from './pages/Reports';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import EmployeeManagement from './pages/admin/EmployeeManagement';
import AttendanceOversight from './pages/admin/AttendanceOversight';
import LeaveApproval from './pages/admin/LeaveApproval';
import SalaryConfig from './pages/admin/SalaryConfig';
import PayrollProcessing from './pages/admin/PayrollProcessing';
import PayrollIntelligence from './pages/admin/PayrollIntelligence';
import AuditLogs from './pages/admin/AuditLogs';
import AdminReports from './pages/admin/AdminReports';

import './App.css';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading Dayflow...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
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
        <p>Loading Dayflow...</p>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />

      {/* Main App Routes - No authentication required */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="employees" element={<Employees />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="time-off" element={<TimeOff />} />
        <Route path="salary" element={<Salary />} />
        <Route path="payroll" element={<Payroll />} />
        <Route path="reports" element={<Reports />} />
        
        {/* Admin Routes */}
        <Route path="admin">
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="employees" element={<EmployeeManagement />} />
          <Route path="attendance" element={<AttendanceOversight />} />
          <Route path="leave-approval" element={<LeaveApproval />} />
          <Route path="salary-config" element={<SalaryConfig />} />
          <Route path="payroll-processing" element={<PayrollProcessing />} />
          <Route path="payroll-intelligence" element={<PayrollIntelligence />} />
          <Route path="audit-logs" element={<AuditLogs />} />
          <Route path="reports" element={<AdminReports />} />
        </Route>
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
