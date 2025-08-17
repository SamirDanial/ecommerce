import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { MapPin, Save, X, User, Phone, Home, MapPin as MapPinIcon, Navigation } from 'lucide-react';
import { ShippingAddress } from '../stores/cartStore';
import { CreateAddressRequest } from '../services/addressService';
import { useConfig } from '../hooks/useConfig';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from './ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface AddressFormSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: CreateAddressRequest) => void;
  address?: ShippingAddress | null;
  isEditing?: boolean;
}

const AddressFormSidebar: React.FC<AddressFormSidebarProps> = ({
  isOpen,
  onClose,
  onSave,
  address,
  isEditing = false
}) => {
  const { useCountries } = useConfig();
  const { data: countries, isLoading: countriesLoading, error: countriesError } = useCountries();
  const [formData, setFormData] = useState<CreateAddressRequest>({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    isDefault: false
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CreateAddressRequest, string>>>({});

  useEffect(() => {
    if (address) {
      setFormData({
        firstName: address.firstName,
        lastName: address.lastName,
        phone: address.phone,
        address: address.address,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
        isDefault: false
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        isDefault: false
      });
    }
    setErrors({});
  }, [address, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateAddressRequest, string>> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal code is required';
    if (!formData.country.trim()) newErrors.country = 'Country is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  const handleInputChange = (field: keyof CreateAddressRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const getInputClassName = (field: keyof CreateAddressRequest) => {
    const baseClasses = "w-full h-12 px-4 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20";
    const errorClasses = errors[field] ? 'border-red-300 bg-red-50 focus:border-red-500' : 'border-gray-200 bg-white hover:border-gray-300 focus:border-blue-500';
    return `${baseClasses} ${errorClasses}`;
  };



  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-lg lg:max-w-xl bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 shadow-2xl h-full max-h-screen border-l border-gray-200/50"
      >
        <div className="flex flex-col h-full">
          {/* Enhanced Header */}
          <SheetHeader className="flex-shrink-0 border-b border-gray-200/50 pb-6 bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-b-2xl">
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center shadow-lg">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <SheetTitle className="text-2xl font-bold text-gray-900">
                    {isEditing ? 'Edit Address' : 'Add New Address'}
                  </SheetTitle>
                  <p className="text-gray-600 text-sm mt-1">
                    {isEditing ? 'Update your shipping information' : 'Enter your shipping details'}
                  </p>
                </div>
              </div>
              {isEditing && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1 text-sm font-medium">
                  Editing
                </Badge>
              )}
            </div>
          </SheetHeader>

          {/* Enhanced Form Content */}
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto p-6 space-y-8 min-h-0 scrollbar-hide">
              {/* Enhanced Personal Information Section */}
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-2xl p-6 border border-blue-100/50">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    Personal Information
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label htmlFor="firstName" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        First Name *
                      </Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className={getInputClassName('firstName')}
                        placeholder="Enter first name"
                      />
                      {errors.firstName && (
                        <p className="text-red-500 text-sm flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                          {errors.firstName}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="lastName" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        Last Name *
                      </Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className={getInputClassName('lastName')}
                        placeholder="Enter last name"
                      />
                      {errors.lastName && (
                        <p className="text-red-500 text-sm flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                          {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <div className="space-y-3">
                      <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                          <Phone className="h-4 w-4 text-green-600" />
                        </div>
                        Phone Number *
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className={getInputClassName('phone')}
                        placeholder="Enter phone number"
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-sm flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                          {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Enhanced Address Information Section */}
                <div className="bg-gradient-to-r from-green-50/50 to-emerald-50/50 rounded-2xl p-6 border border-green-100/50">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                      <Home className="h-5 w-5 text-green-600" />
                    </div>
                    Address Information
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="address" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                          <MapPinIcon className="h-4 w-4 text-purple-600" />
                        </div>
                        Street Address *
                      </Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className={getInputClassName('address')}
                        placeholder="Enter street address"
                      />
                      {errors.address && (
                        <p className="text-red-500 text-sm flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                          {errors.address}
                        </p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <Label htmlFor="city" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          City *
                        </Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          className={getInputClassName('city')}
                          placeholder="Enter city"
                        />
                        {errors.city && (
                          <p className="text-red-500 text-sm flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                            {errors.city}
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <Label htmlFor="state" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          State *
                        </Label>
                        <Input
                          id="state"
                          value={formData.state}
                          onChange={(e) => handleInputChange('state', e.target.value)}
                          className={getInputClassName('state')}
                          placeholder="Enter state"
                        />
                        {errors.state && (
                          <p className="text-red-500 text-sm flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                            {errors.state}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <Label htmlFor="postalCode" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          Postal Code *
                        </Label>
                        <Input
                          id="postalCode"
                          value={formData.postalCode}
                          onChange={(e) => handleInputChange('postalCode', e.target.value)}
                          className={getInputClassName('postalCode')}
                          placeholder="Enter postal code"
                        />
                        {errors.postalCode && (
                          <p className="text-red-500 text-sm flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                            {errors.postalCode}
                          </p>
                        )}
                      </div>
                      
                                             <div className="space-y-3">
                         <Label htmlFor="country" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                           <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                           Country *
                         </Label>
                        {countriesLoading ? (
                          <div className="h-12 border-2 border-gray-200 rounded-xl flex items-center justify-center bg-gray-50">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                          </div>
                        ) : countriesError ? (
                          <div className="h-12 border-2 border-red-200 rounded-xl flex items-center justify-center bg-red-50 text-red-600 text-sm">
                            Failed to load countries
                          </div>
                        ) : (
                          <Select
                            value={formData.country}
                            onValueChange={(value) => handleInputChange('country', value)}
                          >
                            <SelectTrigger className={getInputClassName('country')}>
                              <SelectValue placeholder="Select Country" />
                            </SelectTrigger>
                            <SelectContent>
                              {countries?.map((country) => (
                                <SelectItem key={country.code} value={country.code}>
                                  {country.flagEmoji} {country.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        {errors.country && (
                          <p className="text-red-500 text-sm flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                            {errors.country}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Footer with Action Buttons */}
            <SheetFooter className="flex-shrink-0 border-t border-gray-200/50 p-6 bg-gradient-to-r from-gray-50/50 to-blue-50/50">
              <div className="w-full space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    type="submit" 
                    className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 text-white font-semibold"
                  >
                    <Save className="h-5 w-5 mr-2" />
                    {isEditing ? 'Update Address' : 'Save Address'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={onClose} 
                    className="flex-1 h-12 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold"
                  >
                    <X className="h-5 w-5 mr-2" />
                    Cancel
                  </Button>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Navigation className="h-3 w-3 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-800 font-medium mb-1">Shipping Address</p>
                      <p className="text-xs text-blue-700">
                        This address will be used for shipping your orders. All fields marked with * are required.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </SheetFooter>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AddressFormSidebar;
