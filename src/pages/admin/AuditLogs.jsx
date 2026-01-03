import { useState } from 'react';
import { 
  Shield,
  Search,
  Filter,
  Calendar,
  User,
  Settings,
  DollarSign,
  UserPlus,
  UserMinus,
  Edit,
  Check,
  X,
  Clock,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  FileText
} from 'lucide-react';
import './AuditLogs.css';

export default function AuditLogs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [entityFilter, setEntityFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '2026-01-01', end: '2026-01-31' });
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  // Generate mock audit logs
  const generateAuditLogs = () => {
    const actions = [
      { type: 'employee_created', entity: 'employee', icon: UserPlus, description: 'Employee account created', color: 'success' },
      { type: 'employee_disabled', entity: 'employee', icon: UserMinus, description: 'Employee account disabled', color: 'error' },
      { type: 'salary_updated', entity: 'salary', icon: DollarSign, description: 'Salary configuration updated', color: 'primary' },
      { type: 'leave_approved', entity: 'leave', icon: Check, description: 'Leave request approved', color: 'success' },
      { type: 'leave_rejected', entity: 'leave', icon: X, description: 'Leave request rejected', color: 'error' },
      { type: 'attendance_modified', entity: 'attendance', icon: Clock, description: 'Attendance record modified', color: 'warning' },
      { type: 'payroll_finalized', entity: 'payroll', icon: DollarSign, description: 'Payroll finalized', color: 'success' },
      { type: 'settings_changed', entity: 'settings', icon: Settings, description: 'System settings changed', color: 'primary' },
      { type: 'employee_updated', entity: 'employee', icon: Edit, description: 'Employee profile updated', color: 'primary' }
    ];

    const admins = ['Ravindra Singh (Admin)', 'Priya Sharma (HR)', 'System'];
    const employees = ['Anjali Mehta', 'Vikram Patel', 'Sneha Kapoor', 'Arjun Reddy', 'Neha Gupta'];

    const logs = [];
    for (let i = 0; i < 50; i++) {
      const action = actions[Math.floor(Math.random() * actions.length)];
      const admin = admins[Math.floor(Math.random() * admins.length)];
      const employee = employees[Math.floor(Math.random() * employees.length)];
      
      const date = new Date(2026, 0, Math.floor(1 + Math.random() * 30));
      date.setHours(Math.floor(9 + Math.random() * 9), Math.floor(Math.random() * 60));
      
      let oldValue = '';
      let newValue = '';
      
      if (action.type === 'salary_updated') {
        oldValue = '₹' + (40000 + Math.floor(Math.random() * 20000)).toLocaleString();
        newValue = '₹' + (50000 + Math.floor(Math.random() * 30000)).toLocaleString();
      } else if (action.type === 'employee_updated') {
        const fields = ['Department', 'Position', 'Email', 'Phone'];
        const field = fields[Math.floor(Math.random() * fields.length)];
        oldValue = field === 'Department' ? 'Engineering' : field === 'Position' ? 'Developer' : 'old@email.com';
        newValue = field === 'Department' ? 'Product' : field === 'Position' ? 'Senior Developer' : 'new@email.com';
      } else if (action.type === 'leave_rejected') {
        oldValue = 'Pending';
        newValue = 'Rejected (Reason: Critical project deadline)';
      } else if (action.type === 'attendance_modified') {
        oldValue = 'Absent';
        newValue = 'Present (Manual override)';
      }

      logs.push({
        id: `LOG-${1000 + i}`,
        action: action.type,
        actionDescription: action.description,
        entity: action.entity,
        entityAffected: employee,
        changedBy: admin,
        timestamp: date,
        oldValue,
        newValue,
        icon: action.icon,
        color: action.color,
        ipAddress: `192.168.1.${Math.floor(100 + Math.random() * 155)}`,
        userAgent: 'Chrome 120 on Windows'
      });
    }

    return logs.sort((a, b) => b.timestamp - a.timestamp);
  };

  const [auditLogs] = useState(generateAuditLogs());

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.entityAffected.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.changedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesEntity = entityFilter === 'all' || log.entity === entityFilter;
    const logDate = log.timestamp.toISOString().split('T')[0];
    const matchesDate = logDate >= dateRange.start && logDate <= dateRange.end;
    
    return matchesSearch && matchesAction && matchesEntity && matchesDate;
  });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleExport = () => {
    // Export logic would go here
  };

  const viewDetails = (log) => {
    setSelectedLog(log);
    setShowDetailModal(true);
  };

  return (
    <div className="audit-logs animate-fadeIn">
      {/* Header */}
      <div className="admin-header">
        <div className="header-content">
          <div className="header-icon">
            <Shield size={28} />
          </div>
          <div>
            <h1>Audit Logs</h1>
            <p>Track all system changes for compliance & transparency</p>
          </div>
        </div>
        <button className="btn btn-secondary" onClick={handleExport}>
          <Download size={18} />
          Export Logs
        </button>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-item">
          <span>Total Actions</span>
          <strong>{auditLogs.length}</strong>
        </div>
        <div className="stat-item">
          <span>This Month</span>
          <strong>{filteredLogs.length}</strong>
        </div>
        <div className="stat-item">
          <span>Salary Changes</span>
          <strong>{auditLogs.filter(l => l.entity === 'salary').length}</strong>
        </div>
        <div className="stat-item">
          <span>Employee Changes</span>
          <strong>{auditLogs.filter(l => l.entity === 'employee').length}</strong>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section card">
        <div className="filter-row">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="input"
              placeholder="Search by employee, admin, or log ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="filter-group">
            <label>Action Type</label>
            <select
              className="select"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
            >
              <option value="all">All Actions</option>
              <option value="employee_created">Employee Created</option>
              <option value="employee_disabled">Employee Disabled</option>
              <option value="employee_updated">Employee Updated</option>
              <option value="salary_updated">Salary Updated</option>
              <option value="leave_approved">Leave Approved</option>
              <option value="leave_rejected">Leave Rejected</option>
              <option value="attendance_modified">Attendance Modified</option>
              <option value="payroll_finalized">Payroll Finalized</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Entity</label>
            <select
              className="select"
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
            >
              <option value="all">All Entities</option>
              <option value="employee">Employee</option>
              <option value="salary">Salary</option>
              <option value="leave">Leave</option>
              <option value="attendance">Attendance</option>
              <option value="payroll">Payroll</option>
              <option value="settings">Settings</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Date Range</label>
            <div className="date-range">
              <input
                type="date"
                className="input"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              />
              <span>to</span>
              <input
                type="date"
                className="input"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="logs-table card">
        <table className="table">
          <thead>
            <tr>
              <th>Log ID</th>
              <th>Action</th>
              <th>Entity Affected</th>
              <th>Changed By</th>
              <th>Timestamp</th>
              <th>Changes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLogs.map(log => {
              const IconComponent = log.icon;
              return (
                <tr key={log.id}>
                  <td className="log-id">{log.id}</td>
                  <td>
                    <div className={`action-badge ${log.color}`}>
                      <IconComponent size={14} />
                      <span>{log.actionDescription}</span>
                    </div>
                  </td>
                  <td>
                    <div className="entity-cell">
                      <User size={14} />
                      {log.entityAffected}
                    </div>
                  </td>
                  <td className="changed-by">{log.changedBy}</td>
                  <td>
                    <div className="timestamp-cell">
                      <span className="date">{formatDate(log.timestamp)}</span>
                      <span className="time">{formatTime(log.timestamp)}</span>
                    </div>
                  </td>
                  <td>
                    {log.oldValue && log.newValue ? (
                      <div className="changes-cell">
                        <span className="old-value">{log.oldValue}</span>
                        <span className="arrow">→</span>
                        <span className="new-value">{log.newValue}</span>
                      </div>
                    ) : (
                      <span className="no-changes">-</span>
                    )}
                  </td>
                  <td>
                    <button 
                      className="btn btn-ghost btn-sm"
                      onClick={() => viewDetails(log)}
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="pagination">
          <span className="page-info">
            Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredLogs.length)} of {filteredLogs.length}
          </span>
          <div className="page-controls">
            <button 
              className="btn btn-ghost btn-sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              <ChevronLeft size={18} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let page;
              if (totalPages <= 5) {
                page = i + 1;
              } else if (currentPage <= 3) {
                page = i + 1;
              } else if (currentPage >= totalPages - 2) {
                page = totalPages - 4 + i;
              } else {
                page = currentPage - 2 + i;
              }
              return (
                <button
                  key={page}
                  className={`btn btn-sm ${currentPage === page ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              );
            })}
            <button 
              className="btn btn-ghost btn-sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedLog && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <FileText size={20} />
                Audit Log Details
              </h2>
              <button className="close-btn" onClick={() => setShowDetailModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <div className="detail-row">
                  <span className="label">Log ID</span>
                  <span className="value">{selectedLog.id}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Action</span>
                  <span className={`action-badge ${selectedLog.color}`}>
                    <selectedLog.icon size={14} />
                    {selectedLog.actionDescription}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Entity Affected</span>
                  <span className="value">{selectedLog.entityAffected}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Changed By</span>
                  <span className="value">{selectedLog.changedBy}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Timestamp</span>
                  <span className="value">
                    {formatDate(selectedLog.timestamp)} at {formatTime(selectedLog.timestamp)}
                  </span>
                </div>
              </div>

              {selectedLog.oldValue && selectedLog.newValue && (
                <div className="changes-section">
                  <h4>Changes Made</h4>
                  <div className="change-comparison">
                    <div className="change-box old">
                      <span className="change-label">Before</span>
                      <span className="change-value">{selectedLog.oldValue}</span>
                    </div>
                    <div className="change-arrow">→</div>
                    <div className="change-box new">
                      <span className="change-label">After</span>
                      <span className="change-value">{selectedLog.newValue}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="meta-section">
                <h4>Additional Information</h4>
                <div className="meta-grid">
                  <div className="meta-item">
                    <span className="label">IP Address</span>
                    <span className="value">{selectedLog.ipAddress}</span>
                  </div>
                  <div className="meta-item">
                    <span className="label">User Agent</span>
                    <span className="value">{selectedLog.userAgent}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDetailModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
