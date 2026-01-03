import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, DollarSign, Save, Plus, Trash2, ArrowLeft } from 'lucide-react';
import './AdminEmployeePortal.css';

const AdminEmployeePortal = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('resume');
  const [loading, setLoading] = useState(true);
  const [employeeData, setEmployeeData] = useState({
    name: '',
    loginId: '',
    email: '',
    mobile: '',
    company: '',
    department: '',
    manager: '',
    location: '',
    about: '',
    jobDescription: '',
    interests: '',
    skills: [],
    certifications: []
  });

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

  // Fetch employee data on component mount
  useEffect(() => {
    if (employeeId) {
      fetchEmployeeData();
    }
  }, [employeeId]);

  const fetchEmployeeData = async () => {
    try {
      const response = await fetch(`/api/admin/employees/${employeeId}/profile`);
      if (response.ok) {
        const data = await response.json();
        if (data.employeeData) {
          setEmployeeData(data.employeeData);
        }
        if (data.salaryData) {
          setSalaryData(data.salaryData);
        }
      }
    } catch (error) {
      console.error('Error fetching employee data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals when salary components change
  useEffect(() => {
    const grossSalary = 
      parseFloat(salaryData.basicSalary || 0) +
      parseFloat(salaryData.hra || 0) +
      parseFloat(salaryData.standardAllowance || 0) +
      parseFloat(salaryData.performanceBonus || 0) +
      parseFloat(salaryData.lta || 0) +
      parseFloat(salaryData.fixedAllowance || 0);

    // Calculate PF based on basic salary
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

  const handleSalaryFieldChange = (field, value) => {
    setSalaryData(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  const addSkill = () => {
    setEmployeeData(prev => ({
      ...prev,
      skills: [...prev.skills, '']
    }));
  };

  const updateSkill = (index, value) => {
    setEmployeeData(prev => ({
      ...prev,
      skills: prev.skills.map((skill, i) => i === index ? value : skill)
    }));
  };

  const removeSkill = (index) => {
    setEmployeeData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const addCertification = () => {
    setEmployeeData(prev => ({
      ...prev,
      certifications: [...prev.certifications, '']
    }));
  };

  const updateCertification = (index, value) => {
    setEmployeeData(prev => ({
      ...prev,
      certifications: prev.certifications.map((cert, i) => i === index ? value : cert)
    }));
  };

  const removeCertification = (index) => {
    setEmployeeData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/admin/employees/${employeeId}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeData,
          salaryData
        })
      });

      if (response.ok) {
        alert('Data saved successfully!');
      } else {
        alert('Failed to save data. Please try again.');
      }
    } catch (error) {
      console.error('Error saving employee data:', error);
      alert('An error occurred while saving data.');
    }
  };

  const totalSalaryComponents = 
    parseFloat(salaryData.basicSalary || 0) +
    parseFloat(salaryData.hra || 0) +
    parseFloat(salaryData.standardAllowance || 0) +
    parseFloat(salaryData.performanceBonus || 0) +
    parseFloat(salaryData.lta || 0) +
    parseFloat(salaryData.fixedAllowance || 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading employee data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
            <button
              onClick={() => navigate('/admin/employees')}
              className="flex items-center gap-2 text-white hover:text-blue-100 mb-4 transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Employees
            </button>
            <h1 className="text-3xl font-bold">Admin - Employee Management</h1>
            <p className="text-blue-100 mt-2">Manage employee profiles and salary information</p>
          </div>

          {/* Tabs */}
          <div className="flex border-b bg-gray-50">
            <button
              onClick={() => setActiveTab('resume')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'resume'
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <User size={20} />
              Resume & Profile
            </button>
            <button
              onClick={() => setActiveTab('salary')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'salary'
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <DollarSign size={20} />
              Salary Information
            </button>
          </div>

          {/* Content */}
          <div className="p-8">
            {activeTab === 'resume' && (
              <div className="space-y-8">
                {/* Personal Information */}
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <User className="text-blue-600" size={24} />
                    Personal Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={employeeData.name}
                        onChange={(e) => setEmployeeData({...employeeData, name: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Login ID</label>
                      <input
                        type="text"
                        value={employeeData.loginId}
                        onChange={(e) => setEmployeeData({...employeeData, loginId: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter login ID"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={employeeData.email}
                        onChange={(e) => setEmployeeData({...employeeData, email: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter email"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mobile</label>
                      <input
                        type="tel"
                        value={employeeData.mobile}
                        onChange={(e) => setEmployeeData({...employeeData, mobile: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter mobile number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                      <input
                        type="text"
                        value={employeeData.company}
                        onChange={(e) => setEmployeeData({...employeeData, company: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter company"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                      <input
                        type="text"
                        value={employeeData.department}
                        onChange={(e) => setEmployeeData({...employeeData, department: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter department"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Manager</label>
                      <input
                        type="text"
                        value={employeeData.manager}
                        onChange={(e) => setEmployeeData({...employeeData, manager: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter manager name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                      <input
                        type="text"
                        value={employeeData.location}
                        onChange={(e) => setEmployeeData({...employeeData, location: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter location"
                      />
                    </div>
                  </div>
                </section>

                {/* Professional Details */}
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Professional Details</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">About</label>
                      <textarea
                        value={employeeData.about}
                        onChange={(e) => setEmployeeData({...employeeData, about: e.target.value})}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Write a brief description about the employee"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">What I love about my job</label>
                      <textarea
                        value={employeeData.jobDescription}
                        onChange={(e) => setEmployeeData({...employeeData, jobDescription: e.target.value})}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Describe what the employee loves about their job"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">My interests and hobbies</label>
                      <textarea
                        value={employeeData.interests}
                        onChange={(e) => setEmployeeData({...employeeData, interests: e.target.value})}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="List employee interests and hobbies"
                      />
                    </div>
                  </div>
                </section>

                {/* Skills */}
                <section>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Skills</h2>
                    <button
                      onClick={addSkill}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus size={16} />
                      Add Skill
                    </button>
                  </div>
                  <div className="space-y-3">
                    {employeeData.skills.map((skill, index) => (
                      <div key={index} className="flex gap-3">
                        <input
                          type="text"
                          value={skill}
                          onChange={(e) => updateSkill(index, e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter skill"
                        />
                        <button
                          onClick={() => removeSkill(index)}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Certifications */}
                <section>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Certifications</h2>
                    <button
                      onClick={addCertification}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus size={16} />
                      Add Certification
                    </button>
                  </div>
                  <div className="space-y-3">
                    {employeeData.certifications.map((cert, index) => (
                      <div key={index} className="flex gap-3">
                        <input
                          type="text"
                          value={cert}
                          onChange={(e) => updateCertification(index, e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter certification"
                        />
                        <button
                          onClick={() => removeCertification(index)}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'salary' && (
              <div className="space-y-8">
                {/* Wage Information */}
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

                {/* Salary Components */}
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

                {/* Tax Deductions */}
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

                {/* Salary Summary */}
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
              </div>
            )}

            {/* Save Button */}
            <div className="mt-8 flex justify-end">
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
};

export default AdminEmployeePortal;
