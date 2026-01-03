import { useState, useMemo } from 'react';
import { Calendar, Plus, Clock, CheckCircle, XCircle, AlertCircle, Upload, X, FileText, CalendarDays } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import './TimeOff.css';

export default function TimeOff() {
  const { user } = useAuth();
  const { leaveRequests, addLeaveRequest } = useData();
  const toast = useToast();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [attachment, setAttachment] = useState(null);
  
  const [formData, setFormData] = useState({
    leaveType: 'casual',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const userLeaves = useMemo(() => {
    return leaveRequests.filter(req => req.employeeId === user?.id);
  }, [leaveRequests, user?.id]);

  // Calculate leave balance
  const calculateLeaveBalance = () => {
    const casual = { total: 3, used: 0 };
    const sick = { total: 7, used: 0 };
    const earned = { total: 15, used: 0 };

    userLeaves.forEach(leave => {
      if (leave.status === 'approved') {
        if (leave.type === 'Casual Leave') casual.used += leave.days;
        else if (leave.type === 'Sick Leave') sick.used += leave.days;
        else if (leave.type === 'Earned Leave') earned.used += leave.days;
      }
    });

    return { casual, sick, earned };
  };

  const leaveBalance = calculateLeaveBalance();

  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const days = calculateDays(formData.startDate, formData.endDate);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should not exceed 5MB');
        return;
      }
      setAttachment(file);
    }
  };

  const handleSubmit = () => {
    console.log('Submit clicked, user:', user);
    
    if (!user) {
      toast.error('User session not found. Please log in again.');
      return;
    }
    
    if (!formData.startDate || !formData.endDate) {
      toast.error('Please select start and end dates');
      return;
    }
    if (!formData.reason.trim()) {
      toast.error('Please provide a reason for leave');
      return;
    }
    if (days <= 0) {
      toast.error('End date must be after start date');
      return;
    }

    console.log('Creating leave request...');

    const leaveTypeMap = {
      casual: 'Casual Leave',
      sick: 'Sick Leave',
      earned: 'Earned Leave',
      unpaid: 'Unpaid Leave'
    };

    const newRequest = {
      id: `LR-${Date.now()}`,
      employeeId: user.id,
      employeeName: user.name,
      department: user.department || 'Engineering',
      type: leaveTypeMap[formData.leaveType],
      startDate: formData.startDate,
      endDate: formData.endDate,
      days,
      reason: formData.reason,
      status: 'pending',
      appliedOn: new Date().toISOString().split('T')[0],
      attachment: attachment ? attachment.name : null
    };

    console.log('New request:', newRequest);
    addLeaveRequest(newRequest);
    toast.success('Leave request submitted successfully!');
    
    setShowRequestModal(false);
    setFormData({ leaveType: 'casual', startDate: '', endDate: '', reason: '' });
    setAttachment(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[parseInt(month) - 1]} ${parseInt(day)}, ${year}`;
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'approved': return <CheckCircle size={14} />;
      case 'rejected': return <XCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      default: return 'status-pending';
    }
  };

  const getLeaveTypeClass = (type) => {
    if (type.includes('Casual')) return 'type-casual';
    if (type.includes('Sick')) return 'type-sick';
    if (type.includes('Earned')) return 'type-earned';
    return 'type-unpaid';
  };

  return (
    <div className="time-off animate-fadeIn">
      <div className="page-header">
        <div>
          <h1>Time Off</h1>
          <p>Manage your leave requests and balance</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowRequestModal(true)}>
          <Plus size={18} />
          Request Time Off
        </button>
      </div>

      {/* Leave Balance Cards */}
      <div className="leave-balance-section">
        <div className="balance-cards-grid">
          <div className="balance-card casual-card">
            <div className="balance-icon-wrapper casual-bg">
              <Calendar size={24} />
            </div>
            <div className="balance-content">
              <h3>Casual Leave</h3>
              <div className="balance-numbers">
                <span className="available-days">{leaveBalance.casual.total - leaveBalance.casual.used}</span>
                <span className="days-label">Days Available</span>
              </div>
              <div className="balance-progress-bar">
                <div 
                  className="progress-fill casual-fill"
                  style={{ width: `${((leaveBalance.casual.total - leaveBalance.casual.used) / leaveBalance.casual.total) * 100}%` }}
                />
              </div>
              <div className="balance-footer">
                <span>{leaveBalance.casual.used} used</span>
                <span>{leaveBalance.casual.total} total</span>
              </div>
            </div>
          </div>

          <div className="balance-card sick-card">
            <div className="balance-icon-wrapper sick-bg">
              <AlertCircle size={24} />
            </div>
            <div className="balance-content">
              <h3>Sick Leave</h3>
              <div className="balance-numbers">
                <span className="available-days">{leaveBalance.sick.total - leaveBalance.sick.used}</span>
                <span className="days-label">Days Available</span>
              </div>
              <div className="balance-progress-bar">
                <div 
                  className="progress-fill sick-fill"
                  style={{ width: `${((leaveBalance.sick.total - leaveBalance.sick.used) / leaveBalance.sick.total) * 100}%` }}
                />
              </div>
              <div className="balance-footer">
                <span>{leaveBalance.sick.used} used</span>
                <span>{leaveBalance.sick.total} total</span>
              </div>
            </div>
          </div>

          <div className="balance-card earned-card">
            <div className="balance-icon-wrapper earned-bg">
              <CalendarDays size={24} />
            </div>
            <div className="balance-content">
              <h3>Earned Leave</h3>
              <div className="balance-numbers">
                <span className="available-days">{leaveBalance.earned.total - leaveBalance.earned.used}</span>
                <span className="days-label">Days Available</span>
              </div>
              <div className="balance-progress-bar">
                <div 
                  className="progress-fill earned-fill"
                  style={{ width: `${((leaveBalance.earned.total - leaveBalance.earned.used) / leaveBalance.earned.total) * 100}%` }}
                />
              </div>
              <div className="balance-footer">
                <span>{leaveBalance.earned.used} used</span>
                <span>{leaveBalance.earned.total} total</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leave Requests */}
      <div className="leave-requests-section card">
        <div className="section-header">
          <h2>My Time Off Requests</h2>
          <div className="legend">
            <span className="legend-item">
              <span className="legend-dot pending"></span>
              Pending
            </span>
            <span className="legend-item">
              <span className="legend-dot approved"></span>
              Approved
            </span>
            <span className="legend-item">
              <span className="legend-dot rejected"></span>
              Rejected
            </span>
          </div>
        </div>

        {userLeaves.length === 0 ? (
          <div className="empty-state">
            <Calendar size={48} />
            <h3>No time off requests yet</h3>
            <p>Click "Request Time Off" to submit your first leave request</p>
          </div>
        ) : (
          <div className="requests-table-wrapper">
            <table className="requests-table">
              <thead>
                <tr>
                  <th>Applied On</th>
                  <th>Leave Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Duration</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {userLeaves.map(leave => (
                  <tr key={leave.id} className="request-row">
                    <td className="date-cell">{formatDate(leave.appliedOn)}</td>
                    <td>
                      <span className={`type-badge ${getLeaveTypeClass(leave.type)}`}>
                        {leave.type}
                      </span>
                    </td>
                    <td className="date-cell">{formatDate(leave.startDate)}</td>
                    <td className="date-cell">{formatDate(leave.endDate)}</td>
                    <td className="days-cell">
                      <span className="days-badge">{leave.days} {leave.days === 1 ? 'day' : 'days'}</span>
                    </td>
                    <td className="reason-cell">{leave.reason}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(leave.status)}`}>
                        {getStatusIcon(leave.status)}
                        {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <div className="modal-overlay" onClick={() => setShowRequestModal(false)}>
          <div className="modal request-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Time Off Request</h2>
              <button className="close-btn" onClick={() => setShowRequestModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-section">
                <label className="form-label">Employee</label>
                <div className="employee-display">
                  <div className="emp-avatar-small">
                    {user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'U'}
                  </div>
                  <span className="employee-name">{user?.name || 'Unknown User'}</span>
                </div>
              </div>

              <div className="form-section">
                <label className="form-label">Time Off Type *</label>
                <select 
                  className="form-select"
                  value={formData.leaveType}
                  onChange={(e) => setFormData({...formData, leaveType: e.target.value})}
                >
                  <option value="casual">Casual Leave ({leaveBalance.casual.total - leaveBalance.casual.used} available)</option>
                  <option value="sick">Sick Leave ({leaveBalance.sick.total - leaveBalance.sick.used} available)</option>
                  <option value="earned">Earned Leave ({leaveBalance.earned.total - leaveBalance.earned.used} available)</option>
                  <option value="unpaid">Unpaid Leave</option>
                </select>
              </div>

              <div className="form-section">
                <label className="form-label">Validity Period *</label>
                <div className="date-range-inputs">
                  <input 
                    type="date" 
                    className="form-input"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  />
                  <span className="date-separator">to</span>
                  <input 
                    type="date" 
                    className="form-input"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    min={formData.startDate}
                  />
                </div>
              </div>

              <div className="form-section">
                <label className="form-label">Duration</label>
                <div className="duration-display">
                  <CalendarDays size={18} />
                  <span className="duration-value">{days > 0 ? `${days} ${days === 1 ? 'Day' : 'Days'}` : 'Select dates'}</span>
                </div>
              </div>

              <div className="form-section">
                <label className="form-label">Reason *</label>
                <textarea 
                  className="form-textarea"
                  rows="3"
                  placeholder="Please provide a reason for your time off request..."
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                />
              </div>

              {formData.leaveType === 'sick' && (
                <div className="form-section">
                  <label className="form-label">
                    Attachment <span className="required-note">(Medical certificate required)</span>
                  </label>
                  <div className="file-upload-area">
                    <input
                      type="file"
                      id="file-upload"
                      className="file-input"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                    />
                    {!attachment ? (
                      <label htmlFor="file-upload" className="file-upload-label">
                        <Upload size={20} />
                        <span>Click to upload or drag and drop</span>
                        <span className="file-hint">PDF, JPG, PNG (max 5MB)</span>
                      </label>
                    ) : (
                      <div className="file-preview">
                        <FileText size={20} />
                        <span>{attachment.name}</span>
                        <button 
                          className="remove-file-btn"
                          onClick={() => setAttachment(null)}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowRequestModal(false)}>
                Discard
              </button>
              <button className="btn btn-primary" onClick={handleSubmit}>
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
