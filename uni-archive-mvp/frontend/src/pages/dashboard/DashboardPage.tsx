import React, { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import { FileText, Clock, UploadCloud, Search as SearchIcon, Users, Copy, CheckCircle, ShieldAlert, BarChart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [duplicateCount, setDuplicateCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch 100 documents to have a solid pool for frontend aggregation
        const docsPromise = apiClient.get('/api/documents?limit=100');
        let statsPromise: Promise<any> = Promise.resolve(null);
        let dupsPromise: Promise<any> = Promise.resolve(null);
        
        if (user?.role === 'administrator') {
          statsPromise = apiClient.get('/api/admin/reports/system-stats');
        }
        if (user?.role === 'administrator' || user?.role === 'moderator') {
          dupsPromise = apiClient.get('/api/admin/duplicates');
        }

        const [docsRes, statsRes, dupsRes] = await Promise.allSettled([
          docsPromise,
          statsPromise,
          dupsPromise
        ]);
        
        if (docsRes.status === 'fulfilled') {
          setDocuments(docsRes.value.data.items || []);
        } else {
          setError('Failed to load recent documents.');
        }

        if (statsRes.status === 'fulfilled' && statsRes.value) {
          setStats(statsRes.value.data);
        }

        if (dupsRes.status === 'fulfilled' && dupsRes.value) {
          setDuplicateCount((dupsRes.value.data || []).length);
        }
      } catch (err: any) {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  // Client-side calculations based on fetched pool
  const approvedDocs = documents.filter(d => d.is_approved);
  const pendingDocs = documents.filter(d => !d.is_approved);
  const myDocs = documents.filter(d => d.uploaded_by === user?.id);

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
      {/* Quick Actions Header */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
        <button 
          onClick={() => navigate('/upload')} 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#2563eb', color: 'white', padding: '10px 20px', border: '1px solid transparent', borderRadius: '8px', fontWeight: '500', cursor: 'pointer', fontSize: '0.9375rem', boxShadow: '0 1px 2px rgba(37,99,235,0.2)', transition: 'background-color 0.15s ease' }} 
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'} 
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
        >
          <UploadCloud size={18} strokeWidth={2} /> Upload Document
        </button>
        <button 
          onClick={() => navigate('/search')} 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#ffffff', color: '#111827', padding: '10px 20px', border: '1px solid #d1d5db', borderRadius: '8px', fontWeight: '500', cursor: 'pointer', fontSize: '0.9375rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', transition: 'all 0.15s ease' }} 
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f9fafb'; e.currentTarget.style.borderColor = '#9ca3af'; }} 
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.borderColor = '#d1d5db'; }}
        >
          <SearchIcon size={18} strokeWidth={2} /> Search Archive
        </button>
      </div>

      {/* Role-Specific Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        
        {/* STUDENT VIEW */}
        {user?.role === 'student' && (
          <>
            <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ backgroundColor: '#eff6ff', padding: '12px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle color="#2563eb" size={24} strokeWidth={1.5} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Approved Documents</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '1.75rem', fontWeight: '700', color: '#111827', letterSpacing: '-0.025em' }}>
                  {loading ? '-' : approvedDocs.length}
                </p>
              </div>
            </div>
            
            <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ backgroundColor: '#ecfdf5', padding: '12px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText color="#059669" size={24} strokeWidth={1.5} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>My Uploads</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '1.75rem', fontWeight: '700', color: '#111827', letterSpacing: '-0.025em' }}>
                  {loading ? '-' : myDocs.length}
                </p>
              </div>
            </div>
          </>
        )}

        {/* MODERATOR VIEW */}
        {user?.role === 'moderator' && (
          <>
            <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ backgroundColor: '#fffbeb', padding: '12px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock color="#d97706" size={24} strokeWidth={1.5} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Pending Review</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '1.75rem', fontWeight: '700', color: '#111827', letterSpacing: '-0.025em' }}>
                  {loading ? '-' : pendingDocs.length}
                </p>
              </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ backgroundColor: '#fef2f2', padding: '12px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldAlert color="#dc2626" size={24} strokeWidth={1.5} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Duplicate Alerts</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '1.75rem', fontWeight: '700', color: '#111827', letterSpacing: '-0.025em' }}>
                  {loading ? '-' : duplicateCount}
                </p>
              </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ backgroundColor: '#eff6ff', padding: '12px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText color="#2563eb" size={24} strokeWidth={1.5} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Total Documents</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '1.75rem', fontWeight: '700', color: '#111827', letterSpacing: '-0.025em' }}>
                  {loading ? '-' : documents.length}
                </p>
              </div>
            </div>
          </>
        )}

        {/* ADMINISTRATOR VIEW */}
        {user?.role === 'administrator' && (
          <>
            <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ backgroundColor: '#eff6ff', padding: '12px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users color="#2563eb" size={24} strokeWidth={1.5} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Total Users</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '1.75rem', fontWeight: '700', color: '#111827', letterSpacing: '-0.025em' }}>
                  {stats?.users?.total !== undefined ? stats.users.total : '-'}
                </p>
              </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ backgroundColor: '#ecfdf5', padding: '12px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText color="#059669" size={24} strokeWidth={1.5} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Total Documents</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '1.75rem', fontWeight: '700', color: '#111827', letterSpacing: '-0.025em' }}>
                  {stats?.documents?.total !== undefined ? stats.documents.total : '-'}
                </p>
              </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ backgroundColor: '#f5f3ff', padding: '12px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BarChart color="#7c3aed" size={24} strokeWidth={1.5} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Total Searches</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '1.75rem', fontWeight: '700', color: '#111827', letterSpacing: '-0.025em' }}>
                  {stats?.searches?.total !== undefined ? stats.searches.total : '-'}
                </p>
              </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ backgroundColor: '#fef2f2', padding: '12px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldAlert color="#dc2626" size={24} strokeWidth={1.5} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Duplicate Count</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '1.75rem', fontWeight: '700', color: '#111827', letterSpacing: '-0.025em' }}>
                  {duplicateCount}
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Role-Specific Content Lists */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        
        {/* STUDENT RECENT LIST */}
        {user?.role === 'student' && (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6', backgroundColor: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.0625rem', color: '#111827', fontWeight: '600', letterSpacing: '-0.01em' }}>Recent Documents</h3>
              <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Showing last 5 updates</span>
            </div>
            <div>
              {loading ? (
                <div style={{ padding: '32px', color: '#6b7280', textAlign: 'center', fontSize: '0.9375rem' }}>Loading documents...</div>
              ) : error ? (
                <div style={{ padding: '32px', color: '#ef4444', textAlign: 'center', fontSize: '0.9375rem' }}>{error}</div>
              ) : documents.length === 0 ? (
                <div style={{ padding: '48px', color: '#9ca3af', textAlign: 'center', fontSize: '0.9375rem' }}>No documents in system yet.</div>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {documents.slice(0, 5).map((doc) => (
                    <li key={doc.id} style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6', transition: 'background-color 0.15s ease', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fafafa'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <div>
                        <Link to={`/documents/${doc.id}`} style={{ textDecoration: 'none', color: '#111827', fontWeight: '600', fontSize: '0.9375rem', display: 'block' }} onMouseOver={(e) => e.currentTarget.style.color = '#2563eb'} onMouseOut={(e) => e.currentTarget.style.color = '#111827'}>
                          {doc.title}
                        </Link>
                        <div style={{ fontSize: '0.8125rem', color: '#6b7280', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ backgroundColor: '#f3f4f6', padding: '2px 6px', borderRadius: '4px', color: '#4b5563', fontWeight: '500' }}>{doc.extraction_method || 'Unknown'}</span>
                          <span>•</span>
                          <span>{new Date(doc.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        </div>
                      </div>
                      <div>
                        {doc.is_approved ? (
                          <span style={{ backgroundColor: '#ecfdf5', color: '#047857', fontSize: '0.75rem', padding: '4px 10px', borderRadius: '12px', fontWeight: '600' }}>Approved</span>
                        ) : (
                          <span style={{ backgroundColor: '#fffbeb', color: '#b45309', fontSize: '0.75rem', padding: '4px 10px', borderRadius: '12px', fontWeight: '600' }}>Pending Review</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* MODERATOR RECENT LIST */}
        {user?.role === 'moderator' && (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6', backgroundColor: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.0625rem', color: '#111827', fontWeight: '600', letterSpacing: '-0.01em' }}>Documents Pending Review</h3>
              <Link to="/moderator" style={{ fontSize: '0.8125rem', color: '#2563eb', textDecoration: 'none', fontWeight: '500' }}>View queue</Link>
            </div>
            <div>
              {loading ? (
                <div style={{ padding: '32px', color: '#6b7280', textAlign: 'center', fontSize: '0.9375rem' }}>Loading documents...</div>
              ) : error ? (
                <div style={{ padding: '32px', color: '#ef4444', textAlign: 'center', fontSize: '0.9375rem' }}>{error}</div>
              ) : pendingDocs.length === 0 ? (
                <div style={{ padding: '48px', color: '#9ca3af', textAlign: 'center', fontSize: '0.9375rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={32} color="#10b981" strokeWidth={1.5} />
                  <span>All caught up! No pending documents require moderation.</span>
                </div>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {pendingDocs.slice(0, 5).map((doc) => (
                    <li key={doc.id} style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6', transition: 'background-color 0.15s ease' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fafafa'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <Link to={`/documents/${doc.id}`} style={{ textDecoration: 'none', color: '#111827', fontWeight: '600', fontSize: '0.9375rem', display: 'block' }} onMouseOver={(e) => e.currentTarget.style.color = '#2563eb'} onMouseOut={(e) => e.currentTarget.style.color = '#111827'}>
                        {doc.title}
                      </Link>
                      <div style={{ fontSize: '0.8125rem', color: '#6b7280', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ backgroundColor: '#fffbeb', padding: '2px 6px', borderRadius: '4px', color: '#b45309', fontWeight: '600' }}>Pending</span>
                        <span>•</span>
                        <span>{new Date(doc.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* ADMINISTRATOR RECENT LIST */}
        {user?.role === 'administrator' && (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6', backgroundColor: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.0625rem', color: '#111827', fontWeight: '600', letterSpacing: '-0.01em' }}>Recently Uploaded System Files</h3>
              <Link to="/documents" style={{ fontSize: '0.8125rem', color: '#2563eb', textDecoration: 'none', fontWeight: '500' }}>Manage all files</Link>
            </div>
            <div>
              {loading ? (
                <div style={{ padding: '32px', color: '#6b7280', textAlign: 'center', fontSize: '0.9375rem' }}>Loading documents...</div>
              ) : error ? (
                <div style={{ padding: '32px', color: '#ef4444', textAlign: 'center', fontSize: '0.9375rem' }}>{error}</div>
              ) : documents.length === 0 ? (
                <div style={{ padding: '48px', color: '#9ca3af', textAlign: 'center', fontSize: '0.9375rem' }}>No documents uploaded.</div>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {documents.slice(0, 5).map((doc) => (
                    <li key={doc.id} style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6', transition: 'background-color 0.15s ease', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fafafa'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <div>
                        <Link to={`/documents/${doc.id}`} style={{ textDecoration: 'none', color: '#111827', fontWeight: '600', fontSize: '0.9375rem', display: 'block' }} onMouseOver={(e) => e.currentTarget.style.color = '#2563eb'} onMouseOut={(e) => e.currentTarget.style.color = '#111827'}>
                          {doc.title}
                        </Link>
                        <div style={{ fontSize: '0.8125rem', color: '#6b7280', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ backgroundColor: '#f3f4f6', padding: '2px 6px', borderRadius: '4px', color: '#4b5563', fontWeight: '500' }}>{doc.extraction_method || 'Unknown'}</span>
                          <span>•</span>
                          <span>{new Date(doc.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        </div>
                      </div>
                      <div>
                        {doc.is_approved ? (
                          <span style={{ backgroundColor: '#ecfdf5', color: '#047857', fontSize: '0.75rem', padding: '4px 10px', borderRadius: '12px', fontWeight: '600' }}>Approved</span>
                        ) : (
                          <span style={{ backgroundColor: '#fffbeb', color: '#b45309', fontSize: '0.75rem', padding: '4px 10px', borderRadius: '12px', fontWeight: '600' }}>Pending</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
