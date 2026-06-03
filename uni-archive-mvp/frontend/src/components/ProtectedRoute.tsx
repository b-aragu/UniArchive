import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <Outlet />;
};

export const UnauthorizedPage: React.FC = () => {
  const { logout } = useAuth();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ textAlign: 'center', maxWidth: '480px', padding: '40px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#dc2626', margin: '0 0 12px 0', letterSpacing: '-0.025em' }}>Access Denied</h1>
        <p style={{ color: '#4b5563', fontSize: '1rem', lineHeight: '1.5', margin: '0 0 24px 0' }}>
          You do not have the required permissions to view this page. If you believe this is an error, please contact your administrator.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <a 
            href="/dashboard"
            style={{ 
              textDecoration: 'none', backgroundColor: '#2563eb', color: 'white', 
              padding: '10px 20px', borderRadius: '8px', fontSize: '0.875rem', fontWeight: '600', 
              boxShadow: '0 1px 2px rgba(37,99,235,0.2)', transition: 'background-color 0.15s ease' 
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
          >
            Back to Dashboard
          </a>
          <button 
            onClick={() => {
              logout();
              window.location.href = '/login';
            }}
            style={{ 
              backgroundColor: 'white', border: '1px solid #d1d5db', color: '#374151', 
              padding: '10px 20px', borderRadius: '8px', fontSize: '0.875rem', fontWeight: '600', 
              cursor: 'pointer', transition: 'background-color 0.15s ease' 
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export const RoleRoute: React.FC<{ allowedRoles: string[] }> = ({ allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (user && !allowedRoles.includes(user.role)) {
    return <UnauthorizedPage />;
  }
  
  return <Outlet />;
};
