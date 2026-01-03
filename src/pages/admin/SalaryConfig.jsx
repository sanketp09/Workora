import { useState, useEffect } from 'react';
import { 
  DollarSign,
  Save,
  Search,
  Edit2,
  Check
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import './SalaryConfig.css';

export default function SalaryConfig() {
  const { employees, getEmployeeSalary } = useData();
  const toast = useToast();
  
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

  const employee = employees.find(e => e.id === selectedEmployee);

  // Fetch salary data when employee changes
  useEffect(() => {
    const fetchSalary = async () => {
      if (selectedEmployee && getEmployeeSalary) {
        try {
          const data = await getEmployeeSalary(selectedEmployee);
          if (data) {
            setSalaryData(prev => ({
              ...prev,
              basicSalary: data.basic || data.basicSalary || 0,
              hra: data.hra || 0,
              standardAllowance: data.allowance || data.standardAllowance || 0,
              performanceBonus: data.bonus || data.performanceBonus || 0,
              lta: data.lta || 0,
              fixedAllowance: data.fixedAllowance || 0,
              monthlyWage: data.wage || data.monthlyWage || 0
            }));
          }
        } catch (error) {
          console.error('Error fetching salary:', error);
        }
      }
    };
    fetchSalary();
  }, [selectedEmployee, getEmployeeSalary]);

  // Calculate totals when salary components change
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

  return (
    <div className="salary-config animate-fadeIn">
      {/* Header */}
      <div className="admin-header">
        <div>
          <h1>Salary Configuration</h1>
          <p>Configure detailed salary components for employees</p>
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

        {/* Salary Configuration Panel */}
        <div className="salary-details-panel card">
          <h2 className="panel-title">Salary Details for {employee?.name}</h2>
          
          <div className="space-y-8">
            {/* Wage Information */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Wage Information</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Wage (?)</label>
                    <input
                      type="number"
                      value={salaryData.monthlyWage}
                      readOnly
                      className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg"
                    />
                    <p className="text-xs text-gray-500 mt-1">Calculated from salary components</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Yearly Wage (?)</label>
                    <input
                      type="number"
                      value={salaryData.yearlyWage}
                      readOnly
                      className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg"
                    />
                    <p className="text-xs text-gray-500 mt-1">Monthly wage  12</p>
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

            {/* Salary Components */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Salary Components</h2>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Basic Salary (?/month)</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">House Rent Allowance (?/month)</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Standard Allowance (?/month)</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Performance Bonus (?/month)</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Leave Travel Allowance (?/month)</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fixed Allowance (?/month)</label>
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
                    <span className="text-2xl font-bold text-blue-600">?{totalSalaryComponents.toFixed(2)}</span>
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

            {/* Provident Fund */}
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Employee PF (?/month)</label>
                    <input
                      type="number"
                      value={salaryData.pfEmployee}
                      readOnly
                      className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Employer PF (?/month)</label>
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

            {/* Tax Deductions */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Tax Deductions</h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Professional Tax (?)</label>
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

            {/* Salary Summary */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Salary Summary</h2>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Gross Salary:</span>
                    <span className="text-xl font-bold text-gray-900">?{totalSalaryComponents.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Total Deductions:</span>
                    <span className="text-xl font-bold text-red-600">?{(salaryData.pfEmployee + salaryData.professionalTax).toFixed(2)}</span>
                  </div>
                  <div className="md:col-span-2 border-t border-blue-300 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Net Salary (Take Home):</span>
                      <span className="text-2xl font-bold text-green-600">
                        ?{(totalSalaryComponents - salaryData.pfEmployee - salaryData.professionalTax).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Save Button */}
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
  );
}
