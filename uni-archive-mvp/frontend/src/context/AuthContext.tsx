import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../api/client';

type UserRole = 'student' | 'moderator' | 'administrator';

interface User {
  id: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // On mount, check if we have a token
    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('user_role') as UserRole;
    
    if (token) {
      // In a real app, we would fetch user details from /api/users/me here
      // For MVP, we trust the stored token and role
      setUser({
        id: 'mock-id',
        email: 'user@uniarchive.local',
        role: role || 'student'
      });
    }
  }, []);

  const login = (token: string, role: UserRole) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('user_role', role);
    setUser({
      id: 'mock-id',
      email: 'user@uniarchive.local',
      role
    });
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
