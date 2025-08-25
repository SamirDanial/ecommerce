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
import { Search, Edit, Globe, Truck, DollarSign, Calendar, MapPin, RefreshCw, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useClerkAuth } from '../../hooks/useClerkAuth';
import axios from 'axios';

interface TaxRate {
  id: number;
  countryCode: string;
  countryName: string;
  stateCode?: string;
  stateName?: string;
  taxRate: number;
  taxName: string;
  isActive: boolean;
}

interface ShippingRate {
  id: number;
  countryCode: string;
  countryName: string;
  stateCode?: string;
  stateName?: string;
  shippingCost: number;
  deliveryDays: number;
  isActive: boolean;
}



interface Country {
  code: string;
  name: string;
}

interface Stats {
  totalTaxRates: number;
  totalShippingRates: number;
  activeTaxRates: number;
  activeShippingRates: number;
  currency?: {
    code: string;
    symbol: string;
    name: string;
  } | null;
}

const TaxShipping: React.FC = () => {
  const { getToken } = useClerkAuth();
  const [activeTab, setActiveTab] = useState('tax');
  const [taxRates, setTaxRates] = useState<TaxRate[]>([]);
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Edit dialog states
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TaxRate | ShippingRate | null>(null);
  
  // Add new dialog states
  const [isAddTaxDialogOpen, setIsAddTaxDialogOpen] = useState(false);
  const [isAddShippingDialogOpen, setIsAddShippingDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    countryCode: '',
    countryName: '',
    stateCode: '',
    stateName: '',
    taxRate: '',
    taxName: '',
    shippingCost: '',
    deliveryDays: '',
    isActive: true
  });

  const [countrySearchTerm, setCountrySearchTerm] = useState('');

  const itemsPerPage = 20;

  // Helper function to get currency symbol with fallback
  const getCurrencySymbol = () => {
    return stats?.currency?.symbol || '$';
  };



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

  // Fetch countries for form dialogs
  const fetchCountries = async () => {
    try {
      const api = await createAuthenticatedApi();
      const countriesRes = await api.get('/admin/tax-shipping/countries');
      setCountries(countriesRes.data.countries || []);
    } catch (error: any) {
      console.error('Error fetching countries:', error);
    }
  };

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      
      const api = await createAuthenticatedApi();
      let queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString()
      });
      
      if (searchTerm) {
        queryParams.append('search', searchTerm);
      }
      
      if (statusFilter === 'active') {
        queryParams.append('isActive', 'true');
      } else if (statusFilter === 'inactive') {
        queryParams.append('isActive', 'false');
      }
      
      console.log('API Call Parameters:', {
        currentPage,
        itemsPerPage,
        searchTerm,
        statusFilter,
        queryParams: queryParams.toString()
      });
      
      const [taxRes, shippingRes, statsRes] = await Promise.all([
        api.get(`/admin/tax-shipping/tax-rates?${queryParams.toString()}`),
        api.get(`/admin/tax-shipping/shipping-rates?${queryParams.toString()}`),
        api.get('/admin/tax-shipping/stats')
      ]);

      console.log('Tax response:', taxRes.data);
      console.log('Shipping response:', shippingRes.data);
      console.log('Stats response:', statsRes.data);
      
      if (activeTab === 'tax') {
        setTaxRates(taxRes.data.taxRates || []);
        setTotalPages(taxRes.data.pagination?.pages || 1);
      } else {
        setShippingRates(shippingRes.data.shippingRates || []);
        setTotalPages(shippingRes.data.pagination?.pages || 1);
      }
      
      setStats(statsRes.data);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please log in again.');
      } else {
        toast.error('Failed to fetch data');
      }
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchData();
    fetchCountries();
  }, [activeTab, currentPage, searchTerm, statusFilter]);

  // Handle edit
  const handleEdit = (item: TaxRate | ShippingRate) => {
    setEditingItem(item);
    setFormData({
      countryCode: item.countryCode,
      countryName: item.countryName,
      stateCode: item.stateCode || '',
      stateName: item.stateName || '',
      taxRate: 'taxRate' in item ? item.taxRate.toString() : '',
      taxName: 'taxName' in item ? item.taxName : '',
      shippingCost: 'shippingCost' in item ? item.shippingCost.toString() : '',
      deliveryDays: 'deliveryDays' in item ? item.deliveryDays.toString() : '',
      isActive: item.isActive
    });
    setIsEditDialogOpen(true);
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const api = await createAuthenticatedApi();
      
      if (activeTab === 'tax') {
        await api.put(`/admin/tax-shipping/tax-rates/${editingItem?.id}`, {
          taxRate: parseFloat(formData.taxRate),
          taxName: formData.taxName,
          isActive: formData.isActive
        });
        toast.success('Tax rate updated successfully');
      } else {
        await api.put(`/admin/tax-shipping/shipping-rates/${editingItem?.id}`, {
          shippingCost: parseFloat(formData.shippingCost),
          deliveryDays: parseInt(formData.deliveryDays),
          isActive: formData.isActive
        });
        toast.success('Shipping rate updated successfully');
      }

      setIsEditDialogOpen(false);
      setEditingItem(null);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error('Error updating:', error);
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please log in again.');
      } else {
        toast.error(error.response?.data?.error || 'Failed to update');
      }
    }
  };

  // Handle add new tax rate
  const handleAddTaxRate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const api = await createAuthenticatedApi();
      
      await api.post('/admin/tax-shipping/tax-rates', {
        countryCode: formData.countryCode,
        countryName: formData.countryName,
        stateCode: formData.stateCode || null,
        stateName: formData.stateName || null,
        taxRate: parseFloat(formData.taxRate),
        taxName: formData.taxName,
        isActive: formData.isActive
      });
      
      toast.success('Tax rate added successfully');
      setIsAddTaxDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error('Error adding tax rate:', error);
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please log in again.');
      } else {
        toast.error(error.response?.data?.error || 'Failed to add tax rate');
      }
    }
  };

  // Handle add new shipping rate
  const handleAddShippingRate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const api = await createAuthenticatedApi();
      
      await api.post('/admin/tax-shipping/shipping-rates', {
        countryCode: formData.countryCode,
        countryName: formData.countryName,
        stateCode: formData.stateCode || null,
        stateName: formData.stateName || null,
        shippingCost: parseFloat(formData.shippingCost),
        deliveryDays: parseInt(formData.deliveryDays),
        isActive: formData.isActive
      });
      
      toast.success('Shipping rate added successfully');
      setIsAddShippingDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error('Error adding shipping rate:', error);
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please log in again.');
      } else {
        toast.error(error.response?.data?.error || 'Failed to add shipping rate');
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      countryCode: '',
      countryName: '',
      stateCode: '',
      stateName: '',
      taxRate: '',
      taxName: '',
      shippingCost: '',
      deliveryDays: '',
      isActive: true
    });
    setCountrySearchTerm('');
  };



  // Toggle active status
  const toggleActive = async (id: number, currentStatus: boolean, type: 'tax' | 'shipping') => {
    try {
      const api = await createAuthenticatedApi();
      
      if (type === 'tax') {
        await api.patch(`/admin/tax-shipping/tax-rates/${id}/toggle-active`);
        toast.success('Tax rate status updated successfully');
      } else {
        await api.patch(`/admin/tax-shipping/shipping-rates/${id}/toggle-active`);
        toast.success('Shipping rate status updated successfully');
      }
      
      fetchData();
    } catch (error: any) {
      console.error('Error toggling status:', error);
      toast.error('Failed to update status');
    }
  };



  // Reset page when filters change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

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
                      <DollarSign className="w-7 h-7 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 via-green-600 to-purple-600 bg-clip-text text-transparent">
                      Tax & Shipping Management
                    </h1>
                    <p className="text-slate-600 text-sm sm:text-base font-medium">Manage tax rates and shipping costs for all countries and regions with style</p>
                  </div>
                </div>
              </div>
              <div className="hidden md:flex space-x-3">
                <Button onClick={fetchData} variant="outline" className="bg-white/60 backdrop-blur-sm border-white/30 hover:bg-slate-100/80 rounded-xl transition-all duration-300">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-medium">Total Tax Rates</p>
                  <p className="text-lg font-bold text-slate-800">{stats.totalTaxRates}</p>
                  <p className="text-xs text-slate-500">{stats.activeTaxRates} active</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                  <Truck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-medium">Total Shipping Rates</p>
                  <p className="text-lg font-bold text-slate-800">{stats.totalShippingRates}</p>
                  <p className="text-xs text-slate-500">{stats.activeShippingRates} active</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-medium">Active Tax Rates</p>
                  <p className="text-lg font-bold text-green-600">{stats.activeTaxRates}</p>
                  <p className="text-xs text-slate-500">{((stats.activeTaxRates / stats.totalTaxRates) * 100).toFixed(1)}% of total</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-medium">Active Shipping Rates</p>
                  <p className="text-lg font-bold text-green-600">{stats.activeShippingRates}</p>
                  <p className="text-xs text-slate-500">{((stats.activeShippingRates / stats.totalShippingRates) * 100).toFixed(1)}% of total</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-2 border border-white/30 shadow-lg">
            <TabsList className="grid w-full grid-cols-2 bg-transparent">
              <TabsTrigger value="tax" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-xl">
                <DollarSign className="h-4 w-4" />
                Tax Rates
              </TabsTrigger>
              <TabsTrigger value="shipping" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-xl">
                <Truck className="h-4 w-4" />
                Shipping Rates
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tax Rates Tab */}
          <TabsContent value="tax" className="space-y-4">
            <Card className="bg-white/80 backdrop-blur-xl border border-white/30 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Tax Rates</CardTitle>
                    <CardDescription>
                      Manage tax rates for different countries and states
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={() => {
                      resetForm();
                      setIsAddTaxDialogOpen(true);
                    }}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Tax Rate
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        placeholder="Search tax rates..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white/60 backdrop-blur-sm border-white/30 focus:border-blue-500 hover:bg-white/80 hover:border-slate-300/60 transition-all duration-300"
                      />
                    </div>
                  </div>
                  
                  {/* Status Filter */}
                  <Select value={statusFilter} onValueChange={(value: 'all' | 'active' | 'inactive') => {
                    setStatusFilter(value);
                    setCurrentPage(1);
                  }}>
                    <SelectTrigger className="w-[150px] bg-white/60 backdrop-blur-sm border-white/30">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent className="z-50">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active Only</SelectItem>
                      <SelectItem value="inactive">Inactive Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tax Rates List */}
                <div className="space-y-4">
                  {loading ? (
                    <div className="h-24 flex items-center justify-center text-slate-500">
                      Loading...
                    </div>
                  ) : taxRates.length === 0 ? (
                    <div className="h-24 flex items-center justify-center text-slate-500">
                      No tax rates found
                    </div>
                  ) : (
                    <>
                      {/* Desktop Table View */}
                      <div className="hidden md:block">
                        <div className="rounded-md border border-white/30 bg-white/60 backdrop-blur-sm">
                          <div className="relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm">
                              <thead className="[&_tr]:border-b border-white/30">
                                <tr className="border-b border-white/30 transition-all duration-300 hover:bg-gradient-to-r hover:from-slate-50/90 hover:to-slate-100/80">
                                  <th className="h-12 px-4 text-left align-middle font-medium text-slate-600">
                                    Country/State
                                  </th>
                                  <th className="h-12 px-4 text-left align-middle font-medium text-slate-600">
                                    Tax Rate
                                  </th>
                                  <th className="h-12 px-4 text-left align-middle font-medium text-slate-600">
                                    Tax Name
                                  </th>
                                  <th className="h-12 px-4 text-left align-middle font-medium text-slate-600">
                                    Status
                                  </th>
                                  <th className="h-12 px-4 text-left align-middle font-medium text-slate-600">
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="[&_tr:last-child]:border-0">
                                {taxRates.map((taxRate) => (
                                  <tr key={taxRate.id} className="border-b border-white/30 transition-all duration-300 hover:bg-gradient-to-r hover:from-slate-50/90 hover:to-slate-100/80 hover:border-slate-300/60 hover:shadow-lg">
                                    <td className="p-4 align-middle">
                                      <div>
                                        <div className="font-medium text-slate-800">{taxRate.countryName}</div>
                                        {taxRate.stateName && (
                                          <div className="text-sm text-slate-500">
                                            {taxRate.stateName}
                                          </div>
                                        )}
                                      </div>
                                    </td>
                                    <td className="p-4 align-middle">
                                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                        {taxRate.taxRate}%
                                      </Badge>
                                    </td>
                                    <td className="p-4 align-middle text-slate-700">
                                      {taxRate.taxName}
                                    </td>
                                    <td className="p-4 align-middle">
                                      <div className="flex items-center space-x-2">
                                        <Switch
                                          checked={taxRate.isActive}
                                          onCheckedChange={() => toggleActive(taxRate.id, taxRate.isActive, 'tax')}
                                        />
                                        <Badge variant={taxRate.isActive ? "default" : "secondary"}>
                                          {taxRate.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                      </div>
                                    </td>
                                    <td className="p-4 align-middle">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleEdit(taxRate)}
                                        className="bg-white/60 backdrop-blur-sm border-white/30 hover:bg-slate-100/80 rounded-xl transition-all duration-300"
                                      >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                      </Button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>

                      {/* Mobile Card View */}
                      <div className="md:hidden space-y-4">
                        {taxRates.map((taxRate) => (
                          <div
                            key={taxRate.id}
                            className="relative bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-xl rounded-lg p-4 border border-white/40 transition-all duration-300 overflow-hidden hover:bg-gradient-to-r hover:from-slate-50/90 hover:to-slate-100/80 hover:border-slate-300/60 hover:shadow-lg"
                          >
                            <div className="space-y-3">
                              {/* Header */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg shadow-sm">
                                    <Globe className="w-5 h-5 text-blue-600" />
                                  </div>
                                  <div>
                                    <h3 className="font-semibold text-slate-900">{taxRate.countryName}</h3>
                                    {taxRate.stateName && (
                                      <p className="text-sm text-slate-500">{taxRate.stateName}</p>
                                    )}
                                  </div>
                                </div>
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                  {taxRate.taxRate}%
                                </Badge>
                              </div>

                              {/* Tax Name */}
                              <div className="text-slate-700">
                                <span className="text-sm text-slate-500">Tax Name:</span>
                                <span className="ml-2 font-medium">{taxRate.taxName}</span>
                              </div>

                              {/* Status and Actions */}
                              <div className="flex items-center justify-between pt-2 border-t border-slate-200/50">
                                <div className="flex items-center space-x-3">
                                  <Switch
                                    checked={taxRate.isActive}
                                    onCheckedChange={() => toggleActive(taxRate.id, taxRate.isActive, 'tax')}
                                  />
                                  <Badge variant={taxRate.isActive ? "default" : "secondary"}>
                                    {taxRate.isActive ? "Active" : "Inactive"}
                                  </Badge>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(taxRate)}
                                  className="bg-white/60 backdrop-blur-sm border-white/30 hover:bg-slate-100/80 rounded-xl transition-all duration-300"
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-slate-600">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="bg-white/60 backdrop-blur-sm border-white/30 hover:bg-white/80"
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="bg-white/60 backdrop-blur-sm border-white/30 hover:bg-white/80"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shipping Rates Tab */}
          <TabsContent value="shipping" className="space-y-4">
            <Card className="bg-white/80 backdrop-blur-xl border border-white/30 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Shipping Rates</CardTitle>
                    <CardDescription>
                      Manage shipping costs and delivery times for different countries and states
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={() => {
                      resetForm();
                      setIsAddShippingDialogOpen(true);
                    }}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Shipping Rate
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        placeholder="Search shipping rates..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white/60 backdrop-blur-sm border-white/30 focus:border-blue-500 hover:bg-white/80 hover:border-slate-300/60 transition-all duration-300"
                      />
                    </div>
                  </div>
                  
                  {/* Status Filter */}
                  <Select value={statusFilter} onValueChange={(value: 'all' | 'active' | 'inactive') => {
                    setStatusFilter(value);
                    setCurrentPage(1);
                  }}>
                    <SelectTrigger className="w-[150px] bg-white/60 backdrop-blur-sm border-white/30">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent className="z-50">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active Only</SelectItem>
                      <SelectItem value="inactive">Inactive Only</SelectItem>
                    </SelectContent>
                  </Select>
                  

                </div>

                {/* Shipping Rates List */}
                <div className="space-y-4">
                  {loading ? (
                    <div className="h-24 flex items-center justify-center text-slate-500">
                      Loading...
                    </div>
                  ) : shippingRates.length === 0 ? (
                    <div className="h-24 flex items-center justify-center text-slate-500">
                      No shipping rates found
                    </div>
                  ) : (
                    <>
                      {/* Desktop Table View */}
                      <div className="hidden md:block">
                        <div className="rounded-md border border-white/30 bg-white/60 backdrop-blur-sm">
                          <div className="relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm">
                              <thead className="[&_tr]:border-b border-white/30">
                                <tr className="border-b border-white/30 transition-all duration-300 hover:bg-gradient-to-r hover:from-slate-50/90 hover:to-slate-100/80">
                                  <th className="h-12 px-4 text-left align-middle font-medium text-slate-600">
                                    Country/State
                                  </th>
                                  <th className="h-12 px-4 text-left align-middle font-medium text-slate-600">
                                    Shipping Cost
                                  </th>
                                  <th className="h-12 px-4 text-left align-middle font-medium text-slate-600">
                                    Delivery Days
                                  </th>
                                  <th className="h-12 px-4 text-left align-middle font-medium text-slate-600">
                                    Status
                                  </th>
                                  <th className="h-12 px-4 text-left align-middle font-medium text-slate-600">
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="[&_tr:last-child]:border-0">
                                {shippingRates.map((shippingRate) => (
                                  <tr key={shippingRate.id} className="border-b border-white/30 transition-all duration-300 hover:bg-gradient-to-r hover:from-slate-100/90 hover:to-slate-200/80 hover:border-slate-300/60 hover:shadow-lg">
                                    <td className="p-4 align-middle">
                                      <div>
                                        <div className="font-medium text-slate-800">{shippingRate.countryName}</div>
                                        {shippingRate.stateName && (
                                          <div className="text-sm text-slate-500">
                                            {shippingRate.stateName}
                                          </div>
                                        )}
                                      </div>
                                    </td>
                                    <td className="p-4 align-middle">
                                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                                        {getCurrencySymbol()}{shippingRate.shippingCost}
                                      </Badge>
                                    </td>
                                    <td className="p-4 align-middle">
                                      <div className="flex items-center space-x-2">
                                        <Calendar className="w-4 h-4 text-slate-500" />
                                        <span className="text-slate-700">{shippingRate.deliveryDays} days</span>
                                      </div>
                                    </td>
                                    <td className="p-4 align-middle">
                                      <div className="flex items-center space-x-2">
                                        <Switch
                                          checked={shippingRate.isActive}
                                          onCheckedChange={() => toggleActive(shippingRate.id, shippingRate.isActive, 'shipping')}
                                        />
                                        <Badge variant={shippingRate.isActive ? "default" : "secondary"}>
                                          {shippingRate.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                      </div>
                                    </td>
                                    <td className="p-4 align-middle">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleEdit(shippingRate)}
                                        className="bg-white/60 backdrop-blur-sm border-white/30 hover:bg-slate-100/80 rounded-xl transition-all duration-300"
                                        >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                      </Button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>

                      {/* Mobile Card View */}
                      <div className="md:hidden space-y-4">
                        {shippingRates.map((shippingRate) => (
                          <div
                            key={shippingRate.id}
                            className="relative bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-xl rounded-lg p-4 border border-white/40 transition-all duration-300 overflow-hidden hover:bg-gradient-to-r hover:from-slate-50/90 hover:to-slate-100/80 hover:border-slate-300/60 hover:shadow-lg"
                          >
                            <div className="space-y-3">
                              {/* Header */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="p-2 bg-gradient-to-br from-green-100 to-green-200 rounded-lg shadow-sm">
                                    <Truck className="w-5 h-5 text-green-600" />
                                  </div>
                                  <div>
                                    <h3 className="font-semibold text-slate-900">{shippingRate.countryName}</h3>
                                    {shippingRate.stateName && (
                                      <p className="text-sm text-slate-500">{shippingRate.stateName}</p>
                                    )}
                                  </div>
                                </div>
                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                  {getCurrencySymbol()}{shippingRate.shippingCost}
                                </Badge>
                              </div>

                              {/* Shipping Details */}
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2 text-slate-700">
                                  <Calendar className="w-4 h-4 text-slate-500" />
                                  <span className="text-sm text-slate-500">Delivery:</span>
                                  <span className="font-medium">{shippingRate.deliveryDays} days</span>
                                </div>
                              </div>

                              {/* Status and Actions */}
                              <div className="flex items-center justify-between pt-2 border-t border-slate-200/50">
                                <div className="flex items-center space-x-3">
                                  <Switch
                                    checked={shippingRate.isActive}
                                    onCheckedChange={() => toggleActive(shippingRate.id, shippingRate.isActive, 'shipping')}
                                  />
                                  <Badge variant={shippingRate.isActive ? "default" : "secondary"}>
                                    {shippingRate.isActive ? "Active" : "Inactive"}
                                  </Badge>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(shippingRate)}
                                  className="bg-white/60 backdrop-blur-sm border-white/30 hover:bg-slate-100/80 rounded-xl transition-all duration-300"
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-slate-600">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="bg-white/60 backdrop-blur-sm border-white/30 hover:bg-white/80"
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="bg-white/60 backdrop-blur-sm border-white/30 hover:bg-white/80"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                Edit {activeTab === 'tax' ? 'Tax Rate' : 'Shipping Rate'}
              </DialogTitle>
              <DialogDescription>
                Update the {activeTab === 'tax' ? 'tax rate and name' : 'shipping cost and delivery time'} for {editingItem?.countryName}
                {editingItem?.stateName && ` - ${editingItem.stateName}`}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {activeTab === 'tax' ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="taxRate">Tax Rate (%)</Label>
                    <Input
                      id="taxRate"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.taxRate}
                      onChange={(e) => setFormData(prev => ({ ...prev, taxRate: e.target.value }))}
                      placeholder="e.g., 7.25"
                      className="hover:bg-slate-50/80 hover:border-slate-300/60 transition-all duration-300"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxName">Tax Name</Label>
                    <Input
                      id="taxName"
                      value={formData.taxName}
                      onChange={(e) => setFormData(prev => ({ ...prev, taxName: e.target.value }))}
                      placeholder="e.g., Sales Tax, VAT, GST"
                      className="hover:bg-slate-50/80 hover:border-slate-300/60 transition-all duration-300"
                      required
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="shippingCost">Shipping Cost ({getCurrencySymbol()})</Label>
                    <Input
                      id="shippingCost"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.shippingCost}
                      onChange={(e) => setFormData(prev => ({ ...prev, shippingCost: e.target.value }))}
                      placeholder={`e.g., 5.99`}
                      className="hover:bg-slate-50/80 hover:border-slate-300/60 transition-all duration-300"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deliveryDays">Delivery Days</Label>
                    <Input
                      id="deliveryDays"
                      type="number"
                      min="1"
                      value={formData.deliveryDays}
                      onChange={(e) => setFormData(prev => ({ ...prev, deliveryDays: e.target.value }))}
                      placeholder="e.g., 3"
                      className="hover:bg-slate-50/80 hover:border-slate-300/60 transition-all duration-300"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingItem(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Update {activeTab === 'tax' ? 'Tax Rate' : 'Shipping Rate'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Add New Tax Rate Dialog */}
        <Dialog open={isAddTaxDialogOpen} onOpenChange={setIsAddTaxDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Tax Rate</DialogTitle>
              <DialogDescription>
                Create a new tax rate for a specific country or state
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddTaxRate} className="space-y-4">
                                <div className="space-y-2">
                    <Label htmlFor="countryCode">Country</Label>
                    <Select value={formData.countryCode} onValueChange={(value) => {
                      const country = countries.find(c => c.code === value);
                      setFormData(prev => ({
                        ...prev,
                        countryCode: value,
                        countryName: country?.name || ''
                      }));
                      setCountrySearchTerm(''); // Clear search after selection
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="p-2">
                          <Input
                            placeholder="Search countries..."
                            value={countrySearchTerm}
                            onChange={(e) => setCountrySearchTerm(e.target.value)}
                            className="mb-2 hover:bg-slate-50/80 hover:border-slate-300/60 transition-all duration-300"
                          />
                        </div>
                    {countries
                      .filter(country => 
                        country.name.toLowerCase().includes(countrySearchTerm.toLowerCase()) ||
                        country.code.toLowerCase().includes(countrySearchTerm.toLowerCase())
                      )
                      .map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stateCode">State/Province (Optional)</Label>
                <Input
                  id="stateCode"
                  value={formData.stateCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, stateCode: e.target.value }))}
                  placeholder="e.g., CA, NY, ON"
                  className="hover:bg-slate-50/80 hover:border-slate-300/60 transition-all duration-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stateName">State/Province Name (Optional)</Label>
                <Input
                  id="stateName"
                  value={formData.stateName}
                  onChange={(e) => setFormData(prev => ({ ...prev, stateName: e.target.value }))}
                  placeholder="e.g., California, New York, Ontario"
                  className="hover:bg-slate-50/80 hover:border-slate-300/60 transition-all duration-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.taxRate}
                  onChange={(e) => setFormData(prev => ({ ...prev, taxRate: e.target.value }))}
                  placeholder="e.g., 7.25"
                  className="hover:bg-slate-50/80 hover:border-slate-300/60 transition-all duration-300"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxName">Tax Name</Label>
                <Input
                  id="taxName"
                  value={formData.taxName}
                  onChange={(e) => setFormData(prev => ({ ...prev, taxName: e.target.value }))}
                  placeholder="e.g., Sales Tax, VAT, GST"
                  className="hover:bg-slate-50/80 hover:border-slate-300/60 transition-all duration-300"
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddTaxDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Add Tax Rate
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Add New Shipping Rate Dialog */}
        <Dialog open={isAddShippingDialogOpen} onOpenChange={setIsAddShippingDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Shipping Rate</DialogTitle>
              <DialogDescription>
                Create a new shipping rate for a specific country or state
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddShippingRate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="shippingCountryCode">Country</Label>
                <Select value={formData.countryCode} onValueChange={(value) => {
                  const country = countries.find(c => c.code === value);
                  setFormData(prev => ({
                    ...prev,
                    countryCode: value,
                    countryName: country?.name || ''
                  }));
                  setCountrySearchTerm(''); // Clear search after selection
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                  <SelectContent>
                                            <div className="p-2">
                          <Input
                            placeholder="Search countries..."
                            value={countrySearchTerm}
                            onChange={(e) => setCountrySearchTerm(e.target.value)}
                            className="mb-2 hover:bg-slate-50/80 hover:border-slate-300/60 transition-all duration-300"
                          />
                        </div>
                    {countries
                      .filter(country => 
                        country.name.toLowerCase().includes(countrySearchTerm.toLowerCase()) ||
                        country.code.toLowerCase().includes(countrySearchTerm.toLowerCase())
                      )
                      .map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shippingStateCode">State/Province (Optional)</Label>
                <Input
                  id="shippingStateCode"
                  value={formData.stateCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, stateCode: e.target.value }))}
                  placeholder="e.g., CA, NY, ON"
                  className="hover:bg-slate-50/80 hover:border-slate-300/60 transition-all duration-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shippingStateName">State/Province Name (Optional)</Label>
                <Input
                  id="shippingStateName"
                  value={formData.stateName}
                  onChange={(e) => setFormData(prev => ({ ...prev, stateName: e.target.value }))}
                  placeholder="e.g., California, New York, Ontario"
                  className="hover:bg-slate-50/80 hover:border-slate-300/60 transition-all duration-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shippingCost">Shipping Cost ({getCurrencySymbol()})</Label>
                <Input
                  id="shippingCost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.shippingCost}
                  onChange={(e) => setFormData(prev => ({ ...prev, shippingCost: e.target.value }))}
                  placeholder={`e.g., 5.99`}
                  className="hover:bg-slate-50/80 hover:border-slate-300/60 transition-all duration-300"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliveryDays">Delivery Days</Label>
                <Input
                  id="deliveryDays"
                  type="number"
                  min="1"
                  value={formData.deliveryDays}
                  onChange={(e) => setFormData(prev => ({ ...prev, deliveryDays: e.target.value }))}
                  placeholder="e.g., 3"
                  className="hover:bg-slate-50/80 hover:border-slate-300/60 transition-all duration-300"
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="shippingIsActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="shippingIsActive">Active</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddShippingDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Add Shipping Rate
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default TaxShipping;
