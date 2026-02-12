'use client';

/**
 * Authentication Context
 * Provides authentication state and methods throughout the application
 */

import { authService, type LoginCredentials, type User, type RegisterUserData, type CreateSellerData, type Seller } from '@/services/auth.service';
import { tokenStorage } from '@/lib/token-storage';
import { apiClient } from '@/lib/api-client';
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Registration Data
 * Contains user data for the signup flow
 * This is the data passed to the signup() method
 * Requirements: 3.2
 */
export interface RegistrationData {
  /** User's email address - Requirement 3.2 */
  email: string;
  /** User's password - Requirement 3.2 */
  password: string;
  /** User's first name - Requirement 3.2 */
  firstName: string;
  /** User's last name - Requirement 3.2 */
  lastName: string;
}

/**
 * Registration Step
 * Tracks the current step in the registration process
 * Used for displaying progress indicators to the user
 * Requirement 7.3
 */
export type RegistrationStep = 
  | 'idle'              // No registration in progress
  | 'creating-user'     // Creating user account (Requirement 3.1)
  | 'complete';         // Registration complete, ready to redirect

interface AuthContextValue {
  user: User | null;
  seller: Seller | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  registrationStep: RegistrationStep;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  signup: (registrationData: RegistrationData) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Auth Provider Component
 * Manages authentication state and provides auth methods to children
 */
export function AuthProvider({ children }: PropsWithChildren) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [registrationStep, setRegistrationStep] = useState<RegistrationStep>('idle');

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
      setSeller(null);
    } catch (error) {
      // Even if logout fails, clear local state
      console.error('Logout error:', error);
      setUser(null);
      setSeller(null);
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

  /**
   * Signup method
   * Orchestrates the registration flow:
   * 1. Create user account
   * 2. Redirect to email confirmation page
   * 
   * Requirements: 3.1
   */
  const signup = async (data: RegistrationData): Promise<void> => {
    setIsLoading(true);
    setRegistrationStep('idle');
    
    try {
      // Step 1: Create user account
      // Requirement 3.1: Send POST request to create user
      setRegistrationStep('creating-user');
      await authService.register({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      });
      
      // Step 2: Redirect to email confirmation page
      setRegistrationStep('complete');
      setIsLoading(false);
      router.push('/signup/confirm-email');
      
    } catch (error: any) {
      // Handle errors from user creation step
      setRegistrationStep('idle');
      setIsLoading(false);
      
      // Re-throw error for component to handle
      throw error;
    }
  };

  const value: AuthContextValue = {
    user,
    seller,
    isAuthenticated,
    isLoading,
    registrationStep,
    login,
    logout,
    refreshAuth,
    signup,
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
