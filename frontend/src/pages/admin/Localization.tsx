import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { buildApiUrl } from '../../config/api';
import { 
  Globe,
  DollarSign, 
  Flag, 
  Edit3, 
  Search, 
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Settings,
  TrendingUp,
  Users,
  Languages,
  Plus,
  MoreVertical,
  Eye,
  Sparkles
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';


interface Language {
  id: number;
  name: string;
  code: string;
  isActive: boolean;
  nativeName: string;
  isRTL: boolean;
}

interface Currency {
  id: number;
  name: string;
  code: string;
  symbol: string;
  isActive: boolean;
  rate: number;
}

interface Country {
  id: number;
  name: string;
  code: string;
  isActive: boolean;
  phoneCode?: string;
  flagEmoji?: string;
}

const Localization: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'languages' | 'currencies' | 'countries'>('languages');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  // Cleanup effect to prevent overlay issues
  useEffect(() => {
    return () => {
      // Cleanup on unmount
      setIsEditDialogOpen(false);
      setIsViewDialogOpen(false);
      setEditingItem(null);
      setViewingItem(null);
      setEditForm({});
    };
  }, []);

  // Reset dialogs when changing tabs
  useEffect(() => {
    setIsEditDialogOpen(false);
    setIsViewDialogOpen(false);
    setEditingItem(null);
    setViewingItem(null);
    setEditForm({});
  }, [activeTab]);

    useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        forceResetDialogs();
      }
      
      if (e.key === 'Escape') {
        if (isEditDialogOpen) {
          handleCloseEditDialog();
        }
        if (isViewDialogOpen) {
          handleCloseViewDialog();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isEditDialogOpen, isViewDialogOpen]);

  const forceResetDialogs = () => {
    // Reset all state
    setIsEditDialogOpen(false);
    setIsViewDialogOpen(false);
    setEditingItem(null);
    setViewingItem(null);
    setEditForm({});
    
    // Find all potential overlay elements
    const allOverlays = document.querySelectorAll('*');
    const overlayElements = Array.from(allOverlays).filter(el => {
      const style = window.getComputedStyle(el);
      const zIndex = parseInt(style.zIndex) || 0;
      return style.position === 'fixed' || 
             style.position === 'absolute' || 
             zIndex > 1000 ||
             el.hasAttribute('data-radix-dialog-overlay') ||
             el.hasAttribute('data-radix-dialog-backdrop') ||
             (el.hasAttribute('role') && el.getAttribute('role') === 'dialog') ||
             el.classList.contains('backdrop-blur') ||
             el.classList.contains('bg-black') ||
             (el.classList.contains('bg-black/50') && el.classList.contains('backdrop-blur-sm')) ||
             (el instanceof HTMLElement && el.style.pointerEvents === 'none');
    });
    
    // Force remove ALL potential overlay elements
    overlayElements.forEach((overlay, index) => {
      if (overlay instanceof HTMLElement) {
        overlay.style.display = 'none';
        overlay.style.pointerEvents = 'none';
        overlay.style.zIndex = '-9999';
        overlay.style.position = 'static';
        overlay.style.top = 'auto';
        overlay.style.left = 'auto';
        overlay.style.right = 'auto';
        overlay.style.bottom = 'auto';
        overlay.style.width = 'auto';
        overlay.style.height = 'auto';
        
        // Try to remove from DOM
        try {
          overlay.remove();
        } catch (e) {
          // Element could not be removed, but is disabled
        }
      }
    });
    
    // Remove any remaining Radix UI portal elements
    const portals = document.querySelectorAll('[data-radix-portal]');
    portals.forEach(portal => {
      if (portal instanceof HTMLElement) {
        portal.remove();
      }
    });
    
    // Force body and html cleanup
    document.body.style.overflow = 'auto';
    document.body.style.pointerEvents = 'auto';
    document.body.style.position = 'static';
    document.documentElement.style.overflow = 'auto';
    
    // Remove any inline styles that might be blocking
    document.body.removeAttribute('style');
    
    // Specifically target any elements that might be covering the tabs
    const potentialBlockers = document.querySelectorAll('.fixed, .absolute, [style*="z-index"], [style*="position"]');
    potentialBlockers.forEach(blocker => {
      if (blocker instanceof HTMLElement) {
        const style = window.getComputedStyle(blocker);
        if (style.zIndex && parseInt(style.zIndex) > 100) {
          blocker.style.display = 'none';
          blocker.style.pointerEvents = 'none';
          blocker.style.zIndex = '-9999';
        }
      }
    });
    
    toast.success('Forced dialog reset! Use Ctrl+Shift+R anytime to reset.');
  };

  // Fetch localization data
  const { data: languagesData, isLoading: languagesLoading } = useQuery({
    queryKey: ['admin-languages'],
    queryFn: async () => {
      const token = await getToken({ template: 'e-commerce' });
      
      const response = await fetch(buildApiUrl('/api/admin/localization/languages'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch languages: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  const { data: currenciesData, isLoading: currenciesLoading } = useQuery({
    queryKey: ['admin-currencies'],
    queryFn: async () => {
      const token = await getToken({ template: 'e-commerce' });
      const response = await fetch(buildApiUrl('/api/admin/localization/currencies'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch currencies');
      return response.json();
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  const { data: countriesData, isLoading: countriesLoading } = useQuery({
    queryKey: ['admin-countries'],
    queryFn: async () => {
      const token = await getToken({ template: 'e-commerce' });
      const response = await fetch(buildApiUrl('/api/admin/localization/countries'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      return response.json();
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  // Update mutations
  const updateLanguage = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const token = await getToken({ template: 'e-commerce' });
      const response = await fetch(buildApiUrl(`/api/admin/localization/languages/${id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update language');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-languages'] });
      toast.success('✅ Language Updated', {
        description: `${editingItem?.name} has been updated`,
        duration: 3000,
      });
      setEditingItem(null);
      setIsEditDialogOpen(false);
      setIsSaving(false);
    },
    onError: (error) => {
      toast.error('Failed to update language');
      setIsSaving(false);
    }
  });

  const updateCurrency = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const token = await getToken({ template: 'e-commerce' });
      const response = await fetch(buildApiUrl(`/api/admin/localization/currencies/${id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update currency');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-currencies'] });
      toast.success('✅ Currency Updated', {
        description: `${editingItem?.name} has been updated`,
        duration: 3000,
      });
      setEditingItem(null);
      setIsEditDialogOpen(false);
      setIsSaving(false);
    },
    onError: (error) => {
      toast.error('Failed to update currency');
      setIsSaving(false);
    }
  });

  const updateCountry = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const token = await getToken({ template: 'e-commerce' });
      const response = await fetch(buildApiUrl(`/api/admin/localization/countries/${id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update country');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-countries'] });
      toast.success('✅ Country Updated', {
        description: `${editingItem?.name} has been updated`,
        duration: 3000,
      });
      setEditingItem(null);
      setIsEditDialogOpen(false);
      setIsSaving(false);
    },
    onError: (error) => {
      toast.error('Failed to update country');
      setIsSaving(false);
    }
  });

  // Filter and search functions
  const filterData = (data: any[], search: string, status: string) => {
    return data.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                           item.code.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status === 'all' || 
                           (status === 'active' && item.isActive) ||
                           (status === 'inactive' && !item.isActive);
      return matchesSearch && matchesStatus;
    });
  };

  const getFilteredData = () => {
    switch (activeTab) {
      case 'languages':
        return filterData(languagesData?.data || [], searchTerm, statusFilter);
      case 'currencies':
        return filterData(currenciesData?.data || [], searchTerm, statusFilter);
      case 'countries':
        return filterData(countriesData?.data || [], searchTerm, statusFilter);
      default:
        return [];
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setEditForm({
      name: item.name,
      code: item.code,
      isActive: item.isActive,
      ...(activeTab === 'currencies' && { symbol: item.symbol, exchangeRate: item.rate }),
      ...(activeTab === 'languages' && { flag: item.flagEmoji, direction: item.isRTL ? 'rtl' : 'ltr' }),
      ...(activeTab === 'countries' && { phoneCode: item.phoneCode, flag: item.flagEmoji })
    });
    setIsEditDialogOpen(true);
  };

  const handleViewDetails = (item: any) => {
    try {
      setViewingItem(item);
      setIsViewDialogOpen(true);
    } catch (error) {
      console.error('Error in handleViewDetails:', error);
      toast.error('Failed to open view details');
    }
  };

  // Helper function to safely get singular form
  const getSingularForm = (tab: string) => {
    switch (tab) {
      case 'languages': return 'language';
      case 'currencies': return 'currency';
      case 'countries': return 'country';
      default: return 'item';
    }
  };

  const handleSave = () => {
    if (!editingItem) return;

    setIsSaving(true);
    const mutation = activeTab === 'languages' ? updateLanguage :
                    activeTab === 'currencies' ? updateCurrency : updateCountry;

    mutation.mutate({ id: editingItem.id, data: editForm });
  };

  const handleCancel = () => {
    setEditingItem(null);
    setEditForm({});
    setIsEditDialogOpen(false);
    setIsSaving(false);
    
    // Show cancellation toast
    toast.info('⏹️ Edit Cancelled', {
      description: 'Changes were not saved',
      duration: 2000,
    });
    
    // Force cleanup to prevent overlay issues
    setTimeout(() => {
      setEditingItem(null);
      setEditForm({});
    }, 100);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingItem(null);
    setEditForm({});
    setIsSaving(false);
    
    // Force cleanup any remaining overlays
    setTimeout(() => {
      const overlays = document.querySelectorAll('[data-radix-dialog-overlay]');
      overlays.forEach((overlay) => {
        if (overlay instanceof HTMLElement) {
          overlay.style.display = 'none';
          overlay.style.pointerEvents = 'none';
        }
      });
      document.body.style.overflow = 'auto';
    }, 50);
  };

  const handleCloseViewDialog = () => {
    setIsViewDialogOpen(false);
    setViewingItem(null);
    
    // Force cleanup any remaining overlays
    setTimeout(() => {
      const overlays = document.querySelectorAll('[data-radix-dialog-overlay]');
      overlays.forEach((overlay) => {
        if (overlay instanceof HTMLElement) {
          overlay.style.display = 'none';
          overlay.style.pointerEvents = 'none';
        }
      });
      document.body.style.overflow = 'auto';
    }, 50);
  };

  const isLoading = languagesLoading || currenciesLoading || countriesLoading;
  const filteredData = getFilteredData();

  const getStats = () => {
    const languages = languagesData?.data || [];
    const currencies = currenciesData?.data || [];
    const countries = countriesData?.data || [];
    
    return {
      totalLanguages: languages.length,
      activeLanguages: languages.filter((l: Language) => l.isActive).length,
      totalCurrencies: currencies.length,
      activeCurrencies: currencies.filter((c: Currency) => c.isActive).length,
      totalCountries: countries.length,
      activeCountries: countries.filter((c: Country) => c.isActive).length,
    };
  };

  const stats = getStats();
  


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Enhanced Header with Better Glassmorphism */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-indigo-600/20 rounded-3xl blur-3xl group-hover:blur-2xl transition-all duration-700"></div>
          <div className="relative bg-white/80 backdrop-blur-2xl rounded-3xl p-8 border border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-500">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="p-3 bg-gradient-to-br from-purple-500 via-blue-600 to-indigo-600 rounded-2xl shadow-lg">
                      <Settings className="w-7 h-7 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      Localization Hub
                    </h1>
                    <p className="text-slate-600 text-base font-medium">Manage your global presence with style</p>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Button
                  size="default"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0"
                  onClick={() => {
                    queryClient.invalidateQueries({ queryKey: ['admin-languages'] });
                    queryClient.invalidateQueries({ queryKey: ['admin-currencies'] });
                    queryClient.invalidateQueries({ queryKey: ['admin-countries'] });
                    toast.success('Refreshing data...');
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Data
                </Button>
                
                
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="relative bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-xl border border-white/40 shadow-xl overflow-hidden">
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Total Languages</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.totalLanguages}</p>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <p className="text-sm text-slate-600 font-medium">{stats.activeLanguages} active</p>
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <Languages className="w-7 h-7 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-xl border border-white/40 shadow-xl overflow-hidden">
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Total Currencies</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalCurrencies}</p>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <p className="text-sm text-slate-600 font-medium">{stats.activeCurrencies} active</p>
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <TrendingUp className="w-7 h-7 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-xl border border-white/40 shadow-xl overflow-hidden">
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Total Countries</p>
                  <p className="text-3xl font-bold text-indigo-600">{stats.totalCountries}</p>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <p className="text-sm text-slate-600 font-medium">{stats.activeCountries} active</p>
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <Users className="w-7 h-7 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modern Tabs */}
        <Card className="relative bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-2xl border border-white/40 shadow-2xl overflow-hidden">
          <div className="w-full">
            <div className="border-b border-slate-200/30 bg-gradient-to-r from-slate-50/50 to-white/50">
              <div className="flex w-full bg-transparent p-0 h-auto">
                {[
                  { id: 'languages', label: 'Languages', icon: Globe, count: stats.totalLanguages, color: 'purple' },
                  { id: 'currencies', label: 'Currencies', icon: DollarSign, count: stats.totalCurrencies, color: 'blue' },
                  { id: 'countries', label: 'Countries', icon: Flag, count: stats.totalCountries, color: 'indigo' }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  const colorClasses = {
                    purple: isActive ? 'text-purple-600 border-purple-500' : 'text-slate-500 hover:text-purple-600',
                    blue: isActive ? 'text-blue-600 border-blue-500' : 'text-slate-500 hover:text-blue-600',
                    indigo: isActive ? 'text-indigo-600 border-indigo-500' : 'text-slate-500 hover:text-indigo-600'
                  };
                  
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setActiveTab(tab.id as 'languages' | 'currencies' | 'countries');
                      }}
                      className={`flex-1 flex items-center justify-center space-x-3 py-5 px-8 border-b-2 font-semibold text-base transition-all duration-500 rounded-none bg-transparent hover:bg-white/30 active:bg-white/50 cursor-pointer select-none ${colorClasses[tab.color as keyof typeof colorClasses]}`}
                      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                      <Badge 
                        variant="secondary" 
                        className={`ml-2 ${
                          isActive 
                            ? tab.color === 'purple' ? 'bg-purple-100 text-purple-700' :
                              tab.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                              'bg-indigo-100 text-indigo-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {tab.count}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </div>


            
            {/* Enhanced Search and Filters */}
            <div className="p-6 border-b border-slate-200/30 bg-gradient-to-r from-slate-50/30 to-white/50">
              <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3">
                <div className="flex-1 w-full sm:w-auto">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      type="text"
                      placeholder={`Search ${activeTab}...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-10 bg-white/80 backdrop-blur-sm border-slate-200/50 focus:border-purple-500 focus:ring-purple-500/20 rounded-lg transition-all duration-300"
                    />
                  </div>
                </div>
                
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                  <SelectTrigger className="w-40 h-10 bg-white/80 backdrop-blur-sm border-slate-200/50 focus:border-purple-500 focus:ring-purple-500/20 rounded-lg">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active Only</SelectItem>
                    <SelectItem value="inactive">Inactive Only</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 px-4 bg-white/80 backdrop-blur-sm border-slate-200/50 hover:bg-white hover:border-purple-300 rounded-lg transition-all duration-300"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>

            {/* Enhanced Content Area */}
            <div className="p-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-purple-200 rounded-full animate-spin"></div>
                    <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-purple-600 rounded-full animate-spin"></div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredData.map((item) => (
                    <div
                      key={item.id}
                      className="relative bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/40 transition-all duration-300 overflow-hidden hover:bg-gradient-to-r hover:from-slate-50/90 hover:to-slate-100/80 hover:border-slate-300/60 hover:shadow-lg"
                    >
                      {/* Modern Display Mode */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-3">
                            {item.flagEmoji && (
                              <div className="p-3 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl shadow-md transition-all duration-300">
                                <span className="text-3xl">{item.flagEmoji}</span>
                              </div>
                            )}
                            
                            <div className="space-y-1">
                              <h3 className="text-lg font-semibold text-slate-900">{item.name}</h3>
                              <p className="text-sm text-slate-500 font-medium">Code: {item.code}</p>
                            </div>
                          </div>

                          {activeTab === 'currencies' && (
                            <div className="flex items-center space-x-2">
                              <div className="px-3 py-1.5 bg-blue-100 rounded-lg">
                                <span className="text-lg font-bold text-blue-700">{item.symbol}</span>
                              </div>
                              <div className="text-xs text-slate-600">
                                Rate: <span className="font-semibold">{item.rate}</span>
                              </div>
                            </div>
                          )}

                          {activeTab === 'languages' && (
                            <div className="flex items-center space-x-2">
                              <Badge 
                                variant="secondary" 
                                className={`px-2 py-1 text-xs font-semibold ${
                                  item.isRTL 
                                    ? 'bg-orange-100 text-orange-700 border-orange-200' 
                                    : 'bg-green-100 text-green-700 border-green-200'
                                }`}
                              >
                                {item.isRTL ? 'RTL' : 'LTR'}
                              </Badge>
                              <span className="text-xs text-slate-600">
                                Native: <span className="font-semibold">{item.nativeName}</span>
                              </span>
                            </div>
                          )}

                          {activeTab === 'countries' && (
                            <div className="flex items-center space-x-2">
                              {item.phoneCode && (
                                <div className="px-2 py-1.5 bg-indigo-100 rounded-lg">
                                  <span className="text-xs font-semibold text-indigo-700">{item.phoneCode}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            {item.isActive ? (
                              <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl shadow-sm">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-semibold text-green-700">Active</span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-red-100 to-rose-100 rounded-xl shadow-sm">
                                <XCircle className="w-4 h-4 text-red-600" />
                                <span className="text-sm font-semibold text-red-700">Inactive</span>
                              </div>
                            )}
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 w-9 p-0 hover:bg-slate-100/80 rounded-xl transition-all duration-300"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44 bg-white/95 backdrop-blur-2xl border-slate-200/40 rounded-xl shadow-2xl">
                              <DropdownMenuItem onClick={() => handleEdit(item)} className="cursor-pointer">
                                <Edit3 className="w-3 h-3 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleViewDetails(item)} className="cursor-pointer">
                                <Eye className="w-3 h-3 mr-2" />
                                View Details
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredData.length === 0 && (
                    <div className="text-center py-16">
                      <div className="relative mx-auto mb-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center shadow-lg">
                          <AlertCircle className="w-10 h-10 text-slate-400" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full animate-pulse"></div>
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-3">No {activeTab} found</h3>
                      <p className="text-base text-slate-600 max-w-lg mx-auto leading-relaxed">
                        {searchTerm || statusFilter !== 'all' 
                          ? 'Try adjusting your search or filters to find what you\'re looking for'
                          : `No ${activeTab} have been added yet. Get started by adding your first ${activeTab.slice(0, -1)}.`
                        }
                      </p>
                      {!searchTerm && statusFilter === 'all' && (
                        <Button className="mt-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg rounded-xl transition-all duration-300">
                          <Plus className="w-5 h-5 mr-2" />
                          Add {activeTab.slice(0, -1)}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Enhanced Edit Dialog */}
        {isEditDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            {/* Enhanced Backdrop */}
            <div 
              className="fixed inset-0 bg-gradient-to-br from-black/60 via-purple-900/20 to-blue-900/20 backdrop-blur-md"
              onClick={handleCloseEditDialog}
            />
            
            {/* Enhanced Dialog Content */}
            <div className="relative w-full max-w-5xl mx-4 bg-gradient-to-br from-white via-slate-50/50 to-white border border-white/40 shadow-3xl rounded-3xl overflow-hidden">
              {/* Enhanced Header with Icon */}
              <div className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 px-8 py-8">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                    <Edit3 className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white">
                      Edit {getSingularForm(activeTab)}
                    </h2>
                    <p className="text-white/80 mt-1 text-lg">
                      Update details for <span className="font-semibold">{editingItem?.name || 'this item'}</span>
                    </p>
                  </div>
                </div>
                
                {/* Close Button */}
                <button
                  onClick={handleCloseEditDialog}
                  className="absolute top-6 right-6 p-3 hover:bg-white/20 rounded-2xl transition-all duration-300 hover:scale-110"
                >
                  <XCircle className="w-6 h-6 text-white" />
                </button>
              </div>
            
            {editingItem && (
              <div className="p-8">
                {/* Form Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800 flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Basic Information</span>
                    </h3>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Name</label>
                        <Input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="h-12 bg-white border-slate-200 focus:border-purple-500 focus:ring-purple-500/20 rounded-xl shadow-sm transition-all duration-300"
                          placeholder="Enter name..."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Code</label>
                        <Input
                          type="text"
                          value={editForm.code}
                          onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                          className="h-12 bg-white border-slate-200 focus:border-purple-500 focus:ring-purple-500/20 rounded-xl shadow-sm transition-all duration-300"
                          placeholder="Enter code..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tab-Specific Fields */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800 flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>{activeTab === 'currencies' ? 'Currency Details' : activeTab === 'languages' ? 'Language Settings' : 'Country Info'}</span>
                    </h3>
                    
                    <div className="space-y-3">
                      {activeTab === 'currencies' && (
                        <>
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Symbol</label>
                            <Input
                              type="text"
                              value={editForm.symbol}
                              onChange={(e) => setEditForm({ ...editForm, symbol: e.target.value })}
                              className="h-12 bg-white border-slate-200 focus:border-purple-500 focus:ring-purple-500/20 rounded-xl shadow-sm transition-all duration-300"
                              placeholder="$, €, ¥..."
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Exchange Rate</label>
                            <Input
                              type="number"
                              step="0.01"
                              value={editForm.exchangeRate}
                              onChange={(e) => setEditForm({ ...editForm, exchangeRate: parseFloat(e.target.value) })}
                              className="h-12 bg-white border-slate-200 focus:border-purple-500 focus:ring-purple-500/20 rounded-xl shadow-sm transition-all duration-300"
                              placeholder="1.00"
                            />
                          </div>
                        </>
                      )}

                      {activeTab === 'languages' && (
                        <>
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Flag Emoji</label>
                            <Input
                              type="text"
                              value={editForm.flag || ''}
                              onChange={(e) => setEditForm({ ...editForm, flag: e.target.value })}
                              placeholder="🇺🇸"
                              className="h-12 bg-white border-slate-200 focus:border-purple-500 focus:ring-purple-500/20 rounded-xl shadow-sm transition-all duration-300 text-center text-2xl"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Text Direction</label>
                            <Select value={editForm.direction} onValueChange={(value) => setEditForm({ ...editForm, direction: value })}>
                              <SelectTrigger className="h-12 bg-white border-slate-200 focus:border-purple-500 focus:ring-purple-500/20 rounded-xl shadow-sm transition-all duration-300">
                                <SelectValue placeholder="Select direction" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ltr">Left to Right (LTR)</SelectItem>
                                <SelectItem value="rtl">Right to Left (RTL)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}

                      {activeTab === 'countries' && (
                        <>
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Code</label>
                            <Input
                              type="text"
                              value={editForm.phoneCode || ''}
                              onChange={(e) => setEditForm({ ...editForm, phoneCode: e.target.value })}
                              placeholder="+1"
                              className="h-12 bg-white border-slate-200 focus:border-purple-500 focus:ring-purple-500/20 rounded-xl shadow-sm transition-all duration-300"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Flag Emoji</label>
                            <Input
                              type="text"
                              value={editForm.flag || ''}
                              onChange={(e) => setEditForm({ ...editForm, flag: e.target.value })}
                              placeholder="🇺🇸"
                              className="h-12 bg-white border-slate-200 focus:border-purple-500 focus:ring-purple-500/20 rounded-xl shadow-sm transition-all duration-300 text-center text-2xl"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800 flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Status & Actions</span>
                    </h3>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                        <Select value={editForm.isActive ? 'active' : 'inactive'} onValueChange={(value) => setEditForm({ ...editForm, isActive: value === 'active' })}>
                          <SelectTrigger className="h-12 bg-white border-slate-200 focus:border-purple-500 focus:ring-purple-500/20 rounded-xl shadow-sm transition-all duration-300">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">🟢 Active</SelectItem>
                            <SelectItem value="inactive">🔴 Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="pt-4">
                        <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200/50">
                          <p className="text-sm text-slate-600 font-medium">
                            💡 Make sure all required fields are filled before saving
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Action Buttons */}
                <div className="flex items-center justify-between pt-8 border-t border-slate-200/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-slate-500">Ready to save changes</span>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      className="h-12 px-8 bg-white border-slate-300 hover:bg-slate-50 hover:border-slate-400 rounded-xl transition-all duration-300 font-medium"
                    >
                      Cancel
                    </Button>
                    
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="h-12 px-8 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-5 h-5 mr-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Saving Changes...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-3" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
            </div>
          </div>
        )}

        {/* Enhanced View Details Dialog */}
        {isViewDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            {/* Enhanced Backdrop */}
            <div 
              className="fixed inset-0 bg-gradient-to-br from-black/60 via-purple-900/20 to-blue-900/20 backdrop-blur-md"
              onClick={handleCloseViewDialog}
            />
            
            {/* Enhanced Dialog Content */}
            <div className="relative w-full max-w-4xl mx-4 bg-gradient-to-br from-white via-slate-50/50 to-white border border-white/40 shadow-3xl rounded-3xl overflow-hidden">
              {/* Enhanced Header with Icon */}
              <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 px-8 py-8">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                    <Eye className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white">
                      {viewingItem?.name || 'Item'} Details
                    </h2>
                    <p className="text-white/80 mt-1 text-lg">
                      Complete information about this {getSingularForm(activeTab)}
                    </p>
                  </div>
                </div>
                
                {/* Close Button */}
                <button
                  onClick={handleCloseViewDialog}
                  className="absolute top-6 right-6 p-3 hover:bg-white/20 rounded-2xl transition-all duration-300 hover:scale-110"
                >
                  <XCircle className="w-6 h-6 text-white" />
                </button>
              </div>
            
            {viewingItem ? (
              <div className="p-8">
                {/* Hero Section */}
                <div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 rounded-3xl p-8 mb-8 border border-slate-200/50">
                  <div className="flex items-center space-x-6">
                    {viewingItem.flagEmoji && (
                      <div className="p-6 bg-white rounded-3xl shadow-xl border border-slate-200/50">
                        <span className="text-6xl">{viewingItem.flagEmoji}</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-4xl font-bold text-slate-900 mb-2">{viewingItem.name}</h3>
                      <p className="text-xl text-slate-600 font-medium">Code: <span className="font-mono bg-slate-100 px-3 py-1 rounded-lg">{viewingItem.code}</span></p>
                      
                      {/* Status Badge */}
                      <div className="mt-4">
                        <Badge 
                          variant={viewingItem.isActive ? "default" : "destructive"}
                          className="px-4 py-2 text-base font-semibold"
                        >
                          {viewingItem.isActive ? '🟢 Active' : '🔴 Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Information Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  {/* Main Details */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-slate-800 flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span>Details</span>
                    </h3>
                    
                    <div className="space-y-4">
                      {activeTab === 'currencies' && (
                        <>
                          <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200/50 shadow-sm">
                            <span className="text-base font-medium text-slate-700">Currency Symbol</span>
                            <span className="text-2xl font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl">{viewingItem.symbol}</span>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200/50 shadow-sm">
                            <span className="text-base font-medium text-slate-700">Exchange Rate</span>
                            <span className="text-xl font-semibold text-slate-700 bg-slate-50 px-4 py-2 rounded-xl">{viewingItem.rate}</span>
                          </div>
                        </>
                      )}

                      {activeTab === 'languages' && (
                        <>
                          <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200/50 shadow-sm">
                            <span className="text-base font-medium text-slate-700">Native Name</span>
                            <span className="text-lg font-semibold text-slate-700 bg-slate-50 px-4 py-2 rounded-xl">{viewingItem.nativeName}</span>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200/50 shadow-sm">
                            <span className="text-base font-medium text-slate-700">Text Direction</span>
                            <Badge 
                              variant="secondary"
                              className={`px-4 py-2 text-base font-semibold ${
                                viewingItem.isRTL 
                                  ? 'bg-orange-100 text-orange-700 border-orange-200' 
                                  : 'bg-green-100 text-green-700 border-green-200'
                              }`}
                            >
                              {viewingItem.isRTL ? '➡️ Right to Left (RTL)' : '⬅️ Left to Right (LTR)'}
                            </Badge>
                          </div>
                        </>
                      )}

                      {activeTab === 'countries' && viewingItem.phoneCode && (
                        <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200/50 shadow-sm">
                          <span className="text-base font-medium text-slate-700">Phone Code</span>
                          <span className="text-xl font-semibold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl">{viewingItem.phoneCode}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-slate-800 flex items-center space-x-3">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span>Quick Actions</span>
                    </h3>
                    
                    <div className="space-y-4">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => {
                          setIsViewDialogOpen(false);
                          handleEdit(viewingItem);
                        }}
                        className="w-full justify-start bg-white border-slate-300 hover:bg-slate-50 hover:border-purple-400 h-14 text-base font-medium rounded-2xl transition-all duration-300"
                      >
                        <Edit3 className="w-5 h-5 mr-3" />
                        Edit {getSingularForm(activeTab)}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full justify-start bg-white border-slate-300 hover:bg-slate-50 hover:border-blue-400 h-14 text-base font-medium rounded-2xl transition-all duration-300"
                      >
                        <Eye className="w-5 h-5 mr-3" />
                        View Usage Statistics
                      </Button>
                      
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl border border-purple-200/50">
                        <h4 className="font-semibold text-slate-800 mb-2 flex items-center">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                          Quick Info
                        </h4>
                        <p className="text-sm text-slate-600">
                          This {getSingularForm(activeTab)} is currently {viewingItem.isActive ? 'active' : 'inactive'} and available for use in the system.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No Item Selected</h3>
                <p className="text-slate-500">Please select an item to view its details.</p>
              </div>
            )}
            </div>
          </div>
        )}
        
        {/* Toast notifications */}
        <Toaster position="top-right" richColors />
        </div>
      </div>
    );
  };

export default Localization;
