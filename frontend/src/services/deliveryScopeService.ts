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
  getShippingRates: async (countryCode: string, stateCode?: string): Promise<ShippingRate[]> => {
    try {
      const params = new URLSearchParams({ country: countryCode });
      if (stateCode) {
        params.append('state', stateCode);
      }
      
      const response = await api.get(`/api/admin/tax-shipping/shipping-rates?${params}`);
      return response.data.shippingRates || [];
    } catch (error) {
      console.error('Failed to fetch shipping rates:', error);
      throw error;
    }
  },

  // Get all shipping rates (for admin use)
  getAllShippingRates: async (): Promise<ShippingRate[]> => {
    try {
      const response = await api.get('/api/admin/tax-shipping/shipping-rates');
      return response.data.shippingRates || [];
    } catch (error) {
      console.error('Failed to fetch all shipping rates:', error);
      throw error;
    }
  }
};
