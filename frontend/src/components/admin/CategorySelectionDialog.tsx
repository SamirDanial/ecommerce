import React, { useState, useMemo } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '../ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { Search, CheckSquare, Square, Download, Grid3X3, List } from 'lucide-react';
import { toast } from 'sonner';

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

interface CategorySelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onExport: (selectedCategories: Category[]) => void;
  onProceed: () => void;
}

const CategorySelectionDialog: React.FC<CategorySelectionDialogProps> = ({ 
  isOpen, 
  onClose, 
  categories, 
  onExport,
  onProceed
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter categories based on search term
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;
    
    const searchLower = searchTerm.toLowerCase();
    return categories.filter(category => 
      category.name.toLowerCase().includes(searchLower) ||
      category.slug.toLowerCase().includes(searchLower) ||
      (category.description && category.description.toLowerCase().includes(searchLower))
    );
  }, [categories, searchTerm]);

  // Quick selection handlers
  const handleSelectAll = () => {
    setSelectedCategories(new Set(filteredCategories.map(cat => cat.id)));
  };

  const handleUnselectAll = () => {
    setSelectedCategories(new Set());
  };

  const handleSelectActive = () => {
    const activeCategories = filteredCategories.filter(cat => cat.isActive);
    setSelectedCategories(new Set(activeCategories.map(cat => cat.id)));
  };

  const handleSelectWithProducts = () => {
    const categoriesWithProducts = filteredCategories.filter(cat => cat.productCount > 0);
    setSelectedCategories(new Set(categoriesWithProducts.map(cat => cat.id)));
  };

  // Individual category selection
  const handleCategoryToggle = (categoryId: number) => {
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(categoryId)) {
      newSelected.delete(categoryId);
    } else {
      newSelected.add(categoryId);
    }
    setSelectedCategories(newSelected);
  };

  // Get selected category objects
  const selectedCategoryObjects = useMemo(() => {
    return categories.filter(cat => selectedCategories.has(cat.id));
  }, [categories, selectedCategories]);

  // Handle export
  const handleExport = () => {
    if (selectedCategoryObjects.length === 0) {
      toast.error('Please select at least one category to export');
      return;
    }
    
    console.log('CategorySelectionDialog: calling onExport with:', selectedCategoryObjects);
    onExport(selectedCategoryObjects);
    onProceed();
  };

  // Selection summary
  const selectionSummary = {
    total: categories.length,
    filtered: filteredCategories.length,
    selected: selectedCategoryObjects.length,
    active: selectedCategoryObjects.filter(cat => cat.isActive).length,
    withProducts: selectedCategoryObjects.filter(cat => cat.productCount > 0).length
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-screen sm:w-[95vw] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="mb-4 sm:mb-6">
          {/* Mobile-friendly step indicator */}
          <div className="flex items-center gap-2 mb-3 text-xs sm:text-sm">
            <span className="px-2 py-1 bg-purple-100 rounded-full text-purple-700 font-medium">1</span>
            <span className="text-purple-700 font-medium">Select</span>
            <span className="text-gray-300">→</span>
            <span className="px-2 py-1 bg-gray-100 rounded-full text-gray-600">2</span>
            <span className="text-gray-600">Export</span>
          </div>
          
          <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg">
              <Download className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
            </div>
            <span className="hidden sm:inline">Select Categories to Export</span>
            <span className="sm:hidden">Select Categories</span>
          </DialogTitle>
          
          <p className="text-xs sm:text-sm text-gray-600">
            <span className="hidden sm:inline">Choose which categories you want to export. Use the quick selection options or select individually.</span>
            <span className="sm:hidden">Choose categories to export. Use quick options or select individually.</span>
          </p>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Search and Quick Actions */}
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 text-sm"
                  />
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-2 self-end">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="px-2 sm:px-3 h-8 sm:h-9"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="px-2 sm:px-3 h-8 sm:h-9"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Selection Actions */}
          <Card>
            <CardHeader className="p-3 sm:p-4">
              <CardTitle className="text-base sm:text-lg">Quick Selection</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="text-green-600 border-green-200 hover:bg-green-50 text-xs sm:text-sm h-8 sm:h-9"
                >
                  <CheckSquare className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Select All</span>
                  <span className="sm:hidden">All</span>
                  <span className="ml-1">({filteredCategories.length})</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUnselectAll}
                  className="text-red-600 border-red-200 hover:bg-red-50 text-xs sm:text-sm h-8 sm:h-9"
                >
                  <Square className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Unselect All</span>
                  <span className="sm:hidden">None</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectActive}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50 text-xs sm:text-sm h-8 sm:h-9"
                >
                  <span className="hidden sm:inline">Active Only</span>
                  <span className="sm:hidden">Active</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectWithProducts}
                  className="text-purple-600 border-purple-200 hover:bg-purple-50 text-xs sm:text-sm h-8 sm:h-9"
                >
                  <span className="hidden sm:inline">With Products</span>
                  <span className="sm:hidden">Products</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Selection Summary - Mobile-friendly */}
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-4 text-center">
                  <div>
                    <div className="text-lg sm:text-2xl font-bold text-blue-600">{selectionSummary.total}</div>
                    <div className="text-xs sm:text-sm text-gray-600">Total</div>
                  </div>
                  <div>
                    <div className="text-lg sm:text-2xl font-bold text-purple-600">{selectionSummary.filtered}</div>
                    <div className="text-xs sm:text-sm text-gray-600">Filtered</div>
                  </div>
                  <div>
                    <div className="text-lg sm:text-2xl font-bold text-green-600">{selectionSummary.selected}</div>
                    <div className="text-xs sm:text-sm text-gray-600">Selected</div>
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-lg sm:text-2xl font-bold text-blue-600">{selectionSummary.active}</div>
                    <div className="text-xs sm:text-sm text-gray-600">Active</div>
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-lg sm:text-2xl font-bold text-purple-600">{selectionSummary.withProducts}</div>
                    <div className="text-xs sm:text-sm text-gray-600">With Products</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Categories Grid/List */}
          <Card>
            <CardHeader className="p-3 sm:p-4">
              <CardTitle className="text-base sm:text-lg">
                Categories ({filteredCategories.length})
                {selectedCategories.size > 0 && (
                  <span className="text-xs sm:text-sm font-normal text-gray-500 ml-2">
                    • {selectedCategories.size} selected
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              {filteredCategories.length === 0 ? (
                <div className="text-center py-6 sm:py-8 text-gray-500 text-sm">
                  {searchTerm ? 'No categories match your search.' : 'No categories available.'}
                </div>
              ) : (
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4' : 'space-y-2 sm:space-y-3'}>
                  {filteredCategories.map((category) => (
                    <div
                      key={category.id}
                      className={`border rounded-lg p-3 sm:p-4 transition-all duration-200 cursor-pointer hover:shadow-md ${
                        selectedCategories.has(category.id)
                          ? 'border-purple-300 bg-purple-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                      onClick={() => handleCategoryToggle(category.id)}
                    >
                      <div className="flex items-start gap-2 sm:gap-3">
                        <Checkbox
                          checked={selectedCategories.has(category.id)}
                          onChange={() => handleCategoryToggle(category.id)}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-gray-900 truncate text-sm sm:text-base">{category.name}</h4>
                            {!category.isActive && (
                              <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                                Inactive
                              </span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">
                            {category.description || 'No description'}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-500">
                            <span className="hidden sm:inline">Slug: {category.slug}</span>
                            <span className="sm:hidden">Slug: {category.slug.length > 15 ? category.slug.substring(0, 15) + '...' : category.slug}</span>
                            <span>Products: {category.productCount}</span>
                            <span>Order: {category.sortOrder}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons - Mobile-friendly */}
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
            <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
              Cancel
            </Button>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-xs sm:text-sm text-gray-600">
                <span>{selectedCategories.size} categories selected</span>
              </div>
              <Button 
                onClick={handleExport}
                disabled={selectedCategories.size === 0}
                className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto"
              >
                {selectedCategories.size === 0 ? 'Select Categories First' : 'Next'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CategorySelectionDialog;
