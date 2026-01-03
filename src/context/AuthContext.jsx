import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Auto-login with mock user (bypass authentication)
    const mockUser = {
      id: 'mock-user-1',
      email: 'demo@workora.com',
      name: 'Demo User',
      role: 'admin',
      department: 'Engineering',
      designation: 'System Admin',
      avatar: null,
      phone: '+1 234 567 8901',
      joinDate: '2024-01-01',
    };
    
    setUser(mockUser);
    localStorage.setItem('workora_user', JSON.stringify(mockUser));
    setIsLoading(false);
  }, []);

  const signIn = async (email, password) => {
    // Always return success with mock user
    const mockUser = {
      id: 'mock-user-1',
      email: email || 'demo@workora.com',
      name: 'Demo User',
      role: 'admin',
      department: 'Engineering',
      designation: 'System Admin',
      avatar: null,
      phone: '+1 234 567 8901',
      joinDate: '2024-01-01',
    };
    
    setUser(mockUser);
    localStorage.setItem('workora_user', JSON.stringify(mockUser));
    return { success: true };
  };

  const signUp = async (userData) => {
    // Always return success with mock user
    const mockUser = {
      id: 'mock-user-' + Date.now(),
      email: userData.email || 'demo@workora.com',
      name: userData.email ? userData.email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Demo User',
      role: userData.role || 'employee',
      department: 'Engineering',
      designation: 'System Admin',
      avatar: null,
      phone: '+1 234 567 8901',
      joinDate: new Date().toISOString().split('T')[0],
    };
    
    setUser(mockUser);
    localStorage.setItem('workora_user', JSON.stringify(mockUser));
    return { success: true };
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('workora_user');
  };

  const switchRole = () => {
    if (user) {
      const newRole = user.role === 'employee' ? 'admin' : 'employee';
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
