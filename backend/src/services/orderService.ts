import { PrismaClient } from '@prisma/client';
import { deductStockForOrder, StockDeductionItem } from './stockService';

const prisma = new PrismaClient();

export interface CreateOrderData {
  userId: number;
  orderNumber: string;
  subtotal: number;
  tax: number;
  shipping: number;
  shippingMethod?: string; // Add shipping method field
  discount: number;
  total: number;
  currency: 'USD' | 'EUR' | 'PKR';
  language: 'ENGLISH' | 'URDU' | 'ARABIC';
  
  // Order-specific address fields (preserved from checkout)
  shippingFirstName?: string;
  shippingLastName?: string;
  shippingCompany?: string;
  shippingAddress1?: string;
  shippingAddress2?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingPostalCode?: string;
  shippingCountry?: string;
  shippingPhone?: string;
  
  // Legacy address references (for backward compatibility)
  billingAddressId?: number;
  
  paymentMethodId?: number;
  trackingNumber?: string;
  notes?: string;
  items: Array<{
    productId: number;
    variantId?: number;
    productName: string;
    productSku?: string;
    size?: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL';
    color?: string;
    quantity: number;
    price: number;
    total: number;
    costPrice?: number; // Cost at time of sale for accurate profit calculation
  }>;
  paymentData: {
    amount: number;
    currency: 'USD' | 'EUR' | 'PKR';
    transactionId: string;
    gatewayResponse?: string;
    method: 'CREDIT_CARD' | 'DEBIT_CARD' | 'PAYPAL' | 'APPLE_PAY' | 'GOOGLE_PAY' | 'BANK_TRANSFER' | 'CRYPTO';
  };
}

export const createOrderFromPayment = async (orderData: CreateOrderData) => {
  try {
    console.log('🛒 Creating order:', orderData.orderNumber);
    
    // Calculate total items
    const totalItems = orderData.items.reduce((sum, item) => sum + item.quantity, 0);
    
    // Create the order
    let order;
    try {
      order = await prisma.order.create({
        data: {
          orderNumber: orderData.orderNumber,
          userId: orderData.userId,
          orderStatus: 'APPROVED',
          deliveryStatus: 'CONFIRMED',
          statusHistory: [{
            status: 'CONFIRMED',
            timestamp: new Date(),
            notes: 'Order confirmed after successful payment',
            updatedBy: 'system'
          }],
          lastStatusUpdate: new Date(),
          estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 days
          subtotal: orderData.subtotal,
          tax: orderData.tax,
          shipping: orderData.shipping,
          shippingMethod: orderData.shippingMethod, // Add shipping method
          discount: orderData.discount,
          total: orderData.total,
          totalItems: totalItems, // Store calculated total items
          currency: orderData.currency,
          language: orderData.language,
          
          // Order-specific address fields
          shippingFirstName: orderData.shippingFirstName,
          shippingLastName: orderData.shippingLastName,
          shippingCompany: orderData.shippingCompany,
          shippingAddress1: orderData.shippingAddress1,
          shippingAddress2: orderData.shippingAddress2,
          shippingCity: orderData.shippingCity,
          shippingState: orderData.shippingState,
          shippingPostalCode: orderData.shippingPostalCode,
          shippingCountry: orderData.shippingCountry,
          shippingPhone: orderData.shippingPhone,
          
          // Legacy address references
          billingAddressId: orderData.billingAddressId,
          
          paymentMethodId: orderData.paymentMethodId,
          paymentStatus: 'PAID',
          trackingNumber: orderData.trackingNumber,
          notes: orderData.notes,
          items: {
            create: orderData.items.map(item => ({
              productId: item.productId,
              variantId: item.variantId,
              productName: item.productName,
              productSku: item.productSku,
              size: item.size,
              color: item.color,
              quantity: item.quantity,
              price: item.price,
              total: item.total,
              costPrice: item.costPrice // Store cost at time of sale
            }))
          },
          payments: {
            create: {
              amount: orderData.paymentData.amount,
              currency: orderData.paymentData.currency,
              status: 'PAID',
              transactionId: orderData.paymentData.transactionId,
              gatewayResponse: orderData.paymentData.gatewayResponse,
              method: orderData.paymentData.method
            }
          }
        },
        include: {
          items: true,
          payments: true,
          billingAddress: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });
    } catch (error: any) {
      // Handle unique constraint violations (duplicate transaction ID)
      if (error.code === 'P2002' && error.meta?.target?.includes('transactionId')) {
        console.log('⚠️ Duplicate payment transaction detected:', orderData.paymentData.transactionId);
        // Return existing order for this transaction
        const existingOrder = await getOrderByPaymentIntentId(orderData.paymentData.transactionId);
        if (existingOrder) {
          console.log('✅ Returning existing order for duplicate transaction:', existingOrder.id);
          return existingOrder;
        }
      }
      throw error; // Re-throw if it's not a duplicate transaction error
    }

    // Deduct stock for all order items
    try {
      const stockDeductionItems: StockDeductionItem[] = orderData.items.map(item => ({
        productId: item.productId,
        variantId: item.variantId,
        size: item.size,
        color: item.color,
        quantity: item.quantity
      }));

      const stockResult = await deductStockForOrder(stockDeductionItems);
      
      if (!stockResult.success) {
        console.error('❌ Stock deduction failed for order:', orderData.orderNumber);
      }
    } catch (stockError) {
      console.error('❌ Error during stock deduction:', stockError);
    }

    // Create notification for new order
    try {
      console.log('🔔 Creating notification for order:', order.id, order.orderNumber);
      
      // Check if notification already exists for this order
      const { prisma } = await import('../lib/prisma');
      const existingNotification = await prisma.notification.findFirst({
        where: {
          targetType: 'ORDER',
          targetId: order.id,
          type: 'ORDER_PLACED'
        }
      });
      
      if (existingNotification) {
        console.log('⚠️ Notification already exists for order:', order.id, 'skipping creation');
        return order;
      }
      
      const { notificationService } = await import('./notificationService');
      const { SocketServer } = await import('../socket/socketServer');
      
      // Create order notification
      const notification = await notificationService.createOrderNotification(
        order.id,
        'ORDER_PLACED',
        'New Order Received',
        `New order #${order.orderNumber} has been placed by ${order.user?.name || 'Customer'}`,
        'HIGH',
        {
          orderId: order.id,
          orderNumber: order.orderNumber,
          customerName: order.user?.name,
          customerEmail: order.user?.email,
          total: order.total,
          currency: order.currency,
          itemCount: order.items.length
        }
      );
      
      console.log('✅ Order notification created:', notification?.id);
      
      // Send real-time notification to admins via socket
      try {
        const globalSocketServer = (global as any).socketServer;
        if (globalSocketServer) {
          await globalSocketServer.sendAdminNotification({
            type: 'ORDER_PLACED',
            title: 'New Order Received',
            message: `New order #${order.orderNumber} has been placed by ${order.user?.name || 'Customer'}`,
            category: 'ORDERS',
            priority: 'HIGH',
            targetType: 'ORDER',
            targetId: order.id,
            isGlobal: true,
            data: {
              orderId: order.id,
              orderNumber: order.orderNumber,
              customerName: order.user?.name,
              customerEmail: order.user?.email,
              total: order.total,
              currency: order.currency,
              itemCount: order.items.length
            }
          });
          console.log('📡 Real-time notification sent to admins');
        }
      } catch (socketError) {
        console.error('❌ Error sending real-time notification:', socketError);
      }
      
    } catch (notificationError) {
      console.error('Error creating order notification:', notificationError);
      // Don't fail the order creation if notification fails
    }

    return order;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const generateOrderNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${timestamp}-${random}`;
};

export const getOrderByPaymentIntentId = async (paymentIntentId: string) => {
  try {
    const order = await prisma.order.findFirst({
      where: {
        payments: {
          some: {
            transactionId: paymentIntentId
          }
        }
      },
      include: {
        items: true,
        payments: true,
        billingAddress: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return order;
  } catch (error) {
    console.error('Error finding order by payment intent ID:', error);
    throw error;
  }
};
