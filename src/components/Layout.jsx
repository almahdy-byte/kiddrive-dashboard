import { useState } from 'react';
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = titleMap[location.pathname] || 'Dashboard';

  return (
    <div className="layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="layout-main">
        <Header title={title} onMenuToggle={() => setSidebarOpen(true)} />
        <div className="layout-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
