const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  
  return data;
};

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  return handleResponse(response);
};

// Auth API
export const authAPI = {
  login: async (credentials) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (data.token) {
      localStorage.setItem('authToken', data.token);
    }
    
    return data;
  },
  
  register: async (userData) => {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (data.token) {
      localStorage.setItem('authToken', data.token);
    }
    
    return data;
  },
  
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('workora_user');
  },
};

// Employees API
export const employeesAPI = {
  getAll: () => apiRequest('/employees'),
  getById: (id) => apiRequest(`/employees/${id}`),
  create: (employee) => apiRequest('/employees', {
    method: 'POST',
    body: JSON.stringify(employee),
  }),
  update: (id, employee) => apiRequest(`/employees/${id}`, {
    method: 'PUT',
    body: JSON.stringify(employee),
  }),
  delete: (id) => apiRequest(`/employees/${id}`, {
    method: 'DELETE',
  }),
};

// Attendance API
export const attendanceAPI = {
  getAll: () => apiRequest('/attendance'),
  getByEmployee: (employeeId) => apiRequest(`/attendance/employee/${employeeId}`),
  checkIn: (attendanceData) => apiRequest('/attendance/checkin', {
    method: 'POST',
    body: JSON.stringify(attendanceData),
  }),
  checkOut: (id, checkoutData) => apiRequest(`/attendance/${id}/checkout`, {
    method: 'PUT',
    body: JSON.stringify(checkoutData),
  }),
};

// Leave Requests API
export const leaveRequestsAPI = {
  getAll: () => apiRequest('/leave-requests'),
  getByEmployee: (employeeId) => apiRequest(`/leave-requests/employee/${employeeId}`),
  create: (leaveRequest) => apiRequest('/leave-requests', {
    method: 'POST',
    body: JSON.stringify(leaveRequest),
  }),
  updateStatus: (id, statusData) => apiRequest(`/leave-requests/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify(statusData),
  }),
  getBalance: (employeeId) => apiRequest(`/leave-requests/balance/${employeeId}`),
};

// Salary API
export const salaryAPI = {
  getAll: () => apiRequest('/salaries'),
  getByEmployee: (employeeId) => apiRequest(`/salaries/employee/${employeeId}`),
  create: (salary) => apiRequest('/salaries', {
    method: 'POST',
    body: JSON.stringify(salary),
  }),
  update: (id, salary) => apiRequest(`/salaries/${id}`, {
    method: 'PUT',
    body: JSON.stringify(salary),
  }),
};

// Payroll API
export const payrollAPI = {
  getAll: () => apiRequest('/payroll'),
  getByEmployee: (employeeId) => apiRequest(`/payroll/employee/${employeeId}`),
  generatePayroll: (payrollData) => apiRequest('/payroll/generate', {
    method: 'POST',
    body: JSON.stringify(payrollData),
  }),
};

// Documents API
export const documentsAPI = {
  getByEmployee: (employeeId) => apiRequest(`/documents/employee/${employeeId}`),
  upload: async (formData) => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/documents/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData, // FormData for file uploads
    });
    return handleResponse(response);
  },
};

// Notifications API
export const notificationsAPI = {
  getByEmployee: (employeeId) => apiRequest(`/notifications/employee/${employeeId}`),
  getAll: () => apiRequest('/notifications'),
  markAsRead: (id) => apiRequest(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllAsRead: (employeeId) => apiRequest(`/notifications/employee/${employeeId}/read-all`, { method: 'PUT' }),
  getUnreadCount: (employeeId) => apiRequest(`/notifications/employee/${employeeId}/unread-count`),
};

export default {
  auth: authAPI,
  employees: employeesAPI,
  attendance: attendanceAPI,
  leaveRequests: leaveRequestsAPI,
  salary: salaryAPI,
  payroll: payrollAPI,
  documents: documentsAPI,
  notifications: notificationsAPI,
};
