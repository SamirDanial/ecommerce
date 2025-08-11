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

  return (
    <ClerkProviderBase
      publishableKey={publishableKey}
      signInUrl="/login"
      signUpUrl="/register"
      afterSignInUrl="/"
      afterSignUpUrl="/register/verify-email-address"
      afterSignOutUrl="/"
      // Configure Clerk to handle authentication flow properly
      // This should prevent the factor-one redirect issue
      appearance={{
        elements: {
          formButtonPrimary: 'bg-primary hover:bg-primary/90',
        }
      }}
    >
      {children}
    </ClerkProviderBase>
  );
};

export default ClerkProvider;
