import React, { useState, useEffect } from 'react';
import { useSignIn, SignIn, useAuth } from '@clerk/clerk-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowLeft, X } from 'lucide-react';
import { toast } from 'sonner';

const ClerkLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const { signIn, isLoaded } = useSignIn();
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we're on the factor-one route (password step)
  const isFactorOne = location.pathname === '/login/factor-one';

  // If we're on factor-one, get email from Clerk's session
  useEffect(() => {
    if (isFactorOne) {
      // Get the email from Clerk's sign-in session
      if (signIn && signIn.identifier) {
        setEmail(signIn.identifier);
      }
    }
  }, [isFactorOne, signIn]);

  // Monitor OAuth authentication completion
  useEffect(() => {
    if (isSignedIn && !isFactorOne) {
      // User completed OAuth login, refresh page to update all components
      toast.success('Welcome back!');
      navigate('/');
      window.location.reload();
    }
  }, [isSignedIn, isFactorOne, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // On factor-one route, only password is required (email already provided by Clerk)
    if (isFactorOne) {
      if (!password) {
        setError('Please enter your password');
        return;
      }
    } else {
      // On normal login route, both email and password are required
      if (!email || !password) {
        setError('Please enter both email and password');
        return;
      }
    }

    if (!isLoaded) {
      setError('Authentication system is loading, please wait...');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Attempt to sign in
      const result = await signIn.create({
        identifier: email,
        password: password,
      });

      if (result.status === 'complete') {
        // Sign in successful
        toast.success('Welcome back!');
        
        // Navigate to home page and refresh to ensure all components update
        navigate('/');
        window.location.reload();
      } else if (result.status === 'needs_first_factor') {
        setError('Please check your email for verification before signing in');
      } else if (result.status === 'needs_second_factor') {
        setError('Two-factor authentication is required');
      } else {
        setError('Authentication failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      
      if (err.errors?.[0]?.code === 'form_identifier_not_found') {
        setError('No account found with this email address');
      } else if (err.errors?.[0]?.code === 'form_password_incorrect') {
        setError('Incorrect password');
      } else {
        setError(err.errors?.[0]?.message || 'An error occurred during sign in');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    navigate('/');
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
            
            {isFactorOne && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-4 top-4 h-8 w-8 p-0 hover:bg-muted/50 rounded-full"
                onClick={() => navigate('/login')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            
            <CardTitle className="text-2xl font-bold">
              {isFactorOne ? 'Enter Password' : 'Welcome Back'}
            </CardTitle>
            
            <p className="text-sm text-muted-foreground mt-2">
              {isFactorOne 
                ? 'Please enter your password to continue'
                : 'Sign in to your account to continue'
              }
            </p>
            
            {isFactorOne && email && (
              <div className="mt-4 p-3 bg-muted/50 rounded-lg border">
                <p className="text-xs text-muted-foreground mb-1">Signing in as:</p>
                <p className="text-sm font-medium text-foreground">{email}</p>
              </div>
            )}
          </CardHeader>
          
          <CardContent className="space-y-6 px-6 pb-6">
            {/* Show OAuth on normal login, email form on factor-one */}
            {!isFactorOne ? (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Sign in quickly with your social account
                  </p>
                </div>
                
                {/* Use Clerk's built-in SignIn component for OAuth */}
                <SignIn 
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
                  path="/login"
                  signUpUrl="/register"
                  afterSignInUrl="/"
                  initialValues={{
                    emailAddress: ''
                  }}
                />
              </div>
            ) : (
              /* Email/Password form for factor-one route */
              <div className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 h-11 transition-colors focus:ring-2 focus:ring-primary/20"
                        disabled={isLoading}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 font-medium transition-all hover:scale-[1.02]"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>
              </div>
            )}

            {/* Sign Up Link - Only show if not on factor-one */}
            {!isFactorOne && (
              <div className="text-center pt-4 border-t">
                <span className="text-muted-foreground text-sm">Don't have an account? </span>
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="text-primary hover:underline font-medium text-sm transition-colors"
                >
                  Sign up
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClerkLogin;
