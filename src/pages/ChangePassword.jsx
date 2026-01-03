import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Auth.css';

export default function ChangePassword() {
  const navigate = useNavigate();
  const { changePassword, user } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);

    try {
      const result = await changePassword(formData.newPassword);

      if (result.success) {
        toast.success('Password changed successfully!');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        toast.error(result.error || 'Failed to change password');
      }
    } catch (error) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card animate-scaleIn">
        <div className="auth-header">
          <div className="auth-logo" style={{ backgroundColor: 'var(--warning)' }}>
            <Shield size={32} color="white" />
          </div>
          <h1>Change Password</h1>
          <p>{user?.must_change_password ? 
            'You must change your temporary password' : 
            'Update your account password'}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {user?.must_change_password && (
            <div className="warning-banner">
              <Shield size={18} />
              <span>For security, you must change your temporary password before continuing.</span>
            </div>
          )}

          <div className="input-group">
            <label htmlFor="newPassword">New Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="newPassword"
                name="newPassword"
                className={`input has-icon ${errors.newPassword ? 'error' : ''}`}
                placeholder="Enter new password"
                value={formData.newPassword}
                onChange={handleChange}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.newPassword && (
              <span className="input-error">{errors.newPassword}</span>
            )}
            <span className="input-hint">Minimum 8 characters</span>
          </div>

          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                className={`input has-icon ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="input-error">{errors.confirmPassword}</span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Changing Password...
              </>
            ) : (
              'Change Password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
