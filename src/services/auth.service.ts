/**
 * Authentication Service
 * Handles all authentication operations including login, logout, and token refresh
 */

import { apiClient } from '@/lib/api-client';
import { tokenStorage } from '@/lib/token-storage';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
}

class AuthService {
  private readonly AUTH_ENDPOINT = process.env.NEXT_PUBLIC_AUTH_LOGIN_ENDPOINT || '/auth';
  private readonly REFRESH_ENDPOINT = process.env.NEXT_PUBLIC_AUTH_REFRESH_ENDPOINT || '/auth/refresh';
  private readonly USER_ENDPOINT = process.env.NEXT_PUBLIC_AUTH_USER_ENDPOINT || '/auth/me';

  /**
   * Login with email and password
   * Calls API Platform /auth/login endpoint and stores tokens
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
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
}

// Export singleton instance
export const authService = new AuthService();
