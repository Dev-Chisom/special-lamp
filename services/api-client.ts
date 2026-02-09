/**
 * API Client
 * Handles all HTTP requests with automatic token refresh and error handling
 */

import { config } from '@/lib/config';
import { authBroadcast } from '@/lib/auth-broadcast';
import type { AuthTokens } from '@/types/auth';

export interface ApiError {
  detail: string | string[] | Record<string, string[]>;
  statusCode?: number;
  errors?: Record<string, string[]>;
}

export class ApiClientError extends Error {
  statusCode?: number;
  detail?: string | string[] | Record<string, string[]>;
  fieldErrors?: Record<string, string[]>; // Field-specific errors

  constructor(message: string, statusCode?: number, detail?: string | string[] | Record<string, string[]>, fieldErrors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiClientError';
    this.statusCode = statusCode;
    this.detail = detail;
    this.fieldErrors = fieldErrors;
  }

  /**
   * Get error message for a specific field
   */
  getFieldError(fieldName: string): string | undefined {
    if (this.fieldErrors && this.fieldErrors[fieldName]) {
      return this.fieldErrors[fieldName][0]; // Return first error for the field
    }
    return undefined;
  }

  /**
   * Get all field errors
   */
  getAllFieldErrors(): Record<string, string[]> {
    return this.fieldErrors || {};
  }

  /**
   * Get general error message (non-field-specific)
   */
  getGeneralError(): string {
    if (typeof this.detail === 'string') {
      return this.detail;
    }
    if (Array.isArray(this.detail)) {
      return this.detail[0] || this.message;
    }
    return this.message;
  }
}

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.api.baseUrl;
  }

  /**
   * Get stored access token
   */
  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(config.auth.tokenKeys.accessToken);
  }

  /**
   * Get stored refresh token
   */
  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(config.auth.tokenKeys.refreshToken);
  }

  /**
   * Store tokens in localStorage
   */
  private setTokens(tokens: AuthTokens): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(config.auth.tokenKeys.accessToken, tokens.access_token);
    localStorage.setItem(config.auth.tokenKeys.refreshToken, tokens.refresh_token);
  }

  /**
   * Clear tokens from localStorage
   */
  private clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(config.auth.tokenKeys.accessToken);
    localStorage.removeItem(config.auth.tokenKeys.refreshToken);
  }

  /**
   * Refresh access token using refresh token
   */
  private async refreshAccessToken(): Promise<string> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      throw new ApiClientError('No refresh token available', 401);
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          refresh_token: refreshToken,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Token refresh failed' }));
        throw new ApiClientError(error.detail || 'Token refresh failed', response.status);
      }

      const data = await response.json();
      this.setTokens({
        access_token: data.access_token,
        refresh_token: refreshToken, // Keep the same refresh token
      });

      // Broadcast token refresh to other tabs
      authBroadcast.broadcastTokenRefresh();

      return data.access_token;
    } catch (error) {
      // If refresh fails, clear tokens and redirect to login
      this.clearTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/signin';
      }
      throw error;
    }
  }

  /**
   * Make HTTP request with automatic token refresh on 401
   */
  async request<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { skipAuth = false, ...fetchOptions } = options;

    // Check if body is FormData or string (URL-encoded)
    const isFormData = fetchOptions.body instanceof FormData;
    const isString = typeof fetchOptions.body === 'string';
    const hasCustomContentType = fetchOptions.headers && 
      (fetchOptions.headers instanceof Headers 
        ? fetchOptions.headers.get('Content-Type')
        : (fetchOptions.headers as Record<string, string>)['Content-Type']);

    // Build headers
    const headers = new Headers(fetchOptions.headers);

    // Only set Content-Type if not FormData and not already set (browser will set it with boundary for FormData)
    if (!isFormData && !hasCustomContentType) {
      headers.set('Content-Type', 'application/json');
    }

    // Add auth token if not skipping auth
    if (!skipAuth) {
      const token = this.getAccessToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }

    // Make initial request
    // Ensure endpoint starts with / to avoid double slashes
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    const url = `${this.baseUrl}${normalizedEndpoint}`
    
    let response = await fetch(url, {
      ...fetchOptions,
      headers,
      credentials: 'include', // Include credentials for CORS
    });

    // If 401 and not skipAuth, try to refresh token and retry
    if (response.status === 401 && !skipAuth) {
      try {
        const newToken = await this.refreshAccessToken();
        
        // Retry request with new token
        const retryHeaders = new Headers(headers);
        retryHeaders.set('Authorization', `Bearer ${newToken}`);
        response = await fetch(url, {
          ...fetchOptions,
          headers: retryHeaders,
          credentials: 'include',
        });
        
        // If retry still returns 401, session is invalid - clear tokens and redirect
        if (response.status === 401) {
          console.warn('[ApiClient] Retry after refresh still returned 401, clearing tokens and redirecting');
          this.clearTokens();
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/signin';
          }
        }
      } catch (error) {
        // Refresh failed, tokens already cleared and redirected in refreshAccessToken
        throw error;
      }
    }

    // Handle errors
    if (!response.ok) {
      let errorData: ApiError;
      try {
        errorData = await response.json();
      } catch {
        errorData = {
          detail: `Request failed with status ${response.status}`,
          statusCode: response.status,
        };
      }

      // Parse field-specific errors
      let fieldErrors: Record<string, string[]> | undefined;
      const detail = errorData.detail;

      // Handle different error formats from backend
      if (typeof detail === 'object' && !Array.isArray(detail) && detail !== null) {
        // Format: { detail: { field1: ["error1"], field2: ["error2"] } }
        fieldErrors = detail as Record<string, string[]>;
      } else if (errorData.errors) {
        // Format: { errors: { field1: ["error1"], field2: ["error2"] } }
        fieldErrors = errorData.errors;
      }

      // Get general error message
      let generalMessage = 'Request failed';
      if (typeof detail === 'string') {
        generalMessage = detail;
      } else if (Array.isArray(detail)) {
        generalMessage = detail[0] || generalMessage;
      } else if (typeof detail === 'object' && detail !== null) {
        // If detail is an object with field errors, use first field error or default message
        const firstField = Object.keys(detail)[0];
        if (firstField && Array.isArray((detail as Record<string, string[]>)[firstField])) {
          generalMessage = (detail as Record<string, string[]>)[firstField][0] || generalMessage;
        }
      }

      throw new ApiClientError(
        generalMessage,
        response.status,
        detail,
        fieldErrors
      );
    }

    // Handle empty responses (204 No Content, 205 Reset Content)
    if (response.status === 204 || response.status === 205) {
      return undefined as T;
    }

    // Check if response has content to parse
    const contentType = response.headers.get('content-type');
    const contentLength = response.headers.get('content-length');
    
    // If no content-type or not JSON, return empty object
    if (!contentType || !contentType.includes('application/json')) {
      return {} as T;
    }

    // If content-length is 0, return empty object
    if (contentLength === '0') {
      return {} as T;
    }

    // Try to parse JSON, but handle empty body gracefully
    try {
      const text = await response.text();
      if (!text || text.trim() === '') {
        return {} as T;
      }
      return JSON.parse(text) as T;
    } catch (error) {
      // If JSON parsing fails and we have an empty/undefined response, return empty object
      return {} as T;
    }
  }

  /**
   * GET request
   */
  async get<T = any>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T = any>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body,
    });
  }

  /**
   * PUT request
   */
  async put<T = any>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    let body: any;
    if (data instanceof FormData) {
      body = data;
    } else if (typeof data === 'string') {
      // If data is already a string (e.g., URL-encoded form data), use it directly
      body = data;
    } else {
      body = JSON.stringify(data);
    }
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body,
    });
  }

  /**
   * PATCH request
   */
  async patch<T = any>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body,
    });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

