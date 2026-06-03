import axios from 'axios';

// Create an Axios instance with base URL from environment or default to local FastAPI
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add JWT token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor to handle global errors (e.g., 401 Unauthorized)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // In a more robust system, we would attempt a token refresh here.
      // For MVP, if we get a 401, we just log out.
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_role');
      // Redirect to login handled by AuthContext listening to token absence or explicit window.location
    }
    return Promise.reject(error);
  }
);