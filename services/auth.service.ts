/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import { apiClient } from './api-client';
import type {
  SignInRequest,
  SignUpRequest,
  SignInResponse,
  SignUpResponse,
  User,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AuthTokens,
} from '@/types/auth';
import { config } from '@/lib/config';

class AuthService {
  /**
   * Sign up a new user
   */
  async signUp(data: SignUpRequest): Promise<SignUpResponse> {
    const response = await apiClient.post<SignUpResponse>(
      '/auth/signup',
      {
        email: data.email,
        password: data.password,
        full_name: data.full_name,
      },
      { skipAuth: true }
    );

    // Store tokens
    if (typeof window !== 'undefined') {
      localStorage.setItem(config.auth.tokenKeys.accessToken, response.access_token);
      localStorage.setItem(config.auth.tokenKeys.refreshToken, response.refresh_token);
    }

    return response;
  }

  /**
   * Sign in an existing user
   */
  async signIn(data: SignInRequest): Promise<SignInResponse> {
    const response = await apiClient.post<SignInResponse>(
      '/auth/signin',
      {
        email: data.email,
        password: data.password,
      },
      { skipAuth: true }
    );

    // Store tokens
    if (typeof window !== 'undefined') {
      localStorage.setItem(config.auth.tokenKeys.accessToken, response.access_token);
      localStorage.setItem(config.auth.tokenKeys.refreshToken, response.refresh_token);
    }

    return response;
  }

  /**
   * Sign out current user
   */
  signOut(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(config.auth.tokenKeys.accessToken);
      localStorage.removeItem(config.auth.tokenKeys.refreshToken);
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>('/auth/me');
  }

  /**
   * Update current user profile
   */
  async updateUser(data: Partial<User>): Promise<User> {
    return apiClient.put<User>('/auth/me', data);
  }

  /**
   * Request password reset
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(
      '/auth/forgot-password',
      { email: data.email },
      { skipAuth: true }
    );
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(
      '/auth/reset-password',
      {
        token: data.token,
        new_password: data.new_password,
      },
      { skipAuth: true }
    );
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const response = await apiClient.post<{ access_token: string }>(
      '/auth/refresh',
      { refresh_token: refreshToken },
      { skipAuth: true }
    );

    const tokens: AuthTokens = {
      access_token: response.access_token,
      refresh_token: refreshToken,
    };

    // Store new tokens
    if (typeof window !== 'undefined') {
      localStorage.setItem(config.auth.tokenKeys.accessToken, tokens.access_token);
      localStorage.setItem(config.auth.tokenKeys.refreshToken, tokens.refresh_token);
    }

    return tokens;
  }

  /**
   * Check if user is authenticated (has tokens)
   */
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') {
      console.log('[AuthService] isAuthenticated: Not in browser environment');
      return false;
    }
    const accessToken = localStorage.getItem(config.auth.tokenKeys.accessToken);
    const refreshToken = localStorage.getItem(config.auth.tokenKeys.refreshToken);
    const hasAuth = !!accessToken;
    console.log('[AuthService] isAuthenticated: Check', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      isAuthenticated: hasAuth,
    });
    return hasAuth;
  }

  /**
   * Get stored access token
   */
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(config.auth.tokenKeys.accessToken);
  }

  /**
   * Get stored refresh token
   */
  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(config.auth.tokenKeys.refreshToken);
  }
}

// Export singleton instance
export const authService = new AuthService();

