import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../api/client';
import { BookOpen } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // FastAPI OAuth2PasswordRequestForm expects form-data
      const formData = new FormData();
      formData.append('username', email); // OAuth2 uses 'username' field for email usually
      formData.append('password', password);

      const response = await apiClient.post('/api/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      // Assuming response has access_token and we parse user role from a decoded token or separate endpoint
      // For MVP, if backend doesn't return role, we default to student, but ideally it returns it or we decode JWT
      // Let's assume the backend returns role or we decode it. For now, default to 'administrator' for testing
      // or 'student' if the backend doesn't provide it.
      // Wait, standard OAuth2 /login usually just returns { access_token, token_type }.
      const token = response.data.access_token;
      
      // Attempt to get user role (if your backend returns it or has a /me endpoint)
      try {
        // Set token temporarily to fetch /me
        localStorage.setItem('access_token', token);
        const meResponse = await apiClient.get('/api/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        login(token, meResponse.data.role?.name || 'student');
      } catch (meError) {
        // Fallback if /me doesn't exist yet
        login(token, 'administrator'); 
      }
      
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ backgroundColor: '#eff6ff', padding: '12px', borderRadius: '50%', marginBottom: '16px' }}>
            <BookOpen size={32} color="#3b82f6" />
          </div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#111827' }}>Sign in to UniArchive</h2>
        </div>

        {error && <div style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '12px', borderRadius: '4px', marginBottom: '16px', fontSize: '0.875rem' }}>{error}</div>}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.875rem', color: '#374151' }}>Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '4px', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.875rem', color: '#374151' }}>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '4px', boxSizing: 'border-box' }}
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            style={{ backgroundColor: '#3b82f6', color: 'white', padding: '10px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: isLoading ? 'not-allowed' : 'pointer', marginTop: '8px' }}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
          Don't have an account? <Link to="/register" style={{ color: '#3b82f6', textDecoration: 'none' }}>Register here</Link>
        </p>
      </div>
    </div>
  );
};
