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
    const { amount, currency, orderDetails, customerName, shippingAddressId } = req.body;

    // Look up the full shipping address from the database
    let shippingAddress = null;
    if (shippingAddressId) {
      try {
        shippingAddress = await prisma.address.findUnique({
          where: { id: shippingAddressId },
          select: {
            firstName: true,
            lastName: true,
            phone: true,
            address1: true,
            city: true,
            state: true,
            postalCode: true,
            country: true
          }
        });
        
        if (shippingAddress) {
          console.log(`✅ Found shipping address ID ${shippingAddressId}:`, shippingAddress);
        } else {
          console.warn(`⚠️ Shipping address ID ${shippingAddressId} not found`);
        }
      } catch (addressError) {
        console.error(`Error looking up shipping address ID ${shippingAddressId}:`, addressError);
      }
    }

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

    // Store full order details in request for later use (webhook/order creation)
    // We'll store only essential metadata in Stripe to stay within 500 char limit
    const fullOrderDetails = {
      items: orderDetails.items?.map((item: any) => ({
        productId: item.id || 1,
        variantId: item.variantId,
        name: item.name,
        sku: item.sku,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        price: item.price,
        total: item.quantity * item.price
      })) || [],
      subtotal: orderDetails.subtotal || orderDetails.items?.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0) || 0,
      total: orderDetails.total,
      currency: currency.toUpperCase(),
      discount: orderDetails.discount || null,
      shippingMethod: orderDetails.shippingMethod || 'standard',
      shippingCost: orderDetails.shippingCost || 0,
      tax: orderDetails.tax || 0,
      shippingAddress: shippingAddress
    };

    // Store order details in database temporarily for webhook processing
    // This avoids the metadata size limit while preserving all information
    // Note: This requires the tempOrderData table to be created in the schema
    // For now, we'll use a compact metadata approach

    // Process items and ensure we have valid variant IDs
    const itemsWithVariants = [];
    if (orderDetails.items && orderDetails.items.length > 0) {
      for (const item of orderDetails.items) {
        // If frontend already provided variantId and sku, use them
        if (item.variantId && item.variantId > 0 && item.sku && item.sku !== 'N/A') {
          itemsWithVariants.push({
            ...item,
            variantId: item.variantId,
            sku: item.sku
          });
          console.log(`✅ Using provided variant ID ${item.variantId} for product ${item.id}`);
        } else if (item.size && item.color) {
          // Frontend didn't provide variant info, look it up
          try {
            const variant = await prisma.productVariant.findFirst({
              where: {
                productId: item.id,
                size: item.size,
                color: item.color
              },
              select: { id: true, sku: true }
            });
            
            if (variant) {
              itemsWithVariants.push({
                ...item,
                variantId: variant.id,
                sku: variant.sku
              });
              console.log(`🔍 Found variant ID ${variant.id} for product ${item.id}, size ${item.size}, color ${item.color}`);
            } else {
              console.warn(`⚠️ No variant found for product ${item.id}, size ${item.size}, color ${item.color}`);
              // Still add item but with placeholder variant ID
              itemsWithVariants.push({
                ...item,
                variantId: 1, // Use 1 as placeholder - make sure product ID 1 exists
                sku: 'UNKNOWN'
              });
            }
          } catch (variantError) {
            console.error(`Error looking up variant for product ${item.id}:`, variantError);
            // Add item with placeholder on error
            itemsWithVariants.push({
              ...item,
              variantId: 1, // Use 1 as placeholder
              sku: 'ERROR'
            });
          }
        } else {
          // Item without size/color - add with placeholders
          itemsWithVariants.push({
            ...item,
            variantId: 1, // Use 1 as placeholder
            sku: 'NO_VARIANT'
          });
        }
      }
    }

    // Create compact metadata with critical legal/audit information
    // This data is essential for proving what was sold in case of server issues or legal disputes
    const metadata = {
      userEmail: userEmail || 'unknown',
      userId: req.user?.id || 'unknown',
      customerId: customer?.id || 'none',
      customerName: customerName || `${shippingAddress?.firstName || ''} ${shippingAddress?.lastName || ''}`.trim() || 'Customer',
      // Store compact order info to stay within Stripe's 500 char limit
      orderId: `order_${Date.now()}`,
      itemCount: itemsWithVariants.length || 0,
      total: orderDetails.total?.toString() || '0',
      currency: currency.toUpperCase(),
      shippingMethod: orderDetails.shippingMethod || 'standard',
      // Store essential customer info only
      customerEmail: userEmail || 'unknown',
      // Store address ID for webhook to look up full details
      shippingAddressId: shippingAddressId?.toString() || 'none',
      // Store compact item info: "id:qty:price:variantId:size:color" - NOW WITH REAL VARIANT IDs
      items: itemsWithVariants.map((item: any) => 
        `${item.id}:${item.quantity}:${item.price}:${item.variantId}:${item.size || 'N/A'}:${item.color || 'N/A'}`
      ).join(',') || '',
      subtotal: orderDetails.subtotal?.toString() || '0',
      tax: orderDetails.tax?.toString() || '0',
      shippingCost: orderDetails.shippingCost?.toString() || '0',
      discount: orderDetails.discount?.calculatedAmount?.toString() || '0'
    };

    // Check metadata size and log for debugging
    const metadataSize = JSON.stringify(metadata).length;
    console.log('📏 Stripe metadata size check:', {
      metadataSize,
      isWithinLimit: metadataSize <= 500,
      metadata
    });

    if (metadataSize > 500) {
      console.warn('⚠️ Metadata exceeds 500 characters, truncating items field');
      // Truncate items field if needed - this preserves the most critical legal information
      const maxItemsLength = Math.max(0, 500 - metadataSize + metadata.items.length);
      metadata.items = metadata.items.substring(0, maxItemsLength);
      console.warn(`⚠️ Items field truncated to ${maxItemsLength} characters to stay within Stripe limits`);
    }

    // Create payment intent for embedded form processing
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      payment_method_types: ['card'],
      customer: customer?.id, // Associate with customer
      receipt_email: userEmail, // Add customer email for receipt
      description: `Order from ${userEmail || 'Customer'} - ${currency.toUpperCase()} ${(amount / 100).toFixed(1).replace(/\.0$/, '')}`,
      metadata: metadata
    });

    // Return the payment intent for embedded form processing
    // Include order details in response for frontend to store temporarily
    res.json({
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
      orderDetails: fullOrderDetails // Include full order details for frontend storage
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
            // Parse compact metadata format to reconstruct order details
            // This metadata contains critical legal/audit information about what was sold
            // Even if our server burns down, Stripe will have this data for legal proof
            let orderDetails: any = null;
            let items: any[] = [];
            let subtotal = 0;
            
            // Parse compact metadata
            const itemCount = parseInt(metadata.itemCount || '1');
            const total = parseFloat(metadata.total || '0');
            const currency = metadata.currency || 'USD';
            const shippingMethod = metadata.shippingMethod || 'standard';
            const subtotalValue = parseFloat(metadata.subtotal || '0');
            const taxValue = parseFloat(metadata.tax || '0');
            const shippingCostValue = parseFloat(metadata.shippingCost || '0');
            const discountValue = parseFloat(metadata.discount || '0');
            
            console.log('🔍 Webhook - Creating order from compact metadata:', {
              itemCount,
              total,
              currency,
              shippingMethod,
              subtotal: subtotalValue,
              tax: taxValue,
              shippingCost: shippingCostValue,
              discount: discountValue,
              itemsString: metadata.items
            });
            
            // Parse compact items string: "id:qty:price:variantId:size:color" for legal/audit purposes
            if (metadata.items && metadata.items.length > 0) {
              try {
                items = metadata.items.split(',').map((itemStr: string) => {
                  const [productId, quantity, price, variantId, size, color] = itemStr.split(':');
                  return {
                    productId: parseInt(productId) || 1,
                    variantId: variantId === 'N/A' ? null : (parseInt(variantId) || null),
                    productName: `Product ${productId}`,
                    quantity: parseInt(quantity) || 1,
                    price: parseFloat(price) || 0,
                    size: size === 'N/A' ? null : size,
                    color: color === 'N/A' ? null : color,
                    total: (parseInt(quantity) || 1) * (parseFloat(price) || 0)
                  };
                });
                
                console.log('🔍 Items before variant lookup:', items);
                
                // Variant IDs are now already looked up during metadata creation
                // Just log the items for verification
                console.log('🔍 Items with variant IDs (already looked up):', items);
                
                console.log('🔍 Items after variant lookup:', items);
                subtotal = subtotalValue;
              } catch (e) {
                console.error('Error parsing compact items:', e);
                // Fallback to basic structure
                items = [{
                  productId: 1,
                  productName: `Order with ${itemCount} items`,
                  quantity: itemCount,
                  price: total / itemCount,
                  total: total
                }];
                subtotal = total;
              }
            } else {
              // Fallback to basic structure
              items = [{
                productId: 1,
                productName: `Order with ${itemCount} items`,
                quantity: itemCount,
                price: total / itemCount,
                total: total
              }];
              subtotal = total;
            }
            
            const amount = paymentIntent.amount / 100; // Convert from cents

            // Use tax from metadata if available, otherwise calculate
            const taxRate = parseFloat(process.env.TAX_RATE || '0.0825'); // Default 8.25% tax
            const tax = taxValue > 0 ? taxValue : (subtotal * taxRate);
            
            // Look up shipping address from database using ID from metadata
            let shippingAddressData: any = null;
            
            if (metadata.shippingAddressId && metadata.shippingAddressId !== 'none') {
              try {
                const addressId = parseInt(metadata.shippingAddressId);
                const fullAddress = await prisma.address.findUnique({
                  where: { id: addressId },
                  select: {
                    firstName: true,
                    lastName: true,
                    phone: true,
                    address1: true,
                    city: true,
                    state: true,
                    postalCode: true,
                    country: true
                  }
                });
                
                if (fullAddress) {
                  shippingAddressData = fullAddress;
                  console.log(`✅ Retrieved full shipping address from ID ${addressId}:`, shippingAddressData);
                } else {
                  console.warn(`⚠️ Shipping address ID ${addressId} not found in database`);
                  // Fallback to basic structure
                  shippingAddressData = {
                    firstName: metadata.customerName || 'Customer',
                    lastName: '',
                    phone: '',
                    address: 'Address not found',
                    city: 'City not found',
                    state: 'State not found',
                    postalCode: '00000',
                    country: 'US'
                  };
                }
              } catch (addressError) {
                console.error(`Error looking up shipping address ID ${metadata.shippingAddressId}:`, addressError);
                // Fallback to basic structure
                shippingAddressData = {
                  firstName: metadata.customerName || 'Customer',
                  lastName: '',
                  phone: '',
                  address: 'Address lookup error',
                  city: 'City lookup error',
                  state: 'State lookup error',
                  postalCode: '00000',
                  country: 'US'
                };
              }
            } else {
              // Fallback to basic structure if no address ID in metadata
              shippingAddressData = {
                firstName: metadata.customerName || 'Customer',
                lastName: '',
                phone: '',
                address: 'Address not provided',
                city: 'City not provided',
                state: 'State not provided',
                postalCode: '00000',
                country: 'US'
              };
              console.warn('⚠️ No shipping address ID in metadata, using fallback');
            }
            
            // Use shipping cost from metadata if available, otherwise calculate
            const shippingCost = shippingCostValue > 0 ? shippingCostValue : calculateShippingCost(shippingAddressData, subtotal);
            
            // Use discount from metadata if available, otherwise use 0
            const discount = discountValue > 0 ? discountValue : 0;
            
            // Calculate final total (should match Stripe amount)
            const calculatedTotal = subtotal + tax + shippingCost - discount;
            
            // Use the total from metadata or Stripe amount
            const finalTotal = total > 0 ? total : amount;
            
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
              shippingMethod: shippingMethod, // Use shipping method from metadata
              discount: discount, // Use exact UI discount value
              total: finalTotal, // Use calculated final total
              currency: paymentIntent.currency.toUpperCase() as 'USD' | 'EUR' | 'PKR',
              language: 'ENGLISH' as const,
              
              // Store address information directly in order
              shippingFirstName: shippingAddressData ? shippingAddressData.firstName || customerName.split(' ')[0] || 'Unknown' : 'Unknown',
              shippingLastName: shippingAddressData ? shippingAddressData.lastName || customerName.split(' ').slice(1).join(' ') || 'Unknown' : 'Unknown',
              shippingCompany: undefined,
              shippingAddress1: shippingAddressData ? shippingAddressData.address1 || 'No address provided' : 'No address provided',
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
              items: await Promise.all(items.map(async item => {
                // Fetch actual product data from database to get correct name and cost
                const product = await prisma.product.findUnique({
                  where: { id: item.productId || 1 },
                  select: {
                    id: true,
                    name: true,
                    sku: true,
                    costPrice: true
                  }
                });

                // Fetch variant data if variantId exists
                let variant = null;
                if (item.variantId) {
                  variant = await prisma.productVariant.findUnique({
                    where: { id: item.variantId },
                    select: {
                      sku: true,
                      costPrice: true
                    }
                  });
                }

                // Determine the actual cost price (variant > product > 0)
                const actualCostPrice = Number(variant?.costPrice || product?.costPrice || 0);
                
                return {
                  productId: item.productId || 1,
                  variantId: item.variantId, // Can be null
                  productName: product?.name || item.name || item.productName || 'Product', // Use actual product name from DB
                  productSku: variant?.sku || product?.sku || item.sku || item.productSku || null,
                  size: item.size, // Can be null
                  color: item.color, // Can be null
                  quantity: item.quantity || 1,
                  price: item.price || 0,
                  total: item.total || (item.price * item.quantity) || 0,
                  costPrice: actualCostPrice // Add cost price for accurate profit calculation
                };
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
