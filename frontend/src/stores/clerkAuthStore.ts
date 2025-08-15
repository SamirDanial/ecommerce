import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ClerkUser {
  id: string;
  emailAddresses: Array<{
    emailAddress: string;
    id: string;
    verification: {
      status: string | null;
    };
  }>;
  firstName?: string;
  lastName?: string;
  imageUrl: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  // Authentication method information
  hasPassword: boolean;
  externalAccounts: Array<{
    id: string;
    provider: string;
    emailAddress?: string;
    username?: string;
  }>;
  isOAuthOnly: boolean;
}

interface ClerkAuthState {
  user: ClerkUser | null;
  isAuthenticated: boolean;
  isLoaded: boolean;
  setUser: (user: ClerkUser | null) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setLoaded: (loaded: boolean) => void;
  logout: () => void;
}

export const useClerkAuthStore = create<ClerkAuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoaded: false,

      setUser: (user) => {
        const currentUser = get().user;
        // Only update if user actually changed
        if (currentUser?.id !== user?.id) {
          set({ 
            user, 
            isAuthenticated: !!user 
          });
        }
      },

      setAuthenticated: (authenticated) => {
        const currentAuth = get().isAuthenticated;
        // Only update if authentication state actually changed
        if (currentAuth !== authenticated) {
          set({ isAuthenticated: authenticated });
        }
      },

      setLoaded: (loaded) => {
        const currentLoaded = get().isLoaded;
        // Only update if loaded state actually changed
        if (currentLoaded !== loaded) {
          set({ isLoaded: loaded });
        }
      },

      logout: () => {
        set({ 
          user: null, 
          isAuthenticated: false,
          isLoaded: false
        });
      }
    }),
    {
      name: 'clerk-auth-store',
      // Persist all state to prevent session loss
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated,
        isLoaded: state.isLoaded
      }),
      // Add version to handle schema changes
      version: 1
    }
  )
);
