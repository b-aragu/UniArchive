import React, { useState, useEffect, useRef } from 'react';
import { apiClient } from '../../api/client';
import { UploadCloud, CheckCircle, AlertCircle, Clock, FileText, Download, Check, Circle, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';

export const UploadPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<any>(null);
  const [progressStage, setProgressStage] = useState(0);
  
  const [recentDocuments, setRecentDocuments] = useState<any[]>([]);
  const [recentLoading, setRecentLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleReset = () => {
    setFile(null);
    setTitle('');
    setStatus('idle');
    setMessage('');
    setResult(null);
    setProgressStage(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const fetchRecentDocuments = async () => {
    try {
      const response = await apiClient.get('/api/documents?limit=5');
      setRecentDocuments(response.data.items || []);
    } catch (err) {
      console.error('Failed to fetch recent documents', err);
    } finally {
      setRecentLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentDocuments();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Auto-generate title
      let name = selectedFile.name;
      const lastDot = name.lastIndexOf('.');
      if (lastDot !== -1) {
        name = name.substring(0, lastDot);
      }
      name = name.replace(/[-_]/g, ' ');
      // Title case
      name = name.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
      setTitle(name);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (status === 'uploading') return;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const selectedFile = e.dataTransfer.files[0];
      setFile(selectedFile);
      
      let name = selectedFile.name;
      const lastDot = name.lastIndexOf('.');
      if (lastDot !== -1) {
        name = name.substring(0, lastDot);
      }
      name = name.replace(/[-_]/g, ' ');
      name = name.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
      setTitle(name);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) return;

    setStatus('uploading');
    setMessage('Uploading file, extracting text, indexing document. This may take a few seconds.');
    setProgressStage(0);
    const startTime = performance.now();

    // Simulate progress stages
    const stageInterval = setInterval(() => {
      setProgressStage(prev => (prev < 3 ? prev + 1 : prev));
    }, 1200);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);

    try {
      const response = await apiClient.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const endTime = performance.now();
      
      clearInterval(stageInterval);
      setProgressStage(4); // All complete
      setStatus('success');
      setMessage('Upload Complete');
      const newDoc = {
        ...response.data,
        original_filename: file.name,
        processing_time: ((endTime - startTime) / 1000).toFixed(1)
      };
      setResult(newDoc);
      // Prepend newly uploaded document instantly
      setRecentDocuments(prev => [newDoc, ...prev.filter(d => d.id !== newDoc.id)].slice(0, 5));
      fetchRecentDocuments();
    } catch (err: any) {
      clearInterval(stageInterval);
      setStatus('error');
      let errorMsg = 'An unexpected error occurred during upload.';
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          errorMsg = err.response.data.detail.map((d: any) => `${d.loc ? d.loc.join('.') + ': ' : ''}${d.msg}`).join(', ');
        } else if (typeof err.response.data.detail === 'string') {
          errorMsg = err.response.data.detail;
        } else {
          errorMsg = JSON.stringify(err.response.data.detail);
        }
      }
      setMessage(errorMsg);
    }
  };

  const handleDownload = async (docId: string, filename: string, title: string) => {
    setDownloadingId(docId);
    try {
      const response = await apiClient.get(`/api/documents/${docId}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const downloadName = filename || `${title}.pdf`;
      link.setAttribute('download', downloadName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download document.');
    } finally {
      setDownloadingId(null);
    }
  };

  const stages = [
    'Uploading file',
    'Extracting OCR text',
    'Checking duplicates',
    'Generating search index',
    'Saving document'
  ];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
      
      {/* Upload Form Area */}
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
              disabled={status === 'uploading'}
              placeholder="e.g. CS304 Operating Systems Final Exam 2024"
              style={{ width: '100%', padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: '8px', boxSizing: 'border-box', fontSize: '0.9375rem', outline: 'none', transition: 'border-color 0.15s ease', fontFamily: 'inherit', opacity: status === 'uploading' ? 0.7 : 1 }}
              onFocus={(e) => e.target.style.borderColor = '#2563eb'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>File (PDF/Image)</label>
            <div style={{ border: '2px dashed #e5e7eb', borderRadius: '12px', padding: '48px 24px', textAlign: 'center', backgroundColor: '#fafafa', cursor: status === 'uploading' ? 'not-allowed' : 'pointer', position: 'relative', transition: 'all 0.2s ease', opacity: status === 'uploading' ? 0.7 : 1 }}
                 onMouseOver={(e) => { if(status !== 'uploading') e.currentTarget.style.backgroundColor = '#f3f4f6'; }}
                 onMouseOut={(e) => { if(status !== 'uploading') e.currentTarget.style.backgroundColor = '#fafafa'; }}
                 onDragOver={handleDragOver}
                 onDrop={handleDrop}
            >
              <input 
                ref={fileInputRef}
                type="file" 
                onChange={handleFileChange} 
                accept=".pdf,.png,.jpg,.jpeg" 
                disabled={status === 'uploading'}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: status === 'uploading' ? 'not-allowed' : 'pointer' }}
              />
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', padding: '12px', borderRadius: '50%', display: 'inline-flex', marginBottom: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <UploadCloud size={24} color="#6b7280" />
              </div>
              <p style={{ margin: '0 0 4px 0', color: '#111827', fontWeight: '500', fontSize: '0.9375rem' }}>{file ? file.name : 'Click to upload or drag and drop'}</p>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '0.8125rem' }}>PDF, PNG, or JPG (max. 10MB)</p>
            </div>
          </div>

          <button 
            type={status === 'success' ? 'button' : 'submit'}
            onClick={status === 'success' ? handleReset : undefined}
            disabled={status === 'uploading' || (status === 'idle' && !file)}
            style={{ 
              backgroundColor: '#111827', 
              color: 'white', 
              padding: '12px 24px', 
              border: 'none', 
              borderRadius: '8px', 
              fontWeight: '500', 
              fontSize: '0.9375rem', 
              cursor: (status === 'uploading' || (status === 'idle' && !file)) ? 'not-allowed' : 'pointer', 
              width: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '8px', 
              transition: 'background-color 0.2s ease', 
              opacity: (status === 'uploading' || (status === 'idle' && !file)) ? 0.7 : 1 
            }}
          >
            {status === 'idle' && !file && 'Select a document first'}
            {status === 'idle' && file && 'Upload and Extract Text'}
            {status === 'uploading' && (
              <><Loader size={18} style={{ animation: 'spin 2s linear infinite' }} /> Uploading, extracting, and indexing...</>
            )}
            {status === 'success' && 'Upload Another Document'}
            {status === 'error' && 'Upload and Extract Text'}
          </button>
        </form>

        {status === 'uploading' && (
          <div style={{ marginTop: '32px', backgroundColor: '#fafafa', borderRadius: '8px', border: '1px solid #f3f4f6', padding: '24px' }}>
            <p style={{ margin: '0 0 20px 0', color: '#4b5563', fontSize: '0.9375rem', fontWeight: '500' }}>{message}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {stages.map((stage, index) => {
                const isComplete = index < progressStage;
                const isActive = index === progressStage;
                const isPending = index > progressStage;
                
                return (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {isComplete ? (
                      <CheckCircle size={18} color="#059669" />
                    ) : isActive ? (
                      <Loader size={18} color="#2563eb" style={{ animation: 'spin 2s linear infinite' }} />
                    ) : (
                      <Circle size={18} color="#d1d5db" />
                    )}
                    <span style={{ 
                      fontSize: '0.9375rem',
                      color: isComplete ? '#111827' : isActive ? '#2563eb' : '#9ca3af',
                      fontWeight: isActive || isComplete ? '500' : '400'
                    }}>
                      {stage} {isActive && <span style={{ color: '#6b7280', fontSize: '0.8125rem', marginLeft: '8px', fontWeight: '400' }}>In Progress</span>}
                      {isComplete && <span style={{ color: '#059669', fontSize: '0.8125rem', marginLeft: '8px', fontWeight: '400' }}>Complete</span>}
                      {isPending && <span style={{ color: '#9ca3af', fontSize: '0.8125rem', marginLeft: '8px', fontWeight: '400' }}>Pending</span>}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {status === 'error' && (
          <div style={{ marginTop: '24px', padding: '24px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: '#b91c1c' }}>
              <AlertCircle size={24} strokeWidth={2} />
              <h4 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600' }}>Upload Failed</h4>
            </div>
            <p style={{ margin: '0 0 12px 0', fontSize: '0.9375rem', color: '#7f1d1d' }}>{message}</p>
            <div style={{ backgroundColor: '#ffffff', padding: '12px', borderRadius: '6px', border: '1px solid #fee2e2', fontSize: '0.875rem', color: '#991b1b' }}>
              <strong>Suggested Fix:</strong> Check required metadata, login session, and ensure your file is a valid PDF, PNG, or JPG under 10MB.
            </div>
          </div>
        )}
      </div>

      {/* Success & Preview Area */}
      {status === 'success' && result && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
          {/* Upload Success State Panel */}
          <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.025)', border: '1px solid #a7f3d0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', color: '#047857' }}>
              <div style={{ backgroundColor: '#ecfdf5', padding: '8px', borderRadius: '50%' }}>
                <CheckCircle size={24} strokeWidth={2.5} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', letterSpacing: '-0.025em' }}>{message}</h3>
            </div>

            {result.duplicate_warning && result.duplicate_warning.length > 0 && (
              <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '8px', color: '#b45309' }}>
                <p style={{ margin: '0 0 4px 0', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={18} /> Possible Duplicate Detected
                </p>
                <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.5' }}>This document appears similar to existing documents in the system. It has been flagged for moderator review.</p>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div style={{ backgroundColor: '#fafafa', padding: '16px', borderRadius: '8px', border: '1px solid #f3f4f6' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600' }}>Document Title</p>
                <p style={{ margin: 0, fontSize: '0.9375rem', color: '#111827', fontWeight: '500' }}>{result.title}</p>
              </div>
              <div style={{ backgroundColor: '#fafafa', padding: '16px', borderRadius: '8px', border: '1px solid #f3f4f6' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600' }}>Original Filename</p>
                <p style={{ margin: 0, fontSize: '0.9375rem', color: '#111827', fontWeight: '500', wordBreak: 'break-all' }}>{result.original_filename}</p>
              </div>
              <div style={{ backgroundColor: '#fafafa', padding: '16px', borderRadius: '8px', border: '1px solid #f3f4f6' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600' }}>Status</p>
                <p style={{ margin: 0, fontSize: '0.9375rem', color: '#111827', fontWeight: '500' }}>{result.is_approved ? 'Verified' : 'Pending Review'}</p>
              </div>
              <div style={{ backgroundColor: '#fafafa', padding: '16px', borderRadius: '8px', border: '1px solid #f3f4f6' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600' }}>Processing Time</p>
                <p style={{ margin: 0, fontSize: '0.9375rem', color: '#111827', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> {result.processing_time}s</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px', borderTop: '1px solid #f3f4f6', paddingTop: '24px' }}>
              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '0.75rem', color: '#6b7280' }}>Extraction</p>
                <p style={{ margin: 0, fontSize: '0.9375rem', color: '#111827', fontWeight: '500' }}>{result.extraction_method || 'System Default'}</p>
              </div>
              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '0.75rem', color: '#6b7280' }}>Confidence</p>
                <p style={{ margin: 0, fontSize: '0.9375rem', color: '#111827', fontWeight: '500' }}>{result.ocr_confidence ? `${Math.round(result.ocr_confidence)}%` : 'N/A'}</p>
              </div>
              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '0.75rem', color: '#6b7280' }}>Pages</p>
                <p style={{ margin: 0, fontSize: '0.9375rem', color: '#111827', fontWeight: '500' }}>{result.page_count || 1}</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <Link 
                to={`/documents/${result.id}`} 
                style={{ flex: 1, textAlign: 'center', backgroundColor: '#2563eb', color: 'white', textDecoration: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: '600', fontSize: '0.9375rem', transition: 'background-color 0.15s ease' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
              >
                View Document
              </Link>
              <button 
                onClick={() => handleDownload(result.id, result.original_filename, result.title)}
                style={{ flex: 1, backgroundColor: 'white', color: '#374151', border: '1px solid #d1d5db', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9375rem', transition: 'background-color 0.15s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                <Download size={18} strokeWidth={2} /> Download Original
              </button>
            </div>
          </div>

          {/* Recently Uploaded Document Preview */}
          <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.025)', border: '1px solid #f3f4f6' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.125rem', fontWeight: '600', color: '#111827', letterSpacing: '-0.025em', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={20} color="#2563eb" /> Extracted Text Preview
            </h3>
            {result.ocr_text ? (
              <div style={{ backgroundColor: '#fafafa', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '0.875rem', color: '#374151', fontFamily: '"JetBrains Mono", monospace', whiteSpace: 'pre-wrap', lineHeight: '1.6', position: 'relative' }}>
                {result.ocr_text.substring(0, 500)}
                {result.ocr_text.length > 500 && <span style={{ color: '#9ca3af' }}>...</span>}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40px', background: 'linear-gradient(transparent, #fafafa)', borderRadius: '0 0 8px 8px' }}></div>
              </div>
            ) : (
              <div style={{ backgroundColor: '#fafafa', padding: '32px', borderRadius: '8px', border: '1px solid #e5e7eb', textAlign: 'center', color: '#6b7280', fontSize: '0.9375rem' }}>
                Text preview will be available on the document detail page.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Uploads Section */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.025)', border: '1px solid #f3f4f6', overflow: 'hidden' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #f3f4f6', backgroundColor: '#fafafa' }}>
          <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600', color: '#111827', letterSpacing: '-0.025em' }}>Recent Uploads</h3>
        </div>
        <div style={{ padding: 0 }}>
          {recentLoading ? (
             <div style={{ padding: '32px', color: '#6b7280', textAlign: 'center', fontSize: '0.9375rem' }}>Loading recent uploads...</div>
          ) : recentDocuments.length === 0 ? (
             <div style={{ padding: '48px', color: '#9ca3af', textAlign: 'center', fontSize: '0.9375rem' }}>No documents in the archive yet.</div>
          ) : (
             <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
               {recentDocuments.map((doc) => {
                 const isNewlyUploaded = result && result.id === doc.id;
                 const hasDuplicates = doc.duplicate_warning && doc.duplicate_warning.length > 0;
                 const docTypeLabel = typeof doc.document_type === 'object' ? doc.document_type?.name : (doc.document_type || 'Document');
                 const docCourseLabel = doc.course ? (typeof doc.course === 'object' ? doc.course.code : doc.course) : '';
                 const semesterLabel = doc.semester?.label || doc.year || '';
                 
                 return (
                 <li key={doc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #f3f4f6', transition: 'background-color 0.15s ease', backgroundColor: isNewlyUploaded ? '#f0fdf4' : 'transparent' }} onMouseOver={(e) => { if (!isNewlyUploaded) e.currentTarget.style.backgroundColor = '#fafafa' }} onMouseOut={(e) => { if (!isNewlyUploaded) e.currentTarget.style.backgroundColor = 'transparent' }}>
                   <div style={{ flex: 1, marginRight: '16px' }}>
                     <p style={{ margin: '0 0 4px 0', fontWeight: '500', color: '#111827', fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                       {doc.title}
                       {isNewlyUploaded && <span style={{ backgroundColor: '#10b981', color: 'white', fontSize: '0.625rem', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 'bold' }}>New</span>}
                       {hasDuplicates && (
                         <span style={{ backgroundColor: '#fef2f2', color: '#b91c1c', fontSize: '0.625rem', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '2px' }}>
                           <AlertCircle size={10} /> Duplicate Warning
                         </span>
                       )}
                     </p>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', color: '#6b7280', flexWrap: 'wrap' }}>
                       <span style={{ backgroundColor: isNewlyUploaded ? '#ffffff' : '#f3f4f6', padding: '2px 8px', borderRadius: '12px', fontWeight: '500', color: '#4b5563', border: isNewlyUploaded ? '1px solid #d1fae5' : 'none' }}>{docTypeLabel}</span>
                       {docCourseLabel && <span>• {docCourseLabel} {semesterLabel ? `(${semesterLabel})` : ''}</span>}
                       <span>•</span>
                       <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: doc.is_approved ? '#059669' : '#d97706', fontWeight: '500' }}>
                         {doc.is_approved ? 'Verified' : 'Pending Review'}
                       </span>
                     </div>
                   </div>
                   <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                     <Link 
                       to={`/documents/${doc.id}`}
                       style={{ backgroundColor: '#ffffff', color: '#374151', border: '1px solid #d1d5db', padding: '6px 14px', borderRadius: '6px', fontSize: '0.8125rem', fontWeight: '600', textDecoration: 'none', transition: 'all 0.15s ease' }}
                       onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f9fafb'; }}
                       onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; }}
                     >
                       View
                     </Link>
                     <button
                       disabled={downloadingId === doc.id}
                       onClick={() => handleDownload(doc.id, doc.original_filename, doc.title)}
                       style={{ backgroundColor: 'transparent', color: '#2563eb', border: '1px solid #2563eb', padding: '6px 14px', borderRadius: '6px', fontSize: '0.8125rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', transition: 'all 0.15s ease' }}
                       onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#eff6ff'; }}
                       onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                     >
                       <Download size={12} /> {downloadingId === doc.id ? '...' : 'Download'}
                     </button>
                   </div>
                 </li>
               )})}
             </ul>
          )}
        </div>
      </div>

    </div>
  );
};
