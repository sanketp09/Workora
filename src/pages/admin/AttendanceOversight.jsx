import { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Calendar,
  Upload,
  FileText,
  Filter,
  Search,
  MessageSquare,
  TrendingUp
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import './AttendanceOversight.css';

export default function AttendanceOversight() {
  const { employees, getEmployeeAttendance } = useData();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('summary');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(true);
  
  // Query feature states
  const [showQuerySection, setShowQuerySection] = useState(false);
  const [queryEmployeeName, setQueryEmployeeName] = useState('');
  const [queryStartDate, setQueryStartDate] = useState('');
  const [queryEndDate, setQueryEndDate] = useState('');
  const [queryResult, setQueryResult] = useState(null);
  const [queryLoading, setQueryLoading] = useState(false);
  
  const itemsPerPage = 6;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Generate attendance data for each employee
  const generateEmployeeAttendance = (empId) => {
    const days = [];
    for (let d = 1; d <= Math.min(daysInMonth, 10); d++) {
      const date = new Date(year, month, d);
      const dayOfWeek = date.getDay();
      
      let status = 'NA';
      let checkIn = '-';
      let checkOut = '-';
      
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        status = 'WO';
      } else if (date <= new Date()) {
        const rand = Math.random();
        if (rand > 0.15) {
          status = 'P';
          checkIn = `09:${String(Math.floor(Math.random() * 30)).padStart(2, '0')} AM`;
          checkOut = `06:${String(Math.floor(Math.random() * 30)).padStart(2, '0')} PM`;
        } else if (rand > 0.05) {
          status = 'A';
        } else {
          status = 'L';
          checkIn = `10:${String(Math.floor(Math.random() * 30)).padStart(2, '0')} AM`;
          checkOut = `06:${String(Math.floor(Math.random() * 30)).padStart(2, '0')} PM`;
        }
      }

      days.push({
        day: d,
        dayName: dayNames[dayOfWeek],
        status,
        checkIn,
        checkOut
      });
    }
    return days;
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.department?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusClass = (status) => {
    const classes = {
      'P': 'status-present',
      'A': 'status-absent',
      'L': 'status-late',
      'H': 'status-holiday',
      'WO': 'status-weekoff',
      'LWP': 'status-lwp',
      'NA': 'status-na',
      'HD': 'status-halfday',
      'OD': 'status-onduty',
      'CL': 'status-casual',
      'SL': 'status-sick'
    };
    return classes[status] || 'status-na';
  };

  const getEmpStatus = (emp) => {
    if (emp.status === 'Active' || !emp.status) return 'Active';
    return 'Ex-Employee';
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAvatarColor = (name) => {
    const colors = [
      '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'
    ];
    const index = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  const handleQuerySubmit = async () => {
    if (!queryEmployeeName.trim() || !queryStartDate || !queryEndDate) {
      alert('Please fill in all fields');
      return;
    }

    setQueryLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Find employee by name (case insensitive)
    const employee = employees.find(emp => 
      emp.name?.toLowerCase().includes(queryEmployeeName.toLowerCase())
    );
    
    if (!employee) {
      setQueryResult({
        error: true,
        message: `No employee found matching "${queryEmployeeName}"`
      });
      setQueryLoading(false);
      return;
    }

    // Parse dates
    const start = new Date(queryStartDate);
    const end = new Date(queryEndDate);
    
    if (end < start) {
      setQueryResult({
        error: true,
        message: 'End date must be after start date'
      });
      setQueryLoading(false);
      return;
    }

    // Generate attendance data for date range
    let totalDays = 0;
    let workingDays = 0;
    let presentDays = 0;
    let absentDays = 0;
    let leaveDays = 0;
    let lateDays = 0;
    let halfDays = 0;
    let totalHours = 0;

    const currentDate = new Date(start);
    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay();
      totalDays++;
      
      // Skip weekends
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
        
        // Simulate attendance pattern
        const rand = Math.random();
        if (rand > 0.85) {
          absentDays++;
        } else if (rand > 0.75) {
          leaveDays++;
        } else if (rand > 0.70) {
          lateDays++;
          presentDays++;
          totalHours += 8;
        } else if (rand > 0.65) {
          halfDays++;
          presentDays++;
          totalHours += 4;
        } else {
          presentDays++;
          totalHours += 9;
        }
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    setQueryResult({
      error: false,
      employeeName: employee.name,
      employeeId: employee.employeeId,
      department: employee.department,
      startDate: queryStartDate,
      endDate: queryEndDate,
      totalDays,
      workingDays,
      presentDays,
      absentDays,
      leaveDays,
      lateDays,
      halfDays,
      totalHours,
      attendancePercentage: workingDays > 0 ? ((presentDays / workingDays) * 100).toFixed(1) : 0
    });
    
    setQueryLoading(false);
  };

  return (
    <div className="attendance-oversight animate-fadeIn">
      <div className="attendance-header">
        <div className="header-left">
          <div className="header-icon">
            <Calendar size={24} />
          </div>
          <div className="header-info">
            <h1>Monthly Attendance Report</h1>
            <p>Comprehensive monthly attendance tracking and analysis</p>
          </div>
        </div>
        <div className="header-right">
          <div className="month-selector">
            <button className="nav-btn" onClick={prevMonth}>
              <ChevronLeft size={18} />
            </button>
            <div className="month-display">
              <Calendar size={16} />
              <span>{monthName}</span>
            </div>
            <button className="nav-btn" onClick={nextMonth}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="action-bar">
        <div className="view-toggle">
          <button 
            className={`toggle-btn ${viewMode === 'summary' ? 'active' : ''}`}
            onClick={() => setViewMode('summary')}
          >
            Summary
          </button>
          <button 
            className={`toggle-btn ${viewMode === 'detail' ? 'active' : ''}`}
            onClick={() => setViewMode('detail')}
          >
            Detail
          </button>
        </div>
        <div className="action-buttons">
          <button className="action-btn">
            <Filter size={16} />
            <span>Filter</span>
          </button>
          <button className="action-btn primary">
            <Download size={16} />
            <span>Attendance Export</span>
          </button>
          <button className="action-btn">
            <Upload size={16} />
            <span>Import</span>
          </button>
          <button className="action-btn">
            <FileText size={16} />
            <span>Template</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-container">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          placeholder="Search by employee name or department..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="search-input"
        />
      </div>

      {/* Query Section */}
      <div className="query-section">
        <div className="query-header">
          <button 
            className="query-toggle-btn"
            onClick={() => setShowQuerySection(!showQuerySection)}
          >
            <MessageSquare size={18} />
            <span>Employee Attendance Query</span>
            <ChevronRight 
              size={18} 
              style={{ 
                transform: showQuerySection ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease'
              }} 
            />
          </button>
        </div>
        
        {showQuerySection && (
          <div className="query-content animate-fadeIn">
            <div className="query-description">
              <TrendingUp size={16} />
              <p>Search for any employee's working days, leaves, and attendance details for a specific time period</p>
            </div>
            
            <div className="query-form">
              <div className="query-input-group">
                <label>Employee Full Name</label>
                <input
                  type="text"
                  placeholder="Enter employee full name..."
                  value={queryEmployeeName}
                  onChange={(e) => setQueryEmployeeName(e.target.value)}
                  className="query-input"
                />
              </div>
              
              <div className="query-date-group">
                <div className="query-input-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={queryStartDate}
                    onChange={(e) => setQueryStartDate(e.target.value)}
                    className="query-input"
                  />
                </div>
                
                <div className="query-input-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={queryEndDate}
                    onChange={(e) => setQueryEndDate(e.target.value)}
                    className="query-input"
                  />
                </div>
              </div>
              
              <button 
                className="query-submit-btn"
                onClick={handleQuerySubmit}
                disabled={queryLoading}
              >
                {queryLoading ? (
                  <>
                    <div className="spinner-small"></div>
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search size={18} />
                    <span>Search Attendance</span>
                  </>
                )}
              </button>
            </div>
            
            {queryResult && (
              <div className={`query-result animate-fadeIn ${queryResult.error ? 'error' : ''}`}>
                {queryResult.error ? (
                  <div className="query-error">
                    <span className="error-icon">⚠️</span>
                    <p>{queryResult.message}</p>
                  </div>
                ) : (
                  <div className="query-success">
                    <div className="result-header">
                      <div className="result-employee">
                        <div 
                          className="employee-avatar-small"
                          style={{ background: getAvatarColor(queryResult.employeeName) }}
                        >
                          {getInitials(queryResult.employeeName)}
                        </div>
                        <div>
                          <h3>{queryResult.employeeName}</h3>
                          <p>{queryResult.employeeId} • {queryResult.department}</p>
                        </div>
                      </div>
                      <div className="result-period">
                        <Calendar size={16} />
                        <span>{new Date(queryResult.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - {new Date(queryResult.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>
                    
                    <div className="result-stats">
                      <div className="stat-card">
                        <div className="stat-label">Total Days</div>
                        <div className="stat-value">{queryResult.totalDays}</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-label">Working Days</div>
                        <div className="stat-value">{queryResult.workingDays}</div>
                      </div>
                      <div className="stat-card present">
                        <div className="stat-label">Present</div>
                        <div className="stat-value">{queryResult.presentDays}</div>
                      </div>
                      <div className="stat-card absent">
                        <div className="stat-label">Absent</div>
                        <div className="stat-value">{queryResult.absentDays}</div>
                      </div>
                      <div className="stat-card leave">
                        <div className="stat-label">On Leave</div>
                        <div className="stat-value">{queryResult.leaveDays}</div>
                      </div>
                      <div className="stat-card late">
                        <div className="stat-label">Late</div>
                        <div className="stat-value">{queryResult.lateDays}</div>
                      </div>
                      <div className="stat-card halfday">
                        <div className="stat-label">Half Day</div>
                        <div className="stat-value">{queryResult.halfDays}</div>
                      </div>
                      <div className="stat-card hours">
                        <div className="stat-label">Total Hours</div>
                        <div className="stat-value">{queryResult.totalHours}h</div>
                      </div>
                    </div>
                    
                    <div className="result-percentage">
                      <div className="percentage-label">
                        <TrendingUp size={18} />
                        <span>Attendance Percentage</span>
                      </div>
                      <div className="percentage-bar-container">
                        <div 
                          className="percentage-bar" 
                          style={{ width: `${queryResult.attendancePercentage}%` }}
                        ></div>
                      </div>
                      <div className="percentage-value">{queryResult.attendancePercentage}%</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Attendance Table */}
      <div className="attendance-table-container">
        <div className="table-wrapper">
          <table className="attendance-table">
            <thead>
              <tr>
                <th className="col-num">#</th>
                <th className="col-employee">Employee</th>
                <th className="col-department">Department</th>
                <th className="col-status">Emp Status</th>
                {Array.from({ length: Math.min(10, daysInMonth) }, (_, i) => {
                  const date = new Date(year, month, i + 1);
                  return (
                    <th key={i} className="col-day">
                      <div className="day-header">
                        <span className="day-num">{i + 1}</span>
                        <span className="day-name">{dayNames[date.getDay()]}</span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {paginatedEmployees.map((emp, index) => {
                const empAttendance = generateEmployeeAttendance(emp.id);
                const empIndex = (currentPage - 1) * itemsPerPage + index + 1;
                
                return (
                  <tr key={emp.id}>
                    <td className="col-num">{empIndex}</td>
                    <td className="col-employee">
                      <div className="employee-cell">
                        <div 
                          className="employee-avatar"
                          style={{ background: getAvatarColor(emp.name) }}
                        >
                          {getInitials(emp.name)}
                        </div>
                        <div className="employee-info">
                          <span className="employee-name">{emp.name}</span>
                          <span className="employee-id">{emp.employee_id || `EMP${emp.id}`}</span>
                        </div>
                      </div>
                    </td>
                    <td className="col-department">{emp.department || 'General'}</td>
                    <td className="col-status">
                      <span className={`emp-status-badge ${getEmpStatus(emp) === 'Active' ? 'active' : 'inactive'}`}>
                        {getEmpStatus(emp)}
                      </span>
                    </td>
                    {empAttendance.map((day, dayIndex) => (
                      <td key={dayIndex} className="col-day">
                        <span className={`status-badge ${getStatusClass(day.status)}`}>
                          {day.status}
                        </span>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="pagination-container">
        <div className="pagination-info">
          Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredEmployees.length)} of {filteredEmployees.length} employees
        </div>
        <div className="pagination-controls">
          <button 
            className="page-btn"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            return (
              <button
                key={pageNum}
                className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            );
          })}
          {totalPages > 5 && currentPage < totalPages - 2 && (
            <>
              <span className="page-ellipsis">...</span>
              <button 
                className="page-btn"
                onClick={() => setCurrentPage(totalPages)}
              >
                {totalPages}
              </button>
            </>
          )}
          <button 
            className="page-btn"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Attendance Legend */}
      <div className="attendance-legend">
        <h3>Attendance Status Legend</h3>
        <div className="legend-grid">
          <div className="legend-item">
            <span className="status-badge status-present">P</span>
            <span>Present</span>
          </div>
          <div className="legend-item">
            <span className="status-badge status-absent">A</span>
            <span>Absent</span>
          </div>
          <div className="legend-item">
            <span className="status-badge status-late">L</span>
            <span>Late</span>
          </div>
          <div className="legend-item">
            <span className="status-badge status-holiday">H</span>
            <span>Holiday</span>
          </div>
          <div className="legend-item">
            <span className="status-badge status-weekoff">WO</span>
            <span>Week Off</span>
          </div>
          <div className="legend-item">
            <span className="status-badge status-lwp">LWP</span>
            <span>LWP</span>
          </div>
          <div className="legend-item">
            <span className="status-badge status-na">NA</span>
            <span>Not Applicable</span>
          </div>
          <div className="legend-item">
            <span className="status-badge status-halfday">HD</span>
            <span>Half Day</span>
          </div>
          <div className="legend-item">
            <span className="status-badge status-onduty">OD</span>
            <span>On Duty</span>
          </div>
          <div className="legend-item">
            <span className="status-badge status-casual">CL</span>
            <span>Casual Leave</span>
          </div>
          <div className="legend-item">
            <span className="status-badge status-sick">SL</span>
            <span>Sick Leave</span>
          </div>
        </div>
      </div>
    </div>
  );
}
