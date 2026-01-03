import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const savedToken = localStorage.getItem('workora_token');
    const savedUser = localStorage.getItem('workora_user');
    
    if (savedToken && savedUser) {
      try {
        const profile = await api.getProfile(savedToken);
        if (profile.success) {
          setToken(savedToken);
          setUser(profile.user);
        } else {
          localStorage.removeItem('workora_token');
          localStorage.removeItem('workora_user');
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        localStorage.removeItem('workora_token');
        localStorage.removeItem('workora_user');
      }
    }
    
    setIsLoading(false);
  };

  const signIn = async (loginId, password) => {
    try {
      const result = await api.login(loginId.toUpperCase(), password);
      
      if (result.success) {
        setToken(result.token);
        setUser(result.user);
        localStorage.setItem('workora_token', result.token);
        localStorage.setItem('workora_user', JSON.stringify(result.user));
        return { success: true };
      }
      
      return { success: false, error: result.message };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  const changePassword = async (newPassword) => {
    try {
      const result = await api.changePassword(token, newPassword);
      
      if (result.success) {
        // Update user's must_change_password flag
        const updatedUser = { ...user, must_change_password: false };
        setUser(updatedUser);
        localStorage.setItem('workora_user', JSON.stringify(updatedUser));
        return { success: true };
      }
      
      return { success: false, error: result.message };
    } catch (error) {
      console.error('Change password error:', error);
      return { success: false, error: error.message || 'Password change failed' };
    }
  };

  const signOut = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('workora_token');
    localStorage.removeItem('workora_user');
  };

  const createEmployee = async (employeeData) => {
    try {
      const result = await api.createEmployee(token, employeeData);
      return result;
    } catch (error) {
      console.error('Create employee error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token,
      isLoading: isLoading,
      loading: isLoading,
      signIn, 
      changePassword,
      signOut, 
      createEmployee
    }}>
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
