import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('workora_user');
    const token = localStorage.getItem('authToken');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const signIn = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const userData = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        role: response.user.role,
        department: response.user.department,
        designation: response.user.designation,
      };
      
      setUser(userData);
      localStorage.setItem('workora_user', JSON.stringify(userData));
      
      return { success: true };
    } catch (error) {
      console.error('Sign in error:', error);
      return { 
        success: false, 
        error: error.message || 'Invalid email or password'
      };
    }
  };

  const signUp = async (userData) => {
    try {
      const response = await authAPI.register({
        email: userData.email,
        password: userData.password,
        name: userData.email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        role: userData.role || 'employee',
        employee_id: userData.employeeId,
      });
      
      const newUser = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        role: response.user.role,
        department: response.user.department || 'Unassigned',
        designation: response.user.designation || 'New Employee',
      };
      
      setUser(newUser);
      localStorage.setItem('workora_user', JSON.stringify(newUser));
      
      return { success: true };
    } catch (error) {
      console.error('Sign up error:', error);
      return { 
        success: false, 
        error: error.message || 'Registration failed'
      };
    }
  };

  const signOut = () => {
    authAPI.logout();
    setUser(null);
    localStorage.removeItem('workora_user');
  };

  const switchRole = () => {
    if (user) {
      const newRole = user.role === 'employee' ? 'hr' : 'employee';
      const updatedUser = { ...user, role: newRole };
      setUser(updatedUser);
      localStorage.setItem('workora_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading: isLoading, signIn, signUp, signOut, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
