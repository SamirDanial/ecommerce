import React from "react";
import { Badge } from "../ui/badge";
import { Grid, List, Filter, ArrowUpDown } from "lucide-react";
import { ViewMode } from "../../hooks/useViewMode";

interface CategoryHeaderProps {
  categoryName: string;
  categoryDescription?: string;
  productCount: number;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onFilterClick: () => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  showFilters: boolean;
}

export const CategoryHeader: React.FC<CategoryHeaderProps> = ({
  categoryName,
  categoryDescription,
  productCount,
  viewMode,
  onViewModeChange,
  onFilterClick,
  sortBy,
  onSortChange,
  showFilters,
}) => {
  return (
    <div className="flex flex-col gap-4 mb-6 sm:mb-8">
      {/* Title Section */}
      <div className="text-center sm:text-left">
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          {categoryName}
        </h1>
        {categoryDescription && (
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto sm:mx-0">
            {categoryDescription}
          </p>
        )}
        <div className="mt-3">
          <Badge variant="secondary" className="text-base px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
            {productCount} product{productCount !== 1 ? 's' : ''} available
          </Badge>
        </div>
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
              <Grid className="h-4 w-4" />
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
          <button
            onClick={onFilterClick}
            className={`flex items-center gap-2 h-10 px-4 rounded-xl border-2 transition-all duration-300 shadow-lg hover:shadow-xl ${
              showFilters 
                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>

        {/* Desktop: View toggle, filter button, and sort */}
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
              <Grid className="h-4 w-4" />
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
          <button
            onClick={onFilterClick}
            className={`flex items-center gap-2 h-12 px-6 rounded-2xl border-2 transition-all duration-300 shadow-lg hover:shadow-xl ${
              showFilters 
                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
            }`}
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </button>

          {/* Sort Dropdown - Desktop */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="appearance-none bg-background border border-input rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent shadow-lg"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest</option>
            </select>
            <ArrowUpDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
};
