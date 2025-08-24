import api from './api';

export interface TaxRate {
  id: number;
  countryCode: string;
  countryName: string;
  stateCode?: string;
  stateName?: string;
  cityCode?: string;
  cityName?: string;
  taxRate: number; // Percentage as decimal (e.g., 0.0825 for 8.25%)
  isActive: boolean;
}

export const TaxService = {
  // Get tax rate for a specific location (using new checkout endpoint)
  getTaxRate: async (countryCode: string, stateCode?: string, cityCode?: string, token?: string): Promise<TaxRate | null> => {
    try {
      const params = new URLSearchParams({ country: countryCode });
      if (stateCode) {
        params.append('state', stateCode);
      }
      // Note: cityCode is not supported by TaxRate model, only country and state
      
      // Use the new public checkout endpoint that returns minimal data
      const response = await api.get(`/currencies/checkout/tax-rate?${params}`);
      
      // Transform the response to match the TaxRate interface
      return {
        id: 0, // Not needed for checkout
        countryCode,
        countryName: '', // Not needed for checkout
        stateCode: stateCode || undefined,
        stateName: '', // Not needed for checkout
        cityCode: undefined, // TaxRate model doesn't support cityCode
        cityName: '', // Not needed for checkout
        taxRate: parseFloat(response.data.data.taxRate),
        isActive: true
      };
    } catch (error: any) {
      console.error('Failed to fetch tax rate:', error);
      return null;
      }
    },

  // Get all tax rates (for admin use)
  getAllTaxRates: async (token?: string): Promise<TaxRate[]> => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await api.get('/admin/tax-shipping/tax-rates', { headers });
      return response.data.taxRates || [];
    } catch (error: any) {
      // If it's an authentication error, return empty array instead of throwing
      if (error.response?.status === 401) {
        console.warn('Authentication required for all tax rates, using default');
        return [];
      }
      console.error('Failed to fetch all tax rates:', error);
      return [];
    }
  }
};
