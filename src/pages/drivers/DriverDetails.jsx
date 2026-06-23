import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

export default function DriverDetails() {
  const { driverId } = useParams();
  const navigate = useNavigate();

  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [vehicleLoading, setVehicleLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const [actionError, setActionError] = useState('');

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    fetchDriver();
  }, [driverId]);

  const fetchDriver = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/driver/${driverId}`);
      setDriver(data.data?.driver || data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load driver details');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveVehicle = async () => {
    if (!driver?.vehicle?._id) return;
    setVehicleLoading(true);
    setActionMsg('');
    setActionError('');
    try {
      await api.patch(`/driver/${driverId}/vehicle/${driver.vehicle._id}/approve`);
      setActionMsg('Vehicle approved successfully');
      fetchDriver();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to approve vehicle');
    } finally {
      setVehicleLoading(false);
    }
  };

  const handleApproveApplication = async () => {
    const appId = driver?.applicationId;
    if (!appId) {
      setActionError('Application ID not available. Please approve from Applications page.');
      return;
    }
    setStatusLoading(true);
    setActionMsg('');
    setActionError('');
    try {
      await api.patch(`/admin/applications/${appId}/approve`);
      setActionMsg('Driver application approved');
      fetchDriver();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to approve application');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleRejectApplication = async () => {
    const appId = driver?.applicationId;
    if (!appId) {
      setActionError('Application ID not available. Please reject from Applications page.');
      setShowRejectModal(false);
      return;
    }
    if (!rejectReason.trim()) return;
    setRejecting(true);
    setActionMsg('');
    setActionError('');
    try {
      await api.patch(`/admin/applications/${appId}/reject`, { reason: rejectReason });
      setActionMsg('Driver application rejected');
      setShowRejectModal(false);
      setRejectReason('');
      fetchDriver();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to reject application');
    } finally {
      setRejecting(false);
    }
  };

  const renderStars = (rating) => {
    const full = Math.floor(rating || 0);
    const half = (rating || 0) - full >= 0.5;
    const stars = [];
    for (let i = 0; i < 5; i++) {
      if (i < full) stars.push('\u2605');
      else if (i === full && half) stars.push('\u2605');
      else stars.push('\u2606');
    }
    return stars;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <div className="spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <p style={{ color: '#991b1b', fontSize: 16, marginBottom: 16 }}>{error}</p>
        <button className="btn btn-outline" onClick={() => navigate('/admin/drivers')}>
          Back to Drivers
        </button>
      </div>
    );
  }

  if (!driver) return null;

  const { vehicle } = driver;
  const applicationStatus = driver.status || driver.applicationStatus;

  return (
    <div>
      <button
        onClick={() => navigate('/admin/drivers')}
        style={s.backBtn}
      >
        &larr; Back to Drivers
      </button>

      {(actionMsg || actionError) && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 12,
            fontSize: 14,
            marginBottom: 20,
            background: actionMsg ? '#dcfce7' : '#fee2e2',
            color: actionMsg ? '#166534' : '#991b1b',
          }}
        >
          {actionMsg || actionError}
        </div>
      )}

      <div style={s.grid}>
        <div style={s.leftCol}>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={s.avatarWrapper}>
              {driver.profileImage ? (
                <img
                  src={driver.profileImage}
                  alt={driver.fullName}
                  style={s.avatar}
                />
              ) : (
                <div className="avatar" style={{ width: 100, height: 100, fontSize: 36, margin: '0 auto' }}>
                  {driver.fullName?.charAt(0) || 'D'}
                </div>
              )}
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginTop: 16 }}>{driver.fullName}</h2>
            <p style={{ color: '#666', fontSize: 14 }}>{driver.email}</p>
            <p style={{ color: '#666', fontSize: 14 }}>{driver.phone}</p>

            <div style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 4, fontSize: 22, color: '#F5B800' }}>
                {renderStars(driver.averageRating).map((star, i) => (
                  <span key={i}>{star}</span>
                ))}
              </div>
              <p style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                {driver.averageRating ? `${driver.averageRating.toFixed(1)} / 5` : 'No ratings yet'}
              </p>
            </div>
          </div>

          <div className="card" style={{ marginTop: 20 }}>
            <h3 style={s.cardTitle}>Personal Info</h3>
            <div style={s.infoRow}>
              <span style={s.label}>National ID</span>
              <span style={s.value}>{driver.nationalId || '—'}</span>
            </div>
            <div style={s.infoRow}>
              <span style={s.label}>City</span>
              <span style={s.value}>{driver.location?.city || driver.city || '—'}</span>
            </div>
            <div style={s.infoRow}>
              <span style={s.label}>Department</span>
              <span style={s.value}>{driver.location?.department || driver.department || '—'}</span>
            </div>
            <div style={s.infoRow}>
              <span style={s.label}>Address</span>
              <span style={s.value}>{driver.location?.address || driver.address || '—'}</span>
            </div>
          </div>

          {(driver.driverLicenseImage || driver.nationalIdImage) && (
            <div className="card" style={{ marginTop: 20 }}>
              <h3 style={s.cardTitle}>Documents</h3>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {driver.driverLicenseImage && (
                  <div>
                    <p style={{ fontSize: 12, color: '#666', marginBottom: 8, fontWeight: 600 }}>
                      Driver License
                    </p>
                    <a href={driver.driverLicenseImage} target="_blank" rel="noopener noreferrer">
                      <img
                        src={driver.driverLicenseImage}
                        alt="Driver License"
                        style={s.docThumb}
                      />
                    </a>
                  </div>
                )}
                {driver.nationalIdImage && (
                  <div>
                    <p style={{ fontSize: 12, color: '#666', marginBottom: 8, fontWeight: 600 }}>
                      National ID
                    </p>
                    <a href={driver.nationalIdImage} target="_blank" rel="noopener noreferrer">
                      <img
                        src={driver.nationalIdImage}
                        alt="National ID"
                        style={s.docThumb}
                      />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div style={s.rightCol}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={s.cardTitle}>Vehicle</h3>
              {vehicle && (
                <span
                  className={`badge ${vehicle.status === 'approved' ? 'badge-success' : vehicle.status === 'pending' ? 'badge-warning' : 'badge-danger'}`}
                >
                  {vehicle.status || 'N/A'}
                </span>
              )}
            </div>

            {vehicle ? (
              <>
                <div style={s.infoRow}>
                  <span style={s.label}>Car Model</span>
                  <span style={s.value}>{vehicle.carModel || '—'}</span>
                </div>
                <div style={s.infoRow}>
                  <span style={s.label}>Plate Number</span>
                  <span style={s.value}>{vehicle.plateNumber || '—'}</span>
                </div>
                <div style={s.infoRow}>
                  <span style={s.label}>Color</span>
                  <span style={s.value}>{vehicle.color || '—'}</span>
                </div>

                {vehicle.governmentDocuments?.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <p style={{ fontSize: 12, color: '#666', marginBottom: 8, fontWeight: 600 }}>
                      Vehicle Documents
                    </p>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      {vehicle.governmentDocuments.map((doc, i) => (
                        <a key={i} href={doc} target="_blank" rel="noopener noreferrer">
                          <img src={doc} alt={`Vehicle doc ${i + 1}`} style={s.docThumb} />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {vehicle.status !== 'approved' && (
                  <button
                    className="btn btn-success btn-sm"
                    onClick={handleApproveVehicle}
                    disabled={vehicleLoading}
                    style={{ marginTop: 16, opacity: vehicleLoading ? 0.7 : 1 }}
                  >
                    {vehicleLoading ? 'Approving...' : 'Approve Vehicle'}
                  </button>
                )}
              </>
            ) : (
              <p style={{ color: '#999', fontSize: 14 }}>No vehicle assigned</p>
            )}
          </div>

          <div className="card" style={{ marginTop: 20 }}>
            <h3 style={s.cardTitle}>Application Status</h3>
            <div style={{ marginTop: 12, marginBottom: 16 }}>
              <span
                className={`badge ${applicationStatus === 'approved' ? 'badge-success' : applicationStatus === 'pending' ? 'badge-warning' : applicationStatus === 'rejected' ? 'badge-danger' : 'badge-info'}`}
                style={{ fontSize: 13, padding: '6px 16px' }}
              >
                {applicationStatus || 'Unknown'}
              </span>
            </div>

            {applicationStatus === 'pending' && (
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  className="btn btn-success btn-sm"
                  onClick={handleApproveApplication}
                  disabled={statusLoading}
                  style={{ opacity: statusLoading ? 0.7 : 1 }}
                >
                  {statusLoading ? 'Approving...' : 'Approve Application'}
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => setShowRejectModal(true)}
                  disabled={statusLoading}
                >
                  Reject
                </button>
              </div>
            )}

            {applicationStatus !== 'pending' && (
              <p style={{ fontSize: 13, color: '#999' }}>
                {applicationStatus === 'approved'
                  ? 'This application has been approved.'
                  : applicationStatus === 'rejected'
                    ? 'This application has been rejected.'
                    : 'No pending actions.'}
              </p>
            )}
          </div>
        </div>
      </div>

      {showRejectModal && (
        <div className="modal-overlay" onClick={() => { if (!rejecting) setShowRejectModal(false); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Reject Application</h2>
              <button
                className="modal-close"
                onClick={() => { if (!rejecting) setShowRejectModal(false); }}
                disabled={rejecting}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 8 }}>
                Reason for rejection
              </label>
              <textarea
                className="input-field"
                rows={4}
                placeholder="Enter the reason..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                style={{ resize: 'vertical' }}
              />
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => { if (!rejecting) { setShowRejectModal(false); setRejectReason(''); } }}
                  disabled={rejecting}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={handleRejectApplication}
                  disabled={rejecting || !rejectReason.trim()}
                  style={{ opacity: rejecting || !rejectReason.trim() ? 0.7 : 1 }}
                >
                  {rejecting ? 'Rejecting...' : 'Confirm Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  backBtn: {
    background: 'none',
    border: 'none',
    color: '#666',
    fontSize: 14,
    fontWeight: 500,
    padding: '8px 0',
    marginBottom: 20,
    cursor: 'pointer',
    display: 'inline-block',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 24,
    alignItems: 'start',
  },
  leftCol: {},
  rightCol: {},
  avatarWrapper: {
    display: 'flex',
    justifyContent: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid #f5f5f5',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 12,
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid #f0f0f0',
  },
  label: {
    fontSize: 13,
    color: '#666',
    fontWeight: 500,
  },
  value: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: 600,
    textAlign: 'right',
  },
  docThumb: {
    width: 140,
    height: 100,
    objectFit: 'cover',
    borderRadius: 8,
    border: '1px solid #eee',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
};
