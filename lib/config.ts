export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1',
  },
  auth: {
    tokenKeys: {
      accessToken: 'pathforge_access_token',
      refreshToken: 'pathforge_refresh_token',
    },
  },
} as const;

