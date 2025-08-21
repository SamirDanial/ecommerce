import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '../ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Download, Info } from 'lucide-react';
import { toast } from 'sonner';
import { CategoryService } from '../../services/categoryService';
import { useClerkAuth } from '../../hooks/useClerkAuth';

interface CategoryExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  categories: any[];
  selectedCategories?: any[];
  onBack: () => void;
}

const CategoryExportDialog: React.FC<CategoryExportDialogProps> = ({ 
  isOpen, 
  onClose, 
  categories,
  selectedCategories,
  onBack
}) => {
  const { getToken } = useClerkAuth();
  
  // Debug logging
  console.log('CategoryExportDialog props:', {
    categoriesCount: categories?.length,
    selectedCategoriesCount: selectedCategories?.length,
    selectedCategories: selectedCategories
  });
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  const [selectedFields, setSelectedFields] = useState<string[]>([
    'id', 'name', 'slug', 'description', 'isActive', 'sortOrder'
  ]);
  const [exporting, setExporting] = useState(false);
  const [includeProducts, setIncludeProducts] = useState(false);

  const EXPORT_FIELDS = [
    { key: 'id', label: 'ID', default: true },
    { key: 'name', label: 'Name', default: true },
    { key: 'slug', label: 'Slug', default: true },
    { key: 'description', label: 'Description', default: true },
    { key: 'image', label: 'Image URL', default: false },
    { key: 'isActive', label: 'Active Status', default: true },
    { key: 'sortOrder', label: 'Sort Order', default: true },
    { key: 'createdAt', label: 'Created Date', default: false },
    { key: 'updatedAt', label: 'Updated Date', default: false },
    { key: 'productCount', label: 'Product Count', default: true }
  ];

  const handleSelectAll = () => {
    setSelectedFields(EXPORT_FIELDS.map(field => field.key));
  };

  const handleSelectDefaults = () => {
    setSelectedFields(EXPORT_FIELDS.filter(field => field.default).map(field => field.key));
  };

  const handleFieldToggle = (fieldKey: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldKey) 
        ? prev.filter(f => f !== fieldKey)
        : [...prev, fieldKey]
    );
  };

    const exportToJSON = async () => {
    let categoriesToExport = selectedCategories || categories;
    
    console.log('exportToJSON called with:', {
      selectedCategories: selectedCategories?.length,
      categories: categories?.length,
      includeProducts,
      exportFormat
    });
    
    // If including products, fetch complete data from backend
    if (includeProducts) {
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      // Get category IDs to fetch
      const categoryIds = selectedCategories ? selectedCategories.map(cat => cat.id) : categories.map(cat => cat.id);
      console.log('Fetching categories with IDs:', categoryIds);
      
      const response = await CategoryService.getCategoriesForExport(token, categoryIds, true);
      console.log('Backend response:', response);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch categories from backend');
      }
      
      categoriesToExport = response.categories;
    }
    
    console.log('Categories to export before filtering:', categoriesToExport);
    
    const filteredCategories = categoriesToExport.map((category: any) => {
      const filtered: any = {};
      
      // Add selected fields
      selectedFields.forEach(field => {
        if (category.hasOwnProperty(field)) {
          filtered[field] = category[field];
        }
      });
      
      // If products are included, preserve them regardless of field selection
      if (includeProducts && category.products) {
        filtered.products = category.products;
      }
      
      // If variants are included, preserve them
      if (includeProducts && category.variants) {
        filtered.variants = category.variants;
      }
      
      // If images are included, preserve them
      if (includeProducts && category.images) {
        filtered.images = category.images;
      }
      
      return filtered;
    });
    
    console.log('Filtered categories for export:', filteredCategories);
    console.log('First category products count:', filteredCategories[0]?.products?.length);
    
    // Wrap categories in object to match import format
    const exportData = {
      categories: filteredCategories
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `categories-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    const categoriesToExport = selectedCategories || categories;
    console.log('exportToCSV called with:', {
      selectedCategories: selectedCategories?.length,
      categories: categories?.length,
      categoriesToExport: categoriesToExport.length
    });
    
    if (categoriesToExport.length === 0) {
      toast.error('No categories to export');
      return;
    }

    const headers = selectedFields.map(field => 
      EXPORT_FIELDS.find(f => f.key === field)?.label || field
    );

    const csvContent = [
      headers.join(','),
      ...categoriesToExport.map(category => 
        selectedFields.map(field => {
          const value = category[field];
          // Handle values that might contain commas
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`;
          }
          return value || '';
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `categories-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    const categoriesToExport = selectedCategories || categories;
    console.log('handleExport called with:', {
      selectedCategories: selectedCategories?.length,
      categories: categories?.length,
      categoriesToExport: categoriesToExport.length,
      exportFormat,
      includeProducts
    });
    
    if (categoriesToExport.length === 0) {
      toast.error('No categories to export');
      return;
    }

    setExporting(true);
    try {
      if (exportFormat === 'json') {
        await exportToJSON();
      } else {
        exportToCSV();
      }
      toast.success(`Exported ${categoriesToExport.length} categories successfully!`);
      onClose();
    } catch (error: any) {
      console.error('Export error:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to export categories';
      if (error.message) {
        if (error.message.includes('Authentication required')) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else if (error.message.includes('Failed to fetch categories from backend')) {
          errorMessage = 'Failed to fetch data from server. Please try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-screen sm:w-[95vw] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="mb-4 sm:mb-6">
          {/* Mobile-friendly step indicator */}
          <div className="flex items-center gap-2 mb-3 text-xs sm:text-sm">
            <span className="px-2 py-1 bg-gray-100 rounded-full text-gray-600 font-medium">1</span>
            <span className="text-gray-600 font-medium">Select</span>
            <span className="text-gray-300">→</span>
            <span className="px-2 py-1 bg-blue-100 rounded-full text-blue-700 font-medium">2</span>
            <span className="text-blue-700 font-medium">Export</span>
          </div>
          <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
              <Download className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
            <span className="hidden sm:inline">Export Categories</span>
            <span className="sm:hidden">Export</span>
          </DialogTitle>
          <p className="text-xs sm:text-sm text-gray-600">
            <span className="hidden sm:inline">Configure export format, fields, and options for your selected categories</span>
            <span className="sm:hidden">Configure export format and options</span>
          </p>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Export Format Selection */}
          <Card>
            <CardHeader className="p-3 sm:p-4">
              <CardTitle className="text-base sm:text-lg">Export Format</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 space-y-3">
              <div className="flex gap-3 sm:gap-4">
                <Label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="format"
                    value="json"
                    checked={exportFormat === 'json'}
                    onChange={(e) => setExportFormat(e.target.value as 'json' | 'csv')}
                    className="text-blue-600"
                  />
                  <span className="text-sm sm:text-base">JSON (Recommended)</span>
                </Label>
                <Label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="format"
                    value="csv"
                    checked={exportFormat === 'csv'}
                    onChange={(e) => setExportFormat(e.target.value as 'json' | 'csv')}
                    className="text-blue-600"
                  />
                  <span className="text-sm sm:text-base">CSV</span>
                </Label>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-blue-800">
                  <Info className="w-4 h-4" />
                  <span className="text-xs sm:text-sm font-medium">Format Info</span>
                </div>
                <p className="text-xs sm:text-sm text-blue-700 mt-1">
                  {exportFormat === 'json' 
                    ? 'JSON preserves all data types and structure. Best for data migration and backups.'
                    : 'CSV is flat format suitable for spreadsheet applications. Some data complexity may be lost.'
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Products Option - Only for JSON */}
          {exportFormat === 'json' && (
            <Card>
              <CardHeader className="p-3 sm:p-4">
                <CardTitle className="text-base sm:text-lg">Include Products</CardTitle>
                <p className="text-xs sm:text-sm text-gray-600">
                  <span className="hidden sm:inline">Choose whether to include products for each category in the export</span>
                  <span className="sm:hidden">Include products for each category</span>
                </p>
              </CardHeader>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-products"
                    checked={includeProducts}
                    onCheckedChange={(checked) => setIncludeProducts(checked as boolean)}
                  />
                  <Label htmlFor="include-products" className="text-xs sm:text-sm cursor-pointer">
                    <span className="hidden sm:inline">Include products for each category</span>
                    <span className="sm:hidden">Include products</span>
                  </Label>
                </div>
                <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-amber-800">
                    <Info className="w-4 h-4" />
                    <span className="text-xs sm:text-sm font-medium">Note</span>
                  </div>
                  <p className="text-xs sm:text-sm text-amber-700 mt-1">
                    <span className="hidden sm:inline">Including products will significantly increase the export file size and may take longer to generate. This option is only available for JSON format as CSV cannot handle nested data structures.</span>
                    <span className="sm:hidden">Including products increases file size and generation time. Only available for JSON format.</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Field Selection */}
          <Card>
            <CardHeader className="p-3 sm:p-4">
              <CardTitle className="text-base sm:text-lg">Select Fields to Export</CardTitle>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
                <span>Selected {selectedFields.length} of {EXPORT_FIELDS.length} fields</span>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSelectDefaults}
                    className="text-xs h-8 sm:h-9"
                  >
                    <span className="hidden sm:inline">Select Defaults</span>
                    <span className="sm:hidden">Defaults</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSelectAll}
                    className="text-xs h-8 sm:h-9"
                  >
                    <span className="hidden sm:inline">Select All</span>
                    <span className="sm:hidden">All</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <div className="grid grid-cols-2 gap-3">
                {EXPORT_FIELDS.map((field) => (
                  <Label key={field.key} className="flex items-center space-x-2 cursor-pointer">
                    <Checkbox
                      checked={selectedFields.includes(field.key)}
                      onCheckedChange={() => handleFieldToggle(field.key)}
                    />
                    <span className="text-xs sm:text-sm">{field.label}</span>
                  </Label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Export Summary */}
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="grid grid-cols-2 gap-4">
                  {/* Left Column */}
                  <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                    <p><strong>Categories:</strong> {selectedCategories ? selectedCategories.length : categories.length}</p>
                    {selectedCategories && selectedCategories.length > 0 && (
                      <p><strong>Selection:</strong> {selectedCategories.length} of {categories.length}</p>
                    )}
                    <p><strong>Format:</strong> {exportFormat.toUpperCase()}</p>
                  </div>
                  
                  {/* Right Column */}
                  <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                    {exportFormat === 'json' && (
                      <p><strong>Products:</strong> {includeProducts ? 'Included' : 'Not included'}</p>
                    )}
                    <p><strong>Fields:</strong> {selectedFields.length} selected</p>
                    {exportFormat === 'json' && includeProducts && (
                      <p className="text-xs text-amber-600">
                        ⚠️ Export will include all products, variants, and images for selected categories
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons - Mobile-friendly */}
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
            <Button variant="outline" onClick={onBack} className="w-full sm:w-auto">
              <span className="hidden sm:inline">← Back to Selection</span>
              <span className="sm:hidden">← Back</span>
            </Button>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button 
                onClick={handleExport}
                disabled={exporting || selectedFields.length === 0}
                className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
              >
                {exporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    <span className="hidden sm:inline">Exporting...</span>
                    <span className="sm:hidden">Exporting...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Export Categories</span>
                    <span className="sm:hidden">Export</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryExportDialog;
