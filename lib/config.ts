/**
 * Application configuration
 * Centralized configuration for API endpoints and other constants
 */

export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1',
    timeout: 30000, // 30 seconds
  },
  auth: {
    tokenKeys: {
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
    },
  },
} as const;

