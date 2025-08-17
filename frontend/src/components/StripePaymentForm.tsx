import React, { useState } from 'react';
import { CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { CreditCard, Lock, AlertCircle, CheckCircle, Calendar, Shield, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { useClerkAuth } from '../hooks/useClerkAuth';

interface StripePaymentFormProps {
  amount: number;
  currency: string;
  customerName?: string;
  shippingAddress?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  orderDetails?: {
    items?: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
    discount?: {
      code: string;
      amount: number;
      type: string;
      value: number;
      calculatedAmount?: number;
    } | null;
    subtotal: number;
    total: number;
    shippingMethod?: string;
    shippingCost?: number;
    tax?: number; // Add tax field for UI values
  };
  onPaymentSuccess: (paymentIntent: any) => void;
  onPaymentError: (error: string) => void;
  isLoading?: boolean;
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  amount,
  currency,
  customerName,
  shippingAddress,
  orderDetails,
  onPaymentSuccess,
  onPaymentError,
  isLoading = false
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { getToken } = useClerkAuth();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [succeeded] = useState(false);

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px', // Prevents zoom on iOS
        color: '#374151',
        '::placeholder': {
          color: '#9CA3AF',
        },
        border: '1px solid #D1D5DB',
        borderRadius: '8px',
        padding: '12px 16px',
        backgroundColor: '#FFFFFF',
        lineHeight: '1.5',
        '&:focus': {
          borderColor: '#3B82F6',
          boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
          outline: 'none',
        },
      },
      invalid: {
        color: '#EF4444',
        borderColor: '#EF4444',
      },
    },
    hidePostalCode: true, // We handle postal code separately
  };

  const handleCardChange = (event: any) => {
    if (event.error) {
      setError(event.error.message);
    } else {
      setError(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setError(null);
    setProcessing(true);

    try {
      // Get authentication token
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      // Create payment intent on the backend
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/stripe/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: Math.round(amount), // Amount should already be in cents
          currency: currency, // Currency is already in correct format (e.g., 'usd')
          orderDetails: orderDetails || {},
          customerName: customerName || 'Customer',
          shippingAddress: shippingAddress || {}
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Payment intent creation failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const { client_secret } = await response.json();
      
      console.log('Payment intent response:', { client_secret: client_secret ? 'present' : 'missing' });

      // Confirm card payment with Stripe using individual card elements
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: elements.getElement(CardNumberElement)!,
        },
      });
      
      console.log('Stripe confirmCardPayment result:', { 
        error: stripeError ? stripeError.message : 'none',
        paymentIntent: paymentIntent ? { 
          id: paymentIntent.id, 
          status: paymentIntent.status 
        } : 'none' 
      });

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
        onPaymentError(stripeError.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        toast.success('Payment successful!');
        onPaymentSuccess(paymentIntent);
      } else if (paymentIntent && paymentIntent.status === 'requires_action') {
        // Handle 3D Secure or other authentication requirements
        setError('Additional authentication required. Please complete the payment.');
        onPaymentError('Additional authentication required. Please complete the payment.');
      } else {
        setError('Payment failed. Please try again.');
        onPaymentError('Payment failed. Please try again.');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Payment failed. Please try again.';
      setError(errorMessage);
      onPaymentError(errorMessage);
    } finally {
      setProcessing(false);
    }
  };



  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Credit/Debit Card Details
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Secure payment powered by Stripe
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card Details - Mobile Optimized */}
          <div className="space-y-4">
            <label className="text-sm font-medium text-gray-700">Card Details *</label>
            
            {/* Card Number */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600 flex items-center gap-2">
                <CreditCard className="h-3 w-3" />
                Card Number
              </label>
              <div className="relative">
                <CardNumberElement
                  options={cardElementOptions}
                  onChange={handleCardChange}
                  className="min-h-[48px] w-full"
                />
              </div>
            </div>

            {/* Expiry and CVC Row - Mobile Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600 flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  Expiry Date
                </label>
                <CardExpiryElement
                  options={cardElementOptions}
                  onChange={handleCardChange}
                  className="min-h-[48px] w-full"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600 flex items-center gap-2">
                  <Shield className="h-3 w-3" />
                  CVC
                </label>
                <CardCvcElement
                  options={cardElementOptions}
                  onChange={handleCardChange}
                  className="min-h-[48px] w-full"
                />
              </div>
            </div>

            {/* Postal Code */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600 flex items-center gap-2">
                <MapPin className="h-3 w-3" />
                Postal Code
              </label>
              <input
                type="text"
                placeholder="12345"
                maxLength={5}
                pattern="[0-9]*"
                inputMode="numeric"
                className="w-full min-h-[48px] px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors text-base"
                onChange={(e) => {
                  // Only allow numbers
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  e.target.value = value;
                }}
                onKeyPress={(e) => {
                  // Prevent non-numeric input
                  if (!/[0-9]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {error}
              </p>
            )}
          </div>

          {/* Security Notice */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800">
              <Lock className="h-4 w-4" />
              <span className="font-medium">Secure Payment</span>
            </div>
            <p className="text-blue-700 text-sm mt-1">
              Your payment information is encrypted and secure. We never store your card details.
            </p>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={!stripe || processing || isLoading || succeeded}
          >
            {processing ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processing Payment...
              </div>
            ) : succeeded ? (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Payment Successful!
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Pay {currency}${(amount / 100).toFixed(1).replace(/\.0$/, '')}
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default StripePaymentForm;
