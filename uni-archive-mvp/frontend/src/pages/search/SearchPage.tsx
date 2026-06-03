import React, { useState } from 'react';
import { apiClient } from '../../api/client';
import { Search, BrainCircuit, ListFilter, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

type SearchMode = 'keyword' | 'semantic' | 'hybrid';

export const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<SearchMode>('keyword');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    
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
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Search Header */}
      <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={20} color="#9ca3af" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for concepts, courses, or specific keywords..."
              style={{ width: '100%', padding: '16px 16px 16px 48px', fontSize: '1.125rem', border: '1px solid #d1d5db', borderRadius: '8px', boxSizing: 'border-box' }}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading || !query.trim()}
            style={{ backgroundColor: '#111827', color: 'white', padding: '0 32px', fontSize: '1rem', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: (loading || !query.trim()) ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {/* Search Modes */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
          <button 
            type="button"
            onClick={() => setMode('keyword')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '20px', border: mode === 'keyword' ? '2px solid #3b82f6' : '1px solid #d1d5db', backgroundColor: mode === 'keyword' ? '#eff6ff' : 'white', color: mode === 'keyword' ? '#1d4ed8' : '#4b5563', cursor: 'pointer', fontWeight: '500' }}
          >
            <ListFilter size={18} /> Keyword (Exact)
          </button>
          <button 
            type="button"
            onClick={() => setMode('semantic')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '20px', border: mode === 'semantic' ? '2px solid #8b5cf6' : '1px solid #d1d5db', backgroundColor: mode === 'semantic' ? '#f5f3ff' : 'white', color: mode === 'semantic' ? '#6d28d9' : '#4b5563', cursor: 'pointer', fontWeight: '500' }}
          >
            <BrainCircuit size={18} /> Semantic (Contextual)
          </button>
          <button 
            type="button"
            onClick={() => setMode('hybrid')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '20px', border: mode === 'hybrid' ? '2px solid #10b981' : '1px solid #d1d5db', backgroundColor: mode === 'hybrid' ? '#ecfdf5' : 'white', color: mode === 'hybrid' ? '#047857' : '#4b5563', cursor: 'pointer', fontWeight: '500' }}
          >
            <Search size={18} /> Hybrid (Fusion)
          </button>
        </div>
      </div>

      {/* Results Section */}
      {error && (
        <div style={{ padding: '16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      {!loading && !error && results.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '8px' }}>
            Found {results.length} results
          </div>
          {results.map((item, idx) => (
            <div key={idx} style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <Link to={`/documents/${item.id || item.document_id}`} style={{ textDecoration: 'none', color: '#1d4ed8', fontSize: '1.25rem', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                    {item.title}
                  </Link>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    {item.course ? `Course: ${item.course}` : 'Unknown Course'} | {item.document_type || 'Document'} | {new Date(item.created_at || Date.now()).getFullYear()}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ backgroundColor: mode === 'semantic' ? '#f5f3ff' : mode === 'hybrid' ? '#ecfdf5' : '#eff6ff', color: mode === 'semantic' ? '#6d28d9' : mode === 'hybrid' ? '#047857' : '#1d4ed8', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    Score: {item.score || item.relevance_score ? Math.round((item.score || item.relevance_score) * 100) / 100 : 'N/A'}
                  </span>
                </div>
              </div>
              
              <div style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '16px', lineHeight: '1.5', fontStyle: 'italic', borderLeft: '3px solid #d1d5db', paddingLeft: '12px' }}>
                "{item.matching_chunk || item.snippet || 'No snippet available.'}"
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem', color: '#9ca3af' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FileText size={14} /> Extraction: {item.extraction_method || 'Unknown'}</span>
                </div>
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
                  style={{ backgroundColor: 'transparent', color: '#3b82f6', border: '1px solid #3b82f6', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}
                >
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && results.length === 0 && query && (
        <div style={{ textAlign: 'center', padding: '48px', backgroundColor: 'white', borderRadius: '8px', color: '#6b7280' }}>
          No documents found matching your query.
        </div>
      )}
    </div>
  );
};
