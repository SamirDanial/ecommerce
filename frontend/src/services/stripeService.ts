import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

// Initialize Stripe
export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  client_secret: string;
}

export interface CreatePaymentIntentRequest {
  amount: number;
  currency: string;
  payment_method_types: string[];
  metadata?: Record<string, string>;
}

export interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
}

// Create payment intent
export const createPaymentIntent = async (data: CreatePaymentIntentRequest): Promise<PaymentIntent> => {
  try {
    const response = await fetch('/api/stripe/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create payment intent');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

// Confirm payment
export const confirmPayment = async (paymentIntentId: string, paymentMethodId: string): Promise<any> => {
  try {
    const response = await fetch('/api/stripe/confirm-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentIntentId,
        paymentMethodId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to confirm payment');
    }

    return await response.json();
  } catch (error) {
    console.error('Error confirming payment:', error);
    throw error;
  }
};

// Get payment methods for a customer
export const getPaymentMethods = async (customerId: string): Promise<PaymentMethod[]> => {
  try {
    const response = await fetch(`/api/stripe/payment-methods/${customerId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch payment methods');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    throw error;
  }
};

// Save payment method
export const savePaymentMethod = async (paymentMethodId: string, customerId: string): Promise<any> => {
  try {
    const response = await fetch('/api/stripe/save-payment-method', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentMethodId,
        customerId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save payment method');
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving payment method:', error);
    throw error;
  }
};
