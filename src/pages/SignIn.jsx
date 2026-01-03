import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, IdCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Auth.css';

export default function SignIn() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const toast = useToast();
  
  const [formData, setFormData] = useState({
    loginId: '',
    password: '',
    rememberMe: false,
  });
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.loginId.trim()) {
      newErrors.loginId = 'Login ID is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsLoading(true);
    
    const result = await signIn(formData.loginId, formData.password);
    
    if (result.success) {
      toast.success('Welcome back!');
      navigate('/dashboard');
    } else {
      toast.error(result.error);
      setErrors({ general: result.error });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card animate-scaleIn">
        <div className="auth-header">
          <div className="auth-logo">
            <div className="logo-icon">W</div>
            <span className="logo-text">Workora</span>
          </div>
          <h1>Welcome back</h1>
          <p>Sign in with your employee credentials</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {errors.general && (
            <div className="auth-error-banner">
              {errors.general}
            </div>
          )}

          <div className="input-group">
            <label htmlFor="loginId">Login ID</label>
            <div className="input-wrapper">
              <IdCard size={18} className="input-icon" />
              <input
                type="text"
                id="loginId"
                name="loginId"
                className={`input has-icon ${errors.loginId ? 'error' : ''}`}
                placeholder="OIJODO20220001"
                value={formData.loginId}
                onChange={handleChange}
                style={{ textTransform: 'uppercase' }}
              />
            </div>
            {errors.loginId && (
              <span className="input-error">{errors.loginId}</span>
            )}
            <span className="input-hint">Format: OI + First2 + Last2 + Year + Serial</span>
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                className={`input has-icon has-icon-right ${errors.password ? 'error' : ''}`}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="input-icon-right"
                onClick={() => setShowPassword(!showPassword)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <span className="input-error">{errors.password}</span>
            )}
          </div>

          <div className="auth-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <span className="checkmark"></span>
              <span>Remember me</span>
            </label>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-lg w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="demo-credentials">
          <p><strong>Test Credentials:</strong></p>
          <p className="credential-item">Login ID: <code>OIADMI20220001</code></p>
          <p className="credential-item">Password: <code>Admin@123</code></p>
          <p className="note">⚠️ Make sure the backend server is running on port 3000</p>
        </div>
      </div>
    </div>
  );
}
