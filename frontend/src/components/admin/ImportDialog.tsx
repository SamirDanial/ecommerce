import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '../ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

import { 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Download,
  Loader2,
  Info,
  Play,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { ProductService } from '../../services/productService';
import { useClerkAuth } from '../../hooks/useClerkAuth';

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete?: () => void;
}

type ImportStep = 'upload' | 'preview' | 'validation' | 'execution' | 'summary';

interface ValidationResult {
  index: number;
  product: { name: string; sku: string };
  errors: string[];
  warnings?: string[];
  valid: boolean;
}

interface ImportResult {
  name: string;
  sku: string;
  status: 'created' | 'updated' | 'skipped' | 'error';
  reason?: string;
  details?: string;
  productId?: number;
  originalSku?: string;
  skuChanged?: boolean;
}

interface ImportResponse {
  success: boolean;
  results: ImportResult[];
  summary: {
    total: number;
    imported: number;
    updated: number;
    skipped: number;
    errors: number;
  };
  message?: string;
}

const ImportDialog: React.FC<ImportDialogProps> = ({ 
  isOpen, 
  onClose, 
  onImportComplete 
}) => {
  const { getToken } = useClerkAuth();
  const [currentStep, setCurrentStep] = useState<ImportStep>('upload');
  const [products, setProducts] = useState<any[]>([]);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [importResults, setImportResults] = useState<ImportResult[]>([]);
  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importOptions, setImportOptions] = useState({
    orphanCategoryStrategy: 'create' as 'skip' | 'create',
    productDuplicateStrategy: 'generate_unique' as 'skip' | 'replace' | 'update' | 'generate_unique'
  });
  const [dragActive, setDragActive] = useState(false);
  const [showSample, setShowSample] = useState(false);
  const [structureValidationErrors, setStructureValidationErrors] = useState<string[]>([]);

  // Fetch template when dialog opens
  useEffect(() => {
    const fetchTemplate = async () => {
      if (!isOpen) return;
      
      try {
        const token = await getToken();
        if (!token) {
          toast.error('Authentication required');
          return;
        }

        const templateData = await ProductService.getImportTemplate(token);
        setTemplate(templateData);
      } catch (error) {
        console.error('Failed to fetch template:', error);
        toast.error('Failed to load import template');
      }
    };

    fetchTemplate();
  }, [isOpen, getToken]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload({ target: { files: e.dataTransfer.files } } as any);
    }
  };

  // Validate data structure against product table schema
  const validateDataStructure = (data: any[]): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (data.length === 0) {
      errors.push('JSON file contains no products');
      return { isValid: false, errors };
    }

    // Check each product for required fields and data types
    data.forEach((product, index) => {
      if (!product || typeof product !== 'object') {
        errors.push(`Product ${index + 1}: Invalid product object`);
        return;
      }

      // Required fields
      const requiredFields = ['name', 'price', 'categoryId'];
      requiredFields.forEach(field => {
        if (product[field] === undefined || product[field] === null || product[field] === '') {
          errors.push(`Product ${index + 1}: Missing required field '${field}'`);
        }
      });

      // Data type validations
      if (product.name !== undefined && typeof product.name !== 'string') {
        errors.push(`Product ${index + 1}: 'name' must be a string`);
      }
      
      if (product.price !== undefined && (typeof product.price !== 'number' || product.price < 0)) {
        errors.push(`Product ${index + 1}: 'price' must be a positive number`);
      }
      
      if (product.categoryId !== undefined && (typeof product.categoryId !== 'number' || product.categoryId <= 0)) {
        errors.push(`Product ${index + 1}: 'categoryId' must be a positive number`);
      }
      
      if (product.description !== undefined && typeof product.description !== 'string') {
        errors.push(`Product ${index + 1}: 'description' must be a string`);
      }
      
      if (product.sku !== undefined && typeof product.sku !== 'string') {
        errors.push(`Product ${index + 1}: 'sku' must be a string`);
      }
      
      if (product.comparePrice !== undefined && (typeof product.comparePrice !== 'number' || product.comparePrice < 0)) {
        errors.push(`Product ${index + 1}: 'comparePrice' must be a positive number`);
      }
      
      if (product.costPrice !== undefined && (typeof product.costPrice !== 'number' || product.costPrice < 0)) {
        errors.push(`Product ${index + 1}: 'costPrice' must be a positive number`);
      }
      
      if (product.weight !== undefined && (typeof product.weight !== 'number' || product.weight < 0)) {
        errors.push(`Product ${index + 1}: 'weight' must be a positive number`);
      }
      
      if (product.lowStockThreshold !== undefined && (typeof product.lowStockThreshold !== 'number' || product.lowStockThreshold < 0)) {
        errors.push(`Product ${index + 1}: 'lowStockThreshold' must be a positive number`);
      }
      
      if (product.isActive !== undefined && typeof product.isActive !== 'boolean') {
        errors.push(`Product ${index + 1}: 'isActive' must be a boolean`);
      }
      
      if (product.isFeatured !== undefined && typeof product.isFeatured !== 'boolean') {
        errors.push(`Product ${index + 1}: 'isFeatured' must be a boolean`);
      }
      
      if (product.isOnSale !== undefined && typeof product.isOnSale !== 'boolean') {
        errors.push(`Product ${index + 1}: 'isOnSale' must be a boolean`);
      }
      
      if (product.allowBackorder !== undefined && typeof product.allowBackorder !== 'boolean') {
        errors.push(`Product ${index + 1}: 'allowBackorder' must be a boolean`);
      }
      
      if (product.tags !== undefined && (!Array.isArray(product.tags) || !product.tags.every((tag: any) => typeof tag === 'string'))) {
        errors.push(`Product ${index + 1}: 'tags' must be an array of strings`);
      }
      
      if (product.variants !== undefined && (!Array.isArray(product.variants) || !product.variants.every((variant: any) => 
        typeof variant === 'object' && 
        typeof variant.size === 'string' && 
        typeof variant.color === 'string' && 
        typeof variant.stock === 'number' && 
        variant.stock >= 0
      ))) {
        errors.push(`Product ${index + 1}: 'variants' must be an array of valid variant objects with size, color, and stock`);
      }
      
      if (product.images !== undefined && (!Array.isArray(product.images) || !product.images.every((image: any) => 
        typeof image === 'object' && 
        typeof image.url === 'string' && 
        typeof image.alt === 'string'
      ))) {
        errors.push(`Product ${index + 1}: 'images' must be an array of valid image objects with url and alt`);
      }
    });

    return { isValid: errors.length === 0, errors };
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      toast.error('Please select a JSON file');
      return;
    }

    try {
      setLoading(true);
      const text = await file.text();
      const data = JSON.parse(text);

      if (!Array.isArray(data)) {
        toast.error('JSON file must contain an array of products');
        return;
      }

      // Validate data structure before proceeding
      const structureValidation = validateDataStructure(data);
      if (!structureValidation.isValid) {
        setStructureValidationErrors(structureValidation.errors);
        const errorMessage = `Data structure validation failed:\n${structureValidation.errors.slice(0, 5).join('\n')}${structureValidation.errors.length > 5 ? `\n... and ${structureValidation.errors.length - 5} more errors` : ''}`;
        toast.error(errorMessage);
        console.error('Data structure validation errors:', structureValidation.errors);
        return;
      }
      
      // Clear any previous structure validation errors
      setStructureValidationErrors([]);

      setProducts(data);
      toast.success(`Loaded ${data.length} products from file`);
      setCurrentStep('preview');
    } catch (error) {
      console.error('File parsing error:', error);
      toast.error('Failed to parse JSON file');
    } finally {
      setLoading(false);
    }
  };

  const handleValidation = async () => {
    if (products.length === 0) {
      toast.error('No products to validate');
      return;
    }

    try {
      setValidating(true);
      const token = await getToken();
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const validation = await ProductService.validateImport(products, importOptions, token);
      setValidationResults(validation.results);
      
      if (validation.valid) {
        toast.success(`All ${validation.totalProducts} products are valid!`);
        setCurrentStep('validation');
      } else {
        toast.warning(`${validation.invalidProducts} products have validation errors`);
        setCurrentStep('validation');
    }
  } catch (error) {
      console.error('Validation error:', error);
      toast.error('Failed to validate products');
    } finally {
      setValidating(false);
    }
  };

  const handleImport = async () => {
    try {
      setImporting(true);
      const token = await getToken();
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      // Don't filter out products here - let the backend handle orphan products according to the strategy
      // The validation step is just for user information, not for filtering
      if (products.length === 0) {
        toast.error('No products to import');
        return;
      }

      const result: ImportResponse = await ProductService.executeImport(products, importOptions, token);
      setImportResults(result.results);
      
      // Always move to summary step after import (success or failure)
      setCurrentStep('summary');
      console.log('Import completed, moving to summary step');
      
      // Show appropriate message based on import results
      if (result.success) {
        toast.success(result.message || `Import completed! ${result.summary.imported} products imported`);
        // Don't call onImportComplete here - let user close dialog manually
        // This ensures the dialog stays open to show the summary
      } else {
        // Show warning for partial success or error
        if (result.summary.imported > 0) {
          toast.warning(result.message || `Import completed with mixed results. ${result.summary.imported} imported, ${result.summary.errors} failed.`);
        } else {
          toast.error(result.message || `Import failed! ${result.summary.errors} products failed to import.`);
        }
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to execute import');
    } finally {
      setImporting(false);
    }
  };

  const showSampleData = () => {
    setShowSample(true);
  };

  const handleSampleDialogClose = () => {
    setShowSample(false);
    // Automatically reopen the import dialog after a short delay
    setTimeout(() => {
      // Trigger the import dialog to reopen by calling onClose and then onOpen
      onClose();
      setTimeout(() => {
        // Simulate reopening the import dialog
        const event = new CustomEvent('reopenImportDialog');
        window.dispatchEvent(event);
      }, 100);
    }, 100);
  };

  const downloadTemplate = () => {
    if (!template) return;
    
    const templateData = {
      description: template.description,
      required_fields: template.required_fields,
      optional_fields: template.optional_fields,
      sample_data: template.sample_data,
      notes: template.notes
    };
    
    const blob = new Blob([JSON.stringify(templateData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'product-import-template.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const resetImport = () => {
    setCurrentStep('upload');
    setProducts([]);
    setValidationResults([]);
    setImportResults([]);
    setStructureValidationErrors([]);
    setImportOptions({
      orphanCategoryStrategy: 'create',
      productDuplicateStrategy: 'generate_unique'
    });
    setLoading(false);
    setValidating(false);
    setImporting(false);
    setDragActive(false);
    
    // Reset file input value
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const getStepStatus = (step: ImportStep) => {
    const stepOrder = ['upload', 'preview', 'validation', 'execution', 'summary'];
    const currentIndex = stepOrder.indexOf(currentStep);
    const stepIndex = stepOrder.indexOf(step);
    
    if (step === currentStep) return 'current';
    if (stepIndex < currentIndex) return 'completed';
    return 'pending';
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-4 sm:mb-6">
      {(['upload', 'preview', 'validation', 'execution', 'summary'] as ImportStep[]).map((step, index) => (
        <div key={step} className="flex items-center">
          <div className={`flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 ${
            getStepStatus(step) === 'completed' ? 'bg-green-500 border-green-500 text-white' :
            getStepStatus(step) === 'current' ? 'bg-blue-500 border-blue-500 text-white' :
            'bg-gray-100 border-gray-300 text-gray-500'
          }`}>
            {getStepStatus(step) === 'completed' ? (
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <span className="text-xs sm:text-sm font-medium">{index + 1}</span>
            )}
          </div>
          {index < 4 && (
            <div className={`w-8 sm:w-16 h-0.5 mx-1 sm:mx-2 ${
              getStepStatus(step) === 'completed' ? 'bg-green-500' : 'bg-gray-300'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderUploadStep = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Template Information */}
      <Card>
        <CardHeader className="p-3 sm:p-4">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2 text-center sm:text-left">
            <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            <span className="hidden sm:inline">Import Template & Requirements</span>
            <span className="sm:hidden">Template & Requirements</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="text-left">
              <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Required Fields</h4>
              <ul className="space-y-1 text-xs sm:text-sm text-gray-600">
                {template?.required_fields?.map((field: string) => (
                  <li key={field} className="flex items-center gap-2 justify-start">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 flex-shrink-0" />
                    <span className="break-words leading-relaxed text-xs">{field}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Optional Fields</h4>
              <ul className="space-y-1 text-xs sm:text-sm text-gray-600">
                {template?.optional_fields?.slice(0, 8).map((field: string) => (
                  <li key={field} className="flex items-center gap-2 justify-start">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                    <span className="break-words leading-relaxed text-xs">{field}</span>
                  </li>
                ))}
                {template?.optional_fields?.length > 8 && (
                  <li className="text-xs text-gray-500 text-left">
                    +{template.optional_fields.length - 8} more fields
                  </li>
                )}
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={downloadTemplate}
              className="w-full sm:w-auto flex items-center justify-center gap-2 h-10 sm:h-9"
            >
              <Download className="w-4 h-4" />
              Download Template
            </Button>
            <Button
              variant="outline"
              onClick={showSampleData}
              className="w-full sm:w-auto flex items-center justify-center gap-2 h-10 sm:h-9"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">View Sample Data</span>
              <span className="sm:hidden">View Sample</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader className="p-3 sm:p-4">
          <CardTitle className="text-base sm:text-lg text-center sm:text-left">Upload JSON File</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          <div 
            className={`border-2 border-dashed rounded-lg p-4 sm:p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <div className="text-base sm:text-lg font-medium text-gray-900 mb-2">
              <span className="hidden sm:inline">Choose a JSON file or drag and drop</span>
              <span className="sm:hidden">Choose JSON file or drag & drop</span>
            </div>
            <div className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
              <span className="hidden sm:inline">Only JSON files are supported. File should contain an array of product objects.</span>
              <span className="sm:hidden">JSON files only. Should contain product objects array.</span>
            </div>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 mx-auto w-full sm:w-auto h-10 sm:h-9"
              onClick={() => document.getElementById('file-upload')?.click()}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">
                {loading ? 'Validating...' : 'Select JSON File'}
              </span>
              <span className="sm:hidden">
                {loading ? 'Validating...' : 'Select File'}
              </span>
            </Button>
            <Input
              id="file-upload"
              type="file"
              accept=".json,application/json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      {/* Structure Validation Errors */}
      {structureValidationErrors.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="p-3 sm:p-4">
            <CardTitle className="text-base sm:text-lg text-left text-red-800 flex items-center gap-2">
              <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              Data Structure Validation Failed
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <div className="space-y-3">
              <p className="text-sm text-red-700">
                The uploaded JSON file contains {structureValidationErrors.length} validation error(s). 
                Please fix these issues before proceeding with the import.
              </p>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {structureValidationErrors.map((error, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm text-red-600">
                    <XCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span className="break-words">{error}</span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-red-200">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStructureValidationErrors([]);
                    setProducts([]);
                    setCurrentStep('upload');
                  }}
                  className="text-red-700 border-red-300 hover:bg-red-100"
                >
                  Clear Errors & Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Notes */}
      <Card>
        <CardHeader className="p-3 sm:p-4">
          <CardTitle className="text-base sm:text-lg text-left">Important Notes</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
            {template?.notes?.map((note: string, index: number) => (
              <li key={index} className="flex items-start gap-2 text-left">
                <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <span className="break-words leading-relaxed">{note}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );

  const renderPreviewStep = () => (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader className="p-3 sm:p-4">
          <CardTitle className="text-base sm:text-lg text-center sm:text-left">Data Preview</CardTitle>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <p className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
              <span className="hidden sm:inline">Review your data before validation. Found {products.length} products.</span>
              <span className="sm:hidden">Found {products.length} products</span>
            </p>
            <div className="flex justify-center sm:justify-start">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {products.length} Products
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          <div className="max-h-60 overflow-y-auto space-y-3">
            {products.slice(0, 5).map((product, index) => (
              <div key={index} className="border rounded-lg p-3 bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 transition-all duration-200">
                {/* Header Row */}
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate flex-1 mr-2">
                    {product.name || `Product ${index + 1}`}
                  </h4>
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full flex-shrink-0">
                    #{index + 1}
                  </span>
                </div>
                
                {/* Product Details Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 font-medium">Price:</span>
                    <span className="font-semibold text-green-600">${product.price || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 font-medium">SKU:</span>
                    <span className="font-mono text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded text-xs">
                      {product.sku || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 font-medium">Category:</span>
                    <span className="text-gray-700">{product.categoryId || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 font-medium">Variants:</span>
                    <span className="font-semibold text-blue-600">{product.variants?.length || 0}</span>
                  </div>
                </div>
                
                {/* Additional Info Row */}
                {product.description && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {product.description}
                    </p>
                  </div>
                )}
              </div>
            ))}
            {products.length > 5 && (
              <div className="text-center py-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
                  <span className="text-xs sm:text-sm text-gray-600">
                    <span className="hidden sm:inline">... and {products.length - 5} more products</span>
                    <span className="sm:hidden">+{products.length - 5} more</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
        <Button variant="outline" onClick={() => setCurrentStep('upload')} className="w-full sm:w-auto order-2 sm:order-1 h-11">
          <span className="hidden sm:inline">Back to Upload</span>
          <span className="sm:hidden">Back</span>
        </Button>
        <Button 
          onClick={handleValidation}
          disabled={validating}
          className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto order-1 sm:order-2 h-11"
        >
          {validating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              <span className="hidden sm:inline">Validating...</span>
              <span className="sm:hidden">Validating...</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Validate Products</span>
              <span className="sm:hidden">Validate</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );

  const renderValidationStep = () => (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader className="p-3 sm:p-4">
          <CardTitle className="text-base sm:text-lg text-center sm:text-left">Validation Results</CardTitle>
          {/* Summary Stats - Mobile Optimized */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="flex justify-center sm:justify-start gap-2 sm:gap-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <CheckCircle className="w-3.5 h-3.5" />
                {validationResults.filter(r => r.valid).length} Valid
              </span>
              {validationResults.filter(r => r.warnings && r.warnings.length > 0).length > 0 && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {validationResults.filter(r => r.warnings && r.warnings.length > 0).length} Warnings
                </span>
              )}
              {validationResults.filter(r => !r.valid).length > 0 && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  <XCircle className="w-3.5 h-3.5" />
                  {validationResults.filter(r => !r.valid).length} Invalid
                </span>
              )}
            </div>
            
            {/* Status Summary */}
            <div className="text-center sm:text-left">
              <p className="text-xs sm:text-sm text-gray-600">
                {validationResults.filter(r => !r.valid).length === 0 
                  ? 'All products validated successfully!'
                  : (() => {
                      const totalInvalid = validationResults.filter(r => !r.valid).length;
                      const onlyCategoryIssues = validationResults.filter(r => {
                        if (!r.valid) {
                          return r.errors.every(error => 
                            error.toLowerCase().includes('category') || 
                            error.toLowerCase().includes('categoryid') ||
                            error.toLowerCase().includes('invalid category')
                          );
                        }
                        return false;
                      }).length;
                      
                      if (onlyCategoryIssues === totalInvalid) {
                        return `${totalInvalid} product${totalInvalid !== 1 ? 's' : ''} have category issues (can be handled during import)`;
                      } else if (onlyCategoryIssues > 0) {
                        return `${totalInvalid} product${totalInvalid !== 1 ? 's' : ''} need attention (${onlyCategoryIssues} have category issues)`;
                      } else {
                        return `${totalInvalid} product${totalInvalid !== 1 ? 's' : ''} need attention`;
                      }
                    })()
                }
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          <div className="max-h-60 overflow-y-auto space-y-3">
            {validationResults.map((result) => (
              <div key={result.index} className={`border rounded-lg p-3 transition-all duration-200 ${
                result.valid 
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover:from-green-100 hover:to-emerald-100' 
                  : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200 hover:from-red-100 hover:to-rose-100'
              }`}>
                {/* Product Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">
                      {result.product.name || `Product ${result.index + 1}`}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Row {result.index + 1} • {result.product.sku || 'No SKU'}
                    </p>
                  </div>
                  <div className="flex-shrink-0 ml-2">
                    {result.valid ? (
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <XCircle className="w-4 h-4 text-red-600" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Errors Section */}
                {!result.valid && result.errors.length > 0 && (
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-3 h-3 text-red-600" />
                      </div>
                      <span className="text-xs font-medium text-red-700 uppercase tracking-wide">
                        Errors ({result.errors.length})
                      </span>
                    </div>
                    <div className="space-y-1.5 ml-7">
                      {result.errors.map((error, errorIndex) => (
                        <div key={errorIndex} className="text-xs sm:text-sm text-red-700 bg-white border border-red-200 rounded-lg p-2">
                          <span className="text-red-500 font-medium mr-2">•</span>
                          <span className="break-words leading-relaxed">{error}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Warnings Section */}
                {result.warnings && result.warnings.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                      </div>
                      <span className="text-xs font-medium text-amber-700 uppercase tracking-wide">
                        Warnings ({result.warnings.length})
                      </span>
                    </div>
                    <div className="space-y-1.5 ml-7">
                      {result.warnings.map((warning, warningIndex) => (
                        <div key={warningIndex} className="text-xs sm:text-sm text-amber-700 bg-white border border-amber-200 rounded-lg p-2">
                          <span className="text-amber-500 font-medium mr-2">•</span>
                          <span className="break-words leading-relaxed">{warning}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Success Message for Valid Products */}
                {result.valid && result.warnings && result.warnings.length === 0 && (
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">Product validated successfully</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
        <Button variant="outline" onClick={() => setCurrentStep('preview')} className="w-full sm:w-auto order-2 sm:order-1 h-11">
          <span className="hidden sm:inline">Back to Preview</span>
          <span className="sm:hidden">Back</span>
        </Button>
        <Button 
          onClick={() => setCurrentStep('execution')}
          disabled={validationResults.filter(r => {
            // Allow proceeding if the only issues are orphan products (invalid category IDs)
            // These can be handled by the import strategies in Step 4
            if (!r.valid) {
              // Check if the only errors are related to category IDs
              const hasOnlyCategoryIssues = r.errors.every(error => 
                error.toLowerCase().includes('category') || 
                error.toLowerCase().includes('categoryid') ||
                error.toLowerCase().includes('invalid category')
              );
              return !hasOnlyCategoryIssues; // Block only if there are non-category errors
            }
            return false; // Product is valid, allow proceeding
          }).length > 0}
          className="bg-green-600 hover:bg-green-700 w-full sm:w-auto order-1 sm:order-2 h-11"
        >
          <span className="hidden sm:inline">Continue to Import</span>
          <span className="sm:hidden">Continue</span>
        </Button>
      </div>
    </div>
  );

  const renderExecutionStep = () => (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader className="p-3 sm:p-4">
          <CardTitle className="text-base sm:text-lg text-center sm:text-left">Import Options</CardTitle>
          <p className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
            <span className="hidden sm:inline">Configure how the import should handle existing products and invalid categories.</span>
            <span className="sm:hidden">Configure import handling for products and categories.</span>
          </p>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 space-y-4">


          {/* Orphan Category Strategy */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 text-sm sm:text-base text-center sm:text-left">Orphan Products Handling:</h4>
            <p className="text-xs text-gray-600 text-center sm:text-left mb-3">
              <span className="hidden sm:inline">What to do with products that have invalid or missing category IDs</span>
              <span className="sm:hidden">Handle products with invalid categories</span>
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  id="orphanCategorySkip"
                  name="orphanCategoryStrategy"
                  value="skip"
                  checked={importOptions.orphanCategoryStrategy === 'skip'}
                  onChange={(e) => setImportOptions(prev => ({ 
                    ...prev, 
                    orphanCategoryStrategy: e.target.value as 'skip' | 'create' 
                  }))}
                  className="mt-1 flex-shrink-0"
                />
                <Label htmlFor="orphanCategorySkip" className="text-xs sm:text-sm flex-1">
                  <span className="hidden sm:inline">⏭️ Skip products with invalid categories</span>
                  <span className="sm:hidden">⏭️ Skip invalid categories</span>
                </Label>
              </div>
              
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  id="orphanCategoryCreate"
                  name="orphanCategoryStrategy"
                  value="create"
                  checked={importOptions.orphanCategoryStrategy === 'create'}
                  onChange={(e) => setImportOptions(prev => ({ 
                    ...prev, 
                    orphanCategoryStrategy: e.target.value as 'skip' | 'create' 
                  }))}
                  className="mt-1 flex-shrink-0"
                />
                <Label htmlFor="orphanCategoryCreate" className="text-xs sm:text-sm flex-1">
                  <span className="hidden sm:inline">📁 Create 'Orphan Products' category (Recommended) - Assign all products with invalid categories to a special category</span>
                  <span className="sm:hidden">📁 Create 'Orphan Products' category (Recommended)</span>
                </Label>
              </div>
            </div>
          </div>

          {/* Product Duplicate Strategy */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 text-sm sm:text-base text-center sm:text-left">Product Duplicate Handling:</h4>
            <p className="text-xs text-gray-600 text-center sm:text-left mb-3">
              <span className="hidden sm:inline">How to handle products that already exist in the system (based on SKU)</span>
              <span className="sm:hidden">Handle existing products</span>
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  id="productDuplicateSkip"
                  name="productDuplicateStrategy"
                  value="skip"
                  checked={importOptions.productDuplicateStrategy === 'skip'}
                  onChange={(e) => setImportOptions(prev => ({ 
                    ...prev, 
                    productDuplicateStrategy: e.target.value as 'skip' | 'replace' | 'update' | 'generate_unique' 
                  }))}
                  className="mt-1 flex-shrink-0"
                />
                <Label htmlFor="productDuplicateSkip" className="text-xs sm:text-sm flex-1">
                  <span className="hidden sm:inline">⏭️ Skip existing products</span>
                  <span className="sm:hidden">⏭️ Skip existing</span>
                </Label>
              </div>
              
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  id="productDuplicateReplace"
                  name="productDuplicateStrategy"
                  value="replace"
                  checked={importOptions.productDuplicateStrategy === 'replace'}
                  onChange={(e) => setImportOptions(prev => ({ 
                    ...prev, 
                    productDuplicateStrategy: e.target.value as 'skip' | 'replace' | 'update' | 'generate_unique' 
                  }))}
                  className="mt-1 flex-shrink-0"
                />
                <Label htmlFor="productDuplicateReplace" className="text-xs sm:text-sm flex-1">
                  <span className="hidden sm:inline">🗑️ Replace existing products (Risky - loses all history, variants, images)</span>
                  <span className="sm:hidden">🗑️ Replace existing (Risky)</span>
                </Label>
              </div>
              
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  id="productDuplicateUpdate"
                  name="productDuplicateStrategy"
                  value="update"
                  checked={importOptions.productDuplicateStrategy === 'update'}
                  onChange={(e) => setImportOptions(prev => ({ 
                    ...prev, 
                    productDuplicateStrategy: e.target.value as 'skip' | 'replace' | 'update' | 'generate_unique' 
                  }))}
                  className="mt-1 flex-shrink-0"
                />
                <Label htmlFor="productDuplicateUpdate" className="text-xs sm:text-sm flex-1">
                  <span className="hidden sm:inline">🔄 Update existing products (Recommended) - Merge new data with existing</span>
                  <span className="sm:hidden">🔄 Update existing (Recommended)</span>
                </Label>
              </div>
              
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  id="productDuplicateGenerateUnique"
                  name="productDuplicateStrategy"
                  value="generate_unique"
                  checked={importOptions.productDuplicateStrategy === 'generate_unique'}
                  onChange={(e) => setImportOptions(prev => ({ 
                    ...prev, 
                    productDuplicateStrategy: e.target.value as 'skip' | 'replace' | 'update' | 'generate_unique' 
                  }))}
                  className="mt-1 flex-shrink-0"
                />
                <Label htmlFor="productDuplicateGenerateUnique" className="text-xs sm:text-sm flex-1">
                  <span className="hidden sm:inline">🆔 Force import with unique IDs - Generate random SKUs/slugs for duplicates</span>
                  <span className="sm:hidden">🆔 Force import with unique IDs</span>
                </Label>
              </div>
            </div>
          </div>

          {/* Recommendations Section */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs sm:text-sm text-green-800 flex-1">
                <p className="font-medium mb-2 text-center sm:text-left">Our Recommendations:</p>
                <ul className="space-y-2 text-left">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 font-medium mt-0.5">•</span>
                    <span className="break-words leading-relaxed">
                      <strong>Orphan Products:</strong> 
                      <span className="hidden sm:inline"> Use "Create 'Orphan Products' category" to avoid data loss</span>
                      <span className="sm:hidden"> Use "Create 'Orphan Products' category"</span>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 font-medium mt-0.5">•</span>
                    <span className="break-words leading-relaxed">
                      <strong>Duplicate Products:</strong> 
                      <span className="hidden sm:inline"> Use "Update existing products" to preserve data integrity</span>
                      <span className="sm:hidden"> Use "Update existing products"</span>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-medium mt-0.5">⚠️</span>
                    <span className="break-words leading-relaxed">
                      <strong>Warning:</strong> 
                      <span className="hidden sm:inline"> "Replace existing products" will permanently delete existing data</span>
                      <span className="sm:hidden"> "Replace existing products" will delete existing data</span>
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
            <div className="flex items-center gap-2 text-blue-800">
              <Info className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-medium">Ready to Import</span>
            </div>
            <p className="text-xs sm:text-sm text-blue-700 mt-1 text-center sm:text-left break-words leading-relaxed">
              <span className="hidden sm:inline">{validationResults.filter(r => r.valid).length} products will be imported with your selected strategies.</span>
              <span className="sm:hidden">{validationResults.filter(r => r.valid).length} products ready for import.</span>
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
        <Button variant="outline" onClick={() => setCurrentStep('validation')} className="w-full sm:w-auto order-2 sm:order-1 h-11">
          <span className="hidden sm:inline">Back to Validation</span>
          <span className="sm:hidden">Back</span>
        </Button>
        <Button 
          onClick={handleImport}
          disabled={importing}
          className="bg-green-600 hover:bg-green-700 w-full sm:w-auto order-1 sm:order-2 h-11"
        >
          {importing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              <span className="hidden sm:inline">Importing...</span>
              <span className="sm:hidden">Importing...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Start Import</span>
              <span className="sm:hidden">Start Import</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );

  const renderSummaryStep = () => (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader className="p-3 sm:p-4">
          <CardTitle className="text-base sm:text-lg text-center sm:text-left">Import Summary</CardTitle>
          <p className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
            <span className="hidden sm:inline">Complete overview of your product import results and statistics.</span>
            <span className="sm:hidden">Complete import results overview.</span>
          </p>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 space-y-4">
          
          {/* Overall Statistics */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 sm:p-4">
            <h4 className="font-semibold text-blue-900 text-sm sm:text-base text-center sm:text-left mb-3">Overall Results</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="text-center">
                <div className="text-lg sm:text-xl font-bold text-blue-600">
                  {importResults.length}
                </div>
                <div className="text-xs text-blue-700 font-medium">Total</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-xl font-bold text-green-600">
                  {importResults.filter(r => r.status === 'created').length}
                </div>
                <div className="text-xs text-green-700 font-medium">Created</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-xl font-bold text-blue-600">
                  {importResults.filter(r => r.status === 'updated').length}
                </div>
                <div className="text-xs text-blue-700 font-medium">Updated</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-xl font-bold text-yellow-600">
                  {importResults.filter(r => r.status === 'skipped').length}
                </div>
                <div className="text-xs text-yellow-700 font-medium">Skipped</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-3">
              <div className="text-center">
                <div className="text-lg sm:text-xl font-bold text-red-600">
                  {importResults.filter(r => r.status === 'error').length}
                </div>
                <div className="text-xs text-red-700 font-medium">Errors</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-xl font-bold text-emerald-600">
                  {importResults.filter(r => r.status === 'created' || r.status === 'updated').length}
                </div>
                <div className="text-xs text-emerald-700 font-medium">Success</div>
              </div>
            </div>
          </div>

          {/* Success Rate */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                <span className="text-sm sm:text-base font-medium text-green-800">Success Rate</span>
              </div>
              <div className="text-right">
                <div className="text-lg sm:text-xl font-bold text-green-600">
                  {importResults.length > 0 
                    ? Math.round((importResults.filter(r => r.status === 'created' || r.status === 'updated').length / importResults.length) * 100)
                    : 0}%
                </div>
                <div className="text-xs text-green-700">
                  {importResults.filter(r => r.status === 'created' || r.status === 'updated').length} of {importResults.length}
                </div>
              </div>
            </div>
          </div>

          {/* Orphan Products Summary */}
          {importResults.some(r => r.reason && r.reason.includes('orphan')) && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs sm:text-sm text-amber-800 flex-1">
                  <p className="font-medium mb-2 text-center sm:text-left">Orphan Products Handled</p>
                  <p className="text-center sm:text-left break-words leading-relaxed">
                    <span className="hidden sm:inline">Some products had invalid category IDs and were assigned to the "Orphan Products" category. You can manually move them to appropriate categories later.</span>
                    <span className="sm:hidden">Products with invalid categories were assigned to "Orphan Products" category.</span>
                  </p>
                  <div className="mt-2 text-center sm:text-left">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                      {importResults.filter(r => r.reason && r.reason.includes('orphan')).length} orphan products
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SKU Changes Summary */}
          {importResults.some(r => r.skuChanged) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs sm:text-sm text-blue-800 flex-1">
                  <p className="font-medium mb-2 text-center sm:text-left">SKU Changes</p>
                  <p className="text-center sm:text-left break-words leading-relaxed">
                    <span className="hidden sm:inline">Some products had duplicate SKUs and were automatically assigned new unique SKUs to prevent conflicts.</span>
                    <span className="sm:hidden">Duplicate SKUs were automatically made unique.</span>
                  </p>
                  <div className="mt-2 text-center sm:text-left">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {importResults.filter(r => r.skuChanged).length} SKUs changed
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Detailed Results */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 text-sm sm:text-base text-center sm:text-left">Detailed Results</h4>
            <div className="max-h-60 overflow-y-auto space-y-3">
              {importResults.map((result, index) => (
                <div key={index} className={`border rounded-lg p-3 transition-all duration-200 ${
                  result.status === 'created' ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover:from-green-100 hover:to-emerald-100' :
                  result.status === 'updated' ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:from-blue-100 hover:to-indigo-100' :
                  result.status === 'skipped' ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 hover:from-yellow-100 hover:to-amber-100' :
                  'bg-gradient-to-r from-red-50 to-rose-50 border-red-200 hover:from-red-100 hover:to-rose-100'
                }`}>
                  {/* Product Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">
                        {result.name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        SKU: {result.sku || 'N/A'}
                        {result.originalSku && result.skuChanged && (
                          <span className="ml-2 text-blue-600">
                            (was: {result.originalSku})
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex-shrink-0 ml-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        result.status === 'created' ? 'bg-green-100 text-green-800' :
                        result.status === 'updated' ? 'bg-blue-100 text-blue-800' :
                        result.status === 'skipped' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {result.status}
                      </span>
                    </div>
                  </div>

                  {/* Status Details */}
                  {result.reason && (
                    <div className="text-xs sm:text-sm text-gray-700 bg-white border border-gray-200 rounded-lg p-2 mb-2">
                      <span className="font-medium">Reason:</span> {result.reason}
                    </div>
                  )}
                  
                  {result.details && (
                    <div className="text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-2 font-mono break-words leading-relaxed">
                      {result.details}
                    </div>
                  )}

                  {/* Success Indicators */}
                  <div className="flex items-center gap-2 mt-2">
                    {result.status === 'created' && <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />}
                    {result.status === 'updated' && <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />}
                    {result.status === 'skipped' && <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600" />}
                    {result.status === 'error' && <XCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />}
                    
                    <span className="text-xs text-gray-500">
                      #{index + 1}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Import Summary Footer */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4">
            <div className="text-center">
              <p className="text-xs sm:text-sm text-gray-600 mb-2">
                <span className="hidden sm:inline">Import completed at {new Date().toLocaleString()}</span>
                <span className="sm:hidden">Completed at {new Date().toLocaleTimeString()}</span>
              </p>
              <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-500">
                <span>Total Products: {importResults.length}</span>
                <span>•</span>
                <span>Success: {importResults.filter(r => r.status === 'created' || r.status === 'updated').length}</span>
                <span>•</span>
                <span>Issues: {importResults.filter(r => r.status === 'skipped' || r.status === 'error').length}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
        <Button variant="outline" onClick={resetImport} className="w-full sm:w-auto order-2 sm:order-1 h-11">
          <span className="hidden sm:inline">Import Another File</span>
          <span className="sm:hidden">Import Another</span>
        </Button>
        <Button onClick={() => {
          // Call onImportComplete to refresh the products section
          // This ensures the products list is updated after import
          onImportComplete?.();
          // Reset all states before closing
          resetImport();
          // Then close the dialog
          onClose();
        }} className="w-full sm:w-auto order-1 sm:order-2 h-11">
          Close
        </Button>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    console.log('Current step:', currentStep);
    switch (currentStep) {
      case 'upload':
        return renderUploadStep();
      case 'preview':
        return renderPreviewStep();
      case 'validation':
        return renderValidationStep();
      case 'execution':
        return renderExecutionStep();
      case 'summary':
        return renderSummaryStep();
      default:
        return renderUploadStep();
    }
  };

  return (
    <>
      {/* Main Import Dialog */}
      <Dialog open={isOpen} onOpenChange={(open) => {
        // Only close if user explicitly closes the dialog
        // Don't close when moving between steps
        // This ensures the dialog stays open after import to show the summary
        if (!open) {
          // Reset all states when dialog is closed
          resetImport();
          onClose();
        }
      }}>
        <DialogContent className="max-w-4xl w-screen sm:w-[95vw] max-h-[90vh] overflow-y-auto overflow-x-hidden p-3 sm:p-6">
          <DialogHeader className="mb-3 sm:mb-6">
            <DialogTitle className="text-lg sm:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3 text-center sm:text-left">
              <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg">
                <Upload className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <span className="hidden sm:inline">Import Products</span>
              <span className="sm:hidden">Import</span>
            </DialogTitle>
            <p className="text-xs sm:text-base text-gray-600 text-center sm:text-left">
              <span className="hidden sm:inline">Import products from JSON file with comprehensive validation and error handling</span>
              <span className="sm:hidden">Import products from JSON file with validation</span>
            </p>
          </DialogHeader>

          {renderStepIndicator()}
          {renderCurrentStep()}
        </DialogContent>
      </Dialog>

      {/* Sample Data Dialog - Separate dialog outside the import dialog */}
      {showSample && (
        <Dialog open={showSample} onOpenChange={(open) => {
          if (!open) {
            handleSampleDialogClose();
          }
        }}>
          <DialogContent className="max-w-5xl w-screen sm:w-[95vw] max-h-[90vh] overflow-y-auto overflow-x-hidden p-3 sm:p-6">
            <DialogHeader className="mb-3 sm:mb-6">
              <DialogTitle className="text-lg sm:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <span className="hidden sm:inline">Sample Import Data Format</span>
                <span className="sm:hidden">Sample Format</span>
              </DialogTitle>
              <p className="text-xs sm:text-base text-gray-600">
                <span className="hidden sm:inline">Comprehensive example of the JSON format expected for product import</span>
                <span className="sm:hidden">JSON format example for product import</span>
              </p>
            </DialogHeader>

            <div className="space-y-4 sm:space-y-6">
              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-2 text-blue-800 mb-2">
                  <Info className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base font-medium">This sample demonstrates all import capabilities</span>
                </div>
                <p className="text-xs sm:text-sm text-blue-700">
                  The example includes required fields, optional fields, product variants, and images to show the full import functionality.
                </p>
              </div>
              
              {/* JSON Structure */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4">
                <h4 className="font-medium text-gray-900 mb-3 text-sm sm:text-base">Sample JSON Structure:</h4>
                <pre className="text-xs sm:text-sm text-gray-700 overflow-x-auto whitespace-pre-wrap break-words bg-white p-3 sm:p-4 rounded border">
{`[
  {
    "name": "Premium Cotton T-Shirt",
    "description": "High-quality cotton t-shirt with modern fit",
    "price": "29.99",
    "comparePrice": "39.99",
    "costPrice": "15.00",
    "sku": "TSHIRT-001",
    "slug": "premium-cotton-tshirt",
    "barcode": "1234567890123",
    "weight": "0.3",
    "dimensions": "30x20x2",
    "isActive": true,
    "isFeatured": true,
    "isOnSale": true,
    "salePrice": "24.99",
    "saleEndDate": "2025-12-31T23:59:59.000Z",
    "shortDescription": "Comfortable and stylish",
    "metaTitle": "Premium Cotton T-Shirt | Best Quality",
    "metaDescription": "Shop our premium cotton t-shirt collection",
    "tags": ["cotton", "t-shirt", "premium"],
    "categoryId": 1,
    "lowStockThreshold": 5,
    "allowBackorder": false,
    "variants": [
      {
        "size": "S",
        "color": "White",
        "colorCode": "#FFFFFF",
        "stock": 25,
        "sku": "TSHIRT-001-S-WHITE",
        "price": "29.99",
        "comparePrice": "39.99",
        "isActive": true,
        "stockStatus": "IN_STOCK",
        "lowStockThreshold": 3,
        "allowBackorder": false
      },
      {
        "size": "M",
        "color": "Black",
        "colorCode": "#000000",
        "stock": 30,
        "sku": "TSHIRT-001-M-BLACK",
        "price": "29.99",
        "comparePrice": "39.99",
        "isActive": true,
        "stockStatus": "IN_STOCK",
        "lowStockThreshold": 3,
        "allowBackorder": false
      }
    ],
    "images": [
      {
        "url": "/uploads/products/tshirt-white.jpg",
        "alt": "White Premium Cotton T-Shirt",
        "sortOrder": 1,
        "isPrimary": true,
        "color": "White"
      },
      {
        "url": "/uploads/products/tshirt-black.jpg",
        "alt": "Black Premium Cotton T-Shirt",
        "sortOrder": 2,
        "isPrimary": false,
        "color": "Black"
      }
    ]
  },
  {
    "name": "Classic Denim Jeans",
    "description": "Timeless denim jeans with perfect fit",
    "price": "79.99",
    "comparePrice": "99.99",
    "costPrice": "35.00",
    "sku": "JEANS-001",
    "slug": "classic-denim-jeans",
    "barcode": "1234567890124",
    "weight": "0.8",
    "dimensions": "35x25x3",
    "isActive": true,
    "isFeatured": false,
    "isOnSale": false,
    "shortDescription": "Classic style, modern comfort",
    "metaTitle": "Classic Denim Jeans | Perfect Fit",
    "metaDescription": "Discover our classic denim jeans collection",
    "tags": ["denim", "jeans", "classic"],
    "categoryId": 2,
    "lowStockThreshold": 3,
    "allowBackorder": true,
    "variants": [
      {
        "size": "32x32",
        "color": "Blue",
        "colorCode": "#1E3A8A",
        "stock": 15,
        "sku": "JEANS-001-32X32-BLUE",
        "price": "79.99",
        "isActive": true,
        "stockStatus": "IN_STOCK",
        "lowStockThreshold": 2,
        "allowBackorder": true
      }
    ],
    "images": [
      {
        "url": "/uploads/products/jeans-blue.jpg",
        "alt": "Blue Classic Denim Jeans",
        "sortOrder": 1,
        "isPrimary": true,
        "color": "Blue"
      }
    ]
  }
]`}
                </pre>
              </div>
              
              {/* Features List */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-2 text-green-800 mb-3">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base font-medium">Key Features Demonstrated:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-green-700">
                  <div>• All required fields (name, price, sku, etc.)</div>
                  <div>• Optional fields (tags, meta descriptions, sale prices)</div>
                  <div>• Product variants with size, color, and stock</div>
                  <div>• Multiple images with primary/secondary designation</div>
                  <div>• Proper data types and formats</div>
                  <div>• Realistic sample data for testing</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={handleSampleDialogClose}
                  className="w-full sm:w-auto"
                >
                  Close Sample View
                </Button>
                <Button
                  onClick={() => {
                    // Copy sample data to clipboard
                    const sampleData = `[
  {
    "name": "Premium Cotton T-Shirt",
    "description": "High-quality cotton t-shirt with modern fit",
    "price": "29.99",
    "sku": "TSHIRT-001",
    "categoryId": 1
  }
]`;
                    navigator.clipboard.writeText(sampleData);
                    toast.success('Basic sample copied to clipboard!');
                    // Close sample dialog and reopen import dialog
                    handleSampleDialogClose();
                  }}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                >
                  Copy Basic Sample
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default ImportDialog;
