/**
 * API Client
 * HTTP client wrapper with automatic bearer token injection and error handling
 */

import { tokenStorage } from './token-storage';

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  statusCode: number;
}

interface RequestConfig extends RequestInit {
  params?: Record<string, string>;
}

class ApiClient {
  private baseURL: string;
  private timeout: number;
  private onUnauthorized?: () => void;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost';
    this.timeout = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '10000', 10);
  }

  /**
   * Set callback to be called when 401 Unauthorized response is received
   * This allows the auth context to update its state when user is logged out
   */
  setUnauthorizedCallback(callback: () => void): void {
    this.onUnauthorized = callback;
  }

  /**
   * Build full URL with query parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, string>): string {
    const url = new URL(endpoint, this.baseURL);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    
    return url.toString();
  }

  /**
   * Get default headers with bearer token if available
   */
  private getHeaders(customHeaders?: HeadersInit): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/ld+json',
      'Accept': 'application/ld+json',
      ...customHeaders,
    };

    // Remove Content-Type if it's set to multipart/form-data
    // Let the browser set it automatically with the correct boundary
    if (customHeaders && 
        typeof customHeaders === 'object' && 
        'Content-Type' in customHeaders &&
        (customHeaders as any)['Content-Type'] === 'multipart/form-data') {
      delete (headers as any)['Content-Type'];
    }

    const token = tokenStorage.getToken();
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Handle API errors and transform them
   */
  private handleError(error: any): never {
    if (error.name === 'AbortError') {
      throw {
        message: 'Request timeout. Please try again.',
        statusCode: 0,
      } as ApiError;
    }

    throw error;
  }

  /**
   * Process response and handle errors
   */
  private async processResponse<T>(response: Response): Promise<T> {
    // Handle 401 Unauthorized - clear tokens and redirect to login
    if (response.status === 401) {
      tokenStorage.clearAll();
      
      // Call the unauthorized callback to update auth state
      if (this.onUnauthorized) {
        this.onUnauthorized();
      }
      
      // Only redirect on client side
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      
      throw {
        message: 'Unauthorized. Please log in again.',
        statusCode: 401,
      } as ApiError;
    }

    // Parse response body - always try JSON first
    let data: any;
    const text = await response.text();
    try {
      // Try to parse as JSON
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      // If parsing fails, return the text as-is
      data = text;
    }

    // Handle error responses
    if (!response.ok) {
      throw {
        message: data.message || data.error || 'An error occurred',
        errors: data.errors,
        statusCode: response.status,
      } as ApiError;
    }

    return data as T;
  }

  /**
   * Make HTTP request with timeout and error handling
   */
  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const { params, ...fetchConfig } = config;
    const url = this.buildUrl(endpoint, params);

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...fetchConfig,
        headers: this.getHeaders(fetchConfig.headers),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return await this.processResponse<T>(response);
    } catch (error: any) {
      clearTimeout(timeoutId);
      return this.handleError(error);
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    // Don't stringify FormData - let the browser handle it
    const body = data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined);
    
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body,
    });
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'DELETE',
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
