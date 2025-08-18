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
  onImageUpload: (categoryId: number, file: File) => void;
}

const CategoryContent: React.FC<CategoryContentProps> = ({
  loading,
  viewMode,
  categories,
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
  onImageUpload
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-purple-200 rounded-full animate-spin"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-purple-600 rounded-full animate-spin"></div>
        </div>
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
          onImageUpload={onImageUpload}
        />
      ) : (
        <CategoryList
          categories={categories}
          onView={onView}
          onEdit={onEdit}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
          onImageUpload={onImageUpload}
        />
      )}
    </div>
  );
};

export default CategoryContent;
