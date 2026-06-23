import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

export default function EditChild() {
  const { childId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: '',
    age: '',
    gender: '',
    school: '',
    schoolLocation: { lat: '', lng: '', address: '' },
    schedule: { arriveTime: '', backHomeTime: '' },
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [existingAvatar, setExistingAvatar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchChild();
  }, [childId]);

  const fetchChild = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/parent/${childId}`);
      const child = data.data?.child || data.data;
      setForm({
        name: child.name || '',
        age: child.age ?? '',
        gender: child.gender || '',
        school: child.school || '',
        schoolLocation: {
          lat: child.schoolLocation?.lat ?? '',
          lng: child.schoolLocation?.lng ?? '',
          address: child.schoolLocation?.address || '',
        },
        schedule: {
          arriveTime: child.schedule?.arriveTime || '',
          backHomeTime: child.schedule?.backHomeTime || '',
        },
      });
      if (child.profileImage) {
        setExistingAvatar(child.profileImage);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load child data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('schoolLocation.')) {
      const key = name.split('.')[1];
      setForm((prev) => ({
        ...prev,
        schoolLocation: { ...prev.schoolLocation, [key]: value },
      }));
    } else if (name.startsWith('schedule.')) {
      const key = name.split('.')[1];
      setForm((prev) => ({
        ...prev,
        schedule: { ...prev.schedule, [key]: value },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.age || form.age <= 0) errs.age = 'Valid age is required';
    if (!form.gender) errs.gender = 'Gender is required';
    if (!form.school.trim()) errs.school = 'School is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        name: form.name.trim(),
        age: Number(form.age),
        gender: form.gender,
        school: form.school.trim(),
        schoolLocation: {
          lat: form.schoolLocation.lat ? Number(form.schoolLocation.lat) : undefined,
          lng: form.schoolLocation.lng ? Number(form.schoolLocation.lng) : undefined,
          address: form.schoolLocation.address.trim() || undefined,
        },
        schedule: {
          arriveTime: form.schedule.arriveTime || undefined,
          backHomeTime: form.schedule.backHomeTime || undefined,
        },
      };

      const formData = new FormData();
      formData.append('name', payload.name);
      formData.append('age', payload.age);
      formData.append('gender', payload.gender);
      formData.append('school', payload.school);
      formData.append('schoolLocation', JSON.stringify(payload.schoolLocation));
      formData.append('schedule', JSON.stringify(payload.schedule));
      if (avatarFile) {
        formData.append('profileImage', avatarFile);
      }

      const headers = avatarFile ? { 'Content-Type': 'multipart/form-data' } : {};
      await api.patch(`/parent/${childId}/update`, avatarFile ? formData : payload, { headers });

      setSuccess('Child information updated successfully');
      setTimeout(() => navigate(-1), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update child');
    } finally {
      setSaving(false);
    }
  };

  const getInitials = () => {
    if (form.name) return form.name.charAt(0).toUpperCase();
    return '?';
  };

  if (loading) {
    return (
      <div style={s.loadingWrap}>
        <div className="spinner" />
      </div>
    );
  }

  if (error && !form.name) {
    return (
      <div style={s.errorWrap}>
        <p style={s.errorText}>{error}</p>
        <button className="btn btn-outline" onClick={() => navigate('/admin/children')}>
          Back to Children
        </button>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <button onClick={() => navigate(-1)} style={s.backBtn}>
          &larr; Back
        </button>
        <h1 style={s.pageTitle}>Edit Child Information</h1>
      </div>

      {success && (
        <div style={s.successBanner}>{success}</div>
      )}

      {error && (
        <div style={s.errorBanner}>{error}</div>
      )}

      <form onSubmit={handleSubmit} style={s.form} noValidate>
        <div style={s.avatarSection}>
          <div style={s.avatarWrap} onClick={handleAvatarClick}>
            {avatarPreview || existingAvatar ? (
              <img
                src={avatarPreview || existingAvatar}
                alt="Avatar"
                style={s.avatarImg}
              />
            ) : (
              <div style={s.avatarPlaceholder}>{getInitials()}</div>
            )}
            <div style={s.cameraIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            style={{ display: 'none' }}
          />
          <p style={s.avatarHint}>Tap to change photo</p>
        </div>

        <div style={s.section}>
          <h2 style={s.sectionTitle}>Basic Information</h2>
          <div style={s.field}>
            <label style={s.label}>Full Name *</label>
            <input
              type="text"
              name="name"
              placeholder="Enter child's full name"
              value={form.name}
              onChange={handleChange}
              className="input-field"
              style={errors.name ? s.inputError : undefined}
            />
            {errors.name && <p style={s.fieldError}>{errors.name}</p>}
          </div>
          <div style={s.row}>
            <div style={{ ...s.field, flex: 1 }}>
              <label style={s.label}>Age *</label>
              <input
                type="number"
                name="age"
                placeholder="Age"
                min="0"
                value={form.age}
                onChange={handleChange}
                className="input-field"
                style={errors.age ? s.inputError : undefined}
              />
              {errors.age && <p style={s.fieldError}>{errors.age}</p>}
            </div>
            <div style={{ ...s.field, flex: 1 }}>
              <label style={s.label}>Gender *</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="input-field"
                style={errors.gender ? s.inputError : undefined}
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              {errors.gender && <p style={s.fieldError}>{errors.gender}</p>}
            </div>
          </div>
          <div style={s.field}>
            <label style={s.label}>School *</label>
            <input
              type="text"
              name="school"
              placeholder="Enter school name"
              value={form.school}
              onChange={handleChange}
              className="input-field"
              style={errors.school ? s.inputError : undefined}
            />
            {errors.school && <p style={s.fieldError}>{errors.school}</p>}
          </div>
        </div>

        <div style={s.section}>
          <h2 style={s.sectionTitle}>School Location</h2>
          <div style={s.row}>
            <div style={{ ...s.field, flex: 1 }}>
              <label style={s.label}>Latitude</label>
              <input
                type="number"
                name="schoolLocation.lat"
                placeholder="e.g. 25.2048"
                step="any"
                value={form.schoolLocation.lat}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div style={{ ...s.field, flex: 1 }}>
              <label style={s.label}>Longitude</label>
              <input
                type="number"
                name="schoolLocation.lng"
                placeholder="e.g. 55.2708"
                step="any"
                value={form.schoolLocation.lng}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          </div>
          <div style={s.field}>
            <label style={s.label}>Address</label>
            <input
              type="text"
              name="schoolLocation.address"
              placeholder="Enter school address"
              value={form.schoolLocation.address}
              onChange={handleChange}
              className="input-field"
            />
          </div>
        </div>

        <div style={s.section}>
          <h2 style={s.sectionTitle}>Schedule</h2>
          <div style={s.row}>
            <div style={{ ...s.field, flex: 1 }}>
              <label style={s.label}>Arrive Time</label>
              <input
                type="time"
                name="schedule.arriveTime"
                value={form.schedule.arriveTime}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div style={{ ...s.field, flex: 1 }}>
              <label style={s.label}>Back Home Time</label>
              <input
                type="time"
                name="schedule.backHomeTime"
                value={form.schedule.backHomeTime}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          </div>
        </div>

        <div style={s.actions}>
          <button
            type="submit"
            disabled={saving}
            style={{ ...s.saveBtn, opacity: saving ? 0.7 : 1 }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={s.cancelBtn}
            disabled={saving}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

const s = {
  page: {
    maxWidth: 600,
    margin: '0 auto',
    padding: '24px 16px 48px',
  },
  loadingWrap: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 400,
  },
  errorWrap: {
    textAlign: 'center',
    padding: 60,
  },
  errorText: {
    color: '#991b1b',
    fontSize: 16,
    marginBottom: 16,
  },
  header: {
    marginBottom: 24,
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: '#666',
    fontSize: 14,
    fontWeight: 500,
    padding: '8px 0',
    cursor: 'pointer',
    display: 'inline-block',
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 700,
    marginTop: 8,
  },
  successBanner: {
    background: '#dcfce7',
    color: '#166534',
    padding: '12px 16px',
    borderRadius: 12,
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  errorBanner: {
    background: '#fee2e2',
    color: '#991b1b',
    padding: '12px 16px',
    borderRadius: 12,
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  avatarSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarWrap: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: '50%',
    cursor: 'pointer',
    overflow: 'hidden',
    border: '3px solid #f5f5f5',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    background: '#fff3cc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 36,
    fontWeight: 700,
    color: '#d9a200',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    background: '#F5B800',
    borderRadius: '50%',
    width: 32,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#1a1a1a',
    border: '2px solid #fff',
  },
  avatarHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  section: {
    background: '#fff',
    borderRadius: 20,
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    padding: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 16,
  },
  field: {
    marginBottom: 16,
  },
  row: {
    display: 'flex',
    gap: 12,
  },
  label: {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: '#333',
    marginBottom: 6,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  fieldError: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    marginTop: 4,
  },
  saveBtn: {
    width: '100%',
    padding: '14px 24px',
    border: 'none',
    borderRadius: 12,
    fontWeight: 700,
    fontSize: 15,
    background: '#F5B800',
    color: '#1a1a1a',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  cancelBtn: {
    width: '100%',
    padding: '14px 24px',
    border: '1.5px solid #e0e0e0',
    borderRadius: 12,
    fontWeight: 600,
    fontSize: 14,
    background: '#fff',
    color: '#666',
    cursor: 'pointer',
    transition: 'border-color 0.2s',
  },
};
