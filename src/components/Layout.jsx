import { NavLink, useNavigate, Outlet } from 'react-router-dom';
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
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Shield,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import './Layout.css';

export default function Layout() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { notifications, markNotificationRead } = useData();
  
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

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

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/employees', icon: Users, label: 'Employees' },
    { path: '/attendance', icon: Calendar, label: 'Attendance' },
    { path: '/time-off', icon: Plane, label: 'Time Off' },
    { path: '/salary', icon: DollarSign, label: 'Salary' },
    { path: '/payroll', icon: BarChart3, label: 'Payroll' },
    { path: '/reports', icon: FileText, label: 'Reports' },
  ];

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
            <div className="logo-icon">W</div>
            <span className="logo-text hide-mobile">Workora</span>
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
          {/* Role Badge */}
          <div className="role-badge hide-mobile">
            <Shield size={16} />
            <span className="role-text">{user?.role?.toUpperCase()}</span>
          </div>

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
                    {getInitials(`${user?.first_name} ${user?.last_name}` || 'U')}
                  </div>
                  <div>
                    <h4>{user?.first_name} {user?.last_name}</h4>
                    <p className="text-xs" style={{ fontFamily: 'monospace' }}>{user?.login_id}</p>
                    <span className="badge badge-info" style={{ textTransform: 'uppercase' }}>{user?.role}</span>
                  </div>
                </div>
                <div className="dropdown-divider" />
                <NavLink to="/change-password" className="dropdown-item" onClick={() => setShowProfileMenu(false)}>
                  <Lock size={18} />
                  <span>Change Password</span>
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
          <button className="mobile-nav-link" onClick={switchRole}>
            {user?.role === 'hr' ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
            <span>Switch to {user?.role === 'hr' ? 'Employee' : 'HR'} View</span>
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
