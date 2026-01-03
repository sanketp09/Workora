import { useState } from 'react';
import { 
  Download,
  FileText,
  Calendar,
  Users,
  TrendingUp,
  PieChart,
  BarChart3,
  Filter,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Briefcase
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import './Reports.css';

export default function Reports() {
  const { user } = useAuth();
  const { employees } = useData();
  const toast = useToast();
  
  const [selectedReport, setSelectedReport] = useState('attendance');
  const [dateRange, setDateRange] = useState('month');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const reportTypes = [
    { id: 'attendance', name: 'Attendance Report', icon: Clock, color: '#3b82f6' },
    { id: 'leave', name: 'Leave Report', icon: Calendar, color: '#10b981' },
    { id: 'payroll', name: 'Payroll Report', icon: DollarSign, color: '#8b5cf6' },
    { id: 'workforce', name: 'Workforce Analytics', icon: Users, color: '#f59e0b' },
  ];

  const departments = ['all', 'Engineering', 'Design', 'Product', 'HR', 'Marketing', 'Finance'];

  // Mock data for charts
  const attendanceData = [
    { name: 'Week 1', present: 92, absent: 5, leave: 3 },
    { name: 'Week 2', present: 88, absent: 8, leave: 4 },
    { name: 'Week 3', present: 95, absent: 3, leave: 2 },
    { name: 'Week 4', present: 90, absent: 6, leave: 4 },
  ];

  const leaveData = [
    { name: 'Paid Leave', value: 45, color: '#3b82f6' },
    { name: 'Sick Leave', value: 25, color: '#f59e0b' },
    { name: 'Personal', value: 15, color: '#10b981' },
    { name: 'Other', value: 15, color: '#8b5cf6' },
  ];

  const payrollTrend = [
    { month: 'Jul', total: 2500000, avg: 75000 },
    { month: 'Aug', total: 2600000, avg: 76000 },
    { month: 'Sep', total: 2650000, avg: 77000 },
    { month: 'Oct', total: 2700000, avg: 78000 },
    { month: 'Nov', total: 2750000, avg: 79000 },
    { month: 'Dec', total: 2800000, avg: 80000 },
  ];

  const departmentStats = [
    { name: 'Engineering', count: 25, avgSalary: 95000 },
    { name: 'Design', count: 12, avgSalary: 75000 },
    { name: 'Product', count: 8, avgSalary: 85000 },
    { name: 'HR', count: 6, avgSalary: 65000 },
    { name: 'Marketing', count: 10, avgSalary: 70000 },
    { name: 'Finance', count: 5, avgSalary: 80000 },
  ];

  const hrAlerts = [
    { type: 'warning', title: 'High Absenteeism', description: '3 employees with >5 absences this month', count: 3 },
    { type: 'info', title: 'Pending Approvals', description: '8 leave requests awaiting approval', count: 8 },
    { type: 'success', title: 'Perfect Attendance', description: '12 employees with 100% attendance', count: 12 },
  ];

  const handleDownload = (format) => {
    toast.success(`Downloading ${selectedReport} report as ${format.toUpperCase()}...`);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const renderReportContent = () => {
    switch (selectedReport) {
      case 'attendance':
        return (
          <div className="report-content">
            <div className="report-summary-cards">
              <div className="report-summary-card">
                <div className="rsc-icon present"><CheckCircle size={20} /></div>
                <div className="rsc-content">
                  <span>Avg Present</span>
                  <h4>91.2%</h4>
                </div>
              </div>
              <div className="report-summary-card">
                <div className="rsc-icon absent"><AlertTriangle size={20} /></div>
                <div className="rsc-content">
                  <span>Avg Absent</span>
                  <h4>5.5%</h4>
                </div>
              </div>
              <div className="report-summary-card">
                <div className="rsc-icon leave"><Calendar size={20} /></div>
                <div className="rsc-content">
                  <span>Avg Leave</span>
                  <h4>3.3%</h4>
                </div>
              </div>
            </div>
            <div className="chart-card">
              <h4>Weekly Attendance Breakdown</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Bar dataKey="present" fill="#10b981" radius={[4, 4, 0, 0]} name="Present %" />
                  <Bar dataKey="absent" fill="#ef4444" radius={[4, 4, 0, 0]} name="Absent %" />
                  <Bar dataKey="leave" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Leave %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case 'leave':
        return (
          <div className="report-content">
            <div className="report-summary-cards">
              <div className="report-summary-card">
                <div className="rsc-icon info"><FileText size={20} /></div>
                <div className="rsc-content">
                  <span>Total Requests</span>
                  <h4>156</h4>
                </div>
              </div>
              <div className="report-summary-card">
                <div className="rsc-icon present"><CheckCircle size={20} /></div>
                <div className="rsc-content">
                  <span>Approved</span>
                  <h4>132</h4>
                </div>
              </div>
              <div className="report-summary-card">
                <div className="rsc-icon absent"><AlertTriangle size={20} /></div>
                <div className="rsc-content">
                  <span>Pending</span>
                  <h4>24</h4>
                </div>
              </div>
            </div>
            <div className="chart-card">
              <h4>Leave Type Distribution</h4>
              <div className="pie-chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <RePieChart>
                    <Pie
                      data={leaveData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {leaveData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );

      case 'payroll':
        return (
          <div className="report-content">
            <div className="report-summary-cards">
              <div className="report-summary-card">
                <div className="rsc-icon info"><DollarSign size={20} /></div>
                <div className="rsc-content">
                  <span>Total Payroll</span>
                  <h4>{formatCurrency(2800000)}</h4>
                </div>
              </div>
              <div className="report-summary-card">
                <div className="rsc-icon present"><TrendingUp size={20} /></div>
                <div className="rsc-content">
                  <span>Avg Salary</span>
                  <h4>{formatCurrency(80000)}</h4>
                </div>
              </div>
              <div className="report-summary-card">
                <div className="rsc-icon leave"><Users size={20} /></div>
                <div className="rsc-content">
                  <span>Employees</span>
                  <h4>{employees.length}</h4>
                </div>
              </div>
            </div>
            <div className="chart-card">
              <h4>Payroll Trend (6 Months)</h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={payrollTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false}
                    tickFormatter={(value) => `₹${(value/1000000).toFixed(1)}M`}
                  />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ 
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    dot={{ fill: '#8b5cf6', r: 4 }}
                    name="Total Payroll"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case 'workforce':
        return (
          <div className="report-content">
            <div className="report-summary-cards">
              <div className="report-summary-card">
                <div className="rsc-icon info"><Users size={20} /></div>
                <div className="rsc-content">
                  <span>Total Workforce</span>
                  <h4>66</h4>
                </div>
              </div>
              <div className="report-summary-card">
                <div className="rsc-icon present"><Briefcase size={20} /></div>
                <div className="rsc-content">
                  <span>Departments</span>
                  <h4>6</h4>
                </div>
              </div>
              <div className="report-summary-card">
                <div className="rsc-icon leave"><TrendingUp size={20} /></div>
                <div className="rsc-content">
                  <span>Growth Rate</span>
                  <h4>+12%</h4>
                </div>
              </div>
            </div>
            <div className="chart-card">
              <h4>Department Distribution</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={departmentStats} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                  <XAxis type="number" axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Employees" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="reports-page animate-fadeIn">
      {/* Header */}
      <div className="page-header">
        <div className="page-title">
          <h1>Reports & Analytics</h1>
          <p>Comprehensive insights and downloadable reports</p>
        </div>
        <div className="header-actions">
          <select 
            className="select"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          {user?.role === 'hr' && (
            <select 
              className="select"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>
                  {dept === 'all' ? 'All Departments' : dept}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="report-types">
        {reportTypes.map(report => (
          <button
            key={report.id}
            className={`report-type-card ${selectedReport === report.id ? 'active' : ''}`}
            onClick={() => setSelectedReport(report.id)}
            style={{ '--accent-color': report.color }}
          >
            <div className="rtc-icon">
              <report.icon size={24} />
            </div>
            <span>{report.name}</span>
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="reports-main">
        <div className="report-section">
          <div className="report-header">
            <h3>{reportTypes.find(r => r.id === selectedReport)?.name}</h3>
            <div className="download-buttons">
              <button className="btn btn-secondary btn-sm" onClick={() => handleDownload('pdf')}>
                <Download size={16} />
                PDF
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => handleDownload('excel')}>
                <Download size={16} />
                Excel
              </button>
            </div>
          </div>
          {renderReportContent()}
        </div>

        {/* HR Alerts - Only visible to HR */}
        {user?.role === 'hr' && (
          <div className="alerts-section">
            <h3>HR Alerts & Notifications</h3>
            <div className="alerts-list">
              {hrAlerts.map((alert, index) => (
                <div key={index} className={`alert-card ${alert.type}`}>
                  <div className="alert-count">{alert.count}</div>
                  <div className="alert-content">
                    <h4>{alert.title}</h4>
                    <p>{alert.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <h3>Quick Statistics</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Total Working Hours (Month)</span>
            <span className="stat-value">14,520 hrs</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Overtime Hours</span>
            <span className="stat-value">342 hrs</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Leaves Taken</span>
            <span className="stat-value">89 days</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">New Hires (Quarter)</span>
            <span className="stat-value">8 employees</span>
          </div>
        </div>
      </div>
    </div>
  );
}
