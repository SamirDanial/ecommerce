import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Product, Category, FlashSale } from '../types';
import { productService, flashSaleService } from '../services/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ShoppingBag, Star, Heart, ArrowRight, Zap, TrendingUp, Gift } from 'lucide-react';
import { ImageWithPlaceholder } from '../components/ui/image-with-placeholder';
import { RecentlyViewedProducts } from '../components/RecentlyViewedProducts';
import { WishlistButton } from '../components/WishlistButton';
import { useUserInteractionStore } from '../stores/userInteractionStore';
import { useCartStore } from '../stores/cartStore';

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
  const { addToCart } = useCartStore();

  // Flash sale countdown timer
  useEffect(() => {
    if (flashSales.length > 0) {
      const activeFlashSale = flashSales[0]; // Get the first active flash sale
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
          // Flash sale has ended, clear the timer
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, categoriesData, flashSalesData] = await Promise.all([
          productService.getFeatured(),
          fetch('http://localhost:5000/api/categories').then(res => res.json()),
          flashSaleService.getActive()
        ]);
        setFeaturedProducts(productsData);
        setCategories(categoriesData);
        setFlashSales(flashSalesData);
        
        // For trending products, we'll use the same featured products for now
        // In a real app, you'd have a separate API endpoint for trending products
        setTrendingProducts(productsData.slice(0, 4));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const activeFlashSale = flashSales.length > 0 ? flashSales[0] : null;

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
        </div>
        
        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-white/20 text-white border-white/30">
              <Zap className="h-4 w-4 mr-2" />
              New Collection 2025
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Premium T-Shirts
              <span className="block text-3xl md:text-4xl font-normal mt-2 opacity-90">
                for Every Style & Occasion
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-2xl mx-auto">
              Discover our collection of comfortable, stylish, and high-quality t-shirts designed for modern life
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8 py-6 bg-white text-blue-600 hover:bg-gray-100">
                <Link to="/products">
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Link to="/categories">
                  Browse Categories
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Flash Sale Countdown */}
      {activeFlashSale && (
        <section className="bg-red-600 text-white py-8" style={{ backgroundColor: activeFlashSale.bannerColor || '#dc2626' }}>
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center mb-4 md:mb-0">
                <Zap className="h-6 w-6 mr-2" />
                <h2 className="text-2xl font-bold">{activeFlashSale.title}</h2>
                <Badge className="ml-4 bg-white text-red-600">
                  {activeFlashSale.discountPercentage}% OFF
                </Badge>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm">Ends in:</span>
                <div className="flex space-x-2">
                  <div className="bg-white/20 rounded-lg px-3 py-2 text-center min-w-[60px]">
                    <div className="text-2xl font-bold">{timeLeft.hours.toString().padStart(2, '0')}</div>
                    <div className="text-xs">Hours</div>
                  </div>
                  <div className="bg-white/20 rounded-lg px-3 py-2 text-center min-w-[60px]">
                    <div className="text-2xl font-bold">{timeLeft.minutes.toString().padStart(2, '0')}</div>
                    <div className="text-xs">Minutes</div>
                  </div>
                  <div className="bg-white/20 rounded-lg px-3 py-2 text-center min-w-[60px]">
                    <div className="text-2xl font-bold">{timeLeft.seconds.toString().padStart(2, '0')}</div>
                    <div className="text-xs">Seconds</div>
                  </div>
                </div>
              </div>
            </div>
            {activeFlashSale.description && (
              <p className="text-center mt-4 opacity-90">
                {activeFlashSale.description}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Trending Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-primary mr-3" />
              <h2 className="text-3xl font-bold">Trending Now</h2>
            </div>
            <Button asChild variant="outline">
              <Link to="/products">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingProducts.map((product) => (
              <Card key={product.id} className="group overflow-hidden transition-all hover:shadow-lg hover:scale-105">
                <Link to={`/products/${product.slug}`} onClick={() => {
                  addToRecentlyViewed(product);
                  addInteraction({
                    type: 'product_view',
                    targetId: product.id.toString(),
                    targetType: 'product',
                    data: { slug: product.slug, name: product.name }
                  });
                }}>
                  <div className="relative aspect-square overflow-hidden">
                    <ImageWithPlaceholder
                      src={Array.isArray(product.images) && product.images.length > 0 ? product.images[0].url : '/placeholder-product.jpg'}
                      alt={product.name}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      placeholderClassName="w-full h-64"
                    />
                    {product.isOnSale && (
                      <Badge className="absolute top-2 left-2 bg-red-500">
                        Sale
                      </Badge>
                    )}
                    <div className="absolute top-2 right-2">
                      <WishlistButton product={product} size="sm" />
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(product.averageRating || 0)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        ({product.reviewCount || 0})
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-primary">
                          ${product.salePrice || product.price}
                        </span>
                        {product.comparePrice && product.comparePrice > product.price && (
                          <span className="text-sm text-muted-foreground line-through">
                            ${product.comparePrice}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Promotional Banners */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* First Promotional Banner */}
            <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-700 text-white">
              <div className="absolute inset-0 bg-black/20"></div>
              <CardContent className="relative z-10 p-8">
                <div className="flex items-center mb-4">
                  <Gift className="h-8 w-8 mr-3" />
                  <Badge className="bg-white/20 text-white border-white/30">
                    Limited Time
                  </Badge>
                </div>
                <h3 className="text-2xl font-bold mb-2">New Customer Discount</h3>
                <p className="text-lg mb-4 opacity-90">
                  Get 20% off your first order when you sign up for our newsletter
                </p>
                <Button className="bg-white text-blue-600 hover:bg-gray-100">
                  Shop Now
                </Button>
              </CardContent>
            </Card>

            {/* Second Promotional Banner */}
            <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-700 text-white">
              <div className="absolute inset-0 bg-black/20"></div>
              <CardContent className="relative z-10 p-8">
                <div className="flex items-center mb-4">
                  <ShoppingBag className="h-8 w-8 mr-3" />
                  <Badge className="bg-white/20 text-white border-white/30">
                    Free Shipping
                  </Badge>
                </div>
                <h3 className="text-2xl font-bold mb-2">Free Shipping on Orders Over $50</h3>
                <p className="text-lg mb-4 opacity-90">
                  Enjoy free shipping on all orders over $50. No hidden fees!
                </p>
                <Button className="bg-white text-purple-600 hover:bg-gray-100">
                  Learn More
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Card key={category.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                <Link to={`/categories/${category.slug}`} onClick={() => {
                  addInteraction({
                    type: 'category_view',
                    targetId: category.id.toString(),
                    targetType: 'category',
                    data: { slug: category.slug, name: category.name }
                  });
                }}>
                  <CardHeader className="text-center">
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">{category.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground text-center">
                      {category.description}
                    </p>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold">Featured T-Shirts</h2>
            <Button asChild variant="outline">
              <Link to="/products">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="group overflow-hidden transition-all hover:shadow-lg hover:scale-105">
                <Link to={`/products/${product.slug}`} onClick={() => {
                  addToRecentlyViewed(product);
                  addInteraction({
                    type: 'product_view',
                    targetId: product.id.toString(),
                    targetType: 'product',
                    data: { slug: product.slug, name: product.name }
                  });
                }}>
                  <div className="relative aspect-square overflow-hidden">
                    <ImageWithPlaceholder
                      src={Array.isArray(product.images) && product.images.length > 0 ? product.images[0].url : '/placeholder-product.jpg'}
                      alt={product.name}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      placeholderClassName="w-full h-64"
                    />
                    {product.isOnSale && (
                      <Badge className="absolute top-2 left-2 bg-red-500">
                        Sale
                      </Badge>
                    )}
                    <div className="absolute top-2 right-2">
                      <WishlistButton product={product} size="sm" />
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(product.averageRating || 0)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        ({product.reviewCount || 0})
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold">
                          ${product.salePrice || product.price}
                        </span>
                        {product.comparePrice && product.comparePrice > product.price && (
                          <span className="text-sm text-muted-foreground line-through">
                            ${product.comparePrice}
                          </span>
                        )}
                      </div>
                      <Button size="sm" onClick={(e) => {
                        e.stopPropagation(); // Prevent card hover effect
                        addToCart(product, 1);
                        addInteraction({
                          type: 'cart_add',
                          targetId: product.id.toString(),
                          targetType: 'product',
                          data: { slug: product.slug, name: product.name }
                        });
                        // Success indication (no alert)
                      }}>
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Recently Viewed Products */}
      <RecentlyViewedProducts />

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Free Shipping</h3>
              <p className="text-muted-foreground">
                Free shipping on orders over $50
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Guarantee</h3>
              <p className="text-muted-foreground">
                30-day money-back guarantee
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Premium Quality</h3>
              <p className="text-muted-foreground">
                Made from the finest materials
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
