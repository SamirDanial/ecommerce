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
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoaded: false,

      setUser: (user) => {
        set({ 
          user, 
          isAuthenticated: !!user 
        });
      },

      setAuthenticated: (authenticated) => {
        set({ isAuthenticated: authenticated });
      },

      setLoaded: (loaded) => {
        set({ isLoaded: loaded });
      },

      logout: () => {
        set({ 
          user: null, 
          isAuthenticated: false 
        });
      }
    }),
    {
      name: 'clerk-auth-store',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated,
        isLoaded: state.isLoaded
      })
    }
  )
);
