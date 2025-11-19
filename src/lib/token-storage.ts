/**
 * Token Storage Utility
 * Manages secure storage and retrieval of JWT tokens
 * Uses localStorage for client-side persistence and cookies for server-side access
 */

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

/**
 * Set a cookie with the given name and value
 */
function setCookie(name: string, value: string, days: number = 7): void {
  if (typeof document !== 'undefined') {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  }
}

/**
 * Remove a cookie with the given name
 */
function removeCookie(name: string): void {
  if (typeof document !== 'undefined') {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }
}

export const tokenStorage = {
  /**
   * Store the authentication token in both localStorage and cookie
   */
  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
      setCookie(TOKEN_KEY, token);
    }
  },

  /**
   * Retrieve the authentication token from localStorage
   */
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  },

  /**
   * Remove the authentication token from both localStorage and cookie
   */
  removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      removeCookie(TOKEN_KEY);
    }
  },

  /**
   * Store the refresh token in both localStorage and cookie
   */
  setRefreshToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
      setCookie(REFRESH_TOKEN_KEY, token);
    }
  },

  /**
   * Retrieve the refresh token from localStorage
   */
  getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    }
    return null;
  },

  /**
   * Remove the refresh token from both localStorage and cookie
   */
  removeRefreshToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      removeCookie(REFRESH_TOKEN_KEY);
    }
  },

  /**
   * Clear all tokens from both localStorage and cookies
   */
  clearAll(): void {
    this.removeToken();
    this.removeRefreshToken();
  },
};
