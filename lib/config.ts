export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1',
  },
  auth: {
    tokenKeys: {
      accessToken: 'applyengine_access_token',
      refreshToken: 'applyengine_refresh_token',
    },
  },
} as const;

