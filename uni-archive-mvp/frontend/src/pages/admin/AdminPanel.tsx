import React, { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import { Shield, Users, Server, AlertTriangle } from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const statsRes = await apiClient.get('/api/admin/reports/system-stats');
        setStats(statsRes.data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to fetch system statistics.');
      }
      
      try {
        const dupRes = await apiClient.get('/api/admin/duplicates');
        setDuplicates(dupRes.data || []);
      } catch (err) {
        // Silent fail for duplicates if endpoint isn't ready
      }
      
      setLoading(false);
    };
    fetchAdminData();
  }, []);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: '#f3f4f6', padding: '10px', borderRadius: '12px' }}>
          <Shield size={24} color="#111827" strokeWidth={2} />
        </div>
        <h2 style={{ margin: 0, fontSize: '1.75rem', color: '#111827', fontWeight: '700', letterSpacing: '-0.025em' }}>System Administration</h2>
      </div>

      {error && (
        <div style={{ padding: '20px', backgroundColor: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '12px', color: '#92400e', marginBottom: '32px', display: 'flex', alignItems: 'flex-start', gap: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <AlertTriangle size={24} strokeWidth={1.5} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong style={{ fontSize: '1rem', display: 'block', marginBottom: '4px' }}>API Connection Warning</strong>
            <span style={{ fontSize: '0.9375rem', lineHeight: '1.5' }}>{error}</span>
            <div style={{ fontSize: '0.8125rem', marginTop: '8px', color: '#b45309' }}>This endpoint might not be fully implemented in the backend MVP yet.</div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ backgroundColor: '#eff6ff', padding: '12px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users color="#2563eb" size={24} strokeWidth={1.5} /></div>
          <div>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Total Users</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '1.75rem', fontWeight: '700', color: '#111827', letterSpacing: '-0.025em' }}>{stats?.users?.total !== undefined ? stats.users.total : '-'}</p>
          </div>
        </div>
        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ backgroundColor: '#ecfdf5', padding: '12px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Server color="#059669" size={24} strokeWidth={1.5} /></div>
          <div>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Total Documents</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '1.75rem', fontWeight: '700', color: '#111827', letterSpacing: '-0.025em' }}>{stats?.documents?.total !== undefined ? stats.documents.total : '-'}</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6', backgroundColor: '#fafafa' }}>
            <h3 style={{ margin: 0, fontSize: '1.0625rem', color: '#111827', fontWeight: '600', letterSpacing: '-0.01em' }}>Detected Duplicates</h3>
          </div>
          <div style={{ padding: '0' }}>
            {duplicates.length === 0 ? (
              <div style={{ color: '#9ca3af', fontSize: '0.9375rem', padding: '48px 24px', textAlign: 'center' }}>
                No duplicate documents detected.
              </div>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {duplicates.map((dup, index) => (
                  <li key={dup.id || index} style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6', fontSize: '0.9375rem' }}>
                    <div style={{ fontWeight: '600', color: '#111827', marginBottom: '4px' }}>{dup.document_a_title}</div>
                    <div style={{ color: '#6b7280', fontSize: '0.8125rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ height: '1px', backgroundColor: '#e5e7eb', flex: 1 }}></span>
                      appears similar to
                      <span style={{ height: '1px', backgroundColor: '#e5e7eb', flex: 1 }}></span>
                    </div>
                    <div style={{ fontWeight: '600', color: '#111827', marginTop: '4px' }}>{dup.document_b_title}</div>
                    <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: '#b45309', backgroundColor: '#fffbeb', border: '1px solid #fef3c7', padding: '4px 10px', borderRadius: '12px', fontWeight: '600', letterSpacing: '0.025em' }}>Hamming Distance: {dup.hamming_distance}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6', backgroundColor: '#fafafa' }}>
            <h3 style={{ margin: 0, fontSize: '1.0625rem', color: '#111827', fontWeight: '600', letterSpacing: '-0.01em' }}>User Management</h3>
          </div>
          <div style={{ padding: '48px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '200px' }}>
            <div style={{ backgroundColor: '#f3f4f6', padding: '16px', borderRadius: '50%', marginBottom: '16px' }}>
              <Users size={32} color="#9ca3af" strokeWidth={1.5} />
            </div>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9375rem', maxWidth: '80%' }}>User list will be populated here once the <code style={{ backgroundColor: '#f3f4f6', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8125rem' }}>/api/admin/users</code> endpoint is fully integrated.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
