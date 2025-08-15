import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Grid, List, Package } from 'lucide-react';
import { ImageWithPlaceholder } from '../components/ui/image-with-placeholder';
import { useUserInteractionStore } from '../stores/userInteractionStore';
import { useQuery } from '@tanstack/react-query';
import { categoryService } from '../services/api';

const Categories: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { addInteraction } = useUserInteractionStore();

  // Fetch categories using React Query
  const { data: categories = [], isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
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
    addInteraction({
      type: 'category_view',
      targetId: categorySlug,
      targetType: 'category',
      data: { slug: categorySlug }
    });
    // Navigate to category detail page
    navigate(`/categories/${categorySlug}`);
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


    </div>
  );
};

export default Categories;
