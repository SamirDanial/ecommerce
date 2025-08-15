import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Package } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import api from '../lib/axios';

interface OrderDetails {
  id: string;
  amount_total: number;
  currency: string;
  customer_details: {
    name: string;
    email: string;
  };
  line_items: {
    data: Array<{
      description: string;
      quantity: number;
      amount_total: number;
    }>;
  };
  metadata: {
    userEmail: string;
    userId: string;
    customerId: string;
  };
}

const Success: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (sessionId) {
      // Fetch order details from backend using session ID
      fetchOrderDetails(sessionId);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const fetchOrderDetails = async (sessionId: string) => {
    try {
      const response = await api.get(`/api/stripe/session/${sessionId}`);
      setOrderDetails(response.data);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueShopping = () => {
    navigate('/');
  };

  const handleViewOrders = () => {
    navigate('/profile');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-6">Unable to retrieve order details.</p>
          <Button onClick={handleContinueShopping}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-lg text-gray-600">
            Thank you for your order. We've received your payment and will process your order shortly.
          </p>
        </div>

        {/* Order Confirmation Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Order Confirmation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Order ID:</span>
              <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                {orderDetails.id}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Status:</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Confirmed
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Customer:</span>
              <span className="text-right">
                <div className="font-medium">{orderDetails.customer_details?.name || 'N/A'}</div>
                <div className="text-sm text-gray-500">{orderDetails.customer_details?.email || 'N/A'}</div>
              </span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-semibold text-lg">
                {formatCurrency(orderDetails.amount_total, orderDetails.currency)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        {orderDetails.line_items?.data && orderDetails.line_items.data.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {orderDetails.line_items.data.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                    <div>
                      <div className="font-medium">{item.description}</div>
                      <div className="text-sm text-gray-500">Qty: {item.quantity}</div>
                    </div>
                    <div className="font-semibold">
                      {formatCurrency(item.amount_total, orderDetails.currency)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>What's Next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium">Order Confirmation Email</p>
                <p className="text-sm text-gray-600">You'll receive a confirmation email with your order details.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium">Order Processing</p>
                <p className="text-sm text-gray-600">We'll start processing your order within 24 hours.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium">Shipping Updates</p>
                <p className="text-sm text-gray-600">You'll receive tracking information once your order ships.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={handleContinueShopping}
            className="flex-1 bg-green-600 hover:bg-green-700"
            size="lg"
          >
            Continue Shopping
          </Button>
          <Button 
            onClick={handleViewOrders}
            variant="outline"
            className="flex-1"
            size="lg"
          >
            View My Orders
          </Button>
        </div>

        {/* Support Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Have questions about your order?</p>
          <p className="mt-1">
            Contact us at{' '}
            <a href="mailto:support@example.com" className="text-blue-600 hover:underline">
              support@example.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Success;
