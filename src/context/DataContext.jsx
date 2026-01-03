import { createContext, useContext, useState, useEffect } from 'react';
import { 
  employeesAPI, 
  attendanceAPI, 
  leaveRequestsAPI, 
  salaryAPI,
  notificationsAPI 
} from '../services/api';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [leaves, setLeaves] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState({});
  const [salaryData, setSalaryData] = useState({});
  const [todayCheckIn, setTodayCheckIn] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Load employees
      const employeesData = await employeesAPI.getAll();
      setEmployees(employeesData);
      
      // Load leave requests for current user
      const leaveRequestsData = await leaveRequestsAPI.getAll();
      
      // Transform backend format to frontend format
      const transformedLeaves = leaveRequestsData.map(req => ({
        id: req.id,
        employeeId: req.employee_id,
        employeeName: req.employee_name,
        department: req.department,
        type: req.type,
        startDate: req.start_date,
        endDate: req.end_date,
        days: req.days_requested,
        reason: req.reason,
        status: req.status,
        appliedOn: req.created_at ? new Date(req.created_at).toISOString().split('T')[0] : null,
        approvedBy: req.approved_by,
        approvedAt: req.approved_at
      }));
      
      setLeaves(transformedLeaves);
      setLeaveRequests(transformedLeaves);
      
      // Load notifications for current user
      const userData = localStorage.getItem('workora_user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          if (user.employeeId) {
            const notificationsData = await notificationsAPI.getByEmployee(user.employeeId);
            const transformedNotifications = notificationsData.map(n => ({
              id: n.id,
              title: n.title,
              message: n.message,
              type: n.type,
              read: n.read,
              time: getRelativeTime(n.created_at),
              createdAt: n.created_at
            }));
            setNotifications(transformedNotifications);
          }
        } catch (err) {
          console.error('Error loading notifications:', err);
        }
      }
      
      // Check for today's check-in from localStorage
      const savedCheckIn = localStorage.getItem('workora_checkin');
      if (savedCheckIn) {
        const parsed = JSON.parse(savedCheckIn);
        const today = new Date().toISOString().split('T')[0];
        if (parsed.date === today) {
          setTodayCheckIn(parsed);
        }
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to get relative time
  const getRelativeTime = (dateStr) => {
    if (!dateStr) return 'Just now';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const checkIn = async (userId) => {
    try {
      const now = new Date();
      const checkInData = await attendanceAPI.checkIn(userId);
      
      const localCheckIn = {
        date: now.toISOString().split('T')[0],
        time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        timestamp: now.getTime(),
      };
      
      setTodayCheckIn(localCheckIn);
      localStorage.setItem('workora_checkin', JSON.stringify(localCheckIn));
      return localCheckIn;
    } catch (error) {
      console.error('Error checking in:', error);
      throw error;
    }
  };

  const checkOut = async (userId) => {
    try {
      const now = new Date();
      const checkOutData = await attendanceAPI.checkOut(userId);
      
      const localCheckOut = {
        ...todayCheckIn,
        checkOutTime: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        checkOutTimestamp: now.getTime(),
      };
      
      setTodayCheckIn(localCheckOut);
      localStorage.setItem('workora_checkin', JSON.stringify(localCheckOut));
      return localCheckOut;
    } catch (error) {
      console.error('Error checking out:', error);
      throw error;
    }
  };

  const applyLeave = async (leaveData) => {
    try {
      const newLeave = await leaveRequestsAPI.create(leaveData);
      setLeaves([...leaves, newLeave]);
      setLeaveRequests([...leaveRequests, newLeave]);
      return newLeave;
    } catch (error) {
      console.error('Error applying leave:', error);
      throw error;
    }
  };

  const updateLeaveStatus = async (leaveId, status) => {
    try {
      await leaveRequestsAPI.updateStatus(leaveId, status);
      const updatedLeaves = leaves.map(leave => 
        leave.id === leaveId ? { ...leave, status } : leave
      );
      setLeaves(updatedLeaves);
      setLeaveRequests(updatedLeaves);
    } catch (error) {
      console.error('Error updating leave status:', error);
      throw error;
    }
  };

  const getEmployeeAttendance = async (employeeId) => {
    try {
      const attendanceData = await attendanceAPI.getByEmployee(employeeId);
      return attendanceData;
    } catch (error) {
      console.error('Error getting employee attendance:', error);
      return [];
    }
  };

  const getEmployeeLeaves = (employeeId) => {
    return leaves.filter(l => l.employee_id === employeeId || l.employeeId === employeeId);
  };

  const getEmployeeLeaveBalance = (employeeId) => {
    return leaveBalance[employeeId] || { paid: 12, sick: 6, paidUsed: 0, sickUsed: 0 };
  };

  const getEmployeeSalary = async (employeeId) => {
    try {
      if (salaryData[employeeId]) {
        return salaryData[employeeId];
      }
      const salaryInfo = await salaryAPI.getByEmployee(employeeId);
      setSalaryData({ ...salaryData, [employeeId]: salaryInfo });
      return salaryInfo;
    } catch (error) {
      console.error('Error getting employee salary:', error);
      return { wage: 50000, basic: 25000, hra: 12500, allowance: 4167, bonus: 4166, lta: 4167 };
    }
  };

  const updateSalary = async (employeeId, newSalary) => {
    try {
      await salaryAPI.update(employeeId, newSalary);
      const updated = { ...salaryData, [employeeId]: newSalary };
      setSalaryData(updated);
    } catch (error) {
      console.error('Error updating salary:', error);
      throw error;
    }
  };

  const addEmployee = async (employeeData) => {
    try {
      const result = await employeesAPI.create(employeeData);
      // Add new employee to state
      if (result.employee) {
        setEmployees([...employees, result.employee]);
      }
      return result;
    } catch (error) {
      console.error('Error adding employee:', error);
      throw error;
    }
  };

  const updateEmployee = async (employeeId, employeeData) => {
    try {
      const result = await employeesAPI.update(employeeId, employeeData);
      // Update employee in state
      if (result.employee) {
        setEmployees(employees.map(emp => 
          emp.id === employeeId ? result.employee : emp
        ));
      }
      return result;
    } catch (error) {
      console.error('Error updating employee:', error);
      throw error;
    }
  };

  const markNotificationRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const addLeaveRequest = async (request) => {
    try {
      // Transform frontend format to backend format
      const backendRequest = {
        employee_id: request.employeeId,
        type: request.type,
        start_date: request.startDate,
        end_date: request.endDate,
        days_requested: request.days,
        reason: request.reason
      };
      
      const newRequest = await leaveRequestsAPI.create(backendRequest);
      
      // Transform backend response to frontend format
      const frontendRequest = {
        id: newRequest.id,
        employeeId: newRequest.employee_id,
        employeeName: request.employeeName,
        department: request.department,
        type: newRequest.type,
        startDate: newRequest.start_date,
        endDate: newRequest.end_date,
        days: newRequest.days_requested,
        reason: newRequest.reason,
        status: newRequest.status,
        appliedOn: new Date(newRequest.created_at).toISOString().split('T')[0],
        attachment: request.attachment
      };
      
      setLeaveRequests([...leaveRequests, frontendRequest]);
      setLeaves([...leaves, frontendRequest]);
      return frontendRequest;
    } catch (error) {
      console.error('Error adding leave request:', error);
      throw error;
    }
  };

  const updateLeaveRequestStatus = async (requestId, status, rejectionReason = null, adminComment = null) => {
    try {
      await leaveRequestsAPI.updateStatus(requestId, { 
        status, 
        rejection_reason: rejectionReason,
        admin_comment: adminComment
      });
      const updatedRequests = leaveRequests.map(req => 
        req.id === requestId 
          ? { ...req, status, rejectionReason: rejectionReason, processedAt: new Date().toISOString() }
          : req
      );
      setLeaveRequests(updatedRequests);
      setLeaves(updatedRequests);
    } catch (error) {
      console.error('Error updating leave request status:', error);
      throw error;
    }
  };

  return (
    <DataContext.Provider value={{
      employees,
      attendance,
      leaves,
      leaveBalance,
      salaryData,
      todayCheckIn,
      notifications,
      leaveRequests,
      loading,
      checkIn,
      checkOut,
      applyLeave,
      updateLeaveStatus,
      getEmployeeAttendance,
      getEmployeeLeaves,
      getEmployeeLeaveBalance,
      getEmployeeSalary,
      updateSalary,
      markNotificationRead,
      addLeaveRequest,
      updateLeaveRequestStatus,
      loadInitialData,
      addEmployee,
      updateEmployee,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
