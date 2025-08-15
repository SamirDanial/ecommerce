import React from 'react';
import { useClerkAuth } from '../hooks/useClerkAuth';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallbackPath = '/login' 
}) => {
  const { isAuthenticated, isLoaded } = useClerkAuth();

  // Debug logging to track authentication state changes
  React.useEffect(() => {
    console.log('ProtectedRoute: Auth state changed', {
      isLoaded,
      isAuthenticated,
      pathname: window.location.pathname
    });
  }, [isLoaded, isAuthenticated]);

  // Show loading state while Clerk is initializing
  // This prevents the flash of sign-out state
  if (!isLoaded) {
    console.log('ProtectedRoute: Still loading, showing spinner');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Only redirect if we're sure the user is not authenticated
  // This prevents the temporary sign-out issue
  if (isLoaded && !isAuthenticated) {
    console.log('ProtectedRoute: User not authenticated, redirecting to', fallbackPath);
    return <Navigate to={fallbackPath} replace />;
  }

  console.log('ProtectedRoute: User authenticated, rendering content');
  // Render protected content if authenticated or still loading
  return <>{children}</>;
};

export default ProtectedRoute;
