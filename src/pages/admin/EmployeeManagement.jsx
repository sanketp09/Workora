import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical,
  Eye,
  Edit,
  UserX,
  UserCheck,
  Copy,
  Mail,
  X,
  Check,
  AlertTriangle
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import './EmployeeManagement.css';

export default function EmployeeManagement() {
  const { employees, addEmployee, updateEmployee } = useData();
  const toast = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const [generatedCredentials, setGeneratedCredentials] = useState(null);

  const [newEmployee, setNewEmployee] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'employee',
    department: 'Engineering',
    yearOfJoining: new Date().getFullYear()
  });

  const departments = ['Engineering', 'Design', 'Product', 'HR', 'Marketing', 'Finance', 'Operations'];

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         emp.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = departmentFilter === 'all' || emp.department === departmentFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && emp.status !== 'inactive') ||
                         (statusFilter === 'inactive' && emp.status === 'inactive');
    return matchesSearch && matchesDept && matchesStatus;
  });

  const generateLoginId = (firstName, lastName, year) => {
    const serial = String(employees.length + 1).padStart(3, '0');
    return `OI${firstName.toUpperCase().slice(0,2)}${lastName.toUpperCase().slice(0,2)}${year}${serial}`;
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleCreateEmployee = () => {
    if (!newEmployee.firstName || !newEmployee.lastName || !newEmployee.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    const loginId = generateLoginId(newEmployee.firstName, newEmployee.lastName, newEmployee.yearOfJoining);
    const tempPassword = generatePassword();

    const employee = {
      id: loginId,
      name: `${newEmployee.firstName} ${newEmployee.lastName}`,
      email: newEmployee.email,
      role: newEmployee.role,
      department: newEmployee.department,
      position: newEmployee.role === 'hr' ? 'HR Manager' : 'Team Member',
      joinDate: `${newEmployee.yearOfJoining}-01-15`,
      status: 'active',
      avatar: null
    };

    if (addEmployee) {
      addEmployee(employee);
    }

    setGeneratedCredentials({ loginId, tempPassword, email: newEmployee.email });
    toast.success('Employee created successfully!');
  };

  const handleCopyCredentials = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleSendEmail = () => {
    toast.success(`Credentials sent to ${generatedCredentials.email}`);
    setShowCreateModal(false);
    setGeneratedCredentials(null);
    setNewEmployee({
      firstName: '',
      lastName: '',
      email: '',
      role: 'employee',
      department: 'Engineering',
      yearOfJoining: new Date().getFullYear()
    });
  };

  const handleDisableEmployee = () => {
    if (updateEmployee && selectedEmployee) {
      updateEmployee(selectedEmployee.id, { ...selectedEmployee, status: 'inactive' });
      toast.success('Employee account disabled');
      setShowDisableModal(false);
      setSelectedEmployee(null);
    }
  };

  const handleEnableEmployee = (emp) => {
    if (updateEmployee) {
      updateEmployee(emp.id, { ...emp, status: 'active' });
      toast.success('Employee account enabled');
    }
  };

  return (
    <div className="employee-management animate-fadeIn">
      {/* Header */}
      <div className="admin-header">
        <div>
          <h1>Employee Management</h1>
          <p>Manage all employee accounts and profiles</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={18} />
          Create Employee
        </button>
      </div>

      {/* Filters */}
      <div className="filters-bar card">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="input"
            placeholder="Search by name, email, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select 
          className="select"
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
        >
          <option value="all">All Departments</option>
          {departments.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
        <select 
          className="select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Employee Table */}
      <div className="employee-table card">
        <table className="table">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Role</th>
              <th>Department</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map(emp => (
              <tr key={emp.id} className={emp.status === 'inactive' ? 'inactive-row' : ''}>
                <td><code>{emp.id}</code></td>
                <td>
                  <div className="employee-cell">
                    <div className="emp-avatar">{emp.name.split(' ').map(n => n[0]).join('')}</div>
                    <div>
                      <span className="emp-name">{emp.name}</span>
                      <span className="emp-email">{emp.email}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`role-badge ${emp.role}`}>
                    {emp.role === 'hr' ? 'HR Admin' : 'Employee'}
                  </span>
                </td>
                <td>{emp.department}</td>
                <td>
                  <span className={`status-pill ${emp.status === 'inactive' ? 'inactive' : 'active'}`}>
                    {emp.status === 'inactive' ? 'Inactive' : 'Active'}
                  </span>
                </td>
                <td>
                  <div className="actions-cell">
                    <button 
                      className="action-btn"
                      onClick={() => setActiveMenu(activeMenu === emp.id ? null : emp.id)}
                    >
                      <MoreVertical size={18} />
                    </button>
                    {activeMenu === emp.id && (
                      <div className="action-menu">
                        <button onClick={() => {
                          setSelectedEmployee(emp);
                          setShowViewModal(true);
                          setActiveMenu(null);
                        }}>
                          <Eye size={16} /> View Profile
                        </button>
                        <button onClick={() => {
                          setSelectedEmployee(emp);
                          setShowEditModal(true);
                          setActiveMenu(null);
                        }}>
                          <Edit size={16} /> Edit Profile
                        </button>
                        <div className="menu-divider" />
                        {emp.status === 'inactive' ? (
                          <button className="enable" onClick={() => {
                            handleEnableEmployee(emp);
                            setActiveMenu(null);
                          }}>
                            <UserCheck size={16} /> Enable Account
                          </button>
                        ) : (
                          <button className="danger" onClick={() => {
                            setSelectedEmployee(emp);
                            setShowDisableModal(true);
                            setActiveMenu(null);
                          }}>
                            <UserX size={16} /> Disable Account
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Employee Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => !generatedCredentials && setShowCreateModal(false)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{generatedCredentials ? 'Employee Created!' : 'Create New Employee'}</h2>
              {!generatedCredentials && (
                <button className="close-btn" onClick={() => setShowCreateModal(false)}>
                  <X size={20} />
                </button>
              )}
            </div>
            <div className="modal-body">
              {!generatedCredentials ? (
                <div className="form-grid">
                  <div className="form-group">
                    <label>First Name *</label>
                    <input
                      type="text"
                      className="input"
                      value={newEmployee.firstName}
                      onChange={(e) => setNewEmployee({...newEmployee, firstName: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name *</label>
                    <input
                      type="text"
                      className="input"
                      value={newEmployee.lastName}
                      onChange={(e) => setNewEmployee({...newEmployee, lastName: e.target.value})}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Email *</label>
                    <input
                      type="email"
                      className="input"
                      value={newEmployee.email}
                      onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Role</label>
                    <select
                      className="select"
                      value={newEmployee.role}
                      onChange={(e) => setNewEmployee({...newEmployee, role: e.target.value})}
                    >
                      <option value="employee">Employee</option>
                      <option value="hr">HR Admin</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Department</label>
                    <select
                      className="select"
                      value={newEmployee.department}
                      onChange={(e) => setNewEmployee({...newEmployee, department: e.target.value})}
                    >
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group full-width">
                    <label>Year of Joining</label>
                    <input
                      type="number"
                      className="input"
                      value={newEmployee.yearOfJoining}
                      onChange={(e) => setNewEmployee({...newEmployee, yearOfJoining: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="info-box full-width">
                    <AlertTriangle size={18} />
                    <span>Login ID and temporary password will be auto-generated after creation.</span>
                  </div>
                </div>
              ) : (
                <div className="credentials-display">
                  <div className="success-icon">
                    <Check size={32} />
                  </div>
                  <p>Employee account has been created successfully. Share these credentials with the employee:</p>
                  
                  <div className="credential-item">
                    <label>Login ID</label>
                    <div className="credential-value">
                      <code>{generatedCredentials.loginId}</code>
                      <button onClick={() => handleCopyCredentials(generatedCredentials.loginId)}>
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="credential-item">
                    <label>Temporary Password</label>
                    <div className="credential-value">
                      <code>{generatedCredentials.tempPassword}</code>
                      <button onClick={() => handleCopyCredentials(generatedCredentials.tempPassword)}>
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="warning-box">
                    <AlertTriangle size={18} />
                    <span>Employee must change password on first login.</span>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              {!generatedCredentials ? (
                <>
                  <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={handleCreateEmployee}>
                    Create Employee
                  </button>
                </>
              ) : (
                <>
                  <button className="btn btn-secondary" onClick={() => {
                    setShowCreateModal(false);
                    setGeneratedCredentials(null);
                  }}>
                    Close
                  </button>
                  <button className="btn btn-primary" onClick={handleSendEmail}>
                    <Mail size={16} />
                    Send via Email
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Disable Confirmation Modal */}
      {showDisableModal && selectedEmployee && (
        <div className="modal-overlay" onClick={() => setShowDisableModal(false)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Disable Account</h2>
            </div>
            <div className="modal-body">
              <div className="confirm-message">
                <AlertTriangle size={48} className="warning-icon" />
                <p>Are you sure you want to disable the account for <strong>{selectedEmployee.name}</strong>?</p>
                <span>This will prevent them from logging in. You can re-enable later.</span>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDisableModal(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDisableEmployee}>
                Disable Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Profile Modal */}
      {showViewModal && selectedEmployee && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Employee Profile</h2>
              <button className="close-btn" onClick={() => setShowViewModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="profile-view">
                <div className="profile-avatar-large">
                  {selectedEmployee.name.split(' ').map(n => n[0]).join('')}
                </div>
                <h3>{selectedEmployee.name}</h3>
                <span className={`role-badge ${selectedEmployee.role}`}>
                  {selectedEmployee.role === 'hr' ? 'HR Admin' : 'Employee'}
                </span>
                
                <div className="profile-details">
                  <div className="detail-row">
                    <span>Employee ID</span>
                    <code>{selectedEmployee.id}</code>
                  </div>
                  <div className="detail-row">
                    <span>Email</span>
                    <span>{selectedEmployee.email}</span>
                  </div>
                  <div className="detail-row">
                    <span>Department</span>
                    <span>{selectedEmployee.department}</span>
                  </div>
                  <div className="detail-row">
                    <span>Position</span>
                    <span>{selectedEmployee.position}</span>
                  </div>
                  <div className="detail-row">
                    <span>Join Date</span>
                    <span>{new Date(selectedEmployee.joinDate).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-row">
                    <span>Status</span>
                    <span className={`status-pill ${selectedEmployee.status === 'inactive' ? 'inactive' : 'active'}`}>
                      {selectedEmployee.status === 'inactive' ? 'Inactive' : 'Active'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowViewModal(false)}>
                Close
              </button>
              <button className="btn btn-primary" onClick={() => {
                setShowViewModal(false);
                setShowEditModal(true);
              }}>
                <Edit size={16} />
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
