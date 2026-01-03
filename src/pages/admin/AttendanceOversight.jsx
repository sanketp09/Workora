import { useState } from 'react';
import { 
  Calendar as CalendarIcon,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import './AttendanceOversight.css';

export default function AttendanceOversight() {
  const { employees, getAllAttendance } = useData();
  const toast = useToast();
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Generate mock attendance data for all employees
  const generateAttendanceData = () => {
    return employees.map(emp => {
      const random = Math.random();
      let status, checkIn, checkOut, workingHours;
      
      if (random > 0.85) {
        status = 'absent';
        checkIn = '-';
        checkOut = '-';
        workingHours = 0;
      } else if (random > 0.75) {
        status = 'leave';
        checkIn = '-';
        checkOut = '-';
        workingHours = 0;
      } else if (random > 0.6) {
        status = 'late';
        checkIn = '10:' + String(Math.floor(Math.random() * 59)).padStart(2, '0') + ' AM';
        checkOut = '06:' + String(Math.floor(Math.random() * 59)).padStart(2, '0') + ' PM';
        workingHours = 7 + Math.random();
      } else if (random > 0.1) {
        status = 'present';
        checkIn = '09:' + String(Math.floor(Math.random() * 30)).padStart(2, '0') + ' AM';
        checkOut = '06:' + String(Math.floor(Math.random() * 30)).padStart(2, '0') + ' PM';
        workingHours = 8 + Math.random();
      } else {
        status = 'missing-checkout';
        checkIn = '09:' + String(Math.floor(Math.random() * 30)).padStart(2, '0') + ' AM';
        checkOut = '-';
        workingHours = 0;
      }
      
      return {
        employeeId: emp.id,
        employeeName: emp.name,
        department: emp.department,
        date: selectedDate,
        status,
        checkIn,
        checkOut,
        workingHours: workingHours.toFixed(1)
      };
    });
  };

  const attendanceData = generateAttendanceData();

  const filteredData = attendanceData.filter(att => {
    const matchesSearch = att.employeeName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || att.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Summary stats
  const presentCount = attendanceData.filter(a => a.status === 'present' || a.status === 'late').length;
  const absentCount = attendanceData.filter(a => a.status === 'absent').length;
  const leaveCount = attendanceData.filter(a => a.status === 'leave').length;
  const missingCheckout = attendanceData.filter(a => a.status === 'missing-checkout').length;

  const getStatusBadge = (status) => {
    const badges = {
      'present': { icon: CheckCircle, label: 'Present', class: 'present' },
      'late': { icon: Clock, label: 'Late', class: 'late' },
      'absent': { icon: XCircle, label: 'Absent', class: 'absent' },
      'leave': { icon: CalendarIcon, label: 'On Leave', class: 'leave' },
      'missing-checkout': { icon: AlertTriangle, label: 'Missing Check-out', class: 'warning' }
    };
    const badge = badges[status];
    return (
      <span className={`status-badge ${badge.class}`}>
        <badge.icon size={14} />
        {badge.label}
      </span>
    );
  };

  const navigateDate = (direction) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + direction);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const handleFlagCheckout = (emp) => {
    toast.warning(`Flagged missing checkout for ${emp.employeeName}`);
  };

  const handleExport = () => {
    toast.success('Exporting attendance data...');
  };

  return (
    <div className="attendance-oversight animate-fadeIn">
      {/* Header */}
      <div className="admin-header">
        <div>
          <h1>Attendance Oversight</h1>
          <p>Monitor and manage employee attendance records</p>
        </div>
        <button className="btn btn-secondary" onClick={handleExport}>
          <Download size={18} />
          Export Report
        </button>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card present">
          <CheckCircle size={24} />
          <div>
            <span>Present</span>
            <h3>{presentCount}</h3>
          </div>
        </div>
        <div className="summary-card absent">
          <XCircle size={24} />
          <div>
            <span>Absent</span>
            <h3>{absentCount}</h3>
          </div>
        </div>
        <div className="summary-card leave">
          <CalendarIcon size={24} />
          <div>
            <span>On Leave</span>
            <h3>{leaveCount}</h3>
          </div>
        </div>
        <div className="summary-card warning">
          <AlertTriangle size={24} />
          <div>
            <span>Missing Checkout</span>
            <h3>{missingCheckout}</h3>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar card">
        <div className="date-selector">
          <button className="btn btn-ghost btn-icon" onClick={() => navigateDate(-1)}>
            <ChevronLeft size={20} />
          </button>
          <input
            type="date"
            className="input"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <button className="btn btn-ghost btn-icon" onClick={() => navigateDate(1)}>
            <ChevronRight size={20} />
          </button>
        </div>
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="input"
            placeholder="Search employee..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className="select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="present">Present</option>
          <option value="late">Late</option>
          <option value="absent">Absent</option>
          <option value="leave">On Leave</option>
          <option value="missing-checkout">Missing Checkout</option>
        </select>
      </div>

      {/* Attendance Table */}
      <div className="attendance-table card">
        <table className="table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Department</th>
              <th>Check-In</th>
              <th>Check-Out</th>
              <th>Working Hours</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((att, index) => (
              <tr key={index} className={att.status === 'missing-checkout' ? 'highlight-row' : ''}>
                <td>
                  <div className="employee-cell">
                    <div className="emp-avatar">
                      {att.employeeName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span>{att.employeeName}</span>
                  </div>
                </td>
                <td>{att.department}</td>
                <td>{att.checkIn}</td>
                <td>
                  {att.status === 'missing-checkout' ? (
                    <span className="missing-text">
                      <AlertTriangle size={14} />
                      Missing
                    </span>
                  ) : att.checkOut}
                </td>
                <td>
                  {att.workingHours > 0 ? (
                    <span className={parseFloat(att.workingHours) < 8 ? 'text-warning' : ''}>
                      {att.workingHours} hrs
                    </span>
                  ) : '-'}
                </td>
                <td>{getStatusBadge(att.status)}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn btn-ghost btn-sm"
                      onClick={() => {
                        setSelectedEmployee(att);
                        setShowHistoryModal(true);
                      }}
                    >
                      <Eye size={16} />
                    </button>
                    {att.status === 'missing-checkout' && (
                      <button 
                        className="btn btn-warning btn-sm"
                        onClick={() => handleFlagCheckout(att)}
                      >
                        Flag
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Audit Note */}
      <div className="audit-note">
        <AlertTriangle size={18} />
        <span>All attendance modifications are logged for audit compliance. Manual edits require HR approval.</span>
      </div>

      {/* History Modal */}
      {showHistoryModal && selectedEmployee && (
        <div className="modal-overlay" onClick={() => setShowHistoryModal(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Attendance History - {selectedEmployee.employeeName}</h2>
              <button className="close-btn" onClick={() => setShowHistoryModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="history-summary">
                <div className="history-stat">
                  <span>This Month</span>
                  <h4>18 / 22 days</h4>
                </div>
                <div className="history-stat">
                  <span>Avg Check-in</span>
                  <h4>9:12 AM</h4>
                </div>
                <div className="history-stat">
                  <span>Avg Hours</span>
                  <h4>8.3 hrs</h4>
                </div>
                <div className="history-stat">
                  <span>Late Days</span>
                  <h4>2</h4>
                </div>
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Check-In</th>
                    <th>Check-Out</th>
                    <th>Hours</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(10)].map((_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    return (
                      <tr key={i}>
                        <td>{date.toLocaleDateString()}</td>
                        <td>09:{String(Math.floor(Math.random() * 30)).padStart(2, '0')} AM</td>
                        <td>06:{String(Math.floor(Math.random() * 30)).padStart(2, '0')} PM</td>
                        <td>{(8 + Math.random()).toFixed(1)} hrs</td>
                        <td>{getStatusBadge(i === 2 ? 'late' : 'present')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowHistoryModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
