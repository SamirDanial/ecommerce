import React from 'react';
import { useLocation } from 'react-router-dom';

interface AuthRedirectWrapperProps {
  children: React.ReactNode;
}

/**
 * Wrapper component that ensures authentication redirects respect the current page
 * Simplified for Clerk v5 compatibility
 */
export const AuthRedirectWrapper: React.FC<AuthRedirectWrapperProps> = ({ children }) => {
  const location = useLocation();

  // Store the current path in sessionStorage for Clerk to use
  React.useEffect(() => {
    const currentPath = location.pathname;
    if (currentPath && currentPath !== '/login' && currentPath !== '/register') {
      sessionStorage.setItem('clerk-redirect-url', currentPath);
    }
  }, [location.pathname]);

  return <>{children}</>;
};
