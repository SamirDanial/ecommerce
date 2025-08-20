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
import { Search, CheckSquare, Square, Download, Grid3X3 } from 'lucide-react';
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
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="px-2 py-1 bg-purple-100 rounded-full text-xs text-purple-700">Step 1</span>
              <span className="text-purple-700">Category Selection</span>
              <span className="text-gray-300">→</span>
              <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">Step 2</span>
              <span>Export Configuration</span>
            </div>
          </div>
          <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Download className="h-6 w-6 text-purple-600" />
            </div>
            Select Categories to Export
          </DialogTitle>
          <p className="text-sm text-gray-600">
            Choose which categories you want to export. Use the quick selection options or select individually.
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search and Quick Actions */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search categories by name, slug, or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="px-3"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="px-3"
                  >
                    List
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Selection Actions */}
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-lg">Quick Selection</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="text-green-600 border-green-200 hover:bg-green-50"
                >
                  <CheckSquare className="w-4 h-4 mr-2" />
                  Select All ({filteredCategories.length})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUnselectAll}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Unselect All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectActive}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  Select Active Only
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectWithProducts}
                  className="text-purple-600 border-purple-200 hover:bg-purple-50"
                >
                  Select With Products
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Selection Summary */}
          <Card>
            <CardContent className="p-4">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{selectionSummary.total}</div>
                    <div className="text-sm text-gray-600">Total</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{selectionSummary.filtered}</div>
                    <div className="text-sm text-gray-600">Filtered</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{selectionSummary.selected}</div>
                    <div className="text-sm text-gray-600">Selected</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{selectionSummary.active}</div>
                    <div className="text-sm text-gray-600">Active</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{selectionSummary.withProducts}</div>
                    <div className="text-sm text-gray-600">With Products</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Categories Grid/List */}
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-lg">
                Categories ({filteredCategories.length})
                {selectedCategories.size > 0 && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    • {selectedCategories.size} selected
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {filteredCategories.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No categories match your search.' : 'No categories available.'}
                </div>
              ) : (
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
                  {filteredCategories.map((category) => (
                    <div
                      key={category.id}
                      className={`border rounded-lg p-4 transition-all duration-200 cursor-pointer hover:shadow-md ${
                        selectedCategories.has(category.id)
                          ? 'border-purple-300 bg-purple-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                      onClick={() => handleCategoryToggle(category.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedCategories.has(category.id)}
                          onChange={() => handleCategoryToggle(category.id)}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-gray-900 truncate">{category.name}</h4>
                            {!category.isActive && (
                              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                                Inactive
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {category.description || 'No description'}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Slug: {category.slug}</span>
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

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <div className="flex gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>{selectedCategories.size} categories selected</span>
              </div>
              <Button 
                onClick={handleExport}
                disabled={selectedCategories.size === 0}
                className="bg-purple-600 hover:bg-purple-700"
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
