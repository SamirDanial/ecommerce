import React from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import {
  SheetContent,
} from "../ui/sheet";
import {
  Search,
  Filter,
  ChevronDown,
  SlidersHorizontal,
  Settings,
  Tag,
  Palette,
  Ruler,
  DollarSign,
  Package,
  Star,
  SortAsc,
} from "lucide-react";
import { Category } from "../../types";
import { FilterState } from "../../hooks/useProductFilters";

interface ProductsFiltersProps {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string | boolean) => void;
  onFormSubmit: (e: React.FormEvent) => void;
  onClearFilters: () => void;
  showAdvancedFilters: boolean;
  onToggleAdvancedFilters: () => void;
  categories: Category[];
  sizes: string[];
  colors: string[];
  searchInputRef: React.RefObject<HTMLInputElement>;
  activeFiltersCount: number;
  hasActiveFilters: boolean;
}

export const ProductsFilters: React.FC<ProductsFiltersProps> = ({
  filters,
  onFilterChange,
  onFormSubmit,
  onClearFilters,
  showAdvancedFilters,
  onToggleAdvancedFilters,
  categories,
  sizes,
  colors,
  searchInputRef,
  activeFiltersCount,
  hasActiveFilters,
}) => {
  return (
    <SheetContent side="right" className="w-full max-w-md bg-background shadow-2xl">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Settings className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Filters</h2>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">{activeFiltersCount}</Badge>
            )}
          </div>
        </div>

        {/* Filter Content */}
        <form onSubmit={onFormSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-8 min-h-0 scrollbar-hide">
            <div
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.stopPropagation();
                  return false;
                }
              }}
            >
              {/* Basic Filters */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Basic Filters
                </h3>

                {/* Search Filter */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Search Products
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
                    <input
                      ref={searchInputRef}
                      placeholder="Search products..."
                      value={filters.search}
                      onChange={(e) => onFilterChange("search", e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Category
                  </Label>
                  <Select
                    value={filters.category}
                    onValueChange={(value) => onFilterChange("category", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Size Filter */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Ruler className="h-4 w-4" />
                    Size
                  </Label>
                  <Select
                    value={filters.size}
                    onValueChange={(value) => onFilterChange("size", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Sizes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sizes</SelectItem>
                      {sizes.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Color Filter */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Color
                  </Label>
                  <Select
                    value={filters.color}
                    onValueChange={(value) => onFilterChange("color", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Colors" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Colors</SelectItem>
                      {colors.map((color) => (
                        <SelectItem key={color} value={color}>
                          {color}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator className="my-8" />

              {/* Advanced Filters Toggle */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Advanced Filters
                </h3>
                <button
                  type="button"
                  onClick={onToggleAdvancedFilters}
                  className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  {showAdvancedFilters ? "Hide" : "Show"}
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      showAdvancedFilters ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>

              {/* Advanced Filters */}
              {showAdvancedFilters && (
                <div className="space-y-6">
                  {/* Price Range */}
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Price Range
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="minPrice">Min Price</Label>
                        <Input
                          id="minPrice"
                          type="number"
                          placeholder="0"
                          value={filters.minPrice}
                          onChange={(e) => onFilterChange("minPrice", e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maxPrice">Max Price</Label>
                        <Input
                          id="maxPrice"
                          type="number"
                          placeholder="1000"
                          value={filters.maxPrice}
                          onChange={(e) => onFilterChange("maxPrice", e.target.value)}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sort Options */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <SortAsc className="h-4 w-4" />
                      Sort By
                    </Label>
                    <Select
                      value={filters.sort}
                      onValueChange={(value) => onFilterChange("sort", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                        <SelectItem value="price-high">Price: High to Low</SelectItem>
                        <SelectItem value="rating">Highest Rated</SelectItem>
                        <SelectItem value="name">Name: A to Z</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Rating Filter */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Minimum Rating
                    </Label>
                    <Select
                      value={filters.rating}
                      onValueChange={(value) => onFilterChange("rating", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any Rating" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any Rating</SelectItem>
                        <SelectItem value="4">4+ Stars</SelectItem>
                        <SelectItem value="3">3+ Stars</SelectItem>
                        <SelectItem value="2">2+ Stars</SelectItem>
                        <SelectItem value="1">1+ Stars</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Checkbox Filters */}
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Product Status
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="inStock"
                          checked={filters.inStock}
                          onCheckedChange={(checked) =>
                            onFilterChange("inStock", checked as boolean)
                          }
                        />
                        <Label
                          htmlFor="inStock"
                          className="flex items-center gap-2"
                        >
                          <Package className="h-4 w-4" />
                          In Stock Only
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="onSale"
                          checked={filters.onSale}
                          onCheckedChange={(checked) =>
                            onFilterChange("onSale", checked as boolean)
                          }
                        />
                        <Label
                          htmlFor="onSale"
                          className="flex items-center gap-2"
                        >
                          <Tag className="h-4 w-4" />
                          On Sale
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="featured"
                          checked={filters.featured}
                          onCheckedChange={(checked) =>
                            onFilterChange("featured", checked as boolean)
                          }
                        />
                        <Label
                          htmlFor="featured"
                          className="flex items-center gap-2"
                        >
                          <Star className="h-4 w-4" />
                          Featured Products
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 border-t p-6 space-y-4">
            <div className="flex gap-2">
              <Button
                type="submit"
                className="flex-1"
              >
                Apply Filters
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClearFilters}
                className="flex-1"
              >
                Clear All
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {activeFiltersCount} filter
              {activeFiltersCount !== 1 ? "s" : ""} applied
            </p>
          </div>
        </form>
      </div>
    </SheetContent>
  );
};
