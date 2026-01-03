import React, { useState, useEffect } from 'react';
import { 
  DollarSign,
  Save,
  Search,
  Check,
  Download,
  CheckCircle,
  Clock,
  AlertTriangle,
  Lock,
  Unlock,
  Eye,
  Filter,
  Brain,
  TrendingDown,
  TrendingUp,
  Calendar,
  User,
  ChevronDown,
  ChevronUp,
  Info,
  MinusCircle,
  FileText,
  BarChart3
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import './SalaryConfig.css';
import './PayrollProcessing.css';
import './PayrollIntelligence.css';

export default function Salary() {
  const { employees, getEmployeeSalary } = useData();
  const toast = useToast();
  
  const [activeSection, setActiveSection] = useState('config');

  // Salary Config State
  const [selectedEmployee, setSelectedEmployee] = useState(employees[0]?.id);
  const [searchQuery, setSearchQuery] = useState('');
  const [salaryData, setSalaryData] = useState({
    wageType: 'monthly',
    monthlyWage: 0,
    yearlyWage: 0,
    workingDays: 5,
    breakTime: 60,
    basicSalary: 0,
    hra: 0,
    standardAllowance: 0,
    performanceBonus: 0,
    lta: 0,
    fixedAllowance: 0,
    pfEmployee: 0,
    pfEmployer: 0,
    pfRate: 12,
    professionalTax: 200
  });

  // Payroll Processing State
  const [selectedMonth, setSelectedMonth] = useState('2026-01');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProcessingEmployee, setSelectedProcessingEmployee] = useState(null);

  // Payroll Intelligence State
  const [selectedIntelEmployee, setSelectedIntelEmployee] = useState(employees[0]?.id || '');
  const [expandedSections, setExpandedSections] = useState({
    salaryChange: true,
    unpaidDays: true,
    payableDays: true
  });

  const employee = employees.find(e => e.id === selectedEmployee);

  // Salary Config - Calculate totals
  useEffect(() => {
    const grossSalary = 
      parseFloat(salaryData.basicSalary || 0) +
      parseFloat(salaryData.hra || 0) +
      parseFloat(salaryData.standardAllowance || 0) +
      parseFloat(salaryData.performanceBonus || 0) +
      parseFloat(salaryData.lta || 0) +
      parseFloat(salaryData.fixedAllowance || 0);

    const basicSal = parseFloat(salaryData.basicSalary || 0);
    const pfAmount = (basicSal * salaryData.pfRate) / 100;

    setSalaryData(prev => ({
      ...prev,
      monthlyWage: grossSalary,
      yearlyWage: grossSalary * 12,
      pfEmployee: pfAmount,
      pfEmployer: pfAmount
    }));
  }, [
    salaryData.basicSalary,
    salaryData.hra,
    salaryData.standardAllowance,
    salaryData.performanceBonus,
    salaryData.lta,
    salaryData.fixedAllowance,
    salaryData.pfRate
  ]);

  const totalSalaryComponents =
    parseFloat(salaryData.basicSalary || 0) +
    parseFloat(salaryData.hra || 0) +
    parseFloat(salaryData.standardAllowance || 0) +
    parseFloat(salaryData.performanceBonus || 0) +
    parseFloat(salaryData.lta || 0) +
    parseFloat(salaryData.fixedAllowance || 0);

  const handleSalaryFieldChange = (field, value) => {
    setSalaryData({...salaryData, [field]: parseFloat(value) || 0});
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/admin/employees/${selectedEmployee}/salary`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ salaryData })
      });
      
      if (response.ok) {
        toast.success('Salary information saved successfully!');
      } else {
        toast.error('Failed to save salary information');
      }
    } catch (error) {
      console.error('Error saving salary:', error);
      toast.error('Error saving salary information');
    }
  };

  const handleEmployeeChange = (empId) => {
    setSelectedEmployee(empId);
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Payroll Processing - Generate payroll data
  const generatePayrollData = () => {
    return employees.map((emp, index) => {
      const salary = getEmployeeSalary(emp.id);
      const workingDays = 22;
      const presentDays = Math.floor(18 + Math.random() * 5);
      const unpaidLeaves = Math.max(0, Math.floor(Math.random() * 3));
      const payableDays = Math.min(presentDays + (workingDays - presentDays - unpaidLeaves), workingDays);
      
      const dailyWage = salary.wage / workingDays;
      const grossSalary = dailyWage * payableDays;
      const deductions = salary.wage * 0.12 * 0.5 + 200;
      const netSalary = grossSalary - deductions;
      
      const statusRandom = Math.random();
      let status;
      if (index < 3) {
        status = 'draft';
      } else if (statusRandom > 0.2) {
        status = 'finalized';
      } else {
        status = 'draft';
      }

      return {
        employeeId: emp.id,
        employeeName: emp.name,
        department: emp.department,
        workingDays,
        presentDays,
        payableDays,
        unpaidLeaves,
        grossSalary,
        deductions,
        netSalary,
        status
      };
    });
  };

  const [payrollData, setPayrollData] = useState(generatePayrollData());

  const filteredData = payrollData.filter(emp => {
    const matchesSearch = emp.employeeName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || emp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const draftCount = payrollData.filter(p => p.status === 'draft').length;
  const finalizedCount = payrollData.filter(p => p.status === 'finalized').length;
  const totalPayroll = payrollData.filter(p => p.status === 'finalized').reduce((acc, p) => acc + p.netSalary, 0);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleFinalize = (empId) => {
    setPayrollData(prev => prev.map(p => 
      p.employeeId === empId ? { ...p, status: 'finalized' } : p
    ));
    toast.success('Payroll finalized successfully');
  };

  const handleFinalizeAll = () => {
    setPayrollData(prev => prev.map(p => ({ ...p, status: 'finalized' })));
    toast.success('All payrolls finalized');
  };

  const handleUnlock = (empId) => {
    setPayrollData(prev => prev.map(p => 
      p.employeeId === empId ? { ...p, status: 'draft' } : p
    ));
    toast.warning('Payroll unlocked for editing');
  };

  const handleExport = () => {
    toast.success('Exporting payroll data...');
  };

  const getMonthName = (monthStr) => {
    const [year, month] = monthStr.split('-');
    return new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Payroll Intelligence - Generate insights
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
    const lateDeduction = (dailyWage / 2) * Math.floor(lateMarks / 3);
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
    selectedIntelEmployee ? generatePayrollExplanation(selectedIntelEmployee) : null
  );

  const handleIntelEmployeeChange = (empId) => {
    setSelectedIntelEmployee(empId);
    setEmployeeExplanation(generatePayrollExplanation(empId));
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const decliningAttendance = insights.filter(i => i.attendanceTrend === 'declining');
  const highUnpaidLeave = insights.filter(i => i.unpaidLeaveFrequency > 2);
  const unstableSalary = insights.filter(i => i.salaryStability === 'unstable');

  return (
    <div className="salary-page animate-fadeIn">
      {/* Header with Tabs */}
      <div className="salary-header" style={{ background: 'white', padding: '24px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '4px' }}>Salary Management</h1>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Configure salary, process payroll, and view intelligent insights</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', borderBottom: '2px solid #e5e7eb' }}>
          <button
            onClick={() => setActiveSection('config')}
            style={{
              padding: '12px 24px',
              background: activeSection === 'config' ? '#3b82f6' : 'transparent',
              color: activeSection === 'config' ? 'white' : '#6b7280',
              border: 'none',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <DollarSign size={20} />
            Salary Configuration
          </button>
          <button
            onClick={() => setActiveSection('processing')}
            style={{
              padding: '12px 24px',
              background: activeSection === 'processing' ? '#3b82f6' : 'transparent',
              color: activeSection === 'processing' ? 'white' : '#6b7280',
              border: 'none',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <CheckCircle size={20} />
            Payroll Processing
          </button>
          <button
            onClick={() => setActiveSection('intelligence')}
            style={{
              padding: '12px 24px',
              background: activeSection === 'intelligence' ? '#3b82f6' : 'transparent',
              color: activeSection === 'intelligence' ? 'white' : '#6b7280',
              border: 'none',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <Brain size={20} />
            Payroll Intelligence
          </button>
        </div>
      </div>

      {/* Salary Configuration Section */}
      {activeSection === 'config' && (
        <div className="salary-config">
          <div className="admin-header" style={{ display: 'none' }}>
            <div>
              <h1>Salary Configuration</h1>
              <p>Configure detailed salary components for employees</p>
            </div>
          </div>

          <div className="config-layout">
            <div className="employee-selector card">
              <h3>Select Employee</h3>
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
              <div className="employee-list">
                {filteredEmployees.map(emp => (
                  <div
                    key={emp.id}
                    className={`employee-item ${selectedEmployee === emp.id ? 'active' : ''}`}
                    onClick={() => handleEmployeeChange(emp.id)}
                  >
                    <div className="emp-avatar">
                      {emp.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="emp-info">
                      <span className="emp-name">{emp.name}</span>
                      <span className="emp-dept">{emp.department}</span>
                    </div>
                    {selectedEmployee === emp.id && <Check size={18} className="check-icon" />}
                  </div>
                ))}
              </div>
            </div>

            <div className="salary-details-panel card">
              <h2 className="panel-title">Salary Details for {employee?.name}</h2>
              
              <div className="space-y-8">
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Wage Information</h2>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Wage (₹)</label>
                        <input
                          type="number"
                          value={salaryData.monthlyWage}
                          readOnly
                          className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg"
                        />
                        <p className="text-xs text-gray-500 mt-1">Calculated from salary components</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Yearly Wage (₹)</label>
                        <input
                          type="number"
                          value={salaryData.yearlyWage}
                          readOnly
                          className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg"
                        />
                        <p className="text-xs text-gray-500 mt-1">Monthly wage × 12</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">No. of working days in a week</label>
                        <input
                          type="number"
                          value={salaryData.workingDays}
                          onChange={(e) => setSalaryData({...salaryData, workingDays: parseFloat(e.target.value)})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Break Time (minutes/day)</label>
                        <input
                          type="number"
                          value={salaryData.breakTime}
                          onChange={(e) => setSalaryData({...salaryData, breakTime: parseFloat(e.target.value)})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Salary Components</h2>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Basic Salary (₹/month)</label>
                        <input
                          type="number"
                          value={salaryData.basicSalary}
                          onChange={(e) => handleSalaryFieldChange('basicSalary', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter basic salary"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Percentage: {totalSalaryComponents > 0 ? ((salaryData.basicSalary / totalSalaryComponents) * 100).toFixed(2) : 0}%
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">House Rent Allowance (₹/month)</label>
                        <input
                          type="number"
                          value={salaryData.hra}
                          onChange={(e) => handleSalaryFieldChange('hra', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter HRA"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Percentage: {totalSalaryComponents > 0 ? ((salaryData.hra / totalSalaryComponents) * 100).toFixed(2) : 0}%
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Standard Allowance (₹/month)</label>
                        <input
                          type="number"
                          value={salaryData.standardAllowance}
                          onChange={(e) => handleSalaryFieldChange('standardAllowance', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter standard allowance"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Percentage: {totalSalaryComponents > 0 ? ((salaryData.standardAllowance / totalSalaryComponents) * 100).toFixed(2) : 0}%
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Performance Bonus (₹/month)</label>
                        <input
                          type="number"
                          value={salaryData.performanceBonus}
                          onChange={(e) => handleSalaryFieldChange('performanceBonus', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter performance bonus"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Percentage: {totalSalaryComponents > 0 ? ((salaryData.performanceBonus / totalSalaryComponents) * 100).toFixed(2) : 0}%
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Leave Travel Allowance (₹/month)</label>
                        <input
                          type="number"
                          value={salaryData.lta}
                          onChange={(e) => handleSalaryFieldChange('lta', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter LTA"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Percentage: {totalSalaryComponents > 0 ? ((salaryData.lta / totalSalaryComponents) * 100).toFixed(2) : 0}%
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Fixed Allowance (₹/month)</label>
                        <input
                          type="number"
                          value={salaryData.fixedAllowance}
                          onChange={(e) => handleSalaryFieldChange('fixedAllowance', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter fixed allowance"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Percentage: {totalSalaryComponents > 0 ? ((salaryData.fixedAllowance / totalSalaryComponents) * 100).toFixed(2) : 0}%
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900">Total Monthly Gross Salary:</span>
                        <span className="text-2xl font-bold text-blue-600">₹{totalSalaryComponents.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-4">
                    * Enter each salary component amount manually
                  </p>
                  <p className="text-sm text-gray-600">
                    * Percentages are calculated automatically based on total gross salary
                  </p>
                  <p className="text-sm text-gray-600">
                    * PF will be calculated based on Basic Salary at the specified rate
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Provident Fund (PF) Contribution</h2>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">PF Rate (%)</label>
                        <input
                          type="number"
                          value={salaryData.pfRate}
                          onChange={(e) => setSalaryData({...salaryData, pfRate: parseFloat(e.target.value)})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">Calculated based on Basic Salary</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Employee PF (₹/month)</label>
                        <input
                          type="number"
                          value={salaryData.pfEmployee}
                          readOnly
                          className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Employer PF (₹/month)</label>
                        <input
                          type="number"
                          value={salaryData.pfEmployer}
                          readOnly
                          className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Tax Deductions</h2>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Professional Tax (₹)</label>
                        <input
                          type="number"
                          value={salaryData.professionalTax}
                          onChange={(e) => setSalaryData({...salaryData, professionalTax: parseFloat(e.target.value)})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">Fixed amount deducted from Gross Salary</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Salary Summary</h2>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700">Gross Salary:</span>
                        <span className="text-xl font-bold text-gray-900">₹{totalSalaryComponents.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700">Total Deductions:</span>
                        <span className="text-xl font-bold text-red-600">₹{(salaryData.pfEmployee + salaryData.professionalTax).toFixed(2)}</span>
                      </div>
                      <div className="md:col-span-2 border-t border-blue-300 pt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-gray-900">Net Salary (Take Home):</span>
                          <span className="text-2xl font-bold text-green-600">
                            ₹{(totalSalaryComponents - salaryData.pfEmployee - salaryData.professionalTax).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <div className="flex justify-end">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-lg font-semibold shadow-lg"
                  >
                    <Save size={20} />
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payroll Processing Section */}
      {activeSection === 'processing' && (
        <div className="payroll-processing">
          <div className="admin-header">
            <div style={{ display: 'none' }}>
              <h1>Payroll Processing</h1>
              <p>Process and finalize monthly payroll for employees</p>
            </div>
            <div className="header-actions">
              <input
                type="month"
                className="input"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />
              <button className="btn btn-secondary" onClick={handleExport}>
                <Download size={18} />
                Export
              </button>
              {draftCount > 0 && (
                <button className="btn btn-primary" onClick={handleFinalizeAll}>
                  <CheckCircle size={18} />
                  Finalize All ({draftCount})
                </button>
              )}
            </div>
          </div>

          <div className="summary-cards">
            <div className="summary-card">
              <DollarSign size={24} />
              <div>
                <span>Total Payroll</span>
                <h3>{formatCurrency(totalPayroll)}</h3>
              </div>
            </div>
            <div className="summary-card finalized">
              <CheckCircle size={24} />
              <div>
                <span>Finalized</span>
                <h3>{finalizedCount} / {employees.length}</h3>
              </div>
            </div>
            <div className="summary-card draft">
              <Clock size={24} />
              <div>
                <span>Pending (Draft)</span>
                <h3>{draftCount}</h3>
              </div>
            </div>
            <div className="summary-card">
              <AlertTriangle size={24} />
              <div>
                <span>Employees with Deductions</span>
                <h3>{payrollData.filter(p => p.unpaidLeaves > 0).length}</h3>
              </div>
            </div>
          </div>

          <div className="info-banner">
            <Lock size={18} />
            <span>Only finalized payroll is visible to employees. Draft payroll remains hidden until finalized.</span>
          </div>

          <div className="filters-bar card">
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
              <option value="draft">Draft</option>
              <option value="finalized">Finalized</option>
            </select>
          </div>

          <div className="payroll-table card">
            <table className="table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Working Days</th>
                  <th>Payable Days</th>
                  <th>Unpaid Leaves</th>
                  <th>Gross Salary</th>
                  <th>Deductions</th>
                  <th>Net Salary</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map(emp => (
                  <tr key={emp.employeeId} className={emp.status === 'draft' ? 'draft-row' : ''}>
                    <td>
                      <div className="employee-cell">
                        <div className="emp-avatar">
                          {emp.employeeName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <span className="emp-name">{emp.employeeName}</span>
                          <span className="emp-dept">{emp.department}</span>
                        </div>
                      </div>
                    </td>
                    <td>{emp.workingDays}</td>
                    <td>
                      <span className={emp.payableDays < emp.workingDays ? 'text-warning' : ''}>
                        {emp.payableDays}
                      </span>
                    </td>
                    <td>
                      {emp.unpaidLeaves > 0 ? (
                        <span className="unpaid-badge">{emp.unpaidLeaves}</span>
                      ) : '-'}
                    </td>
                    <td>{formatCurrency(emp.grossSalary)}</td>
                    <td className="text-error">{formatCurrency(emp.deductions)}</td>
                    <td className="net-salary">{formatCurrency(emp.netSalary)}</td>
                    <td>
                      <span className={`status-badge ${emp.status}`}>
                        {emp.status === 'finalized' ? (
                          <><CheckCircle size={14} /> Finalized</>
                        ) : (
                          <><Clock size={14} /> Draft</>
                        )}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn btn-ghost btn-sm"
                          onClick={() => {
                            setSelectedProcessingEmployee(emp);
                            setShowDetailModal(true);
                          }}
                        >
                          <Eye size={16} />
                        </button>
                        {emp.status === 'draft' ? (
                          <button 
                            className="btn btn-success btn-sm"
                            onClick={() => handleFinalize(emp.employeeId)}
                          >
                            <Lock size={14} />
                            Finalize
                          </button>
                        ) : (
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleUnlock(emp.employeeId)}
                          >
                            <Unlock size={14} />
                            Unlock
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {showDetailModal && selectedProcessingEmployee && (
            <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
              <div className="modal modal-md" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Payroll Details - {selectedProcessingEmployee.employeeName}</h2>
                  <button className="close-btn" onClick={() => setShowDetailModal(false)}>×</button>
                </div>
                <div className="modal-body">
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span>Month</span>
                      <strong>{getMonthName(selectedMonth)}</strong>
                    </div>
                    <div className="detail-item">
                      <span>Working Days</span>
                      <strong>{selectedProcessingEmployee.workingDays}</strong>
                    </div>
                    <div className="detail-item">
                      <span>Present Days</span>
                      <strong>{selectedProcessingEmployee.presentDays}</strong>
                    </div>
                    <div className="detail-item">
                      <span>Payable Days</span>
                      <strong>{selectedProcessingEmployee.payableDays}</strong>
                    </div>
                    <div className="detail-item">
                      <span>Unpaid Leaves</span>
                      <strong className="text-error">{selectedProcessingEmployee.unpaidLeaves}</strong>
                    </div>
                  </div>

                  <div className="salary-breakdown">
                    <div className="breakdown-row">
                      <span>Gross Salary</span>
                      <span>{formatCurrency(selectedProcessingEmployee.grossSalary)}</span>
                    </div>
                    <div className="breakdown-row deduction">
                      <span>Total Deductions</span>
                      <span>- {formatCurrency(selectedProcessingEmployee.deductions)}</span>
                    </div>
                    <div className="breakdown-row net">
                      <span>Net Salary</span>
                      <span>{formatCurrency(selectedProcessingEmployee.netSalary)}</span>
                    </div>
                  </div>

                  <div className={`status-info ${selectedProcessingEmployee.status}`}>
                    {selectedProcessingEmployee.status === 'finalized' ? (
                      <>
                        <CheckCircle size={18} />
                        <span>This payroll is finalized and visible to the employee.</span>
                      </>
                    ) : (
                      <>
                        <Clock size={18} />
                        <span>This payroll is in draft. It will not be visible to the employee until finalized.</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setShowDetailModal(false)}>
                    Close
                  </button>
                  {selectedProcessingEmployee.status === 'draft' && (
                    <button 
                      className="btn btn-success"
                      onClick={() => {
                        handleFinalize(selectedProcessingEmployee.employeeId);
                        setShowDetailModal(false);
                      }}
                    >
                      <Lock size={16} />
                      Finalize Payroll
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Payroll Intelligence Section */}
      {activeSection === 'intelligence' && (
        <div className="payroll-intelligence">
          <div className="admin-header" style={{ display: 'none' }}>
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
            <div className="workforce-panel card">
              <h2>
                <BarChart3 size={20} />
                Workforce Intelligence
              </h2>
              
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

            <div className="explanation-panel">
              <div className="selector-bar card">
                <div className="selector-group">
                  <label>Employee</label>
                  <select 
                    className="select"
                    value={selectedIntelEmployee}
                    onChange={(e) => handleIntelEmployeeChange(e.target.value)}
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
      )}
    </div>
  );
}
