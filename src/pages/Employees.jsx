import { useState } from 'react';
import { 
  Search, 
  Grid3X3, 
  List, 
  Filter, 
  ChevronDown,
  Mail,
  Phone,
  Building2,
  Calendar,
  X,
  User
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import './Employees.css';

export default function Employees() {
  const { employees } = useData();
  const { user } = useAuth();
  
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Debug logging
  console.log('User from Auth:', user);
  console.log('Employees from Data:', employees);

  // Find the current user in employees list
  let currentEmployee = employees.find(emp => emp.id === user?.id);
  
  // If not found in employees list, use the user object directly
  if (!currentEmployee && user) {
    currentEmployee = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || 'N/A',
      department: user.department || 'Not Assigned',
      designation: user.designation || 'Employee',
      joinDate: user.joinDate || new Date().toISOString().split('T')[0],
      status: 'present'
    };
  }
  
  console.log('Current Employee:', currentEmployee);
  
  // Show only current user
  const myProfile = currentEmployee;

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return { bg: 'var(--success-light)', color: 'var(--success)', label: 'Present' };
      case 'absent': return { bg: 'var(--error-light)', color: 'var(--error)', label: 'Absent' };
      case 'on-leave': return { bg: 'var(--info-light)', color: 'var(--primary)', label: 'On Leave' };
      default: return { bg: 'var(--gray-100)', color: 'var(--gray-500)', label: 'Unknown' };
    }
  };

  const getDepartmentColor = (department) => {
    const colors = {
      'Engineering': '#3b82f6',
      'Design': '#8b5cf6',
      'Marketing': '#f59e0b',
      'Sales': '#10b981',
      'Human Resources': '#ec4899',
      'Product': '#06b6d4',
      'Finance': '#6366f1',
    };
    return colors[department] || '#6b7280';
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!myProfile) {
    return (
      <div className="employees-page animate-fadeIn">
        <div className="empty-state">
          <User size={48} />
          <h3>Profile not found</h3>
          <p>Unable to load your profile information</p>
        </div>
      </div>
    );
  }

  const status = getStatusColor(myProfile.status);

  return (
    <div className="employees-page animate-fadeIn">
      {/* Header */}
      <div className="page-header">
        <div className="page-title">
          <h1>My Profile</h1>
          <span className="employee-count">Your Information</span>
        </div>
      </div>

      {/* Employee Card */}
      <div className="employees-grid">
        <div 
          className="employee-card card-hover"
          onClick={() => setSelectedEmployee(myProfile)}
        >
          <div className="card-status-indicator" style={{ background: status.color }} />
          
          <div className="card-header">
            <div className="employee-avatar" style={{ background: getDepartmentColor(myProfile.department) }}>
              {getInitials(myProfile.name)}
            </div>
            <div className="employee-badge" style={{ background: status.bg, color: status.color }}>
              {myProfile.status === 'present' ? '🟢' : myProfile.status === 'on-leave' ? '✈️' : '🟡'}
            </div>
          </div>

          <div className="card-body">
            <h3 className="employee-name">{myProfile.name}</h3>
            <p className="employee-title">{myProfile.designation}</p>
            
            <span 
              className="department-badge"
              style={{ 
                background: `${getDepartmentColor(myProfile.department)}15`,
                color: getDepartmentColor(myProfile.department)
              }}
            >
              {myProfile.department}
            </span>

            <div className="employee-contact">
              <div className="contact-item">
                <Mail size={14} />
                <span>{myProfile.email}</span>
              </div>
              <div className="contact-item">
                <Phone size={14} />
                <span>{myProfile.phone}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Detail Modal */}
      {selectedEmployee && (
        <div className="modal-overlay" onClick={() => setSelectedEmployee(null)}>
          <div className="modal employee-modal animate-scaleIn" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Employee Profile</h2>
              <button className="icon-btn" onClick={() => setSelectedEmployee(null)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="profile-header-section">
                <div 
                  className="avatar avatar-xl"
                  style={{ background: getDepartmentColor(selectedEmployee.department) }}
                >
                  {getInitials(selectedEmployee.name)}
                </div>
                <div className="profile-info">
                  <h3>{selectedEmployee.name}</h3>
                  <p>{selectedEmployee.designation}</p>
                  <span 
                    className="department-badge"
                    style={{ 
                      background: `${getDepartmentColor(selectedEmployee.department)}15`,
                      color: getDepartmentColor(selectedEmployee.department)
                    }}
                  >
                    {selectedEmployee.department}
                  </span>
                </div>
              </div>

              <div className="profile-details">
                <div className="detail-item">
                  <span className="detail-label">Employee ID</span>
                  <span className="detail-value">{selectedEmployee.id}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">{selectedEmployee.email}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Phone</span>
                  <span className="detail-value">{selectedEmployee.phone}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Join Date</span>
                  <span className="detail-value">{formatDate(selectedEmployee.joinDate)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status</span>
                  <span 
                    className="status-badge"
                    style={{ 
                      background: getStatusColor(selectedEmployee.status).bg,
                      color: getStatusColor(selectedEmployee.status).color
                    }}
                  >
                    {getStatusColor(selectedEmployee.status).label}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
