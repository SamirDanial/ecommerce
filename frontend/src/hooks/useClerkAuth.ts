import { useCallback, useEffect, useState } from 'react';
import { useUser, useAuth, useClerk } from '@clerk/clerk-react';
import { useClerkAuthStore } from '../stores/clerkAuthStore';
import { useWishlistStore } from '../stores/wishlistStore';

export const useClerkAuth = () => {
  const { user, isLoaded: clerkLoaded } = useUser();
  const { isSignedIn, getToken } = useAuth();
  const { signOut: clerkSignOut } = useClerk();
  
  const { logout, user: storeUser, isAuthenticated: storeAuthenticated } = useClerkAuthStore();

  // Get wishlist store to clear it on logout
  const { clearWishlistOnLogout } = useWishlistStore();

  // Local state to handle temporary session loss
  const [localIsAuthenticated, setLocalIsAuthenticated] = useState(storeAuthenticated);
  const [localUser, setLocalUser] = useState(storeUser);

  // Update local state when store changes
  useEffect(() => {
    setLocalIsAuthenticated(storeAuthenticated);
    setLocalUser(storeUser);
  }, [storeAuthenticated, storeUser]);

  // Handle Clerk state changes
  useEffect(() => {
    if (clerkLoaded) {
      if (isSignedIn && user) {
        // Clerk says we're authenticated
        setLocalIsAuthenticated(true);
        // Transform Clerk user to our format for local state
        const transformedUser = {
          id: user.id,
          emailAddresses: user.emailAddresses.map(email => ({
            emailAddress: email.emailAddress,
            id: email.id,
            verification: {
              status: email.verification?.status || 'unverified'
            }
          })),
          firstName: user.firstName || undefined,
          lastName: user.lastName || undefined,
          imageUrl: user.imageUrl,
          createdAt: user.createdAt || new Date(),
          updatedAt: user.updatedAt || new Date(),
          hasPassword: user.passwordEnabled || false,
          externalAccounts: user.externalAccounts || [],
          isOAuthOnly: !user.passwordEnabled && (user.externalAccounts?.length > 0 || false)
        };
        setLocalUser(transformedUser);
      } else if (!isSignedIn && !user) {
        // Only clear local state if we don't have stored state
        // This prevents clearing during temporary session loss
        if (!storeUser) {
          setLocalIsAuthenticated(false);
          setLocalUser(null);
        }
      }
    }
  }, [clerkLoaded, isSignedIn, user, storeUser]);

  const handleSignOut = async () => {
    try {
      // Clear wishlist before signing out
      clearWishlistOnLogout();
      
      await clerkSignOut();
      logout();
      
      // Clear local state
      setLocalIsAuthenticated(false);
      setLocalUser(null);
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('clerk-auth-changed', { 
        detail: { isAuthenticated: false, user: null } 
      }));
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getAuthToken = useCallback(async () => {
    try {
      // Get JWT token from Clerk for backend authentication
      const token = await getToken({ template: 'e-commerce' });
      return token;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }, [getToken]);

  // Helper function to check if user can change password
  const canChangePassword = () => {
    return user?.passwordEnabled || false;
  };

  // Helper function to check if user is OAuth only
  const isOAuthOnly = () => {
    return user && !user.passwordEnabled && (user.externalAccounts?.length > 0 || false);
  };

  // Use a combination of Clerk state and local state to prevent flashing
  // Prioritize Clerk state when available, fallback to local state
  const finalUser = clerkLoaded ? (user || localUser) : localUser;
  const finalIsAuthenticated = clerkLoaded ? (isSignedIn || localIsAuthenticated) : localIsAuthenticated;

  return {
    user: finalUser,
    isAuthenticated: finalIsAuthenticated,
    isLoaded: clerkLoaded,
    signOut: handleSignOut,
    getToken: getAuthToken,
    canChangePassword,
    isOAuthOnly
  };
};
