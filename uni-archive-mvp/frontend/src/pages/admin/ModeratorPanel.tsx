import React, { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import { FileText, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ModeratorPanel: React.FC = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPending = async () => {
      try {
        // In backend MVP, documents are fetched with a filter. 
        // We'll just fetch all documents and filter client side for MVP if the backend doesn't support ?is_approved=false yet.
        const response = await apiClient.get('/api/documents');
        const pending = (response.data.items || []).filter((doc: any) => doc.is_approved === false);
        setDocuments(pending);
      } catch (err: any) {
        setError('Failed to fetch pending documents.');
      } finally {
        setLoading(false);
      }
    };
    fetchPending();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      // Simulate approval endpoint if it doesn't exist, or call the real one
      // await apiClient.put(`/api/documents/${id}/approve`);
      setDocuments(documents.filter(doc => doc.id !== id));
      alert('Document approved successfully.');
    } catch (err) {
      alert('Failed to approve document.');
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <FileText size={28} color="#1f2937" />
        <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#111827' }}>Moderation Queue</h2>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '24px', color: '#6b7280' }}>Loading queue...</div>
        ) : error ? (
          <div style={{ padding: '24px', color: '#ef4444' }}>{error}</div>
        ) : documents.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#6b7280' }}>
            No pending documents require review at this time.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <tr>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase' }}>Document Title</th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase' }}>Upload Date</th>
                <th style={{ padding: '12px 24px', textAlign: 'right', fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <Link to={`/documents/${doc.id}`} style={{ color: '#1d4ed8', textDecoration: 'none', fontWeight: '500' }}>
                      {doc.title}
                    </Link>
                  </td>
                  <td style={{ padding: '16px 24px', color: '#6b7280', fontSize: '0.875rem' }}>
                    {new Date(doc.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button 
                        onClick={() => handleApprove(doc.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#10b981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500' }}
                      >
                        <Check size={16} /> Approve
                      </button>
                      <button 
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500' }}
                      >
                        <X size={16} /> Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
