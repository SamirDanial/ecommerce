import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Settings, 
  ShoppingBag, 
  MapPin, 
  Shield, 
  Star,
  Loader2
} from 'lucide-react';
import { useClerkAuth } from '../hooks/useClerkAuth';
import { useProfile } from '../hooks/useProfile';
import { useConfig } from '../hooks/useConfig';

import { timezoneService } from '../services/timezoneService';

import { toast } from 'sonner';
import { UserPreferences } from '../services/profileService';

import OrdersSection from '../components/OrdersSection';
import AddressSection from '../components/AddressSection';
import PreferencesSection from '../components/PreferencesSection';
import SecuritySection from '../components/SecuritySection';

const UserProfile: React.FC = () => {
    const { isAuthenticated } = useClerkAuth();
  const { useLanguages } = useConfig();
  const { data: languages, isLoading: languagesLoading, error: languagesError } = useLanguages();
  
  const [activeTab, setActiveTab] = useState<string>('orders');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 3;

  // Use React Query hooks
  const {
    useOrders,
    useOrderDetails,
    useAddresses,
    usePreferences,
    useSessions,
    useUpdatePreferences,
    useDeleteAddress,
    useAddAddress,
    useUpdateAddress,
    useRevokeSession,
  } = useProfile();

  const {
    useCurrencies,
    useCountries,
  } = useConfig();

  // Data queries
  const { data: ordersData, isLoading: ordersLoading, error: ordersError } = useOrders(currentPage, ordersPerPage);
  const { data: addresses = [], isLoading: addressesLoading, error: addressesError } = useAddresses();
  const { data: preferences, isLoading: preferencesLoading, error: preferencesError } = usePreferences();
  const { data: sessions = [], isLoading: sessionsLoading, error: sessionsError } = useSessions();
  
  // Configuration data queries
  const { data: currencies = [], isLoading: currenciesLoading, error: currenciesError } = useCurrencies();
  const { data: countries = [], isLoading: countriesLoading, error: countriesError } = useCountries();
  
  // Timezone data
  const timezones = timezoneService.getAvailableTimezones();

  // Extract orders and pagination data
  const orders = ordersData?.orders || [];
  const pagination = ordersData?.pagination;

  // Pagination calculations
  const totalPages = pagination?.pages || 1;

  // Only reset page when total pages decrease (e.g., due to order deletion)
  // This prevents the page jumping issue during normal pagination
  useEffect(() => {
    if (pagination?.pages && currentPage > pagination.pages) {
      setCurrentPage(pagination.pages);
    }
  }, [pagination?.pages, currentPage]); // Include currentPage dependency

  // Custom page change handlers
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Mutations
  const updatePreferencesMutation = useUpdatePreferences();
  const deleteAddressMutation = useDeleteAddress();

  const addAddressMutation = useAddAddress();
  const updateAddressMutation = useUpdateAddress();
  const revokeSessionMutation = useRevokeSession();

  // State for preferences
  const [localPreferences, setLocalPreferences] = useState<UserPreferences>({
    emailNotifications: true,
    smsNotifications: true,
    marketingEmails: false,
    orderUpdates: true,
    promotionalOffers: false,
    newsletter: false,
    language: 'en',
    currency: 'USD',
    timezone: timezoneService.getBrowserTimezone()
  });

  // Update local preferences when backend data loads
  useEffect(() => {
    if (preferences && preferences.id) {
      // Create new preferences object with defaults for missing values
      const updatedPreferences = {
        emailNotifications: preferences.emailNotifications ?? true,
        smsNotifications: preferences.smsNotifications ?? true,
        marketingEmails: preferences.marketingEmails ?? false,
        orderUpdates: preferences.orderUpdates ?? true,
        promotionalOffers: preferences.promotionalOffers ?? false,
        newsletter: preferences.newsletter ?? false,
        language: preferences.language || 'en',
        currency: preferences.currency || 'USD',
        timezone: preferences.timezone || timezoneService.getBrowserTimezone()
      };
      setLocalPreferences(updatedPreferences);
      toast.success('Preferences loaded successfully!');
    }
  }, [preferences]);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in</h1>
          <p className="text-muted-foreground">You need to be logged in to view your profile.</p>
        </div>
      </div>
    );
  }

  if (ordersLoading || addressesLoading || preferencesLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="max-w-md mx-auto text-center">
          <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin" />
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (ordersError || addressesError || preferencesError) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="max-w-md mx-auto text-center">
          <p className="text-red-500">Failed to load user data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            My Account
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Manage your orders, addresses, and preferences
          </p>
        </div>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6 sm:mb-8">
            <TabsTrigger value="orders" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <ShoppingBag className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Orders</span>
              <span className="sm:hidden">Orders</span>
            </TabsTrigger>
            <TabsTrigger value="addresses" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Addresses</span>
              <span className="sm:hidden">Addr</span>
            </TabsTrigger>

            <TabsTrigger value="preferences" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Preferences</span>
              <span className="sm:hidden">Prefs</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Security</span>
              <span className="sm:hidden">Sec</span>
            </TabsTrigger>

          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
          <OrdersSection
            orders={orders}
            ordersLoading={ordersLoading}
            pagination={pagination}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            useOrderDetails={useOrderDetails}
          />
          </TabsContent>

          {/* Addresses Tab */}
          <TabsContent value="addresses" className="space-y-6">
            <AddressSection
              addresses={addresses}
              addressesLoading={addressesLoading}
              addressesError={addressesError}
              addAddressMutation={addAddressMutation}
              updateAddressMutation={updateAddressMutation}
              deleteAddressMutation={deleteAddressMutation}
              countries={countries}
            />
          </TabsContent>
          {/* Enhanced Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <PreferencesSection
              preferences={preferences}
              localPreferences={localPreferences}
              setLocalPreferences={setLocalPreferences}
              updatePreferencesMutation={updatePreferencesMutation}
              languages={languages}
              languagesLoading={languagesLoading}
              languagesError={languagesError}
              currencies={currencies}
              currenciesLoading={currenciesLoading}
              currenciesError={currenciesError}
              timezones={timezones}
            />
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <SecuritySection
              sessions={sessions}
              sessionsLoading={sessionsLoading}
              sessionsError={sessionsError}
              revokeSessionMutation={revokeSessionMutation}
            />
          </TabsContent>
        </Tabs>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <Card>
            <CardContent className="p-4 text-center">
              <ShoppingBag className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{orders.length}</p>
              <p className="text-sm text-muted-foreground">Total Orders</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Star className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
              <p className="text-2xl font-bold">12</p>
              <p className="text-sm text-muted-foreground">Wishlist Items</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Star className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
              <p className="text-2xl font-bold">4.8</p>
              <p className="text-sm text-muted-foreground">Average Rating</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <MapPin className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold">{addresses.length}</p>
              <p className="text-sm text-muted-foreground">Saved Addresses</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
