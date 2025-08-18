import React from 'react';
import CategoryCard from './CategoryCard';

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

interface CategoryGridProps {
  categories: Category[];
  onView: (category: Category) => void;
  onEdit: (category: Category) => void;
  onToggleStatus: (category: Category) => void;
  onDelete: (category: Category) => void;
  onImageUpload: (categoryId: number, file: File) => void;
}

const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
  onImageUpload
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
      {categories.map((category) => (
        <CategoryCard
          key={category.id}
          category={category}
          onView={onView}
          onEdit={onEdit}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
          onImageUpload={onImageUpload}
        />
      ))}
    </div>
  );
};

export default CategoryGrid;
