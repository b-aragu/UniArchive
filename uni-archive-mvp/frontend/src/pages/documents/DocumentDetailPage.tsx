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
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '1.5rem', color: '#111827' }}>{doc.title}</h2>
            <div style={{ display: 'flex', gap: '16px', color: '#6b7280', fontSize: '0.875rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={16} /> {new Date(doc.created_at).toLocaleDateString()}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Shield size={16} /> {doc.is_approved ? 'Approved' : 'Pending'}</span>
            </div>
          </div>
          <button 
            onClick={handleDownload}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#3b82f6', color: 'white', padding: '10px 16px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            <Download size={18} /> Download Original
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
          <div>
            <p style={{ margin: '0 0 4px 0', fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 'bold' }}>Filename</p>
            <p style={{ margin: 0, color: '#111827' }}>{doc.original_filename}</p>
          </div>
          <div>
            <p style={{ margin: '0 0 4px 0', fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 'bold' }}>File Size</p>
            <p style={{ margin: 0, color: '#111827' }}>{doc.file_size ? `${(doc.file_size / 1024 / 1024).toFixed(2)} MB` : 'Unknown'}</p>
          </div>
          <div>
            <p style={{ margin: '0 0 4px 0', fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 'bold' }}>Extraction Method</p>
            <p style={{ margin: 0, color: '#111827' }}>{doc.extraction_method || 'N/A'}</p>
          </div>
          <div>
            <p style={{ margin: '0 0 4px 0', fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 'bold' }}>OCR Confidence</p>
            <p style={{ margin: 0, color: '#111827' }}>{doc.ocr_confidence ? `${Math.round(doc.ocr_confidence)}%` : 'N/A'}</p>
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: '1.125rem', color: '#111827', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} /> Extracted Text Preview
          </h3>
          <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '6px', border: '1px solid #e5e7eb', maxHeight: '400px', overflowY: 'auto', whiteSpace: 'pre-wrap', fontSize: '0.875rem', color: '#374151', fontFamily: 'monospace' }}>
            {doc.ocr_text || 'No text extracted.'}
          </div>
        </div>
      </div>
    </div>
  );
};
