// API Configuration
const API_URL = 'http://localhost:3000/api';

// Password Generator
export const generatePassword = () => {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '@#$%&*';
  
  const all = upper + lower + numbers + special;
  let password = '';
  
  password += upper[Math.floor(Math.random() * upper.length)];
  password += lower[Math.floor(Math.random() * lower.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  for (let i = 4; i < 12; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }
  
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

// API Service
const api = {
  login: async (loginId, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login_id: loginId, password })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }
    return response.json();
  },
  
  changePassword: async (token, newPassword) => {
    const response = await fetch(`${API_URL}/auth/change-password`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ new_password: newPassword })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Password change failed');
    }
    return response.json();
  },
  
  createEmployee: async (token, employeeData) => {
    const response = await fetch(`${API_URL}/employees/create`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(employeeData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Employee creation failed');
    }
    return response.json();
  },
  
  getProfile: async (token) => {
    const response = await fetch(`${API_URL}/auth/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch profile');
    }
    return response.json();
  },

  getAllEmployees: async (token) => {
    const response = await fetch(`${API_URL}/employees`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch employees');
    }
    return response.json();
  }
};

export default api;
