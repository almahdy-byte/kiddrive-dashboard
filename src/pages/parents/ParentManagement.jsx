import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';

const AVATAR_COLORS = ['#F5B800', '#4F46E5', '#059669', '#DC2626', '#D97706', '#7C3AED', '#0891B2', '#BE123C'];

function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const LIMIT = 12;

export default function ParentManagement() {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedParent, setSelectedParent] = useState(null);

  const fetchParents = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (search) params.search = search;
      const { data } = await api.get('/admin/parents', { params });
      setParents(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch {
      setParents([]);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchParents(); }, [fetchParents]);
  useEffect(() => { setPage(1); }, [search]);

  const pageNumbers = () => {
    const pages = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.pageTitle}>Parents & Children</h1>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={styles.toolbar}>
          <div className="search-bar" style={{ width: 320 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              className="input-field"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span style={{ fontSize: 13, color: '#888' }}>
            {parents.length} parent{parents.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="empty-state"><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : parents.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 60, height: 60, opacity: 0.3 }}>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <p>{search ? 'No parents match your search.' : 'No parents found.'}</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {parents.map((parent) => {
              const id = parent._id || parent.id;
              const name = parent.fullName || `${parent.firstName || ''} ${parent.lastName || ''}`.trim() || parent.email || '—';
              const children = parent.children || [];
              return (
                <div
                  key={id}
                  style={styles.card}
                  onClick={() => setSelectedParent(parent)}
                >
                  <div style={styles.cardTop}>
                    <div style={{ ...styles.avatar, background: getAvatarColor(name) }}>
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={styles.name}>{name}</h3>
                      <p style={styles.email}>{parent.email}</p>
                      {parent.phone && <p style={styles.phone}>{parent.phone}</p>}
                      <p style={styles.meta}>
                        {parent.location ? [parent.location.city, parent.location.department].filter(Boolean).join(', ') : ''}
                        {parent.isVerified ? <span style={styles.verified}>Verified</span> : null}
                      </p>
                    </div>
                    <span style={styles.count}>{children.length} child{children.length !== 1 ? 'ren' : ''}</span>
                  </div>
                  {children.length > 0 && (
                    <div style={styles.childrenPreview}>
                      {children.slice(0, 3).map((c) => (
                        <span key={c._id || c.id} style={styles.childTag}>
                          {c.name}
                        </span>
                      ))}
                      {children.length > 3 && <span style={styles.childTag}>+{children.length - 3} more</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div style={styles.pagination}>
            <button className="btn btn-sm btn-outline" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</button>
            {pageNumbers().map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{
                  ...styles.pageBtn,
                  ...(p === page ? { background: '#1a1a1a', color: '#fff', borderColor: '#1a1a1a' } : {}),
                }}
              >{p}</button>
            ))}
            <button className="btn btn-sm btn-outline" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</button>
          </div>
        )}
      </div>

      {selectedParent && (
        <div className="modal-overlay" onClick={() => setSelectedParent(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 700 }}>
            <div className="modal-header">
              <h2>Parent Details</h2>
              <button className="modal-close" onClick={() => setSelectedParent(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div style={styles.parentInfo}>
                <div style={{ ...styles.avatarLarge, background: getAvatarColor(selectedParent.fullName || selectedParent.email) }}>
                  {(selectedParent.fullName || selectedParent.email || 'P').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18 }}>{selectedParent.fullName || `${selectedParent.firstName || ''} ${selectedParent.lastName || ''}`.trim()}</h3>
                  <p style={{ margin: '4px 0', color: '#666' }}>{selectedParent.email}</p>
                  <p style={{ margin: 0, color: '#888', fontSize: 13 }}>{selectedParent.phone || '—'}</p>
                  {selectedParent.location && (
                    <p style={{ margin: '2px 0', color: '#888', fontSize: 13 }}>
                      {[selectedParent.location.city, selectedParent.location.department].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>
              </div>

              <h3 style={styles.childrenHeading}>
                Children ({selectedParent.children?.length || 0})
              </h3>

              {(selectedParent.children || []).length === 0 ? (
                <p style={{ color: '#888', fontSize: 14 }}>No children registered.</p>
              ) : (
                <div style={styles.childrenGrid}>
                  {(selectedParent.children || []).map((child) => (
                    <div key={child._id || child.id} style={styles.childCard}>
                      <div style={{ ...styles.childAvatar, background: getAvatarColor(child.name) }}>
                        {(child.name || '?').charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={styles.childName}>{child.name}</p>
                        <p style={styles.childMeta}>
                          {child.age ? `${child.age} yrs` : ''} {child.gender ? `· ${child.gender}` : ''}
                        </p>
                        {child.school && <p style={styles.childSchool}>{child.school}</p>}
                      </div>
                      {child.gender === 'male' ? '♂' : '♀'}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: 24 },
  pageTitle: { fontSize: 24, fontWeight: 700, marginBottom: 24 },
  toolbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 20, flexWrap: 'wrap' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 },
  card: {
    background: '#fff', borderRadius: 20, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s',
  },
  cardTop: { display: 'flex', gap: 14, alignItems: 'flex-start' },
  avatar: { width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 18, flexShrink: 0 },
  name: { margin: 0, fontSize: 15, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  email: { margin: '2px 0', fontSize: 13, color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  phone: { margin: '2px 0', fontSize: 12, color: '#888' },
  meta: { margin: 0, fontSize: 12, color: '#999', display: 'flex', gap: 8, alignItems: 'center' },
  verified: { fontSize: 10, fontWeight: 600, color: '#166534', background: '#dcfce7', padding: '2px 8px', borderRadius: 10 },
  count: { fontSize: 12, fontWeight: 600, color: '#888', background: '#f5f5f5', padding: '4px 12px', borderRadius: 20, whiteSpace: 'nowrap', flexShrink: 0 },
  childrenPreview: { display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12, paddingTop: 12, borderTop: '1px solid #f0f0f0' },
  childTag: { fontSize: 12, background: '#f0f0f0', color: '#555', padding: '4px 10px', borderRadius: 20, fontWeight: 500 },
  pagination: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '20px 0 4px' },
  pageBtn: { width: 36, height: 36, border: '1.5px solid #e0e0e0', borderRadius: 10, background: '#fff', color: '#333', fontWeight: 600, fontSize: 13, cursor: 'pointer' },
  parentInfo: { display: 'flex', gap: 16, alignItems: 'center', marginBottom: 24, padding: 16, background: '#f9fafb', borderRadius: 16 },
  avatarLarge: { width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 24, flexShrink: 0 },
  childrenHeading: { fontSize: 16, fontWeight: 600, marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #eee' },
  childrenGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 },
  childCard: { display: 'flex', gap: 12, alignItems: 'center', padding: '12px 16px', background: '#f9fafb', borderRadius: 16 },
  childAvatar: { width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 16, flexShrink: 0 },
  childName: { margin: 0, fontSize: 14, fontWeight: 600 },
  childMeta: { margin: '2px 0', fontSize: 12, color: '#888' },
  childSchool: { margin: 0, fontSize: 12, color: '#666' },
};
