import React from 'react';
import { Edit, Trash2, Eye, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';

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

interface CategoryCardProps {
  category: Category;
  onView: (category: Category) => void;
  onEdit: (category: Category) => void;
  onToggleStatus: (category: Category) => void;
  onDelete: (category: Category) => void;
  onImageUpload: (categoryId: number, file: File) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
  onImageUpload
}) => {
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(category.id, file);
    }
  };

  return (
    <Card className="group hover:shadow-2xl transition-all duration-300 border-0 overflow-hidden bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-xl rounded-xl sm:rounded-2xl">
      {/* Category Image */}
      <div className="relative h-48 overflow-hidden">
        {category.image ? (
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
            <div className="text-4xl">👕</div>
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <Badge 
            variant={category.isActive ? "default" : "secondary"}
            className="px-3 py-1 text-sm font-medium"
          >
            {category.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        {/* Action Buttons Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center pointer-events-none">
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-auto">
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onView(category);
              }}
              className="bg-white/90 hover:bg-white text-blue-600 shadow-lg"
              title="View Category Details"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(category);
              }}
              className="bg-white/90 hover:bg-white text-green-600 shadow-lg"
              title="Edit Category"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onToggleStatus(category);
              }}
              className="bg-white/90 hover:bg-white text-gray-700 shadow-lg"
              title={category.isActive ? 'Deactivate' : 'Activate'}
            >
              {category.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
            </Button>
            
            {/* Image Upload Button */}
            <input
              type="file"
              id={`image-upload-${category.id}`}
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                document.getElementById(`image-upload-${category.id}`)?.click();
              }}
              className="bg-white/90 hover:bg-white text-indigo-600 shadow-lg"
              title="Upload Image"
            >
              📷
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(category);
              }}
              disabled={category.productCount > 0}
              className="bg-white/90 hover:bg-white text-red-600 shadow-lg"
              title="Delete Category"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Category Content */}
      <CardContent className="p-4 sm:p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
            {category.name}
          </h3>
          
          {category.description && (
            <p className="text-gray-600 text-sm line-clamp-2 mb-3">
              {category.description}
            </p>
          )}
          
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className="text-xs">
              {category.productCount} products
            </Badge>
            <Badge variant="outline" className="text-xs">
              Sort: {category.sortOrder}
            </Badge>
          </div>
          
          <p className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
            /{category.slug}
          </p>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <span>Updated: {new Date(category.updatedAt).toLocaleDateString()}</span>
        </div>

        {/* View Details Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onView(category)}
          className="w-full border-2 border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
};

export default CategoryCard;
