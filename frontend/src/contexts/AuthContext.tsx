/**
 * Authentication context and provider.
 * Manages user authentication state and token storage.
 */
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createApiClient } from '../lib/api-client';
import { authApi } from '../lib/api/auth';
import { usersApi } from '../lib/api/users';
import type { User, LoginRequest, RegisterRequest } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'brightsteps_token';

/**
 * Secure token storage using sessionStorage (more secure than localStorage).
 * SessionStorage clears when tab is closed, reducing XSS attack window.
 * For production, consider using httpOnly cookies set by backend.
 */
function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(TOKEN_KEY);
}

function setStoredToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (token) {
    sessionStorage.setItem(TOKEN_KEY, token);
  } else {
    sessionStorage.removeItem(TOKEN_KEY);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState(true);

  // Initialize API client with token getter (initialize immediately)
  useEffect(() => {
    createApiClient(() => getStoredToken());
  }, []);

  // Load user on mount if token exists
  useEffect(() => {
    async function loadUser() {
      const storedToken = getStoredToken();
      if (storedToken) {
        setToken(storedToken);
        try {
          const userData = await usersApi.getMe();
          setUser(userData);
        } catch (error) {
          // Token invalid, clear it
          setStoredToken(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    }
    loadUser();
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      console.log('[AuthContext] Starting login...', { email: credentials.email });
      const response = await authApi.login(credentials);
      console.log('[AuthContext] Login response received', { hasToken: !!response.access_token });
      const newToken = response.access_token;
      
      if (!newToken) {
        throw new Error('No access token received from server');
      }
      
      setStoredToken(newToken);
      setToken(newToken);
      
      // Re-initialize API client with new token
      createApiClient(() => getStoredToken());
      
      // Fetch user data
      console.log('[AuthContext] Fetching user data...');
      const userData = await usersApi.getMe();
      console.log('[AuthContext] User data received', { userId: userData.id, email: userData.email });
      setUser(userData);
    } catch (error) {
      console.error('[AuthContext] Login error:', error);
      if (error instanceof Error) {
        console.error('[AuthContext] Error details:', {
          message: error.message,
          stack: error.stack,
        });
      }
      // Clear any partial token state on error
      setStoredToken(null);
      setToken(null);
      setUser(null);
      throw error;
    }
  }, []);

  const register = useCallback(async (userData: RegisterRequest) => {
    try {
      await authApi.register(userData);
      // After registration, automatically log in
      await login({ email: userData.email, password: userData.password });
    } catch (error) {
      throw error;
    }
  }, [login]);

  const logout = useCallback(() => {
    setStoredToken(null);
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const userData = await usersApi.getMe();
      setUser(userData);
    } catch (error) {
      // If refresh fails, user might be logged out
      logout();
    }
  }, [logout]);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

