import React from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Grid3X3, List, SlidersHorizontal } from "lucide-react";
import { ViewMode } from "../../hooks/useViewMode";

interface ProductsHeaderProps {
  productCount: number;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onFilterClick: () => void;
  activeFiltersCount: number;
}

export const ProductsHeader: React.FC<ProductsHeaderProps> = ({
  productCount,
  viewMode,
  onViewModeChange,
  onFilterClick,
  activeFiltersCount,
}) => {
  return (
    <div className="flex flex-col gap-4 mb-6 sm:mb-8">
      {/* Title Section */}
      <div className="text-center sm:text-left">
        <h1 className="text-3xl sm:text-4xl font-bold">Our Products</h1>
        <p className="text-muted-foreground mt-2">
          {productCount} product{productCount !== 1 ? 's' : ''} found
        </p>
      </div>
      
      {/* Controls Row - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Mobile: View toggle and filter button on same row */}
        <div className="sm:hidden flex items-center justify-between w-full">
          {/* View Mode Toggle - Mobile */}
          <div className="flex items-center bg-gray-100 rounded-xl p-1 shadow-lg">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`px-3 py-2 rounded-lg transition-all duration-300 font-medium flex items-center gap-2 ${
                viewMode === 'grid'
                  ? 'bg-white text-gray-900 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              aria-label="Grid view"
              title="Grid view"
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`px-3 py-2 rounded-lg transition-all duration-300 font-medium flex items-center gap-2 ${
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              aria-label="List view"
              title="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {/* Filter Button - Mobile (Right Side) */}
          <Button
            variant="outline"
            onClick={onFilterClick}
            className="flex items-center gap-2 h-10 px-4 rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>

        {/* Desktop: View toggle and filter button */}
        <div className="hidden sm:flex items-center gap-4">
          {/* View Mode Toggle - Desktop */}
          <div className="flex items-center bg-gray-100 rounded-2xl p-1 shadow-lg">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`px-4 py-2 rounded-xl transition-all duration-300 font-medium flex items-center gap-2 ${
                viewMode === 'grid'
                  ? 'bg-white text-gray-900 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              aria-label="Grid view"
              title="Grid view"
            >
              <Grid3X3 className="h-4 w-4" />
              <span>Grid</span>
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`px-4 py-2 rounded-xl transition-all duration-300 font-medium flex items-center gap-2 ${
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              aria-label="List view"
              title="List view"
            >
              <List className="h-4 w-4" />
              <span>List</span>
            </button>
          </div>

          {/* Filter Button - Desktop */}
          <Button
            variant="outline"
            onClick={onFilterClick}
            className="flex items-center gap-2 h-12 px-6 rounded-2xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
