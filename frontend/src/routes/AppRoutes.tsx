import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { HomePage } from '../pages/public/HomePage';
import { RoomsPage } from '../pages/public/RoomsPage';
import { LoginPage } from '../pages/public/LoginPage';
import { RegisterPage } from '../pages/public/RegisterPage';
import { MyBookingsPage } from '../pages/client/MyBookingsPage';
import { MyInvoicesPage } from '../pages/client/MyInvoicesPage';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { AdminRoomsPage } from '../pages/admin/AdminRoomsPage';
import { AdminBookingsPage } from '../pages/admin/AdminBookingsPage';
import { useAuthStore } from '../store/authStore';

// Protected Route Guard for Authenticated Clients
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Admin / Staff Route Guard
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, hasRole } = useAuthStore();
  const isAuthorized = isAuthenticated && (hasRole('ROLE_ADMIN') || hasRole('ROLE_EMPLEADO'));
  return isAuthorized ? <>{children}</> : <Navigate to="/login" replace />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<PublicLayout />}>
        {/* Public Routes */}
        <Route index element={<HomePage />} />
        <Route path="rooms" element={<RoomsPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        {/* Client Protected Routes */}
        <Route
          path="my-bookings"
          element={
            <PrivateRoute>
              <MyBookingsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="my-invoices"
          element={
            <PrivateRoute>
              <MyInvoicesPage />
            </PrivateRoute>
          }
        />

        {/* Admin & Staff Protected Routes */}
        <Route
          path="admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="admin/rooms"
          element={
            <AdminRoute>
              <AdminRoomsPage />
            </AdminRoute>
          }
        />
        <Route
          path="admin/bookings"
          element={
            <AdminRoute>
              <AdminBookingsPage />
            </AdminRoute>
          }
        />

        {/* 404 Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};
