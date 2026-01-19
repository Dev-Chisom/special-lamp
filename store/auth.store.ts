/**
 * Authentication Store
 * Global state management for authentication using Zustand
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '@/services/auth.service';
import { config } from '@/lib/config';
import type { User, SignInRequest, SignUpRequest } from '@/types/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  lastFetchTime: number | null; // Timestamp of last successful /auth/me call
  
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  signIn: (credentials: SignInRequest) => Promise<void>;
  signUp: (data: SignUpRequest) => Promise<void>;
  signOut: () => Promise<void>;
  fetchCurrentUser: (force?: boolean) => Promise<void>;
  initializeAuth: () => Promise<void>;
}

// Request deduplication: prevent multiple simultaneous /auth/me calls
let pendingFetchUserPromise: Promise<void> | null = null;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isInitialized: false,
      lastFetchTime: null,

      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user,
          error: null,
        });
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },

      setError: (error) => {
        set({ error });
      },

      signIn: async (credentials) => {
        try {
          set({ isLoading: true, error: null });
          const response = await authService.signIn(credentials);
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            lastFetchTime: Date.now(),
          });
        } catch (error: any) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.message || 'Sign in failed',
          });
          throw error;
        }
      },

      signUp: async (data) => {
        try {
          set({ isLoading: true, error: null });
          const response = await authService.signUp(data);
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            lastFetchTime: Date.now(),
          });
        } catch (error: any) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.message || 'Sign up failed',
          });
          throw error;
        }
      },

      signOut: async () => {
        try {
          // Clear pending fetch if any
          pendingFetchUserPromise = null;
          authService.signOut();
          set({
            user: null,
            isAuthenticated: false,
            error: null,
            isInitialized: false, // Reset initialization flag on sign out
            lastFetchTime: null,
          });
        } catch (error: any) {
          set({ error: error.message || 'Sign out failed' });
        }
      },

      fetchCurrentUser: async (force = false) => {
        // If there's already a pending request, wait for it instead of making a new one
        if (pendingFetchUserPromise && !force) {
          return pendingFetchUserPromise;
        }

        // Check if we have recent user data (within last 5 minutes) and don't force refresh
        const state = get();
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        if (!force && state.user && state.lastFetchTime && state.lastFetchTime > fiveMinutesAgo) {
          return;
        }

        // Create the fetch promise and store it for deduplication
        const fetchPromise = (async () => {
          try {
            set({ isLoading: true, error: null });
            const user = await authService.getCurrentUser();
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
              lastFetchTime: Date.now(),
            });
          } catch (error: any) {
            // If fetching user fails, user is not authenticated
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null, // Don't show error on failed fetch, just clear auth state
              lastFetchTime: null,
            });
            // Clear tokens if they exist
            authService.signOut();
            throw error; // Re-throw to let callers handle it
          } finally {
            // Clear the pending promise when done
            pendingFetchUserPromise = null;
          }
        })();

        pendingFetchUserPromise = fetchPromise;
        return fetchPromise;
      },

      initializeAuth: async () => {
        // Prevent duplicate initialization
        const state = get();
        if (state.isInitialized) {
          return;
        }

        // Set loading immediately to prevent redirects during initialization
        set({ isLoading: true });
        
        // Check if we have tokens (check both access and refresh tokens)
        let hasAccessToken = false;
        let hasRefreshToken = false;
        
        if (typeof window !== 'undefined') {
          hasAccessToken = !!localStorage.getItem(config.auth.tokenKeys.accessToken);
          hasRefreshToken = !!localStorage.getItem(config.auth.tokenKeys.refreshToken);
        }
        
        // If we have a refresh token, we can still authenticate (even if access token is missing/expired)
        if (!hasRefreshToken) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            isInitialized: true,
          });
          return;
        }

        // If we only have refresh token but no access token, refresh it first
        if (!hasAccessToken && hasRefreshToken) {
          try {
            const refreshToken = localStorage.getItem(config.auth.tokenKeys.refreshToken);
            if (refreshToken) {
              await authService.refreshToken(refreshToken);
              hasAccessToken = true;
            }
          } catch (error: any) {
            console.error('[AuthStore] Failed to refresh token:', error);
            // Refresh token is invalid, clear state
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              isInitialized: true,
            });
            authService.signOut();
            return;
          }
        }

        // Try to fetch current user to verify tokens are valid
        // The API client will automatically refresh the access token if it's expired (401)
        // If we have persisted user data, we can use it immediately and fetch in background
        const currentState = get();
        if (currentState.user) {
          // We have persisted user data, mark as initialized immediately
          set({ isInitialized: true, isLoading: false });
          // Fetch user in background to update if needed (non-blocking)
          get().fetchCurrentUser().catch(() => {
            // Silently fail background fetch, user is already authenticated
          });
        } else {
          // No user data, must fetch to verify tokens
          try {
            await get().fetchCurrentUser();
            set({ isInitialized: true, isLoading: false });
          } catch (error: any) {
          console.error('[AuthStore] Failed to fetch user:', error);
          // Check if we still have a refresh token - if so, don't clear everything immediately
          const stillHasRefreshToken = typeof window !== 'undefined' && !!localStorage.getItem(config.auth.tokenKeys.refreshToken);
          
          if (!stillHasRefreshToken) {
            // No refresh token, clear everything
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              isInitialized: true,
            });
            authService.signOut();
          } else {
            // Still have refresh token, but fetch failed - keep tokens but mark as not authenticated
            // This allows retry on next navigation
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              isInitialized: false, // Allow retry
            });
          }
          }}
      },
    }),
    {
      name: 'auth-storage',
      // Only persist user data, not loading/error states
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        lastFetchTime: state.lastFetchTime,
      }),
    }
  )
);

