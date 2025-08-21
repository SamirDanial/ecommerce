import React, { useState } from 'react';
import { Search, SortAsc, SortDesc, Grid3X3, List, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card } from '../ui/card';

interface CategoryFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterActive: 'all' | 'active' | 'inactive';
  onFilterChange: (value: 'all' | 'active' | 'inactive') => void;
  sortBy: 'name' | 'sortOrder' | 'createdAt' | 'updatedAt' | 'productCount';
  onSortByChange: (value: 'name' | 'sortOrder' | 'createdAt' | 'updatedAt' | 'productCount') => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: () => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

const CategoryFilters: React.FC<CategoryFiltersProps> = ({
  searchTerm,
  onSearchChange,
  filterActive,
  onFilterChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  viewMode,
  onViewModeChange
}) => {
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  return (
    <Card className="relative bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-2xl border border-white/40 shadow-2xl overflow-hidden">
      {/* Mobile Filter Toggle Button */}
      <div className="sm:hidden p-3 border-b border-slate-200/30 bg-gradient-to-r from-slate-50/30 to-white/50">
        <Button
          variant="outline"
          onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
          className="w-full h-10 bg-white/80 backdrop-blur-sm border-slate-200/50 hover:border-purple-500 rounded-lg flex items-center justify-center gap-2 transition-all duration-300"
        >
          <Filter className="w-4 h-4" />
          <span>Filters & Options</span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isFiltersExpanded ? 'rotate-180' : 'rotate-0'}`} />
        </Button>
      </div>

      {/* Filters Section - Collapsible on Mobile */}
      <div className={`sm:block p-2 sm:p-3 md:p-6 border-b border-slate-200/30 bg-gradient-to-r from-slate-50/30 to-white/50 transition-all duration-300 ease-in-out ${
        isFiltersExpanded 
          ? 'max-h-[500px] opacity-100 overflow-hidden' 
          : 'max-h-0 opacity-0 overflow-hidden'
      } sm:max-h-none sm:opacity-100`}>
        <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3">
          <div className="flex-1 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 h-10 bg-white/80 backdrop-blur-sm border-slate-200/50 focus:border-purple-500 focus:ring-purple-500/20 rounded-lg transition-all duration-300"
              />
            </div>
          </div>
          
          <Select value={filterActive} onValueChange={(value: any) => onFilterChange(value)}>
            <SelectTrigger className="w-full sm:w-40 h-10 bg-white/80 backdrop-blur-sm border-slate-200/50 focus:border-purple-500 focus:ring-purple-500/20 rounded-lg">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="inactive">Inactive Only</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value: any) => onSortByChange(value)}>
            <SelectTrigger className="w-full sm:w-40 h-10 bg-white/80 backdrop-blur-sm border-slate-200/50 focus:border-purple-500 focus:ring-purple-500/20 rounded-lg">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="sortOrder">Sort Order</SelectItem>
              <SelectItem value="createdAt">Created Date</SelectItem>
              <SelectItem value="updatedAt">Updated Date</SelectItem>
              <SelectItem value="productCount">Product Count</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={onSortOrderChange}
            className="h-10 bg-white/80 backdrop-blur-sm border-slate-200/50 hover:border-purple-500 rounded-lg flex items-center gap-2 transition-all duration-300"
          >
            {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            <span className="hidden sm:inline">{sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              onClick={() => onViewModeChange('grid')}
              className={`h-10 px-3 rounded-lg transition-all duration-300 ${
                viewMode === 'grid'
                  ? 'bg-purple-600 hover:bg-purple-700 text-white border-purple-600'
                  : 'bg-white/80 backdrop-blur-sm border-slate-200/50 hover:border-purple-500 text-slate-700'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              onClick={() => onViewModeChange('list')}
              className={`h-10 px-3 rounded-lg transition-all duration-300 ${
                viewMode === 'list'
                  ? 'bg-purple-600 hover:bg-purple-700 text-white border-purple-600'
                  : 'bg-white/80 backdrop-blur-sm border-slate-200/50 hover:border-purple-500 text-slate-700'
              }`}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CategoryFilters;
