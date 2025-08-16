import { useQuery } from '@tanstack/react-query';
import { configService } from '../services/configService';

export const useConfig = () => {
  // Get all active languages
  const useLanguages = () => {
    return useQuery({
      queryKey: ['config', 'languages'],
      queryFn: configService.getLanguages,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    });
  };

  // Get all active currencies
  const useCurrencies = () => {
    return useQuery({
      queryKey: ['config', 'currencies'],
      queryFn: configService.getCurrencies,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    });
  };

  // Get default language
  const useDefaultLanguage = () => {
    return useQuery({
      queryKey: ['config', 'defaultLanguage'],
      queryFn: configService.getDefaultLanguage,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    });
  };

  // Get default currency
  const useDefaultCurrency = () => {
    return useQuery({
      queryKey: ['config', 'defaultCurrency'],
      queryFn: configService.getDefaultCurrency,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    });
  };

  // Get all active countries
  const useCountries = () => {
    return useQuery({
      queryKey: ['config', 'countries'],
      queryFn: configService.getCountries,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    });
  };

  // Get only countries with delivery available
  const useDeliveryCountries = () => {
    return useQuery({
      queryKey: ['config', 'deliveryCountries'],
      queryFn: configService.getDeliveryCountries,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    });
  };

  return {
    useLanguages,
    useCurrencies,
    useDefaultLanguage,
    useDefaultCurrency,
    useCountries,
    useDeliveryCountries,
  };
};
