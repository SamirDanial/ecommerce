import api from './api';

export interface DeliveryScope {
  id: number;
  businessId: string;
  businessName: string;
  hasInternationalDelivery: boolean;
  primaryCountryCode: string;
  primaryCountryName: string;
  primaryCurrency: string;
  isActive: boolean;
}

export interface ShippingRate {
  id: number;
  countryCode: string;
  countryName: string;
  stateCode?: string;
  stateName?: string;
  shippingCost: number;
  deliveryDays: number;
  isActive: boolean;
}

// Interface for the new public shipping rate endpoint
export interface CheckoutShippingRate {
  shippingCost: number;
  deliveryDays: number;
  countryName: string;
}

export const DeliveryScopeService = {
  // Get delivery scope configuration
  getDeliveryScope: async (): Promise<DeliveryScope> => {
    try {
      const response = await api.get('/admin/delivery-scope/public/scope');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch delivery scope:', error);
      throw error;
    }
  },

  // Get shipping rates for a specific country and optionally state
  getShippingRates: async (countryCode: string, stateCode?: string, token?: string): Promise<ShippingRate[]> => {
    try {
      const params = new URLSearchParams({ country: countryCode });
      if (stateCode) {
        params.append('state', stateCode);
      }
      
      // Use the new public endpoint for checkout
      const response = await api.get(`/currencies/checkout/shipping-rate?${params}`);
      
      if (response.data.success && response.data.data) {
        // Transform the new response format to match existing interface
        const checkoutRate: CheckoutShippingRate = response.data.data;
        return [{
          id: 0, // Placeholder ID since new endpoint doesn't return it
          countryCode,
          countryName: checkoutRate.countryName, // Use country name from response
          stateCode,
          stateName: '', // Not provided by new endpoint
          shippingCost: checkoutRate.shippingCost,
          deliveryDays: checkoutRate.deliveryDays,
          isActive: true
        }];
      }
      
      return [];
    } catch (error: any) {
      // If it's a 404, no shipping rate found for this location
      if (error.response?.status === 404) {
        console.log('No shipping rate found for location:', { countryCode, stateCode });
        return [];
      }
      console.error('Failed to fetch shipping rates:', error);
      return [];
    }
  },

  // Get all shipping rates (for admin use)
  getAllShippingRates: async (token?: string): Promise<ShippingRate[]> => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await api.get('/admin/tax-shipping/shipping-rates', { headers });
      return response.data.shippingRates || [];
    } catch (error: any) {
      // If it's an authentication error, return empty array instead of throwing
      if (error.response?.status === 401) {
        console.warn('Authentication required for all shipping rates, using default');
        return [];
      }
      console.error('Failed to fetch all shipping rates:', error);
      return [];
    }
  }
};
