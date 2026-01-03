import { useState } from 'react';
import { 
  Check,
  X,
  MessageSquare,
  Filter,
  Calendar,
  Clock,
  User,
  AlertCircle
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import './LeaveApproval.css';

export default function LeaveApproval() {
  const { employees, getAllLeaves, updateLeaveStatus } = useData();
  const toast = useToast();
  
  const [statusFilter, setStatusFilter] = useState('pending');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // Mock leave requests
  const leaveRequests = [
    { id: 1, employeeId: 'EMP001', employeeName: 'John Doe', department: 'Engineering', type: 'paid', startDate: '2026-01-06', endDate: '2026-01-08', days: 3, reason: 'Family vacation', status: 'pending', appliedOn: '2026-01-02' },
    { id: 2, employeeId: 'EMP002', employeeName: 'Jane Smith', department: 'Design', type: 'sick', startDate: '2026-01-05', endDate: '2026-01-05', days: 1, reason: 'Doctor appointment', status: 'pending', appliedOn: '2026-01-03' },
    { id: 3, employeeId: 'EMP003', employeeName: 'Mike Johnson', department: 'Product', type: 'paid', startDate: '2026-01-10', endDate: '2026-01-12', days: 3, reason: 'Personal work', status: 'pending', appliedOn: '2026-01-02' },
    { id: 4, employeeId: 'EMP004', employeeName: 'Sarah Wilson', department: 'Marketing', type: 'paid', startDate: '2026-01-15', endDate: '2026-01-17', days: 3, reason: 'Wedding ceremony', status: 'pending', appliedOn: '2026-01-03' },
    { id: 5, employeeId: 'EMP005', employeeName: 'Tom Brown', department: 'Engineering', type: 'sick', startDate: '2026-01-04', endDate: '2026-01-04', days: 1, reason: 'Not feeling well', status: 'pending', appliedOn: '2026-01-03' },
    { id: 6, employeeId: 'EMP006', employeeName: 'Emily Davis', department: 'HR', type: 'paid', startDate: '2025-12-24', endDate: '2025-12-26', days: 3, reason: 'Christmas holidays', status: 'approved', appliedOn: '2025-12-20', approvedBy: 'Admin', approvedOn: '2025-12-21' },
    { id: 7, employeeId: 'EMP007', employeeName: 'David Lee', department: 'Finance', type: 'paid', startDate: '2025-12-30', endDate: '2025-12-31', days: 2, reason: 'New year celebration', status: 'approved', appliedOn: '2025-12-25', approvedBy: 'Admin', approvedOn: '2025-12-26' },
    { id: 8, employeeId: 'EMP008', employeeName: 'Lisa Chen', department: 'Engineering', type: 'paid', startDate: '2025-12-20', endDate: '2025-12-22', days: 3, reason: 'Moving to new house', status: 'rejected', appliedOn: '2025-12-18', rejectedBy: 'Admin', rejectedOn: '2025-12-19', rejectReason: 'Critical project deadline' },
  ];

  const filteredRequests = leaveRequests.filter(req => {
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    const matchesType = typeFilter === 'all' || req.type === typeFilter;
    return matchesStatus && matchesType;
  });

  const pendingCount = leaveRequests.filter(r => r.status === 'pending').length;

  const handleApprove = (request) => {
    toast.success(`Leave approved for ${request.employeeName}`);
    // In real app, update the request status
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    toast.success(`Leave rejected for ${selectedRequest.employeeName}`);
    setShowRejectModal(false);
    setRejectReason('');
    setSelectedRequest(null);
  };

  const openRejectModal = (request) => {
    setSelectedRequest(request);
    setShowRejectModal(true);
  };

  const getTypeBadge = (type) => {
    const types = {
      paid: { label: 'Paid Leave', class: 'paid' },
      sick: { label: 'Sick Leave', class: 'sick' },
      personal: { label: 'Personal', class: 'personal' }
    };
    const t = types[type] || types.paid;
    return <span className={`type-badge ${t.class}`}>{t.label}</span>;
  };

  const getStatusBadge = (status) => {
    const statuses = {
      pending: { label: 'Pending', class: 'pending' },
      approved: { label: 'Approved', class: 'approved' },
      rejected: { label: 'Rejected', class: 'rejected' }
    };
    const s = statuses[status];
    return <span className={`status-badge ${s.class}`}>{s.label}</span>;
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="leave-approval animate-fadeIn">
      {/* Header */}
      <div className="admin-header">
        <div>
          <h1>Leave Approval</h1>
          <p>Review and manage employee leave requests</p>
        </div>
        {pendingCount > 0 && (
          <div className="pending-badge">
            <AlertCircle size={18} />
            {pendingCount} Pending Approval{pendingCount > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="leave-stats">
        <div 
          className={`stat-card ${statusFilter === 'pending' ? 'active' : ''}`}
          onClick={() => setStatusFilter('pending')}
        >
          <Clock size={24} />
          <div>
            <span>Pending</span>
            <h3>{leaveRequests.filter(r => r.status === 'pending').length}</h3>
          </div>
        </div>
        <div 
          className={`stat-card ${statusFilter === 'approved' ? 'active' : ''}`}
          onClick={() => setStatusFilter('approved')}
        >
          <Check size={24} />
          <div>
            <span>Approved</span>
            <h3>{leaveRequests.filter(r => r.status === 'approved').length}</h3>
          </div>
        </div>
        <div 
          className={`stat-card ${statusFilter === 'rejected' ? 'active' : ''}`}
          onClick={() => setStatusFilter('rejected')}
        >
          <X size={24} />
          <div>
            <span>Rejected</span>
            <h3>{leaveRequests.filter(r => r.status === 'rejected').length}</h3>
          </div>
        </div>
        <div 
          className={`stat-card ${statusFilter === 'all' ? 'active' : ''}`}
          onClick={() => setStatusFilter('all')}
        >
          <Calendar size={24} />
          <div>
            <span>Total</span>
            <h3>{leaveRequests.length}</h3>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar card">
        <select
          className="select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="paid">Paid Leave</option>
          <option value="sick">Sick Leave</option>
          <option value="personal">Personal</option>
        </select>
      </div>

      {/* Requests Table */}
      <div className="requests-table card">
        <table className="table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Leave Type</th>
              <th>Date Range</th>
              <th>Days</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map(req => (
              <tr key={req.id}>
                <td>
                  <div className="employee-cell">
                    <div className="emp-avatar">
                      {req.employeeName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <span className="emp-name">{req.employeeName}</span>
                      <span className="emp-dept">{req.department}</span>
                    </div>
                  </div>
                </td>
                <td>{getTypeBadge(req.type)}</td>
                <td>
                  <div className="date-range">
                    <span>{formatDate(req.startDate)}</span>
                    {req.startDate !== req.endDate && (
                      <>
                        <span className="to">→</span>
                        <span>{formatDate(req.endDate)}</span>
                      </>
                    )}
                  </div>
                </td>
                <td><strong>{req.days}</strong> day{req.days > 1 ? 's' : ''}</td>
                <td>
                  <span className="reason-text" title={req.reason}>
                    {req.reason.length > 30 ? req.reason.substring(0, 30) + '...' : req.reason}
                  </span>
                </td>
                <td>{getStatusBadge(req.status)}</td>
                <td>
                  {req.status === 'pending' ? (
                    <div className="action-buttons">
                      <button 
                        className="btn btn-success btn-sm"
                        onClick={() => handleApprove(req)}
                      >
                        <Check size={16} />
                        Approve
                      </button>
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => openRejectModal(req)}
                      >
                        <X size={16} />
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className="action-done">
                      {req.status === 'approved' ? `By ${req.approvedBy}` : `By ${req.rejectedBy}`}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredRequests.length === 0 && (
          <div className="empty-state">
            <Calendar size={48} />
            <p>No leave requests found</p>
          </div>
        )}
      </div>

      {/* System Behavior Note */}
      <div className="system-note">
        <AlertCircle size={18} />
        <div>
          <strong>System Behavior:</strong>
          <ul>
            <li>Approved leaves automatically update employee attendance records</li>
            <li>Rejected leaves have no impact on attendance or payroll</li>
            <li>Status changes are reflected immediately across the system</li>
          </ul>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Reject Leave Request</h2>
            </div>
            <div className="modal-body">
              <div className="request-summary">
                <div className="summary-row">
                  <User size={18} />
                  <span>{selectedRequest.employeeName}</span>
                </div>
                <div className="summary-row">
                  <Calendar size={18} />
                  <span>{formatDate(selectedRequest.startDate)} - {formatDate(selectedRequest.endDate)} ({selectedRequest.days} days)</span>
                </div>
              </div>
              
              <div className="form-group">
                <label>Reason for Rejection *</label>
                <textarea
                  className="input textarea"
                  rows={4}
                  placeholder="Please provide a reason for rejecting this leave request..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
                <span className="field-note">This reason will be shared with the employee</span>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowRejectModal(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleReject}>
                <X size={16} />
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
