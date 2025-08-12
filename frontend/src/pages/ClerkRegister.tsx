import React from 'react';
import { SignUp } from '@clerk/clerk-react';
import { useLocation } from 'react-router-dom';
import { useAuthRedirect } from '../hooks/useAuthRedirect';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { X } from 'lucide-react';

const ClerkRegister: React.FC = () => {
  const location = useLocation();
  const { navigateToReturnUrl } = useAuthRedirect();

  const handleClose = () => {
    navigateToReturnUrl();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur effect */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md mx-4">
        <Card className="shadow-2xl border-0 bg-background/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6 relative">
            {/* Close button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-4 top-4 h-8 w-8 p-0 hover:bg-muted/50 rounded-full"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>
            
            <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          </CardHeader>
          
          <CardContent className="px-6 pb-6">
            <SignUp 
              appearance={{
                elements: {
                  formButtonPrimary: 'bg-primary hover:bg-primary/90 text-primary-foreground',
                  card: 'shadow-none',
                  headerTitle: 'hidden',
                  headerSubtitle: 'hidden',
                  socialButtonsBlockButton: 'bg-secondary hover:bg-secondary/80 text-secondary-foreground',
                  formFieldInput: 'bg-background border border-input text-foreground',
                  formFieldLabel: 'text-foreground',
                  footerActionLink: 'text-primary hover:text-primary/80',
                  dividerLine: 'bg-border',
                  dividerText: 'text-muted-foreground'
                }
              }}
              routing="path"
              path="/register"
              signInUrl="/login"
              afterSignUpUrl={location.state?.returnTo || "/register/verify-email-address"}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClerkRegister;
