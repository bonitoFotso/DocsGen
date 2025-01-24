import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { LoginCredentials, User } from '@/affaireType';
import { isAuthenticated, logins, logouts, storeUser } from '@/services/authService';

interface AuthContextType {
  user: User | null;
  isAuth: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const authStatus = isAuthenticated();
        setIsAuth(authStatus);
        if (authStatus) {
          setUser(JSON.parse(localStorage.getItem('user') || 'null'));
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        setIsAuth(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);

    try {
      const response = await logins(credentials);
      
      if (response.success && response.user) {
        setUser(response.user);
        storeUser(response.user);
        setIsAuth(true);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await logouts();
      setUser(null);
      setIsAuth(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Logout failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    user,
    isAuth,
    login,
    logout,
    loading,
    error
  };

  if (loading && !user && !error) {
    // You could return a loading spinner here if needed
    return null;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};