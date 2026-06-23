import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';

const AVATAR_COLORS = ['#F5B800', '#4F46E5', '#059669', '#DC2626', '#D97706', '#7C3AED', '#0891B2', '#BE123C'];

function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function RatingStars({ rating = 0 }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <span>
      {'★'.repeat(full)}
      {half ? '½' : ''}
      {'☆'.repeat(empty)}
    </span>
  );
}

export default function DriverManagement() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = parseInt(searchParams.get('page'), 10) || 1;
  const searchParam = searchParams.get('search') || '';

  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState(searchParam);
  const [page, setPage] = useState(pageParam);

  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/driver/', {
        params: { page, search: searchParam, limit: 12 },
      });
      const result = data?.data || [];
      const list = Array.isArray(result) ? result.map((item) => ({
        ...(item.driver || item),
        carModel: item.vehicle?.carModel || item.carModel,
        plateNumber: item.vehicle?.plateNumber || item.plateNumber,
        carColor: item.vehicle?.carColor || item.carColor,
        vehicleStatus: item.vehicle?.status,
        vehicleIsApproved: item.vehicle?.isApproved,
      })) : [];
      setDrivers(list);
      setTotalPages(data?.pagination?.totalPages || 1);
      setTotal(data?.pagination?.total || list.length);
    } catch {
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  }, [page, searchParam]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  useEffect(() => {
    const params = {};
    if (page > 1) params.page = page;
    if (search) params.search = search;
    setSearchParams(params, { replace: true });
  }, [page, search, setSearchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearchParams(search ? { search } : {}, { replace: true });
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  const filteredDrivers = search
    ? drivers.filter(
        (d) =>
          (d.fullName || d.userName || d.name || '').toLowerCase().includes(search.toLowerCase()) ||
          (d.email || '').toLowerCase().includes(search.toLowerCase())
      )
    : drivers;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.heading}>Driver Management</h2>
          <p style={styles.subheading}>{total} driver{total !== 1 ? 's' : ''} registered</p>
        </div>
      </div>

      <form onSubmit={handleSearch} style={styles.searchBar}>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />
        <button type="submit" style={styles.searchBtn}>Search</button>
        {search && (
          <button
            type="button"
            onClick={() => { setSearch(''); setPage(1); setSearchParams({}, { replace: true }); }}
            style={styles.clearBtn}
          >
            Clear
          </button>
        )}
      </form>

      {loading ? (
        <div style={styles.center}>
          <div className="spinner" />
          <p style={styles.loadingText}>Loading drivers...</p>
        </div>
      ) : filteredDrivers.length === 0 ? (
        <div style={styles.center}>
          <div style={styles.emptyIcon}>🚗</div>
          <p style={styles.emptyText}>
            {search ? 'No drivers match your search.' : 'No drivers found.'}
          </p>
          {search && (
            <button
              type="button"
              onClick={() => { setSearch(''); setPage(1); setSearchParams({}, { replace: true }); }}
              style={styles.clearBtn}
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <>
          <div style={styles.grid}>
            {filteredDrivers.map((driver) => {
              const name = driver.fullName || driver.userName || driver.name || 'Unknown';
              const initial = name.charAt(0).toUpperCase();
              const color = getAvatarColor(name);

              return (
                <div
                  key={driver._id || driver.id}
                  style={styles.card}
                  onClick={() => navigate(`/admin/drivers/${driver._id || driver.id}`)}
                >
                  <div style={styles.cardTop}>
                    <div
                      style={{ ...styles.avatar, background: color }}
                    >
                      {initial}
                    </div>
                    <div style={styles.cardInfo}>
                      <h3 style={styles.driverName}>{name}</h3>
                      <p style={styles.driverEmail}>{driver.email}</p>
                      <p style={styles.driverPhone}>{driver.phone || '—'}</p>
                    </div>
                    <span
                      style={{
                        ...styles.badge,
                        background: driver.isApproved ? '#dcfce7' : '#fef3c7',
                        color: driver.isApproved ? '#166534' : '#92400e',
                      }}
                    >
                      {driver.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </div>

                  <div style={styles.vehicleSection}>
                    <p style={styles.sectionLabel}>Vehicle</p>
                    <div style={styles.vehicleInfo}>
                      <span style={styles.vehicleTag}>{driver.carModel || '—'}</span>
                      <span style={styles.vehicleTag}>{driver.plateNumber || '—'}</span>
                      <span style={styles.vehicleTag}>{driver.carColor || '—'}</span>
                    </div>
                  </div>

                  <div style={styles.cardBottom}>
                    <div style={styles.ratingRow}>
                      <span style={styles.ratingValue}>
                        {(driver.rating?.average ?? driver.rating ?? 0).toFixed(1)}
                      </span>
                      <span style={styles.stars}>
                        <RatingStars rating={driver.rating?.average ?? driver.rating ?? 0} />
                      </span>
                    </div>
                    <div style={styles.location}>
                      {[driver.location?.city, driver.location?.department].filter(Boolean).join(', ') || '—'}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/admin/drivers/${driver._id || driver.id}`);
                    }}
                    style={styles.viewBtn}
                  >
                    View Details
                  </button>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div style={styles.pagination}>
              <button
                disabled={page <= 1}
                onClick={() => handlePageChange(page - 1)}
                style={{ ...styles.pageBtn, opacity: page <= 1 ? 0.5 : 1 }}
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  style={{
                    ...styles.pageBtn,
                    ...(p === page ? styles.pageBtnActive : {}),
                  }}
                >
                  {p}
                </button>
              ))}
              <button
                disabled={page >= totalPages}
                onClick={() => handlePageChange(page + 1)}
                style={{ ...styles.pageBtn, opacity: page >= totalPages ? 0.5 : 1 }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 1200,
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  heading: {
    fontSize: 22,
    fontWeight: 700,
    color: '#1a1a1a',
    margin: 0,
  },
  subheading: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  searchBar: {
    display: 'flex',
    gap: 8,
    marginBottom: 24,
  },
  searchInput: {
    flex: 1,
    padding: '10px 16px',
    border: '1.5px solid #e0e0e0',
    borderRadius: 12,
    fontSize: 14,
    outline: 'none',
    background: '#fff',
  },
  searchBtn: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: 12,
    background: '#F5B800',
    color: '#1a1a1a',
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
  },
  clearBtn: {
    padding: '10px 16px',
    border: '1.5px solid #e0e0e0',
    borderRadius: 12,
    background: '#fff',
    color: '#666',
    fontSize: 14,
    cursor: 'pointer',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: 20,
  },
  card: {
    background: '#fff',
    borderRadius: 20,
    padding: 24,
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  cardTop: {
    display: 'flex',
    gap: 14,
    alignItems: 'flex-start',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 700,
    fontSize: 20,
    flexShrink: 0,
  },
  cardInfo: {
    flex: 1,
    minWidth: 0,
  },
  driverName: {
    fontSize: 16,
    fontWeight: 700,
    color: '#1a1a1a',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  driverEmail: {
    fontSize: 13,
    color: '#666',
    margin: '2px 0 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  driverPhone: {
    fontSize: 13,
    color: '#888',
    margin: '2px 0 0',
  },
  badge: {
    fontSize: 11,
    fontWeight: 600,
    padding: '4px 10px',
    borderRadius: 20,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  vehicleSection: {
    borderTop: '1px solid #f0f0f0',
    paddingTop: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    margin: '0 0 6px',
  },
  vehicleInfo: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
  },
  vehicleTag: {
    fontSize: 12,
    color: '#555',
    background: '#f5f5f5',
    padding: '4px 10px',
    borderRadius: 8,
  },
  cardBottom: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  ratingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  ratingValue: {
    fontSize: 14,
    fontWeight: 700,
    color: '#D97706',
  },
  stars: {
    fontSize: 14,
    color: '#F5B800',
  },
  location: {
    fontSize: 12,
    color: '#888',
  },
  viewBtn: {
    width: '100%',
    padding: '10px 0',
    border: '1.5px solid #F5B800',
    borderRadius: 12,
    background: 'transparent',
    color: '#1a1a1a',
    fontWeight: 600,
    fontSize: 13,
    cursor: 'pointer',
    transition: 'background 0.2s',
    marginTop: 4,
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 32,
    flexWrap: 'wrap',
  },
  pageBtn: {
    padding: '8px 14px',
    border: '1.5px solid #e0e0e0',
    borderRadius: 10,
    background: '#fff',
    color: '#555',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
  },
  pageBtnActive: {
    background: '#F5B800',
    color: '#1a1a1a',
    borderColor: '#F5B800',
    fontWeight: 700,
  },
  center: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 20px',
  },

  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#888',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    margin: '0 0 16px',
  },
};
