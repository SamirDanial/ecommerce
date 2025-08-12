import React from 'react';
import { createPortal } from 'react-dom';
import { useAuthRedirect } from '../hooks/useAuthRedirect';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { X, Heart, Lock } from 'lucide-react';

interface LoginPopupProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

const LoginPopup: React.FC<LoginPopupProps> = ({ isOpen, onClose, message = "Sign in to save items to your wishlist" }) => {
  const { navigateToLogin, navigateToRegister } = useAuthRedirect();

  if (!isOpen) return null;

  const handleLogin = () => {
    onClose();
    navigateToLogin(message);
  };

  const handleSignup = () => {
    onClose();
    navigateToRegister(message);
  };

  // Use portal to render at document body level
  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center isolate"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        transform: 'none',
        transformOrigin: 'initial'
      }}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onClose();
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        onTouchStart={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }}
      />
      
      {/* Modal Content */}
      <div 
        className="relative w-full max-w-md mx-4 z-10"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        onTouchStart={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        style={{
          position: 'relative',
          zIndex: 10,
          transform: 'none',
          transformOrigin: 'initial'
        }}
      >
        <Card 
          className="shadow-2xl border-0 bg-background/95 backdrop-blur-sm"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          <CardHeader 
            className="text-center pb-6 relative"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            {/* Close button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-4 top-4 h-8 w-8 p-0 hover:bg-muted/50 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onClose();
              }}
            >
              <X className="h-4 w-4" />
            </Button>
            
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="h-8 w-8 text-primary" />
              </div>
            </div>
            
            <CardTitle className="text-2xl font-bold">Sign In Required</CardTitle>
            
            <p className="text-muted-foreground mt-2">
              {message}
            </p>
          </CardHeader>
          
          <CardContent 
            className="space-y-4 px-6 pb-6"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                Create an account or sign in to:
              </p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 justify-center">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span>Save items to your wishlist</span>
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span>Get notified about price drops</span>
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span>Track your favorite products</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <Button 
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleLogin();
                }}
                className="w-full"
                size="lg"
              >
                Sign In
              </Button>
              
              <Button 
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleSignup();
                }}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Create Account
              </Button>
            </div>

            <div className="text-center pt-2">
              <p className="text-xs text-muted-foreground">
                Don't worry, it only takes a few seconds!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>,
    document.body
  );
};

export default LoginPopup;
