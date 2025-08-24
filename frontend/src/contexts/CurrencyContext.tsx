import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useProfile } from '../hooks/useProfile';
import { CurrencyService } from '../services/currencyService';

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

interface CurrencyContextType {
  selectedCurrency: CurrencyConfig;
  availableCurrencies: CurrencyConfig[];
  isLoading: boolean;
  formatPrice: (price: number) => string;
  formatConvertedPrice: (price: number) => string;
  formatPriceWithCurrency: (price: number, currencyCode: string, currencySymbol?: string) => string;
  convertPrice: (price: number) => number;
  setCurrency: (currency: CurrencyConfig) => void;
  refreshCurrencies: () => Promise<void>;
}

const defaultCurrency: CurrencyConfig = {
  id: 1,
  code: 'USD',
  name: 'US Dollar',
  symbol: '$',
  rate: 1,
  isActive: true,
  isDefault: true,
  decimals: 2,
  position: 'before',
  createdAt: '',
  updatedAt: ''
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

interface CurrencyProviderProps {
  children: ReactNode;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyConfig>(defaultCurrency);
  const [availableCurrencies, setAvailableCurrencies] = useState<CurrencyConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get user preferences
  const { usePreferences } = useProfile();
  const { data: preferences, isLoading: preferencesLoading } = usePreferences();

  // Fetch available currencies
  const fetchCurrencies = useCallback(async () => {
    try {
      setIsLoading(true);
      const currencies = await CurrencyService.getAllCurrencies();
      setAvailableCurrencies(currencies);
      
      // Find user's preferred currency
      if (preferences?.currency) {
        const userPreferredCurrency = currencies.find(
          currency => currency.code === preferences.currency
        );
        if (userPreferredCurrency) {
          setSelectedCurrency(userPreferredCurrency);
        }
      } else {
        // Try to get business base currency first, then fallback to default
        try {
          const businessBaseCurrency = await CurrencyService.getBusinessBaseCurrency();
          if (businessBaseCurrency) {
            const businessCurrency = currencies.find(
              currency => currency.code === businessBaseCurrency.code
            );
            if (businessCurrency) {
              setSelectedCurrency(businessCurrency);
              return;
            }
          }
        } catch (error) {
          console.log('Could not fetch business base currency, using default');
        }
        
        // Find default currency from backend
        const defaultCurrency = currencies.find(currency => currency.isDefault);
        if (defaultCurrency) {
          setSelectedCurrency(defaultCurrency);
        }
      }
    } catch (error) {
      console.error('Failed to fetch currencies:', error);
      // Use fallback currencies
      const fallbackCurrencies = CurrencyService.getFallbackCurrencies();
      setAvailableCurrencies(fallbackCurrencies);
      setSelectedCurrency(fallbackCurrencies[0]);
    } finally {
      setIsLoading(false);
    }
  }, [preferences?.currency]);

  // Initialize currencies when preferences are available
  useEffect(() => {
    if (!preferencesLoading) {
      fetchCurrencies();
    }
  }, [preferencesLoading, preferences?.currency, fetchCurrencies]);

  // Format price with currency symbol and proper positioning
  // This function converts from base currency to selected currency
  const formatPrice = (price: number): string => {
    if (!selectedCurrency) return `$${price.toFixed(1).replace(/\.0$/, '')}`;
    
    // Convert from base currency to selected currency
    const convertedPrice = convertPrice(price);
    const formattedAmount = convertedPrice.toFixed(1).replace(/\.0$/, '');
    
    if (selectedCurrency.position === 'before') {
      return `${selectedCurrency.symbol}${formattedAmount}`;
    } else {
      return `${formattedAmount}${selectedCurrency.symbol}`;
    }
  };

  // Format already-converted price with currency symbol (no conversion)
  const formatConvertedPrice = (price: number): string => {
    if (!selectedCurrency) return `$${price.toFixed(1).replace(/\.0$/, '')}`;
    
    // Don't convert again - price should already be in selected currency
    const formattedAmount = price.toFixed(1).replace(/\.0$/, '');
    
    if (selectedCurrency.position === 'before') {
      return `${selectedCurrency.symbol}${formattedAmount}`;
    } else {
      return `${formattedAmount}${selectedCurrency.symbol}`;
    }
  };

  // Format price with specific currency (for order history, etc.)
  const formatPriceWithCurrency = (price: number, currencyCode: string, currencySymbol?: string): string => {
    // Find the currency config for the specified currency code
    const currency = availableCurrencies.find(c => c.code === currencyCode);
    
    if (!currency && !currencySymbol) {
      // Fallback to currency code if no symbol available
      return `${currencyCode} ${price.toFixed(1).replace(/\.0$/, '')}`;
    }
    
    const formattedAmount = price.toFixed(1).replace(/\.0$/, '');
    const symbol = currencySymbol || currency?.symbol || currencyCode;
    
    // Default to before position for most currencies
    const position = currency?.position || 'before';
    
    if (position === 'before') {
      return `${symbol}${formattedAmount}`;
    } else {
      return `${formattedAmount}${symbol}`;
    }
  };

  // Convert price from USD to selected currency
  const convertPrice = (price: number): number => {
    if (!selectedCurrency) return price;
    return price * selectedCurrency.rate;
  };

  // Set new currency
  const handleSetCurrency = (currency: CurrencyConfig) => {
    setSelectedCurrency(currency);
  };

  // Refresh currencies from backend
  const refreshCurrencies = async () => {
    await fetchCurrencies();
  };

  const value: CurrencyContextType = {
    selectedCurrency,
    availableCurrencies,
    isLoading: isLoading || preferencesLoading,
    formatPrice,
    formatConvertedPrice,
    formatPriceWithCurrency,
    convertPrice,
    setCurrency: handleSetCurrency,
    refreshCurrencies
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};
