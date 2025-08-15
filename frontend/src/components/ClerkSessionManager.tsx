import React, { useEffect, useRef } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { useClerkAuthStore } from '../stores/clerkAuthStore';

/**
 * Component to manage Clerk v5 session state and prevent session loss
 * This component ensures that authentication state is properly maintained
 * during navigation and prevents the temporary sign-out issue
 */
const ClerkSessionManager: React.FC = () => {
  const { user, isLoaded } = useUser();
  const { isSignedIn } = useAuth();
  const { setUser, setAuthenticated, setLoaded, user: storeUser, isAuthenticated: storeAuthenticated } = useClerkAuthStore();
  
  // Track if we've already set the loaded state to prevent infinite loops
  const hasSetLoaded = useRef(false);
  const lastUserId = useRef<string | null>(null);
  const hasInitialized = useRef(false);
  const isMounted = useRef(true);
  const sessionCheckTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Prevent multiple initializations or running if not mounted
    if (hasInitialized.current || !isMounted.current) {
      return;
    }

    // Debug logging to track session state changes
    console.log('ClerkSessionManager: State changed', {
      isLoaded,
      isSignedIn,
      hasUser: !!user,
      userId: user?.id,
      storeUser: !!storeUser,
      storeAuthenticated
    });

    // Set loaded state once
    if (!hasSetLoaded.current) {
      setLoaded(true);
      hasSetLoaded.current = true;
    }
    
    // Handle user authentication state
    if (isLoaded) {
      if (user && isSignedIn) {
        // Only update if user actually changed
        if (lastUserId.current !== user.id) {
          console.log('ClerkSessionManager: Setting authenticated user', user.id);
          
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
            hasPassword: user.passwordEnabled || false,
            externalAccounts: user.externalAccounts || [],
            isOAuthOnly: !user.passwordEnabled && (user.externalAccounts?.length > 0 || false)
          };
          
          setUser(transformedUser);
          setAuthenticated(true);
          lastUserId.current = user.id;
        }
      } else if (!user && !isSignedIn) {
        // Check if we have a stored user - this might be temporary session loss
        if (storeUser && lastUserId.current !== null) {
          console.log('ClerkSessionManager: Potential session loss detected, waiting before clearing...');
          
          // Clear any existing timeout
          if (sessionCheckTimeout.current) {
            clearTimeout(sessionCheckTimeout.current);
          }
          
          // Wait a bit to see if session recovers
          sessionCheckTimeout.current = setTimeout(() => {
            if (!isSignedIn && !user && isMounted.current) {
              console.log('ClerkSessionManager: Session confirmed lost, clearing state');
              setUser(null);
              setAuthenticated(false);
              lastUserId.current = null;
            }
          }, 3000); // Wait 3 seconds before clearing
        } else if (lastUserId.current !== null) {
          // No stored user, clear immediately
          console.log('ClerkSessionManager: Clearing user state (no stored user)');
          setUser(null);
          setAuthenticated(false);
          lastUserId.current = null;
        }
      }
    }

    // Mark as initialized after first run
    hasInitialized.current = true;
  }, [user, isSignedIn, isLoaded, storeUser, storeAuthenticated, setUser, setAuthenticated, setLoaded]);

  // Effect to handle session recovery when Clerk becomes available again
  useEffect(() => {
    if (isLoaded && isSignedIn && user && storeUser && lastUserId.current === null) {
      console.log('ClerkSessionManager: Session recovered, updating state');
      lastUserId.current = user.id;
      setAuthenticated(true);
    }
  }, [isLoaded, isSignedIn, user, storeUser, setAuthenticated]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      isMounted.current = false;
      hasInitialized.current = false;
      hasSetLoaded.current = false;
      lastUserId.current = null;
      
      // Clear any pending timeouts
      if (sessionCheckTimeout.current) {
        clearTimeout(sessionCheckTimeout.current);
        sessionCheckTimeout.current = null;
      }
    };
  }, []);

  // This component doesn't render anything
  return null;
};

export default ClerkSessionManager;
