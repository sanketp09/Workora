import { createContext, useContext, useState, useEffect } from 'react';
import { 
  employeesAPI, 
  attendanceAPI, 
  leaveRequestsAPI, 
  salaryAPI 
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
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Leave request approved', time: '2 hours ago', read: false },
    { id: 2, message: 'Salary slip generated for December', time: '1 day ago', read: false },
    { id: 3, message: 'Welcome to Workora!', time: '2 days ago', read: true },
  ]);
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
      setLeaves(leaveRequestsData);
      setLeaveRequests(leaveRequestsData);
      
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

  const markNotificationRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const addLeaveRequest = async (request) => {
    try {
      const newRequest = await leaveRequestsAPI.create(request);
      setLeaveRequests([...leaveRequests, newRequest]);
      setLeaves([...leaves, newRequest]);
      return newRequest;
    } catch (error) {
      console.error('Error adding leave request:', error);
      throw error;
    }
  };

  const updateLeaveRequestStatus = async (requestId, status, rejectionReason = null) => {
    try {
      await leaveRequestsAPI.updateStatus(requestId, status, rejectionReason);
      const updatedRequests = leaveRequests.map(req => 
        req.id === requestId 
          ? { ...req, status, rejection_reason: rejectionReason, processed_at: new Date().toISOString() }
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
