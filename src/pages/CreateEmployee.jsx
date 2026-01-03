import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Mail, User, Calendar, Shield, ArrowLeft, Copy, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Employees.css';

export default function CreateEmployee() {
  const navigate = useNavigate();
  const { createEmployee } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    year_of_joining: new Date().getFullYear(),
    role: 'employee'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success(`${field} copied to clipboard!`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await createEmployee(formData);
      
      if (result.success) {
        setGeneratedCredentials({
          login_id: result.login_id,
          password: result.password
        });
        toast.success('Employee created successfully!');
        
        // Reset form after showing credentials
        setTimeout(() => {
          setFormData({
            first_name: '',
            last_name: '',
            email: '',
            year_of_joining: new Date().getFullYear(),
            role: 'employee'
          });
        }, 500);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to create employee');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewEmployee = () => {
    setGeneratedCredentials(null);
  };

  if (generatedCredentials) {
    return (
      <div className="page-container animate-fadeIn">
        <div className="page-header">
          <button onClick={() => navigate('/employees')} className="btn-back">
            <ArrowLeft size={20} />
            Back to Employees
          </button>
        </div>

        <div className="success-card">
          <div className="success-icon">
            <Check size={48} />
          </div>
          
          <h1>Employee Created Successfully!</h1>
          <p className="success-subtitle">Share these credentials securely with the new employee</p>

          <div className="credentials-container">
            <div className="credential-box">
              <label>Login ID</label>
              <div className="credential-value">
                <code>{generatedCredentials.login_id}</code>
                <button
                  onClick={() => copyToClipboard(generatedCredentials.login_id, 'Login ID')}
                  className="btn-icon"
                  title="Copy Login ID"
                >
                  {copiedField === 'Login ID' ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
            </div>

            <div className="credential-box">
              <label>Temporary Password</label>
              <div className="credential-value">
                <code>{generatedCredentials.password}</code>
                <button
                  onClick={() => copyToClipboard(generatedCredentials.password, 'Password')}
                  className="btn-icon"
                  title="Copy Password"
                >
                  {copiedField === 'Password' ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
            </div>
          </div>

          <div className="warning-box">
            <p>⚠️ <strong>Important:</strong> The employee must change their password on first login.</p>
            <p>These credentials will only be shown once. Make sure to save them securely.</p>
          </div>

          <div className="action-buttons">
            <button onClick={handleNewEmployee} className="btn btn-primary">
              <UserPlus size={20} />
              Create Another Employee
            </button>
            <button onClick={() => navigate('/employees')} className="btn btn-secondary">
              View All Employees
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container animate-fadeIn">
      <div className="page-header">
        <button onClick={() => navigate('/employees')} className="btn-back">
          <ArrowLeft size={20} />
          Back to Employees
        </button>
        <h1>Create New Employee</h1>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit} className="employee-form">
          <div className="form-row">
            <div className="input-group">
              <label htmlFor="first_name">
                <User size={18} />
                First Name *
              </label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                placeholder="John"
                className="input"
              />
            </div>

            <div className="input-group">
              <label htmlFor="last_name">
                <User size={18} />
                Last Name *
              </label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                placeholder="Doe"
                className="input"
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="email">
              <Mail size={18} />
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="john.doe@company.com"
              className="input"
            />
          </div>

          <div className="form-row">
            <div className="input-group">
              <label htmlFor="year_of_joining">
                <Calendar size={18} />
                Year of Joining *
              </label>
              <input
                type="number"
                id="year_of_joining"
                name="year_of_joining"
                value={formData.year_of_joining}
                onChange={handleChange}
                required
                min="2020"
                max="2030"
                className="input"
              />
            </div>

            <div className="input-group">
              <label htmlFor="role">
                <Shield size={18} />
                Role *
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="input"
              >
                <option value="employee">Employee</option>
                <option value="hr">HR</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="info-box">
            <p><strong>Login ID Format:</strong> OI + First2Letters + Last2Letters + Year + Serial</p>
            <p className="example">Example: {formData.first_name && formData.last_name ? 
              `OI${formData.first_name.substring(0,2).toUpperCase()}${formData.last_name.substring(0,2).toUpperCase()}${formData.year_of_joining}####` 
              : 'OIJODO2024####'}</p>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Creating Employee...
              </>
            ) : (
              <>
                <UserPlus size={20} />
                Create Employee
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
