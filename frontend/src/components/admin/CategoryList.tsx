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

interface CategoryListProps {
  categories: Category[];
  onView: (category: Category) => void;
  onEdit: (category: Category) => void;
  onToggleStatus: (category: Category) => void;
  onDelete: (category: Category) => void;
}

const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  onView,
  onEdit,
  onToggleStatus,
  onDelete
}) => {


  return (
    <div className="space-y-3 sm:space-y-4">
      {categories.map((category) => (
        <Card key={category.id} className="hover:shadow-lg transition-shadow border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-4 sm:gap-6">
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
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">{category.name}</h3>
                    <p className="text-sm text-gray-500 font-mono mb-2">/{category.slug}</p>
                    {category.description && (
                      <p className="text-gray-600 text-sm line-clamp-2">{category.description}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant={category.isActive ? "default" : "secondary"}>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="outline">
                      {category.productCount} products
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Sort: {category.sortOrder}</span>
                    <span>Updated: {new Date(category.updatedAt).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onView(category);
                      }}
                      title="View Category Details"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(category);
                      }}
                      title="Edit Category"
                      className="text-green-600 hover:text-green-700"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleStatus(category);
                      }}
                      title={category.isActive ? 'Deactivate' : 'Activate'}
                      className="text-gray-600 hover:text-gray-700"
                    >
                      {category.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    </Button>
                    

                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(category);
                      }}
                      disabled={category.productCount > 0}
                      title="Delete Category"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* View Details Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onView(category)}
                  className="w-full sm:w-auto border-2 border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
                >
                  View Details
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CategoryList;
