import React, { useState, useEffect } from 'react';
import { Download, FileText, FileSpreadsheet, Code, Check, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Product } from '../../types';
import { exportToCSV, exportToExcel, exportToJSON, EXPORT_FIELDS, getDefaultFields } from '../../utils/exportUtils';
import { toast } from 'sonner';
import { ProductService } from '../../services/productService';
import { useClerkAuth } from '../../hooks/useClerkAuth';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type ExportFormat = 'csv' | 'excel' | 'json';

const ExportDialog: React.FC<ExportDialogProps> = ({ 
  isOpen, 
  onClose
}) => {
  const { getToken } = useClerkAuth();
  const [selectedFields, setSelectedFields] = useState<string[]>(getDefaultFields());
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv');
  const [products, setProducts] = useState<Product[]>([]);
  const [fetchingProducts, setFetchingProducts] = useState(false);
  
  // Get available fields based on export format
  const getAvailableFields = () => {
    if (exportFormat === 'json' && products.length > 0) {
      // For JSON, show all available fields from the actual product data
      const firstProduct = products[0];
      const allFields: Array<{ key: string; label: string; default: boolean }> = [];
      
      // Add all direct product properties
      Object.keys(firstProduct).forEach(key => {
        if (key !== 'variants' && key !== 'images' && key !== '_count') {
          allFields.push({
            key,
            label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
            default: ['id', 'name', 'price', 'category', 'isActive'].includes(key)
          });
        }
      });
      
      // Add variants and images as special fields for JSON
      allFields.push(
        { key: 'variants', label: 'Variants (Full Array)', default: false },
        { key: 'images', label: 'Images (Full Array)', default: false },
        { key: '_count', label: 'Counts (Variants, Images, Reviews)', default: false }
      );
      
      return allFields;
    }
    
    // For CSV/Excel, use the predefined EXPORT_FIELDS
    return EXPORT_FIELDS;
  };

  // Fetch complete product data when dialog opens
  useEffect(() => {
    const fetchProductsForExport = async () => {
      if (!isOpen) return;
      
      setFetchingProducts(true);
      try {
        console.log('Fetching products for export...');
        const token = await getToken();
        if (!token) {
          toast.error('Authentication required');
          return;
        }
        
        const response = await ProductService.getProductsForExport(token);
        console.log(`Fetched ${response.products.length} products for export`);
        setProducts(response.products);
      } catch (error) {
        console.error('Error fetching products for export:', error);
        toast.error('Failed to fetch product data for export');
      } finally {
        setFetchingProducts(false);
      }
    };

    fetchProductsForExport();
  }, [isOpen, getToken]);

  // Reset selected fields when export format changes
  useEffect(() => {
    if (exportFormat === 'json') {
      // For JSON, select common fields by default
      setSelectedFields(['id', 'name', 'price', 'category', 'isActive']);
    } else {
      // For CSV/Excel, use default fields
      setSelectedFields(getDefaultFields());
    }
  }, [exportFormat]);

  const handleFieldToggle = (fieldKey: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldKey) 
        ? prev.filter(f => f !== fieldKey)
        : [...prev, fieldKey]
    );
  };

  const handleSelectAll = () => {
    const availableFields = getAvailableFields();
    setSelectedFields(availableFields.map(f => f.key));
  };

  const handleSelectNone = () => {
    setSelectedFields([]);
  };

  const handleSelectDefaults = () => {
    if (exportFormat === 'json') {
      // For JSON, select common fields by default
      setSelectedFields(['id', 'name', 'price', 'category', 'isActive']);
    } else {
      setSelectedFields(getDefaultFields());
    }
  };

  const handleExport = async () => {
    if (selectedFields.length === 0) {
      toast.error('Please select at least one field to export');
      return;
    }

    if (products.length === 0) {
      toast.error('No products to export');
      return;
    }

    setExporting(true);
    try {
      switch (exportFormat) {
        case 'csv':
          exportToCSV(products, selectedFields);
          toast.success(`Exported ${products.length} products to CSV`);
          break;
        case 'excel':
          await exportToExcel(products, selectedFields);
          toast.success(`Exported ${products.length} products to Excel`);
          break;
        case 'json':
          exportToJSON(products, selectedFields);
          toast.success(`Exported ${products.length} products to JSON`);
          break;
      }
      onClose();
    } catch (error) {
      console.error('Export error:', error);
      toast.error(error instanceof Error ? error.message : 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  const formatOptions = [
    { value: 'csv', label: 'CSV', icon: FileText, description: 'Universal format, works with Excel, Google Sheets, and databases' },
    { value: 'excel', label: 'Excel', icon: FileSpreadsheet, description: 'Native Excel format with formatting and multiple sheets' },
    { value: 'json', label: 'JSON', icon: Code, description: 'Developer-friendly format for APIs and data processing' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="mb-4 sm:mb-6">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
              <Download className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
            Export Products
          </DialogTitle>
          <p className="text-sm sm:text-base text-gray-600">
            Export your products in your preferred format with customizable fields
          </p>
        </DialogHeader>

        {/* Loading State */}
        {fetchingProducts && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="text-gray-600">Fetching complete product data...</span>
            </div>
          </div>
        )}

        {!fetchingProducts && (
          <div className="space-y-4 sm:space-y-6">
            {/* Export Format Selection */}
            <Card>
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Export Format</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {formatOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <div
                      key={option.value}
                      className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 ${
                        exportFormat === option.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setExportFormat(option.value as ExportFormat)}
                    >
                      {exportFormat === option.value && (
                        <div className="absolute top-2 right-2">
                          <Check className="h-5 w-5 text-blue-600" />
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          exportFormat === option.value ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          <Icon className={`h-5 w-5 ${
                            exportFormat === option.value ? 'text-blue-600' : 'text-gray-600'
                          }`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{option.label}</h3>
                          <p className="text-xs text-gray-600 mt-1">{option.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Field Selection */}
          <Card>
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Export Fields</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="text-xs"
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectNone}
                  className="text-xs"
                >
                  Select None
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectDefaults}
                  className="text-xs"
                >
                  Default Fields
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                {getAvailableFields().map((field) => (
                  <div key={field.key} className="flex items-center space-x-2">
                    <Checkbox
                      id={field.key}
                      checked={selectedFields.includes(field.key)}
                      onCheckedChange={() => handleFieldToggle(field.key)}
                    />
                    <Label
                      htmlFor={field.key}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {field.label}
                    </Label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Selected {selectedFields.length} of {getAvailableFields().length} fields
              </p>
              
              {/* Note about JSON format capabilities */}
              {exportFormat === 'json' && (
                <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-700">
                    <strong>JSON Format:</strong> Can export complex data like full variant arrays, image arrays, and nested objects. 
                    Select "Variants (Full Array)" and "Images (Full Array)" to include complete variant and image data.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Export Summary */}
          <Card>
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Export Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Products to export:</span>
                  <span className="font-medium">{products.length} products</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Selected fields:</span>
                  <span className="font-medium">{selectedFields.length} fields</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Export format:</span>
                  <span className="font-medium capitalize">{exportFormat.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated file size:</span>
                  <span className="font-medium">
                    {products.length > 0 ? `${Math.round(products.length * selectedFields.length * 0.1)} KB` : '0 KB'}
                  </span>
                </div>
              </div>
              
              {/* Warning about potentially missing fields */}
              {products.length > 0 && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-700">
                    <strong>Note:</strong> Some fields like description, comparePrice, and costPrice may be empty if not set in the product data. 
                    Check the browser console for detailed field information during export.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={exporting || fetchingProducts}
            className="px-6 py-2.5 h-11 rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={exporting || fetchingProducts || selectedFields.length === 0 || products.length === 0}
            className="px-6 py-2.5 h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exporting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Exporting...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                <span>Export Products</span>
              </div>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportDialog;
