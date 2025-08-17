import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore, shippingCosts } from '../stores/cartStore';
import { useClerkAuth } from '../hooks/useClerkAuth';
import { useProfile } from '../hooks/useProfile';
import { getSavedAddresses, SavedAddress, createAddress, updateAddress, deleteAddress, CreateAddressRequest } from '../services/addressService';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripePaymentForm from '../components/StripePaymentForm';
import AddressSelector from '../components/AddressSelector';
import AddressFormSidebar from '../components/AddressFormSidebar';
import { CurrencySelector } from '../components/CurrencySelector';
import { LanguageSelector } from '../components/LanguageSelector';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { toast } from 'sonner';
import { ShoppingCart, CreditCard, MapPin, ArrowLeft, Globe, Truck, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';

// Load Stripe (you'll need to add your publishable key to environment variables)
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_test_key_here');

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, getToken } = useClerkAuth();
  const [currentStep, setCurrentStep] = useState<'address' | 'payment'>('address');
  const [discountCode, setDiscountCode] = useState('');
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'cod'>('stripe');
  
  // Address management state
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<SavedAddress | null>(null);
  const [showAddressSidebar, setShowAddressSidebar] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [hasInitializedAddresses, setHasInitializedAddresses] = useState(false);
  const [addressLoadError, setAddressLoadError] = useState<string | null>(null);
  
  // Use ref to prevent infinite loops
  const hasLoadedAddresses = useRef(false);

  // User preferences hook
  const { usePreferences } = useProfile();
  const { data: preferences, isLoading: preferencesLoading } = usePreferences();

  // Mapping functions to convert between frontend and backend codes
  const toFrontendLanguageCode = (backendCode: string): string => {
    const reverseLanguageMap: Record<string, string> = {
      'ENGLISH': 'en', 'SPANISH': 'es', 'FRENCH': 'fr', 'GERMAN': 'de', 'ITALIAN': 'it',
      'PORTUGUESE': 'pt', 'RUSSIAN': 'ru', 'CHINESE': 'zh', 'JAPANESE': 'ja', 'KOREAN': 'ko',
      'ARABIC': 'ar', 'HINDI': 'hi', 'URDU': 'ur', 'BENGALI': 'bn', 'TAMIL': 'ta',
      'TELUGU': 'te', 'MARATHI': 'mr', 'GUJARATI': 'gu', 'KANNADA': 'kn', 'MALAYALAM': 'ml',
      'PUNJABI': 'pa', 'THAI': 'th', 'VIETNAMESE': 'vi', 'INDONESIAN': 'id', 'MALAY': 'ms',
      'FILIPINO': 'fil', 'TURKISH': 'tr', 'POLISH': 'pl', 'DUTCH': 'nl', 'SWEDISH': 'sv',
      'NORWEGIAN': 'no', 'DANISH': 'da', 'FINNISH': 'fi', 'GREEK': 'el', 'HEBREW': 'he',
      'PERSIAN': 'fa', 'HUNGARIAN': 'hu', 'ROMANIAN': 'ro', 'CZECH': 'cs', 'SLOVAK': 'sk',
      'CROATIAN': 'hr', 'SLOVENIAN': 'sl', 'BULGARIAN': 'bg', 'MACEDONIAN': 'mk',
      'SERBIAN': 'sr', 'UKRAINIAN': 'uk', 'BELARUSIAN': 'be', 'ESTONIAN': 'et',
      'LATVIAN': 'lv', 'LITHUANIAN': 'lt', 'ICELANDIC': 'is', 'IRISH': 'ga',
      'WELSH': 'cy', 'SCOTTISH_GAELIC': 'gd', 'MALTESE': 'mt', 'CATALAN': 'ca',
      'BASQUE': 'eu', 'GALICIAN': 'gl', 'BRETON': 'br', 'OCCITAN': 'oc',
      'CORSICAN': 'co', 'SARDINIAN': 'sc', 'SICILIAN': 'scn', 'VENETIAN': 'vec',
      'LOMBARD': 'lmo', 'PIEDMONTESE': 'pms', 'LIGURIAN': 'lij', 'EMILIAN': 'egl',
      'ROMAGNOL': 'rgn', 'TUSCAN': 'tus', 'UMBRIAN': 'umb', 'MARCHIGIANO': 'mrc',
      'ABRUZZESE': 'abz', 'MOLISAN': 'mol', 'PUGLIESE': 'pug', 'CALABRESE': 'cal',
      'APULIAN': 'ap', 'ALBANIAN': 'sq', 'ARMENIAN': 'hy', 'GEORGIAN': 'ka',
      'AZERBAIJANI': 'az', 'KAZAKH': 'kk', 'UZBEK': 'uz', 'KYRGYZ': 'ky',
      'TAJIK': 'tg', 'TURKMEN': 'tk', 'MONGOLIAN': 'mn', 'BURMESE': 'my',
      'KHMER': 'km', 'LAO': 'lo', 'NEPALI': 'ne', 'SINHALA': 'si',
      'SINDHI': 'sd', 'KASHMIRI': 'ks', 'ORIYA': 'or', 'ASSAMESE': 'as',
      'KURDISH': 'ku', 'PASHTO': 'ps', 'DIVEHI': 'dv', 'TIBETAN': 'bo',
      'UYGHUR': 'ug', 'SICHUAN_YI': 'ii', 'AMHARIC': 'am', 'TIGRINYA': 'ti',
      'OROMO': 'om', 'SOMALI': 'so', 'SWAHILI': 'sw', 'ZULU': 'zu',
      'XHOSA': 'xh', 'AFRIKAANS': 'af', 'SESOTHO': 'st', 'TSWANA': 'tn',
      'TSONGA': 'ts', 'VENDA': 've', 'NDEBELE': 'nr', 'SWATI': 'ss',
      'SHONA': 'sn', 'GANDA': 'lg', 'KINYARWANDA': 'rw', 'AKAN': 'ak',
      'YORUBA': 'yo', 'IGBO': 'ig', 'HAUSA': 'ha', 'FULAH': 'ff',
      'WOLOF': 'wo', 'BAMBARA': 'bm', 'DYULA': 'dy', 'NORTHERN_SAMI': 'se',
      'SAMOAN': 'sm', 'TONGA': 'to', 'FIJIAN': 'fj', 'MAORI': 'mi',
      'HAWAIIAN': 'haw', 'QUECHUA': 'qu', 'AYMARA': 'ay', 'GUARANI': 'gn',
      'HAITIAN_CREOLE': 'ht', 'JAVANESE': 'jv', 'SUNDANESE': 'su',
      'CEBUANO': 'ceb', 'ILOKANO': 'ilo', 'WARAY': 'war', 'BICOLANO': 'bik',
      'PAMPANGA': 'pam', 'PANGASINAN': 'pag', 'HILIGAYNON': 'hil',
      'KRIO': 'kri', 'NIGERIAN_PIDGIN': 'pcm', 'JAMAICAN_CREOLE': 'jam',
      'SRANAN_TONGO': 'srn', 'TOK_PISIN': 'tpi', 'BISLAMA': 'bi',
      'CHAMORRO': 'ch', 'MARSHALLESE': 'mh', 'NAURUAN': 'na',
      'GREENLANDIC': 'kl', 'INUKTITUT': 'iu', 'CREE': 'cr',
      'OJIBWA': 'oj', 'NAVAJO': 'nv', 'YIDDISH': 'yi', 'LUXEMBOURGISH': 'lb',
      'SWISS_GERMAN': 'gsw', 'ROMANSH': 'rm', 'FRIULIAN': 'fur',
      'LADIN': 'lld', 'NEAPOLITAN': 'nap', 'FAROESE': 'fo',
      'NORWEGIAN_NYNORSK': 'nn', 'NORWEGIAN_BOKMAL': 'nb',
      'OLD_PRUSSIAN': 'prg', 'OLD_IRISH': 'sga', 'MIDDLE_IRISH': 'mga',
      'PRIMITIVE_IRISH': 'pgl', 'CLASSICAL_ARMENIAN': 'xcl',
      'NORTHERN_LURI': 'lrc', 'MAZANDERANI': 'mzn', 'GILAKI': 'glk',
      'CENTRAL_KURDISH': 'ckb', 'SOUTHERN_KURDISH': 'sdh',
      'LURI': 'lki', 'GURANI': 'hac'
    };
    return reverseLanguageMap[backendCode] || 'en';
  };

  const toFrontendCurrencyCode = (backendCode: string): string => {
    const reverseCurrencyMap: Record<string, string> = {
      'USD': 'USD', 'EUR': 'EUR', 'GBP': 'GBP', 'JPY': 'JPY', 'CNY': 'CNY',
      'INR': 'INR', 'PKR': 'PKR', 'CAD': 'CAD', 'AUD': 'AUD', 'CHF': 'CHF',
      'SEK': 'SEK', 'NOK': 'NOK', 'DKK': 'DKK', 'PLN': 'PLN', 'CZK': 'CZK',
      'HUF': 'HUF', 'RUB': 'RUB', 'TRY': 'TRY', 'BRL': 'BRL', 'MXN': 'MXN',
      'ARS': 'ARS', 'CLP': 'CLP', 'COP': 'COP', 'PEN': 'PEN', 'UYU': 'UYU',
      'VND': 'VND', 'THB': 'THB', 'MYR': 'MYR', 'SGD': 'SGD', 'HKD': 'HKD',
      'KRW': 'KRW', 'TWD': 'TWD', 'PHP': 'PHP', 'IDR': 'IDR', 'ZAR': 'ZAR',
      'EGP': 'EGP', 'NGN': 'NGN', 'KES': 'KES', 'GHS': 'GHS', 'MAD': 'MAD',
      'TND': 'TND', 'AED': 'AED', 'SAR': 'SAR', 'QAR': 'QAR', 'KWD': 'KWD',
      'BHD': 'BHD', 'OMR': 'OMR', 'JOD': 'JOD', 'LBP': 'LBP', 'ILS': 'ILS',
      'IRR': 'IRR', 'AFN': 'AFN', 'BDT': 'BDT', 'LKR': 'LKR', 'NPR': 'NPR',
      'MMK': 'MMK', 'KHR': 'KHR', 'LAK': 'LAK', 'MNT': 'MNT', 'KZT': 'KZT',
      'UZS': 'UZS', 'TJS': 'TJS', 'TMT': 'TMT', 'AZN': 'AZN', 'GEL': 'GEL',
      'AMD': 'AMD', 'BYN': 'BYN', 'MDL': 'MDL', 'UAH': 'UAH', 'RON': 'RON',
      'BGN': 'BGN', 'HRK': 'HRK', 'RSD': 'RSD', 'MKD': 'MKD', 'ALL': 'ALL',
      'XCD': 'XCD', 'BBD': 'BBD', 'JMD': 'JMD', 'TTD': 'TTD', 'BZD': 'BZD',
      'GTQ': 'GTQ', 'HNL': 'HNL', 'NIO': 'NIO', 'CRC': 'CRC', 'PAB': 'PAB',
      'BOB': 'BOB', 'PYG': 'PYG', 'GYD': 'GYD', 'SRD': 'SRD', 'FJD': 'FJD',
      'PGK': 'PGK', 'WST': 'WST', 'TOP': 'TOP', 'VUV': 'VUV', 'SBD': 'SBD',
      'KID': 'KID', 'TVD': 'TVD'
    };
    return reverseCurrencyMap[backendCode] || 'USD';
  };

  const {
    items,
    selectedCurrency,
    setCurrency,
    shippingAddress,
    setShippingAddress,
    shippingMethod,
    setShippingMethod,
    appliedDiscount,
    applyDiscountCode,
    removeDiscountCode,
    getSubtotal,
    getShippingCost,
    getTaxAmount,
    getDiscountAmount,
    getTotal,
    getTotalItems,
    selectedLanguage,
    setLanguage,
    clearCart,
    availableCurrencies,
    availableLanguages,
    isLoadingCurrencies,
    isLoadingLanguages,
    fetchCurrencies,
    fetchLanguages
  } = useCartStore();

  // Load currencies and languages on component mount
  useEffect(() => {
    fetchCurrencies();
    fetchLanguages();
  }, [fetchCurrencies, fetchLanguages]);

  // Load saved addresses only once when component mounts and user is authenticated
  useEffect(() => {
    // Prevent multiple loads
    if (hasLoadedAddresses.current || !isAuthenticated) {
      return;
    }

    const loadAddresses = async () => {
      try {
        setIsLoadingAddresses(true);
        setAddressLoadError(null);
        const token = await getToken();
        if (!token) {
          setAddressLoadError('Authentication token not available');
          toast.error('Authentication token not available');
          setIsLoadingAddresses(false);
          return;
        }
        
        const addresses = await getSavedAddresses(token);
        
        // Addresses are already transformed by getSavedAddresses
        setSavedAddresses(addresses);
        
        // Set default address only on initial load
        if (!hasInitializedAddresses) {
          const defaultAddress = addresses.find(addr => addr.isDefault);
          if (defaultAddress) {
            setSelectedAddress(defaultAddress);
            // Also set it in the cart store
            setShippingAddress(defaultAddress);
          }
          setHasInitializedAddresses(true);
        }
        
        // Mark as loaded to prevent future calls
        hasLoadedAddresses.current = true;
      } catch (error) {
        console.error('Error loading addresses:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to load saved addresses';
        setAddressLoadError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoadingAddresses(false);
      }
    };

    loadAddresses();
  }, [isAuthenticated, getToken, hasInitializedAddresses, setShippingAddress]);

  // Manual refresh function for addresses (only called when explicitly needed)
  const handleRefreshAddresses = async () => {
    try {
      const token = await getToken();
      if (!token) {
        toast.error('Authentication token not available');
        return;
      }
      
      const addresses = await getSavedAddresses(token);
      setSavedAddresses(addresses);
      
      // Reset the loaded flag to allow future loads
      hasLoadedAddresses.current = false;
      setHasInitializedAddresses(false);
      
      toast.success('Addresses refreshed successfully');
    } catch (error) {
      console.error('Error refreshing addresses:', error);
      toast.error('Failed to refresh addresses');
    }
  };

  // Sync selected address with cart store when it changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (selectedAddress) {
      setShippingAddress(selectedAddress);
    }
  }, [selectedAddress, setShippingAddress]);

  // Set initial language and currency from user preferences
  useEffect(() => {
    if (preferences && !preferencesLoading && availableLanguages.length > 0 && availableCurrencies.length > 0) {
      // Set language from preferences
      if (preferences.language) {
        const frontendLanguageCode = toFrontendLanguageCode(preferences.language);
        const preferredLanguage = availableLanguages.find(lang => lang.code === frontendLanguageCode);
        if (preferredLanguage) {
          setLanguage(preferredLanguage);
        }
      }

      // Set currency from preferences
      if (preferences.currency) {
        const frontendCurrencyCode = toFrontendCurrencyCode(preferences.currency);
        const preferredCurrency = availableCurrencies.find(curr => curr.code === frontendCurrencyCode);
        if (preferredCurrency) {
          setCurrency(preferredCurrency);
        }
      }
    }
  }, [preferences, preferencesLoading, availableLanguages, availableCurrencies, setLanguage, setCurrency]);

  // Address management functions
  const handleSelectAddress = (address: SavedAddress) => {
    setSelectedAddress(address);
    setShippingAddress(address);
    toast.success('Address selected successfully');
  };

  const handleAddNewAddress = () => {
    setShowAddressSidebar(true);
    setEditingAddress(null);
  };

  const handleEditAddress = (address: SavedAddress) => {
    setEditingAddress(address);
    setShowAddressSidebar(true);
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      const token = await getToken();
      if (!token) {
        toast.error('Authentication token not available');
        return;
      }
      
      await deleteAddress(addressId, token);
      
      // Refresh addresses to get updated list
      await handleRefreshAddresses();
      
      toast.success('Address deleted successfully');
    } catch (error) {
      console.error('Failed to delete address:', error);
      toast.error('Failed to delete address');
    }
  };

  const handleSaveAddress = async (addressData: CreateAddressRequest) => {
    try {
      const token = await getToken();
      if (!token) {
        toast.error('Authentication token not available');
        return;
      }
      
      let savedAddress: SavedAddress | null = null;
      
      if (editingAddress) {
        // Update existing address
        savedAddress = await updateAddress({ ...addressData, id: editingAddress.id }, token);
        if (savedAddress) {
          toast.success('Address updated successfully');
        }
      } else {
        // Create new address
        savedAddress = await createAddress(addressData, token);
        if (savedAddress) {
          toast.success('Address saved successfully');
        }
      }
      
      // Refresh addresses to get updated list
      await handleRefreshAddresses();
      
      // Select the newly saved/updated address
      if (savedAddress) {
        setSelectedAddress(savedAddress);
        setShippingAddress(savedAddress);
      }
      
      setShowAddressSidebar(false);
      setEditingAddress(null);
    } catch (error) {
      console.error('Failed to save address:', error);
      toast.error('Failed to save address');
    }
  };

  const handleCancelAddressForm = () => {
    setShowAddressSidebar(false);
    setEditingAddress(null);
  };

  // Redirect if cart is empty
  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }



  const handleDiscountCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discountCode.trim()) return;

    setIsApplyingDiscount(true);
    setDiscountError(null); // Clear previous errors
    try {
      const token = await getToken();
      if (!token) {
        toast.error('Authentication token not available');
        return;
      }

      const success = await applyDiscountCode(discountCode.trim(), token);
      if (success) {
        toast.success('Discount code applied successfully!');
        setDiscountCode('');
      } else {
        setDiscountError('Invalid discount code. Please try again.');
        toast.error('Invalid discount code');
      }
    } catch (error) {
      setDiscountError('Failed to apply discount code. Please try again.');
      toast.error('Failed to apply discount code');
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  const formatPrice = (price: number) => {
    return `${selectedCurrency.symbol}${price.toFixed(1).replace(/\.0$/, '')}`;
  };

  const handlePaymentMethodChange = (value: string) => {
    if (value === 'stripe' || value === 'cod') {
      setPaymentMethod(value);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/cart')}
            className="mb-6 hover:bg-white/80 transition-all duration-200 group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Cart
          </Button>
          
          <div className="text-center sm:text-left">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Checkout
            </h1>
            <p className="text-lg text-gray-600">
              Complete your purchase • {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'}
            </p>
          </div>
        </div>

        {/* Enhanced Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4 sm:space-x-8">
            <div className={`flex items-center space-x-2 ${currentStep === 'address' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                currentStep === 'address' 
                  ? 'border-blue-600 bg-blue-600 text-white shadow-lg scale-110' 
                  : 'border-gray-300 bg-white hover:border-gray-400'
              }`}>
                <span className="text-sm sm:text-base font-semibold">1</span>
              </div>
              <span className="font-medium text-sm sm:text-base hidden sm:block">Shipping Address</span>
            </div>
            
            <div className={`w-12 sm:w-20 h-1 rounded-full transition-all duration-300 ${
              currentStep === 'payment' ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gray-300'
            }`}></div>
            
            <div className={`flex items-center space-x-2 ${currentStep === 'payment' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                currentStep === 'payment' 
                  ? 'border-blue-600 bg-blue-600 text-white shadow-lg scale-110' 
                  : 'border-gray-300 bg-white hover:border-gray-400'
              }`}>
                <span className="text-sm sm:text-base font-semibold">2</span>
              </div>
              <span className="font-medium text-sm sm:text-base hidden sm:block">Payment</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 xl:gap-8">
          {/* Main Checkout Form */}
          <div className="xl:col-span-2 space-y-6">
            {/* Enhanced Currency & Language Selector */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                    <Globe className="h-5 w-5 text-blue-600" />
                  </div>
                  Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <CurrencySelector
                    currencies={availableCurrencies}
                    selectedCurrency={selectedCurrency}
                    onCurrencyChange={setCurrency}
                    isLoading={isLoadingCurrencies}
                    disabled={isLoadingCurrencies}
                  />
                  
                  <LanguageSelector
                    languages={availableLanguages}
                    selectedLanguage={selectedLanguage}
                    onLanguageChange={setLanguage}
                    isLoading={isLoadingLanguages}
                    disabled={isLoadingLanguages}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Step 1: Enhanced Shipping Address */}
            {currentStep === 'address' && (
              <div className="space-y-6">
                {/* Enhanced Address Selector */}
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center">
                          <MapPin className="h-5 w-5 text-green-600" />
                        </div>
                        Select Shipping Address
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefreshAddresses}
                        disabled={isLoadingAddresses}
                        className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                      >
                        {isLoadingAddresses ? 'Loading...' : 'Refresh'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoadingAddresses ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600 font-medium">Loading addresses...</p>
                      </div>
                    ) : addressLoadError ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <AlertCircle className="h-8 w-8 text-red-600" />
                        </div>
                        <p className="text-red-600 font-medium mb-4">{addressLoadError}</p>
                        <Button onClick={handleRefreshAddresses} className="bg-red-600 hover:bg-red-700">
                          Retry
                        </Button>
                      </div>
                    ) : savedAddresses.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <MapPin className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No saved addresses</h3>
                        <p className="text-gray-600 mb-6">You don't have any saved addresses yet.</p>
                        <Button onClick={handleAddNewAddress} className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
                          Add New Address
                        </Button>
                      </div>
                    ) : (
                      <AddressSelector
                        savedAddresses={savedAddresses}
                        selectedAddress={selectedAddress}
                        onSelectAddress={handleSelectAddress}
                        onAddNewAddress={handleAddNewAddress}
                        onEditAddress={handleEditAddress}
                        onDeleteAddress={handleDeleteAddress}
                        isSidebarOpen={showAddressSidebar}
                        isEditing={false}
                      />
                    )}
                    
                    {/* Address Status Section */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <div className="flex-1">
                        {selectedAddress ? (
                          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-green-800 mb-1">Address Selected</h4>
                                <p className="text-sm text-green-700 mb-1">
                                  {selectedAddress.firstName} {selectedAddress.lastName}
                                </p>
                                <p className="text-sm text-green-700">
                                  {selectedAddress.address}, {selectedAddress.city}, {selectedAddress.state} {selectedAddress.postalCode}, {selectedAddress.country}
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <MapPin className="h-4 w-4 text-blue-600" />
                              </div>
                              <p className="text-sm text-blue-800">
                                Please select a shipping address to continue
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Address Form Sidebar */}
                <AddressFormSidebar
                  isOpen={showAddressSidebar}
                  onClose={handleCancelAddressForm}
                  onSave={handleSaveAddress}
                  address={editingAddress}
                  isEditing={!!editingAddress}
                />
              </div>
            )}

            {/* Step 2: Enhanced Payment Method */}
            {currentStep === 'payment' && (
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-purple-600" />
                    </div>
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {/* Enhanced Payment Method Selection */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Choose Payment Method</h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <label className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${
                          paymentMethod === 'stripe' 
                            ? 'border-blue-500 bg-blue-50 shadow-md' 
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}>
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="stripe"
                            checked={paymentMethod === 'stripe'}
                            onChange={(e) => handlePaymentMethodChange(e.target.value)}
                            className="sr-only"
                          />
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              paymentMethod === 'stripe' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                            }`}>
                              {paymentMethod === 'stripe' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                            </div>
                            <div>
                              <span className="font-medium text-gray-900">Credit/Debit Card</span>
                              <p className="text-sm text-gray-500">Secure payment via Stripe</p>
                            </div>
                          </div>
                        </label>
                        
                        <label className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${
                          paymentMethod === 'cod' 
                            ? 'border-blue-500 bg-blue-50 shadow-md' 
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}>
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="cod"
                            checked={paymentMethod === 'cod'}
                            onChange={(e) => handlePaymentMethodChange(e.target.value)}
                            className="sr-only"
                          />
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              paymentMethod === 'cod' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                            }`}>
                              {paymentMethod === 'cod' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                            </div>
                            <div>
                              <span className="font-medium text-gray-900">Cash on Delivery</span>
                              <p className="text-sm text-gray-500">Pay when you receive</p>
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Enhanced Stripe Payment Form */}
                    {paymentMethod === 'stripe' && (
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                        <Elements stripe={stripePromise}>
                          <StripePaymentForm
                            amount={getTotal()}
                            currency={selectedCurrency.code.toLowerCase()}
                            customerName={shippingAddress ? `${shippingAddress.firstName} ${shippingAddress.lastName}` : 'Customer'}
                            shippingAddress={{
                              firstName: shippingAddress?.firstName || '',
                              lastName: shippingAddress?.lastName || '',
                              phone: shippingAddress?.phone || '',
                              address: shippingAddress?.address || '',
                              city: shippingAddress?.city || '',
                              state: shippingAddress?.state || '',
                              postalCode: shippingAddress?.postalCode || '',
                              country: shippingAddress?.country || ''
                            }}
                            orderDetails={{
                              items: items.map(item => ({
                                id: item.id,
                                name: item.name,
                                quantity: item.quantity,
                                price: item.price,
                                image: item.image || undefined
                              })),
                              discount: appliedDiscount ? {
                                code: appliedDiscount.code,
                                amount: getDiscountAmount(),
                                type: appliedDiscount.type,
                                value: appliedDiscount.value,
                                calculatedAmount: getDiscountAmount()
                              } : null,
                              subtotal: getSubtotal(),
                              total: getTotal(),
                              shippingMethod: shippingMethod,
                              shippingCost: getShippingCost(),
                              tax: getTaxAmount()
                            }}
                            onPaymentSuccess={(paymentIntent) => {
                              clearCart();
                              toast.success('Payment completed successfully!');
                              navigate('/success', { 
                                state: { 
                                  paymentIntentId: paymentIntent.id,
                                  amount: getTotal(),
                                  currency: selectedCurrency.code
                                }
                              });
                            }}
                            onPaymentError={(error) => {
                              console.error('Payment failed:', error);
                              toast.error(error);
                            }}
                            isLoading={false}
                          />
                        </Elements>
                      </div>
                    )}

                    {/* Enhanced Cash on Delivery Notice */}
                    {paymentMethod === 'cod' && (
                      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Truck className="h-6 w-6 text-yellow-600" />
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-yellow-800 mb-2">Cash on Delivery</h4>
                            <p className="text-yellow-700 leading-relaxed">
                              Pay with cash when your order is delivered. No additional fees or hidden charges.
                              Your order will be processed immediately and shipped to your selected address.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Enhanced Navigation Buttons */}
                    <div className="flex gap-4 pt-6 border-t border-gray-200">
                      <Button 
                        type="button"
                        variant="outline" 
                        onClick={() => setCurrentStep('address')}
                        className="flex-1 h-12 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                      >
                        ← Back to Address
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Enhanced Order Summary Sidebar */}
          <div className="space-y-6">
            <Card className="sticky top-8 border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center">
                    <ShoppingCart className="h-5 w-5 text-orange-600" />
                  </div>
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Enhanced Items */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Items in Cart</h4>
                  <div className="space-y-3">
                    {items.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <img
                          src={item.image || '/placeholder.png'}
                          alt={item.name}
                          className="w-14 h-14 object-cover rounded-lg border border-gray-200"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate">{item.name}</p>
                          <p className="text-gray-500 text-xs mt-1">
                            Qty: {item.quantity}
                            {item.selectedColor && ` • ${item.selectedColor}`}
                            {item.selectedSize && ` • ${item.selectedSize}`}
                          </p>
                        </div>
                        <p className="font-semibold text-sm text-gray-900">
                          {formatPrice(item.price * item.quantity * selectedCurrency.rate)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator className="bg-gray-200" />
                
                {/* Enhanced Shipping Method */}
                <div className="space-y-3">
                  <Label className="text-gray-900 font-semibold">Shipping Method</Label>
                  <div className="space-y-2">
                    {Object.entries(shippingCosts).map(([method, cost]) => (
                      <label key={method} className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        shippingMethod === method 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}>
                        <input
                          type="radio"
                          id={method}
                          name="shippingMethod"
                          value={method}
                          checked={shippingMethod === method}
                          onChange={(e) => setShippingMethod(e.target.value as any)}
                          className="h-4 w-4 text-blue-600"
                        />
                        <div className="flex items-center justify-between w-full">
                          <span className="capitalize font-medium text-gray-900">{method}</span>
                          <span className="font-semibold text-gray-900">{formatPrice(cost * selectedCurrency.rate)}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                
                <Separator className="bg-gray-200" />
                
                {/* Enhanced Discount Code */}
                <div className="space-y-3">
                  <Label className="text-gray-900 font-semibold">Discount Code</Label>
                  <form onSubmit={handleDiscountCode} className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter code"
                        value={discountCode}
                        onChange={(e) => {
                          setDiscountCode(e.target.value);
                          if (discountError) setDiscountError(null);
                        }}
                        disabled={isApplyingDiscount}
                        className={`flex-1 ${discountError ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                      />
                      <Button 
                        type="submit" 
                        size="sm"
                        disabled={isApplyingDiscount || !discountCode.trim()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4"
                      >
                        {isApplyingDiscount ? '...' : 'Apply'}
                      </Button>
                    </div>
                    {discountError && (
                      <p className="text-red-500 text-xs">{discountError}</p>
                    )}
                  </form>
                  
                  {appliedDiscount && (
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">
                          {appliedDiscount.code}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={removeDiscountCode}
                        className="text-green-600 hover:text-green-700 hover:bg-green-100"
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
                
                <Separator className="bg-gray-200" />
                
                {/* Enhanced Price Breakdown */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Price Breakdown</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium text-gray-900">{formatPrice(getSubtotal())}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium text-gray-900">{formatPrice(getShippingCost())}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-medium text-gray-900">{formatPrice(getTaxAmount())}</span>
                    </div>
                    
                    {appliedDiscount && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount</span>
                        <span className="font-medium">-{formatPrice(getDiscountAmount())}</span>
                      </div>
                    )}
                  </div>
                  
                  <Separator className="bg-gray-200" />
                  
                  <div className="flex justify-between text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span className="text-2xl">{formatPrice(getTotal())}</span>
                  </div>
                </div>
                
                {/* Continue to Payment Button - Mobile First */}
                {currentStep === 'address' && (
                  <div className="pt-6 border-t border-gray-200">
                    <Button 
                      onClick={() => setCurrentStep('payment')} 
                      disabled={!selectedAddress}
                      className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
                    >
                      Continue to Payment
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                    
                    {!selectedAddress && (
                      <p className="text-sm text-gray-500 text-center mt-3">
                        Please select a shipping address to continue
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
