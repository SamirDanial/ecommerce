import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { 
  Currency, 
  RefreshCw, 
  Calculator, 
  AlertTriangle, 
  CheckCircle, 
  DollarSign,
  TrendingUp,
  Settings,
  Search,
  ChevronDown,
  Globe,
  ArrowRight,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';
import { useClerkAuth } from '../../hooks/useClerkAuth';
import axios from 'axios';

interface Currency {
  code: string;
  name: string;
  symbol: string;
  isDefault: boolean;
}

interface ExchangeRate {
  id: number;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  isBase: boolean;
  isActive: boolean;
  lastUpdated: string;
  source: string;
}

const CurrencyManagement: React.FC = () => {
  const { getToken } = useClerkAuth();
  
  // State
  const [baseCurrency, setBaseCurrency] = useState<string>('USD');
  const [baseCurrencyInfo, setBaseCurrencyInfo] = useState<{ code: string; symbol: string; name: string } | null>(null);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(false);
  const [changingCurrency, setChangingCurrency] = useState(false);

  // Form states
  const [newBaseCurrency, setNewBaseCurrency] = useState<string>('');
  const [conversionRate, setConversionRate] = useState<string>('');
  const [showChangeDialog, setShowChangeDialog] = useState(false);
  const [showAddRateDialog, setShowAddRateDialog] = useState(false);
  const [newRateToCurrency, setNewRateToCurrency] = useState<string>('');
  const [newRateValue, setNewRateValue] = useState<string>('');
  const [addingRate, setAddingRate] = useState(false);
  const [currencySearch, setCurrencySearch] = useState<string>('');
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

  // Exchange rate editing states
  const [showEditRateDialog, setShowEditRateDialog] = useState(false);
  const [editingRate, setEditingRate] = useState<ExchangeRate | null>(null);
  const [editRateValue, setEditRateValue] = useState<string>('');

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [toCurrencyFilter, setToCurrencyFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

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
      
      const [baseResponse, ratesResponse, currenciesResponse] = await Promise.all([
        api.get('/admin/currency/base-currency'),
        api.get('/admin/currency/exchange-rates'),
        api.get('/admin/currency/currencies')
      ]);

      if (baseResponse.data && baseResponse.data.code) {
        setBaseCurrency(baseResponse.data.code);
        setBaseCurrencyInfo(baseResponse.data);
      } else {
        setBaseCurrency('USD');
        setBaseCurrencyInfo(null);
      }
      
      const processedRates = ratesResponse.data.map((rate: any) => ({
        ...rate,
        rate: typeof rate.rate === 'string' ? parseFloat(rate.rate) : rate.rate,
        lastUpdated: rate.lastUpdated || new Date().toISOString(),
        source: rate.source || 'Unknown'
      }));
      
      setExchangeRates(processedRates);
      setCurrencies(currenciesResponse.data);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please log in again.');
      } else if (error.response?.status === 429) {
        toast.error('Rate limit exceeded. Please wait a moment and try again.');
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

  const handleChangeBaseCurrency = async () => {
    if (!newBaseCurrency || !conversionRate) {
      toast.error('Please fill in all fields');
      return;
    }

    const rate = parseFloat(conversionRate);
    if (isNaN(rate) || rate <= 0) {
      toast.error('Please enter a valid conversion rate');
      return;
    }

    try {
      setLoading(true);
      const api = await createAuthenticatedApi();
      
      toast.loading('Changing base currency... This may take a moment.');
      
      const response = await api.post('/admin/currency/change-base-currency', {
        newBaseCurrency,
        conversionRate: rate
      });

      toast.dismiss();
      toast.success(response.data.message);
      
      fetchData();
      setShowChangeDialog(false);
      setNewBaseCurrency('');
      setConversionRate('');
    } catch (error: any) {
      toast.dismiss();
      console.error('Error changing base currency:', error);
      toast.error(error.response?.data?.error || 'Failed to change base currency');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewRate = async () => {
    if (!newRateToCurrency || !newRateValue) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setAddingRate(true);
      const api = await createAuthenticatedApi();
      
      await api.post('/admin/currency/exchange-rates', {
        fromCurrency: 'USD',
        toCurrency: newRateToCurrency,
        rate: parseFloat(newRateValue),
        source: 'Manual'
      });

      toast.success('New exchange rate added successfully!');
      setShowAddRateDialog(false);
      setNewRateToCurrency('');
      setNewRateValue('');
      
      fetchData();
    } catch (error: any) {
      console.error('Error adding new rate:', error);
      toast.error(error.response?.data?.error || 'Failed to add new exchange rate');
    } finally {
      setAddingRate(false);
    }
  };

  const updateExchangeRate = async (id: number, newRate: number) => {
    try {
      const api = await createAuthenticatedApi();
      const response = await api.put(`/admin/currency/exchange-rates/${id}`, {
        rate: newRate,
        source: 'Manual'
      });

      setExchangeRates(prev => 
        prev.map(rate => 
          rate.id === id 
            ? {
                ...rate,
                rate: typeof response.data.rate === 'string' ? parseFloat(response.data.rate) : response.data.rate,
                lastUpdated: response.data.lastUpdated || new Date().toISOString(),
                source: response.data.source || 'Manual'
              }
            : rate
        )
      );

      toast.success(`Exchange rate updated to ${newRate}`);
    } catch (error: any) {
      console.error('Error updating exchange rate:', error);
      toast.error(error.response?.data?.error || 'Failed to update exchange rate');
    }
  };

  const openEditRateDialog = (rate: ExchangeRate) => {
    setEditingRate(rate);
    setEditRateValue(rate.rate.toString());
    setShowEditRateDialog(true);
  };

  const handleEditRateSubmit = async () => {
    if (!editingRate || !editRateValue) return;

    const newRate = parseFloat(editRateValue);
    if (isNaN(newRate) || newRate <= 0) {
      toast.error('Please enter a valid rate greater than 0');
      return;
    }

    try {
      await updateExchangeRate(editingRate.id, newRate);
      setShowEditRateDialog(false);
      setEditingRate(null);
      setEditRateValue('');
    } catch (error) {
      // Error handling is done in updateExchangeRate
    }
  };

  const getCurrencyName = (code: string) => {
    if (!currencies || currencies.length === 0) return code;
    return currencies.find(c => c.code === code)?.name || code;
  };

  const filteredCurrencies = currencies.filter(currency => 
    currency.code.toLowerCase().includes(currencySearch.toLowerCase()) ||
    currency.name.toLowerCase().includes(currencySearch.toLowerCase())
  );

  const getFilteredExchangeRates = () => {
    return exchangeRates.filter(rate => {
      const matchesSearch = 
        rate.fromCurrency.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rate.toCurrency.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getCurrencyName(rate.toCurrency).toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesToCurrency = toCurrencyFilter === 'all' || rate.toCurrency === toCurrencyFilter;
      
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && rate.isActive) ||
                           (statusFilter === 'inactive' && !rate.isActive);
      
      return matchesSearch && matchesToCurrency && matchesStatus;
    });
  };

  const getUniqueToCurrencies = () => {
    const uniqueCurrencies = Array.from(new Set(exchangeRates.map(rate => rate.toCurrency)));
    return uniqueCurrencies.map(code => ({
      code,
      name: getCurrencyName(code)
    }));
  };

  const stats = {
    totalRates: exchangeRates.length,
    activeRates: exchangeRates.filter(rate => rate.isActive).length,
    totalCurrencies: currencies.length,
    baseCurrency: baseCurrencyInfo?.name || baseCurrency
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.currency-dropdown')) {
        setShowCurrencyDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: '2-digit'
      });
    } catch (error) {
      console.warn('Invalid date string:', dateString);
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading currency data...</span>
        </div>
      </div>
    );
  }

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
                      <Currency className="w-7 h-7 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 via-green-600 to-purple-600 bg-clip-text text-transparent">
                      Currency Management
                    </h1>
                    <p className="text-slate-600 text-sm sm:text-base font-medium">Manage your business base currency and exchange rates with style</p>
                  </div>
                </div>
              </div>
              
              <div className="hidden md:flex space-x-3">
                <Button onClick={() => {
                  setShowAddRateDialog(true);
                  setCurrencySearch('');
                  setNewRateToCurrency('');
                  setNewRateValue('');
                  setShowCurrencyDropdown(false);
                }} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                  <Calculator className="h-4 w-4 mr-2" />
                  Add New Rate
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3 md:gap-6">
          <Card className="relative bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-xl border border-white/40 shadow-xl overflow-hidden">
            <CardContent className="relative p-2 sm:p-3 md:p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-xs sm:text-sm font-semibold text-slate-700 uppercase tracking-wide">Base Currency</p>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-600">{baseCurrency}</p>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium">{stats.baseCurrency}</p>
                  </div>
                </div>
                <div className="p-1 sm:p-2 md:p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-md sm:rounded-lg md:rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <Currency className="w-4 h-4 sm:w-5 sm:h-5 md:w-7 md:h-7 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-xl border border-white/40 shadow-xl overflow-hidden">
            <CardContent className="relative p-2 sm:p-3 md:p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-xs sm:text-sm font-semibold text-slate-700 uppercase tracking-wide">Total Exchange Rates</p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-600">{stats.totalRates}</p>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium">{stats.activeRates} active</p>
                  </div>
                </div>
                <div className="p-1 sm:p-2 md:p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-md sm:rounded-lg md:rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 md:w-7 md:h-7 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-xl border border-white/40 shadow-xl overflow-hidden">
            <CardContent className="relative p-2 sm:p-3 md:p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-xs sm:text-sm font-semibold text-slate-600 uppercase tracking-wide">Available Currencies</p>
                  <p className="text-2xl sm:text-3xl font-bold text-purple-600">{stats.totalCurrencies}</p>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium">Supported</p>
                  </div>
                </div>
                <div className="p-1 sm:p-2 md:p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-md sm:rounded-lg md:rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <Globe className="w-4 h-4 sm:w-5 sm:h-5 md:w-7 md:h-7 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Base Currency */}
        <Card className="relative bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-xl border border-white/40 shadow-xl overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Currency className="h-5 w-5" />
              <span>Current Base Currency</span>
            </CardTitle>
            <CardDescription>
              This is the currency used to store all product prices in your database. 
              Changing this will automatically convert all existing prices.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {baseCurrencyInfo ? `${baseCurrencyInfo.symbol} ${baseCurrencyInfo.code}` : baseCurrency || 'Not loaded'}
                </Badge>
                <span className="text-muted-foreground">
                  {baseCurrencyInfo ? baseCurrencyInfo.name : getCurrencyName(baseCurrency)}
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowChangeDialog(true)} 
                disabled={!baseCurrency}
                className="w-fit"
              >
                <Settings className="h-4 w-4 mr-2" />
                Change Base Currency
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Exchange Rates */}
        <Card className="relative bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-xl border border-white/40 shadow-xl overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Exchange Rates</span>
            </CardTitle>
            <CardDescription>
              Current exchange rates from your base currency to other currencies. 
              These rates are used for price conversion and display.
            </CardDescription>
          </CardHeader>
          
          {/* Enhanced Search and Filters */}
          <div className="px-6 pb-4 border-b border-slate-200/30 bg-gradient-to-r from-slate-50/30 to-white/50">
            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3">
              <div className="flex-1 w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search exchange rates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-10 bg-white/80 backdrop-blur-sm border-slate-200/50 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg transition-all duration-300"
                  />
                </div>
              </div>
              
              <Select value={toCurrencyFilter} onValueChange={(value) => setToCurrencyFilter(value)}>
                <SelectTrigger className="w-full sm:w-40 h-10 bg-white/80 backdrop-blur-sm border-slate-200/50 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg">
                  <SelectValue placeholder="All Currencies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Currencies</SelectItem>
                  {getUniqueToCurrencies().map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                <SelectTrigger className="w-full sm:w-40 h-10 bg-white/80 backdrop-blur-sm border-slate-200/50 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <CardContent className="p-6">
            <div className="space-y-4">
              {getFilteredExchangeRates().length > 0 ? (
                getFilteredExchangeRates().map((rate) => {
                  const rateValue = typeof rate.rate === 'number' ? rate.rate : 
                                  typeof rate.rate === 'string' ? parseFloat(rate.rate) : 0;
                  
                  if (isNaN(rateValue)) {
                    console.warn('Invalid rate value:', rate.rate, 'for rate:', rate);
                    return null;
                  }

                  return (
                    <div key={rate.id} className="relative bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-xl rounded-lg sm:rounded-xl md:rounded-2xl p-2 sm:p-3 md:p-6 border border-white/40 transition-all duration-300 overflow-hidden hover:bg-gradient-to-r hover:from-slate-50/90 hover:to-slate-100/80 hover:border-slate-300/60 hover:shadow-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl shadow-md transition-all duration-300">
                              <TrendingUp className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline" className="font-mono">{rate.fromCurrency}</Badge>
                                <ArrowRight className="w-4 h-4 text-slate-400" />
                                <Badge variant="outline" className="font-mono">{rate.toCurrency}</Badge>
                              </div>
                              <p className="text-sm text-slate-500 font-medium">
                                {getCurrencyName(rate.toCurrency)}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="font-mono text-lg font-bold text-slate-900">
                              {rateValue.toFixed(6).replace(/\.?0+$/, '')}
                            </div>
                            <div className="text-xs text-slate-500">
                              {formatDate(rate.lastUpdated)}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {!rate.isBase && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => openEditRateDialog(rate)}
                                className="h-9 px-3 hover:bg-slate-100/80 rounded-xl transition-all duration-300"
                              >
                                Edit
                              </Button>
                            )}
                            
                            {rate.isBase && (
                              <Badge variant="secondary" className="px-3 py-1 bg-blue-100 text-blue-700 border-blue-200">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Base
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }).filter(Boolean)
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  {searchTerm || toCurrencyFilter !== 'all' || statusFilter !== 'all' ? (
                    <div className="space-y-2">
                      <p className="text-lg font-semibold">No exchange rates found</p>
                      <p className="text-sm">Try adjusting your search or filters to find what you're looking for</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-lg font-semibold">No exchange rates found</p>
                      <p className="text-sm">Click Refresh to load data or Add New Rate to create one</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Change Base Currency Dialog */}
        <Dialog open={showChangeDialog} onOpenChange={setShowChangeDialog}>
          <DialogContent className="sm:max-w-md" onOpenAutoFocus={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle>Change Base Currency</DialogTitle>
              <DialogDescription>
                This will update all product prices in your database and recalculate all exchange rates. 
                <strong className="text-destructive"> This action cannot be undone!</strong>
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium text-yellow-800">Warning</span>
                </div>
                <p className="text-sm text-yellow-700 mt-2">
                  <strong>Warning:</strong> Changing base currency will convert all existing product prices 
                  (price, salePrice, comparePrice, costPrice) and update all exchange rates in the database.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newCurrency">New Base Currency</Label>
                <Select value={newBaseCurrency} onValueChange={setNewBaseCurrency}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies
                      .filter(c => c.code !== baseCurrency)
                      .map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.code} - {currency.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="conversionRate">
                  Conversion Rate (1 {baseCurrency} = ? {newBaseCurrency})
                </Label>
                <Input
                  id="conversionRate"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g., 280 for USD→PKR"
                  value={conversionRate}
                  onChange={(e) => setConversionRate(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Example: If 1 USD = 280 PKR, enter 280
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowChangeDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleChangeBaseCurrency}
                disabled={changingCurrency || !newBaseCurrency || !conversionRate}
                className="bg-destructive hover:bg-destructive/90"
              >
                {changingCurrency ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Changing Base Currency...
                  </>
                ) : (
                  <>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Change Base Currency
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add New Exchange Rate Dialog */}
        <Dialog open={showAddRateDialog} onOpenChange={setShowAddRateDialog}>
          <DialogContent className="sm:max-w-md" onOpenAutoFocus={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle>Add New Exchange Rate</DialogTitle>
              <DialogDescription>
                Add a new exchange rate from USD to another currency
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newRateToCurrency">To Currency</Label>
                
                <div className="relative currency-dropdown">
                  <div
                    className="flex items-center justify-between p-3 border rounded-md cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => {
                      setShowCurrencyDropdown(prev => !prev);
                      if (!showCurrencyDropdown) {
                        setTimeout(() => {
                          const searchInput = document.querySelector('.currency-dropdown input') as HTMLInputElement;
                          if (searchInput) searchInput.focus();
                        }, 100);
                      }
                    }}
                  >
                    {newRateToCurrency ? (
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                          {newRateToCurrency}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {currencies.find(c => c.code === newRateToCurrency)?.symbol}
                        </span>
                        <span className="font-medium">
                          {getCurrencyName(newRateToCurrency)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Select a currency</span>
                    )}
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </div>
                  
                  {showCurrencyDropdown && (
                    <div 
                      className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="p-2 border-b">
                        <div className="relative">
                          <Input
                            placeholder="Search currencies..."
                            value={currencySearch}
                            onChange={(e) => setCurrencySearch(e.target.value)}
                            className="pl-8"
                            autoFocus={false}
                          />
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                      
                      <div className="py-1">
                        {filteredCurrencies
                          .filter(c => c.code !== 'USD')
                          .map((currency) => (
                            <div
                              key={currency.code}
                              className={`px-3 py-2 cursor-pointer hover:bg-muted transition-colors ${
                                newRateToCurrency === currency.code ? 'bg-primary/10' : ''
                              }`}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setNewRateToCurrency(currency.code);
                                setShowCurrencyDropdown(false);
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                                    {currency.code}
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    {currency.symbol}
                                  </span>
                                  <span className="font-medium">{currency.name}</span>
                                </div>
                                {currency.isDefault && (
                                  <Badge variant="secondary" className="text-xs">
                                    Default
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        
                        {filteredCurrencies.filter(c => c.code !== 'USD').length === 0 && (
                          <div className="px-3 py-2 text-center text-muted-foreground text-sm">
                            No currencies found matching "{currencySearch}"
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="newRateValue">
                  Exchange Rate (1 USD = ? {newRateToCurrency})
                </Label>
                <Input
                  id="newRateValue"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g., 280 for USD→PKR"
                  value={newRateValue}
                  onChange={(e) => setNewRateValue(e.target.value)}
                  autoFocus={false}
                />
                <p className="text-sm text-muted-foreground">
                  Example: If 1 USD = 280 PKR, enter 280
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddRateDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddNewRate}
                disabled={addingRate || !newRateToCurrency || !newRateValue}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {addingRate ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Adding Rate...
                  </>
                ) : (
                  <>
                    <Calculator className="h-4 w-4 mr-2" />
                    Add Exchange Rate
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Exchange Rate Dialog */}
        <Dialog open={showEditRateDialog} onOpenChange={setShowEditRateDialog}>
          <DialogContent className="sm:max-w-md" onOpenAutoFocus={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle>Edit Exchange Rate</DialogTitle>
              <DialogDescription>
                Update the exchange rate for {editingRate?.fromCurrency} → {editingRate?.toCurrency}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editRate">Exchange Rate</Label>
                <Input
                  id="editRate"
                  type="number"
                  step="0.000001"
                  min="0"
                  placeholder="Enter new rate"
                  value={editRateValue}
                  onChange={(e) => setEditRateValue(e.target.value)}
                  autoFocus={false}
                />
                <p className="text-sm text-muted-foreground">
                  Current rate: {editingRate?.rate} | New rate: {editRateValue}
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditRateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditRateSubmit}>
                Update Rate
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Floating Action Button for Mobile */}
        <div className="md:hidden fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => {
              setShowAddRateDialog(true);
              setCurrencySearch('');
              setNewRateToCurrency('');
              setNewRateValue('');
              setShowCurrencyDropdown(false);
            }}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CurrencyManagement;
