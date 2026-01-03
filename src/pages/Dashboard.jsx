import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Clock,
  CalendarDays,
  TrendingUp,
  TrendingDown,
  Plane,
  Timer,
  CheckCircle2,
  LogIn,
  LogOut,
  FileText,
  User,
  DollarSign,
  BarChart3,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const { todayCheckIn, checkIn, checkOut, getEmployeeAttendance, getEmployeeLeaveBalance, getEmployeeLeaves } = useData();
  const toast = useToast();
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch attendance data
  useEffect(() => {
    const fetchAttendance = async () => {
      if (user?.id) {
        const data = await getEmployeeAttendance(user.id);
        setAttendance(Array.isArray(data) ? data : []);
      }
    };
    fetchAttendance();
  }, [user?.id, getEmployeeAttendance]);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: true 
    });
  };

  const handleCheckIn = async () => {
    setIsCheckingIn(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    checkIn(user.id);
    toast.success('Successfully checked in! Have a great day! 🎉');
    setIsCheckingIn(false);
  };

  const handleCheckOut = async () => {
    setIsCheckingIn(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    checkOut(user.id);
    toast.success('Successfully checked out! See you tomorrow! 👋');
    setIsCheckingIn(false);
  };

  const isCheckedIn = todayCheckIn && !todayCheckIn.checkOutTime;
  const isCheckedOut = todayCheckIn && todayCheckIn.checkOutTime;

  // Calculate stats
  const leaveBalance = getEmployeeLeaveBalance(user?.id);
  const leaves = getEmployeeLeaves(user?.id);
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const today = new Date().getDate();
  
  // Count working days (excluding weekends)
  let workingDays = 0;
  for (let d = 1; d <= today; d++) {
    const date = new Date(currentYear, currentMonth, d);
    const dayOfWeek = date.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) workingDays++;
  }
  
  const daysPresent = attendance.filter(a => {
    const date = new Date(a.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  }).length;
  
  const attendancePercentage = workingDays > 0 ? ((daysPresent / workingDays) * 100).toFixed(1) : 0;
  
  // Calculate total hours this week
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weeklyHours = attendance
    .filter(a => new Date(a.date) >= weekStart)
    .reduce((sum, a) => sum + parseFloat(a.totalHours || 0), 0);

  // Get upcoming leave
  const upcomingLeave = leaves
    .filter(l => l.status === 'approved' && new Date(l.startDate) > new Date())
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))[0];

  // Activity feed
  const activities = [
    { icon: CheckCircle2, text: `Checked in at ${todayCheckIn?.time || '9:03 AM'}`, time: '2 hours ago', color: 'var(--success)' },
    { icon: Plane, text: 'Leave approved: Dec 24-26', time: 'Yesterday', color: 'var(--info)' },
    { icon: FileText, text: 'Salary slip generated for December', time: '3 days ago', color: 'var(--warning)' },
  ];

  return (
    <div className="dashboard animate-fadeIn">
      {/* Hero Section */}
      <section className="dashboard-hero">
        <div className="hero-content">
          <h1>{getGreeting()}, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="hero-date">{formatDate(currentTime)}</p>
          <div className="hero-status">
            {isCheckedIn ? (
              <>
                <span className="status-dot status-online" />
                <span>You're checked in</span>
              </>
            ) : isCheckedOut ? (
              <>
                <span className="status-dot status-offline" />
                <span>You've completed your day</span>
              </>
            ) : (
              <>
                <span className="status-dot status-away" />
                <span>Not checked in yet</span>
              </>
            )}
          </div>
        </div>
        <div className="hero-time">
          <Clock size={20} />
          <span>{formatTime(currentTime)}</span>
        </div>
      </section>

      {/* Check-in/Check-out Card */}
      <section className="checkin-section">
        <div className={`checkin-card ${isCheckedIn ? 'checked-in' : ''} ${isCheckingIn ? 'animate-checkIn' : ''}`}>
          <div className="checkin-icon">
            {isCheckedIn ? <LogOut size={32} /> : <LogIn size={32} />}
          </div>
          <div className="checkin-info">
            <h3>{isCheckedIn ? 'Ready to leave?' : isCheckedOut ? 'See you tomorrow!' : 'Ready to start your day?'}</h3>
            <p className="checkin-time-display">{formatTime(currentTime)}</p>
            {todayCheckIn && (
              <p className="checkin-details">
                {isCheckedIn ? `Checked in at ${todayCheckIn.time}` : 
                 isCheckedOut ? `Worked from ${todayCheckIn.time} to ${todayCheckIn.checkOutTime}` : ''}
              </p>
            )}
          </div>
          {!isCheckedOut && (
            <button 
              className={`btn ${isCheckedIn ? 'btn-danger' : 'btn-success'} btn-lg checkin-btn`}
              onClick={isCheckedIn ? handleCheckOut : handleCheckIn}
              disabled={isCheckingIn}
            >
              {isCheckingIn ? (
                <span className="animate-spin">⏳</span>
              ) : isCheckedIn ? (
                <>
                  <LogOut size={20} />
                  Check Out
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  Check In
                </>
              )}
            </button>
          )}
        </div>
      </section>

      {/* Stats Cards */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--info-light)', color: 'var(--primary)' }}>
            <CalendarDays size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Attendance This Month</p>
            <h2 className="stat-value">{daysPresent}/{workingDays} days</h2>
            <div className="stat-footer">
              <span className={`stat-trend ${parseFloat(attendancePercentage) >= 90 ? 'positive' : 'negative'}`}>
                {parseFloat(attendancePercentage) >= 90 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {attendancePercentage}% attendance
              </span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
            <Plane size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Leave Balance</p>
            <h2 className="stat-value">{leaveBalance.paid - leaveBalance.paidUsed + leaveBalance.sick - leaveBalance.sickUsed} days</h2>
            <div className="stat-breakdown">
              <span>{leaveBalance.paid - leaveBalance.paidUsed} Paid</span>
              <span className="dot">•</span>
              <span>{leaveBalance.sick - leaveBalance.sickUsed} Sick</span>
            </div>
            <div className="progress-bar" style={{ marginTop: 8 }}>
              <div 
                className="progress-bar-fill" 
                style={{ 
                  width: `${((leaveBalance.paidUsed + leaveBalance.sickUsed) / (leaveBalance.paid + leaveBalance.sick)) * 100}%`,
                  background: 'var(--success)'
                }}
              />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}>
            <Timer size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Working Hours (This Week)</p>
            <h2 className="stat-value">{weeklyHours.toFixed(1)} hours</h2>
            <p className="stat-subtitle">Target: 40 hours</p>
            <div className="progress-bar" style={{ marginTop: 8 }}>
              <div 
                className="progress-bar-fill" 
                style={{ 
                  width: `${Math.min((weeklyHours / 40) * 100, 100)}%`,
                  background: 'var(--warning)'
                }}
              />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--error-light)', color: 'var(--error)' }}>
            <CalendarDays size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Upcoming Leave</p>
            {upcomingLeave ? (
              <>
                <h2 className="stat-value" style={{ fontSize: 16 }}>
                  {new Date(upcomingLeave.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(upcomingLeave.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </h2>
                <span className="badge badge-success" style={{ marginTop: 8 }}>Approved</span>
              </>
            ) : (
              <>
                <h2 className="stat-value" style={{ fontSize: 16 }}>No upcoming leave</h2>
                <Link to="/time-off" className="stat-link">
                  Apply for leave <ChevronRight size={14} />
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Quick Links & Activity */}
      <section className="dashboard-grid">
        {/* Quick Links */}
        <div className="quick-links-section">
          <h3 className="section-title">Quick Actions</h3>
          <div className="quick-links-grid">
            <Link to="/time-off" className="quick-link-card card-hover">
              <div className="quick-link-icon" style={{ background: 'var(--info-light)' }}>
                <FileText size={24} style={{ color: 'var(--primary)' }} />
              </div>
              <span>Apply for Leave</span>
            </Link>
            <Link to="/profile" className="quick-link-card card-hover">
              <div className="quick-link-icon" style={{ background: 'var(--success-light)' }}>
                <User size={24} style={{ color: 'var(--success)' }} />
              </div>
              <span>Update Profile</span>
            </Link>
            <Link to="/salary" className="quick-link-card card-hover">
              <div className="quick-link-icon" style={{ background: 'var(--warning-light)' }}>
                <DollarSign size={24} style={{ color: 'var(--warning)' }} />
              </div>
              <span>View Salary</span>
            </Link>
            <Link to="/reports" className="quick-link-card card-hover">
              <div className="quick-link-icon" style={{ background: 'var(--error-light)' }}>
                <BarChart3 size={24} style={{ color: 'var(--error)' }} />
              </div>
              <span>Download Reports</span>
            </Link>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="activity-section">
          <div className="section-header">
            <h3 className="section-title">Recent Activity</h3>
            <Link to="/activity" className="view-all-link">View all</Link>
          </div>
          <div className="activity-feed">
            {activities.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-icon" style={{ color: activity.color }}>
                  <activity.icon size={18} />
                </div>
                <div className="activity-content">
                  <p>{activity.text}</p>
                  <span className="activity-time">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HR Admin Section */}
      {user?.role === 'hr' && (
        <section className="admin-section animate-slideUp">
          <div className="section-header">
            <h3 className="section-title">
              <Sparkles size={20} style={{ color: 'var(--warning)' }} />
              HR Dashboard
            </h3>
          </div>
          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <h4>Total Employees</h4>
              <p className="admin-stat-value">48</p>
              <span className="badge badge-success">+3 this month</span>
            </div>
            <div className="admin-stat-card">
              <h4>Present Today</h4>
              <p className="admin-stat-value">42</p>
              <span className="badge badge-info">87.5%</span>
            </div>
            <div className="admin-stat-card">
              <h4>On Leave</h4>
              <p className="admin-stat-value">4</p>
              <span className="badge badge-warning">2 pending requests</span>
            </div>
            <div className="admin-stat-card">
              <h4>Pending Approvals</h4>
              <p className="admin-stat-value">5</p>
              <Link to="/time-off" className="btn btn-primary btn-sm" style={{ marginTop: 8 }}>
                Review Now
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
