import React, { useState } from 'react';
import { Edit, Trash2, Eye, CheckCircle, XCircle, MoreHorizontal } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

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
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onView,
  onEdit,
  onToggleStatus,
  onDelete
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Helper functions to handle dropdown menu actions and close the menu
  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen(false);
    onView(category);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen(false);
    onEdit(category);
  };

  const handleToggleStatus = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen(false);
    onToggleStatus(category);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen(false);
    onDelete(category);
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

        {/* 3-Dots Menu - Clean and Elegant */}
        <div className="absolute top-2 right-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 bg-white/90 hover:bg-white/95 shadow-lg border border-gray-200/50"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4 text-gray-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleView}>
                <Eye className="mr-2 h-4 w-4 text-blue-600" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4 text-green-600" />
                Edit Category
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleToggleStatus}
                className={category.isActive ? 'text-red-600' : 'text-green-600'}
              >
                {category.isActive ? (
                  <XCircle className="mr-2 h-4 w-4" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                {category.isActive ? 'Deactivate' : 'Activate'}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleDelete}
                disabled={category.productCount > 0}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Category
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Category Content */}
      <CardContent className="p-4 sm:p-6">
        {/* Mobile Layout - Minimal Information */}
        <div className="block sm:hidden">
          <div className="mb-3">
            <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">
              {category.name}
            </h3>
            
            {/* Truncated Description - One Line Only */}
            {category.description && (
              <p className="text-gray-600 text-sm line-clamp-1 mb-2">
                {category.description}
              </p>
            )}
            
            {/* Minimal Badges - Only Essential Info */}
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline" className="text-xs">
                {category.productCount} products
              </Badge>
              <Badge variant={category.isActive ? "default" : "secondary"} className="text-xs">
                {category.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>

          {/* View Details Button - Prominent on Mobile */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(category)}
            className="w-full border-2 border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 h-10"
          >
            View Details
          </Button>
        </div>

        {/* Desktop Layout - Full Information */}
        <div className="hidden sm:block">
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
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryCard;
