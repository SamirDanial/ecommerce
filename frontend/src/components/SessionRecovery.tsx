import React, { useEffect, useRef } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { useClerkAuthStore } from '../stores/clerkAuthStore';

/**
 * Component to recover and maintain session state during navigation
 * This prevents the authentication state from being lost when switching between pages
 */
const SessionRecovery: React.FC = () => {
  const { user, isLoaded } = useUser();
  const { isSignedIn } = useAuth();
  const { user: storeUser, setUser, setAuthenticated } = useClerkAuthStore();
  
  const lastKnownUser = useRef<string | null>(null);
  const recoveryAttempts = useRef(0);
  const maxRecoveryAttempts = 3;

  useEffect(() => {
    // If we have a stored user but Clerk says no user, try to recover
    if (isLoaded && storeUser && !isSignedIn && !user) {
      console.log('SessionRecovery: Attempting to recover session...');
      
      if (recoveryAttempts.current < maxRecoveryAttempts) {
        recoveryAttempts.current++;
        
        // Wait a bit and check again - Clerk might be reinitializing
        const timeout = setTimeout(() => {
          if (storeUser && !isSignedIn && !user) {
            console.log(`SessionRecovery: Recovery attempt ${recoveryAttempts.current} failed`);
            
            // If we've exhausted recovery attempts, clear the session
            if (recoveryAttempts.current >= maxRecoveryAttempts) {
              console.log('SessionRecovery: Max recovery attempts reached, clearing session');
              setUser(null);
              setAuthenticated(false);
            }
          }
        }, 2000); // Wait 2 seconds

        return () => clearTimeout(timeout);
      }
    }

    // Reset recovery attempts if we get a valid user
    if (isSignedIn && user) {
      recoveryAttempts.current = 0;
      lastKnownUser.current = user.id;
    }
  }, [isLoaded, isSignedIn, user, storeUser, setUser, setAuthenticated]);

  // Effect to handle session restoration when Clerk becomes available again
  useEffect(() => {
    if (isLoaded && isSignedIn && user && storeUser && lastKnownUser.current === user.id) {
      console.log('SessionRecovery: Session restored successfully');
      recoveryAttempts.current = 0;
    }
  }, [isLoaded, isSignedIn, user, storeUser]);

  // This component doesn't render anything
  return null;
};

export default SessionRecovery;
