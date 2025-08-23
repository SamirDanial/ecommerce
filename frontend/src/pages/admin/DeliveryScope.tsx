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

interface LocalShippingRate {
  id: number;
  businessId: string;
  cityName: string;
  stateCode?: string;
  stateName?: string;
  shippingCost: number;
  deliveryDays: number;
  isActive: boolean;
}

interface LocalTaxRate {
  id: number;
  businessId: string;
  cityName?: string;
  stateCode?: string;
  stateName?: string;
  taxRate: number;
  taxName: string;
  isActive: boolean;
  isUniformTax: boolean;
}

const DeliveryScope: React.FC = () => {
  const { getToken } = useClerkAuth();
  const [activeTab, setActiveTab] = useState('scope');
  const [deliveryScope, setDeliveryScope] = useState<DeliveryScope | null>(null);
  const [localShippingRates, setLocalShippingRates] = useState<LocalShippingRate[]>([]);
  const [localTaxRates, setLocalTaxRates] = useState<LocalTaxRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScopeDialogOpen, setIsScopeDialogOpen] = useState(false);
  const [isShippingDialogOpen, setIsShippingDialogOpen] = useState(false);
  const [isTaxDialogOpen, setIsTaxDialogOpen] = useState(false);
  const [editingShippingRate, setEditingShippingRate] = useState<LocalShippingRate | null>(null);
  const [editingTaxRate, setEditingTaxRate] = useState<LocalTaxRate | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deletingRateId, setDeletingRateId] = useState<number | null>(null);
  const [deletingRateType, setDeletingRateType] = useState<'shipping' | 'tax' | null>(null);
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

  const [shippingFormData, setShippingFormData] = useState({
    cityName: '',
    stateCode: '',
    stateName: '',
    shippingCost: '',
    deliveryDays: '',
    isActive: true
  });

  const [taxFormData, setTaxFormData] = useState({
    cityName: '',
    stateCode: '',
    stateName: '',
    taxRate: '',
    taxName: '',
    isActive: true,
    isUniformTax: true
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
      
      const [scopeResponse, countriesResponse, currenciesResponse, shippingResponse, taxResponse] = await Promise.all([
        api.get('/admin/delivery-scope/scope'),
        api.get('/admin/delivery-scope/countries'),
        api.get('/admin/delivery-scope/currencies'),
        api.get('/admin/delivery-scope/local-shipping'),
        api.get('/admin/delivery-scope/local-tax')
      ]);

      setDeliveryScope(scopeResponse.data);
      setCountries(countriesResponse.data);
      setCurrencies(currenciesResponse.data);
      setLocalShippingRates(shippingResponse.data.rates || []);
      setLocalTaxRates(taxResponse.data.rates || []);
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

  // Handle shipping form submission
  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const api = await createAuthenticatedApi();
      
      const data = {
        cityName: shippingFormData.cityName,
        stateCode: shippingFormData.stateCode || null,
        stateName: shippingFormData.stateName || null,
        shippingCost: parseFloat(shippingFormData.shippingCost),
        deliveryDays: parseInt(shippingFormData.deliveryDays),
        isActive: shippingFormData.isActive
      };

      if (editingShippingRate) {
        await api.put(`/admin/delivery-scope/local-shipping/${editingShippingRate.id}`, data);
        toast.success('Local shipping rate updated successfully');
      } else {
        await api.post('/admin/delivery-scope/local-shipping', data);
        toast.success('Local shipping rate created successfully');
      }

      setIsShippingDialogOpen(false);
      setEditingShippingRate(null);
      resetShippingForm();
      fetchData();
    } catch (error: any) {
      console.error('Error saving shipping rate:', error);
      toast.error(error.response?.data?.error || 'Failed to save shipping rate');
    }
  };

  // Handle tax form submission
  const handleTaxSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent creating multiple uniform tax rates
    if (taxFormData.isUniformTax && !editingTaxRate) {
      const existingUniformTax = localTaxRates.find(rate => rate.isUniformTax);
      if (existingUniformTax) {
        toast.error('A uniform tax rate already exists. You can only have one country-wide tax rate.');
        return;
      }
    }
    
    try {
      const api = await createAuthenticatedApi();
      
      const data = {
        cityName: taxFormData.cityName || null,
        stateCode: taxFormData.stateCode || null,
        stateName: taxFormData.stateName || null,
        taxRate: parseFloat(taxFormData.taxRate),
        taxName: taxFormData.taxName,
        isActive: taxFormData.isActive,
        isUniformTax: taxFormData.isUniformTax
      };

      if (editingTaxRate) {
        await api.put(`/admin/delivery-scope/local-tax/${editingTaxRate.id}`, data);
        toast.success('Local tax rate updated successfully');
      } else {
        await api.post('/admin/delivery-scope/local-tax', data);
        toast.success('Local tax rate created successfully');
      }

      setIsTaxDialogOpen(false);
      setEditingTaxRate(null);
      resetTaxForm();
      fetchData();
    } catch (error: any) {
      console.error('Error saving tax rate:', error);
      toast.error(error.response?.data?.error || 'Failed to save tax rate');
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

  // Reset shipping form
  const resetShippingForm = () => {
    setShippingFormData({
      cityName: '',
      stateCode: '',
      stateName: '',
      shippingCost: '',
      deliveryDays: '',
      isActive: true
    });
  };

  // Reset tax form
  const resetTaxForm = () => {
    setTaxFormData({
      cityName: '',
      stateCode: '',
      stateName: '',
      taxRate: '',
      taxName: '',
      isActive: true,
      isUniformTax: true
    });
  };

  // Handle edit shipping rate
  const handleEditShipping = (rate: LocalShippingRate) => {
    setEditingShippingRate(rate);
    setShippingFormData({
      cityName: rate.cityName,
      stateCode: rate.stateCode || '',
      stateName: rate.stateName || '',
      shippingCost: rate.shippingCost.toString(),
      deliveryDays: rate.deliveryDays.toString(),
      isActive: rate.isActive
    });
    setIsShippingDialogOpen(true);
  };

  // Handle delete shipping rate
  const handleDeleteShipping = async (id: number) => {
    setDeletingRateId(id);
    setDeletingRateType('shipping');
    setIsDeleteConfirmOpen(true);
  };

  // Handle edit tax rate
  const handleEditTax = (rate: LocalTaxRate) => {
    setEditingTaxRate(rate);
    setTaxFormData({
      cityName: rate.cityName || '',
      stateCode: rate.stateCode || '',
      stateName: rate.stateName || '',
      taxRate: rate.taxRate.toString(),
      taxName: rate.taxName,
      isActive: rate.isActive,
      isUniformTax: rate.isUniformTax
    });
    setIsTaxDialogOpen(true);
  };

  // Handle delete tax rate
  const handleDeleteTax = async (id: number) => {
    setDeletingRateId(id);
    setDeletingRateType('tax');
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deletingRateId === null) return;

    try {
      const api = await createAuthenticatedApi();
      if (deletingRateType === 'shipping') {
        await api.delete(`/admin/delivery-scope/local-shipping/${deletingRateId}`);
        toast.success('Shipping rate deleted successfully');
      } else if (deletingRateType === 'tax') {
        await api.delete(`/admin/delivery-scope/local-tax/${deletingRateId}`);
        toast.success('Tax rate deleted successfully');
      }
      fetchData();
    } catch (error: any) {
      console.error('Error deleting rate:', error);
      toast.error('Failed to delete rate');
    } finally {
      setDeletingRateId(null);
      setIsDeleteConfirmOpen(false);
    }
  };

  const handleCancelDelete = () => {
    setDeletingRateId(null);
    setIsDeleteConfirmOpen(false);
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
                    {deliveryScope?.primaryCurrency && (
                      <span className="block text-sm text-muted-foreground mt-1">
                        All costs are in {deliveryScope.primaryCurrency}
                      </span>
                    )}
                  </CardDescription>
                </div>
                <Button onClick={() => {
                  setEditingShippingRate(null);
                  resetShippingForm();
                  setIsShippingDialogOpen(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Local Rate
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : localShippingRates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No local shipping rates configured
                </div>
              ) : (
                <div className="rounded-md border">
                  <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                      <thead className="[&_tr]:border-b">
                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                            Location
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                            Shipping Cost
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                            Delivery Days
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                            Status
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="[&_tr:last-child]:border-0">
                        {localShippingRates.map((rate) => (
                          <tr key={rate.id} className="border-b transition-colors hover:bg-muted/50">
                            <td className="p-4 align-middle">
                              <div>
                                <div className="font-medium">{rate.cityName}</div>
                                {rate.stateName && (
                                  <div className="text-sm text-muted-foreground">
                                    {rate.stateName}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="p-4 align-middle">
                              <Badge variant="secondary">
                                {deliveryScope?.primaryCurrency} {rate.shippingCost}
                              </Badge>
                            </td>
                            <td className="p-4 align-middle">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                {rate.deliveryDays} days
                              </div>
                            </td>
                            <td className="p-4 align-middle">
                              <Badge variant={rate.isActive ? "default" : "secondary"}>
                                {rate.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </td>
                            <td className="p-4 align-middle">
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditShipping(rate)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteShipping(rate.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
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
                    Manage tax rates for your business location. Choose between uniform country-wide rates or location-specific rates.
                  </CardDescription>
                </div>
                {!localTaxRates.some(rate => rate.isUniformTax) && (
                  <Button onClick={() => {
                    setEditingTaxRate(null);
                    resetTaxForm();
                    setIsTaxDialogOpen(true);
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Local Rate
                  </Button>
                )}
                {localTaxRates.some(rate => rate.isUniformTax) && (
                  <div className="text-sm text-muted-foreground bg-muted px-3 py-2 rounded-md">
                    ✓ Uniform tax rate already configured. You can add location-specific overrides if needed.
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : localTaxRates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No local tax rates configured
                </div>
              ) : (
                <div className="rounded-md border">
                  <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                      <thead className="[&_tr]:border-b">
                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                            Location
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                            Tax Rate
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                            Status
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="[&_tr:last-child]:border-0">
                        {localTaxRates.map((rate) => (
                          <tr key={rate.id} className="border-b transition-colors hover:bg-muted/50">
                            <td className="p-4 align-middle">
                              <div>
                                {rate.isUniformTax ? (
                                  <div className="font-medium text-green-600">Country-wide</div>
                                ) : (
                                  <>
                                    <div className="font-medium">{rate.cityName || 'All Cities'}</div>
                                    {rate.stateName && (
                                      <div className="text-sm text-muted-foreground">
                                        {rate.stateName}
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </td>
                            <td className="p-4 align-middle">
                              <Badge variant="secondary">
                                {rate.taxRate}%
                              </Badge>
                            </td>
                            <td className="p-4 align-middle">
                              <Badge variant={rate.isActive ? "default" : "secondary"}>
                                {rate.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </td>
                            <td className="p-4 align-middle">
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditTax(rate)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteTax(rate.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
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

      {/* Shipping Rate Dialog */}
      <Dialog open={isShippingDialogOpen} onOpenChange={setIsShippingDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingShippingRate ? 'Edit Local Shipping Rate' : 'Add Local Shipping Rate'}</DialogTitle>
            <DialogDescription>
              {editingShippingRate ? 'Modify the details of the local shipping rate.' : 'Set the details for a new local shipping rate.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleShippingSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cityName">City Name</Label>
              <Input
                id="cityName"
                value={shippingFormData.cityName}
                onChange={(e) => setShippingFormData(prev => ({ ...prev, cityName: e.target.value }))}
                placeholder="Enter city name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stateCode">State Code (Optional)</Label>
              <Input
                id="stateCode"
                value={shippingFormData.stateCode}
                onChange={(e) => setShippingFormData(prev => ({ ...prev, stateCode: e.target.value }))}
                placeholder="Enter state code (e.g., NY)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stateName">State Name (Optional)</Label>
              <Input
                id="stateName"
                value={shippingFormData.stateName}
                onChange={(e) => setShippingFormData(prev => ({ ...prev, stateName: e.target.value }))}
                placeholder="Enter state name (e.g., New York)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shippingCost">Shipping Cost</Label>
              <Input
                id="shippingCost"
                type="number"
                value={shippingFormData.shippingCost}
                onChange={(e) => setShippingFormData(prev => ({ ...prev, shippingCost: e.target.value }))}
                placeholder="Enter shipping cost"
                required
              />
              {deliveryScope?.primaryCurrency && (
                <p className="text-sm text-muted-foreground">
                  Cost will be in {deliveryScope.primaryCurrency}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliveryDays">Delivery Days</Label>
              <Input
                id="deliveryDays"
                type="number"
                value={shippingFormData.deliveryDays}
                onChange={(e) => setShippingFormData(prev => ({ ...prev, deliveryDays: e.target.value }))}
                placeholder="Enter delivery days"
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={shippingFormData.isActive}
                onCheckedChange={(checked: boolean) => setShippingFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="isActive">Is Active</Label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsShippingDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingShippingRate ? 'Update Rate' : 'Add Rate'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Tax Rate Dialog */}
      <Dialog open={isTaxDialogOpen} onOpenChange={setIsTaxDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingTaxRate ? 'Edit Local Tax Rate' : 'Add Local Tax Rate'}</DialogTitle>
            <DialogDescription>
              {editingTaxRate ? 'Modify the details of the local tax rate.' : 'Set the details for a new local tax rate.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleTaxSubmit} className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Switch
                id="isUniformTax"
                checked={taxFormData.isUniformTax}
                onCheckedChange={(checked: boolean) => setTaxFormData(prev => ({ ...prev, isUniformTax: checked }))}
              />
              <Label htmlFor="isUniformTax">Tax is uniform across all locations</Label>
            </div>

            {!taxFormData.isUniformTax && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="taxCityName">City Name (Optional)</Label>
                  <Input
                    id="taxCityName"
                    value={taxFormData.cityName}
                    onChange={(e) => setTaxFormData(prev => ({ ...prev, cityName: e.target.value }))}
                    placeholder="Enter city name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxStateCode">State Code (Optional)</Label>
                  <Input
                    id="taxStateCode"
                    value={taxFormData.stateCode}
                    onChange={(e) => setTaxFormData(prev => ({ ...prev, stateCode: e.target.value }))}
                    placeholder="Enter state code (e.g., NY)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxStateName">State Name (Optional)</Label>
                  <Input
                    id="taxStateName"
                    value={taxFormData.stateName}
                    onChange={(e) => setTaxFormData(prev => ({ ...prev, stateName: e.target.value }))}
                    placeholder="Enter state name (e.g., New York)"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input
                id="taxRate"
                type="number"
                value={taxFormData.taxRate}
                onChange={(e) => setTaxFormData(prev => ({ ...prev, taxRate: e.target.value }))}
                placeholder="Enter tax rate"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxName">Tax Name</Label>
              <Input
                id="taxName"
                value={taxFormData.taxName}
                placeholder="Enter tax name (e.g., VAT, Sales Tax, GST)"
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActiveTax"
                checked={taxFormData.isActive}
                onCheckedChange={(checked: boolean) => setTaxFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="isActiveTax">Is Active</Label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsTaxDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingTaxRate ? 'Update Rate' : 'Add Rate'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this rate? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleCancelDelete}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeliveryScope;
