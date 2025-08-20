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
    
    const dataStr = JSON.stringify(filteredCategories, null, 2);
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">Step 1</span>
              <span>Category Selection</span>
              <span className="text-gray-300">→</span>
              <span className="px-2 py-1 bg-blue-100 rounded-full text-xs text-blue-700">Step 2</span>
              <span className="text-blue-700">Export Configuration</span>
            </div>
          </div>
          <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Download className="h-6 w-6 text-blue-600" />
            </div>
            Export Categories
          </DialogTitle>
          <p className="text-sm text-gray-600">
            Configure export format, fields, and options for your selected categories
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Format Selection */}
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-lg">Export Format</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="flex gap-4">
                <Label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="format"
                    value="json"
                    checked={exportFormat === 'json'}
                    onChange={(e) => setExportFormat(e.target.value as 'json' | 'csv')}
                    className="text-blue-600"
                  />
                  <span>JSON (Recommended)</span>
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
                  <span>CSV</span>
                </Label>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-blue-800">
                  <Info className="w-4 h-4" />
                  <span className="text-sm font-medium">Format Information</span>
                </div>
                <p className="text-sm text-blue-700 mt-1">
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
              <CardHeader className="p-4">
                <CardTitle className="text-lg">Include Products</CardTitle>
                <p className="text-sm text-gray-600">
                  Choose whether to include products for each category in the export
                </p>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-products"
                    checked={includeProducts}
                    onCheckedChange={(checked) => setIncludeProducts(checked as boolean)}
                  />
                  <Label htmlFor="include-products" className="text-sm cursor-pointer">
                    Include products for each category
                  </Label>
                </div>
                <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-amber-800">
                    <Info className="w-4 h-4" />
                    <span className="text-sm font-medium">Note</span>
                  </div>
                  <p className="text-sm text-amber-700 mt-1">
                    Including products will significantly increase the export file size and may take longer to generate. 
                    This option is only available for JSON format as CSV cannot handle nested data structures.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Field Selection */}
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-lg">Select Fields to Export</CardTitle>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Selected {selectedFields.length} of {EXPORT_FIELDS.length} fields</span>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSelectDefaults}
                    className="text-xs"
                  >
                    Select Defaults
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSelectAll}
                    className="text-xs"
                  >
                    Select All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-3">
                {EXPORT_FIELDS.map((field) => (
                  <Label key={field.key} className="flex items-center space-x-2 cursor-pointer">
                    <Checkbox
                      checked={selectedFields.includes(field.key)}
                      onCheckedChange={() => handleFieldToggle(field.key)}
                    />
                    <span className="text-sm">{field.label}</span>
                  </Label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Export Summary */}
          <Card>
            <CardContent className="p-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-600">
                  <p><strong>Categories to export:</strong> {selectedCategories ? selectedCategories.length : categories.length}</p>
                  {selectedCategories && selectedCategories.length > 0 && (
                    <p><strong>Selection:</strong> {selectedCategories.length} of {categories.length} categories</p>
                  )}
                  <p><strong>Format:</strong> {exportFormat.toUpperCase()}</p>
                  {exportFormat === 'json' && (
                    <p><strong>Products:</strong> {includeProducts ? 'Included' : 'Not included'}</p>
                  )}
                  {exportFormat === 'json' && includeProducts && (
                    <p className="text-xs text-amber-600">
                      ⚠️ Export will include all products, variants, and images for selected categories
                    </p>
                  )}
                  <p><strong>Fields:</strong> {selectedFields.length} selected</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={onBack}>
              ← Back to Selection
            </Button>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleExport}
                disabled={exporting || selectedFields.length === 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {exporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Export Categories
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
