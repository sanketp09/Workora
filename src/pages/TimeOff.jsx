import { useState } from 'react';
import { 
  Plane, 
  Plus, 
  Calendar, 
  Clock, 
  FileText,
  X,
  Check,
  XCircle,
  AlertCircle,
  Upload,
  ChevronDown,
  Filter
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import './TimeOff.css';

export default function TimeOff() {
  const { user } = useAuth();
  const { leaves, getEmployeeLeaveBalance, applyLeave, updateLeaveStatus } = useData();
  const toast = useToast();
  
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  const leaveBalance = getEmployeeLeaveBalance(user?.id);
  const userLeaves = user?.role === 'hr' ? leaves : leaves.filter(l => l.employeeId === user?.id);
  const pendingApprovals = leaves.filter(l => l.status === 'pending');

  const filteredLeaves = userLeaves
    .filter(l => statusFilter === 'all' || l.status === statusFilter)
    .filter(l => typeFilter === 'all' || l.type === typeFilter)
    .sort((a, b) => new Date(b.appliedOn) - new Date(a.appliedOn));

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return { class: 'badge-success', label: 'Approved' };
      case 'rejected': return { class: 'badge-error', label: 'Rejected' };
      case 'pending': return { class: 'badge-warning', label: 'Pending' };
      default: return { class: 'badge-gray', label: status };
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'paid': return { icon: '✈️', label: 'Paid Leave', color: 'var(--primary)' };
      case 'sick': return { icon: '🏥', label: 'Sick Leave', color: 'var(--error)' };
      case 'unpaid': return { icon: '📅', label: 'Unpaid Leave', color: 'var(--gray-500)' };
      default: return { icon: '📋', label: type, color: 'var(--gray-500)' };
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleApprove = (leaveId) => {
    updateLeaveStatus(leaveId, 'approved');
    toast.success('Leave request approved');
  };

  const handleReject = (leaveId) => {
    updateLeaveStatus(leaveId, 'rejected');
    toast.error('Leave request rejected');
  };

  return (
    <div className="timeoff-page animate-fadeIn">
      {/* Header */}
      <div className="page-header">
        <div className="page-title">
          <h1>Time Off</h1>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} />
          Apply for Leave
        </button>
      </div>

      {/* Leave Balance Cards */}
      <div className="balance-cards">
        <div className="balance-card">
          <div className="balance-icon" style={{ background: 'var(--info-light)', color: 'var(--primary)' }}>
            <Plane size={24} />
          </div>
          <div className="balance-content">
            <h3>Paid Time Off</h3>
            <p className="balance-value">{leaveBalance.paid - leaveBalance.paidUsed} days remaining</p>
            <div className="progress-bar">
              <div 
                className="progress-bar-fill"
                style={{ 
                  width: `${(leaveBalance.paidUsed / leaveBalance.paid) * 100}%`,
                  background: 'var(--primary)'
                }}
              />
            </div>
            <p className="balance-meta">Used {leaveBalance.paidUsed} of {leaveBalance.paid} days</p>
          </div>
        </div>

        <div className="balance-card">
          <div className="balance-icon" style={{ background: 'var(--error-light)', color: 'var(--error)' }}>
            <AlertCircle size={24} />
          </div>
          <div className="balance-content">
            <h3>Sick Leave</h3>
            <p className="balance-value">{leaveBalance.sick - leaveBalance.sickUsed} days remaining</p>
            <div className="progress-bar">
              <div 
                className="progress-bar-fill"
                style={{ 
                  width: `${(leaveBalance.sickUsed / leaveBalance.sick) * 100}%`,
                  background: 'var(--error)'
                }}
              />
            </div>
            <p className="balance-meta">Requires medical certificate</p>
          </div>
        </div>
      </div>

      {/* HR Admin: Pending Approvals */}
      {user?.role === 'hr' && pendingApprovals.length > 0 && (
        <div className="pending-section card animate-slideUp">
          <div className="section-header">
            <h2>
              <AlertCircle size={20} style={{ color: 'var(--warning)' }} />
              Pending Approvals
            </h2>
            <span className="badge badge-warning">{pendingApprovals.length} pending</span>
          </div>
          <div className="pending-list">
            {pendingApprovals.map(leave => {
              const type = getTypeBadge(leave.type);
              return (
                <div key={leave.id} className="pending-item">
                  <div className="pending-employee">
                    <div className="avatar">{leave.employeeName.split(' ').map(n => n[0]).join('')}</div>
                    <div>
                      <p className="employee-name">{leave.employeeName}</p>
                      <p className="leave-type">{type.icon} {type.label}</p>
                    </div>
                  </div>
                  <div className="pending-dates">
                    <p>{formatDate(leave.startDate)} - {formatDate(leave.endDate)}</p>
                    <p className="duration">{leave.duration} day{leave.duration > 1 ? 's' : ''}</p>
                  </div>
                  <div className="pending-actions">
                    <button 
                      className="btn btn-success btn-sm"
                      onClick={() => handleApprove(leave.id)}
                    >
                      <Check size={16} />
                      Approve
                    </button>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => handleReject(leave.id)}
                    >
                      <XCircle size={16} />
                      Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Leave History */}
      <div className="history-section">
        <div className="section-header">
          <h2>Leave History</h2>
          <div className="filter-group">
            <select 
              className="select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <select 
              className="select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="paid">Paid Leave</option>
              <option value="sick">Sick Leave</option>
              <option value="unpaid">Unpaid Leave</option>
            </select>
          </div>
        </div>

        <div className="history-table card">
          <table className="table">
            <thead>
              <tr>
                <th>Leave Type</th>
                {user?.role === 'hr' && <th>Employee</th>}
                <th>Start Date</th>
                <th>End Date</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Applied On</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeaves.map(leave => {
                const type = getTypeBadge(leave.type);
                const status = getStatusBadge(leave.status);
                return (
                  <tr key={leave.id}>
                    <td>
                      <div className="leave-type-cell">
                        <span className="type-icon">{type.icon}</span>
                        <span>{type.label}</span>
                      </div>
                    </td>
                    {user?.role === 'hr' && <td>{leave.employeeName}</td>}
                    <td>{formatDate(leave.startDate)}</td>
                    <td>{formatDate(leave.endDate)}</td>
                    <td>{leave.duration} day{leave.duration > 1 ? 's' : ''}</td>
                    <td>
                      <span className={`badge ${status.class}`}>{status.label}</span>
                    </td>
                    <td>{formatDate(leave.appliedOn)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredLeaves.length === 0 && (
            <div className="empty-state">
              <Plane size={48} />
              <h3>No leave requests yet</h3>
              <p>Apply for your first leave to see it here</p>
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                Apply for Leave
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Apply Leave Modal */}
      {showModal && (
        <LeaveModal 
          onClose={() => setShowModal(false)}
          onSubmit={(data) => {
            applyLeave({
              ...data,
              employeeId: user.id,
              employeeName: user.name,
            });
            toast.success('Leave request submitted successfully!');
            setShowModal(false);
          }}
          leaveBalance={leaveBalance}
          user={user}
        />
      )}
    </div>
  );
}

function LeaveModal({ onClose, onSubmit, leaveBalance, user }) {
  const [formData, setFormData] = useState({
    type: 'paid',
    startDate: '',
    endDate: '',
    reason: '',
    attachment: null,
  });
  const [errors, setErrors] = useState({});

  const calculateDuration = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    let count = 0;
    const current = new Date(start);
    while (current <= end) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) count++;
      current.setDate(current.getDate() + 1);
    }
    return count;
  };

  const duration = calculateDuration();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (start < today) newErrors.startDate = 'Cannot select past dates';
      if (end < start) newErrors.endDate = 'End date must be after start date';
      
      // Check leave balance
      const available = formData.type === 'paid' 
        ? leaveBalance.paid - leaveBalance.paidUsed
        : formData.type === 'sick' 
        ? leaveBalance.sick - leaveBalance.sickUsed
        : 999;
      
      if (duration > available && formData.type !== 'unpaid') {
        newErrors.endDate = `Insufficient leave balance (${available} days available)`;
      }
    }
    
    if (formData.type === 'sick' && !formData.attachment) {
      newErrors.attachment = 'Medical certificate required for sick leave';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    onSubmit({
      type: formData.type,
      startDate: formData.startDate,
      endDate: formData.endDate,
      duration,
      reason: formData.reason,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal leave-modal animate-scaleIn" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Request Time Off</h2>
          <button className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="input-group">
              <label>Employee</label>
              <input type="text" className="input" value={user?.name} disabled />
            </div>

            <div className="input-group">
              <label>Leave Type</label>
              <div className="leave-type-options">
                {[
                  { value: 'paid', icon: '✈️', label: 'Paid Time Off' },
                  { value: 'sick', icon: '🏥', label: 'Sick Leave' },
                  { value: 'unpaid', icon: '📅', label: 'Unpaid Leave' },
                ].map(option => (
                  <label 
                    key={option.value}
                    className={`type-option ${formData.type === option.value ? 'active' : ''}`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value={option.value}
                      checked={formData.type === option.value}
                      onChange={handleChange}
                    />
                    <span className="type-icon">{option.icon}</span>
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="date-row">
              <div className="input-group">
                <label>Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  className={`input ${errors.startDate ? 'error' : ''}`}
                  value={formData.startDate}
                  onChange={handleChange}
                />
                {errors.startDate && <span className="input-error">{errors.startDate}</span>}
              </div>

              <div className="input-group">
                <label>End Date</label>
                <input
                  type="date"
                  name="endDate"
                  className={`input ${errors.endDate ? 'error' : ''}`}
                  value={formData.endDate}
                  onChange={handleChange}
                />
                {errors.endDate && <span className="input-error">{errors.endDate}</span>}
              </div>
            </div>

            {duration > 0 && (
              <div className="duration-display">
                <Calendar size={18} />
                <span>{duration} working day{duration > 1 ? 's' : ''}</span>
              </div>
            )}

            <div className="input-group">
              <label>Reason (optional)</label>
              <textarea
                name="reason"
                className="input"
                rows={3}
                placeholder="Enter reason for leave..."
                value={formData.reason}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label>Attachment {formData.type === 'sick' && <span className="required">*</span>}</label>
              <div className={`file-upload ${errors.attachment ? 'error' : ''}`}>
                <Upload size={20} />
                <span>Click to upload or drag and drop</span>
                <p>Max 5MB • PDF, JPG, PNG</p>
                <input 
                  type="file" 
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setFormData(prev => ({ ...prev, attachment: e.target.files[0] }))}
                />
              </div>
              {formData.attachment && (
                <span className="file-name">{formData.attachment.name}</span>
              )}
              {errors.attachment && <span className="input-error">{errors.attachment}</span>}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
