import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { Download, FileText, Calendar, Shield } from 'lucide-react';

export const DocumentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  if (loading) return <div>Loading document...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!doc) return null;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '40px' }}>
      <div style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.025)', border: '1px solid #f3f4f6' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
          <div>
            <h2 style={{ margin: '0 0 12px 0', fontSize: '1.75rem', fontWeight: '700', color: '#111827', letterSpacing: '-0.025em', lineHeight: '1.2' }}>{doc.title}</h2>
            <div style={{ display: 'flex', gap: '16px', color: '#6b7280', fontSize: '0.875rem', fontWeight: '500' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={16} strokeWidth={2} /> {new Date(doc.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: doc.is_approved ? '#059669' : '#d97706', backgroundColor: doc.is_approved ? '#ecfdf5' : '#fffbeb', padding: '2px 8px', borderRadius: '12px' }}>
                <Shield size={16} strokeWidth={2} /> {doc.is_approved ? 'Verified' : 'Pending Review'}
              </span>
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

        <div>
          <h3 style={{ fontSize: '1.125rem', color: '#111827', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', letterSpacing: '-0.01em' }}>
            <FileText size={20} strokeWidth={2} /> OCR Text Preview
          </h3>
          <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb', maxHeight: '500px', overflowY: 'auto', whiteSpace: 'pre-wrap', fontSize: '0.875rem', color: '#374151', fontFamily: '"JetBrains Mono", "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace', lineHeight: '1.6', boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.02)' }}>
            {doc.ocr_text || 'No text extracted.'}
          </div>
        </div>
      </div>
    </div>
  );
};
