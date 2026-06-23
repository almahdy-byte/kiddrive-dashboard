import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    city: '',
    department: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      navigate(`/verify-otp?email=${encodeURIComponent(form.email)}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'firstName', label: 'First Name', type: 'text' },
    { name: 'lastName', label: 'Last Name', type: 'text' },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'password', label: 'Password', type: 'password' },
    { name: 'phone', label: 'Phone', type: 'tel' },
    { name: 'city', label: 'City', type: 'text' },
    { name: 'department', label: 'Department', type: 'text' },
  ];

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>K</div>
          <h1 style={styles.title}>Create Account</h1>
          <p style={styles.subtitle}>Join KidDrive</p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {fields.map((f) => (
            <div style={styles.field} key={f.name}>
              <label style={styles.label}>{f.label}</label>
              <input
                type={f.type}
                name={f.name}
                placeholder={`Enter your ${f.label.toLowerCase()}`}
                value={form[f.name]}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div style={styles.footer}>
          Already have an account? <Link to="/login" style={styles.link}>Sign in</Link>
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
    marginBottom: '28px',
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
    fontSize: '22px',
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
    marginBottom: '14px',
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
  link: {
    color: '#F5B800',
    textDecoration: 'none',
    fontWeight: 500,
  },
  footer: {
    textAlign: 'center',
    marginTop: '20px',
    fontSize: '14px',
    color: '#666',
  },
};
