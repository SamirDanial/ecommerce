import { ShippingAddress } from '../stores/cartStore';
import api from '../lib/axios';

export interface SavedAddress extends ShippingAddress {
  id: string;
  userId: string;
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressRequest {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface UpdateAddressRequest extends CreateAddressRequest {
  id: string;
}

// Get all saved addresses for the current user
export const getSavedAddresses = async (token?: string): Promise<SavedAddress[]> => {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.get('/profile/addresses', { headers });
    return response.data.map((address: any) => transformBackendAddress(address));
  } catch (error) {
    console.error('Failed to fetch saved addresses:', error);
    return [];
  }
};

// Create a new address
export const createAddress = async (addressData: CreateAddressRequest, token?: string): Promise<SavedAddress | null> => {
  try {
    // Transform the address data to match backend schema
    const backendAddressData = {
      type: 'SHIPPING' as const,
      firstName: addressData.firstName,
      lastName: addressData.lastName,
      address1: addressData.address,
      address2: '',
      city: addressData.city,
      state: addressData.state,
      postalCode: addressData.postalCode,
      country: addressData.country,
      phone: addressData.phone,
      isDefault: addressData.isDefault || false
    };

    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.post('/profile/addresses', backendAddressData, { headers });
    return response.data.address;
  } catch (error) {
    console.error('Failed to create address:', error);
    throw error;
  }
};

// Update an existing address
export const updateAddress = async (addressData: UpdateAddressRequest, token?: string): Promise<SavedAddress | null> => {
  try {
    // Transform the address data to match backend schema
    const backendAddressData = {
      type: 'SHIPPING' as const,
      firstName: addressData.firstName,
      lastName: addressData.lastName,
      address1: addressData.address,
      address2: '',
      city: addressData.city,
      state: addressData.state,
      postalCode: addressData.postalCode,
      country: addressData.country,
      phone: addressData.phone,
      isDefault: addressData.isDefault || false
    };

    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.put(`/profile/addresses/${addressData.id}`, backendAddressData, { headers });
    return response.data.address;
  } catch (error) {
    console.error('Failed to update address:', error);
    throw error;
  }
};

// Delete an address
export const deleteAddress = async (addressId: string, token?: string): Promise<boolean> => {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    await api.delete(`/profile/addresses/${addressId}`, { headers });
    return true;
  } catch (error) {
    console.error('Failed to delete address:', error);
    throw error;
  }
};

// Get default address
export const getDefaultAddress = async (): Promise<SavedAddress | null> => {
  try {
    const addresses = await getSavedAddresses();
    return addresses.find(addr => addr.isDefault) || null;
  } catch (error) {
    console.error('Failed to fetch default address:', error);
    return null;
  }
};

// Transform backend address to frontend format
export const transformBackendAddress = (backendAddress: any): SavedAddress => {
  return {
    id: backendAddress.id.toString(),
    userId: backendAddress.userId.toString(),
    firstName: backendAddress.firstName,
    lastName: backendAddress.lastName,
    phone: backendAddress.phone,
    address: backendAddress.address1,
    city: backendAddress.city,
    state: backendAddress.state,
    postalCode: backendAddress.postalCode,
    country: backendAddress.country,
    isDefault: backendAddress.isDefault,
    createdAt: backendAddress.createdAt,
    updatedAt: backendAddress.updatedAt
  };
};

// Mock data for development (remove in production)
export const getMockAddresses = (): SavedAddress[] => {
  return [
    {
      id: '1',
      userId: 'user123',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1-555-0123',
      address: '123 Main Street',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'US',
      isDefault: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      userId: 'user123',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1-555-0123',
      address: '456 Business Ave',
      city: 'Los Angeles',
      state: 'CA',
      postalCode: '90210',
      country: 'US',
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '3',
      userId: 'user123',
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '+1-555-0456',
      address: '789 Oak Drive',
      city: 'Chicago',
      state: 'IL',
      postalCode: '60601',
      country: 'US',
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
};

// Mock operations for development
export const mockCreateAddress = async (addressData: CreateAddressRequest): Promise<SavedAddress> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const newAddress: SavedAddress = {
    id: Date.now().toString(),
    userId: 'user123',
    ...addressData,
    isDefault: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  return newAddress;
};

export const mockUpdateAddress = async (addressData: UpdateAddressRequest): Promise<SavedAddress> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const updatedAddress: SavedAddress = {
    ...addressData,
    userId: 'user123',
    updatedAt: new Date().toISOString()
  } as SavedAddress;
  
  return updatedAddress;
};

export const mockDeleteAddress = async (addressId: string): Promise<boolean> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return true;
};
