import React from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { ImageWithPlaceholder } from "../ui/image-with-placeholder";
import { Package, ArrowRight } from "lucide-react";
import { Category } from "../../types";
import { ViewMode } from "../../hooks/useViewMode";

interface CategoriesGridProps {
  categories: Category[];
  viewMode: ViewMode;
  onCategorySelect: (categorySlug: string) => void;
}

export const CategoriesGrid: React.FC<CategoriesGridProps> = ({
  categories,
  viewMode,
  onCategorySelect,
}) => {
  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No categories found</h3>
        <p className="text-muted-foreground mb-4">
          Try adjusting your search terms or browse all categories.
        </p>
      </div>
    );
  }

  return (
    <div className={`grid gap-4 sm:gap-6 ${
      viewMode === 'grid' 
        ? 'grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
        : 'grid-cols-1'
    }`}>
      {categories.map((category) => (
        <Card
          key={category.id}
          className={`group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 border-0 bg-white/50 backdrop-blur-sm hover:bg-white/80 ${
            viewMode === 'list' ? 'flex' : ''
          }`}
          onClick={() => onCategorySelect(category.slug)}
        >
          <div className={`relative overflow-hidden rounded-t-xl ${
            viewMode === 'list' ? 'w-48 h-32 rounded-l-xl rounded-t-none' : 'h-48'
          }`}>
            <ImageWithPlaceholder
              src={category.image || '/placeholder-category.jpg'}
              alt={category.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            
            {/* Category Name Overlay */}
            <div className="absolute bottom-3 left-3 right-3">
              <h3 className="text-lg font-bold text-white mb-1 drop-shadow-lg">
                {category.name}
              </h3>
              {category.description && (
                <p className="text-white/90 text-sm line-clamp-2 drop-shadow-md">
                  {category.description}
                </p>
              )}
            </div>

            {/* Hover Effect Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-blue-600/80 via-purple-600/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="text-center text-white">
                <ArrowRight className="h-8 w-8 mx-auto mb-2 group-hover:translate-x-1 transition-transform duration-300" />
                <span className="text-sm font-semibold">Explore Category</span>
              </div>
            </div>
          </div>

          {/* Card Content - Only for List View */}
          {viewMode === 'list' && (
            <CardContent className="flex-1 p-4 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="text-muted-foreground mb-4 line-clamp-3">
                    {category.description}
                  </p>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
                >
                  Browse Category
                  <ArrowRight className="h-3 w-3 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
};
