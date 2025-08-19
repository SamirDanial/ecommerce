import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Product, Category, FlashSale } from '../types';
import { productService, flashSaleService } from '../services/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ShoppingBag, Heart, ArrowRight, Zap, TrendingUp, Gift, Star, Grid3X3, List, Sparkles, Shield, Truck, Clock, Users } from 'lucide-react';
import { ImageWithPlaceholder } from '../components/ui/image-with-placeholder';
import { RecentlyViewedProducts } from '../components/RecentlyViewedProducts';
import WishlistButton from '../components/WishlistButton';
import { useUserInteractionStore } from '../stores/userInteractionStore';
import { categoryService } from '../services/api';
import RatingDisplay from '../components/ui/rating-display';
import { useCurrency } from '../contexts/CurrencyContext';
import { getImageUrl } from '../utils/productUtils';

const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const { addToRecentlyViewed, addInteraction } = useUserInteractionStore();
  const { formatPrice } = useCurrency();

  // Responsive default view mode - Grid on desktop, List on mobile
  const getDefaultViewMode = useMemo(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768 ? 'grid' : 'list';
    }
    return 'list';
  }, []);

  const [trendingViewMode, setTrendingViewMode] = useState<'grid' | 'list'>(getDefaultViewMode);
  const [categoriesViewMode, setCategoriesViewMode] = useState<'grid' | 'list'>(getDefaultViewMode);
  const [featuredViewMode, setFeaturedViewMode] = useState<'grid' | 'list'>(getDefaultViewMode);

  // Flash sale countdown timer
  useEffect(() => {
    if (flashSales.length > 0) {
      const activeFlashSale = flashSales[0];
      const endDate = new Date(activeFlashSale.endDate);

      const timer = setInterval(() => {
        const now = new Date().getTime();
        const distance = endDate.getTime() - now;

        if (distance > 0) {
          setTimeLeft({
            days: Math.floor(distance / (1000 * 60 * 60 * 24)),
            hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((distance % (1000 * 60)) / 1000)
          });
        } else {
          clearInterval(timer);
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [flashSales]);

  // Track page view
  useEffect(() => {
    addInteraction({
      type: 'page_view',
      targetType: 'page',
      data: { path: '/', name: 'Home' }
    });
  }, [addInteraction]);

  // Handle responsive view mode changes
  useEffect(() => {
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 768;
      const newViewMode = isDesktop ? 'grid' : 'list';
      
      setTrendingViewMode(newViewMode);
      setCategoriesViewMode(newViewMode);
      setFeaturedViewMode(newViewMode);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, categoriesData, flashSalesData] = await Promise.all([
          productService.getFeatured(),
          categoryService.getAll(),
          flashSaleService.getActive()
        ]);
        
        setFeaturedProducts(productsData);
        setCategories(categoriesData);
        setFlashSales(flashSalesData);
        setTrendingProducts(productsData.slice(0, 4));
      } catch (error) {
        console.error('Home: Error fetching data:', error);
        setFeaturedProducts([]);
        setCategories([]);
        setFlashSales([]);
        setTrendingProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Force loading to false after 5 seconds to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        setLoading(false);
      }
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-gradient-to-r from-blue-500 to-purple-600 mx-auto mb-6"></div>
          <div className="text-2xl font-bold text-gray-700 animate-pulse">Loading Amazing Content...</div>
        </div>
      </div>
    );
  }

  const activeFlashSale = flashSales.length > 0 ? flashSales[0] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 pointer-events-none hidden sm:block">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-40 left-1/4 w-80 h-80 bg-gradient-to-r from-pink-200 to-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Hero Banner */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Custom Background Image */}
        <div className="absolute inset-0 top-0">
          <img 
            src="/assets/background-image.png" 
            alt="T-Shirt Collection Background" 
            className="w-full h-full object-cover"
          />
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-purple-900/70 to-pink-900/80"></div>
        </div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 top-0 hidden sm:block">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gradient-to-r from-pink-400 to-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-20 animate-float hidden lg:block">
          <div className="w-4 h-4 bg-blue-400 rounded-full opacity-60 shadow-lg"></div>
        </div>
        <div className="absolute top-40 right-20 animate-float animation-delay-1000 hidden lg:block">
          <div className="w-3 h-3 bg-purple-400 rounded-full opacity-60 shadow-lg"></div>
        </div>
        <div className="absolute bottom-40 left-1/4 animate-float animation-delay-2000 hidden lg:block">
          <div className="w-2 h-2 bg-pink-400 rounded-full opacity-60 shadow-lg"></div>
        </div>
        
        <div className="container mx-auto px-4 py-12 lg:py-24 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left Content */}
              <div className="text-center lg:text-left">
                <Badge className="mb-6 bg-white/20 text-white border-white/30 backdrop-blur-sm animate-fade-in-up">
                  <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                  New Collection 2025
                </Badge>
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight animate-fade-in-up animation-delay-200 text-white">
                  Style Your
                  <span className="block text-3xl sm:text-4xl md:text-5xl font-bold mt-2 bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                    Perfect Look
                  </span>
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl mb-8 opacity-90 max-w-2xl lg:max-w-none animate-fade-in-up animation-delay-400 text-white">
                  Discover our premium collection of comfortable, stylish, and high-quality t-shirts designed for every occasion and personality
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up animation-delay-600">
                  <Button asChild size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105">
                    <Link to="/products">
                      Shop Collection
                      <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-105">
                    <Link to="/categories">
                      View Categories
                    </Link>
                  </Button>
                </div>
                
                {/* T-Shirt Features */}
                <div className="grid grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12 animate-fade-in-up animation-delay-800">
                  <div className="text-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                      <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="text-white font-semibold text-sm sm:text-base">Premium Quality</div>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                      <Truck className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="text-white font-semibold text-sm sm:text-base">Free Shipping</div>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                      <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="text-white font-semibold text-sm sm:text-base">30-Day Return</div>
                  </div>
                </div>
              </div>

              {/* Right Content - Floating T-Shirt Elements */}
              <div className="hidden lg:block relative">
                <div className="relative">
                  {/* Floating T-Shirt Cards */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 animate-float">
                    <div className="p-4 text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mx-auto mb-2 flex items-center justify-center">
                        <ShoppingBag className="h-8 w-8 text-white" />
                      </div>
                      <div className="text-white text-sm font-medium">Trending</div>
                    </div>
                  </div>
                  
                  <div className="absolute top-32 left-0 w-28 h-28 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 animate-float animation-delay-1000">
                    <div className="p-3 text-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-red-400 rounded-full mx-auto mb-2 flex items-center justify-center">
                        <Star className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-white text-xs font-medium">Best Seller</div>
                    </div>
                  </div>
                  
                  <div className="absolute bottom-0 right-0 w-36 h-36 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 animate-float animation-delay-2000">
                    <div className="p-4 text-center">
                      <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-400 rounded-full mx-auto mb-2 flex items-center justify-center">
                        <Gift className="h-10 w-10 text-white" />
                      </div>
                      <div className="text-white text-sm font-medium">New Arrivals</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Flash Sale Section - Enhanced */}
      {activeFlashSale && (
        <section className="relative py-16 bg-gradient-to-r from-red-600 via-pink-600 to-red-700 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 mb-6">
                <Zap className="h-6 w-6 text-yellow-300 animate-pulse" />
                <span className="text-white font-bold text-lg">FLASH SALE</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">{activeFlashSale.title}</h2>
              <p className="text-xl text-white/90 max-w-2xl mx-auto">{activeFlashSale.description}</p>
            </div>

            {/* Countdown Timer */}
            <div className="flex justify-center mb-8">
              <div className="grid grid-cols-4 gap-4 md:gap-6">
                {[
                  { value: timeLeft.days, label: 'Days' },
                  { value: timeLeft.hours, label: 'Hours' },
                  { value: timeLeft.minutes, label: 'Minutes' },
                  { value: timeLeft.seconds, label: 'Seconds' }
                ].map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-white/30">
                      <div className="text-3xl md:text-5xl font-black text-white mb-2">
                        {item.value.toString().padStart(2, '0')}
                      </div>
                      <div className="text-white/80 text-sm md:text-base font-medium">{item.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <div className="text-center">
              <Button asChild size="lg" className="bg-white text-red-600 hover:bg-gray-100 text-lg px-8 py-4 rounded-2xl font-bold shadow-2xl hover:shadow-white/25 transition-all duration-300 hover:scale-105">
                <Link to="/products">
                  Shop Flash Sale
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Trending Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-100 to-red-100 rounded-full px-6 py-3 mb-6">
              <TrendingUp className="h-6 w-6 text-orange-600" />
              <span className="text-orange-800 font-bold">TRENDING NOW</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">What's Hot Right Now</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Discover the most popular styles that everyone is talking about</p>
          </div>

          <div className="flex justify-center mb-12">
            <div className="flex items-center bg-white rounded-2xl p-2 shadow-lg">
              <button
                onClick={() => setTrendingViewMode('grid')}
                className={`px-6 py-3 rounded-xl transition-all duration-300 font-medium ${
                  trendingViewMode === 'grid'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid3X3 className="h-5 w-5 inline mr-2" />
                Grid View
              </button>
              <button
                onClick={() => setTrendingViewMode('list')}
                className={`px-6 py-3 rounded-xl transition-all duration-300 font-medium ${
                  trendingViewMode === 'list'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="h-5 w-5 inline mr-2" />
                List View
              </button>
            </div>
          </div>

          <div className={trendingViewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8' 
            : 'space-y-6'
          }>
            {trendingProducts.map((product) => (
              <Card key={product.id} className={`group overflow-hidden transition-all duration-500 hover:shadow-2xl ${
                trendingViewMode === 'grid' 
                  ? 'hover:scale-105 hover:-translate-y-2' 
                  : 'hover:shadow-lg'
              }`}>
                <Link to={`/products/${product.slug}`} onClick={() => {
                  addToRecentlyViewed(product);
                  addInteraction({
                    type: 'product_view',
                    targetId: product.id.toString(),
                    targetType: 'product',
                    data: { slug: product.slug, name: product.name }
                  });
                }}>
                  {trendingViewMode === 'grid' ? (
                    <>
                      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                        <ImageWithPlaceholder
                          src={getImageUrl(product)}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          placeholderClassName="w-full h-full"
                        />
                        {product.isOnSale && (
                          <Badge className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 shadow-lg">
                            SALE
                          </Badge>
                        )}
                        <div className="absolute top-4 right-4">
                          <WishlistButton product={product} size="sm" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      <CardHeader className="pb-4">
                        <CardTitle className="text-xl font-bold group-hover:text-blue-600 transition-colors duration-300 line-clamp-2">{product.name}</CardTitle>
                        <RatingDisplay
                          rating={product.averageRating}
                          reviewCount={product.reviewCount}
                          size="md"
                        />
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl font-black text-blue-600">
                              {formatPrice(product.salePrice || product.price)}
                            </span>
                            {product.comparePrice && product.comparePrice > product.price && (
                              <span className="text-lg text-gray-400 line-through">
                                {formatPrice(product.comparePrice)}
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </>
                  ) : (
                    <div className="flex w-full p-6">
                      <div className="relative w-32 h-32 flex-shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200">
                        <ImageWithPlaceholder
                          src={getImageUrl(product)}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          placeholderClassName="w-full h-full"
                        />
                        {product.isOnSale && (
                          <Badge className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 text-xs">
                            SALE
                          </Badge>
                        )}
                        <div className="absolute top-2 right-2">
                          <WishlistButton product={product} size="sm" />
                        </div>
                      </div>
                      <div className="flex-1 ml-6 flex flex-col justify-between">
                        <div>
                          <CardTitle className="text-xl font-bold group-hover:text-blue-600 transition-colors duration-300 line-clamp-2 mb-3">{product.name}</CardTitle>
                          <RatingDisplay
                            rating={product.averageRating}
                            reviewCount={product.reviewCount}
                            size="md"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl font-black text-blue-600">
                              {formatPrice(product.salePrice || product.price)}
                            </span>
                            {product.comparePrice && product.comparePrice > product.price && (
                              <span className="text-lg text-gray-400 line-through">
                                {formatPrice(product.comparePrice)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </Link>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <Link to="/products">
                View All Trending Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full px-6 py-3 mb-6">
              <Grid3X3 className="h-6 w-6 text-blue-600" />
              <span className="text-blue-800 font-bold">SHOP BY CATEGORY</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">Explore Our Collections</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Find exactly what you're looking for in our carefully curated categories</p>
          </div>

          <div className="flex justify-center mb-12">
            <div className="flex items-center bg-white rounded-2xl p-2 shadow-lg">
              <button
                onClick={() => setCategoriesViewMode('grid')}
                className={`px-6 py-3 rounded-xl transition-all duration-300 font-medium ${
                  categoriesViewMode === 'grid'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid3X3 className="h-5 w-5 inline mr-2" />
                Grid View
              </button>
              <button
                onClick={() => setCategoriesViewMode('list')}
                className={`px-6 py-3 rounded-xl transition-all duration-300 font-medium ${
                  categoriesViewMode === 'list'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="h-5 w-5 inline mr-2" />
                List View
              </button>
            </div>
          </div>

          <div className={categoriesViewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8' 
            : 'space-y-6'
          }>
            {categories.map((category) => (
              <Card key={category.id} className={`group overflow-hidden transition-all duration-500 hover:shadow-2xl ${
                categoriesViewMode === 'list' 
                  ? 'hover:shadow-lg' 
                  : 'hover:scale-105 hover:-translate-y-2'
              }`}>
                <Link to={`/categories/${category.slug}`} onClick={() => {
                  addInteraction({
                    type: 'category_view',
                    targetId: category.id.toString(),
                    targetType: 'category',
                    data: { slug: category.slug, name: category.name }
                  });
                }}>
                  {categoriesViewMode === 'grid' ? (
                    <>
                      <div className="relative h-48 bg-gradient-to-br from-blue-100 to-purple-100 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all duration-500"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                            <ShoppingBag className="h-10 w-10 text-white" />
                          </div>
                        </div>
                      </div>
                      <CardHeader className="text-center pb-4">
                        <CardTitle className="text-xl font-bold group-hover:text-blue-600 transition-colors duration-300">{category.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 text-center line-clamp-3 group-hover:text-gray-800 transition-colors duration-300">
                          {category.description}
                        </p>
                      </CardContent>
                    </>
                  ) : (
                    <div className="flex w-full items-center p-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center flex-shrink-0 mr-6 group-hover:scale-110 transition-transform duration-500">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                          <ShoppingBag className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl font-bold group-hover:text-blue-600 transition-colors duration-300 mb-2">{category.name}</CardTitle>
                        <p className="text-gray-600 line-clamp-2 group-hover:text-gray-800 transition-colors duration-300">
                          {category.description}
                        </p>
                      </div>
                      <ArrowRight className="h-6 w-6 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-2 transition-all duration-300" />
                    </div>
                  )}
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-100 to-blue-100 rounded-full px-6 py-3 mb-6">
              <Star className="h-6 w-6 text-green-600" />
              <span className="text-green-800 font-bold">FEATURED PRODUCTS</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">Handpicked for You</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Our most popular and highest-rated products, carefully selected for quality and style</p>
          </div>

          <div className="flex justify-center mb-12">
            <div className="flex items-center bg-gray-100 rounded-2xl p-2 shadow-lg">
              <button
                onClick={() => setFeaturedViewMode('grid')}
                className={`px-6 py-3 rounded-xl transition-all duration-300 font-medium ${
                  featuredViewMode === 'grid'
                    ? 'bg-white text-gray-900 shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid3X3 className="h-5 w-5 inline mr-2" />
                Grid View
              </button>
              <button
                onClick={() => setFeaturedViewMode('list')}
                className={`px-6 py-3 rounded-xl transition-all duration-300 font-medium ${
                  featuredViewMode === 'list'
                    ? 'bg-white text-gray-900 shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="h-5 w-5 inline mr-2" />
                List View
              </button>
            </div>
          </div>

          <div className={featuredViewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8' 
            : 'space-y-6'
          }>
            {featuredProducts.map((product) => (
              <Card key={product.id} className={`group overflow-hidden transition-all duration-500 hover:shadow-2xl ${
                featuredViewMode === 'grid' 
                  ? 'hover:scale-105 hover:-translate-y-2' 
                  : 'hover:shadow-lg'
              }`}>
                <Link to={`/products/${product.slug}`} onClick={() => {
                  addToRecentlyViewed(product);
                  addInteraction({
                    type: 'product_view',
                    targetId: product.id.toString(),
                    targetType: 'product',
                    data: { slug: product.slug, name: product.name }
                  });
                }}>
                  {featuredViewMode === 'grid' ? (
                    <>
                      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                        <ImageWithPlaceholder
                          src={getImageUrl(product)}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          placeholderClassName="w-full h-full"
                        />
                        {product.isOnSale && (
                          <Badge className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 shadow-lg">
                            SALE
                          </Badge>
                        )}
                        <div className="absolute top-4 right-4">
                          <WishlistButton product={product} size="sm" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      <CardHeader className="pb-4">
                        <CardTitle className="text-xl font-bold group-hover:text-blue-600 transition-colors duration-300 line-clamp-2">{product.name}</CardTitle>
                        <RatingDisplay
                          rating={product.averageRating}
                          reviewCount={product.reviewCount}
                          size="md"
                        />
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-black text-blue-600">
                            {formatPrice(product.salePrice || product.price)}
                          </span>
                          {product.comparePrice && product.comparePrice > product.price && (
                            <span className="text-lg text-gray-400 line-through">
                              {formatPrice(product.comparePrice)}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </>
                  ) : (
                    <div className="flex w-full p-6">
                      <div className="relative w-32 h-32 flex-shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200">
                        <ImageWithPlaceholder
                          src={getImageUrl(product)}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          placeholderClassName="w-full h-full"
                        />
                        {product.isOnSale && (
                          <Badge className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 text-xs">
                            SALE
                          </Badge>
                        )}
                        <div className="absolute top-2 right-2">
                          <WishlistButton product={product} size="sm" />
                        </div>
                      </div>
                      <div className="flex-1 ml-6 flex flex-col justify-between">
                        <div>
                          <CardTitle className="text-xl font-bold group-hover:text-blue-600 transition-colors duration-300 line-clamp-2 mb-3">{product.name}</CardTitle>
                          <RatingDisplay
                            rating={product.averageRating}
                            reviewCount={product.reviewCount}
                            size="md"
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-black text-blue-600">
                            {formatPrice(product.salePrice || product.price)}
                          </span>
                          {product.comparePrice && product.comparePrice > product.price && (
                            <span className="text-lg text-gray-400 line-through">
                              {formatPrice(product.comparePrice)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </Link>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <Link to="/products">
                View All Featured Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Recently Viewed Products */}
      <RecentlyViewedProducts />

      {/* Features Section - Enhanced */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">Why Choose Us?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">We're committed to providing the best shopping experience with premium quality products and exceptional service</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Truck,
                title: "Free Shipping",
                description: `Free shipping on orders over ${formatPrice(50)}`,
                color: "from-blue-500 to-blue-600"
              },
              {
                icon: Shield,
                title: "Quality Guarantee",
                description: "30-day money-back guarantee",
                color: "from-green-500 to-green-600"
              },
              {
                icon: Clock,
                title: "Fast Delivery",
                description: "Same day processing & shipping",
                color: "from-purple-500 to-purple-600"
              },
              {
                icon: Users,
                title: "24/7 Support",
                description: "Round the clock customer service",
                color: "from-pink-500 to-pink-600"
              }
            ].map((feature, index) => (
              <div key={index} className="text-center group">
                <div className={`w-20 h-20 bg-gradient-to-r ${feature.color} rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg group-hover:shadow-xl`}>
                  <feature.icon className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">{feature.title}</h3>
                <p className="text-gray-600 group-hover:text-gray-800 transition-colors duration-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section - New */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 mb-6">
              <Gift className="h-6 w-6 text-yellow-300" />
              <span className="font-bold">STAY UPDATED</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-6">Get Exclusive Offers & Updates</h2>
            <p className="text-xl text-white/90 mb-8">Be the first to know about new collections, special offers, and style tips</p>
            
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 px-6 py-4 rounded-2xl text-gray-900 font-medium focus:outline-none focus:ring-4 focus:ring-white/30 transition-all duration-300"
              />
              <Button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                Subscribe
              </Button>
            </div>
            
            <p className="text-sm text-white/70 mt-4">No spam, unsubscribe at any time</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
