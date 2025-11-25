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
 * Combines user and seller data for the complete signup flow
 * This is the data passed to the signup() method
 * Requirements: 3.2, 5.3
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
  /** Name of the seller to be created - Requirement 5.3 */
  sellerName: string;
}

/**
 * Registration Step
 * Tracks the current step in the multi-stage registration process
 * Used for displaying progress indicators to the user
 * Requirement 7.3
 */
export type RegistrationStep = 
  | 'idle'              // No registration in progress
  | 'creating-user'     // Creating user account (Requirement 3.1)
  | 'logging-in'        // Auto-login in progress (Requirement 4.1)
  | 'creating-seller'   // Creating seller (Requirement 5.1)
  | 'complete';         // Registration complete, ready to redirect (Requirement 6.1)

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
   * Orchestrates the full registration flow:
   * 1. Create user account
   * 2. Auto-login with credentials
   * 3. Create seller for the user
   * 4. Redirect to dashboard
   * 
   * Requirements: 3.1, 4.1, 4.2, 4.3, 4.4, 5.1, 5.4, 6.1, 6.2
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
      
      // Step 2: Auto-login with the credentials
      // Requirement 4.1: Automatically authenticate after user creation
      setRegistrationStep('logging-in');
      try {
        await authService.login({
          username: data.email,
          password: data.password,
        });
        
        // Requirement 4.2: Store token (handled by authService.login)
        // Requirement 4.3: Set authentication state
        const currentUser = await authService.getCurrentUser();
        
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (loginError: any) {
        // Requirement 4.4: If auto-login fails, redirect to login page
        console.error('Auto-login failed:', loginError);
        setRegistrationStep('idle');
        setIsLoading(false);
        
        // Redirect to login with message that account was created
        router.push('/login?message=account-created');
        return;
      }
      
      // Step 3: Create seller for the authenticated user
      // Requirement 5.1: Send POST request to create seller with JWT token
      setRegistrationStep('creating-seller');
      try {
        const createdSeller = await authService.createSeller({
          name: data.sellerName,
        });
        
        // Requirement 5.4: Seller created successfully
        // Store seller information in context for display
        setSeller(createdSeller);
        setRegistrationStep('complete');
      } catch (sellerError: any) {
        // Requirement 5.5: If seller creation fails, keep user authenticated
        console.error('Seller creation failed:', sellerError);
        setRegistrationStep('idle');
        setIsLoading(false);
        
        // Re-throw error so component can handle it
        // User remains authenticated but seller creation failed
        throw {
          ...sellerError,
          message: sellerError.message || 'Error al crear seller. Por favor intenta nuevamente más tarde',
          step: 'seller',
        };
      }
      
      // Step 4: Redirect to dashboard
      // Requirement 6.1: Navigate to /dashboard route
      // Requirement 6.2: Complete redirect within 1 second
      // Requirement 6.3: User state and seller state are properly set before redirect
      setIsLoading(false);
      router.push('/dashboard');
      
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
