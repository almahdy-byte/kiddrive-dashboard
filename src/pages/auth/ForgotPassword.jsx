import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await api.post('/auth/forget-password', { email });
      setMessage('OTP sent to your email');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await api.post('/auth/verify-reset-otp', { email, otp });
      setMessage('OTP verified. Set your new password.');
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, password });
      setMessage('Password reset successfully! Redirecting to login...');
      setTimeout(() => window.location.assign('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>K</div>
          <h1 style={styles.title}>Reset Password</h1>
          <p style={styles.subtitle}>
            {step === 1 && 'Enter your email to receive an OTP'}
            {step === 2 && 'Enter the OTP sent to your email'}
            {step === 3 && 'Choose a new password'}
          </p>
        </div>

        <div style={styles.steps}>
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              style={{
                ...styles.stepDot,
                background: step >= s ? '#F5B800' : '#e0e0e0',
                color: step >= s ? '#1a1a1a' : '#999',
              }}
            >
              {s}
            </div>
          ))}
        </div>

        {error && <div style={styles.error}>{error}</div>}
        {message && <div style={styles.success}>{message}</div>}

        {step === 1 && (
          <form onSubmit={handleEmailSubmit}>
            <div style={styles.field}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleOtpSubmit}>
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
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetSubmit}>
            <div style={styles.field}>
              <label style={styles.label}>New Password</label>
              <input
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                required
                minLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <div style={styles.footer}>
          <Link to="/login" style={styles.link}>Back to login</Link>
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
    marginBottom: '24px',
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
    marginTop: '6px',
  },
  steps: {
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '24px',
  },
  stepDot: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 600,
    transition: 'all 0.3s',
  },
  error: {
    background: '#fee2e2',
    color: '#991b1b',
    padding: '12px 16px',
    borderRadius: '12px',
    fontSize: '14px',
    marginBottom: '16px',
    textAlign: 'center',
  },
  success: {
    background: '#dcfce7',
    color: '#166534',
    padding: '12px 16px',
    borderRadius: '12px',
    fontSize: '14px',
    marginBottom: '16px',
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
