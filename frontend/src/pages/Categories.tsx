import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Star, ShoppingBag, Grid, List, Package } from 'lucide-react';
import { ImageWithPlaceholder } from '../components/ui/image-with-placeholder';
import { useUserInteractionStore } from '../stores/userInteractionStore';
import { useQuery } from '@tanstack/react-query';
import { categoryService } from '../services/api';
import { toast } from 'sonner';

const Categories: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { addToRecentlyViewed, addInteraction } = useUserInteractionStore();

  // Fetch categories using React Query
  const { data: categories = [], isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch products for selected category using React Query
  const { data: products = [] } = useQuery({
    queryKey: ['products', 'category', selectedCategory],
    queryFn: () => selectedCategory ? categoryService.getProducts(selectedCategory, 12) : Promise.resolve([]),
    enabled: !!selectedCategory,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Track page view
  useEffect(() => {
    addInteraction({
      type: 'page_view',
      targetType: 'page',
      data: { path: '/categories', name: 'Categories' }
    });
  }, [addInteraction]);

  const handleCategorySelect = (categorySlug: string) => {
    setSelectedCategory(categorySlug);
    addInteraction({
      type: 'category_view',
      targetId: categorySlug,
      targetType: 'category',
      data: { slug: categorySlug }
    });
  };

  const handleProductClick = (product: any) => {
    addToRecentlyViewed(product);
    addInteraction({
      type: 'product_view',
      targetId: product.id.toString(),
      targetType: 'product',
      data: { slug: product.slug, name: product.name }
    });
  };

  const handleAddToCart = (product: any) => {
    addInteraction({
      type: 'cart_add',
      targetId: product.id.toString(),
      targetType: 'product',
      data: { slug: product.slug, name: product.name }
    });
    toast.success(`${product.name} added to cart`);
  };

  if (categoriesLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading categories...</p>
        </div>
      </div>
    );
  }

  if (categoriesError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Categories</h1>
          <p className="text-muted-foreground mb-4">Failed to load categories. Please try again later.</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }


  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">Browse Categories</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover our wide range of product categories. Find exactly what you're looking for from our carefully curated selection.
        </p>
      </div>

      {/* Search and Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        {/* SearchBar component was removed, so this section is now empty */}

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
        </div>
      </div>

      {/* Categories Grid */}
      {categories.length > 0 ? (
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-2 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {categories.map((category) => (
            <Card
              key={category.id}
              className={`group cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${
                viewMode === 'list' ? 'flex' : ''
              }`}
              onClick={() => handleCategorySelect(category.slug)}
            >
              <div className={`relative overflow-hidden ${
                viewMode === 'list' ? 'w-48 h-32' : 'h-48'
              }`}>
                <ImageWithPlaceholder
                  src={category.image || '/placeholder-category.jpg'}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-lg font-semibold mb-1">{category.name}</h3>
                </div>
              </div>

              <CardContent className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                {category.description && (
                  <p className="text-muted-foreground mb-3 line-clamp-2">
                    {category.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between">
                  <Button variant="outline" size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground">
                    Browse Category
                  </Button>
                  
                  {viewMode === 'list' && (
                    <span className="text-sm text-muted-foreground">
                      {products.length} products available
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No categories found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search terms or browse all categories.
          </p>
        </div>
      )}

      {/* Featured Products Section */}
      {products.length > 0 && (
        <>
          {/* Separator component was removed, so this section is now empty */}
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-4">Featured Products</h2>
            <p className="text-muted-foreground">
              Check out some of our most popular products across all categories
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 8).map((product) => (
              <Card key={product.id} className="group cursor-pointer transition-all hover:shadow-lg">
                <div className="relative overflow-hidden">
                  <ImageWithPlaceholder
                    src={product.images && Array.isArray(product.images) && product.images.length > 0 ? product.images[0].url : '/placeholder-product.jpg'}
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {product.isOnSale && product.salePrice && (
                    <Badge variant="destructive" className="absolute top-2 left-2">
                      Sale
                    </Badge>
                  )}
                  <div className="absolute top-2 right-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 bg-background/80 hover:bg-background"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                    >
                      <ShoppingBag className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div 
                    className="cursor-pointer"
                    onClick={() => handleProductClick(product)}
                  >
                    <h4 className="font-medium text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </h4>
                    <div className="flex items-center justify-between mb-2">
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
                      {product.averageRating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-muted-foreground">
                            {product.averageRating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    onClick={() => handleProductClick(product)}
                  >
                    View Product
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Categories;
