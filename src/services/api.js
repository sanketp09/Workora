// Mock API service (authentication disabled for development)

// Mock data
const mockEmployees = [
  {
    id: '1',
    employeeId: 'EMP001',
    name: 'John Doe',
    email: 'john.doe@workora.com',
    phone: '+1-555-0123',
    department: 'Engineering',
    position: 'Senior Developer',
    salary: 75000,
    hire_date: '2024-01-15',
    status: 'Active'
  },
  {
    id: '2',
    employeeId: 'EMP002',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@workora.com',
    phone: '+1-555-0124',
    department: 'HR',
    position: 'HR Manager',
    salary: 65000,
    hire_date: '2023-06-10',
    status: 'Active'
  },
  {
    id: '3',
    employeeId: 'EMP003',
    name: 'Mike Chen',
    email: 'mike.chen@workora.com',
    phone: '+1-555-0125',
    department: 'Marketing',
    position: 'Marketing Specialist',
    salary: 55000,
    hire_date: '2024-03-01',
    status: 'Active'
  },
  {
    id: '4',
    employeeId: 'EMP004',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@workora.com',
    phone: '+1-555-0126',
    department: 'Engineering',
    position: 'Frontend Developer',
    salary: 68000,
    hire_date: '2023-09-15',
    status: 'Active'
  },
  {
    id: '5',
    employeeId: 'EMP005',
    name: 'David Kim',
    email: 'david.kim@workora.com',
    phone: '+1-555-0127',
    department: 'Finance',
    position: 'Financial Analyst',
    salary: 62000,
    hire_date: '2024-02-01',
    status: 'Active'
  },
  {
    id: '6',
    employeeId: 'EMP006',
    name: 'Lisa Anderson',
    email: 'lisa.anderson@workora.com',
    phone: '+1-555-0128',
    department: 'HR',
    position: 'Recruiter',
    salary: 52000,
    hire_date: '2023-11-20',
    status: 'Active'
  },
  {
    id: '7',
    employeeId: 'EMP007',
    name: 'Robert Taylor',
    email: 'robert.taylor@workora.com',
    phone: '+1-555-0129',
    department: 'Engineering',
    position: 'Backend Developer',
    salary: 72000,
    hire_date: '2023-08-10',
    status: 'Active'
  },
  {
    id: '8',
    employeeId: 'EMP008',
    name: 'Jennifer Martinez',
    email: 'jennifer.martinez@workora.com',
    phone: '+1-555-0130',
    department: 'Marketing',
    position: 'Content Manager',
    salary: 58000,
    hire_date: '2024-01-05',
    status: 'Active'
  }
];

const mockAttendance = [
  {
    id: '1',
    employee_id: '1',
    employee_name: 'John Doe',
    date: new Date().toISOString().split('T')[0],
    clock_in: '09:00',
    clock_out: '17:30',
    department: 'Engineering'
  },
  {
    id: '2',
    employee_id: '2',
    employee_name: 'Sarah Johnson',
    date: new Date().toISOString().split('T')[0],
    clock_in: '08:30',
    clock_out: '17:00',
    department: 'HR'
  }
];

const mockPayroll = [
  {
    id: '1',
    employee_id: '1',
    employee_name: 'John Doe',
    department: 'Engineering',
    gross_pay: 6250,
    net_pay: 4800,
    total_deductions: 1450,
    hours_worked: 160,
    overtime_hours: 0
  }
];

// Mock delay function
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Auth API (mocked)
export const authAPI = {
  login: async (credentials) => {
    await delay(300);
    return {
      success: true,
      token: 'mock-token',
      user: {
        id: 'mock-user-1',
        email: credentials.email,
        name: 'Demo User',
        role: 'admin'
      }
    };
  },
  register: async (userData) => {
    await delay(300);
    return {
      success: true,
      token: 'mock-token',
      user: {
        id: 'mock-user-' + Date.now(),
        email: userData.email,
        name: userData.name || 'Demo User',
        role: userData.role || 'employee'
      }
    };
  },
  logout: () => {
    localStorage.removeItem('authToken');
  }
};

// Employees API (mocked)
export const employeesAPI = {
  getAll: async () => {
    await delay(300);
    return mockEmployees;
  },
  getById: async (id) => {
    await delay(200);
    return mockEmployees.find(emp => emp.id === id);
  },
  create: async (employeeData) => {
    await delay(400);
    const newEmployee = {
      id: Date.now().toString(),
      ...employeeData,
      status: 'active'
    };
    mockEmployees.push(newEmployee);
    return newEmployee;
  },
  update: async (id, employeeData) => {
    await delay(300);
    const index = mockEmployees.findIndex(emp => emp.id === id);
    if (index !== -1) {
      mockEmployees[index] = { ...mockEmployees[index], ...employeeData };
      return mockEmployees[index];
    }
    throw new Error('Employee not found');
  },
  delete: async (id) => {
    await delay(200);
    const index = mockEmployees.findIndex(emp => emp.id === id);
    if (index !== -1) {
      mockEmployees.splice(index, 1);
      return { success: true };
    }
    throw new Error('Employee not found');
  }
};

// Attendance API (mocked)
export const attendanceAPI = {
  getAll: async () => {
    await delay(300);
    return mockAttendance;
  },
  getByEmployee: async (employeeId) => {
    await delay(200);
    return mockAttendance.filter(att => att.employee_id === employeeId);
  },
  checkIn: async (employeeId) => {
    await delay(200);
    return { success: true, message: 'Clocked in successfully' };
  },
  checkOut: async (employeeId) => {
    await delay(200);
    return { success: true, message: 'Clocked out successfully' };
  }
};

// Leave Requests API (mocked)
export const leaveRequestsAPI = {
  getAll: async () => {
    await delay(300);
    return [
      {
        id: '1',
        employee_id: '1',
        employee_name: 'John Doe',
        type: 'Vacation',
        start_date: '2024-01-20',
        end_date: '2024-01-22',
        status: 'pending',
        reason: 'Family vacation'
      }
    ];
  },
  getByEmployee: async (employeeId) => {
    await delay(200);
    return [];
  },
  create: async (leaveRequest) => {
    await delay(400);
    return {
      id: Date.now().toString(),
      ...leaveRequest,
      status: 'pending'
    };
  },
  updateStatus: async (id, statusData) => {
    await delay(300);
    return { success: true, message: 'Status updated' };
  }
};

// Salary API (mocked)
export const salaryAPI = {
  getAll: async () => {
    await delay(300);
    return mockEmployees.map(emp => ({
      id: emp.id,
      employee_name: emp.name,
      basic_salary: emp.salary,
      allowances: emp.salary * 0.1,
      total_salary: emp.salary * 1.1
    }));
  },
  getByEmployee: async (employeeId) => {
    await delay(200);
    const emp = mockEmployees.find(e => e.id === employeeId);
    return emp ? {
      id: emp.id,
      employee_name: emp.name,
      basic_salary: emp.salary,
      allowances: emp.salary * 0.1,
      total_salary: emp.salary * 1.1
    } : null;
  },
  create: async (salary) => {
    await delay(400);
    return { id: Date.now().toString(), ...salary };
  },
  update: async (id, salary) => {
    await delay(300);
    return { success: true, message: 'Salary updated' };
  }
};

// Payroll API (mocked)
export const payrollAPI = {
  getAll: async () => {
    await delay(400);
    return mockPayroll;
  },
  getByEmployee: async (employeeId) => {
    await delay(300);
    return mockPayroll.filter(p => p.employee_id === employeeId);
  },
  generatePayroll: async (payrollData) => {
    await delay(500);
    const newPayroll = {
      id: Date.now().toString(),
      ...payrollData
    };
    mockPayroll.push(newPayroll);
    return newPayroll;
  }
};

// Documents API (mocked)
export const documentsAPI = {
  getByEmployee: async (employeeId) => {
    await delay(200);
    return [
      { id: '1', name: 'Resume.pdf', type: 'Resume', upload_date: '2024-01-01' },
      { id: '2', name: 'ID_Copy.pdf', type: 'ID Proof', upload_date: '2024-01-01' }
    ];
  },
  upload: async (formData) => {
    await delay(600);
    return { success: true, message: 'Document uploaded successfully' };
  }
};

// Dashboard API (mocked)
export const dashboardAPI = {
  getStats: async () => {
    await delay(300);
    return {
      totalEmployees: mockEmployees.length,
      activeEmployees: mockEmployees.filter(emp => emp.status === 'active').length,
      attendanceToday: mockAttendance.length,
      payrollProcessed: mockPayroll.length
    };
  },
  getRecentActivity: async () => {
    await delay(200);
    return [
      { type: 'attendance', message: 'John Doe clocked in', time: '9:00 AM' },
      { type: 'payroll', message: 'Payroll processed for Engineering dept', time: '8:30 AM' },
      { type: 'employee', message: 'New employee Sarah Johnson added', time: '8:00 AM' }
    ];
  }
};

export default {
  auth: authAPI,
  employees: employeesAPI,
  attendance: attendanceAPI,
  leaveRequests: leaveRequestsAPI,
  salary: salaryAPI,
  payroll: payrollAPI,
  documents: documentsAPI,
  dashboard: dashboardAPI
};
