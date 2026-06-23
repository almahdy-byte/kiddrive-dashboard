import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: '📊' },
  { to: '/admin/applications', label: 'Applications', icon: '📋' },
  { to: '/admin/drivers', label: 'Drivers', icon: '🚗' },
  { to: '/admin/parents', label: 'Parents & Children', icon: '👨‍👩‍👧‍👦' },
  { to: '/admin/subscriptions', label: 'Subscriptions', icon: '📄' },
  { to: '/admin/trips', label: 'Trips', icon: '🗺️' },

];

const sidebarStyle = {
  width: 250,
  background: '#1a1a1a',
  color: '#fff',
  padding: '24px 0',
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  position: 'fixed',
  left: 0,
  top: 0,
  zIndex: 100,
};

const logoStyle = {
  padding: '0 20px 24px',
  borderBottom: '1px solid #333',
  marginBottom: 16,
};

const linkStyle = (isActive) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '12px 20px',
  color: isActive ? '#F5B800' : '#aaa',
  textDecoration: 'none',
  fontSize: 14,
  fontWeight: isActive ? 600 : 400,
  background: isActive ? 'rgba(245, 184, 0, 0.1)' : 'transparent',
  borderRight: isActive ? '3px solid #F5B800' : '3px solid transparent',
  transition: 'all 0.2s',
});

export default function Sidebar() {
  return (
    <aside style={sidebarStyle}>
      <div style={logoStyle}>
        <h2 style={{ color: '#F5B800', fontSize: 20, margin: 0 }}>🚗 KidDrive</h2>
        <p style={{ color: '#666', fontSize: 12, marginTop: 4 }}>Admin Dashboard</p>
      </div>
      <nav style={{ flex: 1, overflowY: 'auto' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/admin'}
            style={({ isActive }) => linkStyle(isActive)}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div style={{ padding: '16px 20px', borderTop: '1px solid #333' }}>
        <p style={{ color: '#666', fontSize: 12 }}>KidDrive v1.0</p>
      </div>
    </aside>
  );
}
