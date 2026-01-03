import { useState } from 'react';
import { 
  Brain,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Calendar,
  DollarSign,
  User,
  ChevronDown,
  ChevronUp,
  Info,
  Clock,
  MinusCircle,
  FileText,
  BarChart3
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import './PayrollIntelligence.css';

export default function PayrollIntelligence() {
  const { employees } = useData();
  
  const [selectedEmployee, setSelectedEmployee] = useState(employees[0]?.id || '');
  const [selectedMonth, setSelectedMonth] = useState('2026-01');
  const [expandedSections, setExpandedSections] = useState({
    salaryChange: true,
    unpaidDays: true,
    payableDays: true
  });

  // Generate intelligent insights
  const generateInsights = () => {
    return employees.map(emp => {
      const baseAttendance = 85 + Math.random() * 15;
      const attendanceTrend = Math.random() > 0.7 ? 'declining' : 'stable';
      const unpaidLeaveFreq = Math.floor(Math.random() * 4);
      const salaryStability = Math.random() > 0.8 ? 'unstable' : 'stable';
      
      return {
        employeeId: emp.id,
        employeeName: emp.name,
        department: emp.department,
        attendanceRate: baseAttendance.toFixed(1),
        attendanceTrend,
        unpaidLeaveFrequency: unpaidLeaveFreq,
        salaryStability,
        riskScore: attendanceTrend === 'declining' || salaryStability === 'unstable' ? 'high' : unpaidLeaveFreq > 2 ? 'medium' : 'low'
      };
    });
  };

  const [insights] = useState(generateInsights());

  // Generate employee-specific payroll explanation
  const generatePayrollExplanation = (empId) => {
    const workingDays = 22;
    const presentDays = 18 + Math.floor(Math.random() * 4);
    const paidLeaves = Math.floor(Math.random() * 2);
    const unpaidLeaves = Math.floor(Math.random() * 3);
    const lateMarks = Math.floor(Math.random() * 3);
    const halfDays = Math.floor(Math.random() * 2);
    
    const payableDays = presentDays + paidLeaves - (halfDays * 0.5);
    const ctc = 50000 + Math.floor(Math.random() * 50000);
    const dailyWage = ctc / workingDays;
    const grossSalary = dailyWage * payableDays;
    const unpaidDeduction = dailyWage * unpaidLeaves;
    const lateDeduction = (dailyWage / 2) * Math.floor(lateMarks / 3); // 3 lates = 1 half day deduction
    const pfDeduction = ctc * 0.12 * 0.5;
    const ptDeduction = 200;
    const totalDeductions = unpaidDeduction + lateDeduction + pfDeduction + ptDeduction;
    const netSalary = grossSalary - totalDeductions;

    const prevMonthNet = netSalary * (0.95 + Math.random() * 0.1);
    const salaryChange = netSalary - prevMonthNet;
    const changePercent = ((salaryChange / prevMonthNet) * 100).toFixed(1);

    return {
      ctc,
      workingDays,
      presentDays,
      paidLeaves,
      unpaidLeaves,
      lateMarks,
      halfDays,
      payableDays,
      dailyWage,
      grossSalary,
      unpaidDeduction,
      lateDeduction,
      pfDeduction,
      ptDeduction,
      totalDeductions,
      netSalary,
      prevMonthNet,
      salaryChange,
      changePercent
    };
  };

  const [employeeExplanation, setEmployeeExplanation] = useState(() => 
    selectedEmployee ? generatePayrollExplanation(selectedEmployee) : null
  );

  const handleEmployeeChange = (empId) => {
    setSelectedEmployee(empId);
    setEmployeeExplanation(generatePayrollExplanation(empId));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getSelectedEmployee = () => employees.find(e => e.id === selectedEmployee);

  // Workforce Intelligence Panel
  const decliningAttendance = insights.filter(i => i.attendanceTrend === 'declining');
  const highUnpaidLeave = insights.filter(i => i.unpaidLeaveFrequency > 2);
  const unstableSalary = insights.filter(i => i.salaryStability === 'unstable');

  return (
    <div className="payroll-intelligence animate-fadeIn">
      {/* Header */}
      <div className="admin-header">
        <div className="header-content">
          <div className="header-icon">
            <Brain size={28} />
          </div>
          <div>
            <h1>Payroll Intelligence</h1>
            <p>Workforce insights & payroll transparency</p>
          </div>
        </div>
      </div>

      <div className="intelligence-layout">
        {/* Left Panel - Workforce Intelligence */}
        <div className="workforce-panel card">
          <h2>
            <BarChart3 size={20} />
            Workforce Intelligence
          </h2>
          
          {/* Declining Attendance */}
          <div className="insight-section">
            <div className="insight-header danger">
              <TrendingDown size={18} />
              <span>Declining Attendance</span>
              <span className="count">{decliningAttendance.length}</span>
            </div>
            {decliningAttendance.length > 0 ? (
              <ul className="insight-list">
                {decliningAttendance.map(emp => (
                  <li key={emp.employeeId}>
                    <User size={14} />
                    <span>{emp.employeeName}</span>
                    <span className="metric">{emp.attendanceRate}%</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-data">No concerning trends</p>
            )}
          </div>

          {/* High Unpaid Leave Frequency */}
          <div className="insight-section">
            <div className="insight-header warning">
              <Calendar size={18} />
              <span>High Unpaid Leave Frequency</span>
              <span className="count">{highUnpaidLeave.length}</span>
            </div>
            {highUnpaidLeave.length > 0 ? (
              <ul className="insight-list">
                {highUnpaidLeave.map(emp => (
                  <li key={emp.employeeId}>
                    <User size={14} />
                    <span>{emp.employeeName}</span>
                    <span className="metric">{emp.unpaidLeaveFrequency} days/mo</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-data">No concerning patterns</p>
            )}
          </div>

          {/* Salary Instability */}
          <div className="insight-section">
            <div className="insight-header info">
              <DollarSign size={18} />
              <span>Salary Instability</span>
              <span className="count">{unstableSalary.length}</span>
            </div>
            {unstableSalary.length > 0 ? (
              <ul className="insight-list">
                {unstableSalary.map(emp => (
                  <li key={emp.employeeId}>
                    <User size={14} />
                    <span>{emp.employeeName}</span>
                    <span className="metric">Variable</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-data">All salaries stable</p>
            )}
          </div>
        </div>

        {/* Right Panel - Payroll Impact Explanation */}
        <div className="explanation-panel">
          {/* Employee Selector */}
          <div className="selector-bar card">
            <div className="selector-group">
              <label>Employee</label>
              <select 
                className="select"
                value={selectedEmployee}
                onChange={(e) => handleEmployeeChange(e.target.value)}
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>
            <div className="selector-group">
              <label>Month</label>
              <input
                type="month"
                className="input"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />
            </div>
          </div>

          {employeeExplanation && (
            <>
              {/* Salary Change Explanation */}
              <div className="explanation-card card">
                <div 
                  className="explanation-header"
                  onClick={() => toggleSection('salaryChange')}
                >
                  <div className="header-left">
                    {employeeExplanation.salaryChange >= 0 ? (
                      <TrendingUp className="icon success" size={22} />
                    ) : (
                      <TrendingDown className="icon danger" size={22} />
                    )}
                    <div>
                      <h3>Why did salary change?</h3>
                      <p className={employeeExplanation.salaryChange >= 0 ? 'text-success' : 'text-danger'}>
                        {employeeExplanation.salaryChange >= 0 ? '+' : ''}{employeeExplanation.changePercent}% from last month
                      </p>
                    </div>
                  </div>
                  {expandedSections.salaryChange ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
                
                {expandedSections.salaryChange && (
                  <div className="explanation-body">
                    <div className="comparison-row">
                      <div className="compare-item">
                        <span>Last Month</span>
                        <strong>{formatCurrency(employeeExplanation.prevMonthNet)}</strong>
                      </div>
                      <div className="compare-arrow">→</div>
                      <div className="compare-item">
                        <span>This Month</span>
                        <strong>{formatCurrency(employeeExplanation.netSalary)}</strong>
                      </div>
                    </div>
                    
                    <div className="reason-box">
                      <FileText size={16} />
                      <div>
                        <strong>Reason for change:</strong>
                        <p>
                          {employeeExplanation.unpaidLeaves > 0 && `${employeeExplanation.unpaidLeaves} unpaid leave(s) resulted in deduction of ${formatCurrency(employeeExplanation.unpaidDeduction)}. `}
                          {employeeExplanation.lateMarks >= 3 && `${employeeExplanation.lateMarks} late marks led to half-day deduction of ${formatCurrency(employeeExplanation.lateDeduction)}. `}
                          {employeeExplanation.halfDays > 0 && `${employeeExplanation.halfDays} half-day(s) affected payable days. `}
                          {employeeExplanation.unpaidLeaves === 0 && employeeExplanation.lateMarks < 3 && 'Full attendance this month!'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Unpaid Days Explanation */}
              <div className="explanation-card card">
                <div 
                  className="explanation-header"
                  onClick={() => toggleSection('unpaidDays')}
                >
                  <div className="header-left">
                    <MinusCircle className="icon warning" size={22} />
                    <div>
                      <h3>Which days were unpaid?</h3>
                      <p>{employeeExplanation.unpaidLeaves} day(s) unpaid this month</p>
                    </div>
                  </div>
                  {expandedSections.unpaidDays ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
                
                {expandedSections.unpaidDays && (
                  <div className="explanation-body">
                    <div className="days-breakdown">
                      <div className="day-row">
                        <span className="day-label">
                          <Clock size={14} />
                          Paid Leaves Used
                        </span>
                        <span className="day-value">{employeeExplanation.paidLeaves}</span>
                      </div>
                      <div className="day-row unpaid">
                        <span className="day-label">
                          <MinusCircle size={14} />
                          Unpaid Leaves
                        </span>
                        <span className="day-value">{employeeExplanation.unpaidLeaves}</span>
                      </div>
                      <div className="day-row late">
                        <span className="day-label">
                          <AlertTriangle size={14} />
                          Late Marks
                        </span>
                        <span className="day-value">{employeeExplanation.lateMarks}</span>
                      </div>
                    </div>
                    
                    {employeeExplanation.unpaidLeaves > 0 && (
                      <div className="info-note">
                        <Info size={14} />
                        <span>Deduction: {formatCurrency(employeeExplanation.dailyWage)} per unpaid day × {employeeExplanation.unpaidLeaves} = {formatCurrency(employeeExplanation.unpaidDeduction)}</span>
                      </div>
                    )}
                    
                    {employeeExplanation.lateMarks >= 3 && (
                      <div className="info-note warning">
                        <AlertTriangle size={14} />
                        <span>3 late marks = 1 half-day deduction ({formatCurrency(employeeExplanation.lateDeduction)})</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Payable Days Calculation */}
              <div className="explanation-card card">
                <div 
                  className="explanation-header"
                  onClick={() => toggleSection('payableDays')}
                >
                  <div className="header-left">
                    <Calendar className="icon primary" size={22} />
                    <div>
                      <h3>How were payable days calculated?</h3>
                      <p>{employeeExplanation.payableDays} payable out of {employeeExplanation.workingDays} working days</p>
                    </div>
                  </div>
                  {expandedSections.payableDays ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
                
                {expandedSections.payableDays && (
                  <div className="explanation-body">
                    <div className="calculation-flow">
                      <div className="calc-step">
                        <span className="step-label">Working Days in Month</span>
                        <span className="step-value">{employeeExplanation.workingDays}</span>
                      </div>
                      <div className="calc-step">
                        <span className="step-label">Days Present</span>
                        <span className="step-value">{employeeExplanation.presentDays}</span>
                      </div>
                      <div className="calc-step add">
                        <span className="step-label">+ Paid Leaves</span>
                        <span className="step-value">+{employeeExplanation.paidLeaves}</span>
                      </div>
                      <div className="calc-step subtract">
                        <span className="step-label">- Unpaid Leaves</span>
                        <span className="step-value">-{employeeExplanation.unpaidLeaves}</span>
                      </div>
                      <div className="calc-step subtract">
                        <span className="step-label">- Half Days</span>
                        <span className="step-value">-{employeeExplanation.halfDays * 0.5}</span>
                      </div>
                      <div className="calc-result">
                        <span className="step-label">= Payable Days</span>
                        <span className="step-value">{employeeExplanation.payableDays}</span>
                      </div>
                    </div>

                    <div className="final-calculation">
                      <div className="calc-line">
                        <span>Gross Salary</span>
                        <span>{formatCurrency(employeeExplanation.grossSalary)}</span>
                      </div>
                      <div className="calc-line deduction">
                        <span>PF Deduction (12%)</span>
                        <span>-{formatCurrency(employeeExplanation.pfDeduction)}</span>
                      </div>
                      <div className="calc-line deduction">
                        <span>Professional Tax</span>
                        <span>-{formatCurrency(employeeExplanation.ptDeduction)}</span>
                      </div>
                      {employeeExplanation.unpaidDeduction > 0 && (
                        <div className="calc-line deduction">
                          <span>Unpaid Leave Deduction</span>
                          <span>-{formatCurrency(employeeExplanation.unpaidDeduction)}</span>
                        </div>
                      )}
                      {employeeExplanation.lateDeduction > 0 && (
                        <div className="calc-line deduction">
                          <span>Late Mark Deduction</span>
                          <span>-{formatCurrency(employeeExplanation.lateDeduction)}</span>
                        </div>
                      )}
                      <div className="calc-line total">
                        <span>Net Salary</span>
                        <span>{formatCurrency(employeeExplanation.netSalary)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
