import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUserInteractionStore } from '../stores/userInteractionStore';
import { useClerkAuth } from '../hooks/useClerkAuth';
import { useWishlistStore } from '../stores/wishlistStore';
import { useQuery } from '@tanstack/react-query';
import { categoryService } from '../services/api';

// Custom hooks
import { useViewMode } from '../hooks/useViewMode';

// Components
import { CategoryBanner } from '../components/categories/CategoryBanner';
import { CategoryHeader } from '../components/categories/CategoryHeader';
import { CategoryFilters } from '../components/categories/CategoryFilters';
import { CategoryProductsGrid } from '../components/categories/CategoryProductsGrid';
import SearchBar from '../components/SearchBar';

import { Product } from '../types';

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
  const navigate = useNavigate();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const { viewMode, setViewMode } = useViewMode();
  const [sortBy, setSortBy] = useState<string>('featured');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const { addInteraction } = useUserInteractionStore();
  const { loadWishlistFromDatabase } = useWishlistStore();
  const { isAuthenticated, getToken } = useClerkAuth();

  const { data: fetchedCategory, isLoading: isCategoryLoading } = useQuery<Category>({
    queryKey: ['category', slug],
    queryFn: () => categoryService.getBySlug(slug!),
    enabled: !!slug,
  });

  const { data: fetchedProducts, isLoading: isProductsLoading } = useQuery<Product[]>({
    queryKey: ['products', 'category', slug],
    queryFn: () => categoryService.getProducts(slug!, 50),
    enabled: !!slug,
  });

  useEffect(() => {
    if (fetchedCategory) {
      setCategory(fetchedCategory);
    }
    if (fetchedProducts) {
      setProducts(fetchedProducts);
    }
  }, [fetchedCategory, fetchedProducts]);

  // Load wishlist data when component mounts
  useEffect(() => {
    const loadWishlist = async () => {
      if (isAuthenticated) {
        try {
          const token = await getToken();
          if (token) {
            await loadWishlistFromDatabase(token);
          }
        } catch (error) {
          console.error('Failed to load wishlist:', error);
        }
      }
    };

    loadWishlist();
  }, [isAuthenticated, getToken, loadWishlistFromDatabase]);

  const filteredProducts = products.filter(product => {
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    const matchesTags = selectedTags.length === 0 || (product.tags && selectedTags.some(tag => product.tags!.includes(tag)));
    
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

  const allTags = Array.from(new Set(products.flatMap(p => p.tags || [])));

  const handleProductClick = (product: Product) => {
    addInteraction({
      type: 'product_view',
      targetId: product.id.toString(),
      targetType: 'product',
      data: { slug: product.slug, name: product.name }
    });
    // Navigate to product detail page
    navigate(`/products/${product.slug}`);
  };

  if (isCategoryLoading || isProductsLoading) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground text-lg">Loading category...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Engaging Banner */}
        <CategoryBanner
          categoryName={category?.name || 'Category'}
          productCount={category?.productCount || 0}
          categoryDescription={category?.description}
        />
        
        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar />
        </div>
        
        {/* Header with Controls */}
        <CategoryHeader
          categoryName={category?.name || 'Category'}
          categoryDescription={category?.description}
          productCount={category?.productCount || 0}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onFilterClick={() => setShowFilters(!showFilters)}
          sortBy={sortBy}
          onSortChange={setSortBy}
          showFilters={showFilters}
        />

        {/* Filters Panel */}
        {showFilters && (
          <CategoryFilters
            priceRange={priceRange}
            onPriceRangeChange={setPriceRange}
            selectedTags={selectedTags}
            onTagToggle={(tag) => {
              if (selectedTags.includes(tag)) {
                setSelectedTags(selectedTags.filter(t => t !== tag));
              } else {
                setSelectedTags([...selectedTags, tag]);
              }
            }}
            allTags={allTags}
            onClearFilters={() => {
              setPriceRange([0, 1000]);
              setSelectedTags([]);
            }}
            hasActiveFilters={priceRange[0] > 0 || priceRange[1] < 1000 || selectedTags.length > 0}
          />
        )}

        {/* Products Grid */}
        <CategoryProductsGrid
          products={sortedProducts}
          viewMode={viewMode}
          onProductClick={handleProductClick}
          totalProducts={products.length}
        />
      </div>
    </div>
  );
};

export default CategoryDetail;
