import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthRedirect } from '../hooks/useAuthRedirect';

interface AuthRedirectWrapperProps {
  children: React.ReactNode;
}

/**
 * Wrapper component that ensures authentication redirects respect the current page
 * This prevents unwanted redirects to home page when users reject sign-in
 */
export const AuthRedirectWrapper: React.FC<AuthRedirectWrapperProps> = ({ children }) => {
  const location = useLocation();
  const { getCurrentPath } = useAuthRedirect();

  // Store the current path in sessionStorage for Clerk to use
  useEffect(() => {
    const currentPath = getCurrentPath();
    if (currentPath && currentPath !== '/login' && currentPath !== '/register') {
      sessionStorage.setItem('clerk-redirect-url', currentPath);
    }
  }, [location.pathname, getCurrentPath]);

  return <>{children}</>;
};
