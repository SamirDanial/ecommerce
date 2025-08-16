import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  RefreshCw,
  MapPin,
  Calendar,
  User,
  Phone,
  Mail,
  ArrowRight,
  Star,
  Zap
} from 'lucide-react';
import { useClerkAuth } from '../hooks/useClerkAuth';
import { trackingService } from '../services/trackingService';
import { toast } from 'sonner';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number;
  orderNumber: string;
}

const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  orderId,
  orderNumber
}) => {
  const { getToken } = useClerkAuth();
  const [trackingData, setTrackingData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTrackingData = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const data = await trackingService.getOrderTracking(orderId, token);
      setTrackingData(data);
    } catch (error) {
      console.error('Error fetching tracking data:', error);
      toast.error('Failed to load tracking information');
    } finally {
      setLoading(false);
    }
  }, [getToken, orderId]);

  // Fetch tracking data when modal opens
  useEffect(() => {
    if (isOpen && orderId) {
      fetchTrackingData();
    }
  }, [isOpen, orderId, fetchTrackingData]);

  const refreshTracking = async () => {
    try {
      setRefreshing(true);
      await fetchTrackingData();
      toast.success('Tracking information updated');
    } catch (error) {
      toast.error('Failed to refresh tracking');
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-5 w-5" />;
      case 'CONFIRMED': return <CheckCircle className="h-5 w-5" />;
      case 'PROCESSING': return <Package className="h-5 w-5" />;
      case 'SHIPPED': return <Truck className="h-5 w-5" />;
      case 'DELIVERED': return <CheckCircle className="h-5 w-5" />;
      default: return <Clock className="h-5 w-5" />;
    }
  };

  const getStatusStep = (status: string) => {
    const statusFlow = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    return statusFlow.indexOf(status) + 1;
  };

  if (!trackingData && loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-white to-blue-50">
          <DialogHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <RefreshCw className="h-8 w-8 text-white animate-spin" />
            </div>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Loading Your Order Journey
            </DialogTitle>
            <p className="text-gray-600 mt-2">Gathering the latest tracking information...</p>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  if (!trackingData) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-white to-blue-50">
          <DialogHeader className="text-center pb-6">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mb-4">
              <Package className="h-10 w-10 text-gray-500" />
            </div>
            <DialogTitle className="text-2xl font-bold text-gray-800">
              No Tracking Information
            </DialogTitle>
            <p className="text-gray-600 mt-2">We're working on getting your tracking details ready</p>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  const currentStatusInfo = trackingService.getStatusInfo(trackingData.currentStatus);
  const progressPercentage = trackingService.calculateProgress(trackingData.currentStatus);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-white to-blue-50 p-0">
        <DialogHeader className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Truck className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-white">
                  Order Tracking
                </DialogTitle>
                <p className="text-blue-100 text-sm">#{orderNumber}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshTracking}
              disabled={refreshing}
              className="text-white hover:bg-white/20 border-white/20"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Enhanced Current Status Overview */}
          <Card className="border-0 shadow-xl bg-gradient-to-r from-white to-blue-50 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
            <CardContent className="relative p-8">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-6">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-2xl ${currentStatusInfo.bgColor} shadow-lg`}>
                    <div className={`text-3xl ${currentStatusInfo.color}`}>
                      {currentStatusInfo.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {trackingData.currentStatus}
                    </h3>
                    <p className="text-gray-600 text-lg">{currentStatusInfo.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm text-gray-500">
                        Estimated: {currentStatusInfo.estimatedTime}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{progressPercentage}%</div>
                    <div className="text-sm text-gray-500">Complete</div>
                  </div>
                </div>
              </div>

              {/* Enhanced Progress Bar */}
              <div className="relative">
                <div className="w-full bg-gray-200 rounded-full h-4 mb-4 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all duration-1000 ease-out shadow-lg"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Order Placed
                  </span>
                  <span className="flex items-center gap-1">
                    <Truck className="h-4 w-4 text-blue-500" />
                    In Transit
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Delivered
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Status Timeline */}
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Order Journey</h3>
              </div>
              
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-purple-200 to-green-200"></div>
                
                <div className="space-y-6">
                  {['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map((status, index) => {
                    const isCompleted = getStatusStep(trackingData.currentStatus) > index + 1;
                    const isCurrent = trackingData.currentStatus === status;
                    const statusInfo = trackingService.getStatusInfo(status);
                    
                    return (
                      <div key={status} className="relative flex items-start gap-6 group">
                        {/* Timeline Dot */}
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isCompleted 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg scale-110' 
                            : isCurrent 
                              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-110 animate-pulse'
                              : 'bg-gray-200 text-gray-400 group-hover:bg-gray-300 transition-colors'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            <span className="text-sm font-medium">{index + 1}</span>
                          )}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0 pt-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className={`text-lg font-semibold transition-colors ${
                              isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-500'
                            }`}>
                              {status}
                            </h4>
                            {isCurrent && (
                              <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 px-3 py-1">
                                Current Status
                              </Badge>
                            )}
                            {isCompleted && (
                              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 px-3 py-1">
                                Completed
                              </Badge>
                            )}
                          </div>
                          <p className={`text-base transition-colors ${
                            isCompleted || isCurrent ? 'text-gray-700' : 'text-gray-400'
                          }`}>
                            {statusInfo.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-500">
                              Estimated: {statusInfo.estimatedTime}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Status History */}
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Status Updates</h3>
              </div>
              
              <div className="space-y-4">
                {trackingData.statusHistory.map((entry: any, index: number) => (
                  <div key={index} className="group p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-md">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className="bg-white text-blue-600 border-blue-200 px-3 py-1 font-medium">
                            {entry.status}
                          </Badge>
                          <div className="flex items-center gap-1 text-gray-500">
                            <Calendar className="h-4 w-4" />
                            <span className="text-sm">
                              {trackingService.formatDate(entry.timestamp)}
                            </span>
                          </div>
                        </div>
                        {entry.notes && (
                          <p className="text-gray-700 mb-2">{entry.notes}</p>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <User className="h-4 w-4" />
                          <span>Updated by: {entry.updatedBy}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Order Details */}
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Order Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">Order Date</span>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {trackingService.formatDate(trackingData.createdAt)}
                  </p>
                </div>
                
                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-700">Last Updated</span>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {trackingService.formatDate(trackingData.lastStatusUpdate)}
                  </p>
                </div>
                
                <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700">Estimated Delivery</span>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {trackingData.estimatedDelivery 
                      ? trackingService.formatDate(trackingData.estimatedDelivery)
                      : 'TBD'
                    }
                  </p>
                </div>
                
                <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="h-5 w-5 text-orange-600" />
                    <span className="text-sm font-medium text-orange-700">Tracking Number</span>
                  </div>
                  <p className="font-semibold text-gray-900 font-mono text-sm">
                    {trackingData.trackingNumber || 'Not available'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="flex-1 h-12 text-base font-medium border-2 hover:border-gray-400 transition-colors"
            >
              Close
            </Button>
            <Button 
              onClick={refreshTracking} 
              disabled={refreshing} 
              className="flex-1 h-12 text-base font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <RefreshCw className={`h-5 w-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh Status
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderTrackingModal;

