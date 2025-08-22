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
  Calendar,
  User,
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



  const getStatusStep = (status: string) => {
    const statusFlow = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    return statusFlow.indexOf(status) + 1;
  };

  if (!trackingData && loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="mb-4 sm:mb-6 text-center">
            <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center justify-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                <RefreshCw className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 animate-spin" />
              </div>
              Loading Your Order Journey
            </DialogTitle>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">Gathering the latest tracking information...</p>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  if (!trackingData) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="mb-4 sm:mb-6 text-center">
            <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center justify-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-gray-100 rounded-lg">
                <Package className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
              </div>
              No Tracking Information
            </DialogTitle>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">We're working on getting your tracking details ready</p>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  const currentStatusInfo = trackingService.getStatusInfo(trackingData.currentStatus);
  const progressPercentage = trackingService.calculateProgress(trackingData.currentStatus);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        {/* Header */}
        <DialogHeader className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                <Truck className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              Order Tracking
              <span className="text-sm sm:text-base font-normal text-gray-500">#{orderNumber}</span>
            </DialogTitle>
            
            {/* Refresh Button - Hidden on mobile, shown on desktop */}
            <div className="hidden sm:block">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshTracking}
                disabled={refreshing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4 sm:space-y-6">
          {/* Current Status Overview */}
          <div className="border border-gray-200 rounded-lg p-3 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              </div>
              Current Status
            </h3>
            
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6 mb-4 sm:mb-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className={`p-3 sm:p-4 rounded-xl ${currentStatusInfo.bgColor} shadow-sm`}>
                  <div className={`text-2xl sm:text-3xl ${currentStatusInfo.color}`}>
                    {currentStatusInfo.icon}
                  </div>
                </div>
                <div>
                  <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">
                    {trackingData.currentStatus}
                  </h4>
                  <p className="text-gray-600 text-sm sm:text-base">{currentStatusInfo.description}</p>
                  {currentStatusInfo.estimatedTime && (
                    <div className="flex items-center gap-2 mt-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm text-gray-500">
                        Estimated: {currentStatusInfo.estimatedTime}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-blue-600">{progressPercentage}%</div>
                <div className="text-sm text-gray-500">Complete</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative">
              <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4 mb-3 sm:mb-4 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 sm:h-4 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="flex justify-between text-xs sm:text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                  Order Placed
                </span>
                <span className="flex items-center gap-1">
                  <Truck className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                  In Transit
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                  Delivered
                </span>
              </div>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="border border-gray-200 rounded-lg p-3 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                <Package className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </div>
              Order Journey
            </h3>
            
            <div className="space-y-3 sm:space-y-4">
              {trackingData.statusHistory?.map((event: any, index: number) => (
                <div key={index} className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="font-medium text-gray-900 text-sm sm:text-base">{event.status}</h5>
                      <span className="text-xs sm:text-sm text-gray-500">
                        {new Date(event.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    {event.notes && (
                      <p className="text-sm text-gray-600">{event.notes}</p>
                    )}
                    {event.updatedBy && event.updatedBy !== 'system' && (
                      <p className="text-xs text-gray-500 mt-1">👤 Updated by: {event.updatedBy}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tracking Details */}
          {trackingData.trackingNumber && (
            <div className="border border-gray-200 rounded-lg p-3 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="p-1.5 sm:p-2 bg-indigo-100 rounded-lg">
                  <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
                </div>
                Tracking Information
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-500 mb-1">Tracking Number</div>
                  <div className="font-mono font-medium text-gray-900">{trackingData.trackingNumber}</div>
                </div>
                
                {trackingData.carrier && (
                  <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-sm text-gray-500 mb-1">Carrier</div>
                    <div className="font-medium text-gray-900">{trackingData.carrier}</div>
                  </div>
                )}
                
                {trackingData.estimatedDelivery && (
                  <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-sm text-gray-500 mb-1">Estimated Delivery</div>
                    <div className="font-medium text-gray-900">
                      {new Date(trackingData.estimatedDelivery).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                )}
                
                {trackingData.currentLocation && (
                  <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-sm text-gray-500 mb-1">Current Location</div>
                    <div className="font-medium text-gray-900">{trackingData.currentLocation}</div>
                  </div>
                )}
              </div>
            </div>
          )}

                     {/* Action Buttons */}
           <div className="flex gap-3 pt-4 border-t border-gray-200">
             <Button 
               variant="outline" 
               onClick={onClose}
               className="flex-1"
             >
               Close
             </Button>
             
             {/* Refresh Button - Always visible at bottom */}
             <Button 
               onClick={refreshTracking}
               disabled={refreshing}
               className="flex-1"
             >
               <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
               Refresh Tracking
             </Button>
           </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderTrackingModal;

