import React from "react";
import { Grid, List } from "lucide-react";
import { ViewMode } from "../../hooks/useViewMode";

interface CategoriesHeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  categoryCount: number;
}

export const CategoriesHeader: React.FC<CategoriesHeaderProps> = ({
  viewMode,
  onViewModeChange,
  categoryCount,
}) => {
  return (
    <div className="flex flex-col gap-4 mb-6 sm:mb-8">
      {/* Title Section */}
      <div className="text-center sm:text-left">
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Browse Categories
        </h1>
        <p className="text-muted-foreground mt-2">
          {categoryCount} category{categoryCount !== 1 ? 's' : ''} to explore
        </p>
      </div>
      
      {/* Controls Row - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Mobile: View toggle centered */}
        <div className="sm:hidden flex items-center justify-center w-full">
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
        </div>

        {/* Desktop: View toggle and description */}
        <div className="hidden sm:flex items-center gap-4">
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
          
          <p className="text-sm text-muted-foreground max-w-md">
            Discover our carefully curated product categories. Each collection is designed to help you find exactly what you're looking for.
          </p>
        </div>
      </div>
    </div>
  );
};
