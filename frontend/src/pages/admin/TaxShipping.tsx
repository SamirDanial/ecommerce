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
import { Search, Plus, Edit, Trash2, Globe, Truck, DollarSign, Calendar, MapPin, RefreshCw } from 'lucide-react';
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
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Edit dialog states
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TaxRate | ShippingRate | null>(null);
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

  const itemsPerPage = 20;

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
      const countryParam = selectedCountry === 'all' ? '' : selectedCountry;
      
      const [taxResponse, shippingResponse, countriesResponse, statsResponse] = await Promise.all([
        api.get(`/admin/tax-shipping/tax-rates?page=${currentPage}&limit=${itemsPerPage}&search=${searchTerm}&country=${countryParam}`),
        api.get(`/admin/tax-shipping/shipping-rates?page=${currentPage}&limit=${itemsPerPage}&search=${searchTerm}&country=${countryParam}`),
        api.get('/admin/tax-shipping/countries'),
        api.get('/admin/tax-shipping/stats')
      ]);

      if (activeTab === 'tax') {
        setTaxRates(taxResponse.data.taxRates);
        setTotalPages(taxResponse.data.pagination.pages);
      } else {
        setShippingRates(shippingResponse.data.shippingRates);
        setTotalPages(shippingResponse.data.pagination.pages);
      }

      setCountries(countriesResponse.data);
      setStats(statsResponse.data);
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
  }, [activeTab, currentPage, searchTerm, selectedCountry]);

  // Toggle active status
  const toggleActive = async (id: number, currentStatus: boolean, type: 'tax' | 'shipping') => {
    try {
      const api = await createAuthenticatedApi();
      
      if (type === 'tax') {
        await api.put(`/admin/tax-shipping/tax-rates/${id}`, { isActive: !currentStatus });
      } else {
        await api.put(`/admin/tax-shipping/shipping-rates/${id}`, { isActive: !currentStatus });
      }
      toast.success('Status updated successfully');
      fetchData();
    } catch (error: any) {
      console.error('Error updating status:', error);
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please log in again.');
      } else {
        toast.error(error.response?.data?.error || 'Failed to update status');
      }
    }
  };

  // Handle edit
  const handleEdit = (item: TaxRate | ShippingRate) => {
    setEditingItem(item);
    setFormData({
      countryCode: item.countryCode,
      countryName: item.countryName,
      stateCode: item.stateCode || '',
      stateName: item.stateName || '',
      taxRate: activeTab === 'tax' ? (item as TaxRate).taxRate.toString() : '',
      taxName: activeTab === 'tax' ? (item as TaxRate).taxName : '',
      shippingCost: activeTab === 'shipping' ? (item as ShippingRate).shippingCost.toString() : '',
      deliveryDays: activeTab === 'shipping' ? (item as ShippingRate).deliveryDays.toString() : '',
      isActive: item.isActive
    });
    setIsEditDialogOpen(true);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingItem) return;

    try {
      const api = await createAuthenticatedApi();
      
      if (activeTab === 'tax') {
        const data = {
          taxRate: parseFloat(formData.taxRate),
          taxName: formData.taxName
        };

        await api.put(`/admin/tax-shipping/tax-rates/${editingItem.id}`, data);
        toast.success('Tax rate updated successfully');
      } else {
        const data = {
          shippingCost: parseFloat(formData.shippingCost),
          deliveryDays: parseInt(formData.deliveryDays)
        };

        await api.put(`/admin/tax-shipping/shipping-rates/${editingItem.id}`, data);
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
  };

  // Handle country selection
  const handleCountrySelect = (countryCode: string) => {
    const country = countries.find(c => c.code === countryCode);
    setFormData(prev => ({
      ...prev,
      countryCode,
      countryName: country?.name || '',
      stateCode: '',
      stateName: ''
    }));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tax & Shipping Management</h1>
          <p className="text-muted-foreground">
            Manage tax rates and shipping costs for all countries and regions
          </p>
        </div>
        <Button onClick={fetchData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tax Rates</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTaxRates}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeTaxRates} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Shipping Rates</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalShippingRates}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeShippingRates} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tax Rates</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.activeTaxRates}</div>
              <p className="text-xs text-muted-foreground">
                {((stats.activeTaxRates / stats.totalTaxRates) * 100).toFixed(1)}% of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Shipping Rates</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.activeShippingRates}</div>
              <p className="text-xs text-muted-foreground">
                {((stats.activeShippingRates / stats.totalShippingRates) * 100).toFixed(1)}% of total
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tax" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Tax Rates
          </TabsTrigger>
          <TabsTrigger value="shipping" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Shipping Rates
          </TabsTrigger>
        </TabsList>

        {/* Tax Rates Tab */}
        <TabsContent value="tax" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Tax Rates</CardTitle>
                  <CardDescription>
                    Manage tax rates for different countries and states
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="Search tax rates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="All Countries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Countries</SelectItem>
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tax Rates Table */}
              <div className="rounded-md border">
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b">
                      <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          Country/State
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          Tax Rate
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          Tax Name
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
                      {loading ? (
                        <tr>
                          <td colSpan={5} className="h-24 text-center">
                            Loading...
                          </td>
                        </tr>
                      ) : taxRates.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="h-24 text-center text-muted-foreground">
                            No tax rates found
                          </td>
                        </tr>
                      ) : (
                        taxRates.map((taxRate) => (
                          <tr key={taxRate.id} className="border-b transition-colors hover:bg-muted/50">
                            <td className="p-4 align-middle">
                              <div>
                                <div className="font-medium">{taxRate.countryName}</div>
                                {taxRate.stateName && (
                                  <div className="text-sm text-muted-foreground">
                                    {taxRate.stateName}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="p-4 align-middle">
                              <Badge variant="secondary">
                                {taxRate.taxRate}%
                              </Badge>
                            </td>
                            <td className="p-4 align-middle">
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
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
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
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Shipping Rates</CardTitle>
                  <CardDescription>
                    Manage shipping costs and delivery times for different regions
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="Search shipping rates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="All Countries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Countries</SelectItem>
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Shipping Rates Table */}
              <div className="rounded-md border">
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b">
                      <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          Country/State
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-center font-medium text-muted-foreground">
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
                      {loading ? (
                        <tr>
                          <td colSpan={5} className="h-24 text-center">
                            Loading...
                          </td>
                        </tr>
                      ) : shippingRates.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="h-24 text-center text-muted-foreground">
                            No shipping rates found
                          </td>
                        </tr>
                      ) : (
                        shippingRates.map((shippingRate) => (
                          <tr key={shippingRate.id} className="border-b transition-colors hover:bg-muted/50">
                            <td className="p-4 align-middle">
                              <div>
                                <div className="font-medium">{shippingRate.countryName}</div>
                                {shippingRate.stateName && (
                                  <div className="text-sm text-muted-foreground">
                                    {shippingRate.stateName}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="p-4 align-middle">
                              <Badge variant="secondary">
                                ${shippingRate.shippingCost}
                              </Badge>
                            </td>
                            <td className="p-4 align-middle">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                {shippingRate.deliveryDays} days
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
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
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
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="shippingCost">Shipping Cost ($)</Label>
                  <Input
                    id="shippingCost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.shippingCost}
                    onChange={(e) => setFormData(prev => ({ ...prev, shippingCost: e.target.value }))}
                    placeholder="e.g., 5.99"
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
    </div>
  );
};

export default TaxShipping;
