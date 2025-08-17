import express from 'express';
import Stripe from 'stripe';
import { authenticateClerkToken } from '../middleware/clerkAuth';
import { createOrderFromPayment, generateOrderNumber } from '../services/orderService';
import { getOrderByPaymentIntentId } from '../services/orderService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const router = express.Router();

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-07-30.basil',
    });

// Test endpoint to verify route is accessible
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Stripe route is working!',
    timestamp: new Date().toISOString(),
    stripeConfigured: !!stripe
  });
});

// Create payment intent route
router.post('/create-payment-intent', authenticateClerkToken, async (req, res) => {
  try {
    const { amount, currency, orderDetails, customerName, shippingAddress } = req.body;

    if (!amount || !currency) {
      return res.status(400).json({
        error: 'Missing required fields: amount and currency'
      });
    }

    let customer;
    const userEmail = (req as any).user?.email;

    if (userEmail) {
      try {
        const existingCustomers = await stripe.customers.list({
          email: userEmail,
          limit: 1
        });

        if (existingCustomers.data.length > 0) {
          customer = existingCustomers.data[0];
        } else {
          // Create new customer
          customer = await stripe.customers.create({
            email: userEmail,
            metadata: {
              clerkUserId: (req as any).user?.clerkId || 'unknown',
              userId: (req as any).user?.id?.toString() || 'unknown'
            }
          });
        }
      } catch (customerError) {
        console.error('Error with customer creation/lookup:', customerError);
      }
    }

    // Create payment intent for embedded form processing
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      payment_method_types: ['card'],
      customer: customer?.id, // Associate with customer
      receipt_email: userEmail, // Add customer email for receipt
      description: `Order from ${userEmail || 'Customer'} - ${currency.toUpperCase()} ${(amount / 100).toFixed(1).replace(/\.0$/, '')}`,
      metadata: {
        userEmail: userEmail || 'unknown',
        userId: req.user?.id || 'unknown',
        customerId: customer?.id || 'none',
        customerName: customerName || `${shippingAddress?.firstName || ''} ${shippingAddress?.lastName || ''}`.trim() || 'Customer',
        // Add detailed order information for webhook processing
        orderDetails: JSON.stringify({
          items: orderDetails.items.map((item: any) => ({
            productId: item.id || 1,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            total: item.quantity * item.price
          })),
          subtotal: orderDetails.subtotal || orderDetails.items.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0),
          total: orderDetails.total,
          currency: currency.toUpperCase(),
          discount: orderDetails.discount || null,
          shippingMethod: orderDetails.shippingMethod || 'standard',
          shippingCost: orderDetails.shippingCost || 0,
          tax: orderDetails.tax || 0 // Add the missing tax field
        }),
        shippingAddress: JSON.stringify(shippingAddress) // Add shipping address to metadata
      }
    });

    // Return the payment intent for embedded form processing
    res.json({
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id
    });

  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({
      error: 'Failed to create payment intent',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
 });

// Helper function to calculate shipping cost based on country and order value
function calculateShippingCost(shippingAddress: any, subtotal: number): number {
  if (!shippingAddress) return 0;
  
  try {
    const address = typeof shippingAddress === 'string' ? JSON.parse(shippingAddress) : shippingAddress;
    const country = address.country?.toUpperCase();
    
    // Base shipping rates by country (configurable via environment variables)
    const baseShippingRates: { [key: string]: number } = {
      'US': parseFloat(process.env.SHIPPING_US || '5.99'),
      'CA': parseFloat(process.env.SHIPPING_CA || '7.99'),
      'UK': parseFloat(process.env.SHIPPING_UK || '8.99'),
      'AU': parseFloat(process.env.SHIPPING_AU || '12.99'),
      'DE': parseFloat(process.env.SHIPPING_DE || '6.99'),
      'FR': parseFloat(process.env.SHIPPING_FR || '7.99'),
      'PK': parseFloat(process.env.SHIPPING_PK || '3.99'),
      'IN': parseFloat(process.env.SHIPPING_IN || '4.99'),
      'CN': parseFloat(process.env.SHIPPING_CN || '9.99'),
      'JP': parseFloat(process.env.SHIPPING_JP || '11.99'),
    };
    
    // Get base shipping rate for country (default to 9.99 for unknown countries)
    const baseRate = baseShippingRates[country] || parseFloat(process.env.SHIPPING_DEFAULT || '9.99');
    
    // Free shipping threshold (configurable)
    const freeShippingThreshold = parseFloat(process.env.FREE_SHIPPING_THRESHOLD || '200'); // Increased from 100 to 200
    
    // Reduced shipping threshold (configurable)
    const reducedShippingThreshold = parseFloat(process.env.REDUCED_SHIPPING_THRESHOLD || '100'); // Increased from 50 to 100
    
    // Reduced shipping discount percentage (configurable)
    const reducedShippingDiscount = parseFloat(process.env.REDUCED_SHIPPING_DISCOUNT || '0.8'); // Changed from 0.7 to 0.8 (20% off instead of 30%)
    
    // Free shipping for orders over threshold
    if (subtotal >= freeShippingThreshold) {
      return 0;
    }
    
    // Reduced shipping for orders over reduced threshold
    if (subtotal >= reducedShippingThreshold) {
      const reducedRate = baseRate * reducedShippingDiscount;
      return reducedRate;
    }
    
    return baseRate;
    
  } catch (error) {
    console.error('Error calculating shipping cost, using default:', error);
    return 0;
  }
}

// Helper function to calculate discount from discount codes
function calculateDiscount(orderDetails: any): number {
  try {
    
    // Check if there's a discount code applied in the order details
    if (orderDetails && orderDetails.discount) {
      const discount = orderDetails.discount;
      
      // Use the pre-calculated amount from the frontend if available
      if (discount.calculatedAmount !== undefined) {
        return discount.calculatedAmount;
      }
      
      // Fallback to calculation if needed
      if (discount.type === 'PERCENTAGE') {
        const discountAmount = (orderDetails.subtotal * discount.value) / 100;
        return discountAmount;
      } else if (discount.type === 'FIXED') {
        const discountAmount = Math.min(discount.amount, orderDetails.subtotal);
        return discountAmount;
      }
    }
    
    return 0;
  } catch (error) {
    console.error('Error calculating discount, using 0:', error);
    return 0;
  }
}

// Stripe webhook endpoint for handling payment intent events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    if (endpointSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig as string, endpointSecret);
    } else {
      // For local testing without webhook secret
      event = req.body;
    }
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        
        try {
          // Extract order details from metadata
          const metadata = paymentIntent.metadata;
          
          const userId = parseInt(metadata.userId || '0');
          const customerName = metadata.customerName || 'Unknown Customer';
          
          if (userId && paymentIntent.amount) {
            // Parse order details from metadata
            let orderDetails: any = null;
            let items: any[] = [];
            let subtotal = 0;
            
            try {
              if (metadata.orderDetails) {
                orderDetails = JSON.parse(metadata.orderDetails);
                items = orderDetails.items || [];
                subtotal = orderDetails.subtotal || 0;
              }
            } catch (e) {
              // Create a default item structure if parsing fails
              items = [{
                productId: 1,
                productName: 'Order Items',
                quantity: 1,
                price: paymentIntent.amount / 100,
                total: paymentIntent.amount / 100
              }];
              subtotal = paymentIntent.amount / 100;
            }
            
            const amount = paymentIntent.amount / 100; // Convert from cents

            // Use tax from frontend UI if available, otherwise calculate
            const taxRate = parseFloat(process.env.TAX_RATE || '0.10'); // Default 10% tax, configurable via TAX_RATE env var
            let tax = 0;
            if (orderDetails && orderDetails.tax !== undefined) {
              tax = orderDetails.tax; // Use exact UI tax value
            } else {
              // Fallback to calculation if not provided
              tax = subtotal * taxRate;
            }
            
            // Extract shipping address from metadata if available
            let shippingAddressData: any = null;
            if (metadata.shippingAddress) {
              try {
                shippingAddressData = JSON.parse(metadata.shippingAddress);
              } catch (e) {
                // Shipping address parsing failed, continue without it
              }
            }
            
            // Use shipping cost from frontend if available, otherwise calculate based on country and order value
            let shippingCost = 0;
            if (orderDetails && orderDetails.shippingCost !== undefined) {
              shippingCost = orderDetails.shippingCost;
            } else {
              shippingCost = calculateShippingCost(shippingAddressData, subtotal);
            }
            
            // Use discount from frontend UI if available, otherwise calculate
            let discount = 0;
            if (orderDetails && orderDetails.discount && orderDetails.discount.calculatedAmount !== undefined) {
              discount = orderDetails.discount.calculatedAmount; // Use exact UI discount value
            } else {
              // Fallback to calculation if not provided
              discount = calculateDiscount(orderDetails);
            }
            
            // Calculate final total (should match Stripe amount)
            const calculatedTotal = subtotal + tax + shippingCost - discount;
            
            // Use frontend total if available, otherwise use Stripe amount
            const finalTotal = orderDetails?.total || amount;
            
            // Generate tracking number
            const trackingNumber = `TRK-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
            
            // Retrieve payment method details from Stripe to get expiry information
            let paymentMethodDetails = null;
            if (paymentIntent.payment_method) {
              try {
                paymentMethodDetails = await stripe.paymentMethods.retrieve(paymentIntent.payment_method as string);
              } catch (error) {
                console.error('Failed to retrieve payment method details:', error);
              }
            }
            
            // Create payment method record
            const paymentMethod = await prisma.paymentMethod.create({
              data: {
                userId: userId,
                type: 'CREDIT_CARD',
                provider: 'STRIPE',
                accountNumber: `****${paymentMethodDetails?.card?.last4 || '****'}`,
                expiryMonth: paymentMethodDetails?.card?.exp_month || null,
                expiryYear: paymentMethodDetails?.card?.exp_year || null,
                cardholderName: customerName,
                isDefault: false,
                isActive: true,
                metadata: {
                  stripePaymentMethodId: paymentIntent.payment_method,
                  stripeCustomerId: paymentIntent.customer,
                  cardBrand: paymentMethodDetails?.card?.brand || 'unknown',
                  last4: paymentMethodDetails?.card?.last4 || 'unknown'
                }
              }
            });
            
            // Parse customer name for address fields
            const nameParts = customerName.split(' ');
            const firstName = nameParts[0] || 'Unknown';
            const lastName = nameParts.slice(1).join(' ') || 'Unknown';
            
            const orderData = {
              userId: userId,
              orderNumber: generateOrderNumber(),
              subtotal: subtotal, // Use original subtotal
              tax: tax, // Use exact UI tax value
              shipping: shippingCost, // Use exact UI shipping cost
              shippingMethod: orderDetails?.shippingMethod || 'standard', // Store shipping method
              discount: discount, // Use exact UI discount value
              total: finalTotal, // Use calculated final total
              currency: paymentIntent.currency.toUpperCase() as 'USD' | 'EUR' | 'PKR',
              language: 'ENGLISH' as const,
              
              // Store address information directly in order
              shippingFirstName: shippingAddressData ? shippingAddressData.firstName || customerName.split(' ')[0] || 'Unknown' : 'Unknown',
              shippingLastName: shippingAddressData ? shippingAddressData.lastName || customerName.split(' ').slice(1).join(' ') || 'Unknown' : 'Unknown',
              shippingCompany: undefined,
              shippingAddress1: shippingAddressData ? shippingAddressData.address || 'No address provided' : 'No address provided',
              shippingAddress2: undefined,
              shippingCity: shippingAddressData ? shippingAddressData.city || 'Unknown' : 'Unknown',
              shippingState: shippingAddressData ? shippingAddressData.state || 'Unknown' : 'Unknown',
              shippingPostalCode: shippingAddressData ? shippingAddressData.postalCode || '' : '',
              shippingCountry: shippingAddressData ? shippingAddressData.country || 'Unknown' : 'Unknown',
              shippingPhone: shippingAddressData ? shippingAddressData.phone || '' : '',
              
              // Legacy fields (set to undefined since we're using direct address fields)
              billingAddressId: undefined,
              
              paymentMethodId: paymentMethod.id,
              trackingNumber: trackingNumber,
              notes: `Order placed via Stripe payment. Customer: ${customerName}. Payment ID: ${paymentIntent.id}`,
              items: items.map(item => ({
                productId: item.productId || 1,
                variantId: item.variantId,
                productName: item.name || item.productName || 'Product',
                productSku: item.sku || item.productSku,
                size: item.size,
                color: item.color,
                quantity: item.quantity || 1,
                price: item.price || 0,
                total: item.total || (item.price * item.quantity) || 0
              })),
              paymentData: {
                amount: amount,
                currency: paymentIntent.currency.toUpperCase() as 'USD' | 'EUR' | 'PKR',
                transactionId: paymentIntent.id,
                gatewayResponse: JSON.stringify(paymentIntent),
                method: 'CREDIT_CARD' as const
              }
            };
            
            const order = await createOrderFromPayment(orderData);
          } else {
            // Missing required data, skip processing
          }
        } catch (error) {
          console.error('Error creating order from payment intent:', error);
        }
        
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Get order details by payment intent ID
router.get('/order/:paymentIntentId', async (req, res) => {
  try {
    const { paymentIntentId } = req.params;
    
    // First try to get the order from our database
    const order = await getOrderByPaymentIntentId(paymentIntentId);
    
    if (order) {
      return res.json({
        success: true,
        order: order
      });
    }
    
    // If no order found, try to get payment intent details from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    res.json({
      success: true,
      paymentIntent: {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        metadata: paymentIntent.metadata
      },
      order: null
    });
    
  } catch (error) {
    console.error('Error retrieving order:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to retrieve order details' 
    });
  }
});

export default router;
