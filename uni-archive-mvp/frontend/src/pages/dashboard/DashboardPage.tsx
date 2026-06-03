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
        <button onClick={() => navigate('/upload')} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#3b82f6', color: 'white', padding: '12px 24px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>
          <UploadCloud size={20} /> Upload Document
        </button>
        <button onClick={() => navigate('/search')} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#111827', color: 'white', padding: '12px 24px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>
          <SearchIcon size={20} /> Search Archive
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ backgroundColor: '#eff6ff', padding: '12px', borderRadius: '8px' }}><FileText color="#3b82f6" /></div>
          <div>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>Total Documents</p>
            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>{stats?.documents?.total !== undefined ? stats.documents.total : documents.length}</p>
          </div>
        </div>
        
        {user?.role === 'administrator' && (
          <>
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ backgroundColor: '#ecfdf5', padding: '12px', borderRadius: '8px' }}><Users color="#10b981" /></div>
              <div>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>Total Users</p>
                <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>{stats?.users?.total !== undefined ? stats.users.total : '-'}</p>
              </div>
            </div>
            
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ backgroundColor: '#f3e8ff', padding: '12px', borderRadius: '8px' }}><SearchIcon color="#a855f7" /></div>
              <div>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>Total Searches</p>
                <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>{stats?.searches?.total !== undefined ? stats.searches.total : '-'}</p>
              </div>
            </div>
          </>
        )}

        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ backgroundColor: '#fef3c7', padding: '12px', borderRadius: '8px' }}><Clock color="#f59e0b" /></div>
          <div>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>Pending Review</p>
            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>{stats?.documents?.pending !== undefined ? stats.documents.pending : '-'}</p>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.125rem', color: '#111827' }}>Recently Added</h3>
        {loading ? (
          <p style={{ color: '#6b7280' }}>Loading documents...</p>
        ) : error ? (
          <p style={{ color: '#ef4444' }}>{error}</p>
        ) : documents.length === 0 ? (
          <p style={{ color: '#6b7280' }}>No documents found.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {documents.map((doc) => (
              <li key={doc.id} style={{ padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                <Link to={`/documents/${doc.id}`} style={{ textDecoration: 'none', color: '#111827', fontWeight: '500' }}>
                  {doc.title}
                </Link>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '4px' }}>
                  Extracted via {doc.extraction_method || 'Unknown'} | {new Date(doc.created_at).toLocaleDateString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
