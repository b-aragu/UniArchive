import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Search, Upload, LayoutDashboard, Shield, LogOut, FileText, Library } from 'lucide-react';

export const AppShell: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Documents', path: '/documents', icon: <Library size={20} /> },
    { name: 'Search', path: '/search', icon: <Search size={20} /> },
    { name: 'Upload', path: '/upload', icon: <Upload size={20} /> },
  ];

  if (user?.role === 'moderator' || user?.role === 'administrator') {
    navItems.push({ name: 'Moderator', path: '/moderator', icon: <FileText size={20} /> });
  }

  if (user?.role === 'administrator') {
    navItems.push({ name: 'Admin', path: '/admin', icon: <Shield size={20} /> });
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#fcfcfc', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#111827' }}>
      {/* Sidebar */}
      <aside style={{ width: '260px', backgroundColor: '#ffffff', borderRight: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ backgroundColor: '#2563eb', padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen color="#ffffff" size={20} />
          </div>
          <h1 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '700', letterSpacing: '-0.025em', color: '#111827' }}>UniArchive</h1>
        </div>
        
        <nav style={{ flex: 1, padding: '12px 12px' }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      color: isActive ? '#111827' : '#6b7280',
                      textDecoration: 'none',
                      backgroundColor: isActive ? '#f3f4f6' : 'transparent',
                      fontWeight: isActive ? '500' : '400',
                      fontSize: '0.9375rem',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span style={{ color: isActive ? '#2563eb' : '#9ca3af', display: 'flex' }}>
                      {React.cloneElement(item.icon as React.ReactElement, { size: 18, strokeWidth: isActive ? 2 : 1.5 } as any)}
                    </span>
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div style={{ padding: '16px 20px', borderTop: '1px solid #f3f4f6', backgroundColor: '#fafafa' }}>
          <div style={{ fontSize: '0.8125rem', color: '#6b7280', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontWeight: '500', color: '#374151', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user?.email}</span>
            <span style={{ textTransform: 'uppercase', fontSize: '0.6875rem', letterSpacing: '0.05em', color: '#9ca3af' }}>{user?.role}</span>
          </div>
          <button 
            onClick={handleLogout}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', 
              background: 'white', border: '1px solid #e5e7eb', color: '#374151', 
              cursor: 'pointer', padding: '6px 12px', fontSize: '0.8125rem', borderRadius: '6px', fontWeight: '500', width: '100%', justifyContent: 'center', transition: 'background 0.15s ease' 
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
          >
            <LogOut size={16} strokeWidth={1.5} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ height: '64px', backgroundColor: 'transparent', display: 'flex', alignItems: 'center', padding: '0 32px' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#111827', fontWeight: '600', textTransform: 'capitalize', letterSpacing: '-0.025em' }}>
            {location.pathname.replace('/', '') || 'Dashboard'}
          </h2>
        </header>
        <div style={{ flex: 1, padding: '0 32px 32px 32px', overflowY: 'auto' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};
