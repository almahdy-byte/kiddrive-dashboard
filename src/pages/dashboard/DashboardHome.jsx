import { useState, useEffect } from 'react';
import api from '../../api/axios';

const cards = [
  { key: 'totalParents', label: 'Total Parents', icon: '\u{1F468}\u{200D}\u{1F469}\u{200D}\u{1F467}\u{200D}\u{1F466}', bg: '#dbeafe', color: '#1e40af' },
  { key: 'totalDrivers', label: 'Total Drivers', icon: '\u{1F697}', bg: '#dcfce7', color: '#166534' },
  { key: 'pendingApplications', label: 'Pending Applications', icon: '\u{23F3}', bg: '#fef3c7', color: '#92400e', highlight: true },
  { key: 'approvedDrivers', label: 'Approved Drivers', icon: '\u{2705}', bg: '#dcfce7', color: '#166534' },
  { key: 'rejectedApplications', label: 'Rejected Applications', icon: '\u{274C}', bg: '#fee2e2', color: '#991b1b' },
  { key: 'activeDrivers', label: 'Active Drivers', icon: '\u{1F4AA}', bg: '#dbeafe', color: '#1e40af' },
  { key: 'inactiveDrivers', label: 'Inactive Drivers', icon: '\u{1F634}', bg: '#f3e8ff', color: '#6b21a8' },
];

export default function DashboardHome() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/dashboard/stats')
      .then(({ data }) => {
        const d = data.data || data;
        setStats({
          totalParents: d.parents?.total ?? 0,
          totalDrivers: d.drivers?.total ?? 0,
          pendingApplications: d.applications?.pending ?? 0,
          approvedDrivers: d.applications?.approved ?? 0,
          rejectedApplications: d.applications?.rejected ?? 0,
          activeDrivers: d.drivers?.active ?? 0,
          inactiveDrivers: d.drivers?.inactive ?? 0,
        });
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to load dashboard stats');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={styles.center}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.center}>
        <p style={styles.errorText}>{error}</p>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <h2 style={styles.heading}>Dashboard Overview</h2>
      <div style={styles.grid}>
        {cards.map((card) => (
          <div
            key={card.key}
            style={{
              ...styles.card,
              ...(card.highlight ? styles.highlightCard : {}),
            }}
          >
            <div style={{ ...styles.iconWrap, background: card.bg, color: card.color }}>
              <span style={styles.icon}>{card.icon}</span>
            </div>
            <p style={styles.label}>{card.label}</p>
            <p style={{ ...styles.count, color: card.color }}>
              {stats?.[card.key] ?? 0}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    padding: '32px',
  },
  heading: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#1a1a1a',
    margin: '0 0 24px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px',
  },
  card: {
    borderRadius: '20px',
    padding: '24px',
    background: '#fff',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'default',
  },
  highlightCard: {
    border: '2px solid #fbbf24',
    boxShadow: '0 4px 16px rgba(251,191,36,0.25)',
  },
  iconWrap: {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  icon: {
    fontSize: '24px',
  },
  label: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#666',
    margin: '0 0 8px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  count: {
    fontSize: '32px',
    fontWeight: 700,
    margin: 0,
  },
  center: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #F5B800',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: {
    marginTop: '16px',
    fontSize: '15px',
    color: '#666',
  },
  errorText: {
    fontSize: '15px',
    color: '#991b1b',
    background: '#fee2e2',
    padding: '12px 24px',
    borderRadius: '12px',
  },
};
