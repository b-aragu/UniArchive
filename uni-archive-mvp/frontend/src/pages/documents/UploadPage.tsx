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
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ margin: '0 0 24px 0', fontSize: '1.25rem', color: '#111827' }}>Upload Academic Document</h3>

        <form onSubmit={handleUpload}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Document Title</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required
              placeholder="e.g. CS304 Operating Systems Final Exam 2024"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>File (PDF/Image)</label>
            <div style={{ border: '2px dashed #d1d5db', borderRadius: '6px', padding: '40px', textAlign: 'center', backgroundColor: '#f9fafb', cursor: 'pointer', position: 'relative' }}>
              <input 
                type="file" 
                onChange={handleFileChange} 
                accept=".pdf,.png,.jpg,.jpeg" 
                required
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
              />
              <UploadCloud size={40} color="#9ca3af" style={{ margin: '0 auto 16px auto' }} />
              <p style={{ margin: 0, color: '#4b5563' }}>{file ? file.name : 'Drag and drop or click to select file'}</p>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={status === 'uploading' || !file || !title}
            style={{ backgroundColor: '#3b82f6', color: 'white', padding: '12px 24px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: (status === 'uploading' || !file || !title) ? 'not-allowed' : 'pointer', width: '100%' }}
          >
            {status === 'uploading' ? 'Processing...' : 'Upload Document'}
          </button>
        </form>

        {status === 'uploading' && (
          <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#eff6ff', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '12px', color: '#1d4ed8' }}>
            <div style={{ animation: 'spin 1s linear infinite' }}><UploadCloud size={20} /></div>
            <span>{message}</span>
          </div>
        )}

        {status === 'success' && (
          <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '6px', color: '#065f46' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontWeight: 'bold' }}>
              <CheckCircle size={20} /> {message}
            </div>
            {result && (
              <div style={{ fontSize: '0.875rem', backgroundColor: 'white', padding: '12px', borderRadius: '4px' }}>
                <p style={{ margin: '0 0 4px 0' }}><strong>Extraction:</strong> {result.extraction_method}</p>
                <p style={{ margin: '0 0 4px 0' }}><strong>Confidence:</strong> {result.ocr_confidence ? `${Math.round(result.ocr_confidence)}%` : 'N/A'}</p>
                <p style={{ margin: 0 }}><strong>Pages:</strong> {result.page_count}</p>
              </div>
            )}
          </div>
        )}

        {status === 'error' && (
          <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={20} /> {message}
          </div>
        )}
      </div>
    </div>
  );
};
