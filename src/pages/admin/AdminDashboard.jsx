import React, { useState } from 'react';
import { 
  Settings, Calendar, Clock, Bell, Shield, Database, 
  RefreshCw, Activity, CheckCircle, Save, RotateCcw,
  Mail, Phone, MapPin, Lock, Eye, EyeOff, Users,
  FileText, AlertCircle, Sliders
} from 'lucide-react';

export default function AdminDashboard() {
  // Control Center Settings
  const [controlSettings, setControlSettings] = useState({
    autoApproveLeaves: false,
    maxLeaveDays: 30,
    requireApprovalAbove: 5,
    attendanceReminderTime: '09:00',
    enableEmailNotifications: true,
    enableSMSNotifications: false,
    allowSelfCheckIn: true,
    requireLocationTracking: false,
    salaryVisibility: 'admin-only',
    documentRetention: 90,
    backupFrequency: 'daily',
    twoFactorAuth: true,
    sessionTimeout: 30,
    passwordExpiry: 90,
    minPasswordLength: 8,
    maxLoginAttempts: 5,
    enableAuditLogs: true,
    dataEncryption: true
  });

  const handleSettingChange = (setting, value) => {
    setControlSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const saveSettings = () => {
    console.log('Saving settings:', controlSettings);
    alert('Settings saved successfully!');
  };

  const resetToDefaults = () => {
    if (window.confirm('Are you sure you want to reset all settings to default values?')) {
      setControlSettings({
        autoApproveLeaves: false,
        maxLeaveDays: 30,
        requireApprovalAbove: 5,
        attendanceReminderTime: '09:00',
        enableEmailNotifications: true,
        enableSMSNotifications: false,
        allowSelfCheckIn: true,
        requireLocationTracking: false,
        salaryVisibility: 'admin-only',
        documentRetention: 90,
        backupFrequency: 'daily',
        twoFactorAuth: true,
        sessionTimeout: 30,
        passwordExpiry: 90,
        minPasswordLength: 8,
        maxLoginAttempts: 5,
        enableAuditLogs: true,
        dataEncryption: true
      });
      alert('Settings reset to defaults!');
    }
  };

  const triggerBackup = () => {
    alert('Backup initiated successfully!');
  };

  const ToggleSwitch = ({ enabled, onChange }) => (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-green-600' : 'bg-gray-300'
      }`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        enabled ? 'translate-x-6' : 'translate-x-1'
      }`} />
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-3 rounded-xl shadow-lg">
                <Settings className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Control Center</h1>
                <p className="text-gray-600 text-sm">System configuration and management</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={resetToDefaults}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                <RotateCcw size={18} />
                Reset
              </button>
              <button
                onClick={saveSettings}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-colors font-medium shadow-md"
              >
                <Save size={18} />
                Save All
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Leave Management Settings */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Calendar className="text-blue-600" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Leave Management Settings</h2>
                <p className="text-sm text-gray-600">Configure leave policies and approval workflows</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <label className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-sm font-medium text-gray-900">Auto-approve leaves</span>
                    <p className="text-xs text-gray-500 mt-1">Automatically approve leaves under certain conditions</p>
                  </div>
                  <ToggleSwitch 
                    enabled={controlSettings.autoApproveLeaves}
                    onChange={(val) => handleSettingChange('autoApproveLeaves', val)}
                  />
                </label>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Max leave days per year
                </label>
                <input
                  type="number"
                  value={controlSettings.maxLeaveDays}
                  onChange={(e) => handleSettingChange('maxLeaveDays', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Require approval for leaves above (days)
                </label>
                <input
                  type="number"
                  value={controlSettings.requireApprovalAbove}
                  onChange={(e) => handleSettingChange('requireApprovalAbove', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Attendance Settings */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-green-100 p-2 rounded-lg">
                <Clock className="text-green-600" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Attendance Settings</h2>
                <p className="text-sm text-gray-600">Manage attendance tracking and check-in policies</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Attendance reminder time
                </label>
                <input
                  type="time"
                  value={controlSettings.attendanceReminderTime}
                  onChange={(e) => handleSettingChange('attendanceReminderTime', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <label className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-sm font-medium text-gray-900">Allow self check-in</span>
                    <p className="text-xs text-gray-500 mt-1">Allow employees to mark their own attendance</p>
                  </div>
                  <ToggleSwitch 
                    enabled={controlSettings.allowSelfCheckIn}
                    onChange={(val) => handleSettingChange('allowSelfCheckIn', val)}
                  />
                </label>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <label className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-sm font-medium text-gray-900">Require location tracking</span>
                    <p className="text-xs text-gray-500 mt-1">Track employee location during check-in</p>
                  </div>
                  <ToggleSwitch 
                    enabled={controlSettings.requireLocationTracking}
                    onChange={(val) => handleSettingChange('requireLocationTracking', val)}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-yellow-100 p-2 rounded-lg">
                <Bell className="text-yellow-600" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Notification Settings</h2>
                <p className="text-sm text-gray-600">Configure notification channels and preferences</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <label className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Mail size={18} className="text-gray-600" />
                    <div>
                      <span className="text-sm font-medium text-gray-900">Email notifications</span>
                      <p className="text-xs text-gray-500 mt-1">Send email notifications for important events</p>
                    </div>
                  </div>
                  <ToggleSwitch 
                    enabled={controlSettings.enableEmailNotifications}
                    onChange={(val) => handleSettingChange('enableEmailNotifications', val)}
                  />
                </label>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <label className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Phone size={18} className="text-gray-600" />
                    <div>
                      <span className="text-sm font-medium text-gray-900">SMS notifications</span>
                      <p className="text-xs text-gray-500 mt-1">Send SMS notifications for urgent matters</p>
                    </div>
                  </div>
                  <ToggleSwitch 
                    enabled={controlSettings.enableSMSNotifications}
                    onChange={(val) => handleSettingChange('enableSMSNotifications', val)}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Security & Privacy Settings */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-red-100 p-2 rounded-lg">
                <Shield className="text-red-600" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Security & Privacy Settings</h2>
                <p className="text-sm text-gray-600">Configure security policies and access controls</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Salary visibility
                </label>
                <select
                  value={controlSettings.salaryVisibility}
                  onChange={(e) => handleSettingChange('salaryVisibility', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="admin-only">Admin Only</option>
                  <option value="hr-and-admin">HR & Admin</option>
                  <option value="self-and-admin">Self & Admin</option>
                </select>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <label className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-sm font-medium text-gray-900">Two-factor authentication</span>
                    <p className="text-xs text-gray-500 mt-1">Require 2FA for admin accounts</p>
                  </div>
                  <ToggleSwitch 
                    enabled={controlSettings.twoFactorAuth}
                    onChange={(val) => handleSettingChange('twoFactorAuth', val)}
                  />
                </label>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Session timeout (minutes)
                </label>
                <input
                  type="number"
                  value={controlSettings.sessionTimeout}
                  onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Password expiry (days)
                </label>
                <input
                  type="number"
                  value={controlSettings.passwordExpiry}
                  onChange={(e) => handleSettingChange('passwordExpiry', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Minimum password length
                </label>
                <input
                  type="number"
                  value={controlSettings.minPasswordLength}
                  onChange={(e) => handleSettingChange('minPasswordLength', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Max login attempts
                </label>
                <input
                  type="number"
                  value={controlSettings.maxLoginAttempts}
                  onChange={(e) => handleSettingChange('maxLoginAttempts', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <label className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-sm font-medium text-gray-900">Enable audit logs</span>
                    <p className="text-xs text-gray-500 mt-1">Track all system changes</p>
                  </div>
                  <ToggleSwitch 
                    enabled={controlSettings.enableAuditLogs}
                    onChange={(val) => handleSettingChange('enableAuditLogs', val)}
                  />
                </label>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <label className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-sm font-medium text-gray-900">Data encryption</span>
                    <p className="text-xs text-gray-500 mt-1">Encrypt sensitive data at rest</p>
                  </div>
                  <ToggleSwitch 
                    enabled={controlSettings.dataEncryption}
                    onChange={(val) => handleSettingChange('dataEncryption', val)}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Data Management Settings */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Database className="text-purple-600" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Data Management</h2>
                <p className="text-sm text-gray-600">Configure backup and data retention policies</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Document retention period (days)
                </label>
                <input
                  type="number"
                  value={controlSettings.documentRetention}
                  onChange={(e) => handleSettingChange('documentRetention', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Backup frequency
                </label>
                <select
                  value={controlSettings.backupFrequency}
                  onChange={(e) => handleSettingChange('backupFrequency', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <button 
                  onClick={triggerBackup}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full md:w-auto"
                >
                  <RefreshCw size={18} />
                  Trigger Manual Backup
                </button>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-indigo-100 p-2 rounded-lg">
                <Activity className="text-indigo-600" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">System Status</h2>
                <p className="text-sm text-gray-600">Monitor system health and performance</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-green-200 bg-green-50 rounded-lg p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">Database</span>
                  <CheckCircle className="text-green-600" size={24} />
                </div>
                <div className="text-2xl font-bold text-green-600 mb-1">Healthy</div>
                <p className="text-xs text-gray-600">Last backup: 2 hours ago</p>
                <p className="text-xs text-gray-600">Storage: 45.2 GB / 100 GB</p>
              </div>

              <div className="border border-green-200 bg-green-50 rounded-lg p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">Server</span>
                  <CheckCircle className="text-green-600" size={24} />
                </div>
                <div className="text-2xl font-bold text-green-600 mb-1">Online</div>
                <p className="text-xs text-gray-600">Uptime: 99.9%</p>
                <p className="text-xs text-gray-600">Memory: 62% used</p>
              </div>

              <div className="border border-green-200 bg-green-50 rounded-lg p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">API</span>
                  <CheckCircle className="text-green-600" size={24} />
                </div>
                <div className="text-2xl font-bold text-green-600 mb-1">Active</div>
                <p className="text-xs text-gray-600">Response: 45ms</p>
                <p className="text-xs text-gray-600">Requests: 12.5k/hour</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
