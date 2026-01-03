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
  
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const departments = [...new Set(employees.map(e => e.department))];

  const filteredEmployees = employees
    .filter(emp => {
      const matchesSearch = 
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDepartment = departmentFilter === 'all' || emp.department === departmentFilter;
      const matchesStatus = statusFilter === 'all' || emp.status === statusFilter;
      return matchesSearch && matchesDepartment && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'department') return a.department.localeCompare(b.department);
      if (sortBy === 'joinDate') return new Date(b.joinDate) - new Date(a.joinDate);
      return 0;
    });

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

  return (
    <div className="employees-page animate-fadeIn">
      {/* Header */}
      <div className="page-header">
        <div className="page-title">
          <h1>Team Directory</h1>
          <span className="employee-count">{filteredEmployees.length} employees</span>
        </div>

        <div className="header-actions">
          <div className="view-toggle">
            <button 
              className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 size={18} />
            </button>
            <button 
              className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-input">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, ID, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <div className="filter-select">
            <Filter size={16} />
            <select 
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div className="filter-select">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="on-leave">On Leave</option>
            </select>
          </div>

          <div className="filter-select">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">Sort by Name</option>
              <option value="department">Sort by Department</option>
              <option value="joinDate">Sort by Join Date</option>
            </select>
          </div>
        </div>
      </div>

      {/* Employee Grid */}
      {viewMode === 'grid' ? (
        <div className="employees-grid">
          {filteredEmployees.map(employee => {
            const status = getStatusColor(employee.status);
            return (
              <div 
                key={employee.id} 
                className="employee-card card-hover"
                onClick={() => setSelectedEmployee(employee)}
              >
                <div className="card-status-indicator" style={{ background: status.color }} />
                
                <div className="card-header">
                  <div className="employee-avatar" style={{ background: getDepartmentColor(employee.department) }}>
                    {getInitials(employee.name)}
                  </div>
                  <div className="employee-badge" style={{ background: status.bg, color: status.color }}>
                    {employee.status === 'present' ? '🟢' : employee.status === 'on-leave' ? '✈️' : '🟡'}
                  </div>
                </div>

                <div className="card-body">
                  <h3 className="employee-name">{employee.name}</h3>
                  <p className="employee-title">{employee.designation}</p>
                  
                  <span 
                    className="department-badge"
                    style={{ 
                      background: `${getDepartmentColor(employee.department)}15`,
                      color: getDepartmentColor(employee.department)
                    }}
                  >
                    {employee.department}
                  </span>

                  <div className="employee-contact">
                    <div className="contact-item">
                      <Mail size={14} />
                      <span>{employee.email}</span>
                    </div>
                    <div className="contact-item">
                      <Phone size={14} />
                      <span>{employee.phone}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="employees-table card">
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Contact</th>
                <th>Join Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map(employee => {
                const status = getStatusColor(employee.status);
                return (
                  <tr 
                    key={employee.id}
                    onClick={() => setSelectedEmployee(employee)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <div className="table-employee">
                        <div 
                          className="avatar"
                          style={{ background: getDepartmentColor(employee.department) }}
                        >
                          {getInitials(employee.name)}
                        </div>
                        <div>
                          <p className="employee-name-sm">{employee.name}</p>
                          <p className="employee-id">{employee.id}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span 
                        className="department-badge"
                        style={{ 
                          background: `${getDepartmentColor(employee.department)}15`,
                          color: getDepartmentColor(employee.department)
                        }}
                      >
                        {employee.department}
                      </span>
                    </td>
                    <td>
                      <div className="table-contact">
                        <p>{employee.email}</p>
                        <p className="text-gray-400">{employee.phone}</p>
                      </div>
                    </td>
                    <td>{formatDate(employee.joinDate)}</td>
                    <td>
                      <span 
                        className="status-badge"
                        style={{ background: status.bg, color: status.color }}
                      >
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {filteredEmployees.length === 0 && (
        <div className="empty-state">
          <User size={48} />
          <h3>No employees found</h3>
          <p>Try adjusting your search or filter criteria</p>
        </div>
      )}

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
