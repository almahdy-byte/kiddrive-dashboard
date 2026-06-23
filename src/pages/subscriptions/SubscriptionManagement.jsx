import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';

const LIMIT = 10;

const STATUS_LABELS = {
  'waiting for confirmation': 'Pending',
  'accepted subscription': 'Accepted',
  'rejected subscription': 'Rejected',
  canceled: 'Canceled',
};

const STATUS_BADGES = {
  'waiting for confirmation': 'badge badge-warning',
  'accepted subscription': 'badge badge-success',
  'rejected subscription': 'badge badge-danger',
  canceled: 'badge badge-info',
};

const FILTER_TABS = [
  { key: '', label: 'All' },
  { key: 'waiting for confirmation', label: 'Pending' },
  { key: 'accepted subscription', label: 'Accepted' },
  { key: 'rejected subscription', label: 'Rejected' },
  { key: 'canceled', label: 'Canceled' },
];

export default function SubscriptionManagement() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewModal, setViewModal] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const { data } = await api.get('/subscription/', { params });
      const result = data?.data || [];
      setSubscriptions(Array.isArray(result) ? result : []);
      setTotalPages(data?.pagination?.totalPages || 1);
    } catch {
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, search]);

  const handleView = async (id) => {
    setModalLoading(true);
    setViewModal(null);
    try {
      const { data } = await api.get(`/subscription/${id}`);
      setViewModal(data?.data || data);
    } catch {
      setViewModal({});
    } finally {
      setModalLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    setActionLoading(true);
    try {
      await api.patch(`/subscription/${id}/status`, { status });
      setViewModal(null);
      fetchSubscriptions();
    } catch {
    } finally {
      setActionLoading(false);
    }
  };

  const canModify = (status) =>
    status === 'waiting for confirmation' || status === 'accepted subscription';

  const pageNumbers = () => {
    const pages = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-';

  const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const getName = (obj) =>
    obj?.fullName || obj?.userName || obj?.name || (obj?.firstName && obj?.lastName ? `${obj.firstName} ${obj.lastName}` : '-');

  return (
    <div style={styles.container}>
      <h1 style={styles.pageTitle}>Subscription Management</h1>

      <div className="card">
        <div style={styles.toolbar}>
          <div style={styles.statusTabs}>
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                style={{
                  ...styles.tab,
                  ...(statusFilter === tab.key ? styles.tabActive : {}),
                  color: statusFilter === tab.key ? '#fff' : '#666',
                  background: statusFilter === tab.key ? '#1a1a1a' : 'transparent',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="search-bar" style={{ width: 280 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              className="input-field"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="empty-state"><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : subscriptions.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 60, height: 60, opacity: 0.3 }}>
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18" /><path d="M9 21V9" />
            </svg>
            <p>No subscriptions found</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Driver Name</th>
                  <th>Parent Name</th>
                  <th>Child Name</th>
                  <th>Status</th>
                  <th>Type</th>
                  <th>Expiry Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub) => {
                  const id = sub._id || sub.id;
                  const driver = sub.driverId || sub.driver;
                  const parent = sub.parentId || sub.parent;
                  const child = sub.childId || sub.child;
                  const driverName = getName(driver);
                  const parentName = getName(parent);
                  const childName = getName(child);
                  return (
                    <tr
                      key={id}
                      onClick={() => handleView(id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td style={{ fontWeight: 600 }}>{driverName}</td>
                      <td>{parentName}</td>
                      <td>{childName}</td>
                      <td>
                        <span className={STATUS_BADGES[sub.status] || 'badge'}>
                          {STATUS_LABELS[sub.status] || sub.status}
                        </span>
                      </td>
                      <td style={{ textTransform: 'capitalize' }}>{sub.subscriptionType || '-'}</td>
                      <td style={{ color: '#666', fontSize: 13 }}>{formatDate(sub.expiryDate)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={(e) => { e.stopPropagation(); handleView(id); }}
                          >
                            View
                          </button>
                          {canModify(sub.status) && (
                            <>
                              {sub.status === 'waiting for confirmation' && (
                                <button
                                  className="btn btn-sm btn-success"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusUpdate(id, 'accepted');
                                  }}
                                  disabled={actionLoading}
                                >
                                  Accept
                                </button>
                              )}
                              {(sub.status === 'waiting for confirmation' || sub.status === 'accepted subscription') && (
                                <button
                                  className="btn btn-sm btn-danger"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusUpdate(id, 'rejected');
                                  }}
                                  disabled={actionLoading}
                                >
                                  Reject
                                </button>
                              )}
                              {sub.status === 'accepted subscription' && (
                                <button
                                  className="btn btn-sm btn-outline"
                                  style={{ color: '#3b82f6', borderColor: '#3b82f6' }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusUpdate(id, 'canceled');
                                  }}
                                  disabled={actionLoading}
                                >
                                  Cancel
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
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

      {viewModal && !modalLoading && (
        <div className="modal-overlay" onClick={() => setViewModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 720 }}>
            <div className="modal-header">
              <h2>Subscription Details</h2>
              <button className="modal-close" onClick={() => setViewModal(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Driver Information</h3>
                <div style={styles.detailGrid}>
                  <DetailField label="Name" value={getName(viewModal.driverId || viewModal.driver)} />
                  <DetailField label="Email" value={(viewModal.driverId || viewModal.driver)?.email} />
                  <DetailField label="Phone" value={(viewModal.driverId || viewModal.driver)?.phone} />
                </div>
              </div>

              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Parent Information</h3>
                <div style={styles.detailGrid}>
                  <DetailField label="Name" value={getName(viewModal.parentId || viewModal.parent)} />
                  <DetailField label="Email" value={(viewModal.parentId || viewModal.parent)?.email} />
                  <DetailField label="Phone" value={(viewModal.parentId || viewModal.parent)?.phone} />
                </div>
              </div>

              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Child Information</h3>
                <div style={styles.detailGrid}>
                  <DetailField label="Name" value={getName(viewModal.childId || viewModal.child)} />
                  <DetailField label="Age" value={(viewModal.childId || viewModal.child)?.age} />
                  <DetailField label="School" value={(viewModal.childId || viewModal.child)?.school || viewModal.child?.schoolName} />
                  <DetailField label="Grade" value={viewModal.child?.grade} />
                </div>
              </div>

              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Schedule Pattern</h3>
                {viewModal.schedulePattern && viewModal.schedulePattern.length > 0 ? (
                  <div style={styles.scheduleList}>
                    {viewModal.schedulePattern.map((s, i) => (
                      <div key={i} style={styles.scheduleItem}>
                        <span style={styles.scheduleDay}>{DAY_NAMES[s.dayOfWeek] || dayOfWeek}</span>
                        <span style={styles.scheduleTime}>
                          {s.pickupTime} - {s.dropoffTime}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : viewModal.schedule && viewModal.schedule.length > 0 ? (
                  <p style={{ color: '#888', fontSize: 14 }}>{viewModal.schedule.length} trips generated</p>
                ) : (
                  <p style={{ color: '#888', fontSize: 14 }}>No schedule set</p>
                )}
              </div>

              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Locations</h3>
                <div style={styles.detailGrid}>
                  <DetailField
                    label="Origin"
                    value={
                      viewModal.origin
                        ? typeof viewModal.origin === 'string'
                          ? viewModal.origin
                          : viewModal.origin.address || viewModal.origin.name || JSON.stringify(viewModal.origin)
                        : '-'
                    }
                  />
                  <DetailField
                    label="Destination"
                    value={
                      viewModal.destination
                        ? typeof viewModal.destination === 'string'
                          ? viewModal.destination
                          : viewModal.destination.address || viewModal.destination.name || JSON.stringify(viewModal.destination)
                        : '-'
                    }
                  />
                </div>
              </div>

              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Subscription Info</h3>
                <div style={styles.detailGrid}>
                  <DetailField label="Type" value={viewModal.subscriptionType} />
                  <DetailField label="Status" value={<span className={STATUS_BADGES[viewModal.status] || 'badge'}>{STATUS_LABELS[viewModal.status] || viewModal.status}</span>} />
                  <DetailField label="Expiry Date" value={formatDate(viewModal.expiryDate)} />
                  <DetailField label="Trips Generated" value={viewModal.schedule?.length ?? 0} />
                  <DetailField label="Created At" value={formatDate(viewModal.createdAt)} />
                </div>
              </div>

              {canModify(viewModal.status) && (
                <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end', borderTop: '1px solid #eee', paddingTop: 20 }}>
                  {viewModal.status === 'waiting for confirmation' && (
                    <button
                      className="btn btn-success"
                      onClick={() => handleStatusUpdate(viewModal._id || viewModal.id, 'accepted')}
                      disabled={actionLoading}
                    >
                      {actionLoading ? 'Processing...' : 'Accept Subscription'}
                    </button>
                  )}
                  {(viewModal.status === 'waiting for confirmation' || viewModal.status === 'accepted subscription') && (
                    <button
                      className="btn btn-danger"
                      onClick={() => handleStatusUpdate(viewModal._id || viewModal.id, 'rejected')}
                      disabled={actionLoading}
                    >
                      {actionLoading ? 'Processing...' : 'Reject Subscription'}
                    </button>
                  )}
                  {viewModal.status === 'accepted subscription' && (
                    <button
                      className="btn btn-outline"
                      style={{ color: '#3b82f6', borderColor: '#3b82f6' }}
                      onClick={() => handleStatusUpdate(viewModal._id || viewModal.id, 'canceled')}
                      disabled={actionLoading}
                    >
                      {actionLoading ? 'Processing...' : 'Cancel Subscription'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {modalLoading && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 400, textAlign: 'center', padding: 40 }}>
            <div className="spinner" style={{ margin: '0 auto 16px' }} />
            <p style={{ color: '#888' }}>Loading details...</p>
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
      <p style={{ fontSize: 14, fontWeight: 500 }}>{value ?? '-'}</p>
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottom: '1px solid #f0f0f0',
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: 16,
  },
  scheduleList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  scheduleItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '8px 12px',
    background: '#f9f9f9',
    borderRadius: 8,
  },
  scheduleDay: {
    fontWeight: 600,
    fontSize: 14,
    minWidth: 100,
    textTransform: 'capitalize',
  },
  scheduleTime: {
    fontSize: 14,
    color: '#555',
  },
};
