import React, { useState, useEffect } from 'react';
import { useSignUp, useUser } from '@clerk/clerk-react';
import { useAuthRedirect } from '../hooks/useAuthRedirect';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Loader2, Mail, CheckCircle, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const VerifyEmail: React.FC = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [hasAutoSent, setHasAutoSent] = useState(false);
  const { navigateToRegister, navigateToLogin, navigateToReturnUrl } = useAuthRedirect();
  const { signUp, isLoaded: signUpLoaded } = useSignUp();
  const { user, isLoaded: userLoaded } = useUser();

  useEffect(() => {
    // Start countdown timer for resend
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // Auto-send verification code when page loads
  useEffect(() => {
    const autoSendVerification = async () => {
      // Wait for Clerk to load
      if (!signUpLoaded || !userLoaded) return;

      // If we have an active signup session, send code automatically
      if (signUp && signUp.emailAddress && !hasAutoSent) {
        try {
          console.log('Auto-sending verification code...');
          await signUp.prepareEmailAddressVerification();
          setHasAutoSent(true);
          setTimeLeft(60); // Start 60 second cooldown
          toast.success('Verification code sent! Check your email.');
        } catch (error: any) {
          console.error('Auto-send verification error:', error);
          if (error.errors?.[0]?.code === 'form_identifier_not_found') {
            toast.error('Verification session expired. Please return to sign up.');
            navigateToRegister('Verification session expired. Please return to sign up.');
          } else {
            toast.error('Failed to send verification code automatically.');
          }
        }
      }
    };

    // Add a small delay to ensure Clerk has fully loaded
    const timer = setTimeout(autoSendVerification, 1000);
    return () => clearTimeout(timer);
  }, [signUpLoaded, userLoaded, signUp, hasAutoSent, navigateToRegister]);

  // If not loaded yet, show loading
  if (!signUpLoaded || !userLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <CardContent className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Loading verification...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user is already signed in and email is verified, redirect to home
  if (user && user.emailAddresses?.[0]?.verification?.status === 'verified') {
    navigateToReturnUrl();
    return null;
  }

  // If we have an active signup session, show verification form
  if (signUp && signUp.emailAddress) {
    const email = signUp.emailAddress;
    
    const handleVerification = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!verificationCode.trim()) {
        toast.error('Please enter the verification code');
        return;
      }

      setIsVerifying(true);
      
      try {
        const result = await signUp.attemptEmailAddressVerification({
          code: verificationCode,
        });
        
        if (result.status === 'complete') {
          toast.success('Email verified successfully!');
          setTimeout(() => navigateToReturnUrl(), 1500);
        } else {
          toast.error('Verification incomplete. Please try again.');
        }
        
      } catch (error: any) {
        console.error('Verification error:', error);
        
        if (error.errors?.[0]?.code === 'verification_expired') {
          toast.error('Verification code has expired. Please request a new one.');
        } else if (error.errors?.[0]?.code === 'verification_failed') {
          toast.error('Invalid verification code. Please try again.');
        } else if (error.errors?.[0]?.code === 'form_identifier_not_found') {
          toast.error('Verification session expired. Please start over.');
          navigateToRegister('Verification session expired. Please start over.');
        } else {
          toast.error('Verification failed. Please try again.');
        }
      } finally {
        setIsVerifying(false);
      }
    };

    const handleResendCode = async () => {
      if (timeLeft > 0) return;
      
      setIsResending(true);
      
      try {
        await signUp.prepareEmailAddressVerification();
        toast.success('Verification code sent! Check your email.');
        setTimeLeft(60); // 60 second cooldown
        
      } catch (error: any) {
        console.error('Resend error:', error);
        
        if (error.errors?.[0]?.code === 'form_identifier_not_found') {
          toast.error('Session expired. Please return to sign up.');
          navigateToRegister('Session expired. Please return to sign up.');
        } else {
          toast.error('Failed to send verification code. Please try again.');
        }
      } finally {
        setIsResending(false);
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
              <p className="text-muted-foreground">
                We've sent a verification code to
              </p>
              <div className="flex items-center justify-center space-x-2">
                <Label className="font-mono text-sm">{email}</Label>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleVerification} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verificationCode" className="text-sm font-medium">
                  Verification Code
                </Label>
                <Input
                  id="verificationCode"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="text-center text-lg font-mono tracking-widest"
                  maxLength={6}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isVerifying || !verificationCode.trim()}
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Verify Email
                  </>
                )}
              </Button>
            </form>

            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Didn't receive the code?
                </p>
                <Button
                  variant="outline"
                  onClick={handleResendCode}
                  disabled={isResending || timeLeft > 0}
                  className="w-full"
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : timeLeft > 0 ? (
                    `Resend in ${timeLeft}s`
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Resend Code
                    </>
                  )}
                </Button>
              </div>

              <div className="text-center">
                <Button
                  variant="ghost"
                  onClick={() => navigateToRegister('Return to sign up')}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sign Up
                </Button>
              </div>
            </div>

            {/* Help section */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="text-sm text-muted-foreground space-y-1">
                  <p className="font-medium">Need help?</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Check your spam/junk folder</li>
                    <li>• Make sure the email address is correct</li>
                    <li>• Wait a few minutes for the email to arrive</li>
                    <li>• Return to sign up if verification fails</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If no active signup session, show options to continue
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold">Email Verification</CardTitle>
            <p className="text-muted-foreground">
              Complete your email verification to continue
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Button
              onClick={() => navigateToRegister('Continue with sign up')}
              className="w-full"
            >
              <Mail className="w-4 h-4 mr-2" />
              Continue with Sign Up
            </Button>

            <Button
              variant="outline"
              onClick={() => navigateToLogin('Return to sign in')}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sign In
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              If you're having trouble with verification, please return to the sign up page to continue the process.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmail;
