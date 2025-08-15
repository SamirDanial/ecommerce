import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, ShoppingCart, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

const Cancel: React.FC = () => {
  const navigate = useNavigate();

  const handleBackToCheckout = () => {
    navigate('/checkout');
  };

  const handleContinueShopping = () => {
    navigate('/');
  };

  const handleViewCart = () => {
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Cancel Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Cancelled
          </h1>
          <p className="text-lg text-gray-600">
            Your payment was cancelled. Don't worry, you haven't been charged.
          </p>
        </div>

        {/* Information Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              What Happened?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium">Payment Not Processed</p>
                <p className="text-sm text-gray-600">Your payment was cancelled before completion. No charges were made to your account.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium">Items Still in Cart</p>
                <p className="text-sm text-gray-600">Your items are still in your shopping cart and ready for checkout.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium">Try Again Anytime</p>
                <p className="text-sm text-gray-600">You can complete your purchase at any time by returning to checkout.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Common Reasons Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Common Reasons for Cancellation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium">Changed Your Mind</p>
                <p className="text-sm text-gray-600">You decided not to complete the purchase.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium">Technical Issues</p>
                <p className="text-sm text-gray-600">Browser or network problems during checkout.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium">Payment Method Issues</p>
                <p className="text-sm text-gray-600">Problems with your card or payment method.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Button 
            onClick={handleBackToCheckout}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Checkout
          </Button>
          <Button 
            onClick={handleViewCart}
            variant="outline"
            className="flex-1"
            size="lg"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            View Cart
          </Button>
        </div>

        <div className="text-center">
          <Button 
            onClick={handleContinueShopping}
            variant="ghost"
            size="lg"
            className="text-gray-600 hover:text-gray-800"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Continue Shopping
          </Button>
        </div>

        {/* Support Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Need help with your order?</p>
          <p className="mt-1">
            Contact us at{' '}
            <a href="mailto:support@example.com" className="text-blue-600 hover:underline">
              support@example.com
            </a>
            {' '}or call{' '}
            <a href="tel:+1234567890" className="text-blue-600 hover:underline">
              +1 (234) 567-890
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Cancel;
