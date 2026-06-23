import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import LocationPicker from '../../components/LocationPicker';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    userName: '',
    email: '',
    password: '',
    phone: '',
    nationalId: '',
    carModel: '',
    plateNumber: '',
    carColor: '',
  });
  const [location, setLocation] = useState({
    lat: '',
    lng: '',
    city: '',
    department: '',
    address: '',
  });
  const [files, setFiles] = useState({
    licenseImage: null,
    nationalIdImage: null,
    governmentDocuments: null,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFile = (e) => setFiles({ ...files, [e.target.name]: e.target.files[0] });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== '') fd.append(k, v);
      });
      Object.entries(location).forEach(([k, v]) => {
        if (v !== '') {
          const key = k === 'lat' ? 'latitude' : k === 'lng' ? 'longitude' : k;
          fd.append(key, v);
        }
      });
      Object.entries(files).forEach(([k, v]) => {
        if (v) fd.append(k, v);
      });

      await axios.post('https://kid-drive-mq3b.vercel.app/driver/apply', fd);
      setSuccess('Application submitted successfully! Please wait for admin approval.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Application submission failed');
    } finally {
      setLoading(false);
    }
  };

  const textFields = [
    { name: 'userName', label: 'Full Name', type: 'text' },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'password', label: 'Password', type: 'password' },
    { name: 'phone', label: 'Phone', type: 'tel' },
    { name: 'nationalId', label: 'National ID', type: 'text' },
    { name: 'carModel', label: 'Car Model', type: 'text' },
    { name: 'plateNumber', label: 'Plate Number', type: 'text' },
    { name: 'carColor', label: 'Car Color', type: 'text' },
  ];

  const fileFields = [
    { name: 'licenseImage', label: 'License Image' },
    { name: 'nationalIdImage', label: 'National ID Image' },
    { name: 'governmentDocuments', label: 'Government Documents' },
  ];

  const handleLocationChange = (newLoc) => setLocation(newLoc);

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>K</div>
          <h1 style={styles.title}>Apply as Driver</h1>
          <p style={styles.subtitle}>Join KidDrive</p>
        </div>

        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}

        <form onSubmit={handleSubmit}>
          {textFields.map((f) => (
            <div style={styles.field} key={f.name}>
              <label style={styles.label}>{f.label}</label>
              <input
                type={f.type}
                name={f.name}
                placeholder={`Enter ${f.label.toLowerCase()}`}
                value={form[f.name]}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
          ))}

          <div style={styles.divider}>Location</div>
          <LocationPicker value={location} onChange={handleLocationChange} />

          <div style={styles.divider}>Upload Documents</div>

          {fileFields.map((f) => (
            <div style={styles.field} key={f.name}>
              <label style={styles.label}>{f.label}</label>
              <input
                type="file"
                name={f.name}
                accept="image/*,.pdf"
                onChange={handleFile}
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
            {loading ? 'Submitting...' : 'Submit Application'}
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
    maxWidth: '560px',
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
  success: {
    background: '#dcfce7',
    color: '#166534',
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
  divider: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    margin: '20px 0 14px',
    paddingBottom: '6px',
    borderBottom: '1px solid #eee',
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
