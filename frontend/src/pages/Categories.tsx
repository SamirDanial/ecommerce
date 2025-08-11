import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Package, Grid, List } from 'lucide-react';
import { useUserInteractionStore } from '../stores/userInteractionStore';

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  productCount?: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  images?: { url: string; alt?: string }[];
  averageRating?: number;
  reviewCount?: number;
  isOnSale?: boolean;
  salePrice?: number;
}

const Categories: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { addInteraction } = useUserInteractionStore();

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  // Track page view
  useEffect(() => {
    addInteraction({
      type: 'page_view',
      targetType: 'page',
      data: { path: '/categories', name: 'Categories' }
    });
  }, [addInteraction]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data.data || data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      // Fallback categories for demo
      setCategories([
        {
          id: 1,
          name: 'Electronics',
          slug: 'electronics',
          description: 'Latest gadgets and electronic devices',
          image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=400&fit=crop',
          isActive: true,
          sortOrder: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 2,
          name: 'Clothing',
          slug: 'clothing',
          description: 'Fashionable clothing for all seasons',
          image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop',
          isActive: true,
          sortOrder: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 3,
          name: 'Home & Garden',
          slug: 'home-garden',
          description: 'Everything you need for your home and garden',
          image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop',
          isActive: true,
          sortOrder: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 4,
          name: 'Sports',
          slug: 'sports',
          description: 'Sports equipment and athletic wear',
          image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
          isActive: true,
          sortOrder: 4,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 5,
          name: 'Books',
          slug: 'books',
          description: 'Books for all ages and interests',
          image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop',
          isActive: true,
          sortOrder: 5,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 6,
          name: 'Beauty',
          slug: 'beauty',
          description: 'Beauty products and cosmetics',
          image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop',
          isActive: true,
          sortOrder: 6,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products?limit=12');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data.data || data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories;

  const handleCategoryClick = (category: Category) => {
    // Navigate to category products page
    navigate(`/categories/${category.slug}`);
    addInteraction({
      type: 'category_view',
      targetId: category.id.toString(),
      targetType: 'category',
      data: { slug: category.slug, name: category.name }
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-64"></div>
            ))}
          </div>
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
      {filteredCategories.length > 0 ? (
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-2 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {filteredCategories.map((category) => (
            <Card
              key={category.id}
              className={`group cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${
                viewMode === 'list' ? 'flex' : ''
              }`}
              onClick={() => handleCategoryClick(category)}
            >
              <div className={`relative overflow-hidden ${
                viewMode === 'list' ? 'w-48 h-32' : 'h-48'
              }`}>
                {/* ImageWithPlaceholder component was removed, so this section is now empty */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-lg font-semibold mb-1">{category.name}</h3>
                  {category.productCount && (
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      {category.productCount} products
                    </Badge>
                  )}
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
                  
                  {viewMode === 'list' && category.productCount && (
                    <span className="text-sm text-muted-foreground">
                      {category.productCount} products available
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
                  {/* ImageWithPlaceholder component was removed, so this section is now empty */}
                  {product.isOnSale && product.salePrice && (
                    <Badge variant="destructive" className="absolute top-2 left-2">
                      Sale
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <h4 className="font-medium text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                    {product.name}
                  </h4>
                  <div className="flex items-center justify-between">
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
