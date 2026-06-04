import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { Download, FileText, Calendar, Shield, ArrowLeft, Cpu, Award, BookOpen, Clock, AlertCircle } from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge';

export const DocumentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Tab State
  const [activeTab, setActiveTab] = useState<'original' | 'ocr'>('original');

  // Preview URL States
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const response = await apiClient.get(`/api/documents/${id}`);
        setDoc(response.data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Document not found.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDoc();
  }, [id]);

  useEffect(() => {
    let url = '';
    const fetchFile = async () => {
      setPreviewLoading(true);
      setPreviewError(false);
      try {
        const response = await apiClient.get(`/api/documents/${id}/download`, { responseType: 'blob' });
        const contentType = response.headers['content-type'];
        const mimeType = typeof contentType === 'string' ? contentType : 'application/pdf';
        const blob = new Blob([response.data], { type: mimeType });
        url = window.URL.createObjectURL(blob);
        setPreviewUrl(url);
      } catch (err) {
        console.error('Failed to load file preview', err);
        setPreviewError(true);
      } finally {
        setPreviewLoading(false);
      }
    };

    if (id) {
      fetchFile();
    }

    return () => {
      if (url) {
        window.URL.revokeObjectURL(url);
      }
    };
  }, [id]);

  const handleDownload = async () => {
    try {
      const response = await apiClient.get(`/api/documents/${id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc?.original_filename || 'download.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download document.');
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', fontSize: '1.125rem', color: '#6b7280' }}>
      Loading document details...
    </div>
  );
  if (error) return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '24px', backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', color: '#991b1b', textAlign: 'center' }}>
      <p style={{ fontWeight: '600', margin: '0 0 8px 0' }}>Error Loading Document</p>
      <p style={{ margin: '0 0 16px 0' }}>{error}</p>
      <Link to="/documents" style={{ color: '#991b1b', textDecoration: 'underline', fontSize: '0.875rem', fontWeight: '500' }}>Back to Documents</Link>
    </div>
  );
  if (!doc) return null;

  const getFileType = () => {
    const filename = doc.original_filename || '';
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    if (ext === 'pdf') return 'pdf';
    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg'].includes(ext)) return 'image';
    return 'unsupported';
  };

  const fileType = getFileType();

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Back button */}
      <Link
        to="/documents"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#4b5563', textDecoration: 'none', fontSize: '0.875rem', fontWeight: '500', marginBottom: '16px', transition: 'color 0.15s ease' }}
        onMouseOver={(e) => e.currentTarget.style.color = '#111827'}
        onMouseOut={(e) => e.currentTarget.style.color = '#4b5563'}
      >
        <ArrowLeft size={16} /> Back to Documents
      </Link>

      <div style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.025)', border: '1px solid #f3f4f6' }}>
        
        {/* Rejection Feedback Alert Banner */}
        {doc.status === 'rejected' && doc.rejection_reason && (
          <div style={{
            padding: '16px 20px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#991b1b',
            marginBottom: '24px',
            fontSize: '0.9375rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ fontWeight: '700', display: 'block', marginBottom: '4px' }}>Submission Rejected</strong>
              <span>Feedback: {doc.rejection_reason}</span>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
          <div>
            <h2 style={{ margin: '0 0 12px 0', fontSize: '1.75rem', fontWeight: '700', color: '#111827', letterSpacing: '-0.025em', lineHeight: '1.2' }}>{doc.title}</h2>
            <div style={{ display: 'flex', gap: '16px', color: '#6b7280', fontSize: '0.875rem', fontWeight: '500', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={16} strokeWidth={2} /> {new Date(doc.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <StatusBadge status={doc.status} is_approved={doc.is_approved} />
            </div>
          </div>
          <button 
            onClick={handleDownload}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#2563eb', color: 'white', padding: '10px 20px', border: '1px solid transparent', borderRadius: '8px', fontWeight: '600', fontSize: '0.9375rem', cursor: 'pointer', boxShadow: '0 1px 2px rgba(37,99,235,0.2)', transition: 'background-color 0.15s ease', flexShrink: 0 }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
          >
            <Download size={18} strokeWidth={2} /> Download Original
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '40px', padding: '20px', backgroundColor: '#fafafa', borderRadius: '12px', border: '1px solid #f3f4f6' }}>
          <div>
            <p style={{ margin: '0 0 6px 0', fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Filename</p>
            <p style={{ margin: 0, color: '#111827', fontWeight: '500', fontSize: '0.9375rem', wordBreak: 'break-all' }}>{doc.original_filename}</p>
          </div>
          <div>
            <p style={{ margin: '0 0 6px 0', fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>File Size</p>
            <p style={{ margin: 0, color: '#111827', fontWeight: '500', fontSize: '0.9375rem' }}>{doc.file_size ? `${(doc.file_size / 1024 / 1024).toFixed(2)} MB` : 'Unknown'}</p>
          </div>
          <div>
            <p style={{ margin: '0 0 6px 0', fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Extraction</p>
            <p style={{ margin: 0, color: '#111827', fontWeight: '500', fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: doc.extraction_method === 'Digital' ? '#10b981' : '#3b82f6' }}></span>
              {doc.extraction_method || 'N/A'}
            </p>
          </div>
          <div>
            <p style={{ margin: '0 0 6px 0', fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>OCR Confidence</p>
            <p style={{ margin: 0, color: '#111827', fontWeight: '500', fontSize: '0.9375rem' }}>{doc.ocr_confidence ? `${Math.round(doc.ocr_confidence)}%` : 'N/A'}</p>
          </div>
        </div>

        {/* Tab Headers */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', marginBottom: '24px', gap: '24px' }}>
          <button
            onClick={() => setActiveTab('original')}
            style={{
              padding: '12px 4px',
              border: 'none',
              borderBottom: activeTab === 'original' ? '2px solid #2563eb' : '2px solid transparent',
              backgroundColor: 'transparent',
              color: activeTab === 'original' ? '#2563eb' : '#6b7280',
              fontWeight: activeTab === 'original' ? '600' : '500',
              fontSize: '0.9375rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Original File
          </button>
          <button
            onClick={() => setActiveTab('ocr')}
            style={{
              padding: '12px 4px',
              border: 'none',
              borderBottom: activeTab === 'ocr' ? '2px solid #2563eb' : '2px solid transparent',
              backgroundColor: 'transparent',
              color: activeTab === 'ocr' ? '#2563eb' : '#6b7280',
              fontWeight: activeTab === 'ocr' ? '600' : '500',
              fontSize: '0.9375rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Extracted Text
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'original' ? (
          <div>
            {previewLoading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                Loading original file preview...
              </div>
            ) : previewError || !previewUrl ? (
              <div style={{ padding: '40px', textAlign: 'center', border: '1px dashed #d1d5db', borderRadius: '8px', backgroundColor: '#f9fafb' }}>
                <FileText size={48} style={{ color: '#9ca3af', marginBottom: '16px' }} />
                <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: '#374151', fontWeight: '600' }}>Preview Unavailable</h4>
                <p style={{ margin: '0 0 16px 0', fontSize: '0.875rem', color: '#6b7280' }}>We couldn't load the live preview. Download the original document to view it.</p>
                <button onClick={handleDownload} style={{ padding: '8px 16px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>Download Original</button>
              </div>
            ) : fileType === 'pdf' ? (
              <object
                data={previewUrl}
                type="application/pdf"
                width="100%"
                height="650px"
                style={{ border: '1px solid #e5e7eb', borderRadius: '8px' }}
              >
                <iframe
                  src={previewUrl}
                  width="100%"
                  height="650px"
                  style={{ border: 'none' }}
                  title="Original PDF Document Preview"
                >
                  <div style={{ padding: '24px', textAlign: 'center' }}>
                    <p style={{ color: '#ef4444' }}>Preview unavailable. Download the original document.</p>
                  </div>
                </iframe>
              </object>
            ) : fileType === 'image' ? (
              <div style={{ display: 'flex', justifyContent: 'center', backgroundColor: '#f3f4f6', borderRadius: '8px', padding: '16px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                <img
                  src={previewUrl}
                  alt={doc.title}
                  style={{ maxWidth: '100%', maxHeight: '600px', objectFit: 'contain', borderRadius: '4px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
              </div>
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', border: '1px dashed #d1d5db', borderRadius: '8px', backgroundColor: '#f9fafb' }}>
                <FileText size={48} style={{ color: '#9ca3af', marginBottom: '16px' }} />
                <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: '#374151', fontWeight: '600' }}>Format Not Previewable</h4>
                <p style={{ margin: '0 0 16px 0', fontSize: '0.875rem', color: '#6b7280' }}>This format cannot be previewed in the browser. Download the file to view its full content.</p>
                <button onClick={handleDownload} style={{ padding: '8px 16px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>Download Original</button>
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* OCR Metadata Sub-grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', marginBottom: '24px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Cpu size={20} style={{ color: '#3b82f6' }} />
                <div>
                  <p style={{ margin: 0, fontSize: '0.6875rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' }}>Method</p>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#1e293b', fontWeight: '500' }}>{doc.extraction_method || 'N/A'}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Award size={20} style={{ color: '#10b981' }} />
                <div>
                  <p style={{ margin: 0, fontSize: '0.6875rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' }}>Confidence</p>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#1e293b', fontWeight: '500' }}>{doc.ocr_confidence ? `${Math.round(doc.ocr_confidence)}%` : 'N/A'}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <BookOpen size={20} style={{ color: '#8b5cf6' }} />
                <div>
                  <p style={{ margin: 0, fontSize: '0.6875rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' }}>Pages</p>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#1e293b', fontWeight: '500' }}>{doc.page_count || 1}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Clock size={20} style={{ color: '#f59e0b' }} />
                <div>
                  <p style={{ margin: 0, fontSize: '0.6875rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' }}>Processing Time</p>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#1e293b', fontWeight: '500' }}>{doc.processing_time_ms ? `${(doc.processing_time_ms / 1000).toFixed(2)}s` : 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Scrollable OCR text box */}
            <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb', maxHeight: '500px', overflowY: 'auto', whiteSpace: 'pre-wrap', fontSize: '0.875rem', color: '#374151', fontFamily: '"JetBrains Mono", "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace', lineHeight: '1.6', boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.02)' }}>
              {doc.ocr_text || 'No text extracted.'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
