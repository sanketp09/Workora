import { useState } from 'react';
import { 
  DollarSign,
  Save,
  AlertTriangle,
  Plus,
  Minus,
  Info,
  ChevronDown,
  ChevronUp,
  Search,
  Edit2,
  Check
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import './SalaryConfig.css';

export default function SalaryConfig() {
  const { employees, getEmployeeSalary, updateSalary } = useData();
  const toast = useToast();
  
  const [selectedEmployee, setSelectedEmployee] = useState(employees[0]?.id);
  const [isEditing, setIsEditing] = useState(false);
  const [expandedSection, setExpandedSection] = useState('structure');
  const [searchQuery, setSearchQuery] = useState('');

  const salary = getEmployeeSalary(selectedEmployee);
  const employee = employees.find(e => e.id === selectedEmployee);

  // Editable salary structure
  const [editedSalary, setEditedSalary] = useState({
    wage: salary.wage,
    basicPercent: 50,
    hraPercent: 25, // 50% of basic
    allowancePercent: 8.33,
    bonusPercent: 8.33,
    ltaPercent: 8.33,
    pfPercent: 12,
    professionalTax: 200
  });

  const calculateComponents = (wage, structure) => {
    const basic = wage * (structure.basicPercent / 100);
    const hra = basic * (structure.hraPercent / 100) * 2; // HRA is % of basic
    const allowance = wage * (structure.allowancePercent / 100);
    const bonus = wage * (structure.bonusPercent / 100);
    const lta = wage * (structure.ltaPercent / 100);
    const allocated = basic + hra + allowance + bonus + lta;
    const fixedAllowance = wage - allocated;
    
    const pfDeduction = basic * (structure.pfPercent / 100);
    const totalDeductions = pfDeduction + structure.professionalTax;
    const netSalary = wage - totalDeductions;

    return {
      basic,
      hra,
      allowance,
      bonus,
      lta,
      fixedAllowance,
      pfDeduction,
      professionalTax: structure.professionalTax,
      totalDeductions,
      netSalary,
      isValid: fixedAllowance >= 0
    };
  };

  const components = calculateComponents(editedSalary.wage, editedSalary);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleSave = () => {
    if (!components.isValid) {
      toast.error('Total components exceed the wage. Please adjust.');
      return;
    }
    
    if (updateSalary) {
      updateSalary(selectedEmployee, { wage: editedSalary.wage });
    }
    toast.success('Salary structure updated successfully');
    setIsEditing(false);
  };

  const handleEmployeeChange = (empId) => {
    setSelectedEmployee(empId);
    const empSalary = getEmployeeSalary(empId);
    setEditedSalary(prev => ({ ...prev, wage: empSalary.wage }));
    setIsEditing(false);
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="salary-config animate-fadeIn">
      {/* Header */}
      <div className="admin-header">
        <div>
          <h1>Salary & Payroll Configuration</h1>
          <p>Configure salary structures and deductions</p>
        </div>
      </div>

      <div className="config-layout">
        {/* Employee Selector */}
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

        {/* Salary Configuration */}
        <div className="salary-config-panel">
          {/* Current Salary Card */}
          <div className="current-salary-card">
            <div className="salary-header">
              <div>
                <span>Current CTC</span>
                <h2>{formatCurrency(salary.wage)}</h2>
                <span className="emp-label">{employee?.name}</span>
              </div>
              {!isEditing ? (
                <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                  <Edit2 size={18} />
                  Edit Salary Structure
                </button>
              ) : (
                <div className="edit-actions">
                  <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                    Cancel
                  </button>
                  <button className="btn btn-success" onClick={handleSave}>
                    <Save size={18} />
                    Save Changes
                  </button>
                </div>
              )}
            </div>

            {isEditing && (
              <div className="wage-editor">
                <label>Fixed Wage (CTC)</label>
                <div className="wage-input">
                  <span>₹</span>
                  <input
                    type="number"
                    className="input"
                    value={editedSalary.wage}
                    onChange={(e) => setEditedSalary({ ...editedSalary, wage: parseInt(e.target.value) || 0 })}
                  />
                  <span>/month</span>
                </div>
              </div>
            )}
          </div>

          {/* Salary Structure */}
          <div className="config-section card">
            <button 
              className="section-toggle"
              onClick={() => setExpandedSection(expandedSection === 'structure' ? '' : 'structure')}
            >
              <div className="toggle-left">
                <Plus size={20} className="text-success" />
                <span>Salary Components (Earnings)</span>
              </div>
              <div className="toggle-right">
                <span className="section-total text-success">{formatCurrency(editedSalary.wage)}</span>
                {expandedSection === 'structure' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </button>

            {expandedSection === 'structure' && (
              <div className="section-content">
                <div className="component-row">
                  <div className="component-label">
                    <span>Basic Salary</span>
                    <span className="percent">{editedSalary.basicPercent}% of CTC</span>
                  </div>
                  <div className="component-value">
                    {formatCurrency(components.basic)}
                  </div>
                </div>

                <div className="component-row">
                  <div className="component-label">
                    <span>HRA</span>
                    <span className="percent">{editedSalary.hraPercent}% of Basic</span>
                  </div>
                  <div className="component-value">
                    {formatCurrency(components.hra)}
                  </div>
                </div>

                <div className="component-row">
                  <div className="component-label">
                    <span>Standard Allowance</span>
                    <span className="percent">{editedSalary.allowancePercent}%</span>
                  </div>
                  <div className="component-value">
                    {formatCurrency(components.allowance)}
                  </div>
                </div>

                <div className="component-row">
                  <div className="component-label">
                    <span>Performance Bonus</span>
                    <span className="percent">{editedSalary.bonusPercent}%</span>
                  </div>
                  <div className="component-value">
                    {formatCurrency(components.bonus)}
                  </div>
                </div>

                <div className="component-row">
                  <div className="component-label">
                    <span>LTA</span>
                    <span className="percent">{editedSalary.ltaPercent}%</span>
                  </div>
                  <div className="component-value">
                    {formatCurrency(components.lta)}
                  </div>
                </div>

                <div className={`component-row fixed ${!components.isValid ? 'invalid' : ''}`}>
                  <div className="component-label">
                    <span>Fixed Allowance</span>
                    <span className="percent">Auto-balanced</span>
                  </div>
                  <div className="component-value">
                    {formatCurrency(components.fixedAllowance)}
                    {!components.isValid && (
                      <AlertTriangle size={16} className="text-error" />
                    )}
                  </div>
                </div>

                <div className="component-row total">
                  <div className="component-label">
                    <span>Total Earnings</span>
                  </div>
                  <div className="component-value">
                    {formatCurrency(editedSalary.wage)}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Deductions */}
          <div className="config-section card">
            <button 
              className="section-toggle"
              onClick={() => setExpandedSection(expandedSection === 'deductions' ? '' : 'deductions')}
            >
              <div className="toggle-left">
                <Minus size={20} className="text-error" />
                <span>Deductions</span>
              </div>
              <div className="toggle-right">
                <span className="section-total text-error">- {formatCurrency(components.totalDeductions)}</span>
                {expandedSection === 'deductions' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </button>

            {expandedSection === 'deductions' && (
              <div className="section-content">
                <div className="component-row">
                  <div className="component-label">
                    <span>PF (Employee Contribution)</span>
                    <span className="percent">{editedSalary.pfPercent}% of Basic</span>
                  </div>
                  <div className="component-value">
                    {formatCurrency(components.pfDeduction)}
                  </div>
                </div>

                <div className="component-row">
                  <div className="component-label">
                    <span>Professional Tax</span>
                    <span className="percent">Fixed</span>
                  </div>
                  <div className="component-value">
                    {formatCurrency(components.professionalTax)}
                  </div>
                </div>

                <div className="component-row total">
                  <div className="component-label">
                    <span>Total Deductions</span>
                  </div>
                  <div className="component-value text-error">
                    - {formatCurrency(components.totalDeductions)}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Net Salary */}
          <div className="net-salary-card">
            <div>
              <span>Net Salary (Take Home)</span>
              <h2>{formatCurrency(components.netSalary)}</h2>
            </div>
          </div>

          {/* Rules */}
          <div className="rules-note">
            <Info size={18} />
            <div>
              <strong>Salary Structure Rules:</strong>
              <ul>
                <li>Total components must not exceed CTC (Fixed Wage)</li>
                <li>Percentage-based components auto-update when CTC changes</li>
                <li>Fixed Allowance is automatically recalculated to balance the structure</li>
                <li>PF is calculated on Basic salary only</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
