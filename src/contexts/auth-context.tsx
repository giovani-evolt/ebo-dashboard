'use client';

/**
 * Authentication Context
 * Provides authentication state and methods throughout the application
 */

import { authService, type LoginCredentials, type User } from '@/services/auth.service';
import { tokenStorage } from '@/lib/token-storage';
import { apiClient } from '@/lib/api-client';
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Auth Provider Component
 * Manages authentication state and provides auth methods to children
 */
export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Derived state - user is authenticated if user object exists
  const isAuthenticated = user !== null;

  /**
   * Initialize auth state on mount
   * Checks for existing token and fetches user data
   */
  useEffect(() => {
    // Register callback for 401 responses to clear auth state
    apiClient.setUnauthorizedCallback(() => {
      setUser(null);
    });

    const initializeAuth = async () => {
      try {
        // Check if token exists in storage
        const token = tokenStorage.getToken();
        
        if (!token) {
          setIsLoading(false);
          return;
        }

        // Fetch current user data from API
        const currentUser = await authService.getCurrentUser();
        
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (error) {
        // If initialization fails, clear tokens
        console.error('Auth initialization failed:', error);
        tokenStorage.clearAll();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Login method
   * Authenticates user with credentials and updates state
   */
  const login = async (credentials: LoginCredentials): Promise<void> => {
    setIsLoading(true);
    
    try {
      // First, authenticate and get token
      await authService.login(credentials);
      
      // Then, fetch user data using the token
      const currentUser = await authService.getCurrentUser();
      
      console.log(currentUser);

      if (currentUser) {
        setUser(currentUser);
      }
    } catch (error) {
      // Re-throw error for component to handle
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout method
   * Clears authentication state and tokens
   */
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      // Even if logout fails, clear local state
      console.error('Logout error:', error);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Refresh authentication
   * Re-fetches user data to sync state
   */
  const refreshAuth = async (): Promise<void> => {
    try {
      const currentUser = await authService.getCurrentUser();
      
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth refresh failed:', error);
      setUser(null);
      tokenStorage.clearAll();
      throw error;
    }
  };

  const value: AuthContextValue = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use auth context
 * Must be used within AuthProvider
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
