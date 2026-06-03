import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Search, Upload, LayoutDashboard, Shield, LogOut, FileText } from 'lucide-react';

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
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'system-ui, sans-serif' }}>
      {/* Sidebar */}
      <aside style={{ width: '250px', backgroundColor: '#1f2937', color: 'white', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #374151' }}>
          <BookOpen color="#60a5fa" />
          <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>UniArchive</h1>
        </div>
        
        <nav style={{ flex: 1, padding: '20px 0' }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 20px',
                    color: location.pathname.startsWith(item.path) ? '#60a5fa' : '#d1d5db',
                    textDecoration: 'none',
                    backgroundColor: location.pathname.startsWith(item.path) ? '#374151' : 'transparent',
                  }}
                >
                  {item.icon}
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div style={{ padding: '20px', borderTop: '1px solid #374151' }}>
          <div style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '10px' }}>
            {user?.email} <br />
            <span style={{ textTransform: 'capitalize', color: '#60a5fa' }}>{user?.role}</span>
          </div>
          <button 
            onClick={handleLogout}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', 
              background: 'none', border: 'none', color: '#f87171', 
              cursor: 'pointer', padding: 0, fontSize: '1rem' 
            }}
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{ height: '60px', backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', padding: '0 24px' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#111827', textTransform: 'capitalize' }}>
            {location.pathname.replace('/', '') || 'Dashboard'}
          </h2>
        </header>
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};
