import React, { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import { FileText, Clock, UploadCloud, Search as SearchIcon, Users, Copy, CheckCircle, ShieldAlert, BarChart, AlertTriangle, XCircle, Plus, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/StatusBadge';

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
                <UploadCloud color="#2563eb" size={24} strokeWidth={1.5} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>My Uploads</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '1.75rem', fontWeight: '700', color: '#111827', letterSpacing: '-0.025em' }}>
                  {loading ? '-' : myDocs.length}
                </p>
              </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ backgroundColor: '#fffbeb', padding: '12px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock color="#d97706" size={24} strokeWidth={1.5} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Pending Review</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '1.75rem', fontWeight: '700', color: '#111827', letterSpacing: '-0.025em' }}>
                  {loading ? '-' : myDocs.filter(d => !d.is_approved && d.status !== 'rejected').length}
                </p>
              </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ backgroundColor: '#ecfdf5', padding: '12px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle color="#059669" size={24} strokeWidth={1.5} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Approved Uploads</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '1.75rem', fontWeight: '700', color: '#111827', letterSpacing: '-0.025em' }}>
                  {loading ? '-' : myDocs.filter(d => d.is_approved).length}
                </p>
              </div>
            </div>
            
            <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ backgroundColor: '#f0fdfa', padding: '12px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText color="#0d9488" size={24} strokeWidth={1.5} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Available Library</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '1.75rem', fontWeight: '700', color: '#111827', letterSpacing: '-0.025em' }}>
                  {loading ? '-' : approvedDocs.length}
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
        
        {/* STUDENT TWO-COLUMN LAYOUT */}
        {user?.role === 'student' && (
          <div style={{ display: 'grid', gridTemplateColumns: '7fr 3fr', gap: '24px', alignItems: 'start' }}>
            {/* Left Column: Recent Upload Activity Feed */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6', overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6', backgroundColor: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.0625rem', color: '#111827', fontWeight: '600', letterSpacing: '-0.01em' }}>Upload Status Activity</h3>
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Real-time updates</span>
              </div>
              <div style={{ padding: '24px' }}>
                {loading ? (
                  <div style={{ color: '#6b7280', textAlign: 'center', fontSize: '0.9375rem', padding: '16px' }}>Loading activity...</div>
                ) : myDocs.length === 0 ? (
                  <div style={{ color: '#9ca3af', textAlign: 'center', fontSize: '0.9375rem', padding: '32px' }}>
                    <UploadCloud size={32} style={{ color: '#d1d5db', marginBottom: '8px' }} />
                    <p style={{ margin: 0 }}>You haven't uploaded any documents yet.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {myDocs.slice(0, 10).map((doc) => {
                      // Determine status characteristics for feed
                      let feedMessage = '';
                      let feedSubtext = '';
                      let iconBg = '#eff6ff';
                      let iconEl = <UploadCloud size={16} color="#2563eb" />;

                      const normStatus = (doc.status || '').toLowerCase();
                      if (doc.is_approved || normStatus === 'approved') {
                        feedMessage = `Your document "${doc.title}" was approved by a moderator.`;
                        feedSubtext = 'It is now active and visible to all students in the global library.';
                        iconBg = '#ecfdf5';
                        iconEl = <CheckCircle size={16} color="#059669" />;
                      } else if (normStatus === 'rejected') {
                        feedMessage = `Your document "${doc.title}" was rejected.`;
                        feedSubtext = doc.rejection_reason 
                          ? `Reason: ${doc.rejection_reason}` 
                          : 'It did not meet our submission guidelines.';
                        iconBg = '#fef2f2';
                        iconEl = <XCircle size={16} color="#dc2626" />;
                      } else if (normStatus === 'duplicate_warning') {
                        feedMessage = `Your document "${doc.title}" triggered a duplicate warning.`;
                        feedSubtext = 'Our automatic duplicate detector matched this document with an existing record. A moderator will review it shortly.';
                        iconBg = '#fff7ed';
                        iconEl = <AlertTriangle size={16} color="#ea580c" />;
                      } else {
                        // Pending
                        feedMessage = `Your document "${doc.title}" is pending review.`;
                        feedSubtext = 'We are analyzing OCR and extracting course tags. A moderator will review it shortly.';
                        iconBg = '#fffbeb';
                        iconEl = <Clock size={16} color="#d97706" />;
                      }

                      return (
                        <div key={doc.id} style={{ display: 'flex', gap: '16px', padding: '16px', border: '1px solid #f3f4f6', borderRadius: '8px', transition: 'box-shadow 0.15s ease' }} onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)'} onMouseOut={(e) => e.currentTarget.style.boxShadow = 'none'}>
                          <div style={{ backgroundColor: iconBg, width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {iconEl}
                          </div>
                          <div style={{ flexGrow: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <Link to={`/documents/${doc.id}`} style={{ textDecoration: 'none', color: '#111827', fontWeight: '600', fontSize: '0.9rem' }}>
                                {feedMessage}
                              </Link>
                              <span style={{ fontSize: '0.75rem', color: '#9ca3af', whiteSpace: 'nowrap', marginLeft: '12px' }}>
                                {new Date(doc.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                            <p style={{ margin: '6px 0 0 0', fontSize: '0.8125rem', color: '#4b5563', lineHeight: '1.4' }}>
                              {feedSubtext}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: My Recent Uploads List */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6', overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6', backgroundColor: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.0625rem', color: '#111827', fontWeight: '600', letterSpacing: '-0.01em' }}>My Uploads</h3>
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>All uploads</span>
              </div>
              <div>
                {loading ? (
                  <div style={{ padding: '24px', color: '#6b7280', textAlign: 'center', fontSize: '0.9rem' }}>Loading...</div>
                ) : myDocs.length === 0 ? (
                  <div style={{ padding: '32px', color: '#9ca3af', textAlign: 'center', fontSize: '0.9rem' }}>No uploads found.</div>
                ) : (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {myDocs.slice(0, 8).map((doc) => (
                      <li key={doc.id} style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', transition: 'background-color 0.15s ease' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fafafa'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <Link to={`/documents/${doc.id}`} style={{ textDecoration: 'none', color: '#111827', fontWeight: '500', fontSize: '0.875rem', display: 'block', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} onMouseOver={(e) => e.currentTarget.style.color = '#2563eb'} onMouseOut={(e) => e.currentTarget.style.color = '#111827'}>
                          {doc.title}
                        </Link>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                            {new Date(doc.created_at).toLocaleDateString()}
                          </span>
                          <StatusBadge status={doc.status} is_approved={doc.is_approved} />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
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
