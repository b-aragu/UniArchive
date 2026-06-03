import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, RoleRoute } from './components/ProtectedRoute';
import { AppShell } from './components/AppShell';

import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { SearchPage } from './pages/search/SearchPage';
import { UploadPage } from './pages/documents/UploadPage';
import { DocumentDetailPage } from './pages/documents/DocumentDetailPage';
import { AdminPanel } from './pages/admin/AdminPanel';
import { ModeratorPanel } from './pages/admin/ModeratorPanel';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/documents/:id" element={<DocumentDetailPage />} />

              {/* Role Restricted Routes */}
              <Route element={<RoleRoute allowedRoles={['moderator', 'administrator']} />}>
                <Route path="/moderator" element={<ModeratorPanel />} />
              </Route>

              <Route element={<RoleRoute allowedRoles={['administrator']} />}>
                <Route path="/admin" element={<AdminPanel />} />
              </Route>
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}