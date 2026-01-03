import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Demo users data
const demoUsers = [
  {
    id: 'EMP001',
    email: 'john.doe@dayflow.com',
    password: 'Password123!',
    name: 'John Doe',
    role: 'employee',
    avatar: null,
    department: 'Engineering',
    designation: 'Senior Developer',
    phone: '+1 234 567 8901',
    joinDate: '2023-03-15',
  },
  {
    id: 'HR001',
    email: 'sarah.admin@dayflow.com',
    password: 'Admin123!',
    name: 'Sarah Johnson',
    role: 'hr',
    avatar: null,
    department: 'Human Resources',
    designation: 'HR Manager',
    phone: '+1 234 567 8902',
    joinDate: '2022-01-10',
  },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('dayflow_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const signIn = async (email, password) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = demoUsers.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('dayflow_user', JSON.stringify(userWithoutPassword));
      return { success: true };
    }
    
    return { success: false, error: 'Invalid email or password' };
  };

  const signUp = async (userData) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if email already exists
    const exists = demoUsers.find(
      u => u.email.toLowerCase() === userData.email.toLowerCase()
    );
    
    if (exists) {
      return { success: false, error: 'Email already registered' };
    }
    
    const newUser = {
      id: userData.employeeId,
      email: userData.email,
      name: userData.email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      role: userData.role,
      avatar: null,
      department: 'Unassigned',
      designation: 'New Employee',
      phone: '',
      joinDate: new Date().toISOString().split('T')[0],
    };
    
    setUser(newUser);
    localStorage.setItem('dayflow_user', JSON.stringify(newUser));
    return { success: true };
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('dayflow_user');
  };

  const switchRole = () => {
    if (user) {
      const newRole = user.role === 'employee' ? 'hr' : 'employee';
      const updatedUser = { ...user, role: newRole };
      setUser(updatedUser);
      localStorage.setItem('dayflow_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut, switchRole }}>
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
