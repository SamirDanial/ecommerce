import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserInteractionStore } from '../stores/userInteractionStore';
import { useQuery } from '@tanstack/react-query';
import { categoryService } from '../services/api';

// Custom hooks
import { useViewMode } from '../hooks/useViewMode';

// Components
import { CategoriesBanner } from '../components/categories/CategoriesBanner';
import { CategoriesHeader } from '../components/categories/CategoriesHeader';
import { CategoriesGrid } from '../components/categories/CategoriesGrid';

const Categories: React.FC = () => {
  const navigate = useNavigate();
  const { viewMode, setViewMode } = useViewMode();
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
      <div className="relative min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground text-lg">Loading categories...</p>
          </div>
        </div>
      </div>
    );
  }

  if (categoriesError) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Categories</h1>
            <p className="text-muted-foreground mb-4">Failed to load categories. Please try again later.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Engaging Banner */}
        <CategoriesBanner />
        
        {/* Header with Controls */}
        <CategoriesHeader
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          categoryCount={categories.length}
        />

        {/* Categories Grid */}
        <CategoriesGrid
          categories={categories}
          viewMode={viewMode}
          onCategorySelect={handleCategorySelect}
        />
      </div>
    </div>
  );
};

export default Categories;
