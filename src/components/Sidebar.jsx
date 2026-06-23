import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: '📊' },
  { to: '/admin/applications', label: 'Applications', icon: '📋' },
  { to: '/admin/drivers', label: 'Drivers', icon: '🚗' },
  { to: '/admin/parents', label: 'Parents & Children', icon: '👨‍👩‍👧‍👦' },
  { to: '/admin/subscriptions', label: 'Subscriptions', icon: '📄' },
  { to: '/admin/trips', label: 'Trips', icon: '🗺️' },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {isOpen && <div onClick={onClose} className="sidebar-overlay" />}
      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-header-row">
            <h2 className="sidebar-logo">🚗 KidDrive</h2>
            <button onClick={onClose} className="sidebar-close-btn">&times;</button>
          </div>
          <p className="sidebar-sub">Admin Dashboard</p>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`}
              onClick={onClose}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <p>KidDrive v1.0</p>
        </div>
      </aside>
    </>
  );
}
