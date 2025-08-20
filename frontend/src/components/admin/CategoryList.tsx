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

interface CategoryListProps {
  categories: Category[];
  onView: (category: Category) => void;
  onEdit: (category: Category) => void;
  onToggleStatus: (category: Category) => void;
  onDelete: (category: Category) => void;
}

// Individual Category List Item Component
const CategoryListItem: React.FC<{
  category: Category;
  onView: (category: Category) => void;
  onEdit: (category: Category) => void;
  onToggleStatus: (category: Category) => void;
  onDelete: (category: Category) => void;
}> = ({ category, onView, onEdit, onToggleStatus, onDelete }) => {
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);
  const [isDesktopDropdownOpen, setIsDesktopDropdownOpen] = useState(false);

  // Helper functions to handle dropdown menu actions and close the menu
  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMobileDropdownOpen(false);
    setIsDesktopDropdownOpen(false);
    onView(category);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMobileDropdownOpen(false);
    setIsDesktopDropdownOpen(false);
    onEdit(category);
  };

  const handleToggleStatus = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMobileDropdownOpen(false);
    setIsDesktopDropdownOpen(false);
    onToggleStatus(category);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMobileDropdownOpen(false);
    setIsDesktopDropdownOpen(false);
    onDelete(category);
  };

  return (
        <Card key={category.id} className="hover:shadow-lg transition-shadow border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4 sm:p-6">
            {/* Mobile Layout - Minimal Information */}
            <div className="block sm:hidden">
              {/* Header with Image and Basic Info */}
              <div className="flex items-start gap-3 mb-3">
                {/* Image */}
                <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                      <div className="text-xl">👕</div>
                    </div>
                  )}
                </div>

                {/* Basic Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 mb-0.5 leading-tight">{category.name}</h3>
                  
                  {/* Truncated Description - One Line Only */}
                  {category.description && (
                    <p className="text-gray-600 text-sm mb-1.5 line-clamp-1 leading-tight">{category.description}</p>
                  )}
                  
                  {/* Badges and Action Button in Single Row */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={category.isActive ? "default" : "secondary"} className="text-xs">
                        {category.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {category.productCount} products
                      </Badge>
                    </div>
                    
                    <DropdownMenu open={isMobileDropdownOpen} onOpenChange={setIsMobileDropdownOpen}>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
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
              </div>


            </div>

            {/* Desktop Layout - Horizontal */}
            <div className="hidden sm:flex items-center gap-4 sm:gap-6">
              {/* Image */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                    <div className="text-2xl">👕</div>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-1.5">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-0.5 leading-tight">{category.name}</h3>
                    <p className="text-sm text-gray-500 font-mono mb-1.5 leading-tight">/{category.slug}</p>
                    {category.description && (
                      <p className="text-gray-600 text-sm line-clamp-2 leading-tight">{category.description}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 pt-1">
                    <Badge variant={category.isActive ? "default" : "secondary"}>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="outline">
                      {category.productCount} products
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Sort: {category.sortOrder}</span>
                    <span>Updated: {new Date(category.updatedAt).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <DropdownMenu open={isDesktopDropdownOpen} onOpenChange={setIsDesktopDropdownOpen}>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
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


              </div>
            </div>
          </CardContent>
        </Card>
  );
};

const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  onView,
  onEdit,
  onToggleStatus,
  onDelete
}) => {
  return (
    <div className="space-y-2 sm:space-y-3">
      {categories.map((category) => (
        <CategoryListItem
          key={category.id}
          category={category}
          onView={onView}
          onEdit={onEdit}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default CategoryList;
