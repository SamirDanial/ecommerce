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
  RefreshCw
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Tracking - {orderNumber}</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading tracking information...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!trackingData) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Tracking - {orderNumber}</DialogTitle>
          </DialogHeader>
          <div className="text-center py-12">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No tracking information available</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const currentStatusInfo = trackingService.getStatusInfo(trackingData.currentStatus);
  const progressPercentage = trackingService.calculateProgress(trackingData.currentStatus);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Order Tracking - {orderNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Status Overview */}
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-full ${currentStatusInfo.bgColor}`}>
                    {getStatusIcon(trackingData.currentStatus)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {trackingData.currentStatus}
                    </h3>
                    <p className="text-gray-600">{currentStatusInfo.description}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshTracking}
                  disabled={refreshing}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>

              <div className="flex justify-between text-sm text-gray-600">
                <span>Order Placed</span>
                <span>Delivered</span>
              </div>
            </CardContent>
          </Card>

          {/* Status Timeline */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Order Progress</h3>
              <div className="space-y-4">
                {['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map((status, index) => {
                  const isCompleted = getStatusStep(trackingData.currentStatus) > index + 1;
                  const isCurrent = trackingData.currentStatus === status;
                  const statusInfo = trackingService.getStatusInfo(status);
                  
                  return (
                    <div key={status} className="flex items-start gap-4">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        isCompleted 
                          ? 'bg-green-100 text-green-600' 
                          : isCurrent 
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-gray-100 text-gray-400'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <span className="text-sm font-medium">{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-medium ${
                            isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-500'
                          }`}>
                            {status}
                          </h4>
                          {isCurrent && (
                            <Badge variant="secondary" className="text-xs">
                              Current
                            </Badge>
                          )}
                        </div>
                        <p className={`text-sm ${
                          isCompleted || isCurrent ? 'text-gray-700' : 'text-gray-400'
                        }`}>
                          {statusInfo.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Estimated: {statusInfo.estimatedTime}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Status History */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Status History</h3>
              <div className="space-y-3">
                {trackingData.statusHistory.map((entry: any, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-600">{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{entry.status}</Badge>
                        <span className="text-sm text-gray-500">
                          {trackingService.formatDate(entry.timestamp)}
                        </span>
                      </div>
                      {entry.notes && (
                        <p className="text-sm text-gray-700">{entry.notes}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        Updated by: {entry.updatedBy}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Order Details</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Order Date</p>
                  <p className="font-medium">
                    {trackingService.formatDate(trackingData.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="font-medium">
                    {trackingService.formatDate(trackingData.lastStatusUpdate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Estimated Delivery</p>
                  <p className="font-medium">
                    {trackingData.estimatedDelivery 
                      ? trackingService.formatDate(trackingData.estimatedDelivery)
                      : 'TBD'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tracking Number</p>
                  <p className="font-medium font-mono text-sm">
                    {trackingData.trackingNumber || 'Not available'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
            <Button onClick={refreshTracking} disabled={refreshing} className="flex-1">
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh Status
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderTrackingModal;

