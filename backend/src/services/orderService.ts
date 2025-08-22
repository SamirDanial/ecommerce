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
    console.log('OrderService: Creating order with data:', {
      orderNumber: orderData.orderNumber,
      userId: orderData.userId,
      shippingMethod: orderData.shippingMethod,
      shipping: orderData.shipping
    });
    
    // Calculate total items
    const totalItems = orderData.items.reduce((sum, item) => sum + item.quantity, 0);
    
    // Create the order
    const order = await prisma.order.create({
      data: {
        orderNumber: orderData.orderNumber,
        userId: orderData.userId,
        status: 'CONFIRMED',
        currentStatus: 'CONFIRMED',
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
        console.error('Stock deduction failed:', stockResult.errors);
        // Note: We don't fail the order creation, but log the stock issues
        // In production, you might want to handle this differently
      } else {
        console.log('Stock deducted successfully for order:', orderData.orderNumber);
        console.log('Deducted items:', stockResult.deductedItems);
      }
    } catch (stockError) {
      console.error('Error during stock deduction:', stockError);
      // Log error but don't fail order creation
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
