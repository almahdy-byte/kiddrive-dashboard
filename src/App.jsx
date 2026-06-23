import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import OTPVerify from './pages/auth/OTPVerify';
import ForgotPassword from './pages/auth/ForgotPassword';

import DashboardHome from './pages/dashboard/DashboardHome';
import DriverApplications from './pages/applications/DriverApplications';
import DriverManagement from './pages/drivers/DriverManagement';
import DriverDetails from './pages/drivers/DriverDetails';
import ParentManagement from './pages/parents/ParentManagement';
import SubscriptionManagement from './pages/subscriptions/SubscriptionManagement';
import TripManagement from './pages/trips/TripManagement';
import EditChild from './pages/children/EditChild';

function AdminRoute({ children }) {
  return <ProtectedRoute requiredRole="admin">{children}</ProtectedRoute>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<OTPVerify />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Layout />
              </AdminRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="applications" element={<DriverApplications />} />
            <Route path="drivers" element={<DriverManagement />} />
            <Route path="drivers/:driverId" element={<DriverDetails />} />
            <Route path="parents" element={<ParentManagement />} />
            <Route path="subscriptions" element={<SubscriptionManagement />} />
            <Route path="trips" element={<TripManagement />} />
            <Route path="children/:childId/edit" element={<EditChild />} />
          </Route>

          <Route path="/" element={<Navigate to="/admin" replace />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
