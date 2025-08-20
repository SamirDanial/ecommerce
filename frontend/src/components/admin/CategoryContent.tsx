import React from 'react';
import CategoryGrid from './CategoryGrid';
import CategoryList from './CategoryList';

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  productCount: number;
}

interface CategoryContentProps {
  loading: boolean;
  viewMode: 'grid' | 'list';
  categories: Category[];
  onView: (category: Category) => void;
  onEdit: (category: Category) => void;
  onToggleStatus: (category: Category) => void;
  onDelete: (category: Category) => void;
}

const CategoryContent: React.FC<CategoryContentProps> = ({
  loading,
  viewMode,
  categories,
  onView,
  onEdit,
  onToggleStatus,
  onDelete
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <div className="text-4xl">👕</div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">No categories found</h3>
        <p className="text-gray-500">Create your first category to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {viewMode === 'grid' ? (
        <CategoryGrid
          categories={categories}
          onView={onView}
          onEdit={onEdit}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
        />
      ) : (
        <CategoryList
          categories={categories}
          onView={onView}
          onEdit={onEdit}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
        />
      )}
    </div>
  );
};

export default CategoryContent;
