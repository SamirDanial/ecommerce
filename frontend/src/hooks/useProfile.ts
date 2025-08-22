import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService, Address, PaymentMethod, UserPreferences, ChangePasswordRequest } from '../services/profileService';
import { useClerkAuth } from './useClerkAuth';
import { toast } from 'sonner';

// Custom hook for profile data
export const useProfile = () => {
  const { getToken } = useClerkAuth();
  const queryClient = useQueryClient();

  // Get orders with pagination (minimal data for list view)
  const useOrders = (page: number = 1, limit: number = 3) => {
    return useQuery({
      queryKey: ['profile', 'orders', page, limit],
      queryFn: async () => {
        const token = await getToken();
        if (!token) throw new Error('No authentication token');
        const data = await profileService.getOrders(token, page, limit);
        return data;
      },
      enabled: !!getToken,
    });
  };

  // Get detailed order information (full data for detail view)
  const useOrderDetails = (orderId: number | null) => {
    return useQuery({
      queryKey: ['profile', 'order-details', orderId],
      queryFn: async () => {
        const token = await getToken();
        if (!token) throw new Error('No authentication token');
        const data = await profileService.getOrderDetails(token, orderId!);
        return data;
      },
      enabled: !!getToken && !!orderId,
    });
  };

  // Get addresses
  const useAddresses = () => {
    return useQuery({
      queryKey: ['profile', 'addresses'],
      queryFn: async () => {
        const token = await getToken();
        if (!token) throw new Error('No authentication token');
        const data = await profileService.getAddresses(token);
        return data || []; // Backend returns addresses array directly
      },
      enabled: !!getToken,
    });
  };

  // Get payment methods
  const usePaymentMethods = () => {
    return useQuery({
      queryKey: ['profile', 'paymentMethods'],
      queryFn: async () => {
        const token = await getToken();
        if (!token) throw new Error('No authentication token');
        const data = await profileService.getPaymentMethods(token);
        return data.paymentMethods || [];
      },
      enabled: !!getToken,
    });
  };

  // Get preferences
  const usePreferences = () => {
    return useQuery({
      queryKey: ['profile', 'preferences'],
      queryFn: async () => {
        const token = await getToken();
        if (!token) throw new Error('No authentication token');
        const data = await profileService.getPreferences(token);
        return data || {
          emailNotifications: true,
          smsNotifications: false,
          marketingEmails: true,
          orderUpdates: true,
          promotionalOffers: true,
          newsletter: true,
          language: 'ENGLISH',
          currency: 'USD',
          timezone: 'UTC',
        };
      },
      enabled: !!getToken,
    });
  };

  // Mutations
  const useUpdatePreferences = () => {
    return useMutation({
      mutationFn: async (preferences: UserPreferences) => {
        const token = await getToken();
        if (!token) throw new Error('No authentication token');
        console.log('Updating preferences with:', preferences);
        const result = await profileService.updatePreferences(token, preferences);
        console.log('Update preferences result:', result);
        return result;
      },
      onSuccess: (data) => {
        console.log('Preferences updated successfully, invalidating queries');
        queryClient.invalidateQueries({ queryKey: ['profile', 'preferences'] });
      },
      onError: (error) => {
        console.error('Error updating preferences:', error);
      },
    });
  };

  const useDeleteAddress = () => {
    return useMutation({
      mutationFn: async (addressId: number) => {
        const token = await getToken();
        if (!token) throw new Error('No authentication token');
        return profileService.deleteAddress(token, addressId);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['profile', 'addresses'] });
        toast.success('Address deleted successfully');
      },
      onError: (error) => {
        console.error('Error deleting address:', error);
        toast.error('Failed to delete address');
      },
    });
  };

  const useDeletePaymentMethod = () => {
    return useMutation({
      mutationFn: async (methodId: number) => {
        const token = await getToken();
        if (!token) throw new Error('No authentication token');
        return profileService.deletePaymentMethod(token, methodId);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['profile', 'paymentMethods'] });
        toast.success('Payment method deleted successfully');
      },
      onError: (error) => {
        console.error('Error deleting payment method:', error);
        toast.error('Failed to delete payment method');
      },
    });
  };

  const useAddAddress = () => {
    return useMutation({
      mutationFn: async (address: Omit<Address, 'id'>) => {
        const token = await getToken();
        if (!token) throw new Error('No authentication token');
        return profileService.addAddress(token, address);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['profile', 'addresses'] });
        toast.success('Address added successfully');
      },
      onError: (error) => {
        console.error('Error adding address:', error);
        toast.error('Failed to add address');
      },
    });
  };

  const useUpdateAddress = () => {
    return useMutation({
      mutationFn: async ({ addressId, address }: { addressId: number; address: Partial<Address> }) => {
        const token = await getToken();
        if (!token) throw new Error('No authentication token');
        return profileService.updateAddress(token, addressId, address);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['profile', 'addresses'] });
        toast.success('Address updated successfully');
      },
      onError: (error) => {
        console.error('Error updating address:', error);
        toast.error('Failed to update address');
      },
    });
  };

  const useAddPaymentMethod = () => {
    return useMutation({
      mutationFn: async (paymentMethod: Omit<PaymentMethod, 'id'>) => {
        const token = await getToken();
        if (!token) throw new Error('No authentication token');
        return profileService.addPaymentMethod(token, paymentMethod);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['profile', 'paymentMethods'] });
        toast.success('Payment method added successfully');
      },
      onError: (error) => {
        console.error('Error adding payment method:', error);
        toast.error('Failed to add payment method');
      },
    });
  };

  const useUpdatePaymentMethod = () => {
    return useMutation({
      mutationFn: async ({ methodId, paymentMethod }: { methodId: number; paymentMethod: Partial<PaymentMethod> }) => {
        const token = await getToken();
        if (!token) throw new Error('No authentication token');
        return profileService.updatePaymentMethod(token, methodId, paymentMethod);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['profile', 'paymentMethods'] });
        toast.success('Payment method updated successfully');
      },
      onError: (error) => {
        console.error('Error updating payment method:', error);
        toast.error('Failed to update payment method');
      },
    });
  };

  // Get user sessions
  const useSessions = () => {
    return useQuery({
      queryKey: ['profile', 'sessions'],
      queryFn: async () => {
        const token = await getToken();
        if (!token) throw new Error('No authentication token');
        const data = await profileService.getSessions(token);
        return data || [];
      },
      enabled: !!getToken,
    });
  };

  // Change password
  const useChangePassword = () => {
    return useMutation({
      mutationFn: async (passwordData: ChangePasswordRequest) => {
        const token = await getToken();
        if (!token) throw new Error('No authentication token');
        return profileService.changePassword(token, passwordData);
      },
      onSuccess: () => {
        toast.success('Password changed successfully');
      },
      onError: (error) => {
        console.error('Error changing password:', error);
        toast.error('Failed to change password');
      },
    });
  };

  // Revoke session
  const useRevokeSession = () => {
    return useMutation({
      mutationFn: async (sessionId: number) => {
        const token = await getToken();
        if (!token) throw new Error('No authentication token');
        return profileService.revokeSession(token, sessionId);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['profile', 'sessions'] });
        toast.success('Session revoked successfully');
      },
      onError: (error) => {
        console.error('Error revoking session:', error);
        toast.error('Failed to revoke session');
      },
    });
  };

  return {
    // Queries
    useOrders,
    useOrderDetails,
    useAddresses,
    usePaymentMethods,
    usePreferences,
    useSessions,
    // Mutations
    useUpdatePreferences,
    useDeleteAddress,
    useDeletePaymentMethod,
    useAddAddress,
    useUpdateAddress,
    useAddPaymentMethod,
    useUpdatePaymentMethod,
    useChangePassword,
    useRevokeSession,
  };
};
