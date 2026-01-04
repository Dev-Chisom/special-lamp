"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Spinner } from '@/components/ui/spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, user, isInitialized } = useAuthStore();

  useEffect(() => {
    // Only redirect if auth is fully initialized and user is not authenticated
    // Wait for initialization to complete before making redirect decisions
    if (isInitialized && !isLoading && !isAuthenticated) {
      router.push(`/auth/signin?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, isLoading, isInitialized, router, pathname, user]);

  // Show loading state while checking authentication (waiting for initialization)
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  // Show nothing while redirecting (but only after initialization is complete)
  if (!isAuthenticated) {
    return null;
  }

  // Render protected content
  return <>{children}</>;
}
