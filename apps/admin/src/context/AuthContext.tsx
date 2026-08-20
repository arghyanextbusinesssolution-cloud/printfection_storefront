import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { apiPost, apiGet, setAccessToken } from '../services/api';

interface Admin {
  _id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  admin: Admin | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const data = await apiGet<Admin>('/auth/me');
      setAdmin(data);
    } catch {
      setAdmin(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, password: string) => {
    const data = await apiPost<{ admin: Admin; accessToken: string }>('/auth/login', { email, password });
    setAccessToken(data.accessToken);
    setAdmin(data.admin);
  };

  const logout = async () => {
    try {
      await apiPost('/auth/logout');
    } finally {
      setAccessToken(null);
      setAdmin(null);
    }
  };

  return (
    <AuthContext.Provider value={{ admin, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
