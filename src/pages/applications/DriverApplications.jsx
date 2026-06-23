import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';

const LIMIT = 10;

const statusBadge = {
  pending: 'badge badge-warning',
  approved: 'badge badge-success',
  rejected: 'badge badge-danger',
};

export default function DriverApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('pending');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedApp, setSelectedApp] = useState(null);
  const [viewModal, setViewModal] = useState(null);
  const [actionModal, setActionModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/applications', {
        params: { page, limit: LIMIT, status, search },
      });
      setApplications(data.data || []);
      setTotalPages(data?.pagination?.totalPages || 1);
    } catch {
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [page, status, search]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  useEffect(() => {
    setPage(1);
  }, [status, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search) setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleView = async (id) => {
    try {
      const { data } = await api.get(`/admin/applications/${id}`);
      setViewModal(data.data || data);
    } catch {
      setViewModal(null);
    }
  };

  const handleAction = async () => {
    if (!actionModal) return;
    const { id, action, note } = actionModal;
    if (action === 'reject' && !note?.trim()) return;
    setActionLoading(true);
    try {
      await api.patch(`/admin/applications/${id}/${action}`, { [action === 'approve' ? 'notes' : 'reason']: note });
      setActionModal(null);
      fetchApplications();
    } catch {
    } finally {
      setActionLoading(false);
    }
  };

  const pageNumbers = () => {
    const pages = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.pageTitle}>Driver Applications</h1>

      <div className="card">
        <div style={styles.toolbar}>
          <div style={styles.statusTabs}>
            {['pending', 'approved', 'rejected'].map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                style={{
                  ...styles.tab,
                  ...(status === s ? styles.tabActive : {}),
                  color: status === s ? '#fff' : '#666',
                  background: status === s ? '#1a1a1a' : 'transparent',
                }}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <div className="search-bar" style={{ width: 280 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              className="input-field"
              placeholder="Search name, email, or national ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="empty-state"><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : applications.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 60, height: 60, opacity: 0.3 }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <p>No {status} applications found</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Driver Name</th>
                  <th>Email</th>
                  <th>National ID</th>
                  <th>Vehicle</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app._id || app.id} onClick={() => handleView(app._id || app.id)} style={{ cursor: 'pointer' }}>
                    <td style={{ fontWeight: 600 }}>{app.driver?.userName || app.driver?.fullName || app.driver?.name || '-'}</td>
                    <td>{app.driver?.email || '-'}</td>
                    <td>{app.driver?.nationalId || '-'}</td>
                    <td>
                      {app.vehicle
                        ? `${app.vehicle.carModel || app.vehicle.model || app.vehicle.make || ''} ${app.vehicle.plateNumber || ''}`.trim() || '-'
                        : '-'}
                    </td>
                    <td><span className={statusBadge[app.status]}>{app.status}</span></td>
                    <td style={{ color: '#666', fontSize: 13 }}>
                      {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : '-'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-sm btn-outline" onClick={(e) => { e.stopPropagation(); handleView(app._id || app.id); }}>View</button>
                        {app.status === 'pending' && (
                          <>
                            <button
                              className="btn btn-sm btn-success"
                              onClick={(e) => { e.stopPropagation(); setActionModal({ id: app._id || app.id, action: 'approve', note: '' }); }}
                            >
                              Approve
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={(e) => { e.stopPropagation(); setActionModal({ id: app._id || app.id, action: 'reject', note: '' }); }}
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div style={styles.pagination}>
            <button
              className="btn btn-sm btn-outline"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            {pageNumbers().map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{
                  ...styles.pageBtn,
                  ...(p === page ? { background: '#1a1a1a', color: '#fff', borderColor: '#1a1a1a' } : {}),
                }}
              >
                {p}
              </button>
            ))}
            <button
              className="btn btn-sm btn-outline"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {viewModal && (
        <div className="modal-overlay" onClick={() => setViewModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 700 }}>
            <div className="modal-header">
              <h2>Application Details</h2>
              <button className="modal-close" onClick={() => setViewModal(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div style={styles.detailGrid}>
                <DetailField label="Full Name" value={viewModal.driver?.userName || viewModal.driver?.fullName || viewModal.driver?.name || '-'} />
                <DetailField label="Email" value={viewModal.driver?.email || '-'} />
                <DetailField label="Phone" value={viewModal.driver?.phone || '-'} />
                <DetailField label="National ID" value={viewModal.driver?.nationalId || '-'} />
                <DetailField label="Date of Birth" value={viewModal.dateOfBirth ? new Date(viewModal.dateOfBirth).toLocaleDateString() : '-'} />
                <DetailField label="Status" value={<span className={statusBadge[viewModal.status]}>{viewModal.status}</span>} />
                <DetailField label="Created At" value={viewModal.createdAt ? new Date(viewModal.createdAt).toLocaleDateString() : '-'} />
                {viewModal.notes && <DetailField label="Notes" value={viewModal.notes} />}
                {viewModal.reason && <DetailField label="Rejection Reason" value={viewModal.reason} />}
              </div>
              {viewModal.vehicle && (
                <div style={{ marginTop: 24 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Vehicle Information</h3>
                  <div style={styles.detailGrid}>
                    <DetailField label="Model" value={viewModal.vehicle.carModel || viewModal.vehicle.model || viewModal.vehicle.make || '-'} />
                    <DetailField label="Plate Number" value={viewModal.vehicle.plateNumber || '-'} />
                    <DetailField label="Year" value={viewModal.vehicle.year || '-'} />
                    <DetailField label="Color" value={viewModal.vehicle.carColor || viewModal.vehicle.color || '-'} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {actionModal && (
        <div className="modal-overlay" onClick={() => setActionModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h2>{actionModal.action === 'approve' ? 'Approve Application' : 'Reject Application'}</h2>
              <button className="modal-close" onClick={() => setActionModal(null)}>&times;</button>
            </div>
            <div className="modal-body">
              {actionModal.action === 'reject' && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 6 }}>
                    Reason <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <textarea
                    className="input-field"
                    rows={4}
                    placeholder="Enter rejection reason..."
                    value={actionModal.note}
                    onChange={(e) => setActionModal({ ...actionModal, note: e.target.value })}
                    style={{ resize: 'vertical' }}
                  />
                  {actionModal.note === '' && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>Reason is required</p>}
                </div>
              )}
              {actionModal.action === 'approve' && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 6 }}>Notes (optional)</label>
                  <textarea
                    className="input-field"
                    rows={3}
                    placeholder="Add any notes..."
                    value={actionModal.note}
                    onChange={(e) => setActionModal({ ...actionModal, note: e.target.value })}
                    style={{ resize: 'vertical' }}
                  />
                </div>
              )}
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button className="btn btn-outline" onClick={() => setActionModal(null)}>Cancel</button>
                <button
                  className={`btn ${actionModal.action === 'approve' ? 'btn-success' : 'btn-danger'}`}
                  disabled={actionLoading || (actionModal.action === 'reject' && !actionModal.note?.trim())}
                  onClick={handleAction}
                >
                  {actionLoading ? 'Processing...' : actionModal.action === 'approve' ? 'Approve' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailField({ label, value }) {
  return (
    <div>
      <p style={{ fontSize: 12, color: '#666', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</p>
      <p style={{ fontSize: 14, fontWeight: 500 }}>{value || '-'}</p>
    </div>
  );
}

const styles = {
  container: {
    padding: 24,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 24,
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  statusTabs: {
    display: 'flex',
    gap: 4,
    background: '#f0f0f0',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    padding: '8px 20px',
    border: 'none',
    borderRadius: 10,
    fontWeight: 600,
    fontSize: 13,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  tabActive: {
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  },
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '20px 0 4px',
  },
  pageBtn: {
    width: 36,
    height: 36,
    border: '1.5px solid #e0e0e0',
    borderRadius: 10,
    background: '#fff',
    color: '#333',
    fontWeight: 600,
    fontSize: 13,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: 16,
  },
};
