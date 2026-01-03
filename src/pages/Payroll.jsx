import { useState } from 'react';
import { 
  TrendingUp,
  Calendar,
  Clock,
  Award,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Briefcase,
  Coffee,
  Sun,
  ChevronLeft,
  ChevronRight,
  Info
} from 'lucide-react';
import { 
  RadialBarChart, 
  RadialBar, 
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import './Payroll.css';

export default function Payroll() {
  const { user } = useAuth();
  const { getEmployeeAttendance, getEmployeeLeaves, getEmployeeSalary, employees } = useData();
  
  const [selectedEmployee, setSelectedEmployee] = useState(user?.id);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  
  const salary = getEmployeeSalary(selectedEmployee);
  const attendance = getEmployeeAttendance(selectedEmployee);
  const leaves = getEmployeeLeaves(selectedEmployee);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];

  // Working days calculation
  const totalWorkingDays = 22;
  const presentDays = attendance.filter(a => 
    new Date(a.date).getMonth() === selectedMonth.getMonth() && a.status === 'present'
  ).length || 18;
  const absentDays = attendance.filter(a => 
    new Date(a.date).getMonth() === selectedMonth.getMonth() && a.status === 'absent'
  ).length || 1;
  const leaveDays = leaves.filter(l => 
    l.status === 'approved' && 
    new Date(l.startDate).getMonth() === selectedMonth.getMonth()
  ).reduce((acc, l) => acc + l.days, 0) || 3;
  const remainingDays = totalWorkingDays - presentDays - absentDays - leaveDays;

  // Score calculations
  const attendanceScore = Math.round((presentDays / totalWorkingDays) * 100);
  const leaveScore = Math.round(((12 - leaveDays) / 12) * 100); // Out of 12 annual leaves
  const punctualityScore = 92; // Mock data
  const overallScore = Math.round((attendanceScore + leaveScore + punctualityScore) / 3);

  const getScoreColor = (score) => {
    if (score >= 90) return '#10b981';
    if (score >= 70) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Average';
    return 'Needs Improvement';
  };

  const scoreGaugeData = (score, color) => [
    { name: 'score', value: score, fill: color },
    { name: 'remaining', value: 100 - score, fill: '#f3f4f6' },
  ];

  // Monthly trend data
  const monthlyTrend = [
    { month: 'Aug', attendance: 85, leaves: 3, score: 78 },
    { month: 'Sep', attendance: 90, leaves: 2, score: 85 },
    { month: 'Oct', attendance: 88, leaves: 4, score: 80 },
    { month: 'Nov', attendance: 95, leaves: 1, score: 92 },
    { month: 'Dec', attendance: attendanceScore, leaves: leaveDays, score: overallScore },
  ];

  // Insights
  const insights = [
    {
      type: 'success',
      icon: CheckCircle,
      title: 'Perfect Attendance Streak',
      description: 'You have maintained 95% attendance for the last 3 months!'
    },
    {
      type: 'warning',
      icon: AlertTriangle,
      title: 'Late Check-ins Detected',
      description: '3 late arrivals this month. Consider setting earlier alarms.'
    },
    {
      type: 'info',
      icon: Info,
      title: 'Leave Balance Update',
      description: 'You have 9 paid leaves remaining for this year.'
    },
  ];

  const navigateMonth = (direction) => {
    const newMonth = new Date(selectedMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setSelectedMonth(newMonth);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Payroll impact calculation
  const dailyWage = salary.wage / totalWorkingDays;
  const deductionForAbsent = dailyWage * absentDays;
  const estimatedPay = salary.wage - deductionForAbsent;

  return (
    <div className="payroll-page animate-fadeIn">
      {/* Header */}
      <div className="page-header">
        <div className="page-title">
          <h1>Payroll Intelligence</h1>
          <p>Your attendance and payroll performance insights</p>
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
          <div className="month-nav">
            <button className="btn btn-ghost btn-icon" onClick={() => navigateMonth(-1)}>
              <ChevronLeft size={20} />
            </button>
            <span className="current-month">
              {monthNames[selectedMonth.getMonth()]} {selectedMonth.getFullYear()}
            </span>
            <button className="btn btn-ghost btn-icon" onClick={() => navigateMonth(1)}>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Overall Score Banner */}
      <div className="score-banner">
        <div className="score-banner-content">
          <div className="overall-score-display">
            <div className="score-ring">
              <ResponsiveContainer width={120} height={120}>
                <RadialBarChart 
                  cx="50%" 
                  cy="50%" 
                  innerRadius="70%" 
                  outerRadius="100%" 
                  data={scoreGaugeData(overallScore, getScoreColor(overallScore))}
                  startAngle={90}
                  endAngle={-270}
                >
                  <RadialBar dataKey="value" cornerRadius={10} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="score-value">
                <span>{overallScore}</span>
              </div>
            </div>
            <div className="score-info">
              <h2>Payroll Stability Score</h2>
              <span className={`score-label ${getScoreLabel(overallScore).toLowerCase()}`}>
                {getScoreLabel(overallScore)}
              </span>
              <p>Based on attendance, punctuality, and leave patterns</p>
            </div>
          </div>
          <div className="payroll-estimate">
            <span>Estimated Payroll</span>
            <h3>{formatCurrency(estimatedPay)}</h3>
            {deductionForAbsent > 0 && (
              <span className="deduction-note">
                -{formatCurrency(deductionForAbsent)} deduction for {absentDays} absent day(s)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Working Days Summary */}
      <div className="summary-grid">
        <div className="summary-card card">
          <div className="summary-icon present">
            <Briefcase size={24} />
          </div>
          <div className="summary-content">
            <span>Present Days</span>
            <h3>{presentDays}</h3>
            <p>out of {totalWorkingDays} working days</p>
          </div>
        </div>
        <div className="summary-card card">
          <div className="summary-icon absent">
            <XCircle size={24} />
          </div>
          <div className="summary-content">
            <span>Absent Days</span>
            <h3>{absentDays}</h3>
            <p>Unpaid leave</p>
          </div>
        </div>
        <div className="summary-card card">
          <div className="summary-icon leave">
            <Sun size={24} />
          </div>
          <div className="summary-content">
            <span>Leave Days</span>
            <h3>{leaveDays}</h3>
            <p>Approved leaves</p>
          </div>
        </div>
        <div className="summary-card card">
          <div className="summary-icon remaining">
            <Calendar size={24} />
          </div>
          <div className="summary-content">
            <span>Remaining</span>
            <h3>{remainingDays > 0 ? remainingDays : 0}</h3>
            <p>Days left this month</p>
          </div>
        </div>
      </div>

      {/* Score Gauges */}
      <div className="scores-section">
        <h3>Performance Scores</h3>
        <div className="scores-grid">
          <div className="score-gauge-card card">
            <div className="gauge-container">
              <ResponsiveContainer width={140} height={140}>
                <RadialBarChart 
                  cx="50%" 
                  cy="50%" 
                  innerRadius="65%" 
                  outerRadius="90%" 
                  data={scoreGaugeData(attendanceScore, getScoreColor(attendanceScore))}
                  startAngle={90}
                  endAngle={-270}
                >
                  <RadialBar dataKey="value" cornerRadius={8} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="gauge-score">{attendanceScore}%</div>
            </div>
            <div className="gauge-info">
              <h4>Attendance Reliability</h4>
              <span className={`gauge-label ${getScoreLabel(attendanceScore).toLowerCase()}`}>
                {getScoreLabel(attendanceScore)}
              </span>
            </div>
          </div>

          <div className="score-gauge-card card">
            <div className="gauge-container">
              <ResponsiveContainer width={140} height={140}>
                <RadialBarChart 
                  cx="50%" 
                  cy="50%" 
                  innerRadius="65%" 
                  outerRadius="90%" 
                  data={scoreGaugeData(punctualityScore, getScoreColor(punctualityScore))}
                  startAngle={90}
                  endAngle={-270}
                >
                  <RadialBar dataKey="value" cornerRadius={8} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="gauge-score">{punctualityScore}%</div>
            </div>
            <div className="gauge-info">
              <h4>Punctuality Score</h4>
              <span className={`gauge-label ${getScoreLabel(punctualityScore).toLowerCase()}`}>
                {getScoreLabel(punctualityScore)}
              </span>
            </div>
          </div>

          <div className="score-gauge-card card">
            <div className="gauge-container">
              <ResponsiveContainer width={140} height={140}>
                <RadialBarChart 
                  cx="50%" 
                  cy="50%" 
                  innerRadius="65%" 
                  outerRadius="90%" 
                  data={scoreGaugeData(leaveScore, getScoreColor(leaveScore))}
                  startAngle={90}
                  endAngle={-270}
                >
                  <RadialBar dataKey="value" cornerRadius={8} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="gauge-score">{leaveScore}%</div>
            </div>
            <div className="gauge-info">
              <h4>Leave Discipline</h4>
              <span className={`gauge-label ${getScoreLabel(leaveScore).toLowerCase()}`}>
                {getScoreLabel(leaveScore)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Trend Chart & Insights */}
      <div className="bottom-section">
        <div className="trend-chart card">
          <h3>Monthly Trend</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={monthlyTrend}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorScore)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="insights-section">
          <h3>Insights & Recommendations</h3>
          <div className="insights-list">
            {insights.map((insight, index) => (
              <div key={index} className={`insight-card ${insight.type}`}>
                <div className={`insight-icon ${insight.type}`}>
                  <insight.icon size={20} />
                </div>
                <div className="insight-content">
                  <h4>{insight.title}</h4>
                  <p>{insight.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
