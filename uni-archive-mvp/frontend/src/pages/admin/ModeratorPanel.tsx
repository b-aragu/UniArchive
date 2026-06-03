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
      await apiClient.post(`/api/documents/${id}/approve`);
      setDocuments(documents.filter(doc => doc.id !== id));
      alert('Document approved successfully.');
    } catch (err) {
      alert('Failed to approve document.');
    }
  };

  const handleReject = async (id: string) => {
    if (!window.confirm('Are you sure you want to reject and delete this document?')) return;
    try {
      await apiClient.delete(`/api/documents/${id}`);
      setDocuments(documents.filter(doc => doc.id !== id));
      alert('Document rejected and deleted successfully.');
    } catch (err) {
      alert('Failed to reject document.');
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: '#f3f4f6', padding: '10px', borderRadius: '12px' }}>
          <FileText size={24} color="#111827" strokeWidth={2} />
        </div>
        <h2 style={{ margin: 0, fontSize: '1.75rem', color: '#111827', fontWeight: '700', letterSpacing: '-0.025em' }}>Moderation Queue</h2>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '48px', color: '#6b7280', textAlign: 'center', fontSize: '0.9375rem' }}>Loading queue...</div>
        ) : error ? (
          <div style={{ padding: '48px', color: '#ef4444', textAlign: 'center', fontSize: '0.9375rem' }}>{error}</div>
        ) : documents.length === 0 ? (
          <div style={{ padding: '64px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ backgroundColor: '#f3f4f6', padding: '16px', borderRadius: '50%', marginBottom: '16px' }}>
              <Check size={32} color="#9ca3af" strokeWidth={1.5} />
            </div>
            <p style={{ margin: 0, color: '#111827', fontSize: '1.0625rem', fontWeight: '600' }}>All caught up!</p>
            <p style={{ margin: '8px 0 0 0', color: '#6b7280', fontSize: '0.9375rem' }}>No pending documents require review at this time.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#fafafa', borderBottom: '1px solid #f3f4f6' }}>
              <tr>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Document Title</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Upload Date</th>
                <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background-color 0.15s ease' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fafafa'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ padding: '20px 24px' }}>
                    <Link to={`/documents/${doc.id}`} style={{ color: '#111827', textDecoration: 'none', fontWeight: '600', fontSize: '0.9375rem', display: 'block', transition: 'color 0.15s ease' }} onMouseOver={(e) => e.currentTarget.style.color = '#2563eb'} onMouseOut={(e) => e.currentTarget.style.color = '#111827'}>
                      {doc.title}
                    </Link>
                  </td>
                  <td style={{ padding: '20px 24px', color: '#6b7280', fontSize: '0.875rem', fontWeight: '500' }}>
                    {new Date(doc.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button
                        onClick={() => handleApprove(doc.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: '600', transition: 'all 0.15s ease' }}
                        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#d1fae5'; }}
                        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#ecfdf5'; }}
                      >
                        <Check size={14} strokeWidth={2.5} /> Approve
                      </button>
                      <button
                        onClick={() => handleReject(doc.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: '600', transition: 'all 0.15s ease' }}
                        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#fee2e2'; }}
                        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#fef2f2'; }}
                      >
                        <X size={14} strokeWidth={2.5} /> Reject
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
