import { useAuth } from '../context/AuthContext';

const headerStyle = {
  background: '#fff',
  padding: '16px 32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  position: 'sticky',
  top: 0,
  zIndex: 50,
};

export default function Header({ title }) {
  const { user, logout } = useAuth();

  return (
    <header style={headerStyle}>
      <h1 style={{ fontSize: 20, fontWeight: 600 }}>{title}</h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 14, fontWeight: 500 }}>{user?.fullName || 'Admin'}</p>
          <p style={{ fontSize: 12, color: '#666', textTransform: 'capitalize' }}>{user?.role}</p>
        </div>
        <div className="avatar">{user?.fullName?.charAt(0) || 'A'}</div>
        <button
          onClick={logout}
          style={{
            background: 'none',
            border: '1.5px solid #e0e0e0',
            borderRadius: 8,
            padding: '8px 12px',
            fontSize: 13,
            color: '#666',
          }}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
