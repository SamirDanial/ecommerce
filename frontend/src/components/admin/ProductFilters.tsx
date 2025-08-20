import React, { useState, useEffect } from 'react';
import { Search, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent } from '../ui/card';
import { ProductFilters as ProductFiltersType, Category } from '../../types';

interface ProductFiltersProps {
  filters: ProductFiltersType;
  categories: Category[];
  loading?: boolean;
  onFiltersChange: (filters: Partial<ProductFiltersType>) => void;
  onReset: () => void;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  categories,
  loading = false,
  onFiltersChange,
  onReset
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true); // Desktop collapse state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Mobile menu state
  const [isMobile, setIsMobile] = useState(false);
  const [localFilters, setLocalFilters] = useState<ProductFiltersType>(filters);

  // Only update local filters from parent when menu is closed
  // This prevents the menu from closing when parent filters update
  useEffect(() => {
    if (!isMobileMenuOpen) {
      setLocalFilters(filters);
    }
  }, [filters]); // Removed isMobileMenuOpen from dependencies to prevent re-runs

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isMobileMenuOpen) return;
      
      const target = event.target as Element;
      
      // Don't close if clicking on the menu itself
      if (target.closest('.mobile-filter-menu')) return;
      
      // Don't close if clicking on Select dropdown content (rendered in portal)
      if (target.closest('[data-radix-select-content]')) return;
      if (target.closest('[data-radix-popper-content-wrapper]')) return;
      if (target.closest('[role="listbox"]')) return;
      if (target.closest('[role="option"]')) return;
      
      // Don't close if clicking on other UI portals
      if (target.closest('[data-radix-portal]')) return;
      
      // Don't close if clicking within the filter container
      if (target.closest('.product-filters-container')) return;
      
      // Close the menu if clicking truly outside
      setIsMobileMenuOpen(false);
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMobileMenuOpen]);


  // Ensure filters have default values to prevent undefined errors
  const safeFilters = {
    search: localFilters.search || '',
    category: localFilters.category || 'all',
    status: localFilters.status || 'all',
    featured: localFilters.featured || 'all',
    onSale: localFilters.onSale || 'all',
    stockStatus: localFilters.stockStatus || 'all',

    sortBy: localFilters.sortBy || 'createdAt',
    sortOrder: localFilters.sortOrder || 'desc',
    page: localFilters.page || 1,
    limit: localFilters.limit || 12
  };

  // Ensure categories is an array to prevent map errors
  const safeCategories = Array.isArray(categories) ? categories : [];

  const hasActiveFilters = safeFilters.search || 
    (safeFilters.category && safeFilters.category !== 'all') || 
    (safeFilters.status && safeFilters.status !== 'all') || 
    (safeFilters.featured && safeFilters.featured !== 'all') || 
    (safeFilters.onSale && safeFilters.onSale !== 'all') ||
    (safeFilters.stockStatus && safeFilters.stockStatus !== 'all');

  // Render filter content
  const FilterContent = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Search Products</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, SKU, or description..."
              value={safeFilters.search}
              onChange={(e) => {
                const newFilters = { ...safeFilters, search: e.target.value };
                setLocalFilters(newFilters);
                onFiltersChange(newFilters);
              }}
              className="pl-10"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Category</label>
                      <Select
              value={safeFilters.category}
              onValueChange={(value) => {
                const newFilters = { ...safeFilters, category: value };
                setLocalFilters(newFilters);
                onFiltersChange(newFilters);
              }}
              disabled={loading}
            >
            <SelectTrigger>
              <SelectValue placeholder={loading ? "Loading..." : "All Categories"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {loading ? (
                <SelectItem value="loading" disabled>Loading categories...</SelectItem>
              ) : (
                safeCategories.map(category => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Status</label>
                      <Select
              value={safeFilters.status}
              onValueChange={(value) => {
                const newFilters = { ...safeFilters, status: value };
                setLocalFilters(newFilters);
                onFiltersChange(newFilters);
              }}
            >
            <SelectTrigger>
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Featured Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Featured</label>
                      <Select
              value={safeFilters.featured}
              onValueChange={(value) => {
                const newFilters = { ...safeFilters, featured: value };
                setLocalFilters(newFilters);
                onFiltersChange(newFilters);
              }}
            >
            <SelectTrigger>
              <SelectValue placeholder="All Products" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              <SelectItem value="true">Featured Only</SelectItem>
              <SelectItem value="false">Not Featured</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stock Status Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Stock Status</label>
                      <Select
              value={safeFilters.stockStatus}
              onValueChange={(value) => {
                const newFilters = { ...safeFilters, stockStatus: value };
                setLocalFilters(newFilters);
                onFiltersChange(newFilters);
              }}
            >
            <SelectTrigger>
              <SelectValue placeholder="All Stock Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stock Status</SelectItem>
              <SelectItem value="IN_STOCK">In Stock</SelectItem>
              <SelectItem value="LOW_STOCK">Low Stock</SelectItem>
              <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
              <SelectItem value="BACKORDER">Backorder</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        {/* On Sale Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">On Sale</label>
                      <Select
              value={safeFilters.onSale}
              onValueChange={(value) => {
                const newFilters = { ...safeFilters, onSale: value };
                setLocalFilters(newFilters);
                onFiltersChange(newFilters);
              }}
            >
            <SelectTrigger>
              <SelectValue placeholder="All Products" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              <SelectItem value="true">On Sale Only</SelectItem>
              <SelectItem value="false">Not On Sale</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort By */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Sort By</label>
                      <Select
              value={safeFilters.sortBy}
              onValueChange={(value) => {
                const newFilters = { ...safeFilters, sortBy: value };
                setLocalFilters(newFilters);
                onFiltersChange(newFilters);
              }}
            >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Date Created</SelectItem>
              <SelectItem value="updatedAt">Date Updated</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="totalStock">Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort Order */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Sort Order</label>
                      <Select
              value={safeFilters.sortOrder}
              onValueChange={(value: 'asc' | 'desc') => {
                const newFilters = { ...safeFilters, sortOrder: value };
                setLocalFilters(newFilters);
                onFiltersChange(newFilters);
              }}
            >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Descending</SelectItem>
              <SelectItem value="asc">Ascending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Items Per Page */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Items Per Page</label>
                      <Select
              value={safeFilters.limit.toString()}
              onValueChange={(value) => {
                const newFilters = { ...safeFilters, limit: parseInt(value) };
                setLocalFilters(newFilters);
                onFiltersChange(newFilters);
              }}
            >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12">12</SelectItem>
              <SelectItem value="24">24</SelectItem>
              <SelectItem value="48">48</SelectItem>
              <SelectItem value="96">96</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );

  return (
    <div className="product-filters-container">
      {/* Desktop: Collapsible Card */}
      <div className="hidden md:block mb-6">
        <Card>
          <CardContent className="p-6">
            {/* Header with Toggle */}
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="flex items-center gap-2 p-0 hover:bg-transparent"
              >
                <Filter className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Filters & Search</h3>
                {isCollapsed ? (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronUp className="h-4 w-4 text-gray-500" />
                )}
              </Button>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onReset();
                    setLocalFilters(filters);
                  }}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Collapsible Content */}
            <div className={`transition-all duration-300 ease-in-out ${
              isCollapsed ? 'max-h-0 overflow-hidden opacity-0' : 'max-h-none opacity-100'
            }`}>
              <FilterContent />
              

            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile: Trigger Button */}
      <div className="md:hidden mb-6">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters & Search
            {hasActiveFilters && (
              <span className="ml-2 h-2 w-2 bg-blue-600 rounded-full"></span>
            )}
          </Button>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onReset();
                setLocalFilters(filters);
              }}
              className="text-gray-600 hover:text-gray-900"
            >
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Mobile: Slide-out Menu */}
      {isMobile && (
        <>
          {/* Backdrop */}
          <div 
            className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
              isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setIsMobileMenuOpen(false);
            }}
          />
          
          {/* Slide-out Menu */}
          <div 
            className={`mobile-filter-menu fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
              isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Filters & Search</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(false)}
                className="h-8 w-8 p-0 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto h-full pb-20">
              <div className="space-y-4">
                {/* Search */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Search Products</label>
                  <Input
                    placeholder="Search by name, SKU, or description..."
                    value={localFilters.search || ''}
                    onChange={(e) => setLocalFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="w-full"
                  />
                </div>

                {/* Category Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Category</label>
                  <Select
                    value={localFilters.category || 'all'}
                    onValueChange={(value) => setLocalFilters(prev => ({ ...prev, category: value }))}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loading ? "Loading..." : "All Categories"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {loading ? (
                        <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                      ) : (
                        safeCategories.map(category => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <Select
                    value={localFilters.status || 'all'}
                    onValueChange={(value) => setLocalFilters(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Featured Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Featured</label>
                  <Select
                    value={localFilters.featured || 'all'}
                    onValueChange={(value) => setLocalFilters(prev => ({ ...prev, featured: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Products" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Products</SelectItem>
                      <SelectItem value="true">Featured Only</SelectItem>
                      <SelectItem value="false">Not Featured</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* On Sale Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">On Sale</label>
                  <Select
                    value={localFilters.onSale || 'all'}
                    onValueChange={(value) => setLocalFilters(prev => ({ ...prev, onSale: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Products" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Products</SelectItem>
                      <SelectItem value="true">On Sale Only</SelectItem>
                      <SelectItem value="false">Not On Sale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Stock Status Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Stock Status</label>
                  <Select
                    value={localFilters.stockStatus || 'all'}
                    onValueChange={(value) => setLocalFilters(prev => ({ ...prev, stockStatus: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Stock Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Stock Status</SelectItem>
                      <SelectItem value="IN_STOCK">In Stock</SelectItem>
                      <SelectItem value="LOW_STOCK">Low Stock</SelectItem>
                      <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
                      <SelectItem value="BACKORDER">Backorder</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort By */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Sort By</label>
                  <Select
                    value={localFilters.sortBy || 'createdAt'}
                    onValueChange={(value) => setLocalFilters(prev => ({ ...prev, sortBy: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">Date Created</SelectItem>
                      <SelectItem value="updatedAt">Date Updated</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="price">Price</SelectItem>
                      <SelectItem value="totalStock">Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort Order */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Sort Order</label>
                  <Select
                    value={localFilters.sortOrder || 'desc'}
                    onValueChange={(value: 'asc' | 'desc') => setLocalFilters(prev => ({ ...prev, sortOrder: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">Descending</SelectItem>
                      <SelectItem value="asc">Ascending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Items Per Page */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Items Per Page</label>
                  <Select
                    value={localFilters.limit?.toString() || '12'}
                    onValueChange={(value) => setLocalFilters(prev => ({ ...prev, limit: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12">12</SelectItem>
                      <SelectItem value="24">24</SelectItem>
                      <SelectItem value="48">48</SelectItem>
                      <SelectItem value="96">96</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                <Button
                  onClick={() => {
                    onFiltersChange(localFilters);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Apply Filters
                </Button>
                
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      onReset();
                      setLocalFilters(filters);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-gray-600 hover:text-gray-900"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear All Filters
                  </Button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
