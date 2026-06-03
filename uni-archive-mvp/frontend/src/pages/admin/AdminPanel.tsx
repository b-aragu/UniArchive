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
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <Shield size={28} color="#1f2937" />
        <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#111827' }}>System Administration</h2>
      </div>

      {error && (
        <div style={{ padding: '16px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', color: '#92400e', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AlertTriangle size={20} />
          <div>
            <strong>Warning:</strong> {error}
            <br />
            <span style={{ fontSize: '0.875rem' }}>This endpoint might not be fully implemented in the backend MVP yet.</span>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ backgroundColor: '#eff6ff', padding: '12px', borderRadius: '8px' }}><Users color="#3b82f6" /></div>
          <div>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>Total Users</p>
            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>{stats?.users?.total !== undefined ? stats.users.total : '-'}</p>
          </div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ backgroundColor: '#ecfdf5', padding: '12px', borderRadius: '8px' }}><Server color="#10b981" /></div>
          <div>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>Total Documents</p>
            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>{stats?.documents?.total !== undefined ? stats.documents.total : '-'}</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.125rem', color: '#111827' }}>Detected Duplicates</h3>
          {duplicates.length === 0 ? (
            <div style={{ color: '#6b7280', fontSize: '0.875rem', padding: '24px', textAlign: 'center', backgroundColor: '#f9fafb', borderRadius: '6px', border: '1px dashed #d1d5db' }}>
              No duplicate documents detected.
            </div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {duplicates.map(dup => (
                <li key={dup.id} style={{ padding: '12px', borderBottom: '1px solid #f3f4f6', fontSize: '0.875rem' }}>
                  <div style={{ fontWeight: '500', color: '#111827' }}>{dup.document_a_title}</div>
                  <div style={{ color: '#6b7280', margin: '4px 0' }}>appears similar to</div>
                  <div style={{ fontWeight: '500', color: '#111827' }}>{dup.document_b_title}</div>
                  <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#b45309', backgroundColor: '#fffbeb', padding: '4px 8px', borderRadius: '4px', display: 'inline-block' }}>Hamming Distance: {dup.hamming_distance}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.125rem', color: '#111827' }}>User Management</h3>
          <div style={{ color: '#6b7280', fontSize: '0.875rem', padding: '24px', textAlign: 'center', backgroundColor: '#f9fafb', borderRadius: '6px', border: '1px dashed #d1d5db' }}>
            User list will be populated here once the `/api/admin/users` endpoint is fully integrated.
          </div>
        </div>
      </div>
    </div>
  );
};
