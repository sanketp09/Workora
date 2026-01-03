import { NavLink, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { 
  Home,
  Users,
  Calendar,
  Plane,
  DollarSign,
  BarChart3,
  FileText,
  Search,
  Bell,
  ChevronDown,
  User,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
  ToggleLeft,
  ToggleRight,
  Shield,
  ClipboardCheck,
  Wallet,
  Brain,
  ScrollText,
  Download
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import './Layout.css';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut, switchRole } = useAuth();
  const { notifications, markNotificationRead } = useData();
  
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;
  const isAdminView = location.pathname.startsWith('/admin');

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = () => {
    signOut();
    navigate('/signin');
  };

  const employeeNavItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/employees', icon: Users, label: 'Employees' },
    { path: '/attendance', icon: Calendar, label: 'Attendance' },
    { path: '/time-off', icon: Plane, label: 'Time Off' },
    { path: '/salary', icon: DollarSign, label: 'Salary' },
    { path: '/payroll', icon: BarChart3, label: 'Payroll' },
    { path: '/reports', icon: FileText, label: 'Reports' },
  ];

  const adminNavItems = [
    { path: '/admin/dashboard', icon: Shield, label: 'Control Center' },
    { path: '/admin/employees', icon: Users, label: 'Employees' },
    { path: '/admin/attendance', icon: Calendar, label: 'Attendance' },
    { path: '/admin/leave-approval', icon: ClipboardCheck, label: 'Leave Approval' },
    { path: '/admin/salary-config', icon: Wallet, label: 'Salary Config' },
    { path: '/admin/payroll-processing', icon: DollarSign, label: 'Payroll' },
    { path: '/admin/payroll-intelligence', icon: Brain, label: 'Intelligence' },
    { path: '/admin/audit-logs', icon: ScrollText, label: 'Audit Logs' },
    { path: '/admin/reports', icon: Download, label: 'Reports' },
  ];

  const navItems = isAdminView ? adminNavItems : employeeNavItems;

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="layout">
      {/* Top Navigation */}
      <header className="navbar">
        <div className="navbar-left">
          <button 
            className="mobile-menu-btn hide-desktop"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          <NavLink to="/dashboard" className="navbar-logo">
            <div className="logo-icon">D</div>
            <span className="logo-text hide-mobile">Dayflow</span>
          </NavLink>

          <nav className="navbar-nav hide-mobile">
            {navItems.map(item => (
              <NavLink 
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="navbar-center hide-mobile">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search employees by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="navbar-right">
          {/* View Switch Toggle */}
          <button 
            className={`role-switch hide-mobile ${isAdminView ? 'admin-active' : ''}`}
            onClick={() => navigate(isAdminView ? '/dashboard' : '/admin/dashboard')}
            title={`Switch to ${isAdminView ? 'Employee' : 'Admin'} view`}
          >
            {isAdminView ? (
              <Shield size={18} className="text-primary" />
            ) : (
              <User size={18} />
            )}
            <span>{isAdminView ? 'Admin Panel' : 'Employee View'}</span>
          </button>

          {/* Notifications */}
          <div className="notification-wrapper" ref={notifRef}>
            <button 
              className="icon-btn"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </button>

            {showNotifications && (
              <div className="dropdown-menu notification-menu animate-slideDown">
                <div className="dropdown-header">
                  <h3>Notifications</h3>
                  <span className="badge badge-info">{unreadCount} new</span>
                </div>
                <div className="notification-list">
                  {notifications.map(notif => (
                    <div 
                      key={notif.id}
                      className={`notification-item ${!notif.read ? 'unread' : ''}`}
                      onClick={() => markNotificationRead(notif.id)}
                    >
                      <div className="notification-content">
                        <p>{notif.message}</p>
                        <span className="notification-time">{notif.time}</span>
                      </div>
                      {!notif.read && <span className="unread-dot" />}
                    </div>
                  ))}
                </div>
                <div className="dropdown-footer">
                  <button className="btn btn-ghost btn-sm">View all notifications</button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Menu */}
          <div className="profile-wrapper" ref={profileRef}>
            <button 
              className="profile-btn"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div className="avatar">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} />
                ) : (
                  getInitials(user?.name || 'U')
                )}
              </div>
              <span className="profile-name hide-mobile">{user?.name}</span>
              <ChevronDown size={16} className="hide-mobile" />
            </button>

            {showProfileMenu && (
              <div className="dropdown-menu profile-menu animate-slideDown">
                <div className="profile-header">
                  <div className="avatar avatar-lg">
                    {getInitials(user?.name || 'U')}
                  </div>
                  <div>
                    <h4>{user?.name}</h4>
                    <p>{user?.email}</p>
                    <span className="badge badge-info">{user?.role === 'hr' ? 'HR Admin' : 'Employee'}</span>
                  </div>
                </div>
                <div className="dropdown-divider" />
                <NavLink to="/profile" className="dropdown-item" onClick={() => setShowProfileMenu(false)}>
                  <User size={18} />
                  <span>My Profile</span>
                </NavLink>
                <NavLink to="/settings" className="dropdown-item" onClick={() => setShowProfileMenu(false)}>
                  <Settings size={18} />
                  <span>Settings</span>
                </NavLink>
                <NavLink to="/help" className="dropdown-item" onClick={() => setShowProfileMenu(false)}>
                  <HelpCircle size={18} />
                  <span>Help & Support</span>
                </NavLink>
                <div className="dropdown-divider" />
                <button className="dropdown-item text-error" onClick={handleSignOut}>
                  <LogOut size={18} />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      {showMobileMenu && (
        <div className="mobile-nav animate-slideDown">
          {navItems.map(item => (
            <NavLink 
              key={item.path}
              to={item.path}
              className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setShowMobileMenu(false)}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
          <div className="mobile-nav-divider" />
          <button 
            className="mobile-nav-link" 
            onClick={() => {
              navigate(isAdminView ? '/dashboard' : '/admin/dashboard');
              setShowMobileMenu(false);
            }}
          >
            {isAdminView ? <User size={20} /> : <Shield size={20} />}
            <span>Switch to {isAdminView ? 'Employee' : 'Admin'} View</span>
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
