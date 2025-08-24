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
  ChevronDown
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

  // Create authenticated API instance (same as DeliveryScope)
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

  // Fetch data (same pattern as DeliveryScope)
  const fetchData = async () => {
    try {
      setLoading(true);
      
      const api = await createAuthenticatedApi();
      
      const [baseResponse, ratesResponse, currenciesResponse] = await Promise.all([
        api.get('/admin/currency/base-currency'),
        api.get('/admin/currency/exchange-rates'),
        api.get('/admin/currency/currencies')
      ]);

      console.log('🔍 Debug - Base currency response:', baseResponse.data);
      console.log('🔍 Debug - Exchange rates response:', ratesResponse.data);
      console.log('🔍 Debug - Currencies response:', currenciesResponse.data);

      // Handle new base currency response format
      if (baseResponse.data && baseResponse.data.code) {
        setBaseCurrency(baseResponse.data.code);
        setBaseCurrencyInfo(baseResponse.data);
      } else {
        setBaseCurrency('USD');
        setBaseCurrencyInfo(null);
      }
      
      // Convert string rates to numbers and ensure proper data structure
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

  // Load data on component mount (same as DeliveryScope)
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
      
      // Refresh data
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

  // Add new exchange rate function
  const handleAddNewRate = async () => {
    if (!newRateToCurrency || !newRateValue) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setAddingRate(true);
      const api = await createAuthenticatedApi();
      
      // Create new exchange rate from USD to selected currency
      const response = await api.post('/admin/currency/exchange-rates', {
        fromCurrency: 'USD',
        toCurrency: newRateToCurrency,
        rate: parseFloat(newRateValue),
        source: 'Manual'
      });

      toast.success('New exchange rate added successfully!');
      setShowAddRateDialog(false);
      setNewRateToCurrency('');
      setNewRateValue('');
      
      // Refresh the exchange rates list
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

      console.log('✅ Rate updated successfully:', response.data);

      // Update local state with the response data (ensuring proper types)
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

  // Filter currencies based on search
  const filteredCurrencies = currencies.filter(currency => 
    currency.code.toLowerCase().includes(currencySearch.toLowerCase()) ||
    currency.name.toLowerCase().includes(currencySearch.toLowerCase())
  );

  // Close dropdown when clicking outside
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
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Currency Management</h1>
          <p className="text-muted-foreground">
            Manage your business base currency and exchange rates. Change base currency to automatically update all product prices.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
                      <Button onClick={() => {
              setShowAddRateDialog(true);
              setCurrencySearch('');
              setNewRateToCurrency('');
              setNewRateValue('');
              setShowCurrencyDropdown(false);
            }}>
              <Calculator className="h-4 w-4 mr-2" />
              Add New Rate
            </Button>
        </div>
      </div>

      {/* Current Base Currency */}
      <Card>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {baseCurrencyInfo ? `${baseCurrencyInfo.symbol} ${baseCurrencyInfo.code}` : baseCurrency || 'Not loaded'}
              </Badge>
              <span className="text-muted-foreground">
                {baseCurrencyInfo ? baseCurrencyInfo.name : getCurrencyName(baseCurrency)}
              </span>
            </div>
            <Button onClick={() => setShowChangeDialog(true)} disabled={!baseCurrency}>
              <Settings className="h-4 w-4 mr-2" />
              Change Base Currency
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Exchange Rates */}
      <Card>
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
        <CardContent>
          <div className="space-y-4">
            {exchangeRates && exchangeRates.length > 0 ? (
              exchangeRates
                .map((rate) => {
                  // Ensure rate.rate is a valid number
                  const rateValue = typeof rate.rate === 'number' ? rate.rate : 
                                  typeof rate.rate === 'string' ? parseFloat(rate.rate) : 0;
                  
                  if (isNaN(rateValue)) {
                    console.warn('Invalid rate value:', rate.rate, 'for rate:', rate);
                    return null; // Skip invalid rates
                  }

                  return (
                    <div key={rate.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{rate.fromCurrency}</Badge>
                          <span>→</span>
                          <Badge variant="outline">{rate.toCurrency}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {getCurrencyName(rate.toCurrency)}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="font-mono text-lg">
                            {rateValue.toFixed(6).replace(/\.?0+$/, '')}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {rate.source} • {formatDate(rate.lastUpdated)}
                          </div>
                        </div>
                        
                        {!rate.isBase && (
                          <div className="flex items-center space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => openEditRateDialog(rate)}
                            >
                              Edit
                            </Button>
                          </div>
                        )}
                        
                        {rate.isBase && (
                          <Badge variant="secondary">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Base
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                }).filter(Boolean) // Remove null values
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No exchange rates found. Click Refresh to load data.
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
              
              {/* Searchable Dropdown */}
              <div className="relative currency-dropdown">
                <div
                  className="flex items-center justify-between p-3 border rounded-md cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => {
                    setShowCurrencyDropdown(prev => !prev);
                    // Focus on search input when dropdown opens
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
                
                {/* Dropdown Menu */}
                {showCurrencyDropdown && (
                  <div 
                    className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Search Input */}
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
                    
                    {/* Currency Options */}
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
    </div>
  );
};

export default CurrencyManagement;
