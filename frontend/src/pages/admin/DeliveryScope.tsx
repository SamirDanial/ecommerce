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
import { Globe, Truck, DollarSign, MapPin, Plus, Edit, Trash2, Building, Package, Calculator, Search } from 'lucide-react';
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
  applyTaxesAtCheckout: boolean;
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
  const [localShippingRates, setLocalShippingRates] = useState<LocalShippingRate[] | null>(null);
  const [localTaxRates, setLocalTaxRates] = useState<LocalTaxRate[] | null>(null);
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

  // Filter states
  const [shippingSearchTerm, setShippingSearchTerm] = useState('');
  const [shippingStatusFilter, setShippingStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [taxSearchTerm, setTaxSearchTerm] = useState('');
  const [taxStatusFilter, setTaxStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');



  // Form data
  const [scopeFormData, setScopeFormData] = useState({
    businessName: '',
    hasInternationalDelivery: false,
    primaryCountryCode: '',
    primaryCountryName: '',
    primaryCurrency: '',
    applyTaxesAtCheckout: true
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
    return axios.create({
      baseURL: 'http://localhost:5000/api',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  };

  // Fetch data
  const fetchData = async () => {
    try {
      const api = await createAuthenticatedApi();
      const [scopeRes, shippingRes, taxRes, countriesRes, currenciesRes] = await Promise.all([
        api.get('/admin/delivery-scope/scope'),
        api.get('/admin/delivery-scope/local-shipping'),
        api.get('/admin/delivery-scope/local-tax'),
        api.get('/admin/delivery-scope/countries'),
        api.get('/admin/delivery-scope/currencies')
      ]);

      setDeliveryScope(scopeRes.data);
      setLocalShippingRates(shippingRes.data?.rates || []);
      setLocalTaxRates(taxRes.data?.rates || []);
      setCountries(countriesRes.data || []);
      setCurrencies(currenciesRes.data || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
      // Set empty arrays on error to prevent undefined errors
      setLocalShippingRates([]);
      setLocalTaxRates([]);
      setCountries([]);
      setCurrencies([]);
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
        primaryCurrency: scopeFormData.primaryCurrency,
        applyTaxesAtCheckout: scopeFormData.applyTaxesAtCheckout
      };

      if (deliveryScope) {
        await api.put('/admin/delivery-scope/scope', data);
        toast.success('Delivery scope updated successfully');
      } else {
        await api.post('/admin/delivery-scope/scope', data);
        toast.success('Delivery scope created successfully');
      }

      setIsScopeDialogOpen(false);
      fetchData();
    } catch (error: any) {
      console.error('Error saving scope:', error);
      toast.error(error.response?.data?.error || 'Failed to save scope');
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
      const existingUniformTax = localTaxRates?.find(rate => rate.isUniformTax);
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

  // Handle delete rate
  const handleDeleteRate = (id: number, type: 'shipping' | 'tax') => {
    setDeletingRateId(id);
    setDeletingRateType(type);
    setIsDeleteConfirmOpen(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!deletingRateId || !deletingRateType) return;

    try {
      const api = await createAuthenticatedApi();
      
      if (deletingRateType === 'shipping') {
        await api.delete(`/admin/delivery-scope/local-shipping/${deletingRateId}`);
        toast.success('Shipping rate deleted successfully');
      } else {
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

  // Calculate stats with additional safety checks
  const stats = {
    totalShippingRates: Array.isArray(localShippingRates) ? localShippingRates.length : 0,
    activeShippingRates: Array.isArray(localShippingRates) ? localShippingRates.filter(rate => rate?.isActive).length : 0,
    totalTaxRates: Array.isArray(localTaxRates) ? localTaxRates.length : 0,
    activeTaxRates: Array.isArray(localTaxRates) ? localTaxRates.filter(rate => rate?.isActive).length : 0,
    hasInternationalDelivery: deliveryScope?.hasInternationalDelivery || false,
    primaryCountry: deliveryScope?.primaryCountryName || 'Not Set'
  };

  // Filter functions
  const getFilteredShippingRates = () => {
    if (!Array.isArray(localShippingRates)) return [];
    
    return localShippingRates.filter(rate => {
      const matchesSearch = !shippingSearchTerm || 
        rate.cityName?.toLowerCase().includes(shippingSearchTerm.toLowerCase()) ||
        rate.stateName?.toLowerCase().includes(shippingSearchTerm.toLowerCase());
      
      const matchesStatus = shippingStatusFilter === 'all' || 
        (shippingStatusFilter === 'active' && rate.isActive) ||
        (shippingStatusFilter === 'inactive' && !rate.isActive);
      
      return matchesSearch && matchesStatus;
    });
  };

  const getFilteredTaxRates = () => {
    if (!Array.isArray(localTaxRates)) return [];
    
    return localTaxRates.filter(rate => {
      const matchesSearch = !taxSearchTerm || 
        rate.cityName?.toLowerCase().includes(taxSearchTerm.toLowerCase()) ||
        rate.stateName?.toLowerCase().includes(taxSearchTerm.toLowerCase()) ||
        rate.taxName?.toLowerCase().includes(taxSearchTerm.toLowerCase());
      
      const matchesStatus = taxStatusFilter === 'all' || 
        (taxStatusFilter === 'active' && rate.isActive) ||
        (taxStatusFilter === 'inactive' && !rate.isActive);
      
      return matchesSearch && matchesStatus;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-1 sm:p-3 md:p-6">
      <div className="w-full space-y-3 sm:space-y-6 md:space-y-8">
        {/* Enhanced Header with Better Glassmorphism */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-green-600/20 to-purple-600/20 rounded-xl sm:rounded-2xl md:rounded-3xl blur-3xl group-hover:blur-2xl transition-all duration-700"></div>
          <div className="relative bg-white/80 backdrop-blur-2xl rounded-xl sm:rounded-2xl md:rounded-3xl p-2 sm:p-4 md:p-8 border border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-500">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="p-3 bg-gradient-to-br from-blue-500 via-green-600 to-purple-600 rounded-2xl shadow-lg">
                      <Truck className="w-7 h-7 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 via-green-600 to-purple-600 bg-clip-text text-transparent">
                      Delivery Scope Management
                    </h1>
                    <p className="text-slate-600 text-sm sm:text-base font-medium">Configure your business delivery scope and local rates with style</p>
                  </div>
                </div>
              </div>
              
              
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600 font-medium">Primary Country</p>
                <p className="text-lg font-bold text-slate-800">{stats.primaryCountry}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600 font-medium">Shipping Rates</p>
                <p className="text-lg font-bold text-slate-800">{stats.totalShippingRates} ({stats.activeShippingRates} active)</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                <Calculator className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600 font-medium">Tax Rates</p>
                <p className="text-lg font-bold text-slate-800">{stats.totalTaxRates} ({stats.activeTaxRates} active)</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600 font-medium">International</p>
                <p className="text-lg font-bold text-slate-800">{stats.hasInternationalDelivery ? 'Enabled' : 'Disabled'}</p>
              </div>
            </div>
          </div>
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
            <Card className="bg-white/80 backdrop-blur-xl border border-white/30 shadow-lg">
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
                        primaryCurrency: deliveryScope.primaryCurrency,
                        applyTaxesAtCheckout: deliveryScope.applyTaxesAtCheckout
                      });
                    }
                    setIsScopeDialogOpen(true);
                  }} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Scope
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : deliveryScope ? (
                  <div className="space-y-6">
                    {/* Basic Info Section */}
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
                    
                    {/* Settings Section */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">International Delivery</Label>
                          <div className="flex items-center space-x-2 mt-2">
                            <Switch checked={deliveryScope.hasInternationalDelivery} disabled />
                            <Badge variant={deliveryScope.hasInternationalDelivery ? "default" : "secondary"}>
                              {deliveryScope.hasInternationalDelivery ? "Enabled" : "Disabled"}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Tax Application</Label>
                          <div className="flex items-center space-x-2 mt-2">
                            <Switch checked={deliveryScope.applyTaxesAtCheckout} disabled />
                            <Badge variant={deliveryScope.applyTaxesAtCheckout ? "default" : "secondary"}>
                              {deliveryScope.applyTaxesAtCheckout ? "Apply at Checkout" : "Included in Prices"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                        <div className="mt-2">
                          <Badge variant={deliveryScope.isActive ? "default" : "secondary"}>
                            {deliveryScope.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
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
            <Card className="bg-white/80 backdrop-blur-xl border border-white/30 shadow-lg">
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
                  }} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Local Rate
                  </Button>
                </div>
              </CardHeader>
              
              {/* Filter Controls */}
              <div className="px-6 pb-4 border-b border-white/20">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Search Input */}
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        placeholder="Search by city or state..."
                        value={shippingSearchTerm}
                        onChange={(e) => setShippingSearchTerm(e.target.value)}
                        className="pl-10 bg-white/60 backdrop-blur-sm border-white/30 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  
                  {/* Status Filter */}
                  <div className="flex-shrink-0">
                    <Select value={shippingStatusFilter} onValueChange={(value) => {
                      setShippingStatusFilter(value as 'all' | 'active' | 'inactive');
                    }}>
                      <SelectTrigger className="w-40 bg-white/60 backdrop-blur-sm border-white/30">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent className="z-50">
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active Only</SelectItem>
                        <SelectItem value="inactive">Inactive Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Results Count */}
                <div className="mt-3 text-sm text-slate-600">
                  Showing {getFilteredShippingRates().length} of {Array.isArray(localShippingRates) ? localShippingRates.length : 0} shipping rates
                </div>
              </div>
              
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : getFilteredShippingRates().length > 0 ? (
                  <div className="space-y-3">
                    {getFilteredShippingRates().map((rate) => (
                      <div key={rate.id} className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-sm hover:shadow-md transition-all duration-200">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <MapPin className="w-4 h-4 text-blue-600" />
                              <div>
                                <p className="font-medium text-slate-800">
                                  {rate.cityName}
                                  {rate.stateName && `, ${rate.stateName}`}
                                </p>
                                <p className="text-sm text-slate-600">
                                  {rate.shippingCost} {deliveryScope?.primaryCurrency} • {rate.deliveryDays} days
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={rate.isActive ? "default" : "secondary"}>
                              {rate.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditShipping(rate)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteRate(rate.id, 'shipping')}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No local shipping rates configured
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Local Tax Tab */}
          <TabsContent value="tax" className="space-y-4">
            <Card className="bg-white/80 backdrop-blur-xl border border-white/30 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Local Tax Rates</CardTitle>
                    <CardDescription>
                      Manage tax rates for specific cities and states
                    </CardDescription>
                  </div>
                  <Button onClick={() => {
                    setEditingTaxRate(null);
                    resetTaxForm();
                    setIsTaxDialogOpen(true);
                  }} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Tax Rate
                  </Button>
                </div>
              </CardHeader>
              
              {/* Filter Controls */}
              <div className="px-6 pb-4 border-b border-white/20">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Search Input */}
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        placeholder="Search by city, state, or tax name..."
                        value={taxSearchTerm}
                        onChange={(e) => setTaxSearchTerm(e.target.value)}
                        className="pl-10 bg-white/60 backdrop-blur-sm border-white/30 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  
                  {/* Status Filter */}
                  <div className="flex-shrink-0">
                    <Select value={taxStatusFilter} onValueChange={(value) => {
                      setTaxStatusFilter(value as 'all' | 'active' | 'inactive');
                    }}>
                      <SelectTrigger className="w-40 bg-white/60 backdrop-blur-sm border-white/30">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent className="z-50">
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active Only</SelectItem>
                        <SelectItem value="inactive">Inactive Only</SelectItem>
                      </SelectContent>
                    </Select>
                    {/* Debug button - remove after testing */}
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setTaxStatusFilter('active')}
                      className="ml-2"
                    >
                      Test Active
                    </Button>
                  </div>
                </div>
                
                {/* Results Count */}
                <div className="mt-3 text-sm text-slate-600">
                  Showing {getFilteredTaxRates().length} of {Array.isArray(localTaxRates) ? localTaxRates.length : 0} tax rates
                </div>
              </div>
              
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : getFilteredTaxRates().length > 0 ? (
                  <div className="space-y-3">
                    {getFilteredTaxRates().map((rate) => (
                      <div key={rate.id} className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-sm hover:shadow-md transition-all duration-200">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <DollarSign className="w-4 h-4 text-green-600" />
                              <div>
                                <p className="font-medium text-slate-800">
                                  {rate.taxName}
                                  {rate.cityName && ` - ${rate.cityName}`}
                                  {rate.stateName && `, ${rate.stateName}`}
                                </p>
                                <p className="text-sm text-slate-600">
                                  {rate.taxRate}% {rate.isUniformTax && '(Uniform)'}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={rate.isActive ? "default" : "secondary"}>
                              {rate.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditTax(rate)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteRate(rate.id, 'tax')}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No local tax rates configured
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>


      </div>

      {/* Scope Dialog */}
      <Dialog open={isScopeDialogOpen} onOpenChange={setIsScopeDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Configure Delivery Scope</DialogTitle>
            <DialogDescription>
              Set up your business delivery capabilities and primary location
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleScopeSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                value={scopeFormData.businessName}
                onChange={(e) => setScopeFormData(prev => ({ ...prev, businessName: e.target.value }))}
                placeholder="Enter business name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="primaryCountry">Primary Country</Label>
              <Select value={scopeFormData.primaryCountryCode} onValueChange={handleCountrySelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select primary country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
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
                  <SelectValue placeholder="Select primary currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.name}
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

            <div className="flex items-center space-x-2">
              <Switch
                id="applyTaxesAtCheckout"
                checked={scopeFormData.applyTaxesAtCheckout}
                onCheckedChange={(checked: boolean) => setScopeFormData(prev => ({ ...prev, applyTaxesAtCheckout: checked }))}
              />
              <Label htmlFor="applyTaxesAtCheckout">Apply Taxes at Checkout</Label>
            </div>
            <div className="text-sm text-muted-foreground ml-6">
              When disabled, taxes are assumed to be included in product prices
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
                {deliveryScope ? 'Update Scope' : 'Create Scope'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Shipping Dialog */}
      <Dialog open={isShippingDialogOpen} onOpenChange={setIsShippingDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingShippingRate ? 'Edit Shipping Rate' : 'Add Local Shipping Rate'}
            </DialogTitle>
            <DialogDescription>
              Configure shipping cost and delivery time for a specific location
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
                id="isActiveShipping"
                checked={shippingFormData.isActive}
                onCheckedChange={(checked: boolean) => setShippingFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="isActiveShipping">Is Active</Label>
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

      {/* Tax Dialog */}
      <Dialog open={isTaxDialogOpen} onOpenChange={setIsTaxDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingTaxRate ? 'Edit Tax Rate' : 'Add Local Tax Rate'}
            </DialogTitle>
            <DialogDescription>
              Configure tax rate for a specific location
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleTaxSubmit} className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="isUniformTax"
                checked={taxFormData.isUniformTax}
                onCheckedChange={(checked: boolean) => setTaxFormData(prev => ({ ...prev, isUniformTax: checked }))}
              />
              <Label htmlFor="isUniformTax">Uniform Tax (Country-wide)</Label>
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
                onChange={(e) => setTaxFormData(prev => ({ ...prev, taxName: e.target.value }))}
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
