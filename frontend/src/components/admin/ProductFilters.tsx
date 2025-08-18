import React from 'react';
import { Search, Filter, X } from 'lucide-react';
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
  // Ensure filters have default values to prevent undefined errors
  const safeFilters = {
    search: filters.search || '',
    category: filters.category || 'all',
    status: filters.status || 'all',
    featured: filters.featured || 'all',
    onSale: filters.onSale || 'all',
    sortBy: filters.sortBy || 'createdAt',
    sortOrder: filters.sortOrder || 'desc',
    page: filters.page || 1,
    limit: filters.limit || 12
  };

  // Ensure categories is an array to prevent map errors
  const safeCategories = Array.isArray(categories) ? categories : [];

  const hasActiveFilters = safeFilters.search || 
    (safeFilters.category && safeFilters.category !== 'all') || 
    (safeFilters.status && safeFilters.status !== 'all') || 
    (safeFilters.featured && safeFilters.featured !== 'all') || 
    (safeFilters.onSale && safeFilters.onSale !== 'all');

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filters & Search</h3>
          </div>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="text-gray-600 hover:text-gray-900"
            >
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Search Products</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, SKU, or description..."
                value={safeFilters.search}
                onChange={(e) => onFiltersChange({ search: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Category</label>
            <Select
              value={safeFilters.category}
              onValueChange={(value) => onFiltersChange({ category: value })}
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
              onValueChange={(value) => onFiltersChange({ status: value })}
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
              onValueChange={(value) => onFiltersChange({ featured: value })}
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {/* On Sale Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">On Sale</label>
            <Select
              value={safeFilters.onSale}
              onValueChange={(value) => onFiltersChange({ onSale: value })}
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
              onValueChange={(value) => onFiltersChange({ sortBy: value })}
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
              onValueChange={(value: 'asc' | 'desc') => onFiltersChange({ sortOrder: value })}
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
              onValueChange={(value) => onFiltersChange({ limit: parseInt(value) })}
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
      </CardContent>
    </Card>
  );
};
