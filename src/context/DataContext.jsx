import { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext(null);

// Demo employees data
const initialEmployees = [
  {
    id: 'EMP001',
    name: 'John Doe',
    email: 'john.doe@dayflow.com',
    phone: '+1 234 567 8901',
    department: 'Engineering',
    designation: 'Senior Developer',
    joinDate: '2023-03-15',
    status: 'present',
    avatar: null,
  },
  {
    id: 'EMP002',
    name: 'Emily Chen',
    email: 'emily.chen@dayflow.com',
    phone: '+1 234 567 8903',
    department: 'Design',
    designation: 'UI/UX Designer',
    joinDate: '2023-06-20',
    status: 'present',
    avatar: null,
  },
  {
    id: 'EMP003',
    name: 'Michael Brown',
    email: 'michael.brown@dayflow.com',
    phone: '+1 234 567 8904',
    department: 'Engineering',
    designation: 'Backend Developer',
    joinDate: '2023-01-10',
    status: 'on-leave',
    avatar: null,
  },
  {
    id: 'EMP004',
    name: 'Jessica Williams',
    email: 'jessica.williams@dayflow.com',
    phone: '+1 234 567 8905',
    department: 'Marketing',
    designation: 'Marketing Manager',
    joinDate: '2022-11-05',
    status: 'present',
    avatar: null,
  },
  {
    id: 'EMP005',
    name: 'David Garcia',
    email: 'david.garcia@dayflow.com',
    phone: '+1 234 567 8906',
    department: 'Sales',
    designation: 'Sales Executive',
    joinDate: '2024-02-14',
    status: 'absent',
    avatar: null,
  },
  {
    id: 'HR001',
    name: 'Sarah Johnson',
    email: 'sarah.admin@dayflow.com',
    phone: '+1 234 567 8902',
    department: 'Human Resources',
    designation: 'HR Manager',
    joinDate: '2022-01-10',
    status: 'present',
    avatar: null,
  },
  {
    id: 'EMP006',
    name: 'Alex Turner',
    email: 'alex.turner@dayflow.com',
    phone: '+1 234 567 8907',
    department: 'Engineering',
    designation: 'DevOps Engineer',
    joinDate: '2023-09-01',
    status: 'present',
    avatar: null,
  },
  {
    id: 'EMP007',
    name: 'Rachel Kim',
    email: 'rachel.kim@dayflow.com',
    phone: '+1 234 567 8908',
    department: 'Product',
    designation: 'Product Manager',
    joinDate: '2023-04-22',
    status: 'present',
    avatar: null,
  },
];

// Generate attendance data for the current month
const generateAttendanceData = () => {
  const attendance = {};
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  initialEmployees.forEach(emp => {
    attendance[emp.id] = [];
    
    for (let day = 1; day <= today.getDate(); day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dayOfWeek = date.getDay();
      
      // Skip weekends
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;
      
      // Random attendance with 90% present rate
      const isPresent = Math.random() > 0.1;
      const checkInHour = 8 + Math.floor(Math.random() * 2);
      const checkInMin = Math.floor(Math.random() * 60);
      const checkOutHour = 17 + Math.floor(Math.random() * 2);
      const checkOutMin = Math.floor(Math.random() * 60);
      
      if (isPresent) {
        attendance[emp.id].push({
          date: date.toISOString().split('T')[0],
          checkIn: `${checkInHour.toString().padStart(2, '0')}:${checkInMin.toString().padStart(2, '0')}`,
          checkOut: `${checkOutHour.toString().padStart(2, '0')}:${checkOutMin.toString().padStart(2, '0')}`,
          status: 'present',
          totalHours: checkOutHour - checkInHour + (checkOutMin - checkInMin) / 60,
        });
      }
    }
  });
  
  return attendance;
};

// Generate leave data
const generateLeaveData = () => {
  return [
    {
      id: 'LV001',
      employeeId: 'EMP001',
      employeeName: 'John Doe',
      type: 'paid',
      startDate: '2025-12-24',
      endDate: '2025-12-26',
      duration: 3,
      reason: 'Holiday vacation',
      status: 'approved',
      appliedOn: '2025-12-01',
    },
    {
      id: 'LV002',
      employeeId: 'EMP003',
      employeeName: 'Michael Brown',
      type: 'sick',
      startDate: '2026-01-03',
      endDate: '2026-01-03',
      duration: 1,
      reason: 'Not feeling well',
      status: 'approved',
      appliedOn: '2026-01-02',
    },
    {
      id: 'LV003',
      employeeId: 'EMP002',
      employeeName: 'Emily Chen',
      type: 'paid',
      startDate: '2026-01-15',
      endDate: '2026-01-17',
      duration: 3,
      reason: 'Personal work',
      status: 'pending',
      appliedOn: '2026-01-02',
    },
    {
      id: 'LV004',
      employeeId: 'EMP004',
      employeeName: 'Jessica Williams',
      type: 'unpaid',
      startDate: '2026-01-20',
      endDate: '2026-01-21',
      duration: 2,
      reason: 'Family emergency',
      status: 'pending',
      appliedOn: '2026-01-03',
    },
  ];
};

// Leave balance for each employee
const initialLeaveBalance = {
  EMP001: { paid: 8, sick: 4, paidUsed: 4, sickUsed: 2 },
  EMP002: { paid: 10, sick: 5, paidUsed: 2, sickUsed: 1 },
  EMP003: { paid: 9, sick: 3, paidUsed: 3, sickUsed: 3 },
  EMP004: { paid: 12, sick: 6, paidUsed: 0, sickUsed: 0 },
  EMP005: { paid: 11, sick: 5, paidUsed: 1, sickUsed: 1 },
  HR001: { paid: 15, sick: 6, paidUsed: 2, sickUsed: 0 },
  EMP006: { paid: 10, sick: 5, paidUsed: 2, sickUsed: 2 },
  EMP007: { paid: 12, sick: 6, paidUsed: 0, sickUsed: 0 },
};

// Salary data
const initialSalaryData = {
  EMP001: { wage: 75000, basic: 37500, hra: 18750, allowance: 6250, bonus: 6250, lta: 6250 },
  EMP002: { wage: 65000, basic: 32500, hra: 16250, allowance: 5417, bonus: 5416, lta: 5417 },
  EMP003: { wage: 70000, basic: 35000, hra: 17500, allowance: 5833, bonus: 5834, lta: 5833 },
  EMP004: { wage: 80000, basic: 40000, hra: 20000, allowance: 6667, bonus: 6666, lta: 6667 },
  EMP005: { wage: 55000, basic: 27500, hra: 13750, allowance: 4583, bonus: 4584, lta: 4583 },
  HR001: { wage: 90000, basic: 45000, hra: 22500, allowance: 7500, bonus: 7500, lta: 7500 },
  EMP006: { wage: 72000, basic: 36000, hra: 18000, allowance: 6000, bonus: 6000, lta: 6000 },
  EMP007: { wage: 85000, basic: 42500, hra: 21250, allowance: 7083, bonus: 7084, lta: 7083 },
};

export function DataProvider({ children }) {
  const [employees, setEmployees] = useState(initialEmployees);
  const [attendance, setAttendance] = useState({});
  const [leaves, setLeaves] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState(initialLeaveBalance);
  const [salaryData, setSalaryData] = useState(initialSalaryData);
  const [todayCheckIn, setTodayCheckIn] = useState(null);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Leave request approved', time: '2 hours ago', read: false },
    { id: 2, message: 'Salary slip generated for December', time: '1 day ago', read: false },
    { id: 3, message: 'Welcome to Dayflow!', time: '2 days ago', read: true },
  ]);

  useEffect(() => {
    // Initialize data
    const savedAttendance = localStorage.getItem('dayflow_attendance');
    const savedLeaves = localStorage.getItem('dayflow_leaves');
    const savedCheckIn = localStorage.getItem('dayflow_checkin');
    
    if (savedAttendance) {
      setAttendance(JSON.parse(savedAttendance));
    } else {
      const generated = generateAttendanceData();
      setAttendance(generated);
      localStorage.setItem('dayflow_attendance', JSON.stringify(generated));
    }
    
    if (savedLeaves) {
      setLeaves(JSON.parse(savedLeaves));
    } else {
      const generated = generateLeaveData();
      setLeaves(generated);
      localStorage.setItem('dayflow_leaves', JSON.stringify(generated));
    }
    
    if (savedCheckIn) {
      const parsed = JSON.parse(savedCheckIn);
      const today = new Date().toISOString().split('T')[0];
      if (parsed.date === today) {
        setTodayCheckIn(parsed);
      }
    }
  }, []);

  const checkIn = (userId) => {
    const now = new Date();
    const checkInData = {
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      timestamp: now.getTime(),
    };
    setTodayCheckIn(checkInData);
    localStorage.setItem('dayflow_checkin', JSON.stringify(checkInData));
    return checkInData;
  };

  const checkOut = (userId) => {
    const now = new Date();
    const checkOutData = {
      ...todayCheckIn,
      checkOutTime: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      checkOutTimestamp: now.getTime(),
    };
    setTodayCheckIn(checkOutData);
    localStorage.setItem('dayflow_checkin', JSON.stringify(checkOutData));
    
    // Add to attendance record
    const dateKey = now.toISOString().split('T')[0];
    const hoursWorked = (now.getTime() - todayCheckIn.timestamp) / (1000 * 60 * 60);
    
    const newAttendance = { ...attendance };
    if (!newAttendance[userId]) newAttendance[userId] = [];
    newAttendance[userId].push({
      date: dateKey,
      checkIn: todayCheckIn.time,
      checkOut: checkOutData.checkOutTime,
      status: 'present',
      totalHours: hoursWorked.toFixed(2),
    });
    setAttendance(newAttendance);
    localStorage.setItem('dayflow_attendance', JSON.stringify(newAttendance));
    
    return checkOutData;
  };

  const applyLeave = (leaveData) => {
    const newLeave = {
      id: `LV${String(leaves.length + 1).padStart(3, '0')}`,
      ...leaveData,
      status: 'pending',
      appliedOn: new Date().toISOString().split('T')[0],
    };
    const updatedLeaves = [...leaves, newLeave];
    setLeaves(updatedLeaves);
    localStorage.setItem('dayflow_leaves', JSON.stringify(updatedLeaves));
    return newLeave;
  };

  const updateLeaveStatus = (leaveId, status) => {
    const updatedLeaves = leaves.map(leave => 
      leave.id === leaveId ? { ...leave, status } : leave
    );
    setLeaves(updatedLeaves);
    localStorage.setItem('dayflow_leaves', JSON.stringify(updatedLeaves));
  };

  const getEmployeeAttendance = (employeeId) => {
    return attendance[employeeId] || [];
  };

  const getEmployeeLeaves = (employeeId) => {
    return leaves.filter(l => l.employeeId === employeeId);
  };

  const getEmployeeLeaveBalance = (employeeId) => {
    return leaveBalance[employeeId] || { paid: 12, sick: 6, paidUsed: 0, sickUsed: 0 };
  };

  const getEmployeeSalary = (employeeId) => {
    return salaryData[employeeId] || { wage: 50000, basic: 25000, hra: 12500, allowance: 4167, bonus: 4166, lta: 4167 };
  };

  const updateSalary = (employeeId, newSalary) => {
    const updated = { ...salaryData, [employeeId]: newSalary };
    setSalaryData(updated);
  };

  const markNotificationRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
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
