import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const titleMap = {
  '/admin': 'Dashboard',
  '/admin/applications': 'Driver Applications',
  '/admin/drivers': 'Driver Management',
  '/admin/parents': 'Parents & Children',
  '/admin/subscriptions': 'Subscription Management',
  '/admin/trips': 'Trip Management',
};

export default function Layout() {
  const location = useLocation();
  const title = titleMap[location.pathname] || 'Dashboard';

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main style={{ marginLeft: 250, flex: 1, minHeight: '100vh', background: '#f5f5f5' }}>
        <Header title={title} />
        <div style={{ padding: 24 }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
