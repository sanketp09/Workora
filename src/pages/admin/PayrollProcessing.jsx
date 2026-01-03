import { useState, useEffect } from 'react';
import { 
  DollarSign,
  Download,
  CheckCircle,
  Clock,
  AlertTriangle,
  Lock,
  Unlock,
  Eye,
  Search,
  Filter
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import './PayrollProcessing.css';

export default function PayrollProcessing() {
  const { employees, getEmployeeSalary } = useData();
  const toast = useToast();
  
  const [selectedMonth, setSelectedMonth] = useState('2026-01');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [payrollData, setPayrollData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Generate payroll data for each employee
  useEffect(() => {
    const generatePayrollData = async () => {
      setLoading(true);
      const payrollPromises = employees.map(async (emp, index) => {
        const salary = await getEmployeeSalary(emp.id);
        const wage = salary?.wage || 50000;
        const workingDays = 22;
        const presentDays = Math.floor(18 + Math.random() * 5);
        const unpaidLeaves = Math.max(0, Math.floor(Math.random() * 3));
        const payableDays = Math.min(presentDays + (workingDays - presentDays - unpaidLeaves), workingDays);
        
        const dailyWage = wage / workingDays;
        const grossSalary = dailyWage * payableDays;
        const deductions = wage * 0.12 * 0.5 + 200; // PF + PT
        const netSalary = grossSalary - deductions;
        
        // Random status
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

      const data = await Promise.all(payrollPromises);
      setPayrollData(data);
      setLoading(false);
    };

    if (employees.length > 0) {
      generatePayrollData();
    }
  }, [employees, getEmployeeSalary]);

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

  return (
    <div className="payroll-processing animate-fadeIn">
      {/* Header */}
      <div className="admin-header">
        <div>
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

      {/* Summary Cards */}
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

      {/* Info Banner */}
      <div className="info-banner">
        <Lock size={18} />
        <span>Only finalized payroll is visible to employees. Draft payroll remains hidden until finalized.</span>
      </div>

      {/* Filters */}
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

      {/* Payroll Table */}
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
                        setSelectedEmployee(emp);
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

      {/* Detail Modal */}
      {showDetailModal && selectedEmployee && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Payroll Details - {selectedEmployee.employeeName}</h2>
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
                  <strong>{selectedEmployee.workingDays}</strong>
                </div>
                <div className="detail-item">
                  <span>Present Days</span>
                  <strong>{selectedEmployee.presentDays}</strong>
                </div>
                <div className="detail-item">
                  <span>Payable Days</span>
                  <strong>{selectedEmployee.payableDays}</strong>
                </div>
                <div className="detail-item">
                  <span>Unpaid Leaves</span>
                  <strong className="text-error">{selectedEmployee.unpaidLeaves}</strong>
                </div>
              </div>

              <div className="salary-breakdown">
                <div className="breakdown-row">
                  <span>Gross Salary</span>
                  <span>{formatCurrency(selectedEmployee.grossSalary)}</span>
                </div>
                <div className="breakdown-row deduction">
                  <span>Total Deductions</span>
                  <span>- {formatCurrency(selectedEmployee.deductions)}</span>
                </div>
                <div className="breakdown-row net">
                  <span>Net Salary</span>
                  <span>{formatCurrency(selectedEmployee.netSalary)}</span>
                </div>
              </div>

              <div className={`status-info ${selectedEmployee.status}`}>
                {selectedEmployee.status === 'finalized' ? (
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
              {selectedEmployee.status === 'draft' && (
                <button 
                  className="btn btn-success"
                  onClick={() => {
                    handleFinalize(selectedEmployee.employeeId);
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
  );
}
