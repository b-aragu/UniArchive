import React, { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import { FileText, Clock, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecentDocuments = async () => {
      try {
        const response = await apiClient.get('/api/documents?limit=5');
        setDocuments(response.data.items || []);
      } catch (err: any) {
        setError('Failed to load recent documents.');
      } finally {
        setLoading(false);
      }
    };
    fetchRecentDocuments();
  }, []);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ backgroundColor: '#eff6ff', padding: '12px', borderRadius: '8px' }}><FileText color="#3b82f6" /></div>
          <div>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>Total Documents</p>
            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>-</p>
          </div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ backgroundColor: '#ecfdf5', padding: '12px', borderRadius: '8px' }}><TrendingUp color="#10b981" /></div>
          <div>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>Your Uploads</p>
            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>-</p>
          </div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ backgroundColor: '#fef3c7', padding: '12px', borderRadius: '8px' }}><Clock color="#f59e0b" /></div>
          <div>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>Pending Review</p>
            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>-</p>
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
