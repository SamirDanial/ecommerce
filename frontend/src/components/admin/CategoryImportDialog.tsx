import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  Download, 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Loader2,
  ChevronRight,
  ChevronLeft,
  Info,
  FileJson,
  Eye,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { CategoryService } from '../../services/categoryService';
import { useClerkAuth } from '../../hooks/useClerkAuth';

interface CategoryImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete?: () => void;
}

interface ValidationResult {
  index: number;
  valid: boolean;
  errors: string[];
  warnings: string[];
  data: any;
}

interface ImportResult {
  index: number;
  success: boolean;
  action: 'created' | 'updated' | 'skipped' | 'error' | 'replaced' | 'unknown';
  categoryId: number | null;
  message: string;
  data: any;
  productsImported?: number;
  productsErrors?: number;
}

// Category import template and field information
const CATEGORY_IMPORT_INFO = {
  description: "Category import template. Copy this structure and fill in your data.",
  required_fields: ["name"],
  optional_fields: [
    "slug", "description", "image", "isActive", "sortOrder"
  ],
  sample_data: {
    name: "Electronics",
    slug: "electronics",
    description: "All electronic devices and accessories",
    image: "https://example.com/images/electronics.jpg",
    isActive: true,
    sortOrder: 1
  },
  notes: [
    "Name is the only required field - all others are optional",
    "Slug will be auto-generated from name if not provided",
    "Image URLs should be valid HTTP URLs or relative paths starting with /",
    "isActive defaults to true if not specified",
    "sortOrder will be auto-generated if not provided",
    "Duplicate names will be handled based on your import options",
    "All text fields have length limits (name: 100 chars, description: 500 chars)",
    "Boolean fields accept true/false values only"
  ]
};

// Product field requirements when included in categories
const PRODUCT_IMPORT_INFO = {
  required_fields: ["name", "description", "price"],
  optional_fields: [
    "shortDescription", "comparePrice", "costPrice", "sku", "barcode",
    "weight", "dimensions", "tags", "metaTitle", "metaDescription",
    "isActive", "isFeatured", "isOnSale", "salePrice", "saleEndDate",
    "lowStockThreshold", "allowBackorder", "variants", "images"
  ],
  notes: [
    "categoryId will be automatically set to the parent category if missing",
    "SKU will be auto-generated if not provided or if duplicate exists",
    "Product variants and images will automatically link to the created product",
    "All prices should be numbers (no currency symbols)",
    "Dates should be in ISO format (YYYY-MM-DD)",
    "Boolean fields accept true/false values only"
  ]
};

const CategoryImportDialog: React.FC<CategoryImportDialogProps> = ({
  isOpen,
  onClose,
  onImportComplete
}) => {
  const { getToken } = useClerkAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [importResults, setImportResults] = useState<ImportResult[]>([]);

  const [isImporting, setIsImporting] = useState(false);
  const [importOptions, setImportOptions] = useState({
    skipDuplicates: false,
    updateExisting: false,
    generateSlugs: true,
    generateSortOrder: true,
    importProducts: true,
    existingCategories: 'error' as 'error' | 'skip' | 'replace'
  });
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalSteps = 5;

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setFile(null);
      setCategories([]);
      setValidationResults([]);
      setImportResults([]);
      setIsImporting(false);
      setImportOptions({
        skipDuplicates: false,
        updateExisting: false,
        generateSlugs: true,
        generateSortOrder: true,
        importProducts: true,
        existingCategories: 'error'
      });
    }
  }, [isOpen]);

  const getStepStatus = (step: number) => {
    if (step < currentStep) return 'completed';
    if (step === currentStep) return 'current';
    return 'upcoming';
  };

  const handleFileSelect = useCallback((selectedFile: File) => {
    if (selectedFile.type !== 'application/json' && !selectedFile.name.endsWith('.json')) {
      toast.error('Please select a valid JSON file');
      return;
    }

    setFile(selectedFile);
    readFile(selectedFile);
  }, []);

  const readFile = (selectedFile: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        if (!data.categories || !Array.isArray(data.categories)) {
          toast.error('Invalid file format. File must contain a "categories" array.');
          return;
        }

        console.log('Loaded categories:', data.categories);
        console.log('Categories length:', data.categories.length);
        setCategories(data.categories);
        toast.success(`Successfully loaded ${data.categories.length} categories`);
        setCurrentStep(2);
      } catch (error) {
        toast.error('Failed to parse JSON file. Please check the file format.');
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [handleFileSelect]);

  const handleDownloadTemplate = async () => {
    try {
      const token = await getToken();
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const template = await CategoryService.getImportTemplate(token);
      const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'category-import-template.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Template downloaded successfully');
    } catch (error) {
      toast.error('Failed to download template');
    }
  };

  const handleValidation = async () => {
    if (categories.length === 0) {
      toast.error('No categories to validate');
      return;
    }

    try {
      const token = await getToken();
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const result = await CategoryService.validateImport(categories, token);
      setValidationResults(result.validationResults);
      setCurrentStep(3);
      toast.success(`Validation completed. ${result.summary.valid} valid, ${result.summary.invalid} invalid`);
    } catch (error: any) {
      toast.error(error.message || 'Validation failed');
    }
  };

  // Debug effect to log categories changes
  useEffect(() => {
    console.log('Categories state changed:', categories);
    console.log('Categories length:', categories.length);
  }, [categories]);

  const handleImport = async () => {
    if (validationResults.filter(r => !r.valid).length > 0) {
      toast.error('Cannot proceed with invalid data. Please fix validation errors first.');
      return;
    }

    setIsImporting(true);
    try {
      const token = await getToken();
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const validCategories = categories.filter((_, index) => 
        validationResults[index]?.valid
      );

      const result = await CategoryService.executeImport(validCategories, importOptions, token);
      
      if (result.success) {
        // Success - show results and let admin review
        setImportResults(result.results);
        setCurrentStep(5);
        toast.success(result.message || `Import completed! ${result.summary.imported} categories imported`);
        // Don't call onImportComplete here as it resets the dialog state
      } else {
        // Handle specific error cases
        if (result.message && (result.message.includes('already exists') || result.message.includes('Import stopped due to existing categories'))) {
          // Error & Stop case - show detailed error and stay on current step
          toast.error('Import stopped: Existing categories found', {
            description: result.message,
            duration: 10000 // Show for 10 seconds
          });
          
          // Show the error in the current step with clear instructions
          setValidationResults([{
            index: 0,
            valid: false,
            errors: [
              'Import cannot proceed due to existing categories.',
              'Please change the "Existing Category Handling" option to:',
              '• "Keep Categories, Import New Products" to skip existing categories, or',
              '• "Replace Categories & Products" to remove existing categories and import fresh'
            ],
            warnings: [],
            data: categories[0]
          }]);
          
          // Stay on current step to let user change options
          toast.info('Please change your import options and try again', {
            duration: 8000
          });
        } else {
          // Other errors - show warning for partial success or error
          if (result.summary.imported > 0) {
            toast.warning(result.message || `Import completed with mixed results. ${result.summary.imported} imported, ${result.summary.errors} failed.`);
          } else {
            toast.error(result.message || `Import failed! ${result.summary.errors} categories failed to import.`);
          }
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Import failed');
    } finally {
      setIsImporting(false);
    }
  };

  const canProceedToValidation = categories.length > 0;
  const canProceedToImport = validationResults.length > 0 && validationResults.filter(r => !r.valid).length === 0;
  const hasWarnings = validationResults.some(r => r.warnings.length > 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-screen sm:w-[95vw] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="mb-4 sm:mb-6">
          <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
            <FileJson className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="hidden sm:inline">Import Categories</span>
            <span className="sm:hidden">Import</span>
          </DialogTitle>
        </DialogHeader>

        {/* Step Indicators - Mobile-friendly */}
        <div className="flex items-center justify-center sm:justify-between mb-4 sm:mb-6 gap-2 sm:gap-0">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
            <div key={step} className="flex items-center">
              <div className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 ${
                getStepStatus(step) === 'completed' 
                  ? 'bg-green-500 border-green-500 text-white' 
                  : getStepStatus(step) === 'current'
                  ? 'bg-blue-500 border-blue-500 text-white'
                  : 'bg-gray-200 border-gray-300 text-gray-500'
              }`}>
                {getStepStatus(step) === 'completed' ? (
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <span className="text-xs sm:text-sm font-medium">{step}</span>
                )}
              </div>
              {step < totalSteps && (
                <ChevronRight className={`w-3 h-3 sm:w-4 sm:h-4 mx-1 sm:mx-2 ${
                  getStepStatus(step) === 'completed' ? 'text-green-500' : 'text-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        {currentStep === 1 && (
          <div className="space-y-4 sm:space-y-6">
            {/* Template Information */}
            <Card>
              <CardHeader className="p-3 sm:p-4">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  <span className="hidden sm:inline">Import Template & Requirements</span>
                  <span className="sm:hidden">Template & Requirements</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Required Fields</h4>
                    <ul className="space-y-1 text-xs sm:text-sm text-gray-600">
                      {CATEGORY_IMPORT_INFO.required_fields.map((field: string) => (
                        <li key={field} className="flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                          {field}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Optional Fields</h4>
                    <ul className="space-y-1 text-xs sm:text-sm text-gray-600">
                      {CATEGORY_IMPORT_INFO.optional_fields.map((field: string) => (
                        <li key={field} className="flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                          {field}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    onClick={handleDownloadTemplate}
                    className="flex items-center gap-2 h-10 sm:h-9"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Download Template</span>
                    <span className="sm:hidden">Download</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(2)}
                    disabled={categories.length === 0}
                    className="flex items-center gap-2 h-10 sm:h-9"
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
                <CardTitle className="text-base sm:text-lg">Upload JSON File</CardTitle>
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
                    <span className="sm:hidden">Choose a JSON file</span>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                    <span className="hidden sm:inline">Only JSON files are supported. File should contain a "categories" array.</span>
                    <span className="sm:hidden">JSON files with "categories" array</span>
                  </div>
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2 mx-auto h-10 sm:h-9"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FileText className="w-4 h-4" />
                    <span className="hidden sm:inline">Select JSON File</span>
                    <span className="sm:hidden">Select File</span>
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,application/json"
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                    className="hidden"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Import Notes */}
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-lg">Important Notes</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ul className="space-y-2 text-sm text-gray-600">
                  {CATEGORY_IMPORT_INFO.notes.map((note: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      {note}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Product Requirements (when products are included) */}
            <Card>
              <CardHeader className="p-3 sm:p-4">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  <span className="hidden sm:inline">Product Requirements (When Including Products)</span>
                  <span className="sm:hidden">Product Requirements</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Required Fields</h4>
                    <ul className="space-y-1 text-xs sm:text-sm text-gray-600">
                      {PRODUCT_IMPORT_INFO.required_fields.map((field: string) => (
                        <li key={field} className="flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                          {field}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Optional Fields</h4>
                    <ul className="space-y-1 text-xs sm:text-sm text-gray-600">
                      {PRODUCT_IMPORT_INFO.optional_fields.slice(0, 8).map((field: string) => (
                        <li key={field} className="flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                          {field}
                        </li>
                      ))}
                      {PRODUCT_IMPORT_INFO.optional_fields.length > 8 && (
                        <li className="text-xs text-gray-500">
                          +{PRODUCT_IMPORT_INFO.optional_fields.length - 8} more fields
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Product Notes</h4>
                  <ul className="space-y-1 text-xs sm:text-sm text-gray-600">
                    {PRODUCT_IMPORT_INFO.notes.map((note: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {file && (
              <Card>
                <CardContent className="p-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-800">{file.name}</span>
                      <span className="text-green-600">({(file.size / 1024).toFixed(1)} KB)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <h3 className="text-base sm:text-lg font-semibold">Data Preview</h3>
              <Badge variant="secondary" className="text-xs">{categories.length} categories loaded</Badge>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-3">
              {categories.slice(0, 10).map((category, index) => (
                <div key={index} className="border rounded-lg p-3 sm:p-4 bg-white hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                    {/* Name and Status Row */}
                    <div className="flex items-center justify-between sm:justify-start gap-3">
                      <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate flex-1">
                        {category.name || 'N/A'}
                      </h4>
                      <Badge variant={category.isActive ? 'default' : 'secondary'} className="text-xs flex-shrink-0">
                        {category.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    
                    {/* Slug Row */}
                    <div className="text-xs sm:text-sm text-gray-600 font-mono">
                      <span className="text-gray-500 text-xs">Slug:</span> {category.slug || 'Auto-generated'}
                    </div>
                    
                    {/* Description Row - Hidden on mobile */}
                    <div className="hidden sm:block text-sm text-gray-600">
                      <span className="text-gray-500 text-xs">Description:</span> {category.description || 'No description'}
                    </div>
                  </div>
                </div>
              ))}
              
              {categories.length > 10 && (
                <div className="text-center py-3 text-sm text-gray-500 border-t">
                  <span className="hidden sm:inline">... and {categories.length - 10} more categories</span>
                  <span className="sm:hidden">+{categories.length - 10} more</span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(1)} className="w-full sm:w-auto">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button onClick={handleValidation} disabled={!canProceedToValidation} className="w-full sm:w-auto">
                <span className="hidden sm:inline">Continue to Validation</span>
                <span className="sm:hidden">Continue</span>
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-3 sm:space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-base sm:text-lg font-semibold text-center sm:text-left">Validation Results</h3>
              <div className="flex justify-center sm:justify-start gap-2 sm:gap-4">
                <Badge variant="default" className="text-xs px-2 py-1">
                  ✓ {validationResults.filter(r => r.valid).length} Valid
                </Badge>
                <Badge variant="destructive" className="text-xs px-2 py-1">
                  ✗ {validationResults.filter(r => !r.valid).length} Invalid
                </Badge>
                {hasWarnings && (
                  <Badge variant="secondary" className="text-xs px-2 py-1">
                    ⚠ {validationResults.reduce((sum, r) => sum + r.warnings.length, 0)} Warnings
                  </Badge>
                )}
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2 sm:space-y-4">
              {validationResults.map((result, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-3 sm:p-4 ${
                    result.valid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {result.valid ? (
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col gap-2 mb-2 sm:flex-row sm:items-center">
                        <span className="font-medium text-gray-900 text-sm sm:text-base text-center sm:text-left">
                          Category {index + 1}: {result.data.name || 'Unnamed'}
                        </span>
                        <Badge variant={result.valid ? 'default' : 'destructive'} className="text-xs self-center sm:self-start">
                          {result.valid ? 'Valid' : 'Invalid'}
                        </Badge>
                      </div>

                      {result.errors.length > 0 && (
                        <div className="space-y-1 mb-2">
                          {result.errors.map((error, errorIndex) => (
                            <div key={errorIndex} className="text-xs sm:text-sm text-red-600 flex items-start gap-2">
                              <XCircle className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" />
                              <span className="leading-relaxed">{error}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {result.warnings.length > 0 && (
                        <div className="space-y-1">
                          {result.warnings.map((warning, warningIndex) => (
                            <div key={warningIndex} className="text-xs sm:text-sm text-amber-600 flex items-start gap-2">
                              <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" />
                              <span className="leading-relaxed">{warning}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(2)} className="w-full sm:w-auto order-2 sm:order-1">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button 
                onClick={() => setCurrentStep(4)} 
                disabled={!canProceedToImport}
                className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto order-1 sm:order-2"
              >
                <span className="hidden sm:inline">Continue to Import Options</span>
                <span className="sm:hidden">Continue</span>
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-3 sm:space-y-6">
            <div className="text-center sm:text-left">
              <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4">Import Options</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-6">
                <span className="hidden sm:inline">Configure how the import should handle existing categories and generate missing data.</span>
                <span className="sm:hidden">Configure import handling for existing categories.</span>
              </p>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="importProducts"
                  checked={importOptions.importProducts}
                  onCheckedChange={(checked) => 
                    setImportOptions(prev => ({ ...prev, importProducts: checked as boolean }))
                  }
                  className="mt-1 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <Label htmlFor="importProducts" className="text-sm font-medium">
                    Import products within categories
                  </Label>
                </div>
                <Info className="w-4 h-4 text-gray-400 flex-shrink-0" />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium text-center sm:text-left">Existing Category Handling:</Label>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      id="existingCategoriesError"
                      name="existingCategories"
                      value="error"
                      checked={importOptions.existingCategories === 'error'}
                      onChange={(e) => setImportOptions(prev => ({ 
                        ...prev, 
                        existingCategories: e.target.value as 'error' | 'skip' | 'replace' 
                      }))}
                      className="mt-1 flex-shrink-0"
                    />
                    <Label htmlFor="existingCategoriesError" className="text-xs sm:text-sm flex-1">
                      <span className="hidden sm:inline">❌ Error & Stop - Don't allow import if categories exist</span>
                      <span className="sm:hidden">❌ Error & Stop</span>
                    </Label>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      id="existingCategoriesSkip"
                      name="existingCategories"
                      value="skip"
                      checked={importOptions.existingCategories === 'skip'}
                      onChange={(e) => setImportOptions(prev => ({ 
                        ...prev, 
                        existingCategories: e.target.value as 'error' | 'skip' | 'replace' 
                      }))}
                      className="mt-1 flex-shrink-0"
                    />
                    <Label htmlFor="existingCategoriesSkip" className="text-xs sm:text-sm flex-1">
                      <span className="hidden sm:inline">🔄 Keep Categories, Import New Products - Skip existing categories, only import products that don't exist</span>
                      <span className="sm:hidden">🔄 Keep Categories, Import New Products</span>
                    </Label>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      id="existingCategoriesReplace"
                      name="existingCategories"
                      value="replace"
                      checked={importOptions.existingCategories === 'replace'}
                      onChange={(e) => setImportOptions(prev => ({ 
                        ...prev, 
                        existingCategories: e.target.value as 'error' | 'skip' | 'replace' 
                      }))}
                      className="mt-1 flex-shrink-0"
                    />
                    <Label htmlFor="existingCategoriesReplace" className="text-xs sm:text-sm flex-1">
                      <span className="hidden sm:inline">🗑️ Replace Categories & Products - Remove existing categories and all their products, then import everything fresh</span>
                      <span className="sm:hidden">🗑️ Replace Categories & Products</span>
                    </Label>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="skipDuplicates"
                  checked={importOptions.skipDuplicates}
                  onCheckedChange={(checked) => 
                    setImportOptions(prev => ({ ...prev, skipDuplicates: checked as boolean }))
                  }
                  className="mt-1 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <Label htmlFor="skipDuplicates" className="text-sm font-medium">
                    Skip duplicate products (when keeping existing categories)
                  </Label>
                </div>
                <Info className="w-4 h-4 text-gray-400 flex-shrink-0" />
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="updateExisting"
                  checked={importOptions.updateExisting}
                  onCheckedChange={(checked) => 
                    setImportOptions(prev => ({ ...prev, updateExisting: checked as boolean }))
                  }
                  className="mt-1 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <Label htmlFor="updateExisting" className="text-sm font-medium">
                    Update existing categories
                  </Label>
                </div>
                <Info className="w-4 h-4 text-gray-400 flex-shrink-0" />
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="generateSlugs"
                  checked={importOptions.generateSlugs}
                  onCheckedChange={(checked) => 
                    setImportOptions(prev => ({ ...prev, generateSlugs: checked as boolean }))
                  }
                  className="mt-1 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <Label htmlFor="generateSlugs" className="text-sm font-medium">
                    Auto-generate slugs for missing values
                  </Label>
                </div>
                <Info className="w-4 h-4 text-gray-400 flex-shrink-0" />
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="generateSortOrder"
                  checked={importOptions.generateSortOrder}
                  onCheckedChange={(checked) => 
                    setImportOptions(prev => ({ ...prev, generateSortOrder: checked as boolean }))
                  }
                  className="mt-1 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <Label htmlFor="generateSortOrder" className="text-sm font-medium">
                    Auto-generate sort order for missing values
                </Label>
                </div>
                <Info className="w-4 h-4 text-gray-400 flex-shrink-0" />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs sm:text-sm text-blue-800 flex-1">
                  <p className="font-medium mb-2 text-center sm:text-left">Import Summary:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center sm:text-left">
                    <div className="bg-blue-100 rounded px-2 py-1">
                      <span className="font-medium">{categories.length}</span> Total
                    </div>
                    <div className="bg-green-100 rounded px-2 py-1">
                      <span className="font-medium">{validationResults.filter(r => r.valid).length}</span> Valid
                    </div>
                    <div className="bg-amber-100 rounded px-2 py-1">
                      <span className="font-medium">{validationResults.filter(r => r.warnings.length > 0).length}</span> Warnings
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(3)} className="w-full sm:w-auto order-2 sm:order-1">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button 
                onClick={handleImport}
                disabled={isImporting}
                className="bg-green-600 hover:bg-green-700 w-full sm:w-auto order-1 sm:order-2"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span className="hidden sm:inline">Importing...</span>
                    <span className="sm:hidden">Importing...</span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">Start Import</span>
                    <span className="sm:hidden">Start Import</span>
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="space-y-3 sm:space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-base sm:text-lg font-semibold text-center sm:text-left">Import Results</h3>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-4">
                <Badge variant="default" className="text-xs px-2 py-1">
                  ✓ {importResults.filter(r => r.success && r.action === 'created').length} Created
                </Badge>
                <Badge variant="secondary" className="text-xs px-2 py-1">
                  ↻ {importResults.filter(r => r.success && r.action === 'updated').length} Updated
                </Badge>
                <Badge variant="outline" className="text-xs px-2 py-1">
                  ⏭ {importResults.filter(r => r.action === 'skipped').length} Skipped
                </Badge>
                <Badge variant="destructive" className="text-xs px-2 py-1">
                  🗑️ {importResults.filter(r => r.success && r.action === 'replaced').length} Replaced
                </Badge>
                <Badge variant="destructive" className="text-xs px-2 py-1">
                  ✗ {importResults.filter(r => !r.success).length} Errors
                </Badge>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4 mb-4">
              <h4 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base text-center sm:text-left">Import Summary</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                <div className="text-center bg-green-100 rounded-lg p-2">
                  <div className="text-lg sm:text-2xl font-bold text-green-600">
                    {importResults.filter(r => r.success && r.action === 'created').length}
                  </div>
                  <div className="text-gray-600 text-xs">Created</div>
                </div>
                <div className="text-center bg-blue-100 rounded-lg p-2">
                  <div className="text-lg sm:text-2xl font-bold text-blue-600">
                    {importResults.filter(r => r.success && r.action === 'updated').length}
                  </div>
                  <div className="text-gray-600 text-xs">Updated</div>
                </div>
                <div className="text-center bg-orange-100 rounded-lg p-2">
                  <div className="text-lg sm:text-2xl font-bold text-orange-600">
                    {importResults.filter(r => r.action === 'skipped').length}
                  </div>
                  <div className="text-gray-600 text-xs">Skipped</div>
                </div>
                <div className="text-center bg-red-100 rounded-lg p-2">
                  <div className="text-lg sm:text-2xl font-bold text-red-600">
                    {importResults.filter(r => r.success && r.action === 'replaced').length}
                  </div>
                  <div className="text-gray-600 text-xs">Replaced</div>
                </div>
              </div>
              
              {/* Product Import Summary */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h5 className="font-medium text-gray-900 mb-3 text-center text-sm sm:text-base">Product Import Summary</h5>
                <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                  <div className="text-center bg-green-100 rounded-lg p-2">
                    <div className="text-lg sm:text-xl font-bold text-green-600">
                      {importResults.reduce((sum, r) => sum + (r.productsImported || 0), 0)}
                    </div>
                    <div className="text-gray-600 text-xs">Products Imported</div>
                  </div>
                  <div className="text-center bg-red-100 rounded-lg p-2">
                    <div className="text-lg sm:text-xl font-bold text-red-600">
                      {importResults.reduce((sum, r) => sum + (r.productsErrors || 0), 0)}
                    </div>
                    <div className="text-gray-600 text-xs">Product Errors</div>
                  </div>
                </div>
              </div>
              
              {importResults.some(r => !r.success) && (
                <div className="mt-3 text-center bg-red-100 rounded-lg p-2">
                  <div className="text-2xl font-bold text-red-600">
                    {importResults.filter(r => !r.success).length}
                  </div>
                  <div className="text-gray-600 text-xs">Errors</div>
                </div>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto space-y-3 sm:space-y-4">
              {importResults.map((result, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-3 sm:p-4 ${
                    result.success 
                      ? result.action === 'created' 
                        ? 'border-green-200 bg-green-50'
                        : 'border-blue-200 bg-blue-50'
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {result.success ? (
                        result.action === 'created' ? (
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                        ) : (
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                        )
                      ) : (
                        <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col gap-2 mb-2 sm:flex-row sm:items-center">
                        <span className="font-medium text-gray-900 text-sm sm:text-base text-center sm:text-left">
                          Category {index + 1}: {result.data.name || 'Unnamed'}
                        </span>
                        <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                          <Badge variant={
                            result.success 
                              ? result.action === 'created' 
                                ? 'default'
                                : result.action === 'replaced'
                                ? 'destructive'
                                : 'secondary'
                              : 'destructive'
                          } className="text-xs">
                            {result.action === 'created' ? 'Created' : 
                             result.action === 'updated' ? 'Updated' :
                             result.action === 'replaced' ? 'Replaced' :
                             result.action === 'skipped' ? 'Skipped' : 'Error'}
                          </Badge>
                          {result.categoryId && (
                            <Badge variant="outline" className="text-xs">ID: {result.categoryId}</Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 text-center sm:text-left">{result.message}</p>
                      
                      {/* Show product import details */}
                      {((result.productsImported && result.productsImported > 0) || (result.productsErrors && result.productsErrors > 0)) && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm font-medium text-gray-700 mb-2 text-center sm:text-left">Product Import Summary:</div>
                          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm">
                            {result.productsImported && result.productsImported > 0 && (
                              <div className="flex items-center justify-center sm:justify-start gap-1 text-green-600">
                                <CheckCircle className="w-4 h-4" />
                                <span>{result.productsImported} products imported</span>
                              </div>
                            )}
                            {result.productsErrors && result.productsErrors > 0 && (
                              <div className="flex items-center justify-center sm:justify-start gap-1 text-red-600">
                                <XCircle className="w-4 h-4" />
                                <span>{result.productsErrors} product errors</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Show additional details for different actions */}
                      {result.action === 'skipped' && (
                        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700 text-center sm:text-left">
                          ℹ️ Category already exists - products will be imported if they don't exist
                        </div>
                      )}
                      
                      {result.action === 'replaced' && (
                        <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-sm text-orange-700 text-center sm:text-left">
                          🔄 Category and all products replaced with fresh data
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center sm:justify-end">
              <Button 
                onClick={() => {
                  // Refresh categories section first
                  if (onImportComplete) {
                    onImportComplete();
                  }
                  // Then close the dialog
                  onClose();
                }} 
                variant="outline" 
                className="bg-transparent hover:bg-gray-50 w-full sm:w-auto"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CategoryImportDialog;
