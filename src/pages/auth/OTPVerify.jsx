import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';

export default function OTPVerify() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-email', { email, otp });
      localStorage.setItem('accessToken', data.data.tokens.accessToken);
      localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>K</div>
          <h1 style={styles.title}>Verify Email</h1>
          <p style={styles.subtitle}>
            Enter the OTP sent to <strong>{email}</strong>
          </p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>OTP Code</label>
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="input-field"
              maxLength={6}
              required
              style={{ textAlign: 'center', fontSize: '20px', letterSpacing: '8px' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        <div style={styles.footer}>
          <a href="/login" style={styles.link}>Back to login</a>
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
    marginTop: '8px',
    lineHeight: 1.5,
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
    textAlign: 'center',
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
