import React, { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import { FileText, Check, X, ShieldAlert, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '../../components/StatusBadge';

export const ModeratorPanel: React.FC = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Tab and Modal states
  const [activeTab, setActiveTab] = useState<'pending' | 'duplicates' | 'history'>('pending');
  const [rejectingDocId, setRejectingDocId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Duplicate Submission');
  const [customReason, setCustomReason] = useState('');

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/documents?limit=100');
      setDocuments(response.data.items || []);
    } catch (err: any) {
      setError('Failed to fetch moderation queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await apiClient.post(`/api/documents/${id}/approve`);
      setDocuments(prev => prev.map(doc => 
        doc.id === id ? { ...doc, is_approved: true, status: 'approved', rejection_reason: null } : doc
      ));
      alert('Document approved successfully.');
    } catch (err) {
      alert('Failed to approve document.');
    }
  };

  const submitReject = async () => {
    if (!rejectingDocId) return;
    const finalReason = rejectionReason === 'Other' ? customReason : rejectionReason;
    if (!finalReason.trim()) {
      alert('Please specify or choose a rejection reason.');
      return;
    }

    try {
      await apiClient.post(`/api/documents/${rejectingDocId}/reject`, {
        rejection_reason: finalReason
      });
      
      setDocuments(prev => prev.map(doc => 
        doc.id === rejectingDocId ? { ...doc, is_approved: false, status: 'rejected', rejection_reason: finalReason } : doc
      ));
      setRejectingDocId(null);
      setCustomReason('');
      alert('Document rejected successfully.');
    } catch (err) {
      alert('Failed to reject document.');
    }
  };

  // Filter queues
  const pendingDocs = documents.filter(d => !d.is_approved && d.status === 'pending');
  const duplicateDocs = documents.filter(d => !d.is_approved && d.status === 'duplicate_warning');
  const historyDocs = documents.filter(d => d.is_approved || d.status === 'rejected');

  const getFilteredDocs = () => {
    if (activeTab === 'pending') return pendingDocs;
    if (activeTab === 'duplicates') return duplicateDocs;
    return historyDocs;
  };

  const activeList = getFilteredDocs();

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '40px', animation: 'fadeIn 0.3s ease' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: '#eff6ff', padding: '10px', borderRadius: '12px' }}>
          <FileText size={24} color="#2563eb" strokeWidth={2} />
        </div>
        <h2 style={{ margin: 0, fontSize: '1.75rem', color: '#111827', fontWeight: '700', letterSpacing: '-0.025em' }}>Moderation Console</h2>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', borderBottom: '2px solid #e5e7eb', marginBottom: '24px', gap: '8px' }}>
        <button
          onClick={() => setActiveTab('pending')}
          style={{
            padding: '12px 24px',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'pending' ? '3px solid #2563eb' : '3px solid transparent',
            color: activeTab === 'pending' ? '#2563eb' : '#4b5563',
            fontWeight: '600',
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            marginBottom: '-2px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          Pending Queue
          <span style={{ 
            backgroundColor: pendingDocs.length > 0 ? '#2563eb' : '#e5e7eb', 
            color: pendingDocs.length > 0 ? '#ffffff' : '#4b5563', 
            fontSize: '0.75rem', 
            padding: '2px 8px', 
            borderRadius: '10px',
            fontWeight: '700'
          }}>
            {pendingDocs.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('duplicates')}
          style={{
            padding: '12px 24px',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'duplicates' ? '3px solid #ea580c' : '3px solid transparent',
            color: activeTab === 'duplicates' ? '#ea580c' : '#4b5563',
            fontWeight: '600',
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            marginBottom: '-2px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          Duplicate Alerts
          <span style={{ 
            backgroundColor: duplicateDocs.length > 0 ? '#ea580c' : '#e5e7eb', 
            color: duplicateDocs.length > 0 ? '#ffffff' : '#4b5563', 
            fontSize: '0.75rem', 
            padding: '2px 8px', 
            borderRadius: '10px',
            fontWeight: '700'
          }}>
            {duplicateDocs.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          style={{
            padding: '12px 24px',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'history' ? '3px solid #4b5563' : '3px solid transparent',
            color: activeTab === 'history' ? '#111827' : '#4b5563',
            fontWeight: '600',
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            marginBottom: '-2px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          Resolved History
          <span style={{ 
            backgroundColor: '#e5e7eb', 
            color: '#4b5563', 
            fontSize: '0.75rem', 
            padding: '2px 8px', 
            borderRadius: '10px',
            fontWeight: '700'
          }}>
            {historyDocs.length}
          </span>
        </button>
      </div>

      {/* Main List Container */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '48px', color: '#6b7280', textAlign: 'center', fontSize: '0.9375rem' }}>Loading queue...</div>
        ) : error ? (
          <div style={{ padding: '48px', color: '#ef4444', textAlign: 'center', fontSize: '0.9375rem' }}>{error}</div>
        ) : activeList.length === 0 ? (
          <div style={{ padding: '64px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ backgroundColor: '#f0fdf4', padding: '16px', borderRadius: '50%', marginBottom: '16px' }}>
              <CheckCircle size={32} color="#059669" strokeWidth={1.5} />
            </div>
            <p style={{ margin: 0, color: '#111827', fontSize: '1.0625rem', fontWeight: '600' }}>Queue is empty</p>
            <p style={{ margin: '8px 0 0 0', color: '#6b7280', fontSize: '0.9375rem' }}>All items in this tab have been processed.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#fafafa', borderBottom: '1px solid #f3f4f6' }}>
              <tr>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Document Title</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Status</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Date</th>
                {activeTab !== 'history' && (
                  <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {activeList.map((doc) => (
                <tr key={doc.id} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background-color 0.15s ease' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fafafa'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ padding: '20px 24px' }}>
                    <Link to={`/documents/${doc.id}`} style={{ color: '#111827', textDecoration: 'none', fontWeight: '600', fontSize: '0.9375rem', display: 'block', transition: 'color 0.15s ease' }} onMouseOver={(e) => e.currentTarget.style.color = '#2563eb'} onMouseOut={(e) => e.currentTarget.style.color = '#111827'}>
                      {doc.title}
                    </Link>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>
                      File: {doc.original_filename}
                    </span>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <StatusBadge status={doc.status} is_approved={doc.is_approved} />
                    {doc.status === 'rejected' && doc.rejection_reason && (
                      <span style={{ display: 'block', fontSize: '0.75rem', color: '#b91c1c', marginTop: '4px', fontStyle: 'italic' }}>
                        Reason: {doc.rejection_reason}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '20px 24px', color: '#6b7280', fontSize: '0.875rem', fontWeight: '500' }}>
                    {new Date(doc.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  {activeTab !== 'history' && (
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
                          onClick={() => setRejectingDocId(doc.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: '600', transition: 'all 0.15s ease' }}
                          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#fee2e2'; }}
                          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#fef2f2'; }}
                        >
                          <X size={14} strokeWidth={2.5} /> Reject
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Rejection Modal Overlay */}
      {rejectingDocId && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.2s ease-in-out'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            padding: '32px',
            borderRadius: '16px',
            maxWidth: '480px',
            width: '100%',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
            border: '1px solid #f3f4f6'
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.25rem', fontWeight: '700', color: '#111827' }}>Reject Document</h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '0.875rem', color: '#4b5563', lineHeight: '1.5' }}>
              Please select a reason for rejecting this document. This feedback will be displayed to the student who uploaded the file.
            </p>

            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '600', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              Rejection Reason
            </label>
            <select
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                backgroundColor: '#ffffff',
                fontSize: '0.9375rem',
                color: '#111827',
                outline: 'none',
                marginBottom: '20px',
                cursor: 'pointer'
              }}
            >
              <option value="Duplicate Submission">Duplicate Submission</option>
              <option value="Poor OCR Quality">Poor OCR Quality</option>
              <option value="Missing Metadata">Missing Metadata</option>
              <option value="Incorrect Course Tagging">Incorrect Course Tagging</option>
              <option value="Corrupted File">Corrupted File</option>
              <option value="Other">Other (Specify below)</option>
            </select>

            {rejectionReason === 'Other' && (
              <>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '600', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                  Custom Reason Description
                </label>
                <textarea
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Type the detailed reason..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    fontSize: '0.9375rem',
                    color: '#111827',
                    outline: 'none',
                    height: '80px',
                    resize: 'none',
                    marginBottom: '20px',
                    fontFamily: 'inherit'
                  }}
                />
              </>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => { setRejectingDocId(null); setCustomReason(''); }}
                style={{
                  padding: '10px 18px',
                  backgroundColor: '#ffffff',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
              >
                Cancel
              </button>
              <button
                onClick={submitReject}
                style={{
                  padding: '10px 18px',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(220,38,38,0.2)',
                  transition: 'background-color 0.15s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
