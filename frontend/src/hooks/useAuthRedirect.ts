import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Custom hook to manage authentication redirects globally
 * This prevents Clerk from redirecting users to home page when they reject sign-in
 */
export const useAuthRedirect = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPathRef = useRef<string>('');

  // Store the current path when the component mounts or location changes
  useEffect(() => {
    currentPathRef.current = location.pathname;
  }, [location.pathname]);

  /**
   * Get the current path for redirect purposes
   * This ensures users stay on the page they were on
   */
  const getCurrentPath = () => {
    return currentPathRef.current || location.pathname;
  };

  /**
   * Navigate to login with return URL
   */
  const navigateToLogin = (message?: string) => {
    const returnTo = getCurrentPath();
    navigate('/login', {
      state: {
        returnTo,
        message: message || 'Please sign in to continue'
      }
    });
  };

  /**
   * Navigate to register with return URL
   */
  const navigateToRegister = (message?: string) => {
    const returnTo = getCurrentPath();
    navigate('/register', {
      state: {
        returnTo,
        message: message || 'Please create an account to continue'
      }
    });
  };

  /**
   * Get the return URL from location state
   */
  const getReturnUrl = () => {
    return location.state?.returnTo || '/';
  };

  /**
   * Navigate back to the return URL or default to home
   */
  const navigateToReturnUrl = () => {
    const returnTo = getReturnUrl();
    navigate(returnTo);
  };

  return {
    getCurrentPath,
    navigateToLogin,
    navigateToRegister,
    getReturnUrl,
    navigateToReturnUrl,
    currentPath: currentPathRef.current
  };
};
