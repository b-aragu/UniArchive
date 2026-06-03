# Frontend Route Map

The React frontend will utilize `react-router-dom` v6 for client-side routing.

## 1. Route Structure

```javascript
<BrowserRouter>
  <Routes>
    {/* Public Routes */}
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />

    {/* Protected Routes (Requires AuthContext Token) */}
    <Route element={<ProtectedRoute />}>
      
      {/* Shell Layout wrapper (Sidebar + Topbar) */}
      <Route element={<AppShell />}>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/documents/:id" element={<DocumentDetailPage />} />
        
        {/* Role-Based Protected Routes */}
        <Route element={<RoleRoute allowedRoles={['moderator', 'administrator']} />}>
          <Route path="/moderator" element={<ModeratorPanel />} />
        </Route>

        <Route element={<RoleRoute allowedRoles={['administrator']} />}>
          <Route path="/admin" element={<AdminPanel />} />
        </Route>

      </Route>
    </Route>
    
    {/* Fallback */}
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
</BrowserRouter>
```

## 2. Route Definitions

*   `/`: Redirects to `/dashboard` if authenticated, or `/login` if unauthenticated.
*   `/login`: Authentication entry point.
*   `/register`: Account creation.
*   `/dashboard`: User's homepage showing recent uploads or system announcements.
*   `/upload`: Document submission form with drag-and-drop and progress tracking.
*   `/search`: Main search interface supporting keyword and semantic toggling.
*   `/documents/:id`: Deep link to view document metadata, extraction details, and download the source file.
*   `/admin`: Superuser dashboard for system statistics and user role management.
*   `/moderator`: Dashboard for reviewing pending uploads and approving/rejecting documents.
