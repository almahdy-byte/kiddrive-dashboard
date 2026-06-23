import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role === 'admin') navigate('/');
      else if (user.role === 'driver') navigate('/driver');
      else if (user.role === 'parent') navigate('/parent');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>K</div>
          <h1 style={styles.title}>KidDrive</h1>
          <p style={styles.subtitle}>Admin Dashboard</p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={styles.links}>
          <Link to="/forgot-password" style={styles.link}>Forgot password?</Link>
        </div>
        <div style={styles.footer}>
          Don&apos;t have an account? <Link to="/register" style={styles.link}>Register</Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    background: '#f5f5f5',
  },
  card: {
    background: '#fff',
    borderRadius: '20px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    padding: '40px 32px',
    maxWidth: '400px',
    width: '100%',
  },
  logo: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  logoIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: '#F5B800',
    color: '#1a1a1a',
    fontSize: '28px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 12px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#1a1a1a',
    margin: 0,
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    marginTop: '4px',
  },
  error: {
    background: '#fee2e2',
    color: '#991b1b',
    padding: '12px 16px',
    borderRadius: '12px',
    fontSize: '14px',
    marginBottom: '20px',
    textAlign: 'center',
  },
  field: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: '#333',
    marginBottom: '6px',
  },
  btn: {
    width: '100%',
    padding: '12px 24px',
    border: 'none',
    borderRadius: '12px',
    fontWeight: 600,
    fontSize: '14px',
    background: '#F5B800',
    color: '#1a1a1a',
    cursor: 'pointer',
    marginTop: '8px',
    transition: 'background 0.2s',
  },
  links: {
    textAlign: 'center',
    marginTop: '16px',
  },
  link: {
    color: '#F5B800',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 500,
  },
  footer: {
    textAlign: 'center',
    marginTop: '20px',
    fontSize: '14px',
    color: '#666',
  },
};
