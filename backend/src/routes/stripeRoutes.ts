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
    // console.log('=== CREATING PAYMENT INTENT ===');
    // console.log('1. Route hit successfully');
    console.log('2. Request body:', req.body);
    
    const { amount, currency, orderDetails, customerName, shippingAddress } = req.body;

    console.log('orderDetails', JSON.stringify(orderDetails, null, 2));
    
    // console.log('2a. Order details:', orderDetails);
    // console.log('2b. Customer name:', customerName);
    // console.log('2c. Shipping address:', shippingAddress);
    // console.log('3. User from middleware:', req.user);
    
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
          // console.log('4a. Found existing customer:', {
          //   id: customer.id,
          //   email: customer.email
          // });
        } else {
          // Create new customer
          customer = await stripe.customers.create({
            email: userEmail,
            metadata: {
              clerkUserId: (req as any).user?.clerkId || 'unknown',
              userId: (req as any).user?.id?.toString() || 'unknown'
            }
          });
          console.log('4a. Created new customer:', {
            id: customer.id,
            email: customer.email
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
      description: `Order from ${userEmail || 'Customer'} - ${currency.toUpperCase()} ${(amount / 100).toFixed(2)}`,
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
          subtotal: orderDetails.items.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0),
          total: amount / 100,
          currency: currency.toUpperCase()
        }),
        shippingAddress: JSON.stringify(shippingAddress) // Add shipping address to metadata
      }
    });

    console.log('4. Payment intent created:', {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      client_secret: paymentIntent.client_secret ? 'present' : 'missing',
      customer: customer ? {
        id: customer.id,
        email: customer.email
      } : 'none'
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
    
    console.log('Shipping calculation details:', {
      country,
      baseRate,
      subtotal,
      freeShippingThreshold,
      reducedShippingThreshold,
      reducedShippingDiscount
    });
    
    // Free shipping for orders over threshold
    if (subtotal >= freeShippingThreshold) {
      console.log('Free shipping applied (order >= threshold)');
      return 0;
    }
    
    // Reduced shipping for orders over reduced threshold
    if (subtotal >= reducedShippingThreshold) {
      const reducedRate = baseRate * reducedShippingDiscount;
      console.log('Reduced shipping applied:', { originalRate: baseRate, reducedRate, discount: reducedShippingDiscount });
      return reducedRate;
    }
    
    console.log('Standard shipping applied:', { rate: baseRate });
    return baseRate;
    
  } catch (error) {
    console.log('Error calculating shipping cost, using default:', error);
    return parseFloat(process.env.SHIPPING_DEFAULT || '9.99');
  }
}

// Helper function to calculate discount from discount codes
function calculateDiscount(orderDetails: any): number {
  try {
    // Check if there's a discount code applied in the order details
    if (orderDetails.discountCode) {
      const discountCode = orderDetails.discountCode;
      
      if (discountCode.type === 'PERCENTAGE') {
        return (orderDetails.subtotal * discountCode.value) / 100;
      } else if (discountCode.type === 'FIXED') {
        return Math.min(discountCode.value, orderDetails.subtotal); // Don't discount more than subtotal
      }
    }
    
    return 0;
  } catch (error) {
    console.log('Error calculating discount, using 0:', error);
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

  console.log('=== STRIPE WEBHOOK RECEIVED ===');
  console.log('Event type:', event.type);

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('Payment intent succeeded:', {
          id: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          customer: paymentIntent.customer,
          metadata: paymentIntent.metadata
        });
        
        try {
          // Extract order details from metadata
          const metadata = paymentIntent.metadata;
          console.log('Processing payment intent metadata:', metadata);
          
          const userId = parseInt(metadata.userId || '0');
          const customerName = metadata.customerName || 'Unknown Customer';
          
          console.log('Extracted user info:', { userId, customerName });
          
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
                console.log('Parsed order details:', { items, subtotal });
              }
            } catch (e) {
              console.log('Could not parse orderDetails from metadata, using default structure');
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

            // Calculate tax (assuming 10% tax rate - you can adjust this)
            const taxRate = parseFloat(process.env.TAX_RATE || '0.10'); // Default 10% tax, configurable via TAX_RATE env var
            const tax = subtotal * taxRate;
            
            // Extract shipping address from metadata if available
            let shippingAddressData: any = null;
            if (metadata.shippingAddress) {
              try {
                shippingAddressData = JSON.parse(metadata.shippingAddress);
                console.log('Extracted shipping address:', shippingAddressData);
              } catch (e) {
                console.log('Could not parse shipping address from metadata:', e);
              }
            }
            
            // Calculate shipping cost based on country and order value
            const shippingCost = calculateShippingCost(shippingAddressData, subtotal);
            
            // Calculate discount (if any discount codes were applied)
            const discount = calculateDiscount(orderDetails);
            
            // Calculate final total (should match Stripe amount)
            const calculatedTotal = subtotal + tax + shippingCost - discount;
            
            // Use Stripe amount as the source of truth for total
            const finalTotal = amount;
            
            console.log('Order calculations:', { 
              subtotal, 
              taxRate, 
              tax, 
              shippingCost, 
              discount, 
              calculatedTotal, 
              stripeAmount: amount 
            });
            
            // Generate tracking number
            const trackingNumber = `TRK-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
            
            // Create payment method record
            const paymentMethod = await prisma.paymentMethod.create({
              data: {
                userId: userId,
                type: 'CREDIT_CARD',
                provider: 'STRIPE',
                accountNumber: `****${paymentIntent.payment_method ? paymentIntent.payment_method.toString().slice(-4) : '****'}`,
                cardholderName: customerName,
                isDefault: false,
                isActive: true,
                metadata: {
                  stripePaymentMethodId: paymentIntent.payment_method,
                  stripeCustomerId: paymentIntent.customer
                }
              }
            });
            
            console.log('Payment method created:', { paymentMethodId: paymentMethod.id, type: paymentMethod.type });
            
            // Parse customer name for address fields
            const nameParts = customerName.split(' ');
            const firstName = nameParts[0] || 'Unknown';
            const lastName = nameParts.slice(1).join(' ') || 'Unknown';
            
            console.log('Parsed customer name:', { firstName, lastName });
            
            const orderData = {
              userId: userId,
              orderNumber: generateOrderNumber(),
              subtotal: subtotal,
              tax: tax, // Use calculated tax
              shipping: shippingCost, // Use calculated shipping cost
              discount: discount, // Use calculated discount
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
            
            console.log('Creating order with data:', orderData);

            const order = await createOrderFromPayment(orderData);
            console.log('Order created successfully:', {
              orderId: order.id,
              orderNumber: order.orderNumber,
              subtotal: order.subtotal,
              tax: order.tax,
              shipping: order.shipping,
              discount: order.discount,
              total: order.total,
              itemsCount: order.items?.length || 0,
              customerName: customerName,
              shippingAddress: {
                firstName: order.shippingFirstName,
                lastName: order.shippingLastName,
                city: order.shippingCity,
                state: order.shippingState,
                country: order.shippingCountry
              },
              paymentMethodId: paymentMethod.id,
              trackingNumber: trackingNumber
            });
          } else {
            console.log('Missing userId or amount in payment intent metadata');
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
