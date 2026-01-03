// API Base Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// API Client Class
class ApiClient {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // Get auth token from localStorage
  getAuthToken() {
    return localStorage.getItem('authToken');
  }

  // Set auth token in localStorage
  setAuthToken(token) {
    localStorage.setItem('authToken', token);
  }

  // Remove auth token
  removeAuthToken() {
    localStorage.removeItem('authToken');
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getAuthToken();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add authorization header if token exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      
      // Handle token expiration
      if (error.message.includes('Invalid or expired token')) {
        this.removeAuthToken();
        window.location.href = '/signin';
      }
      
      throw error;
    }
  }

  // GET request
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

// Create API client instance
const apiClient = new ApiClient();

// Authentication API
export const authAPI = {
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    if (response.token) {
      apiClient.setAuthToken(response.token);
    }
    return response;
  },

  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    if (response.token) {
      apiClient.setAuthToken(response.token);
    }
    return response;
  },

  logout: () => {
    apiClient.removeAuthToken();
  },

  isAuthenticated: () => {
    return !!apiClient.getAuthToken();
  },
};

// Employee API
export const employeeAPI = {
  getAll: () => apiClient.get('/employees'),
  getById: (id) => apiClient.get(`/employees/${id}`),
  create: (employeeData) => apiClient.post('/employees', employeeData),
  update: (id, employeeData) => apiClient.put(`/employees/${id}`, employeeData),
  delete: (id) => apiClient.delete(`/employees/${id}`),
};

// Attendance API
export const attendanceAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiClient.get(`/attendance${queryString ? `?${queryString}` : ''}`);
  },
  clockIn: (employeeId) => apiClient.post('/attendance/clock', { employee_id: employeeId, type: 'in' }),
  clockOut: (employeeId) => apiClient.post('/attendance/clock', { employee_id: employeeId, type: 'out' }),
  getSummary: (employeeId, month, year) => 
    apiClient.get(`/attendance/summary/${employeeId}?month=${month}&year=${year}`),
};

// Payroll API
export const payrollAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiClient.get(`/payroll${queryString ? `?${queryString}` : ''}`);
  },
  generate: (payrollData) => apiClient.post('/payroll/generate', payrollData),
  update: (id, payrollData) => apiClient.put(`/payroll/${id}`, payrollData),
};

// Reports API
export const reportsAPI = {
  getEmployeeReports: () => apiClient.get('/reports/employees'),
  getAttendanceReports: (month, year) => 
    apiClient.get(`/reports/attendance?month=${month}&year=${year}`),
  getPayrollReports: (month, year) => 
    apiClient.get(`/reports/payroll?month=${month}&year=${year}`),
  getSummary: () => apiClient.get('/reports/summary'),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => apiClient.get('/dashboard/stats'),
  getActivities: () => apiClient.get('/dashboard/activities'),
  getAttendanceTrends: () => apiClient.get('/dashboard/attendance-trends'),
};

export default apiClient;