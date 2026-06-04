import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          padding: '40px 20px',
          textAlign: 'center',
          backgroundColor: '#fff5f5',
          borderRadius: '12px',
          border: '1px solid #fee2e2',
          margin: '24px 0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ backgroundColor: '#fee2e2', padding: '16px', borderRadius: '50%', marginBottom: '16px' }}>
            <ShieldAlert size={36} color="#ef4444" />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#991b1b', margin: '0 0 8px 0' }}>
            Oops! An error occurred
          </h2>
          <p style={{ color: '#7f1d1d', fontSize: '0.9rem', maxWidth: '450px', margin: '0 0 20px 0', lineHeight: '1.5' }}>
            We've encountered a problem loading this section. You can try refreshing the page or navigate back.
          </p>
          <pre style={{
            backgroundColor: '#ffffff',
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid #fee2e2',
            fontSize: '0.8125rem',
            color: '#b91c1c',
            overflowX: 'auto',
            maxWidth: '100%',
            marginBottom: '24px',
            fontFamily: 'SFMono-Regular, Consolas, Monaco, monospace',
            textAlign: 'left'
          }}>
            {this.state.error?.message || 'Unknown Error'}
          </pre>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#ef4444',
                color: 'white',
                padding: '10px 18px',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '500',
                cursor: 'pointer',
                fontSize: '0.875rem',
                transition: 'background-color 0.15s ease',
                boxShadow: '0 1px 2px rgba(239, 68, 68, 0.2)'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
            >
              <RefreshCw size={14} /> Reload Page
            </button>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = '/dashboard';
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#ffffff',
                color: '#4b5563',
                padding: '10px 18px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontWeight: '500',
                cursor: 'pointer',
                fontSize: '0.875rem',
                transition: 'all 0.15s ease'
              }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f9fafb'; e.currentTarget.style.borderColor = '#9ca3af'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.borderColor = '#d1d5db'; }}
            >
              <Home size={14} /> Go Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
