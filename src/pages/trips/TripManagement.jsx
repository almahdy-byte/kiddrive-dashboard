import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';

const STATUS_OPTIONS = [
  { key: '', label: 'All' },
  { key: 'idle', label: 'Idle' },
  { key: 'trip_started', label: 'Trip Started' },
  { key: 'child_boarded', label: 'Child Boarded' },
  { key: 'child_dropped_off', label: 'Child Dropped Off' },
  { key: 'trip_finished', label: 'Trip Finished' },
];

const STATUS_BADGE = {
  idle: 'badge-info',
  trip_started: 'badge-warning',
  child_boarded: 'badge-warning',
  child_dropped_off: 'badge-info',
  trip_finished: 'badge-success',
};

const STATUS_LABEL = {
  idle: 'Idle',
  trip_started: 'Trip Started',
  child_boarded: 'Child Boarded',
  child_dropped_off: 'Child Dropped Off',
  trip_finished: 'Trip Finished',
};

const NEXT_STATUS = {
  idle: { label: 'Start Trip', endpoint: 'start', method: 'patch', body: null },
  trip_started: { label: 'Mark Child Boarded', endpoint: 'status', method: 'patch', body: { status: 'child_boarded' } },
  child_boarded: { label: 'Mark Child Dropped Off', endpoint: 'status', method: 'patch', body: { status: 'child_dropped_off' } },
  child_dropped_off: { label: 'End Trip', endpoint: 'end', method: 'patch', body: null },
};

const LIMIT = 12;

function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc : null), obj);
}

function getName(person) {
  if (!person) return '—';
  return person.fullName || person.userName || person.name || '—';
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function formatTime(timeStr) {
  if (!timeStr) return '—';
  try {
    if (timeStr.includes('T')) return new Date(timeStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const [h, m] = timeStr.split(':');
    if (!h || !m) return timeStr;
    const date = new Date();
    date.setHours(parseInt(h, 10), parseInt(m, 10));
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return timeStr;
  }
}

export default function TripManagement() {
  const [trips, setTrips] = useState([]);
  const [activeTrips, setActiveTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeLoading, setActiveLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewTrip, setViewTrip] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(null);

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const res = await api.get('/trip/', { params });
      const result = res.data?.data || res.data || [];
      const list = Array.isArray(result) ? result : [];
      setTrips(list);
      setTotalPages(res.data?.pagination?.totalPages || 1);
    } catch {
      setTrips([]);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  const fetchActiveTrips = useCallback(async () => {
    setActiveLoading(true);
    try {
      const res = await api.get('/trip/active');
      const result = res.data?.data || res.data || [];
      setActiveTrips(Array.isArray(result) ? result : []);
    } catch {
      setActiveTrips([]);
    } finally {
      setActiveLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveTrips();
  }, [fetchActiveTrips]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const handleViewTrip = async (trip) => {
    try {
      const res = await api.get(`/trip/${trip._id || trip.id}`);
      setViewTrip(res.data?.data || res.data || trip);
    } catch {
      setViewTrip(trip);
    }
  };

  const handleStatusUpdate = async (trip) => {
    const tripId = trip._id || trip.id;
    const next = NEXT_STATUS[trip.status];
    if (!next) return;
    setStatusUpdating(tripId);
    try {
      if (next.endpoint === 'start') {
        await api.patch(`/trip/${tripId}/start`);
      } else if (next.endpoint === 'end') {
        await api.patch(`/trip/${tripId}/end`);
      } else {
        await api.patch(`/trip/${tripId}/status`, next.body);
      }
      fetchTrips();
      fetchActiveTrips();
    } catch {
    } finally {
      setStatusUpdating(null);
    }
  };

  const statusTimelineColor = (s) => {
    switch (s) {
      case 'idle': return '#3b82f6';
      case 'trip_started': return '#eab308';
      case 'child_boarded': return '#f97316';
      case 'child_dropped_off': return '#3b82f6';
      case 'trip_finished': return '#22c55e';
      default: return '#aaa';
    }
  };

  const pageNumbers = () => {
    const pages = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const renderTable = (tripList, showActiveActions) => (
    <>
      <div className="desktop-table">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Driver</th>
                <th>Parent</th>
                <th>Child</th>
                <th>Type</th>
                <th>Status</th>
                <th>Date</th>
                <th>Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tripList.map((trip) => {
                const tripId = trip._id || trip.id;
                const driver = trip.driverId || trip.driver;
                const parent = trip.parentId || trip.parent;
                const child = trip.childId || trip.child;
                const driverName = getName(driver);
                const parentName = getName(parent);
                const childName = getName(child);
                const tripType = trip.tripType || trip.type;
                const scheduleDate = formatDate(trip.scheduledDate || trip.schedule?.date);
                const scheduleTime = formatTime(trip.scheduledTime || trip.schedule?.time);
                const nextAction = showActiveActions ? NEXT_STATUS[trip.status] : null;

                return (
                  <tr key={tripId} onClick={() => handleViewTrip(trip)} style={{ cursor: 'pointer' }}>
                    <td style={{ fontWeight: 600 }}>{driverName}</td>
                    <td>{parentName}</td>
                    <td>{childName}</td>
                    <td>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                        background: tripType === 'pickup' ? '#dbeafe' : '#fef3c7',
                        color: tripType === 'pickup' ? '#1e40af' : '#92400e',
                      }}>
                        <span>{tripType === 'pickup' ? '\u{1F4E6}' : '\u{1F691}'}</span>
                        {(tripType || '—').charAt(0).toUpperCase() + (tripType || '—').slice(1)}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: statusTimelineColor(trip.status), flexShrink: 0 }} />
                        <span className={`badge ${STATUS_BADGE[trip.status] || 'badge-info'}`}>{STATUS_LABEL[trip.status] || trip.status || '—'}</span>
                      </div>
                    </td>
                    <td>{scheduleDate}</td>
                    <td>{scheduleTime}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-sm btn-outline" onClick={() => handleViewTrip(trip)}>View</button>
                        {nextAction && (
                          <button className="btn btn-sm btn-primary" disabled={statusUpdating === tripId}
                            onClick={() => handleStatusUpdate(trip)}
                            style={{ opacity: statusUpdating === tripId ? 0.6 : 1 }}>
                            {statusUpdating === tripId ? '...' : nextAction.label}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mobile-cards">
        {tripList.map((trip) => {
          const tripId = trip._id || trip.id;
          const driver = trip.driverId || trip.driver;
          const parent = trip.parentId || trip.parent;
          const child = trip.childId || trip.child;
          const driverName = getName(driver);
          const parentName = getName(parent);
          const childName = getName(child);
          const tripType = trip.tripType || trip.type;
          const scheduleDate = formatDate(trip.scheduledDate || trip.schedule?.date);
          const scheduleTime = formatTime(trip.scheduledTime || trip.schedule?.time);
          const nextAction = showActiveActions ? NEXT_STATUS[trip.status] : null;

          return (
            <div key={tripId} className="mobile-card" onClick={() => handleViewTrip(trip)}>
              <div className="mobile-card-header">
                <span className="mobile-card-title">{driverName}</span>
                <span className={`badge ${STATUS_BADGE[trip.status] || 'badge-info'}`}>{STATUS_LABEL[trip.status] || trip.status || '—'}</span>
              </div>
              <div className="mobile-card-body">
                <div className="mobile-card-row"><span>Parent</span><span>{parentName}</span></div>
                <div className="mobile-card-row"><span>Child</span><span>{childName}</span></div>
                <div className="mobile-card-row"><span>Type</span><span>{(tripType || '—').charAt(0).toUpperCase() + (tripType || '—').slice(1)}</span></div>
                <div className="mobile-card-row"><span>Date</span><span>{scheduleDate}</span></div>
                <div className="mobile-card-row"><span>Time</span><span>{scheduleTime}</span></div>
              </div>
              <div className="mobile-card-actions">
                <button className="btn btn-sm btn-outline" onClick={(e) => { e.stopPropagation(); handleViewTrip(trip); }}>View</button>
                {nextAction && (
                  <button className="btn btn-sm btn-primary" disabled={statusUpdating === tripId}
                    onClick={(e) => { e.stopPropagation(); handleStatusUpdate(trip); }}
                    style={{ opacity: statusUpdating === tripId ? 0.6 : 1 }}>
                    {statusUpdating === tripId ? '...' : nextAction.label}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );

  return (
    <div style={styles.container}>
      <h1 style={styles.pageTitle}>Trip Management</h1>

      {activeLoading ? (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="empty-state">
            <div className="spinner" style={{ margin: '0 auto' }} />
          </div>
        </div>
      ) : activeTrips.length > 0 ? (
        <div className="card" style={{ marginBottom: 24, border: '2px solid #F5B800' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={styles.activeDot} />
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Active Trips</h3>
            <span className="badge badge-warning">{activeTrips.length} ongoing</span>
          </div>
          {renderTable(activeTrips, true)}
        </div>
      ) : null}

      <div className="card">
        <div style={styles.toolbar}>
          <div style={styles.statusTabs}>
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setStatusFilter(opt.key)}
                style={{
                  ...styles.tab,
                  ...(statusFilter === opt.key ? styles.tabActive : {}),
                  color: statusFilter === opt.key ? '#fff' : '#666',
                  background: statusFilter === opt.key ? '#1a1a1a' : 'transparent',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, width: '100%', maxWidth: 360 }}>
            <div className="search-bar" style={{ flex: 1 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                className="input-field"
                placeholder="Search driver, parent, or child..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </form>
        </div>

        {loading ? (
          <div className="empty-state">
            <div className="spinner" style={{ margin: '0 auto' }} />
            <p style={{ marginTop: 16, fontSize: 14, color: '#888' }}>Loading trips...</p>
          </div>
        ) : trips.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 60, height: 60, opacity: 0.3 }}>
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18" />
              <path d="M9 21V9" />
            </svg>
            <p>{search ? 'No trips match your search.' : 'No trips found.'}</p>
            {search && (
              <button
                className="btn btn-sm btn-outline"
                onClick={() => { setSearch(''); setPage(1); }}
                style={{ marginTop: 12 }}
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          renderTable(trips, false)
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

      {viewTrip && (
        <div className="modal-overlay" onClick={() => setViewTrip(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 700 }}>
            <div className="modal-header">
              <h2>Trip Details</h2>
              <button className="modal-close" onClick={() => setViewTrip(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div style={styles.timelineSection}>
                <p style={styles.sectionTitle}>Status Timeline</p>
                <div style={styles.timeline}>
                  {['idle', 'trip_started', 'child_boarded', 'child_dropped_off', 'trip_finished'].map((s, i) => {
                    const statuses = ['idle', 'trip_started', 'child_boarded', 'child_dropped_off', 'trip_finished'];
                    const currentIdx = statuses.indexOf(viewTrip.status);
                    const isActive = i <= currentIdx && viewTrip.status !== 'idle' ? i <= currentIdx : s === viewTrip.status;
                    const isCurrent = s === viewTrip.status;
                    return (
                      <div key={s} style={styles.timelineStep}>
                        <div style={{
                          ...styles.timelineDot,
                          background: isCurrent ? statusTimelineColor(s) : isActive ? statusTimelineColor(s) : '#e0e0e0',
                          border: isCurrent ? `3px solid ${statusTimelineColor(s)}` : 'none',
                          width: isCurrent ? 16 : 12,
                          height: isCurrent ? 16 : 12,
                        }} />
                        {i < 4 && <div style={{
                          ...styles.timelineLine,
                          background: i < currentIdx ? statusTimelineColor(statuses[i]) : '#e0e0e0',
                        }} />}
                        <span style={{
                          fontSize: 12,
                          fontWeight: isCurrent ? 700 : 500,
                          color: isCurrent ? '#1a1a1a' : isActive ? '#555' : '#aaa',
                          whiteSpace: 'nowrap',
                        }}>
                          {STATUS_LABEL[s]}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div style={{ marginTop: 12 }}>
                  <span className={`badge ${STATUS_BADGE[viewTrip.status] || 'badge-info'}`} style={{ fontSize: 13, padding: '6px 16px' }}>
                    Current: {STATUS_LABEL[viewTrip.status] || viewTrip.status}
                  </span>
                </div>
              </div>

              <div style={styles.detailGrid}>
                <DetailField label="Driver" value={getName(viewTrip.driverId || viewTrip.driver)} />
                <DetailField label="Parent" value={getName(viewTrip.parentId || viewTrip.parent)} />
                <DetailField label="Child" value={getName(viewTrip.childId || viewTrip.child)} />
                <DetailField
                  label="Trip Type"
                  value={
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                      background: (viewTrip.tripType || viewTrip.type) === 'pickup' ? '#dbeafe' : '#fef3c7',
                      color: (viewTrip.tripType || viewTrip.type) === 'pickup' ? '#1e40af' : '#92400e',
                    }}>
                      <span>{(viewTrip.tripType || viewTrip.type) === 'pickup' ? '\u{1F4E6}' : '\u{1F691}'}</span>
                      {(viewTrip.tripType || viewTrip.type || '—').charAt(0).toUpperCase() + (viewTrip.tripType || viewTrip.type || '—').slice(1)}
                    </span>
                  }
                />
                <DetailField label="Scheduled Date" value={formatDate(viewTrip.scheduledDate || viewTrip.schedule?.date)} />
                <DetailField label="Scheduled Time" value={formatTime(viewTrip.scheduledTime || viewTrip.schedule?.time)} />
                <DetailField label="Origin" value={viewTrip.origin?.address || JSON.stringify(viewTrip.origin) || viewTrip.startLocation || '—'} />
                <DetailField label="Destination" value={viewTrip.destination?.address || JSON.stringify(viewTrip.destination) || viewTrip.endLocation || '—'} />
                <DetailField label="Status" value={
                  <span className={`badge ${STATUS_BADGE[viewTrip.status] || 'badge-info'}`}>
                    {STATUS_LABEL[viewTrip.status] || viewTrip.status || '—'}
                  </span>
                } />
              </div>

              {(viewTrip.driverId || viewTrip.driver) && (
                <div style={{ marginTop: 24 }}>
                  <p style={styles.sectionTitle}>Driver Info</p>
                  <div style={styles.detailGrid}>
                    <DetailField label="Name" value={getName(viewTrip.driverId || viewTrip.driver)} />
                    <DetailField label="Email" value={(viewTrip.driverId || viewTrip.driver)?.email || '—'} />
                    <DetailField label="Phone" value={(viewTrip.driverId || viewTrip.driver)?.phone || '—'} />
                  </div>
                </div>
              )}

              {(viewTrip.parentId || viewTrip.parent) && (
                <div style={{ marginTop: 24 }}>
                  <p style={styles.sectionTitle}>Parent Info</p>
                  <div style={styles.detailGrid}>
                    <DetailField label="Name" value={getName(viewTrip.parentId || viewTrip.parent)} />
                    <DetailField label="Email" value={(viewTrip.parentId || viewTrip.parent)?.email || '—'} />
                    <DetailField label="Phone" value={(viewTrip.parentId || viewTrip.parent)?.phone || '—'} />
                  </div>
                </div>
              )}

              {(viewTrip.childId || viewTrip.child) && (
                <div style={{ marginTop: 24 }}>
                  <p style={styles.sectionTitle}>Child Info</p>
                  <div style={styles.detailGrid}>
                    <DetailField label="Name" value={getName(viewTrip.childId || viewTrip.child)} />
                    <DetailField label="Age" value={(viewTrip.childId || viewTrip.child)?.age || '—'} />
                  </div>
                </div>
              )}

              {NEXT_STATUS[viewTrip.status] && (
                <div style={{ marginTop: 24, textAlign: 'right' }}>
                  <button
                    className="btn btn-primary"
                    disabled={statusUpdating === (viewTrip._id || viewTrip.id)}
                    onClick={() => {
                      handleStatusUpdate(viewTrip);
                      setViewTrip(null);
                    }}
                    style={{ opacity: statusUpdating === (viewTrip._id || viewTrip.id) ? 0.6 : 1 }}
                  >
                    {statusUpdating === (viewTrip._id || viewTrip.id)
                      ? 'Updating...'
                      : NEXT_STATUS[viewTrip.status].label}
                  </button>
                </div>
              )}
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
  activeDot: {
    width: 12,
    height: 12,
    borderRadius: '50%',
    background: '#22c55e',
    boxShadow: '0 0 0 3px rgba(34,197,94,0.3)',
    animation: 'pulse 2s infinite',
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
    flexWrap: 'wrap',
  },
  tab: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: 10,
    fontWeight: 600,
    fontSize: 12,
    cursor: 'pointer',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
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
  timelineSection: {
    marginBottom: 24,
    padding: 16,
    background: '#f9fafb',
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: '#1a1a1a',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timeline: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'nowrap',
    overflowX: 'auto',
  },
  timelineStep: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
  },
  timelineDot: {
    borderRadius: '50%',
    flexShrink: 0,
  },
  timelineLine: {
    width: 16,
    height: 2,
    flexShrink: 0,
  },
};
