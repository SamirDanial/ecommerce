import React from 'react';
import { ClerkProvider as ClerkProviderBase } from '@clerk/clerk-react';

interface ClerkProviderProps {
  children: React.ReactNode;
}

const ClerkProvider: React.FC<ClerkProviderProps> = ({ children }) => {
  const publishableKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    throw new Error('Missing Clerk Publishable Key. Please check your .env file.');
  }

  // Dynamic redirect function that respects the current page
  const getDynamicRedirectUrl = () => {
    // If we're in the browser, try to get the current path
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      // Don't redirect to login/register pages
      if (currentPath !== '/login' && currentPath !== '/register') {
        return currentPath;
      }
    }
    // Fallback to home page
    return '/';
  };

  return (
    <ClerkProviderBase
      publishableKey={publishableKey}
      signInUrl="/login"
      signUpUrl="/register"
      afterSignInUrl={getDynamicRedirectUrl()}
      afterSignUpUrl="/register/verify-email-address"
      afterSignOutUrl={getDynamicRedirectUrl()}
      // Configure Clerk to handle authentication flow properly
      // This should prevent the factor-one redirect issue
      appearance={{
        elements: {
          formButtonPrimary: 'bg-primary hover:bg-primary/90',
        }
      }}
      // Override Clerk's default redirect behavior
      redirectUrl={getDynamicRedirectUrl()}
    >
      {children}
    </ClerkProviderBase>
  );
};

export default ClerkProvider;
