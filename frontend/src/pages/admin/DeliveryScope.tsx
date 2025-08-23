import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Globe, Truck, DollarSign, MapPin, Plus, Edit, Trash2, RefreshCw, Building } from 'lucide-react';
import { toast } from 'sonner';
import { useClerkAuth } from '../../hooks/useClerkAuth';
import axios from 'axios';

interface DeliveryScope {
  id: number;
  businessId: string;
  businessName: string;
  hasInternationalDelivery: boolean;
  primaryCountryCode: string;
  primaryCountryName: string;
  primaryCurrency: string;
  isActive: boolean;
}

interface Country {
  code: string;
  name: string;
}

interface Currency {
  code: string;
  name: string;
}

const DeliveryScope: React.FC = () => {
  const { getToken } = useClerkAuth();
  const [activeTab, setActiveTab] = useState('scope');
  const [deliveryScope, setDeliveryScope] = useState<DeliveryScope | null>(null);
  const [loading, setLoading] = useState(true);
  const [isScopeDialogOpen, setIsScopeDialogOpen] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);

  // Form data
  const [scopeFormData, setScopeFormData] = useState({
    businessName: '',
    hasInternationalDelivery: false,
    primaryCountryCode: '',
    primaryCountryName: '',
    primaryCurrency: ''
  });

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

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      
      const api = await createAuthenticatedApi();
      
      const [scopeResponse, countriesResponse, currenciesResponse] = await Promise.all([
        api.get('/admin/delivery-scope/scope'),
        api.get('/admin/delivery-scope/countries'),
        api.get('/admin/delivery-scope/currencies')
      ]);

      setDeliveryScope(scopeResponse.data);
      setCountries(countriesResponse.data);
      setCurrencies(currenciesResponse.data);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please log in again.');
      } else {
        toast.error(error.response?.data?.error || 'Failed to fetch data');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle scope form submission
  const handleScopeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const api = await createAuthenticatedApi();
      
      const data = {
        businessName: scopeFormData.businessName,
        hasInternationalDelivery: scopeFormData.hasInternationalDelivery,
        primaryCountryCode: scopeFormData.primaryCountryCode,
        primaryCountryName: scopeFormData.primaryCountryName,
        primaryCurrency: scopeFormData.primaryCurrency
      };

      await api.put('/admin/delivery-scope/scope', data);
      toast.success('Delivery scope updated successfully');
      setIsScopeDialogOpen(false);
      fetchData();
    } catch (error: any) {
      console.error('Error updating scope:', error);
      toast.error(error.response?.data?.error || 'Failed to update scope');
    }
  };

  // Handle country selection
  const handleCountrySelect = (countryCode: string) => {
    const country = countries.find((c: Country) => c.code === countryCode);
    setScopeFormData(prev => ({
      ...prev,
      primaryCountryCode: countryCode,
      primaryCountryName: country?.name || ''
    }));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Delivery Scope Management</h1>
          <p className="text-muted-foreground">
            Configure your business delivery scope and local rates
          </p>
        </div>
        <Button onClick={fetchData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="scope" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Business Scope
          </TabsTrigger>
          <TabsTrigger value="shipping" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Local Shipping
          </TabsTrigger>
          <TabsTrigger value="tax" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Local Tax
          </TabsTrigger>
        </TabsList>

        {/* Business Scope Tab */}
        <TabsContent value="scope" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Business Delivery Scope</CardTitle>
                  <CardDescription>
                    Configure your business delivery capabilities and primary location
                  </CardDescription>
                </div>
                <Button onClick={() => {
                  if (deliveryScope) {
                    setScopeFormData({
                      businessName: deliveryScope.businessName,
                      hasInternationalDelivery: deliveryScope.hasInternationalDelivery,
                      primaryCountryCode: deliveryScope.primaryCountryCode,
                      primaryCountryName: deliveryScope.primaryCountryName,
                      primaryCurrency: deliveryScope.primaryCurrency
                    });
                  }
                  setIsScopeDialogOpen(true);
                }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Scope
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : deliveryScope ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Business Name</Label>
                      <p className="text-lg font-semibold">{deliveryScope.businessName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Primary Country</Label>
                      <p className="text-lg font-semibold">{deliveryScope.primaryCountryName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Primary Currency</Label>
                      <p className="text-lg font-semibold">{deliveryScope.primaryCurrency}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">International Delivery</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Switch checked={deliveryScope.hasInternationalDelivery} disabled />
                        <Badge variant={deliveryScope.hasInternationalDelivery ? "default" : "secondary"}>
                          {deliveryScope.hasInternationalDelivery ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                      <Badge variant={deliveryScope.isActive ? "default" : "secondary"}>
                        {deliveryScope.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No delivery scope configured
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Local Shipping Tab */}
        <TabsContent value="shipping" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Local Shipping Rates</CardTitle>
                  <CardDescription>
                    Manage shipping costs and delivery times for specific cities and states
                  </CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Local Rate
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Local shipping management coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Local Tax Tab */}
        <TabsContent value="tax" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Local Tax Rates</CardTitle>
                  <CardDescription>
                    Manage tax rates for specific cities and states
                  </CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Local Rate
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Local tax management coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Scope Configuration Dialog */}
      <Dialog open={isScopeDialogOpen} onOpenChange={setIsScopeDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Configure Delivery Scope</DialogTitle>
            <DialogDescription>
              Set your business delivery capabilities and primary location
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleScopeSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                value={scopeFormData.businessName}
                onChange={(e) => setScopeFormData(prev => ({ ...prev, businessName: e.target.value }))}
                placeholder="Enter your business name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="primaryCountry">Primary Country</Label>
              <Select value={scopeFormData.primaryCountryCode} onValueChange={handleCountrySelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your primary country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country: Country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="primaryCurrency">Primary Currency</Label>
              <Select value={scopeFormData.primaryCurrency} onValueChange={(value) => setScopeFormData(prev => ({ ...prev, primaryCurrency: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your primary currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency: Currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.name} ({currency.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="hasInternationalDelivery"
                checked={scopeFormData.hasInternationalDelivery}
                onCheckedChange={(checked: boolean) => setScopeFormData(prev => ({ ...prev, hasInternationalDelivery: checked }))}
              />
              <Label htmlFor="hasInternationalDelivery">Enable International Delivery</Label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsScopeDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Save Configuration
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeliveryScope;
