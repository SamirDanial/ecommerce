import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { ImageWithPlaceholder } from '../components/ui/image-with-placeholder';
import SearchBar from '../components/SearchBar';
import { 
  Package, 
  Grid, 
  List, 
  Filter, 
  Star,
  ShoppingCart,
  Heart,
  ArrowUpDown
} from 'lucide-react';
import { useUserInteractionStore } from '../stores/userInteractionStore';
import { useCartStore } from '../stores/cartStore';

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  images?: { url: string; alt?: string }[];
  averageRating?: number;
  reviewCount?: number;
  isOnSale?: boolean;
  salePrice?: number;
  isFeatured?: boolean;
  tags: string[];
  createdAt?: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  productCount?: number;
}

const CategoryDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const { addInteraction } = useUserInteractionStore();
  const { addToCart } = useCartStore();

  const fetchCategory = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/categories/${slug}`);
      if (!response.ok) throw new Error('Failed to fetch category');
      const data = await response.json();
      setCategory(data);
    } catch (error) {
      console.error('Failed to fetch category:', error);
      // Fallback category data
      setCategory({
        id: 1,
        name: slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : 'Category',
        slug: slug || '',
        description: `Browse our collection of ${slug || 'category'} products`,
        productCount: 0
      });
    }
  }, [slug]);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/products?category=${slug}&limit=50`);
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data.data || data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      // Fallback products for demo
      setProducts([
        {
          id: 1,
          name: 'Sample Product 1',
          slug: 'sample-product-1',
          description: 'This is a sample product description',
          price: 99.99,
          comparePrice: 129.99,
          images: [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop' }],
          averageRating: 4.5,
          reviewCount: 23,
          isOnSale: true,
          salePrice: 89.99,
          isFeatured: true,
          tags: ['featured', 'popular']
        },
        {
          id: 2,
          name: 'Sample Product 2',
          slug: 'sample-product-2',
          description: 'Another sample product for demonstration',
          price: 149.99,
          images: [{ url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop' }],
          averageRating: 4.2,
          reviewCount: 15,
          isOnSale: false,
          isFeatured: false,
          tags: ['new']
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (slug) {
      fetchCategory();
      fetchProducts();
    }
  }, [slug, fetchCategory, fetchProducts]);

  const filteredProducts = products.filter(product => {
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => product.tags.includes(tag));
    
    return matchesPrice && matchesTags;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return (b.averageRating || 0) - (a.averageRating || 0);
      case 'newest':
        return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
      default:
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    }
  });

  const allTags = Array.from(new Set(products.flatMap(p => p.tags)));

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-64"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }



  return (
    <div className="container mx-auto px-4 py-8">
      {/* Category Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          {category?.name || 'Category'}
        </h1>
        {category?.description && (
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
            {category.description}
          </p>
        )}
        {category?.productCount && (
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {category.productCount} products available
          </Badge>
        )}
      </div>

      {/* Search and Controls */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        {/* Search Bar */}
        <div className="flex-1">
          <SearchBar />
        </div>

        {/* View Mode and Sort */}
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-6" />

          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest</option>
            </select>
            <ArrowUpDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-muted/30 rounded-lg p-6 mb-8">
          <h3 className="font-semibold mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium mb-2">Price Range</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                  className="w-20"
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="w-20"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium mb-2">Tags</label>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => {
                      if (selectedTags.includes(tag)) {
                        setSelectedTags(selectedTags.filter(t => t !== tag));
                      } else {
                        setSelectedTags([...selectedTags, tag]);
                      }
                    }}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setPriceRange([0, 1000]);
                  setSelectedTags([]);
                  // setSearchQuery(''); // This line is removed
                }}
              >
                Clear All Filters
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {sortedProducts.length > 0 ? (
        <>
          <div className="flex items-center justify-between mb-6">
            <p className="text-muted-foreground">
              Showing {sortedProducts.length} of {products.length} products
            </p>
          </div>

          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {sortedProducts.map((product) => (
              <Card key={product.id} className="group cursor-pointer transition-all hover:shadow-lg">
                <div className="relative overflow-hidden">
                  <ImageWithPlaceholder
                    src={product.images && product.images.length > 0 ? product.images[0].url : ''}
                    alt={product.name}
                    className={`w-full object-cover group-hover:scale-110 transition-transform duration-300 ${
                      viewMode === 'list' ? 'h-32' : 'h-48'
                    }`}
                  />
                  {product.isOnSale && (
                    <Badge variant="destructive" className="absolute top-2 left-2">
                      Sale
                    </Badge>
                  )}
                  {product.isFeatured && (
                    <Badge variant="secondary" className="absolute top-2 right-2">
                      Featured
                    </Badge>
                  )}
                  
                  {/* Quick Actions */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 bg-white/90 hover:bg-white">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <CardContent className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                  <h3 className="font-medium text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  
                  {product.averageRating && (
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs text-muted-foreground">
                        {product.averageRating.toFixed(1)} ({product.reviewCount})
                      </span>
                    </div>
                  )}

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

                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product, 1);
                        addInteraction({
                          type: 'cart_add',
                          targetId: product.id.toString(),
                          targetType: 'product',
                          data: { slug: product.slug, name: product.name }
                        });
                        // Success indication (no alert)
                      }}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No products found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search terms or filters to find what you're looking for.
          </p>
          <Button onClick={() => {
            // setSearchQuery(''); // This line is removed
            setPriceRange([0, 1000]);
            setSelectedTags([]);
          }}>
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default CategoryDetail;
