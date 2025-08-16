import React from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { X, DollarSign, Tag } from "lucide-react";

interface CategoryFiltersProps {
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  allTags: string[];
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export const CategoryFilters: React.FC<CategoryFiltersProps> = ({
  priceRange,
  onPriceRangeChange,
  selectedTags,
  onTagToggle,
  allTags,
  onClearFilters,
  hasActiveFilters,
}) => {
  return (
    <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 mb-8 border border-gray-200 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Tag className="h-5 w-5 text-blue-600" />
          Refine Your Search
        </h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <X className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Price Range */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            Price Range
          </label>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Input
                type="number"
                placeholder="Min"
                value={priceRange[0]}
                onChange={(e) => onPriceRangeChange([Number(e.target.value), priceRange[1]])}
                className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                min="0"
              />
            </div>
            <span className="text-gray-500 font-medium">-</span>
            <div className="flex-1">
              <Input
                type="number"
                placeholder="Max"
                value={priceRange[1]}
                onChange={(e) => onPriceRangeChange([priceRange[0], Number(e.target.value)])}
                className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                min="0"
              />
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Popular Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                  selectedTags.includes(tag)
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'hover:bg-gray-100 hover:border-gray-400'
                }`}
                onClick={() => onTagToggle(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {priceRange[0] > 0 && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Min: ${priceRange[0]}
              </Badge>
            )}
            {priceRange[1] < 1000 && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Max: ${priceRange[1]}
              </Badge>
            )}
            {selectedTags.map(tag => (
              <Badge 
                key={tag} 
                variant="secondary" 
                className="bg-green-100 text-green-800"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
