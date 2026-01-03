import { useState } from 'react';
import { 
  Download, 
  DollarSign, 
  TrendingUp,
  ChevronDown,
  ChevronUp,
  PieChart,
  Wallet,
  MinusCircle,
  PlusCircle,
  Save,
  FileText
} from 'lucide-react';
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import './Salary.css';

export default function Salary() {
  const { user } = useAuth();
  const { getEmployeeSalary, employees, updateSalary } = useData();
  const toast = useToast();
  
  const [selectedEmployee, setSelectedEmployee] = useState(user?.id);
  const [expandedSection, setExpandedSection] = useState('earnings');
  const [isEditing, setIsEditing] = useState(false);
  const [editedWage, setEditedWage] = useState('');
  
  const salary = getEmployeeSalary(selectedEmployee);
  const employee = employees.find(e => e.id === selectedEmployee);

  // Calculate salary components
  const basic = salary.wage * 0.5;
  const hra = basic * 0.5;
  const allowance = salary.wage * 0.0833;
  const bonus = salary.wage * 0.0833;
  const lta = salary.wage * 0.0833;
  const fixedAllowance = salary.wage - (basic + hra + allowance + bonus + lta);
  
  const totalEarnings = salary.wage;
  const pfDeduction = basic * 0.12;
  const professionalTax = 200;
  const totalDeductions = pfDeduction + professionalTax;
  const netSalary = totalEarnings - totalDeductions;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const chartData = [
    { name: 'Basic Salary', value: basic, color: '#3b82f6' },
    { name: 'HRA', value: hra, color: '#10b981' },
    { name: 'Allowances', value: allowance + fixedAllowance, color: '#f59e0b' },
    { name: 'Bonus', value: bonus, color: '#8b5cf6' },
    { name: 'LTA', value: lta, color: '#06b6d4' },
  ];

  const salaryHistory = [
    { month: 'December 2025', gross: salary.wage, deductions: totalDeductions, net: netSalary },
    { month: 'November 2025', gross: salary.wage, deductions: totalDeductions, net: netSalary },
    { month: 'October 2025', gross: salary.wage, deductions: totalDeductions, net: netSalary },
    { month: 'September 2025', gross: salary.wage * 0.95, deductions: totalDeductions * 0.95, net: netSalary * 0.95 },
    { month: 'August 2025', gross: salary.wage * 0.95, deductions: totalDeductions * 0.95, net: netSalary * 0.95 },
  ];

  const handleSaveWage = () => {
    const newWage = parseFloat(editedWage);
    if (isNaN(newWage) || newWage <= 0) {
      toast.error('Please enter a valid wage amount');
      return;
    }
    updateSalary(selectedEmployee, { ...salary, wage: newWage });
    toast.success('Salary updated successfully');
    setIsEditing(false);
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? '' : section);
  };

  return (
    <div className="salary-page animate-fadeIn">
      {/* Header */}
      <div className="page-header">
        <div className="page-title">
          <h1>My Salary</h1>
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
          <button className="btn btn-secondary">
            <Download size={18} />
            Download Salary Slip
          </button>
        </div>
      </div>

      {/* Current Salary Card */}
      <div className="salary-overview">
        <div className="salary-main-card">
          <div className="main-salary-icon">
            <DollarSign size={32} />
          </div>
          <div className="main-salary-content">
            <span className="salary-label">Monthly Salary (CTC)</span>
            <h1 className="salary-amount">{formatCurrency(salary.wage)}</h1>
            <span className="salary-period">As of January 2026</span>
          </div>
          {user?.role === 'hr' && (
            <div className="edit-salary-section">
              {isEditing ? (
                <div className="edit-wage-form">
                  <input
                    type="number"
                    className="input"
                    placeholder="Enter new wage"
                    value={editedWage}
                    onChange={(e) => setEditedWage(e.target.value)}
                  />
                  <button className="btn btn-success btn-sm" onClick={handleSaveWage}>
                    <Save size={16} />
                    Save
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setIsEditing(false)}>
                    Cancel
                  </button>
                </div>
              ) : (
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setEditedWage(salary.wage.toString());
                    setIsEditing(true);
                  }}
                >
                  Edit Salary
                </button>
              )}
            </div>
          )}
        </div>

        <div className="salary-summary-cards">
          <div className="summary-mini-card">
            <PlusCircle size={20} className="text-success" />
            <div>
              <span>Total Earnings</span>
              <p>{formatCurrency(totalEarnings)}</p>
            </div>
          </div>
          <div className="summary-mini-card">
            <MinusCircle size={20} className="text-error" />
            <div>
              <span>Total Deductions</span>
              <p>{formatCurrency(totalDeductions)}</p>
            </div>
          </div>
          <div className="summary-mini-card net-pay">
            <Wallet size={20} />
            <div>
              <span>Net Pay</span>
              <p>{formatCurrency(netSalary)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Salary Breakdown */}
      <div className="salary-details">
        <div className="breakdown-section">
          {/* Earnings */}
          <div className="accordion-card card">
            <button 
              className={`accordion-header ${expandedSection === 'earnings' ? 'active' : ''}`}
              onClick={() => toggleSection('earnings')}
            >
              <div className="accordion-title">
                <PlusCircle size={20} className="text-success" />
                <span>Earnings</span>
              </div>
              <div className="accordion-meta">
                <span className="accordion-total text-success">{formatCurrency(totalEarnings)}</span>
                {expandedSection === 'earnings' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </button>
            {expandedSection === 'earnings' && (
              <div className="accordion-content animate-slideDown">
                <div className="breakdown-row">
                  <span>Basic Salary (50% of CTC)</span>
                  <span>{formatCurrency(basic)}</span>
                </div>
                <div className="breakdown-row">
                  <span>HRA (50% of Basic)</span>
                  <span>{formatCurrency(hra)}</span>
                </div>
                <div className="breakdown-row">
                  <span>Standard Allowance (8.33%)</span>
                  <span>{formatCurrency(allowance)}</span>
                </div>
                <div className="breakdown-row">
                  <span>Performance Bonus (8.33%)</span>
                  <span>{formatCurrency(bonus)}</span>
                </div>
                <div className="breakdown-row">
                  <span>LTA (8.33%)</span>
                  <span>{formatCurrency(lta)}</span>
                </div>
                <div className="breakdown-row">
                  <span>Fixed Allowance</span>
                  <span>{formatCurrency(fixedAllowance)}</span>
                </div>
                <div className="breakdown-row total">
                  <span>Total Earnings</span>
                  <span>{formatCurrency(totalEarnings)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Deductions */}
          <div className="accordion-card card">
            <button 
              className={`accordion-header ${expandedSection === 'deductions' ? 'active' : ''}`}
              onClick={() => toggleSection('deductions')}
            >
              <div className="accordion-title">
                <MinusCircle size={20} className="text-error" />
                <span>Deductions</span>
              </div>
              <div className="accordion-meta">
                <span className="accordion-total text-error">- {formatCurrency(totalDeductions)}</span>
                {expandedSection === 'deductions' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </button>
            {expandedSection === 'deductions' && (
              <div className="accordion-content animate-slideDown">
                <div className="breakdown-row">
                  <span>PF (12% of Basic)</span>
                  <span>{formatCurrency(pfDeduction)}</span>
                </div>
                <div className="breakdown-row">
                  <span>Professional Tax</span>
                  <span>{formatCurrency(professionalTax)}</span>
                </div>
                <div className="breakdown-row total">
                  <span>Total Deductions</span>
                  <span>{formatCurrency(totalDeductions)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Net Salary */}
          <div className="net-salary-card">
            <div className="net-salary-content">
              <span>Net Salary (Take Home)</span>
              <h2>{formatCurrency(netSalary)}</h2>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="chart-section card">
          <h3>Salary Distribution</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <RePieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ 
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend 
                  layout="vertical" 
                  align="right" 
                  verticalAlign="middle"
                  formatter={(value) => <span style={{ color: '#374151', fontSize: 13 }}>{value}</span>}
                />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Salary History */}
      <div className="history-section">
        <h3>Salary History</h3>
        <div className="history-table card">
          <table className="table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Gross Salary</th>
                <th>Deductions</th>
                <th>Net Salary</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {salaryHistory.map((row, index) => (
                <tr key={index}>
                  <td>{row.month}</td>
                  <td>{formatCurrency(row.gross)}</td>
                  <td className="text-error">{formatCurrency(row.deductions)}</td>
                  <td className="font-semibold">{formatCurrency(row.net)}</td>
                  <td>
                    <button className="btn btn-ghost btn-sm">
                      <FileText size={16} />
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
