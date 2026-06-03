import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../api/client';

type UserRole = 'student' | 'moderator' | 'administrator';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // On mount, check if we have a token
    const token = localStorage.getItem('access_token');
    const id = localStorage.getItem('user_id');
    const email = localStorage.getItem('user_email');
    const fullName = localStorage.getItem('user_fullname');
    const role = localStorage.getItem('user_role') as UserRole;
    
    if (token && id && email && role) {
      setUser({
        id,
        email,
        full_name: fullName || '',
        role
      });
    }
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('user_id', userData.id);
    localStorage.setItem('user_email', userData.email);
    localStorage.setItem('user_fullname', userData.full_name);
    localStorage.setItem('user_role', userData.role);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_fullname');
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
