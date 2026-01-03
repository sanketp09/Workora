import { useState, useEffect } from 'react';
import { 
  Check,
  X,
  MessageSquare,
  Filter,
  Calendar,
  Clock,
  User,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import './LeaveApproval.css';

export default function LeaveApproval() {
  const { leaveRequests, updateLeaveRequestStatus, loadInitialData, loading } = useData();
  const toast = useToast();
  
  const [statusFilter, setStatusFilter] = useState('pending');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [approveComment, setApproveComment] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Use real leave requests from context
  const filteredRequests = leaveRequests.filter(req => {
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    const matchesType = typeFilter === 'all' || req.type === typeFilter;
    return matchesStatus && matchesType;
  });

  const pendingCount = leaveRequests.filter(r => r.status === 'pending').length;
  const approvedCount = leaveRequests.filter(r => r.status === 'approved').length;
  const deniedCount = leaveRequests.filter(r => r.status === 'denied' || r.status === 'rejected').length;

  const handleApprove = async () => {
    if (!selectedRequest) return;
    
    setIsProcessing(true);
    try {
      await updateLeaveRequestStatus(selectedRequest.id, 'approved', null, approveComment);
      toast.success(`Leave approved for ${selectedRequest.employeeName}`);
      setShowApproveModal(false);
      setApproveComment('');
      setSelectedRequest(null);
      // Refresh data
      await loadInitialData();
    } catch (error) {
      toast.error('Failed to approve leave request');
      console.error('Error approving leave:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    
    setIsProcessing(true);
    try {
      await updateLeaveRequestStatus(selectedRequest.id, 'denied', rejectReason);
      toast.success(`Leave rejected for ${selectedRequest.employeeName}`);
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedRequest(null);
      // Refresh data
      await loadInitialData();
    } catch (error) {
      toast.error('Failed to reject leave request');
      console.error('Error rejecting leave:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const openApproveModal = (request) => {
    setSelectedRequest(request);
    setShowApproveModal(true);
  };

  const openRejectModal = (request) => {
    setSelectedRequest(request);
    setShowRejectModal(true);
  };

  const handleRefresh = async () => {
    await loadInitialData();
    toast.success('Data refreshed');
  };

  const getTypeBadge = (type) => {
    const types = {
      paid: { label: 'Paid Leave', class: 'paid' },
      vacation: { label: 'Vacation', class: 'paid' },
      sick: { label: 'Sick Leave', class: 'sick' },
      personal: { label: 'Personal', class: 'personal' },
      unpaid: { label: 'Unpaid', class: 'unpaid' }
    };
    const t = types[type] || { label: type, class: 'paid' };
    return <span className={`type-badge ${t.class}`}>{t.label}</span>;
  };

  const getStatusBadge = (status) => {
    const statuses = {
      pending: { label: 'Pending', class: 'pending' },
      approved: { label: 'Approved', class: 'approved' },
      denied: { label: 'Denied', class: 'rejected' },
      rejected: { label: 'Rejected', class: 'rejected' }
    };
    const s = statuses[status] || { label: status, class: 'pending' };
    return <span className={`status-badge ${s.class}`}>{s.label}</span>;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="leave-approval animate-fadeIn">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading leave requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="leave-approval animate-fadeIn">
      {/* Header */}
      <div className="admin-header">
        <div>
          <h1>Leave Approval</h1>
          <p>Review and manage employee leave requests</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={handleRefresh}>
            <RefreshCw size={16} />
            Refresh
          </button>
          {pendingCount > 0 && (
            <div className="pending-badge">
              <AlertCircle size={18} />
              {pendingCount} Pending Approval{pendingCount > 1 ? 's' : ''}
            </div>
          )}
        </div>
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
            <h3>{pendingCount}</h3>
          </div>
        </div>
        <div 
          className={`stat-card ${statusFilter === 'approved' ? 'active' : ''}`}
          onClick={() => setStatusFilter('approved')}
        >
          <Check size={24} />
          <div>
            <span>Approved</span>
            <h3>{approvedCount}</h3>
          </div>
        </div>
        <div 
          className={`stat-card ${statusFilter === 'denied' ? 'active' : ''}`}
          onClick={() => setStatusFilter('denied')}
        >
          <X size={24} />
          <div>
            <span>Denied</span>
            <h3>{deniedCount}</h3>
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
          <option value="vacation">Vacation</option>
          <option value="sick">Sick Leave</option>
          <option value="personal">Personal</option>
          <option value="unpaid">Unpaid</option>
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
              <th>Applied On</th>
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
                      {(req.employeeName || 'U').split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <span className="emp-name">{req.employeeName || 'Unknown'}</span>
                      <span className="emp-dept">{req.department || 'N/A'}</span>
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
                    {req.reason ? (req.reason.length > 30 ? req.reason.substring(0, 30) + '...' : req.reason) : 'No reason provided'}
                  </span>
                </td>
                <td>
                  <span className="applied-date">{formatDate(req.appliedOn)}</span>
                </td>
                <td>{getStatusBadge(req.status)}</td>
                <td>
                  {req.status === 'pending' ? (
                    <div className="action-buttons">
                      <button 
                        className="btn btn-success btn-sm"
                        onClick={() => openApproveModal(req)}
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
                      {req.status === 'approved' ? '✓ Processed' : '✗ Processed'}
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
            <span>Try changing the filters or wait for new requests</span>
          </div>
        )}
      </div>

      {/* System Behavior Note */}
      <div className="system-note">
        <AlertCircle size={18} />
        <div>
          <strong>System Behavior:</strong>
          <ul>
            <li>Approved/Denied leaves will notify the employee in their dashboard</li>
            <li>Status changes are reflected immediately across the system</li>
            <li>Comments will be included in the employee notification</li>
          </ul>
        </div>
      </div>

      {/* Approve Modal */}
      {showApproveModal && selectedRequest && (
        <div className="modal-overlay" onClick={() => setShowApproveModal(false)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()}>
            <div className="modal-header success">
              <h2>Approve Leave Request</h2>
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
                <div className="summary-row">
                  <MessageSquare size={18} />
                  <span>{selectedRequest.reason || 'No reason provided'}</span>
                </div>
              </div>
              
              <div className="form-group">
                <label>Comment (optional)</label>
                <textarea
                  className="input textarea"
                  rows={3}
                  placeholder="Add a comment for the employee (optional)..."
                  value={approveComment}
                  onChange={(e) => setApproveComment(e.target.value)}
                />
                <span className="field-note">This comment will be sent to the employee</span>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowApproveModal(false)} disabled={isProcessing}>
                Cancel
              </button>
              <button className="btn btn-success" onClick={handleApprove} disabled={isProcessing}>
                {isProcessing ? 'Processing...' : (
                  <>
                    <Check size={16} />
                    Confirm Approval
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()}>
            <div className="modal-header danger">
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
                <div className="summary-row">
                  <MessageSquare size={18} />
                  <span>{selectedRequest.reason || 'No reason provided'}</span>
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
              <button className="btn btn-secondary" onClick={() => setShowRejectModal(false)} disabled={isProcessing}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleReject} disabled={isProcessing}>
                {isProcessing ? 'Processing...' : (
                  <>
                    <X size={16} />
                    Confirm Rejection
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
