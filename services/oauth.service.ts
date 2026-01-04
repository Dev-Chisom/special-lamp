/**
 * OAuth Service
 * Handles OAuth authentication flows (Google, LinkedIn)
 */

import { config } from '@/lib/config';

class OAuthService {
  /**
   * Initiate Google OAuth flow
   * Redirects to backend OAuth endpoint which will handle the OAuth flow
   */
  initiateGoogleOAuth(redirectUrl?: string): void {
    if (typeof window === 'undefined') return;

    const callbackUrl = `${window.location.origin}/auth/callback/google`;
    const state = redirectUrl || '/dashboard';
    
    // Build OAuth URL - backend will handle the OAuth flow
    const baseUrl = config.api.baseUrl.replace('/api/v1', '');
    const oauthUrl = `${baseUrl}/api/v1/auth/google?redirect_uri=${encodeURIComponent(callbackUrl)}&state=${encodeURIComponent(state)}`;
    
    // Redirect to backend OAuth endpoint
    window.location.href = oauthUrl;
  }

  /**
   * Initiate LinkedIn OAuth flow
   * Redirects to backend OAuth endpoint which will handle the OAuth flow
   */
  initiateLinkedInOAuth(redirectUrl?: string): void {
    if (typeof window === 'undefined') return;

    const callbackUrl = `${window.location.origin}/auth/callback/linkedin`;
    const state = redirectUrl || '/dashboard';
    
    // Build OAuth URL - backend will handle the OAuth flow
    const baseUrl = config.api.baseUrl.replace('/api/v1', '');
    const oauthUrl = `${baseUrl}/api/v1/auth/linkedin?redirect_uri=${encodeURIComponent(callbackUrl)}&state=${encodeURIComponent(state)}`;
    
    // Redirect to backend OAuth endpoint
    window.location.href = oauthUrl;
  }

  /**
   * Handle OAuth callback
   * Called after OAuth provider redirects back to the app
   * Backend callback endpoint (GET) should redirect here with tokens in URL params
   * Returns true if tokens were found and stored, false otherwise
   */
  async handleOAuthCallback(
    provider: 'google' | 'linkedin',
    code?: string,
    state?: string,
    error?: string
  ): Promise<{ success: boolean; redirectUrl?: string; error?: string }> {
    if (typeof window === 'undefined') {
      return { success: false, error: 'Not in browser environment' };
    }

    // If there's an error from the OAuth provider
    if (error) {
      return { success: false, error };
    }

    // Check if tokens are in URL params (backend redirects with tokens directly)
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');
    const errorParam = urlParams.get('error');

    if (errorParam) {
      return { success: false, error: errorParam };
    }

    if (accessToken && refreshToken) {
      console.log('[OAuthService] Storing tokens in localStorage', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        accessTokenLength: accessToken.length,
        refreshTokenLength: refreshToken.length,
      });
      
      // Store tokens
      localStorage.setItem(config.auth.tokenKeys.accessToken, accessToken);
      localStorage.setItem(config.auth.tokenKeys.refreshToken, refreshToken);
      
      // Verify tokens were stored
      const storedAccessToken = localStorage.getItem(config.auth.tokenKeys.accessToken);
      const storedRefreshToken = localStorage.getItem(config.auth.tokenKeys.refreshToken);
      console.log('[OAuthService] Tokens stored, verification', {
        accessTokenStored: !!storedAccessToken,
        refreshTokenStored: !!storedRefreshToken,
      });
      
      // Return success with redirect URL - don't redirect here, let the callback page handle it
      const redirectUrl = state || urlParams.get('state') || '/dashboard';
      console.log('[OAuthService] Returning success, redirect URL:', redirectUrl);
      return { success: true, redirectUrl };
    }

    // If we have a code but no tokens, the backend might use a different flow
    // This should not happen if backend redirects with tokens, but keeping as fallback
    if (code) {
      console.warn('Received authorization code but backend should handle token exchange');
      return { success: false, error: 'oauth_callback_failed' };
    }

    // No tokens, no code - something went wrong
    return { success: false, error: 'no_tokens' };
  }
}

// Export singleton instance
export const oauthService = new OAuthService();

