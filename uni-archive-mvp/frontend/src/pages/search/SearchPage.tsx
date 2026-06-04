import React, { useState } from 'react';
import { apiClient } from '../../api/client';
import { Search, BrainCircuit, ListFilter, FileText, Download } from 'lucide-react';
import { Link } from 'react-router-dom';

type SearchMode = 'keyword' | 'semantic' | 'hybrid';

const Highlight: React.FC<{ text: string, query: string }> = ({ text, query }) => {
  if (!query.trim()) return <>{text}</>;
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return (
    <>
      {parts.map((part, i) => 
        part.toLowerCase() === query.toLowerCase() ? (
          <span key={i} style={{ backgroundColor: '#fef08a', color: '#854d0e', fontWeight: '500', borderRadius: '2px', padding: '0 2px' }}>{part}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
};

export const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<SearchMode>('keyword');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // AI Search Explanation States
  const [explainLoading, setExplainLoading] = useState(false);
  const [explainError, setExplainError] = useState('');
  const [explanation, setExplanation] = useState<any>(null);

  const handleExplainSearch = async () => {
    if (!query.trim() || results.length === 0) return;
    setExplainLoading(true);
    setExplainError('');
    try {
      const resultIds = results.map(item => item.id || item.document_id);
      const response = await apiClient.post('/api/ai/search/explain', {
        query: query,
        result_ids: resultIds
      });
      setExplanation(response.data);
    } catch (err: any) {
      setExplainError(err.response?.data?.detail || 'Failed to explain search results.');
    } finally {
      setExplainLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setExplanation(null);
    setExplainError('');
    
    try {
      let endpoint = '/api/search';
      if (mode === 'semantic') {
        endpoint = '/api/search/semantic';
      } else if (mode === 'hybrid') {
        endpoint = '/api/search/hybrid';
      }
      
      const response = await apiClient.get(endpoint, {
        params: { 
          [mode === 'semantic' ? 'query' : 'q']: query 
        }
      });
      
      setResults(response.data || []);
    } catch (err: any) {
      if ((mode === 'semantic' || mode === 'hybrid') && err.message === 'Network Error') {
        setError(`${mode === 'semantic' ? 'Semantic' : 'Hybrid'} search engine is currently offline or still initializing.`);
      } else {
        setError(err.response?.data?.detail || 'Search failed. Please try again.');
      }
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Search Header */}
      <div style={{ marginBottom: '32px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)', border: '1px solid #e5e7eb', overflow: 'hidden', transition: 'all 0.2s ease' }}
               onFocus={(e) => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(37,99,235,0.1), 0 2px 4px -1px rgba(37,99,235,0.06)'; }}
               onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)'; }}
          >
            <div style={{ padding: '0 20px', color: '#9ca3af', display: 'flex', alignItems: 'center' }}>
              <Search size={22} strokeWidth={2} />
            </div>
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search concepts, courses, or topics..."
              style={{ flex: 1, padding: '20px 0', fontSize: '1.125rem', border: 'none', outline: 'none', backgroundColor: 'transparent', color: '#111827', fontFamily: 'inherit' }}
            />
            <button 
              type="submit" 
              disabled={loading || !query.trim()}
              style={{ backgroundColor: (loading || !query.trim()) ? '#f3f4f6' : '#2563eb', color: (loading || !query.trim()) ? '#9ca3af' : 'white', padding: '12px 24px', margin: '8px', fontSize: '0.9375rem', fontWeight: '600', border: 'none', borderRadius: '8px', cursor: (loading || !query.trim()) ? 'not-allowed' : 'pointer', transition: 'all 0.2s ease' }}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Search Modes */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: '8px' }}>Engine:</span>
            <button 
              type="button"
              onClick={() => setMode('keyword')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '20px', border: mode === 'keyword' ? '1px solid #bfdbfe' : '1px solid transparent', backgroundColor: mode === 'keyword' ? '#eff6ff' : 'transparent', color: mode === 'keyword' ? '#1d4ed8' : '#6b7280', cursor: 'pointer', fontWeight: '500', fontSize: '0.875rem', transition: 'all 0.15s ease' }}
              onMouseOver={(e) => { if(mode !== 'keyword') e.currentTarget.style.backgroundColor = '#f3f4f6'; }}
              onMouseOut={(e) => { if(mode !== 'keyword') e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <ListFilter size={16} strokeWidth={2} /> Keyword
            </button>
            <button 
              type="button"
              onClick={() => setMode('semantic')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '20px', border: mode === 'semantic' ? '1px solid #ddd6fe' : '1px solid transparent', backgroundColor: mode === 'semantic' ? '#f5f3ff' : 'transparent', color: mode === 'semantic' ? '#6d28d9' : '#6b7280', cursor: 'pointer', fontWeight: '500', fontSize: '0.875rem', transition: 'all 0.15s ease' }}
              onMouseOver={(e) => { if(mode !== 'semantic') e.currentTarget.style.backgroundColor = '#f3f4f6'; }}
              onMouseOut={(e) => { if(mode !== 'semantic') e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <BrainCircuit size={16} strokeWidth={2} /> Semantic
            </button>
            <button 
              type="button"
              onClick={() => setMode('hybrid')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '20px', border: mode === 'hybrid' ? '1px solid #a7f3d0' : '1px solid transparent', backgroundColor: mode === 'hybrid' ? '#ecfdf5' : 'transparent', color: mode === 'hybrid' ? '#047857' : '#6b7280', cursor: 'pointer', fontWeight: '500', fontSize: '0.875rem', transition: 'all 0.15s ease' }}
              onMouseOver={(e) => { if(mode !== 'hybrid') e.currentTarget.style.backgroundColor = '#f3f4f6'; }}
              onMouseOut={(e) => { if(mode !== 'hybrid') e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <Search size={16} strokeWidth={2} /> Hybrid Fusion
            </button>
          </div>
        </form>
      </div>

      {/* Results Section */}
      {error && (
        <div style={{ padding: '16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      {!loading && !error && results.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>
              Found {results.length} results
            </div>
            <button
              onClick={handleExplainSearch}
              disabled={explainLoading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                border: '1px solid #bfdbfe',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: (explainLoading) ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Explain Results
            </button>
          </div>

          {explainLoading && (
            <div style={{ padding: '24px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ display: 'inline-block', width: '20px', height: '20px', border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '8px' }}></div>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>Analyzing search relevance...</p>
            </div>
          )}

          {explainError && (
            <div style={{ padding: '16px 20px', backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', color: '#991b1b', fontSize: '0.875rem' }}>
              {explainError}
            </div>
          )}

          {explanation && (
            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
              
              {explanation.demo_mode && (
                <div style={{ padding: '10px 14px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '6px', color: '#b45309', fontSize: '0.8125rem', fontWeight: '500' }}>
                  ⚠️ AI assistant is running in demo mode. Add an API key for live generation.
                </div>
              )}
              
              <div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9375rem', fontWeight: '600', color: '#1e293b' }}>Search Relevance Explanation</h4>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#334155', lineHeight: '1.5' }}>{explanation.explanation}</p>
              </div>

              {explanation.why_results_match && explanation.why_results_match.length > 0 && (
                <div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '0.875rem', fontWeight: '600', color: '#475569' }}>Why these results match:</h4>
                  <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {explanation.why_results_match.map((reason: string, idx: number) => (
                      <li key={idx} style={{ fontSize: '0.875rem', color: '#475569', lineHeight: '1.4' }}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}

              {explanation.suggested_next_queries && explanation.suggested_next_queries.length > 0 && (
                <div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '0.8125rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Suggested Next Queries</h4>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {explanation.suggested_next_queries.map((q: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => { setQuery(q); }}
                        style={{
                          backgroundColor: '#ffffff',
                          color: '#2563eb',
                          border: '1px solid #e2e8f0',
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '0.8125rem',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.borderColor = '#2563eb'}
                        onMouseOut={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {results.map((item, idx) => (
            <div key={idx} style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #f3f4f6', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', transition: 'transform 0.15s ease, box-shadow 0.15s ease' }}
                 onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)'; }}
                 onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <Link to={`/documents/${item.id || item.document_id}`} style={{ textDecoration: 'none', color: '#111827', fontSize: '1.25rem', fontWeight: '600', letterSpacing: '-0.01em', display: 'block', marginBottom: '6px' }} onMouseOver={(e) => e.currentTarget.style.color = '#2563eb'} onMouseOut={(e) => e.currentTarget.style.color = '#111827'}>
                    <Highlight text={item.title} query={query} />
                  </Link>
                  <div style={{ fontSize: '0.8125rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ backgroundColor: '#f3f4f6', padding: '2px 8px', borderRadius: '12px', fontWeight: '500', color: '#4b5563' }}>
                      {item.course_code || item.course?.code || 'General'}
                    </span>
                    <span>•</span>
                    <span>
                      {typeof item.document_type === 'string' ? item.document_type : (item.document_type?.name || 'Document')}
                    </span>
                    <span>•</span>
                    <span>{new Date(item.created_at || Date.now()).getFullYear()}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ backgroundColor: mode === 'semantic' ? '#f5f3ff' : mode === 'hybrid' ? '#ecfdf5' : '#eff6ff', color: mode === 'semantic' ? '#6d28d9' : mode === 'hybrid' ? '#047857' : '#1d4ed8', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600', letterSpacing: '0.025em' }}>
                    Score: {item.score || item.relevance_score ? Math.round((item.score || item.relevance_score) * 100) / 100 : 'N/A'}
                  </span>
                </div>
              </div>
              
              <div style={{ fontSize: '0.9375rem', color: '#4b5563', marginBottom: '20px', lineHeight: '1.6', fontStyle: 'italic', borderLeft: '3px solid #e5e7eb', paddingLeft: '16px', backgroundColor: '#fafafa', padding: '12px 16px', borderRadius: '0 8px 8px 0' }}>
                "<Highlight text={item.matching_chunk || item.snippet || 'No snippet available.'} query={query} />"
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f3f4f6', paddingTop: '16px' }}>
                <div style={{ display: 'flex', gap: '16px', fontSize: '0.8125rem', color: '#9ca3af' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FileText size={14} /> Extraction: {item.extraction_method || 'Unknown'}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Link 
                    to={`/documents/${item.id || item.document_id}`}
                    style={{ backgroundColor: '#f3f4f6', color: '#374151', textDecoration: 'none', padding: '6px 16px', borderRadius: '6px', fontSize: '0.8125rem', fontWeight: '600', transition: 'background-color 0.15s ease' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                  >
                    View Details
                  </Link>
                  <button 
                    onClick={async () => {
                      try {
                        const id = item.id || item.document_id;
                        const response = await apiClient.get(`/api/documents/${id}/download`, { responseType: 'blob' });
                        const url = window.URL.createObjectURL(new Blob([response.data]));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', item.title + '.pdf');
                        document.body.appendChild(link);
                        link.click();
                        link.remove();
                      } catch (err) {
                        alert('Download failed.');
                      }
                    }}
                    style={{ backgroundColor: 'transparent', color: '#2563eb', border: '1px solid #2563eb', padding: '6px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: '600', transition: 'all 0.15s ease', display: 'flex', alignItems: 'center', gap: '6px' }}
                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#eff6ff'; }}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <Download size={14} strokeWidth={2} /> Download
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && results.length === 0 && query && (
        <div style={{ textAlign: 'center', padding: '64px', backgroundColor: '#ffffff', border: '1px dashed #d1d5db', borderRadius: '12px', color: '#6b7280' }}>
          <Search size={40} color="#d1d5db" style={{ marginBottom: '16px' }} />
          <p style={{ margin: 0, fontSize: '1rem', fontWeight: '500' }}>No documents found matching "{query}"</p>
          <p style={{ margin: '8px 0 0 0', fontSize: '0.875rem' }}>Try adjusting your keywords or switching search engines.</p>
        </div>
      )}
    </div>
  );
};
