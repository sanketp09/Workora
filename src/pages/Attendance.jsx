import { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Calendar,
  Clock,
  Coffee,
  Timer,
  CheckCircle,
  XCircle,
  Plane,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import './Attendance.css';

export default function Attendance() {
  const { user } = useAuth();
  const { getEmployeeAttendance, employees } = useData();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('table');
  const [selectedEmployee, setSelectedEmployee] = useState(user?.id);

  const attendance = getEmployeeAttendance(selectedEmployee);

  // Get days in month
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  // Get month name
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Navigation
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Calculate stats
  const monthAttendance = attendance.filter(a => {
    const date = new Date(a.date);
    return date.getMonth() === month && date.getFullYear() === year;
  });

  let workingDays = 0;
  const today = new Date();
  const maxDay = today.getMonth() === month && today.getFullYear() === year ? today.getDate() : daysInMonth;
  
  for (let d = 1; d <= maxDay; d++) {
    const date = new Date(year, month, d);
    const dayOfWeek = date.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) workingDays++;
  }

  const daysPresent = monthAttendance.filter(a => a.status === 'present').length;
  const daysAbsent = workingDays - daysPresent;
  const leaveDays = 0; // Would come from leave data

  // Generate calendar days
  const calendarDays = [];
  const totalCells = Math.ceil((daysInMonth + firstDayOfMonth) / 7) * 7;
  
  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - firstDayOfMonth + 1;
    if (dayNum < 1 || dayNum > daysInMonth) {
      calendarDays.push(null);
    } else {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      const dayAttendance = attendance.find(a => a.date === dateStr);
      const date = new Date(year, month, dayNum);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const isToday = date.toDateString() === today.toDateString();
      const isFuture = date > today;
      
      calendarDays.push({
        day: dayNum,
        date: dateStr,
        attendance: dayAttendance,
        isWeekend,
        isToday,
        isFuture,
      });
    }
  }

  const getStatusInfo = (day) => {
    if (!day) return null;
    if (day.isFuture) return { color: 'var(--gray-200)', label: '-' };
    if (day.isWeekend) return { color: 'var(--gray-300)', label: 'Weekend' };
    if (day.attendance?.status === 'present') return { color: 'var(--success)', label: 'Present' };
    return { color: 'var(--error)', label: 'Absent' };
  };

  const formatTime = (time) => {
    if (!time) return '-';
    return time;
  };

  const getTableData = () => {
    const data = [];
    for (let d = 1; d <= maxDay; d++) {
      const date = new Date(year, month, d);
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayAttendance = attendance.find(a => a.date === dateStr);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      
      if (!isWeekend) {
        data.push({
          date: dateStr,
          dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
          dayNum: d,
          checkIn: dayAttendance?.checkIn || '-',
          checkOut: dayAttendance?.checkOut || '-',
          breakDuration: '1h 00m',
          totalHours: dayAttendance?.totalHours ? `${parseFloat(dayAttendance.totalHours).toFixed(1)}h` : '-',
          status: dayAttendance?.status || 'absent',
          isToday: date.toDateString() === today.toDateString(),
        });
      }
    }
    return data.reverse();
  };

  const tableData = getTableData();

  return (
    <div className="attendance-page animate-fadeIn">
      {/* Header */}
      <div className="page-header">
        <div className="page-title">
          <h1>My Attendance</h1>
          <div className="month-nav">
            <button className="nav-btn" onClick={prevMonth}>
              <ChevronLeft size={20} />
            </button>
            <span className="month-label">{monthName}</span>
            <button className="nav-btn" onClick={nextMonth}>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="header-actions">
          {user?.role === 'hr' && (
            <select 
              className="select"
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              style={{ minWidth: 200 }}
            >
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          )}
          
          <div className="view-toggle">
            <button 
              className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
            >
              Table
            </button>
            <button 
              className={`toggle-btn ${viewMode === 'calendar' ? 'active' : ''}`}
              onClick={() => setViewMode('calendar')}
            >
              Calendar
            </button>
          </div>

          <button className="btn btn-secondary">
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="summary-icon" style={{ background: 'var(--gray-100)', color: 'var(--gray-600)' }}>
            <Calendar size={20} />
          </div>
          <div className="summary-content">
            <span className="summary-label">Total Working Days</span>
            <span className="summary-value">{workingDays}</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
            <CheckCircle size={20} />
          </div>
          <div className="summary-content">
            <span className="summary-label">Days Present</span>
            <span className="summary-value">{daysPresent}</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon" style={{ background: 'var(--error-light)', color: 'var(--error)' }}>
            <XCircle size={20} />
          </div>
          <div className="summary-content">
            <span className="summary-label">Days Absent</span>
            <span className="summary-value">{daysAbsent}</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon" style={{ background: 'var(--info-light)', color: 'var(--primary)' }}>
            <Plane size={20} />
          </div>
          <div className="summary-content">
            <span className="summary-label">Leaves Taken</span>
            <span className="summary-value">{leaveDays}</span>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="calendar-container card">
          <div className="calendar-header">
            <div className="calendar-weekdays">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="weekday">{day}</div>
              ))}
            </div>
          </div>
          <div className="calendar-grid">
            {calendarDays.map((day, index) => {
              const status = getStatusInfo(day);
              return (
                <div 
                  key={index} 
                  className={`calendar-day ${!day ? 'empty' : ''} ${day?.isWeekend ? 'weekend' : ''} ${day?.isToday ? 'today' : ''} ${day?.isFuture ? 'future' : ''}`}
                >
                  {day && (
                    <>
                      <span className="day-number">{day.day}</span>
                      {!day.isFuture && !day.isWeekend && (
                        <span 
                          className="day-status"
                          style={{ background: status?.color }}
                        />
                      )}
                      {day.attendance && (
                        <div className="day-info">
                          <span>{day.attendance.checkIn}</span>
                          <span>{day.attendance.checkOut}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          <div className="calendar-legend">
            <div className="legend-item">
              <span className="legend-dot" style={{ background: 'var(--success)' }} />
              <span>Present</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot" style={{ background: 'var(--error)' }} />
              <span>Absent</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot" style={{ background: 'var(--info)' }} />
              <span>Leave</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot" style={{ background: 'var(--gray-300)' }} />
              <span>Weekend</span>
            </div>
          </div>
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="attendance-table card">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>
                    <div className="th-with-icon">
                      <Clock size={14} />
                      Check-In
                    </div>
                  </th>
                  <th>
                    <div className="th-with-icon">
                      <Clock size={14} />
                      Check-Out
                    </div>
                  </th>
                  <th>
                    <div className="th-with-icon">
                      <Coffee size={14} />
                      Break
                    </div>
                  </th>
                  <th>
                    <div className="th-with-icon">
                      <Timer size={14} />
                      Total Hours
                    </div>
                  </th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, index) => (
                  <tr key={index} className={row.isToday ? 'today-row' : ''}>
                    <td>
                      <div className="date-cell">
                        <span className="date-day">{row.dayName}</span>
                        <span className="date-num">{row.dayNum}</span>
                        {row.isToday && <span className="today-badge">Today</span>}
                      </div>
                    </td>
                    <td>
                      <span className={row.checkIn !== '-' ? 'time-value' : 'time-empty'}>
                        {row.checkIn}
                      </span>
                    </td>
                    <td>
                      <span className={row.checkOut !== '-' ? 'time-value' : 'time-empty'}>
                        {row.checkOut}
                      </span>
                    </td>
                    <td>
                      <span className="time-value">{row.breakDuration}</span>
                    </td>
                    <td>
                      <span className={`hours-value ${parseFloat(row.totalHours) < 8 && row.totalHours !== '-' ? 'low-hours' : ''}`}>
                        {row.totalHours}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge status-${row.status}`}>
                        {row.status === 'present' ? 'Present' : row.status === 'leave' ? 'Leave' : 'Absent'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
