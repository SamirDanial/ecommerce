import api from '../lib/axios';

export interface LanguageConfig {
  id: number;
  code: string;
  name: string;
  nativeName: string;
  isActive: boolean;
  isDefault: boolean;
  isRTL: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CurrencyConfig {
  id: number;
  code: string;
  name: string;
  symbol: string;
  rate: number;
  isActive: boolean;
  isDefault: boolean;
  decimals: number;
  position: 'before' | 'after';
  createdAt: string;
  updatedAt: string;
}

export interface ConfigResponse<T> {
  success: boolean;
  data: T[];
  count: number;
}

export const configService = {
  // Get all active languages
  getLanguages: async (): Promise<LanguageConfig[]> => {
    try {
      const response = await api.get<ConfigResponse<LanguageConfig>>('/api/languages');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching languages:', error);
      throw new Error('Failed to fetch languages');
    }
  },

  // Get all active currencies
  getCurrencies: async (): Promise<CurrencyConfig[]> => {
    try {
      const response = await api.get<ConfigResponse<CurrencyConfig>>('/api/currencies');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching currencies:', error);
      throw new Error('Failed to fetch currencies');
    }
  },

  // Get default language
  getDefaultLanguage: async (): Promise<LanguageConfig | null> => {
    try {
      const response = await api.get<{ success: boolean; data: LanguageConfig }>('/api/languages/default');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching default language:', error);
      return null;
    }
  },

  // Get default currency
  getDefaultCurrency: async (): Promise<CurrencyConfig | null> => {
    try {
      const response = await api.get<{ success: boolean; data: CurrencyConfig }>('/api/currencies/default');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching default currency:', error);
      return null;
    }
  }
};

