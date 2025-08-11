import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { X, Heart, Lock } from 'lucide-react';

interface LoginPopupProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

const LoginPopup: React.FC<LoginPopupProps> = ({ isOpen, onClose, message = "Sign in to save items to your wishlist" }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogin = () => {
    onClose();
    navigate('/login');
  };

  const handleSignup = () => {
    onClose();
    navigate('/register');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
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
              onClick={onClose}
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
          
          <CardContent className="space-y-4 px-6 pb-6">
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
                onClick={handleLogin}
                className="w-full"
                size="lg"
              >
                Sign In
              </Button>
              
              <Button 
                onClick={handleSignup}
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
    </div>
  );
};

export default LoginPopup;
