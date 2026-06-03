import React, { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import { FileText, Clock, TrendingUp, UploadCloud, Search as SearchIcon, Users, Copy } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const docsPromise = apiClient.get('/api/documents?limit=5');
        let statsPromise: Promise<any> = Promise.resolve(null);
        
        if (user?.role === 'administrator') {
          statsPromise = apiClient.get('/api/admin/reports/system-stats');
        }

        const [docsRes, statsRes] = await Promise.allSettled([docsPromise, statsPromise]);
        
        if (docsRes.status === 'fulfilled') {
          setDocuments(docsRes.value.data.items || []);
        } else {
          setError('Failed to load recent documents.');
        }

        if (statsRes.status === 'fulfilled' && statsRes.value) {
          setStats(statsRes.value.data);
        }
      } catch (err: any) {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  return (
    <div>
      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
        <button onClick={() => navigate('/upload')} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#2563eb', color: 'white', padding: '10px 20px', border: '1px solid transparent', borderRadius: '8px', fontWeight: '500', cursor: 'pointer', fontSize: '0.9375rem', boxShadow: '0 1px 2px rgba(37,99,235,0.2)', transition: 'background-color 0.15s ease' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}>
          <UploadCloud size={18} strokeWidth={2} /> Upload Document
        </button>
        <button onClick={() => navigate('/search')} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#ffffff', color: '#111827', padding: '10px 20px', border: '1px solid #d1d5db', borderRadius: '8px', fontWeight: '500', cursor: 'pointer', fontSize: '0.9375rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', transition: 'all 0.15s ease' }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f9fafb'; e.currentTarget.style.borderColor = '#9ca3af'; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.borderColor = '#d1d5db'; }}>
          <SearchIcon size={18} strokeWidth={2} /> Search Archive
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ backgroundColor: '#eff6ff', padding: '12px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileText color="#2563eb" size={24} strokeWidth={1.5} /></div>
          <div>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Total Documents</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '1.75rem', fontWeight: '700', color: '#111827', letterSpacing: '-0.025em' }}>{stats?.documents?.total !== undefined ? stats.documents.total : documents.length}</p>
          </div>
        </div>
        
        {user?.role === 'administrator' && (
          <>
            <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ backgroundColor: '#ecfdf5', padding: '12px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users color="#059669" size={24} strokeWidth={1.5} /></div>
              <div>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Total Users</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '1.75rem', fontWeight: '700', color: '#111827', letterSpacing: '-0.025em' }}>{stats?.users?.total !== undefined ? stats.users.total : '-'}</p>
              </div>
            </div>
            
            <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ backgroundColor: '#f5f3ff', padding: '12px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><SearchIcon color="#7c3aed" size={24} strokeWidth={1.5} /></div>
              <div>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Total Searches</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '1.75rem', fontWeight: '700', color: '#111827', letterSpacing: '-0.025em' }}>{stats?.searches?.total !== undefined ? stats.searches.total : '-'}</p>
              </div>
            </div>
          </>
        )}

        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ backgroundColor: '#fffbeb', padding: '12px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Clock color="#d97706" size={24} strokeWidth={1.5} /></div>
          <div>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Pending Review</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '1.75rem', fontWeight: '700', color: '#111827', letterSpacing: '-0.025em' }}>{stats?.documents?.pending !== undefined ? stats.documents.pending : '-'}</p>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6', backgroundColor: '#fafafa' }}>
          <h3 style={{ margin: 0, fontSize: '1.0625rem', color: '#111827', fontWeight: '600', letterSpacing: '-0.01em' }}>Recently Added</h3>
        </div>
        <div style={{ padding: '0' }}>
          {loading ? (
            <div style={{ padding: '32px', color: '#6b7280', textAlign: 'center', fontSize: '0.9375rem' }}>Loading documents...</div>
          ) : error ? (
            <div style={{ padding: '32px', color: '#ef4444', textAlign: 'center', fontSize: '0.9375rem' }}>{error}</div>
          ) : documents.length === 0 ? (
            <div style={{ padding: '48px', color: '#9ca3af', textAlign: 'center', fontSize: '0.9375rem' }}>No documents found.</div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {documents.map((doc) => (
                <li key={doc.id} style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6', transition: 'background-color 0.15s ease' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fafafa'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <Link to={`/documents/${doc.id}`} style={{ textDecoration: 'none', color: '#111827', fontWeight: '500', fontSize: '0.9375rem', display: 'block' }}>
                    {doc.title}
                  </Link>
                  <div style={{ fontSize: '0.8125rem', color: '#6b7280', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ backgroundColor: '#f3f4f6', padding: '2px 6px', borderRadius: '4px', color: '#4b5563', fontWeight: '500' }}>{doc.extraction_method || 'Unknown'}</span>
                    <span>•</span>
                    <span>{new Date(doc.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
