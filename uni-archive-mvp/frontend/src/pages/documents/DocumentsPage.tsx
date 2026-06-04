import React, { useEffect, useState, useCallback } from 'react';
import { apiClient } from '../../api/client';
import { 
  Search, Grid, List, Download, Eye, Calendar, FileText, 
  ChevronLeft, ChevronRight, AlertCircle, ShieldAlert, CheckCircle, 
  SlidersHorizontal, Clock, ArrowUpDown, RefreshCw 
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/StatusBadge';
import { SearchableSelect } from '../../components/SearchableSelect';

export const DocumentsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Documents state
  const [documents, setDocuments] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(9); // 9 per page looks perfect in a 3-column grid
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Lookup options for dropdowns
  const [courses, setCourses] = useState<any[]>([]);
  const [documentTypes, setDocumentTypes] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [availableStatuses, setAvailableStatuses] = useState<string[]>([]);
  const [availableExtractions, setAvailableExtractions] = useState<string[]>([]);

  // Filter & Sorting state
  const [searchTitle, setSearchTitle] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedExtraction, setSelectedExtraction] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'library' | 'my_uploads'>('library');

  // Helper to cleanly render status labels
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending Review';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      case 'duplicate_warning': return 'Duplicate Warning';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  // Helper to cleanly render extraction method labels
  const getExtractionLabel = (method: string) => {
    switch (method) {
      case 'digital_pdf': return 'Digital PDF';
      case 'image_ocr': return 'Image OCR';
      case 'scanned_pdf_ocr': return 'Scanned PDF OCR';
      default: return method.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }
  };

  // Load all lookup data for filters
  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const [coursesRes, typesRes, semestersRes, filterOptionsRes] = await Promise.all([
          apiClient.get('/api/courses'),
          apiClient.get('/api/document-types'),
          apiClient.get('/api/semesters'),
          apiClient.get('/api/documents/filter-options').catch(err => {
            console.error('Failed to load filter options', err);
            return { data: { statuses: [], extraction_methods: [] } };
          })
        ]);
        setCourses(coursesRes.data || []);
        setDocumentTypes(typesRes.data || []);
        setSemesters(semestersRes.data || []);
        setAvailableStatuses(filterOptionsRes.data?.statuses || []);
        setAvailableExtractions(filterOptionsRes.data?.extraction_methods || []);
      } catch (err) {
        console.error('Failed to load lookup metadata', err);
      }
    };
    fetchLookups();
  }, []);

  // Fetch documents with current filters, sorting, and pagination
  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    setError('');
    const isStudent = user?.role === 'student';
    try {
      const response = await apiClient.get('/api/documents', {
        params: {
          skip: (page - 1) * limit,
          limit: limit,
          course_id: selectedCourse || undefined,
          document_type_id: selectedType || undefined,
          semester_id: selectedSemester || undefined,
          status: isStudent && activeTab === 'library' ? 'approved' : (selectedStatus || undefined),
          title: searchTitle.trim() || undefined,
          extraction_method: selectedExtraction || undefined,
          sort_by: sortBy,
          uploaded_by_me: isStudent && activeTab === 'my_uploads' ? true : undefined
        }
      });
      setDocuments(response.data.items || []);
      setTotal(response.data.total || 0);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch documents. Please try again.');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit, selectedCourse, selectedType, selectedSemester, selectedStatus, searchTitle, selectedExtraction, sortBy, activeTab, user]);

  // Debounced execution of fetchDocuments for text input search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchDocuments();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [fetchDocuments]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTitle('');
    setSelectedCourse('');
    setSelectedType('');
    setSelectedSemester('');
    setSelectedStatus('');
    setSelectedExtraction('');
    setSortBy('newest');
    setPage(1);
  };

  const handleDownload = async (docId: string, filename: string, title: string) => {
    setDownloadingId(docId);
    try {
      const response = await apiClient.get(`/api/documents/${docId}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      // Use original filename or title with .pdf
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

  // Helper to format file size
  const formatFileSize = (bytes: number) => {
    if (!bytes) return 'Unknown size';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
      
      {/* Role-specific Tab Selector for Students */}
      {user?.role === 'student' && (
        <div style={{ display: 'flex', borderBottom: '2px solid #e5e7eb', marginBottom: '24px', gap: '8px' }}>
          <button
            onClick={() => { setActiveTab('library'); setPage(1); }}
            style={{
              padding: '12px 24px',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'library' ? '3px solid #2563eb' : '3px solid transparent',
              color: activeTab === 'library' ? '#2563eb' : '#4b5563',
              fontWeight: '600',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              marginBottom: '-2px'
            }}
          >
            Global Library
          </button>
          <button
            onClick={() => { setActiveTab('my_uploads'); setPage(1); }}
            style={{
              padding: '12px 24px',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'my_uploads' ? '3px solid #2563eb' : '3px solid transparent',
              color: activeTab === 'my_uploads' ? '#2563eb' : '#4b5563',
              fontWeight: '600',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              marginBottom: '-2px'
            }}
          >
            My Uploads
          </button>
        </div>
      )}

      {/* Top Controls Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #f3f4f6', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
        
        {/* Search & View Mode Switch */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '0 16px', minWidth: '280px' }}>
            <Search size={18} color="#9ca3af" style={{ marginRight: '10px' }} />
            <input 
              type="text" 
              value={searchTitle} 
              onChange={(e) => { setSearchTitle(e.target.value); setPage(1); }} 
              placeholder="Search by document title..." 
              style={{ flex: 1, padding: '12px 0', border: 'none', outline: 'none', backgroundColor: 'transparent', fontSize: '0.9375rem', color: '#111827', fontFamily: 'inherit' }}
            />
            {searchTitle && (
              <button onClick={() => { setSearchTitle(''); setPage(1); }} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: '500' }}>Clear</button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
            <ArrowUpDown size={16} color="#6b7280" />
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: '#ffffff', fontSize: '0.9375rem', color: '#374151', cursor: 'pointer', outline: 'none' }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title_asc">Title (A-Z)</option>
              <option value="title_desc">Title (Z-A)</option>
              <option value="ocr_high">OCR Confidence (High to Low)</option>
              <option value="ocr_low">OCR Confidence (Low to High)</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div style={{ display: 'flex', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
            <button 
              onClick={() => setViewMode('card')}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px', 
                border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500',
                backgroundColor: viewMode === 'card' ? '#eff6ff' : '#ffffff',
                color: viewMode === 'card' ? '#2563eb' : '#4b5563',
                transition: 'all 0.15s ease'
              }}
            >
              <Grid size={16} /> Grid
            </button>
            <button 
              onClick={() => setViewMode('list')}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px', 
                border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500',
                backgroundColor: viewMode === 'list' ? '#eff6ff' : '#ffffff',
                color: viewMode === 'list' ? '#2563eb' : '#4b5563',
                borderLeft: '1px solid #e5e7eb',
                transition: 'all 0.15s ease'
              }}
            >
              <List size={16} /> List
            </button>
          </div>
        </div>

        {/* Filter Selectors Bar */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', borderTop: '1px solid #f3f4f6', paddingTop: '20px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6b7280', fontSize: '0.8125rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <SlidersHorizontal size={14} /> Filters:
          </div>

          {courses.length === 0 && documentTypes.length === 0 && semesters.length === 0 && availableStatuses.length === 0 && availableExtractions.length === 0 ? (
            <span style={{ fontSize: '0.875rem', color: '#6b7280', fontStyle: 'italic' }}>
              No filter options available yet.
            </span>
          ) : (
            <>
              {/* Course Filter */}
              <SearchableSelect
                options={courses.map(c => ({ value: c.id, label: `${c.code} — ${c.name}` }))}
                value={selectedCourse}
                onChange={(v) => { setSelectedCourse(v); setPage(1); }}
                placeholder="All Courses"
                allLabel="All Courses"
              />

              {/* Document Type Filter */}
              <SearchableSelect
                options={documentTypes.map(t => ({ value: t.id, label: t.name }))}
                value={selectedType}
                onChange={(v) => { setSelectedType(v); setPage(1); }}
                placeholder="All Types"
                allLabel="All Types"
              />

              {/* Semester Filter */}
              <SearchableSelect
                options={semesters.map(s => ({ value: s.id, label: `${s.label} (${s.academic_year?.label || 'N/A'})` }))}
                value={selectedSemester}
                onChange={(v) => { setSelectedSemester(v); setPage(1); }}
                placeholder="All Semesters"
                allLabel="All Semesters"
              />

              {/* Extraction Method Filter */}
              <SearchableSelect
                options={availableExtractions.map(method => ({ value: method, label: getExtractionLabel(method) }))}
                value={selectedExtraction}
                onChange={(v) => { setSelectedExtraction(v); setPage(1); }}
                placeholder="All Extraction"
                allLabel="All Extraction Methods"
              />

              {/* Status Filter (Admins/Moderators only) */}
              {(user?.role === 'administrator' || user?.role === 'moderator') && (
                <SearchableSelect
                  options={availableStatuses.map(status => ({ value: status, label: getStatusLabel(status) }))}
                  value={selectedStatus}
                  onChange={(v) => { setSelectedStatus(v); setPage(1); }}
                  placeholder="All Status"
                  allLabel="All Statuses"
                />
              )}
            </>
          )}

          {/* Reset Filters Link */}
          {(selectedCourse || selectedType || selectedSemester || selectedStatus || selectedExtraction || searchTitle || sortBy !== 'newest') && (
            <button 
              onClick={handleResetFilters}
              style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer', padding: '6px 12px', borderRadius: '6px', transition: 'background-color 0.15s ease' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#eff6ff'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Reset Filters
            </button>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', fontSize: '0.875rem' }}>
              <RefreshCw size={14} className="animate-spin" style={{ animation: 'spin 2s linear infinite' }} /> Updating...
            </div>
          )}
        </div>
      </div>

      {/* Main Results View */}
      {error && (
        <div style={{ padding: '16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      {loading && documents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #f3f4f6', color: '#6b7280' }}>
          <RefreshCw size={40} color="#2563eb" style={{ animation: 'spin 2s linear infinite', marginBottom: '16px' }} />
          <p style={{ margin: 0, fontSize: '1rem', fontWeight: '500' }}>Loading library documents...</p>
        </div>
      ) : documents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px', backgroundColor: '#ffffff', border: '1px dashed #d1d5db', borderRadius: '12px', color: '#6b7280' }}>
          <FileText size={40} color="#d1d5db" style={{ marginBottom: '16px' }} />
          <p style={{ margin: 0, fontSize: '1rem', fontWeight: '500' }}>No documents found</p>
          <p style={{ margin: '8px 0 0 0', fontSize: '0.875rem' }}>Try clearing filters or adjusting your title search query.</p>
          {(selectedCourse || selectedType || selectedSemester || selectedStatus || selectedExtraction || searchTitle) && (
            <button 
              onClick={handleResetFilters}
              style={{ marginTop: '16px', backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer' }}
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : viewMode === 'card' ? (
        
        /* Grid / Card View Layout */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          {documents.map((doc) => {
            const hasDuplicates = doc.duplicate_warning && doc.duplicate_warning.length > 0;
            return (
              <div 
                key={doc.id}
                style={{ 
                  backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', 
                  border: '1px solid #f3f4f6', boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease' 
                }}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 16px -2px rgba(0,0,0,0.04)'; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)'; }}
              >
                <div>
                  {/* Card Header Status Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <StatusBadge status={doc.status} is_approved={doc.is_approved} />
                    
                    {/* OCR Badge */}
                    {doc.ocr_confidence !== null && doc.ocr_confidence !== undefined && (
                      <span style={{ fontSize: '0.75rem', fontWeight: '500', color: '#4b5563', backgroundColor: '#f3f4f6', padding: '2px 8px', borderRadius: '12px' }}>
                        OCR: {Math.round(doc.ocr_confidence)}%
                      </span>
                    )}
                  </div>

                  {/* Title & Metadata */}
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '1.0625rem', fontWeight: '600', color: '#111827', lineHeight: '1.4', wordBreak: 'break-word' }}>
                    <Link to={`/documents/${doc.id}`} style={{ textDecoration: 'none', color: 'inherit' }} onMouseOver={(e) => e.currentTarget.style.color = '#2563eb'} onMouseOut={(e) => e.currentTarget.style.color = 'inherit'}>
                      {doc.title}
                    </Link>
                  </h4>

                  {/* File specifics */}
                  <p style={{ margin: '0 0 16px 0', fontSize: '0.8125rem', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {doc.original_filename} ({formatFileSize(doc.file_size)})
                  </p>

                  {/* Duplicate warning badge */}
                  {hasDuplicates && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600', marginBottom: '16px' }}>
                      <AlertCircle size={14} /> Duplicate Warning ({doc.duplicate_warning.length})
                    </div>
                  )}

                  {/* Academic Hierarchy Indicators */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid #f3f4f6', paddingTop: '16px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                      <span style={{ color: '#9ca3af' }}>Course</span>
                      <span style={{ color: '#374151', fontWeight: '500' }}>{doc.course?.code || 'General'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                      <span style={{ color: '#9ca3af' }}>Type</span>
                      <span style={{ color: '#374151', fontWeight: '500' }}>{doc.document_type?.name || 'Document'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                      <span style={{ color: '#9ca3af' }}>Semester</span>
                      <span style={{ color: '#374151', fontWeight: '500', maxWidth: '180px', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {doc.semester?.label || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions row */}
                <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f3f4f6', paddingTop: '16px' }}>
                  <Link 
                    to={`/documents/${doc.id}`}
                    style={{ 
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      backgroundColor: '#f3f4f6', color: '#374151', textDecoration: 'none', 
                      padding: '8px 16px', borderRadius: '6px', fontSize: '0.8125rem', fontWeight: '600',
                      transition: 'background-color 0.15s ease' 
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                  >
                    <Eye size={14} /> View Details
                  </Link>
                  <button 
                    disabled={downloadingId === doc.id}
                    onClick={() => handleDownload(doc.id, doc.original_filename, doc.title)}
                    style={{ 
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      backgroundColor: 'transparent', color: '#2563eb', border: '1px solid #2563eb', 
                      padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8125rem', 
                      fontWeight: '600', transition: 'all 0.15s ease' 
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#eff6ff'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <Download size={14} /> {downloadingId === doc.id ? '...' : 'Download'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        
        /* List / Table View Layout */
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #f3f4f6', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden', marginBottom: '32px' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#fafafa', borderBottom: '1px solid #f3f4f6', color: '#4b5563', fontWeight: '600' }}>
                  <th style={{ padding: '16px 24px' }}>Title</th>
                  <th style={{ padding: '16px 20px' }}>Type</th>
                  <th style={{ padding: '16px 20px' }}>Course</th>
                  <th style={{ padding: '16px 20px' }}>Semester</th>
                  <th style={{ padding: '16px 20px', textAlign: 'center' }}>OCR %</th>
                  <th style={{ padding: '16px 20px' }}>Status</th>
                  <th style={{ padding: '16px 20px' }}>Uploaded</th>
                  <th style={{ padding: '16px 24px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody style={{ color: '#374151' }}>
                {documents.map((doc) => {
                  const hasDuplicates = doc.duplicate_warning && doc.duplicate_warning.length > 0;
                  return (
                    <tr 
                      key={doc.id}
                      style={{ borderBottom: '1px solid #f3f4f6', transition: 'background-color 0.15s ease' }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '16px 24px', maxWidth: '300px' }}>
                        <Link to={`/documents/${doc.id}`} style={{ fontWeight: '600', color: '#111827', textDecoration: 'none', display: 'block', marginBottom: '4px' }} onMouseOver={(e) => e.currentTarget.style.color = '#2563eb'} onMouseOut={(e) => e.currentTarget.style.color = '#111827'}>
                          {doc.title}
                        </Link>
                        <span style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block', wordBreak: 'break-all' }}>{doc.original_filename}</span>
                      </td>
                      <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>{doc.document_type?.name || 'Document'}</td>
                      <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>{doc.course?.code || 'General'}</td>
                      <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>{doc.semester?.label || 'N/A'}</td>
                      <td style={{ padding: '16px 20px', textAlign: 'center', fontWeight: '500' }}>
                        {doc.ocr_confidence !== null ? `${Math.round(doc.ocr_confidence)}%` : 'N/A'}
                      </td>
                      <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                          <StatusBadge status={doc.status} is_approved={doc.is_approved} />
                          {hasDuplicates && (
                            <span style={{ backgroundColor: '#fef2f2', color: '#b91c1c', padding: '2px 6px', borderRadius: '4px', fontSize: '0.6875rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <AlertCircle size={10} /> Duplicate Flag
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '16px 20px', whiteSpace: 'nowrap', color: '#6b7280' }}>
                        {new Date(doc.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <Link 
                            to={`/documents/${doc.id}`}
                            style={{ 
                              display: 'flex', alignItems: 'center', gap: '4px',
                              backgroundColor: '#f3f4f6', color: '#374151', textDecoration: 'none', 
                              padding: '6px 12px', borderRadius: '6px', fontSize: '0.8125rem', fontWeight: '600'
                            }}
                          >
                            <Eye size={12} /> View
                          </Link>
                          <button 
                            disabled={downloadingId === doc.id}
                            onClick={() => handleDownload(doc.id, doc.original_filename, doc.title)}
                            style={{ 
                              display: 'flex', alignItems: 'center', gap: '4px',
                              backgroundColor: 'transparent', color: '#2563eb', border: '1px solid #2563eb', 
                              padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: '600'
                            }}
                          >
                            <Download size={12} /> {downloadingId === doc.id ? '...' : 'Download'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', padding: '16px 24px', borderRadius: '12px', border: '1px solid #f3f4f6', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            Showing <strong style={{ color: '#111827' }}>{(page - 1) * limit + 1}</strong> to <strong style={{ color: '#111827' }}>{Math.min(page * limit, total)}</strong> of <strong style={{ color: '#111827' }}>{total}</strong> documents
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              disabled={page === 1}
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '4px',
                backgroundColor: '#ffffff', color: page === 1 ? '#9ca3af' : '#374151', 
                border: '1px solid #d1d5db', padding: '8px 16px', borderRadius: '8px', 
                cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: '0.875rem', fontWeight: '500',
                transition: 'background-color 0.15s ease'
              }}
              onMouseOver={(e) => { if (page !== 1) e.currentTarget.style.backgroundColor = '#f9fafb' }}
              onMouseOut={(e) => { if (page !== 1) e.currentTarget.style.backgroundColor = '#ffffff' }}
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '4px',
                backgroundColor: '#ffffff', color: page === totalPages ? '#9ca3af' : '#374151', 
                border: '1px solid #d1d5db', padding: '8px 16px', borderRadius: '8px', 
                cursor: page === totalPages ? 'not-allowed' : 'pointer', fontSize: '0.875rem', fontWeight: '500',
                transition: 'background-color 0.15s ease'
              }}
              onMouseOver={(e) => { if (page !== totalPages) e.currentTarget.style.backgroundColor = '#f9fafb' }}
              onMouseOut={(e) => { if (page !== totalPages) e.currentTarget.style.backgroundColor = '#ffffff' }}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
