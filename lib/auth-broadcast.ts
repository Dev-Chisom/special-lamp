/**
 * Authentication Broadcast Channel
 * Synchronizes authentication state across browser tabs/windows
 */

type AuthBroadcastMessage = 
  | { type: 'SIGN_IN'; user: any }
  | { type: 'SIGN_OUT' }
  | { type: 'SIGN_UP'; user: any }
  | { type: 'TOKEN_REFRESHED' };

class AuthBroadcastChannel {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<(message: AuthBroadcastMessage) => void> = new Set();
  private isInitialized = false;

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel('auth-sync');
      this.channel.onmessage = (event) => {
        const message = event.data as AuthBroadcastMessage;
        // Notify all listeners
        this.listeners.forEach((listener) => {
          try {
            listener(message);
          } catch (error) {
            console.error('[AuthBroadcast] Error in listener:', error);
          }
        });
      };
      this.isInitialized = true;
    }
  }

  /**
   * Subscribe to authentication events from other tabs
   */
  subscribe(listener: (message: AuthBroadcastMessage) => void): () => void {
    this.listeners.add(listener);
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Broadcast sign in event to other tabs
   */
  broadcastSignIn(user: any): void {
    if (!this.isInitialized || !this.channel) return;
    this.channel.postMessage({ type: 'SIGN_IN', user } as AuthBroadcastMessage);
  }

  /**
   * Broadcast sign out event to other tabs
   */
  broadcastSignOut(): void {
    if (!this.isInitialized || !this.channel) return;
    this.channel.postMessage({ type: 'SIGN_OUT' } as AuthBroadcastMessage);
  }

  /**
   * Broadcast sign up event to other tabs
   */
  broadcastSignUp(user: any): void {
    if (!this.isInitialized || !this.channel) return;
    this.channel.postMessage({ type: 'SIGN_UP', user } as AuthBroadcastMessage);
  }

  /**
   * Broadcast token refresh event to other tabs
   */
  broadcastTokenRefresh(): void {
    if (!this.isInitialized || !this.channel) return;
    this.channel.postMessage({ type: 'TOKEN_REFRESHED' } as AuthBroadcastMessage);
  }

  /**
   * Close the broadcast channel
   */
  close(): void {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
      this.isInitialized = false;
    }
    this.listeners.clear();
  }
}

// Singleton instance
export const authBroadcast = new AuthBroadcastChannel();
