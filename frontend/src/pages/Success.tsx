import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, ShoppingBag, Mail, Truck, Clock, ArrowRight, Star, Heart, Home, User } from 'lucide-react';
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
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (sessionId) {
      // Fetch order details from backend using session ID
      fetchOrderDetails(sessionId);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    if (orderDetails) {
      // Trigger confetti effect after order details load
      setTimeout(() => setShowConfetti(true), 500);
    }
  }, [orderDetails]);

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
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 animate-ping"></div>
          </div>
          <p className="mt-6 text-lg text-gray-600 font-medium">Processing your order...</p>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-8 text-lg">Unable to retrieve order details. Please contact support if you believe this is an error.</p>
          <div className="space-y-3">
            <Button onClick={handleContinueShopping} className="w-full" size="lg">
              <Home className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
            <Button variant="outline" onClick={() => navigate('/contact')} className="w-full" size="lg">
              Contact Support
            </Button>
          </div>
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8 px-4">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Hero Success Section */}
        <div className="text-center mb-12">
          <div className="relative">
            {/* Animated Success Icon */}
            <div className={`inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full mb-6 transition-all duration-1000 ${showConfetti ? 'scale-110 shadow-2xl' : 'scale-100'}`}>
              <CheckCircle className="w-20 h-20 text-white drop-shadow-lg" />
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 -right-8 w-4 h-4 bg-blue-400 rounded-full animate-pulse"></div>
          </div>
          
          <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Payment Successful! 🎉
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Thank you for your order! We've received your payment and will start processing your order right away.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Order Summary Card */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Package className="w-6 h-6" />
                  </div>
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Order ID */}
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 font-medium">Order ID:</span>
                    <span className="font-mono text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                      {orderDetails.id}
                    </span>
                  </div>
                  
                  {/* Status */}
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 font-medium">Status:</span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Confirmed
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 font-medium">Customer:</span>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{orderDetails.customer_details?.name || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{orderDetails.customer_details?.email || 'N/A'}</div>
                    </div>
                  </div>

                  {/* Total Amount */}
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-2 border-green-200">
                    <span className="text-gray-700 font-semibold text-lg">Total Amount:</span>
                    <span className="font-bold text-2xl text-green-600">
                      {formatCurrency(orderDetails.amount_total, orderDetails.currency)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            {orderDetails.line_items?.data && orderDetails.line_items.data.length > 0 && (
              <Card className="mt-6 border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                    Order Items
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {orderDetails.line_items.data.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{item.description}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                              Qty: {item.quantity}
                            </span>
                          </div>
                        </div>
                        <div className="font-bold text-lg text-gray-900">
                          {formatCurrency(item.amount_total, orderDetails.currency)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Next Steps Card */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Clock className="w-5 h-5" />
                  </div>
                  What's Next?
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-semibold text-blue-900">Order Confirmation</p>
                      <p className="text-sm text-blue-700">Confirmation email sent to your inbox</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-3 h-3 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-semibold text-green-900">Processing</p>
                      <p className="text-sm text-green-700">We'll start processing within 24 hours</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-semibold text-purple-900">Shipping</p>
                      <p className="text-sm text-purple-700">Tracking info sent once shipped</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Star className="w-5 h-5" />
                  </div>
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Button 
                    onClick={handleContinueShopping}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                    size="lg"
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Continue Shopping
                  </Button>
                  <Button 
                    onClick={handleViewOrders}
                    variant="outline"
                    className="w-full border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300"
                    size="lg"
                  >
                    <User className="w-4 h-4 mr-2" />
                    View My Orders
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Support Card */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Heart className="w-5 h-5" />
                  </div>
                  Need Help?
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-gray-600 text-sm mb-4">
                  Have questions about your order? We're here to help!
                </p>
                <div className="space-y-2">
                  <a 
                    href="mailto:support@example.com" 
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors text-sm"
                  >
                    <Mail className="w-4 h-4" />
                    support@example.com
                  </a>
                  <p className="text-xs text-gray-500">
                    Response within 2 hours
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom CTA Section */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
            <h2 className="text-2xl font-bold mb-4">Ready for More Amazing Products?</h2>
            <p className="text-blue-100 mb-6 text-lg">
              Discover our latest collections and exclusive offers
            </p>
            <Button 
              onClick={handleContinueShopping}
              className="bg-white text-blue-600 hover:bg-gray-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3 text-lg font-semibold"
              size="lg"
            >
              Start Shopping
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Success;
