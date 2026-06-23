import { useAuth } from '../context/AuthContext';

export default function Header({ title, onMenuToggle }) {
  const { user, logout } = useAuth();

  return (
    <header className="header">
      <div className="header-left">
        <button className="header-hamburger" onClick={onMenuToggle} aria-label="Toggle menu">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="22" height="22">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
        <h1 className="header-title">{title}</h1>
      </div>
      <div className="header-right">
        <div className="header-user">
          <p className="header-user-name">{user?.fullName || 'Admin'}</p>
          <p className="header-user-role">{user?.role}</p>
        </div>
        <div className="header-avatar">{user?.fullName?.charAt(0) || 'A'}</div>
        <button className="header-logout" onClick={logout}>Logout</button>
      </div>
    </header>
  );
}
