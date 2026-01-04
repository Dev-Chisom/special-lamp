/**
 * Auth Provider
 * Initializes authentication state on app load
 */

'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  useEffect(() => {
    // Only initialize once
    if (!isInitialized) {
      initializeAuth().catch((error) => {
        console.error('[AuthProvider] Auth initialization failed:', error);
      });
    }
  }, [initializeAuth, isInitialized]);

  return <>{children}</>;
}

