import React, { useState } from 'react';
import { apiClient } from '../../api/client';
import { UploadCloud, File, CheckCircle, AlertCircle } from 'lucide-react';

export const UploadPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) return;

    setStatus('uploading');
    setMessage('Uploading and extracting text...');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);

    try {
      const response = await apiClient.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setStatus('success');
      setMessage('Document uploaded successfully!');
      setResult(response.data);
      setFile(null);
      setTitle('');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.detail || 'Upload failed. Please try again.');
    }
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      <div style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.025)', border: '1px solid #f3f4f6' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', fontWeight: '600', color: '#111827', letterSpacing: '-0.025em' }}>Upload Academic Document</h3>
        <p style={{ margin: '0 0 32px 0', fontSize: '0.9375rem', color: '#6b7280' }}>Upload your PDF or scanned image to the archive. Text will be automatically extracted and indexed.</p>

        <form onSubmit={handleUpload}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Document Title</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required
              placeholder="e.g. CS304 Operating Systems Final Exam 2024"
              style={{ width: '100%', padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: '8px', boxSizing: 'border-box', fontSize: '0.9375rem', outline: 'none', transition: 'border-color 0.15s ease', fontFamily: 'inherit' }}
              onFocus={(e) => e.target.style.borderColor = '#2563eb'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>File (PDF/Image)</label>
            <div style={{ border: '2px dashed #e5e7eb', borderRadius: '12px', padding: '48px 24px', textAlign: 'center', backgroundColor: '#fafafa', cursor: 'pointer', position: 'relative', transition: 'all 0.2s ease' }}
                 onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                 onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fafafa'}
            >
              <input 
                type="file" 
                onChange={handleFileChange} 
                accept=".pdf,.png,.jpg,.jpeg" 
                required
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
              />
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', padding: '12px', borderRadius: '50%', display: 'inline-flex', marginBottom: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <UploadCloud size={24} color="#6b7280" />
              </div>
              <p style={{ margin: '0 0 4px 0', color: '#111827', fontWeight: '500', fontSize: '0.9375rem' }}>{file ? file.name : 'Click to upload or drag and drop'}</p>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '0.8125rem' }}>PDF, PNG, or JPG (max. 10MB)</p>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={status === 'uploading' || !file || !title}
            style={{ backgroundColor: '#111827', color: 'white', padding: '12px 24px', border: 'none', borderRadius: '8px', fontWeight: '500', fontSize: '0.9375rem', cursor: (status === 'uploading' || !file || !title) ? 'not-allowed' : 'pointer', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'background-color 0.2s ease' }}
          >
            {status === 'uploading' ? (
              <><UploadCloud size={18} style={{ animation: 'spin 2s linear infinite' }} /> Processing & Extracting...</>
            ) : 'Upload Document'}
          </button>
        </form>

        {status === 'uploading' && (
          <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#eff6ff', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '12px', color: '#1d4ed8' }}>
            <div style={{ animation: 'spin 1s linear infinite' }}><UploadCloud size={20} /></div>
            <span>{message}</span>
          </div>
        )}

        {status === 'success' && (
          <div style={{ marginTop: '24px', padding: '20px', backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontWeight: '600', color: '#047857' }}>
              <CheckCircle size={20} /> {message}
            </div>
            {result && (
              <div style={{ fontSize: '0.875rem', backgroundColor: '#fafafa', padding: '16px', borderRadius: '8px', border: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>
                  <span style={{ color: '#6b7280' }}>Extraction</span>
                  <span style={{ fontWeight: '500', color: '#111827' }}>{result.extraction_method}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>
                  <span style={{ color: '#6b7280' }}>Confidence</span>
                  <span style={{ fontWeight: '500', color: '#111827' }}>{result.ocr_confidence ? `${Math.round(result.ocr_confidence)}%` : 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>Pages</span>
                  <span style={{ fontWeight: '500', color: '#111827' }}>{result.page_count}</span>
                </div>
                <a href={`/documents/${result.id}`} style={{ marginTop: '12px', display: 'inline-flex', justifyContent: 'center', backgroundColor: '#ffffff', color: '#111827', textDecoration: 'none', padding: '8px 16px', borderRadius: '6px', border: '1px solid #d1d5db', fontWeight: '500', fontSize: '0.875rem', transition: 'background-color 0.15s ease' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}>
                  View Document
                </a>
              </div>
            )}
            {result?.duplicate_warning && result.duplicate_warning.length > 0 && (
              <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '8px', color: '#b45309' }}>
                <p style={{ margin: '0 0 4px 0', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={18} /> Possible Duplicate Detected
                </p>
                <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.5' }}>This document appears similar to existing documents in the system. It has been flagged for moderator review.</p>
              </div>
            )}
          </div>
        )}

        {status === 'error' && (
          <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '8px', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9375rem', fontWeight: '500' }}>
            <AlertCircle size={20} /> {message}
          </div>
        )}
      </div>
    </div>
  );
};
