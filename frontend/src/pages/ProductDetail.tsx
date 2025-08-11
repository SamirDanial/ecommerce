import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Product } from '../types';
import { productService } from '../services/api';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ImageWithPlaceholder } from '../components/ui/image-with-placeholder';
import { WishlistButton } from '../components/WishlistButton';
import { useUserInteractionStore } from '../stores/userInteractionStore';
import { useCartStore } from '../stores/cartStore';
import { 
  Star, 
  ShoppingCart, 
  Share2, 
  Truck, 
  RotateCcw, 
  Shield, 
  ChevronRight,
  Minus,
  Plus,
  Zap,
  TrendingUp,
  ThumbsUp,
  MessageSquare,
  Flag,
  Check,
  Trash2
} from 'lucide-react';
import ProductImageGallery from '../components/ProductImageGallery';
import SizeChart from '../components/SizeChart';
import FrequentlyBoughtTogether from '../components/FrequentlyBoughtTogether';
import { RecentlyViewedProducts } from '../components/RecentlyViewedProducts';

const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [activeTab, setActiveTab] = useState('description');
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [showAddedToCart, setShowAddedToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  
  const { addToRecentlyViewed, addInteraction } = useUserInteractionStore();
  const { addToCart, removeFromCart, isInCart, getItemQuantity, updateQuantity } = useCartStore();

  // Utility function to format dates
  const formatDate = (dateString: string | Date): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Recently';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Recently';
    }
  };

  // Check if current product variant is in cart
  const isProductInCart = product ? isInCart(product.id, selectedColor, selectedSize) : false;
  const cartItemQuantity = product ? getItemQuantity(product.id, selectedColor, selectedSize) : 0;

  // Update local quantity when cart quantity changes or variants change
  useEffect(() => {
    if (isProductInCart && cartItemQuantity > 0) {
      setQuantity(cartItemQuantity);
    } else {
      setQuantity(1);
    }
  }, [isProductInCart, cartItemQuantity, selectedColor, selectedSize]);

  // Reset success state when variants change
  useEffect(() => {
    setShowAddedToCart(false);
  }, [selectedColor, selectedSize]);

  // Scroll to top when component mounts or slug changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        const data = await productService.getBySlug(slug);
        setProduct(data);
        
        // Track product view
        addToRecentlyViewed(data);
        addInteraction({
          type: 'product_view',
          targetId: data.id.toString(),
          targetType: 'product',
          data: { slug: data.slug, name: data.name }
        });
        
        // Set default color and size
        if (data.variants && data.variants.length > 0) {
          const firstVariant = data.variants[0];
          setSelectedColor(firstVariant.color);
          setSelectedSize(firstVariant.size);
        }

        // Fetch related products
        try {
          const related = await productService.getRelated(data.id);
          setRelatedProducts(related);
        } catch (err) {
          console.error('Error fetching related products:', err);
        }
      } catch (err) {
        setError('Failed to fetch product details');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug, addToRecentlyViewed, addInteraction]);

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    
    // Reset size selection if the new color doesn't have the currently selected size
    if (product) {
      const colorVariants = product.variants?.filter(v => v.color === color) || [];
      const availableSizesForColor = Array.from(new Set(colorVariants.map(v => v.size)));
      
      if (!availableSizesForColor.includes(selectedSize as any)) {
        setSelectedSize(availableSizesForColor[0] || '');
      }
    }
  };

  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = Math.max(1, quantity + change);
    setQuantity(newQuantity);
  };

  const handleAddToCart = () => {
    if (product && selectedColor && selectedSize) {
      if (isProductInCart) {
        // Update existing cart item quantity
        updateQuantity(product.id, quantity, selectedColor, selectedSize);
        
        addInteraction({
          type: 'cart_add',
          targetId: product.id.toString(),
          targetType: 'product',
          data: { 
            productName: product.name, 
            quantity,
            action: 'quantity_updated',
            color: selectedColor, 
            size: selectedSize 
          }
        });
      } else {
        // Add new item to cart
        addToCart(product, quantity, selectedColor, selectedSize);
        
        addInteraction({
          type: 'cart_add',
          targetId: product.id.toString(),
          targetType: 'product',
          data: { 
            productName: product.name, 
            quantity, 
            color: selectedColor, 
            size: selectedSize 
          }
        });
      }
      
      // Show success state
      setShowAddedToCart(true);
      setTimeout(() => setShowAddedToCart(false), 3000);
    } else {
      // Show error for missing selection
      // You could add a toast notification here later
    }
  };

  const handleRemoveFromCart = () => {
    if (product && selectedColor && selectedSize) {
      removeFromCart(product.id, selectedColor, selectedSize);
      
      // Track interaction
      addInteraction({
        type: 'cart_remove',
        targetId: product.id.toString(),
        targetType: 'product',
        data: { 
          productName: product.name, 
          color: selectedColor, 
          size: selectedSize 
        }
      });
      
      // Reset quantity to 1 and show removed state briefly
      setQuantity(1);
      setShowAddedToCart(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      if (product) {
        navigator.clipboard.writeText(window.location.href);
        // You could add a toast notification here
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-4">Product Not Found</h2>
          <p className="text-muted-foreground mb-4">{error || 'The product you are looking for does not exist.'}</p>
          <Button asChild>
            <Link to="/products">Back to Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  const images = Array.isArray(product.images) ? product.images : [];
  
  // Fix Set iteration issues by using Array.from
  const availableSizes = Array.from(new Set(product.variants?.map(v => v.size) || []));

  // Color swatches data is now handled directly in the component

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/products" className="hover:text-foreground">Products</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{product.name}</span>
        </nav>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <ProductImageGallery
              images={images}
              productName={product.name}
            />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Product Header */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold">{product.name}</h1>
                  {isProductInCart && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                      <ShoppingCart className="h-3 w-3 mr-1" />
                      In Cart ({cartItemQuantity})
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <WishlistButton product={product} size="md" />
                  <Button size="sm" variant="outline" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-2 mb-4">
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
                  {product.averageRating?.toFixed(1)} ({product.reviewCount || 0} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-3xl font-bold text-primary">
                  ${product.salePrice || product.price}
                </span>
                {product.comparePrice && product.comparePrice > product.price && (
                  <span className="text-xl text-muted-foreground line-through">
                    ${product.comparePrice}
                  </span>
                )}
                {product.isOnSale && (
                  <Badge className="bg-red-500">
                    {Math.round(((product.comparePrice || 0) - (product.salePrice || product.price)) / (product.comparePrice || 1) * 100)}% OFF
                  </Badge>
                )}
              </div>
            </div>

            {/* Size Selection */}
            {availableSizes.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">Size: {selectedSize}</h3>
                  <SizeChart />
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => handleSizeChange(size)}
                      className={`px-4 py-2 border rounded-md transition-all ${
                        selectedSize === size
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {product.variants && product.variants.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2">Color: {selectedColor}</h3>
                <div className="flex flex-wrap gap-2">
                  {Array.from(new Set(product.variants.map(v => v.color))).map((colorName) => {
                    const variant = product.variants?.find(v => v.color === colorName);
                    const inStock = variant ? variant.stock > 0 : false;
                    return (
                      <button
                        key={colorName}
                        onClick={() => handleColorChange(colorName)}
                        disabled={!inStock}
                        className={`
                          w-8 h-8 rounded-full border-2 transition-all relative
                          ${!inStock ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-110'}
                          ${selectedColor === colorName 
                            ? 'border-primary scale-110' 
                            : 'border-border hover:border-primary/50'
                          }
                        `}
                        style={{ backgroundColor: variant?.colorCode || '#ccc' }}
                        title={`${colorName}${!inStock ? ' - Out of Stock' : ''}`}
                      >
                        {selectedColor === colorName && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="text-sm font-medium mb-2">
                {isProductInCart ? 'Update Cart Quantity' : 'Quantity to Add'}
              </h3>
              {isProductInCart && (
                <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-xs text-blue-700">
                    Currently <span className="font-semibold">{cartItemQuantity}</span> in cart
                  </p>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="h-10 w-10 p-0"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-16 text-center text-lg font-semibold px-3 py-2 bg-muted rounded-md">
                  {quantity}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuantityChange(1)}
                  className="h-10 w-10 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {isProductInCart 
                  ? `Adjust the quantity above and click "Update Cart" to save changes.`
                  : 'Select the quantity you want to add to your cart'
                }
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className={`flex-1 ${
                  showAddedToCart 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : isProductInCart 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : ''
                }`}
                onClick={handleAddToCart}
                disabled={showAddedToCart}
              >
                {showAddedToCart ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    {isProductInCart ? 'Cart Updated!' : 'Added to Cart!'}
                  </>
                ) : isProductInCart ? (
                  <>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Update Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </>
                )}
              </Button>
              <Button size="lg" variant="outline" className="flex-1">
                Buy Now
              </Button>
            </div>

            {/* Remove from Cart Button (when item is in cart) */}
            {isProductInCart && (
              <div className="flex justify-center">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleRemoveFromCart}
                  className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove from Cart
                </Button>
              </div>
            )}
            
            {/* Success Message */}
            {showAddedToCart && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800 flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  {isProductInCart 
                    ? `Cart updated successfully! Quantity is now ${quantity}.`
                    : `${quantity} ${quantity === 1 ? 'item' : 'items'} added to cart successfully!`
                  }
                </p>
              </div>
            )}
            
            {/* Cart Status Message */}
            {isProductInCart && !showAddedToCart && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800 flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  This item is already in your cart ({cartItemQuantity} {cartItemQuantity === 1 ? 'item' : 'items'}). 
                  You can remove it or adjust the quantity above.
                </p>
              </div>
            )}

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 py-4 border-t">
              <div className="flex items-center space-x-2">
                <Truck className="h-4 w-4 text-primary" />
                <span className="text-sm">Free Shipping</span>
              </div>
              <div className="flex items-center space-x-2">
                <RotateCcw className="h-4 w-4 text-primary" />
                <span className="text-sm">30-Day Returns</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-sm">1 Year Warranty</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-sm">Fast Delivery</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({product.reviewCount || 0})</TabsTrigger>
              <TabsTrigger value="qa">Q&A</TabsTrigger>
              <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                  
                  {product.tags && product.tags.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-medium mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {product.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Customer Reviews
                        {product.reviewCount && product.reviewCount > 0 && (
                          <Badge variant="secondary" className="text-sm">
                            {product.reviewCount} reviews
                          </Badge>
                        )}
                      </CardTitle>
                      {product.averageRating && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.floor(product.averageRating!)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-lg font-semibold text-primary">
                            {product.averageRating.toFixed(1)}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            out of 5
                          </span>
                        </div>
                      )}
                      
                      {/* Rating Distribution Chart */}
                      {product.reviews && product.reviews.length > 0 && (
                        <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                          <h4 className="text-sm font-medium mb-3">Rating Distribution</h4>
                          <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map((rating) => {
                              const count = product.reviews?.filter(r => r.rating === rating).length || 0;
                              const percentage = product.reviewCount ? (count / product.reviewCount) * 100 : 0;
                              return (
                                <div key={rating} className="flex items-center gap-3">
                                  <div className="flex items-center gap-1 w-8">
                                    <span className="text-xs text-muted-foreground">{rating}</span>
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  </div>
                                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-muted-foreground w-8 text-right">
                                    {count}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                    <Button variant="outline" size="sm">
                      <Star className="h-4 w-4 mr-2" />
                      Write a Review
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {product.reviews && product.reviews.length > 0 ? (
                    <div className="space-y-6">
                      {/* Review Filters */}
                      <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm font-medium">Filter by:</span>
                        <div className="flex items-center gap-2">
                          {[5, 4, 3, 2, 1].map((rating) => (
                            <Button
                              key={rating}
                              variant="outline"
                              size="sm"
                              className="h-8 px-3 text-xs"
                            >
                              {rating}★
                            </Button>
                          ))}
                        </div>
                        <Separator orientation="vertical" className="h-6" />
                        <Button variant="outline" size="sm" className="h-8 px-3 text-xs">
                          Most Recent
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 px-3 text-xs">
                          Most Helpful
                        </Button>
                      </div>

                      {/* Reviews List */}
                      {product.reviews.map((review) => (
                        <div key={review.id} className="border-b pb-6 last:border-b-0">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start space-x-3">
                              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-primary-foreground text-sm font-medium">
                                  {review.user?.name?.charAt(0) || 'U'}
                                </span>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-medium">{review.user?.name || 'Anonymous'}</p>
                                  {review.isVerified && (
                                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                      ✓ Verified Purchase
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-3 w-3 ${
                                          i < review.rating
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm text-muted-foreground">
                                    {review.rating}.0
                                  </span>
                                </div>
                                {review.title && (
                                  <h4 className="font-medium mb-2 text-base">{review.title}</h4>
                                )}
                                <p className="text-muted-foreground leading-relaxed">{review.comment}</p>
                              </div>
                            </div>
                            <span className="text-sm text-muted-foreground flex-shrink-0">
                              {formatDate(review.createdAt)}
                            </span>
                          </div>
                          
                          {/* Review Actions */}
                          <div className="flex items-center gap-4 ml-13">
                            <Button variant="ghost" size="sm" className="h-8 px-3 text-xs">
                              <ThumbsUp className="h-3 w-3 mr-1" />
                              Helpful
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 px-3 text-xs">
                              <MessageSquare className="h-3 w-3 mr-1" />
                              Reply
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 px-3 text-xs">
                              <Flag className="h-3 w-3 mr-1" />
                              Report
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Star className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">No reviews yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Be the first to share your experience with this product!
                      </p>
                      <Button>
                        <Star className="h-4 w-4 mr-2" />
                        Write the First Review
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="qa" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      Questions & Answers
                      <Badge variant="secondary" className="text-sm">
                        0 questions
                      </Badge>
                    </CardTitle>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Ask a Question
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No questions yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Have a question about this product? Ask and get answers from other customers!
                    </p>
                    <Button>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Ask the First Question
                    </Button>
                  </div>
                  
                  {/* Q&A Search and Filters */}
                  <div className="mt-8 p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-medium mb-3">Q&A Guidelines</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Ask specific questions about product features, sizing, or usage</li>
                      <li>• Be respectful and helpful to other community members</li>
                      <li>• Questions are typically answered within 24-48 hours</li>
                      <li>• Verified purchasers can mark answers as helpful</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="shipping" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Shipping & Returns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Shipping Information</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Free shipping on orders over $50</li>
                        <li>• Standard delivery: 3-5 business days</li>
                        <li>• Express delivery: 1-2 business days</li>
                        <li>• International shipping available</li>
                      </ul>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-2">Return Policy</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• 30-day return window</li>
                        <li>• Free returns for defective items</li>
                        <li>• Return shipping label provided</li>
                        <li>• Full refund or exchange available</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Frequently Bought Together */}
        <div className="mt-16">
          <FrequentlyBoughtTogether 
            currentProduct={product}
            relatedProducts={relatedProducts}
          />
        </div>

        {/* Recently Viewed Products */}
        <div className="mt-16">
          <RecentlyViewedProducts />
        </div>

        {/* Related Products */}
        <div className="mt-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-orange-600" />
                You Might Also Like
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Discover more products that complement your selection
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.slice(0, 8).map((product) => (
                  <Card 
                    key={product.id} 
                    className="group cursor-pointer transition-all hover:shadow-lg hover:scale-105"
                    onClick={() => window.location.href = `/product/${product.slug}`}
                  >
                    <div className="relative overflow-hidden">
                      <ImageWithPlaceholder
                        src={product.images && product.images.length > 0 ? product.images[0].url : ''}
                        alt={product.name}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {product.comparePrice && product.comparePrice > product.price && (
                        <Badge variant="destructive" className="absolute top-2 left-2">
                          -{Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}%
                        </Badge>
                      )}
                      {product.isFeatured && (
                        <Badge variant="secondary" className="absolute top-2 right-2 bg-yellow-500 text-yellow-900">
                          Featured
                        </Badge>
                      )}
                    </div>
                    
                    <CardContent className="p-4">
                      <h4 className="font-medium text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                        {product.name}
                      </h4>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < Math.floor(product.averageRating || 0) 
                                  ? 'text-yellow-400 fill-current' 
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          ({product.reviewCount || 0})
                        </span>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {product.comparePrice && product.comparePrice > product.price ? (
                            <>
                              <span className="font-semibold text-primary">
                                ${product.price.toFixed(2)}
                              </span>
                              <span className="text-sm text-muted-foreground line-through">
                                ${product.comparePrice.toFixed(2)}
                              </span>
                            </>
                          ) : (
                            <span className="font-semibold text-primary">
                              ${product.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>

                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `/product/${product.slug}`;
                        }}
                      >
                        View Product
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
