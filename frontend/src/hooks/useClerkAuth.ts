import { useEffect, useState } from 'react';
import { useUser, useAuth, useClerk } from '@clerk/clerk-react';
import { useClerkAuthStore } from '../stores/clerkAuthStore';
import { useWishlistStore } from '../stores/wishlistStore';

export const useClerkAuth = () => {
  const { user, isLoaded: clerkLoaded } = useUser();
  const { isSignedIn, getToken } = useAuth();
  const { signOut: clerkSignOut } = useClerk();
  
  // Local state to track authentication changes
  const [localIsAuthenticated, setLocalIsAuthenticated] = useState(false);
  const [localUser, setLocalUser] = useState<any>(null);
  
  const { 
    setUser, 
    setAuthenticated, 
    setLoaded, 
    logout 
  } = useClerkAuthStore();

  // Get wishlist store to clear it on logout
  const { clearWishlistOnLogout } = useWishlistStore();

  useEffect(() => {
    if (clerkLoaded) {
      setLoaded(true);
      
      // Update local state immediately when Clerk state changes
      if (user && isSignedIn) {
        // Transform Clerk user to our format
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
          // Add authentication method detection
          hasPassword: user.passwordEnabled || false,
          externalAccounts: user.externalAccounts || [],
          isOAuthOnly: !user.passwordEnabled && (user.externalAccounts?.length > 0 || false)
        };
        
        setLocalUser(transformedUser);
        setLocalIsAuthenticated(true);
        setUser(transformedUser);
        setAuthenticated(true);
        
        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('clerk-auth-changed', { 
          detail: { isAuthenticated: true, user: transformedUser } 
        }));
      } else {
        setLocalUser(null);
        setLocalIsAuthenticated(false);
        setUser(null);
        setAuthenticated(false);
        
        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('clerk-auth-changed', { 
          detail: { isAuthenticated: false, user: null } 
        }));
      }
    }
  }, [user, isSignedIn, clerkLoaded, setUser, setAuthenticated, setLoaded]);

  // Additional effect to handle immediate state updates
  useEffect(() => {
    // Force a re-render when authentication state changes
    if (clerkLoaded) {
      setLocalIsAuthenticated(!!(user && isSignedIn));
      setLocalUser(user);
    }
  }, [user, isSignedIn, clerkLoaded]);

  const handleSignOut = async () => {
    try {
      // Clear wishlist before signing out
      clearWishlistOnLogout();
      
      await clerkSignOut();
      logout();
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

  const getAuthToken = async () => {
    try {
      // Get JWT token from Clerk for backend authentication
      const token = await getToken({ template: 'e-commerce' });
      return token;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  };

  // Helper function to check if user can change password
  const canChangePassword = () => {
    return user?.passwordEnabled || false;
  };

  // Helper function to check if user is OAuth only
  const isOAuthOnly = () => {
    return user && !user.passwordEnabled && (user.externalAccounts?.length > 0 || false);
  };

  // Use local state for immediate UI updates
  return {
    user: localUser || user,
    isAuthenticated: localIsAuthenticated || isSignedIn,
    isLoaded: clerkLoaded,
    signOut: handleSignOut,
    getToken: getAuthToken,
    canChangePassword,
    isOAuthOnly
  };
};
