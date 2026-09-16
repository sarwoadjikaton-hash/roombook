import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { BookingProvider } from './context/BookingContext';
import { PublicLayout } from './components/layout/PublicLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { DashboardPage } from './pages/DashboardPage';
import { CalendarBookingPage } from './pages/CalendarBookingPage';
import { DisplayRoomPage } from './pages/DisplayRoomPage';

import { QuickBookMobilePage } from './pages/QuickBookMobilePage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { ApprovalsPage } from './pages/admin/ApprovalsPage';
import { RoomsManagementPage } from './pages/admin/RoomsManagementPage';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { ReportsPage } from './pages/admin/ReportsPage';
import { GoogleSyncSettingsPage } from './pages/admin/GoogleSyncSettingsPage';
import { AuditLogsPage } from './pages/admin/AuditLogsPage';
import { LoginPage } from './pages/LoginPage';
import { MyBookingsPage } from './pages/MyBookingsPage';
import { ToastContainer } from './components/common/ToastContainer';

export const App: React.FC = () => {
  return (
    <BookingProvider>
      <ToastContainer />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          {/* Public Kiosk TV Display Route (Layar Penuh Kiosk) */}
          <Route path="/display/:roomId" element={<DisplayRoomPage />} />
          <Route path="/display" element={<Navigate to="/display/ruang-sekjen" replace />} />

          {/* Mobile Quick Book via Scan QR Code Route */}
          <Route path="/quick-book/:roomId" element={<QuickBookMobilePage />} />
          <Route path="/quick-book" element={<Navigate to="/quick-book/ruang-sekjen" replace />} />

          {/* Login Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Public Web App Layout: Floating Rounded Navbar */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="booking" element={<CalendarBookingPage />} />
            <Route path="my-bookings" element={<MyBookingsPage />} />
            <Route path="search" element={<MyBookingsPage />} />
          </Route>

          {/* Admin Web App Layout: Vertical Sidebar Panel */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="approvals" element={<ApprovalsPage />} />
            <Route path="rooms" element={<RoomsManagementPage />} />
            <Route path="users" element={<UserManagementPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="google-sync" element={<GoogleSyncSettingsPage />} />
            <Route path="audit" element={<AuditLogsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </BookingProvider>
  );
};

export default App;
