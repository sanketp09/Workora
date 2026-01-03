import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  UserCheck, 
  Plane, 
  Clock, 
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { employees, getAllAttendance, getAllLeaves } = useData();
  const [refreshing, setRefreshing] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const allAttendance = getAllAttendance ? getAllAttendance() : [];
  const allLeaves = getAllLeaves ? getAllLeaves() : [];

  // Calculate KPIs
  const totalEmployees = employees.length;
  const presentToday = allAttendance.filter(a => a.date === today && a.status === 'present').length || Math.floor(totalEmployees * 0.85);
  const onLeaveToday = allLeaves.filter(l => {
    const start = new Date(l.startDate);
    const end = new Date(l.endDate);
    const todayDate = new Date(today);
    return l.status === 'approved' && todayDate >= start && todayDate <= end;
  }).length || 2;
  const pendingLeaves = allLeaves.filter(l => l.status === 'pending').length || 5;
  
  // Calculate payroll impact
  const avgSalary = 75000;
  const payrollImpact = (presentToday * avgSalary * 0.9).toFixed(0);

  const kpiCards = [
    { 
      label: 'Total Employees', 
      value: totalEmployees, 
      icon: Users, 
      color: '#3b82f6',
      trend: '+3 this month',
      trendUp: true,
      path: '/admin/employees'
    },
    { 
      label: 'Present Today', 
      value: presentToday, 
      icon: UserCheck, 
      color: '#10b981',
      trend: `${((presentToday/totalEmployees)*100).toFixed(0)}% attendance`,
      trendUp: true,
      path: '/admin/attendance'
    },
    { 
      label: 'On Leave Today', 
      value: onLeaveToday, 
      icon: Plane, 
      color: '#f59e0b',
      trend: `${pendingLeaves} pending`,
      trendUp: false,
      path: '/admin/leave-approval'
    },
    { 
      label: 'Pending Requests', 
      value: pendingLeaves, 
      icon: Clock, 
      color: '#ef4444',
      trend: 'Requires action',
      trendUp: false,
      path: '/admin/leave-approval'
    },
    { 
      label: 'Payroll Impact', 
      value: `₹${(payrollImpact/100000).toFixed(1)}L`, 
      icon: DollarSign, 
      color: '#8b5cf6',
      trend: 'This month estimate',
      trendUp: true,
      path: '/admin/payroll'
    },
  ];

  // Workforce snapshot data
  const workforceSnapshot = employees.slice(0, 8).map(emp => {
    const empAttendance = allAttendance.find(a => a.employeeId === emp.id && a.date === today);
    const empLeave = allLeaves.find(l => l.employeeId === emp.id && l.status === 'approved');
    const hasAlert = !empAttendance && !empLeave;
    
    return {
      id: emp.id,
      name: emp.name,
      avatar: emp.avatar,
      department: emp.department,
      attendanceStatus: empAttendance ? 'present' : (empLeave ? 'leave' : 'absent'),
      leaveStatus: empLeave ? 'On Leave' : '-',
      payableDays: empAttendance ? 22 : 20,
      hasAlert
    };
  });

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'present': return <CheckCircle size={16} className="status-icon present" />;
      case 'leave': return <Plane size={16} className="status-icon leave" />;
      case 'absent': return <XCircle size={16} className="status-icon absent" />;
      default: return null;
    }
  };

  return (
    <div className="admin-dashboard animate-fadeIn">
      {/* Header */}
      <div className="admin-header">
        <div>
          <h1>Admin Control Center</h1>
          <p>Real-time workforce overview and quick actions</p>
        </div>
        <button className={`btn btn-secondary ${refreshing ? 'spinning' : ''}`} onClick={handleRefresh}>
          <RefreshCw size={18} />
          Refresh Data
        </button>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        {kpiCards.map((kpi, index) => (
          <div 
            key={index} 
            className="kpi-card"
            onClick={() => navigate(kpi.path)}
            style={{ '--accent-color': kpi.color }}
          >
            <div className="kpi-icon">
              <kpi.icon size={24} />
            </div>
            <div className="kpi-content">
              <span className="kpi-label">{kpi.label}</span>
              <h2 className="kpi-value">{kpi.value}</h2>
              <span className={`kpi-trend ${kpi.trendUp ? 'up' : 'down'}`}>
                {kpi.trendUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {kpi.trend}
              </span>
            </div>
            <ChevronRight size={20} className="kpi-arrow" />
          </div>
        ))}
      </div>

      {/* Workforce Snapshot */}
      <div className="snapshot-section">
        <div className="section-header">
          <h3>Workforce Snapshot</h3>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/attendance')}>
            View All <ChevronRight size={16} />
          </button>
        </div>
        <div className="snapshot-table card">
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Attendance</th>
                <th>Leave Status</th>
                <th>Payable Days</th>
                <th>Alert</th>
              </tr>
            </thead>
            <tbody>
              {workforceSnapshot.map(emp => (
                <tr key={emp.id}>
                  <td>
                    <div className="employee-cell">
                      <div className="emp-avatar">{emp.name.split(' ').map(n => n[0]).join('')}</div>
                      <span>{emp.name}</span>
                    </div>
                  </td>
                  <td>{emp.department}</td>
                  <td>
                    <span className={`status-badge ${emp.attendanceStatus}`}>
                      {getStatusIcon(emp.attendanceStatus)}
                      {emp.attendanceStatus.charAt(0).toUpperCase() + emp.attendanceStatus.slice(1)}
                    </span>
                  </td>
                  <td>{emp.leaveStatus}</td>
                  <td><strong>{emp.payableDays}</strong> / 22</td>
                  <td>
                    {emp.hasAlert && (
                      <span className="alert-indicator">
                        <AlertTriangle size={16} />
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats-grid">
        <div className="quick-stat-card">
          <h4>Attendance Rate</h4>
          <div className="stat-bar">
            <div className="stat-fill" style={{ width: '92%', background: '#10b981' }}></div>
          </div>
          <span>92% this week</span>
        </div>
        <div className="quick-stat-card">
          <h4>Leave Utilization</h4>
          <div className="stat-bar">
            <div className="stat-fill" style={{ width: '45%', background: '#f59e0b' }}></div>
          </div>
          <span>45% of annual quota</span>
        </div>
        <div className="quick-stat-card">
          <h4>Payroll Compliance</h4>
          <div className="stat-bar">
            <div className="stat-fill" style={{ width: '100%', background: '#3b82f6' }}></div>
          </div>
          <span>100% processed</span>
        </div>
      </div>
    </div>
  );
}
