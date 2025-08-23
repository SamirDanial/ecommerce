import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { useClerkAuth } from '../../hooks/useClerkAuth';
import axios from 'axios';

interface BusinessSetupDialogProps {
  isOpen: boolean;
  onComplete: () => void;
}

interface Currency {
  code: string;
  name: string;
  symbol: string;
}

const BusinessSetupDialog: React.FC<BusinessSetupDialogProps> = ({ isOpen, onComplete }) => {
  const { getToken } = useClerkAuth();
  const [businessName, setBusinessName] = useState('');
  const [baseCurrency, setBaseCurrency] = useState('');
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCurrencies, setIsLoadingCurrencies] = useState(true);

  // Create authenticated API instance
  const createAuthenticatedApi = async () => {
    const token = await getToken();
    if (!token) {
      throw new Error('No authentication token available');
    }
    
    return axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
  };

  // Fetch currencies when dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchCurrencies();
    }
  }, [isOpen]);

  const fetchCurrencies = async () => {
    try {
      setIsLoadingCurrencies(true);
      
      // Only show the 7 most important currencies as requested
      const importantCurrencies = [
        { code: 'USD', name: 'US Dollar', symbol: '$' },
        { code: 'EUR', name: 'Euro', symbol: '€' },
        { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
        { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
        { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨' },
        { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
        { code: 'GBP', name: 'British Pound', symbol: '£' }
      ];
      
      setCurrencies(importantCurrencies);
    } catch (error) {
      console.error('Error setting currencies:', error);
      // Fallback to essential currencies if something goes wrong
      setCurrencies([
        { code: 'USD', name: 'US Dollar', symbol: '$' },
        { code: 'EUR', name: 'Euro', symbol: '€' },
        { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨' }
      ]);
    } finally {
      setIsLoadingCurrencies(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!businessName.trim() || !baseCurrency) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Submitting business setup:', { businessName: businessName.trim(), baseCurrency });
      
      const api = await createAuthenticatedApi();
      
      const response = await api.post('/admin/currency/business-setup', {
        businessName: businessName.trim(),
        baseCurrency
      });

      console.log('API response:', response.data);

      if (response.data.success) {
        toast.success('Business configuration created successfully!');
        onComplete();
      } else {
        toast.error(response.data.error || 'Failed to create business configuration');
      }
    } catch (error: any) {
      console.error('Error creating business setup:', error);
      console.error('Error response:', error.response);
      
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please log in again.');
      } else if (error.response?.status === 404) {
        toast.error('API endpoint not found. Backend server may not be running.');
      } else if (error.response?.status === 500) {
        toast.error('Server error. Please check backend logs.');
      } else {
        const errorMessage = error.response?.data?.error || 'Failed to create business configuration';
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-red-600">⚠️ Business Setup Required</CardTitle>
          <CardDescription className="text-gray-700">
            <strong>This setup is mandatory and cannot be skipped.</strong> You must complete your business configuration before accessing the admin panel.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                type="text"
                placeholder="Enter your business name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="baseCurrency">Base Currency</Label>
              <Select value={baseCurrency} onValueChange={setBaseCurrency} required disabled={isLoadingCurrencies}>
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingCurrencies ? "Loading currencies..." : "Select your base currency"} />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(currencies) && currencies.length > 0 ? (
                    currencies.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.symbol} - {currency.name} ({currency.code})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="loading" disabled>
                      {isLoadingCurrencies ? "Loading currencies..." : "No currencies available"}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold" 
              disabled={isLoading}
            >
              {isLoading ? 'Completing Setup...' : 'Complete Business Setup'}
            </Button>
          </form>
          
          <div className="mt-4 text-sm text-muted-foreground text-center">
            <p className="text-red-600 font-medium mb-2">⚠️ This setup is mandatory and cannot be skipped.</p>
            <p>Your business configuration is required for:</p>
            <ul className="list-disc list-inside text-left mt-2 space-y-1">
              <li>Product pricing and currency management</li>
              <li>Tax and shipping calculations</li>
              <li>Order processing and payment handling</li>
              <li>All admin panel functionality</li>
            </ul>
            <p className="text-orange-600 font-medium mt-3">You must complete this setup to continue.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessSetupDialog;
