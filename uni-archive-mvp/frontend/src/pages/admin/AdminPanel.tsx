import React, { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import { Shield, Users, Server, AlertTriangle, Key, CheckCircle, Search, Clipboard, Activity, BarChart3 } from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const statsRes = await apiClient.get('/api/admin/reports/system-stats');
        setStats(statsRes.data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to fetch system statistics.');
      }
      
      try {
        const dupRes = await apiClient.get('/api/admin/duplicates');
        setDuplicates(dupRes.data || []);
      } catch (err) {
        // Silent fail for duplicates
      }

      try {
        const usersRes = await apiClient.get('/api/admin/users');
        setUsers(usersRes.data || []);
      } catch (err) {
        // Silent fail for users
      }
      
      setLoading(false);
    };
    fetchAdminData();
  }, []);

  const searchBreakdown = stats?.searches?.breakdown || {};
  const totalSearches = stats?.searches?.total || 0;

  // Calculate percentages for search breakdown
  const getPercentage = (count: number) => {
    if (!totalSearches) return '0%';
    return `${Math.round((count / totalSearches) * 100)}%`;
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px', animation: 'fadeIn 0.3s ease-in-out' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: '#eff6ff', padding: '10px', borderRadius: '12px' }}>
          <Shield size={24} color="#2563eb" strokeWidth={2} />
        </div>
        <h2 style={{ margin: 0, fontSize: '1.75rem', color: '#111827', fontWeight: '700', letterSpacing: '-0.025em' }}>System Administration</h2>
      </div>

      {error && (
        <div style={{ padding: '20px', backgroundColor: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '12px', color: '#92400e', marginBottom: '32px', display: 'flex', alignItems: 'flex-start', gap: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <AlertTriangle size={24} strokeWidth={1.5} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong style={{ fontSize: '1rem', display: 'block', marginBottom: '4px' }}>API Connection Warning</strong>
            <span style={{ fontSize: '0.9375rem', lineHeight: '1.5' }}>{error}</span>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ backgroundColor: '#eff6ff', padding: '12px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users color="#2563eb" size={24} strokeWidth={1.5} /></div>
          <div>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Total Users</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '1.75rem', fontWeight: '700', color: '#111827', letterSpacing: '-0.025em' }}>{stats?.users?.total !== undefined ? stats.users.total : users.length}</p>
          </div>
        </div>
        
        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ backgroundColor: '#ecfdf5', padding: '12px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Server color="#059669" size={24} strokeWidth={1.5} /></div>
          <div>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Total Documents</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '1.75rem', fontWeight: '700', color: '#111827', letterSpacing: '-0.025em' }}>{stats?.documents?.total !== undefined ? stats.documents.total : '-'}</p>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ backgroundColor: '#fffbeb', padding: '12px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Clipboard color="#d97706" size={24} strokeWidth={1.5} /></div>
          <div>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Pending Approval</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '1.75rem', fontWeight: '700', color: '#111827', letterSpacing: '-0.025em' }}>{stats?.documents?.pending !== undefined ? stats.documents.pending : '-'}</p>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ backgroundColor: '#fef2f2', padding: '12px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><AlertTriangle color="#dc2626" size={24} strokeWidth={1.5} /></div>
          <div>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Duplicates Count</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '1.75rem', fontWeight: '700', color: '#111827', letterSpacing: '-0.025em' }}>{duplicates.length}</p>
          </div>
        </div>
      </div>

      {/* Responsive Panels Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        
        {/* Detected Duplicates Panel */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6', backgroundColor: '#fafafa' }}>
            <h3 style={{ margin: 0, fontSize: '1.0625rem', color: '#111827', fontWeight: '600', letterSpacing: '-0.01em' }}>Detected Duplicates</h3>
          </div>
          <div style={{ padding: '0', flex: 1, overflowY: 'auto', maxHeight: '400px' }}>
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

        {/* User Management Panel */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6', backgroundColor: '#fafafa' }}>
            <h3 style={{ margin: 0, fontSize: '1.0625rem', color: '#111827', fontWeight: '600', letterSpacing: '-0.01em' }}>User Accounts</h3>
          </div>
          <div style={{ padding: '0', flex: 1, overflowY: 'auto', maxHeight: '400px' }}>
            {users.length === 0 ? (
              <div style={{ color: '#9ca3af', fontSize: '0.9375rem', padding: '48px 24px', textAlign: 'center' }}>
                No system users found.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead style={{ backgroundColor: '#fafafa', borderBottom: '1px solid #f3f4f6', position: 'sticky', top: 0 }}>
                  <tr>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#6b7280', fontWeight: '600' }}>Name</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#6b7280', fontWeight: '600' }}>Role</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', color: '#6b7280', fontWeight: '600' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: '600', color: '#111827' }}>{u.full_name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{u.email}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ 
                          textTransform: 'uppercase', 
                          fontSize: '0.6875rem', 
                          fontWeight: '700', 
                          letterSpacing: '0.05em', 
                          color: u.role?.name === 'administrator' ? '#dc2626' : u.role?.name === 'moderator' ? '#d97706' : '#2563eb',
                          backgroundColor: u.role?.name === 'administrator' ? '#fef2f2' : u.role?.name === 'moderator' ? '#fffbeb' : '#eff6ff',
                          padding: '2px 8px',
                          borderRadius: '10px'
                        }}>
                          {u.role?.name || 'student'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <span style={{ 
                          display: 'inline-block',
                          width: '8px', 
                          height: '8px', 
                          borderRadius: '50%', 
                          backgroundColor: u.is_active ? '#10b981' : '#d1d5db' 
                        }} title={u.is_active ? 'Active' : 'Inactive'} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Search Insights & System Health Panel */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6', backgroundColor: '#fafafa', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} color="#2563eb" />
            <h3 style={{ margin: 0, fontSize: '1.0625rem', color: '#111827', fontWeight: '600', letterSpacing: '-0.01em' }}>Search & Health Analytics</h3>
          </div>
          
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Search Type Breakdown */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
                <BarChart3 size={16} color="#4b5563" />
                <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Search Query Distribution</h4>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: '#4b5563', marginBottom: '4px' }}>
                    <span>Keyword Search</span>
                    <span style={{ fontWeight: '600' }}>{searchBreakdown.keyword || 0} ({getPercentage(searchBreakdown.keyword || 0)})</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: getPercentage(searchBreakdown.keyword || 0), height: '100%', backgroundColor: '#2563eb', borderRadius: '3px' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: '#4b5563', marginBottom: '4px' }}>
                    <span>Semantic Search</span>
                    <span style={{ fontWeight: '600' }}>{searchBreakdown.semantic || 0} ({getPercentage(searchBreakdown.semantic || 0)})</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: getPercentage(searchBreakdown.semantic || 0), height: '100%', backgroundColor: '#10b981', borderRadius: '3px' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: '#4b5563', marginBottom: '4px' }}>
                    <span>Hybrid Search</span>
                    <span style={{ fontWeight: '600' }}>{searchBreakdown.hybrid || 0} ({getPercentage(searchBreakdown.hybrid || 0)})</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: getPercentage(searchBreakdown.hybrid || 0), height: '100%', backgroundColor: '#8b5cf6', borderRadius: '3px' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* System Health Indicators */}
            <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '20px' }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>System Status Health</h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ backgroundColor: '#f9fafb', padding: '12px', borderRadius: '8px', border: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>API Gateway</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                    <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#111827' }}>Operational</span>
                  </div>
                </div>

                <div style={{ backgroundColor: '#f9fafb', padding: '12px', borderRadius: '8px', border: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Database Connection</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                    <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#111827' }}>Connected</span>
                  </div>
                </div>

                <div style={{ backgroundColor: '#f9fafb', padding: '12px', borderRadius: '8px', border: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>OCR Queue Worker</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                    <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#111827' }}>Listening</span>
                  </div>
                </div>

                <div style={{ backgroundColor: '#f9fafb', padding: '12px', borderRadius: '8px', border: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Vector Index Engine</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                    <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#111827' }}>Synchronized</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
