/**
 * Authentication Service
 * Handles all authentication operations including login, logout, and token refresh
 */

import { apiClient } from '@/lib/api-client';
import { tokenStorage } from '@/lib/token-storage';

/**
 * Login Credentials
 * Data required for user authentication
 */
export interface LoginCredentials {
  /** User's email address */
  username: string;
  /** User's password */
  password: string;
}

/**
 * User
 * Represents an authenticated user in the system
 */
export interface User {
  /** Unique user identifier */
  id: string;
  /** User's email address */
  email: string;
  /** User's full name */
  name: string;
  /** User's last name */
  lastName: string;
  /** User's role in the system (optional) */
  role?: string;
  /** Account creation timestamp (optional) */
  createdAt?: string;
  /** Seller's name */
  Seller: string;
}

/**
 * Auth Response
 * Response from authentication endpoints containing tokens
 */
export interface AuthResponse {
  /** JWT access token */
  token: string;
  /** Refresh token for obtaining new access tokens (optional) */
  refreshToken?: string;
}

/**
 * Register User Data
 * Data required to create a new user account
 * Requirements: 3.1, 3.2
 */
export interface RegisterUserData {
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
 * Create Seller Data
 * Data required to create a seller for an authenticated user
 * Requirement 5.3
 */
export interface CreateSellerData {
  /** Name of the seller - Requirement 5.3 */
  name: string;
}

/**
 * Seller
 * Represents a seller entity associated with a user
 * Requirement 5.4
 */
export interface Seller {
  /** Unique seller identifier */
  id: string;
  /** Seller's business name */
  name: string;
  /** ID of the user who owns this seller */
  userId: string;
  /** Seller creation timestamp */
  createdAt: string;
}

class AuthService {
  private readonly AUTH_ENDPOINT = process.env.NEXT_PUBLIC_AUTH_LOGIN_ENDPOINT || '/auth';
  private readonly REFRESH_ENDPOINT = process.env.NEXT_PUBLIC_AUTH_REFRESH_ENDPOINT || '/auth/refresh';
  private readonly USER_ENDPOINT = process.env.NEXT_PUBLIC_AUTH_USER_ENDPOINT || '/auth/me';
  private readonly REGISTER_ENDPOINT = process.env.NEXT_PUBLIC_REGISTER_ENDPOINT || '/users';
  private readonly SELLER_ENDPOINT = process.env.NEXT_PUBLIC_SELLER_ENDPOINT || '/sellers';

  /**
   * Login with email and password
   * Calls API Platform /auth/login endpoint and stores tokens
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Clear any existing tokens before attempting login
      // This ensures we don't have stale tokens from previous sessions
      tokenStorage.clearAll();

      // Call API Platform authentication endpoint
      const response = await apiClient.post<AuthResponse>(
        this.AUTH_ENDPOINT,
        credentials
      );

      // Store tokens in storage
      tokenStorage.setToken(response.token);
      
      if (response.refreshToken) {
        tokenStorage.setRefreshToken(response.refreshToken);
      }

      // Return tokens
      return response;
    } catch (error: any) {
      // Transform error for better user experience
      if (error.statusCode === 401) {
        throw {
          message: 'Invalid email or password',
          statusCode: 401,
        };
      }
      
      if (error.statusCode === 0) {
        throw {
          message: 'Unable to connect. Please check your internet connection.',
          statusCode: 0,
        };
      }

      throw error;
    }
  }

  /**
   * Logout user
   * Clears all tokens from storage and authentication state
   */
  async logout(): Promise<void> {
    try {
      // Clear all tokens from storage
      tokenStorage.clearAll();

      // Optionally call logout endpoint on API Platform
      // This is useful if the backend needs to invalidate tokens
      // Uncomment if your API Platform has a logout endpoint:
      // await apiClient.post('/auth/logout');
    } catch (error) {
      // Even if API call fails, ensure local tokens are cleared
      tokenStorage.clearAll();
      throw error;
    }
  }

  /**
   * Refresh authentication token
   * Uses refresh token to obtain a new access token
   */
  async refreshToken(): Promise<string> {
    try {
      const refreshToken = tokenStorage.getRefreshToken();

      if (!refreshToken) {
        throw {
          message: 'No refresh token available',
          statusCode: 401,
        };
      }

      // Call refresh endpoint with refresh token
      const response = await apiClient.post<{ token: string }>(
        this.REFRESH_ENDPOINT,
        { refreshToken }
      );

      // Store new access token
      tokenStorage.setToken(response.token);

      return response.token;
    } catch (error: any) {
      // If refresh fails, clear all tokens
      tokenStorage.clearAll();
      
      throw {
        message: 'Session expired. Please log in again.',
        statusCode: 401,
      };
    }
  }

  /**
   * Get current authenticated user
   * Fetches user data from API Platform using stored token
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const token = tokenStorage.getToken();

      if (!token) {
        return null;
      }

      // Fetch user data from API Platform
      return await apiClient.get<User>(this.USER_ENDPOINT);
    } catch (error: any) {
      // If user fetch fails with 401, token is invalid
      if (error.statusCode === 401) {
        tokenStorage.clearAll();
        return null;
      }

      throw error;
    }
  }

  /**
   * Check if user is authenticated
   * Returns true if a valid token exists in storage
   */
  isAuthenticated(): boolean {
    return tokenStorage.getToken() !== null;
  }

  /**
   * Register a new user
   * Creates a new user account via API Platform
   * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
   */
  async register(userData: RegisterUserData): Promise<void> {
    try {
      // Call API Platform user creation endpoint
      // Requirement 3.1: POST request to /users endpoint
      // Requirement 3.2: Send email, password, firstName, lastName
      await apiClient.post(
        this.REGISTER_ENDPOINT,
        {
          email: userData.email,
          plainPassword: userData.password,
          name: userData.firstName,
          lastName: userData.lastName,
        }
      );
      
      // Requirement 3.3: Successful creation allows proceeding to next step
      // No return value needed, success is indicated by not throwing
    } catch (error: any) {
      // Transform errors for better user experience
      
      // Requirement 3.4: Handle duplicate email error (409 Conflict)
      if (error.statusCode === 409) {
        throw {
          message: 'Este email ya está registrado',
          statusCode: 409,
          step: 'register',
        };
      }
      
      // Requirement 3.5: Handle validation errors (400 Bad Request)
      if (error.statusCode === 400) {
        throw {
          message: error.message || 'Error de validación',
          errors: error.errors,
          statusCode: 400,
          step: 'register',
        };
      }
      
      // Requirement 8.2: Handle server errors (500)
      if (error.statusCode >= 500) {
        throw {
          message: 'Error del servidor. Por favor intenta nuevamente más tarde',
          statusCode: error.statusCode,
          step: 'register',
        };
      }
      
      // Requirement 8.1: Handle network errors
      if (error.statusCode === 0) {
        throw {
          message: 'Error de conexión. Por favor verifica tu conexión a internet',
          statusCode: 0,
          step: 'register',
        };
      }

      // Re-throw other errors with step information
      throw {
        ...error,
        step: 'register',
      };
    }
  }

  /**
   * Create a seller for the authenticated user
   * Uses JWT token to associate seller with user
   * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
   */
  async createSeller(sellerData: CreateSellerData): Promise<Seller> {
    try {
      // Requirement 5.1: POST request to /sellers endpoint
      // Requirement 5.2: JWT token included in Authorization header (handled by apiClient)
      // Requirement 5.3: Send seller name in request body
      const seller = await apiClient.post<Seller>(
        this.SELLER_ENDPOINT,
        {
          name: sellerData.name,
        }
      );
      
      // Requirement 5.4: Return seller data on success
      return seller;
    } catch (error: any) {
      // Transform errors for better user experience
      
      // Handle unauthorized errors (401)
      if (error.statusCode === 401) {
        // Clear tokens if unauthorized
        tokenStorage.clearAll();
        throw {
          message: 'Sesión inválida. Por favor inicia sesión nuevamente',
          statusCode: 401,
          step: 'seller',
        };
      }
      
      // Handle validation errors (400)
      if (error.statusCode === 400) {
        throw {
          message: error.message || 'Error de validación al crear seller',
          errors: error.errors,
          statusCode: 400,
          step: 'seller',
        };
      }
      
      // Handle server errors (500+)
      if (error.statusCode >= 500) {
        throw {
          message: 'Error al crear seller. Por favor intenta nuevamente más tarde',
          statusCode: error.statusCode,
          step: 'seller',
        };
      }
      
      // Handle network errors
      if (error.statusCode === 0) {
        throw {
          message: 'Error de conexión. Por favor verifica tu conexión a internet',
          statusCode: 0,
          step: 'seller',
        };
      }

      // Requirement 5.5: On error, maintain user authenticated state
      // (tokens are not cleared except for 401)
      // Re-throw error with step information for proper handling
      throw {
        ...error,
        step: 'seller',
      };
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
