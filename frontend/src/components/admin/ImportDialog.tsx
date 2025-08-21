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
import { Checkbox } from '../ui/checkbox';
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
    skipDuplicates: true,
    updateExisting: false
  });
  const [dragActive, setDragActive] = useState(false);
  const [showSample, setShowSample] = useState(false);

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

      const validation = await ProductService.validateImport(products, token);
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

      const validProducts = products.filter((_, index) => 
        validationResults[index]?.valid
      );

      if (validProducts.length === 0) {
        toast.error('No valid products to import');
        return;
      }

      const result: ImportResponse = await ProductService.executeImport(validProducts, importOptions, token);
      setImportResults(result.results);
      
      // Ensure we move to summary step
      setCurrentStep('summary');
      console.log('Import completed, moving to summary step');
      
      // Show appropriate message based on import results
      if (result.success) {
        toast.success(result.message || `Import completed! ${result.summary.imported} products imported`);
        onImportComplete?.();
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
    setImportOptions({
      skipDuplicates: true,
      updateExisting: false
    });
    setLoading(false);
    setValidating(false);
    setImporting(false);
    setDragActive(false);
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
              <span className="hidden sm:inline">Download Template</span>
              <span className="sm:hidden">Download</span>
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
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Select JSON File</span>
              <span className="sm:hidden">Select File</span>
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
          <p className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
            <span className="hidden sm:inline">Review your data before validation. Found {products.length} products.</span>
            <span className="sm:hidden">Found {products.length} products</span>
          </p>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          <div className="max-h-60 overflow-y-auto space-y-3">
            {products.slice(0, 5).map((product, index) => (
              <div key={index} className="border rounded-lg p-3 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 text-sm sm:text-base">
                    {product.name || `Product ${index + 1}`}
                  </h4>
                  <span className="text-xs text-gray-500">
                    #{index + 1}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-gray-600">
                  <div>Price: ${product.price || 'N/A'}</div>
                  <div>Category ID: {product.categoryId || 'N/A'}</div>
                  <div>SKU: {product.sku || 'N/A'}</div>
                  <div>Variants: {product.variants?.length || 0}</div>
                </div>
              </div>
            ))}
            {products.length > 5 && (
              <div className="text-center text-xs sm:text-sm text-gray-500 py-2">
                ... and {products.length - 5} more products
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
        <Button variant="outline" onClick={() => setCurrentStep('upload')} className="w-full sm:w-auto order-2 sm:order-1">
          <span className="hidden sm:inline">Back to Upload</span>
          <span className="sm:hidden">Back</span>
        </Button>
        <Button 
          onClick={handleValidation}
          disabled={validating}
          className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto order-1 sm:order-2"
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
          <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-4 text-xs sm:text-sm">
            <span className="text-green-600 bg-green-100 px-2 py-1 rounded-full">
              ✓ {validationResults.filter(r => r.valid).length} Valid
            </span>
            <span className="text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
              ⚠ {validationResults.filter(r => r.warnings && r.warnings.length > 0).length} Warnings
            </span>
            <span className="text-red-600 bg-red-100 px-2 py-1 rounded-full">
              ✗ {validationResults.filter(r => !r.valid).length} Invalid
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          <div className="max-h-60 overflow-y-auto space-y-3">
            {validationResults.map((result) => (
              <div key={result.index} className={`border rounded-lg p-3 ${
                result.valid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 text-sm sm:text-base">
                    {result.product.name || `Product ${result.index + 1}`}
                  </h4>
                  {result.valid ? (
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                  )}
                </div>
                {!result.valid && (
                  <div className="space-y-1">
                    {result.errors.map((error, errorIndex) => (
                      <div key={errorIndex} className="text-xs sm:text-sm text-red-600 flex items-start gap-2">
                        <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" />
                        <span className="break-words leading-relaxed">{error}</span>
                      </div>
                    ))}
                  </div>
                )}
                {result.warnings && result.warnings.length > 0 && (
                  <div className="space-y-1 mt-2">
                    {result.warnings.map((warning, warningIndex) => (
                      <div key={warningIndex} className="text-xs sm:text-sm text-amber-600 flex items-start gap-2">
                        <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" />
                        <span className="break-words leading-relaxed">{warning}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
        <Button variant="outline" onClick={() => setCurrentStep('preview')} className="w-full sm:w-auto order-2 sm:order-1">
          <span className="hidden sm:inline">Back to Preview</span>
          <span className="sm:hidden">Back</span>
        </Button>
        <Button 
          onClick={() => setCurrentStep('execution')}
          disabled={validationResults.filter(r => !r.valid).length > 0}
          className="bg-green-600 hover:bg-green-700 w-full sm:w-auto order-1 sm:order-2"
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
        </CardHeader>
        <CardContent className="p-3 sm:p-4 space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="skipDuplicates"
                checked={importOptions.skipDuplicates}
                onCheckedChange={(checked) => 
                  setImportOptions(prev => ({ ...prev, skipDuplicates: !!checked }))
                }
              />
              <Label htmlFor="skipDuplicates" className="text-xs sm:text-sm">
                <span className="hidden sm:inline">Skip duplicate products (based on SKU)</span>
                <span className="sm:hidden">Skip duplicates (SKU-based)</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="updateExisting"
                checked={importOptions.updateExisting}
                onCheckedChange={(checked) => 
                  setImportOptions(prev => ({ ...prev, updateExisting: !!checked }))
                }
              />
              <Label htmlFor="updateExisting" className="text-xs sm:text-sm">
                <span className="hidden sm:inline">Update existing products instead of skipping</span>
                <span className="sm:hidden">Update existing products</span>
              </Label>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-blue-800">
              <Info className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-medium">Ready to Import</span>
            </div>
            <p className="text-xs sm:text-sm text-blue-700 mt-1">
              <span className="hidden sm:inline">{validationResults.filter(r => r.valid).length} products will be imported.
              {importOptions.updateExisting && ' Existing products will be updated.'}</span>
              <span className="sm:hidden">{validationResults.filter(r => r.valid).length} products ready.
              {importOptions.updateExisting && ' Will update existing.'}</span>
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
        <Button variant="outline" onClick={() => setCurrentStep('validation')} className="w-full sm:w-auto order-2 sm:order-1">
          <span className="hidden sm:inline">Back to Validation</span>
          <span className="sm:hidden">Back</span>
        </Button>
        <Button 
          onClick={handleImport}
          disabled={importing}
          className="bg-green-600 hover:bg-green-700 w-full sm:w-auto order-1 sm:order-2"
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
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">
                {importResults.filter(r => r.status === 'created').length}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Created</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-green-600">
                {importResults.filter(r => r.status === 'updated').length}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Updated</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-yellow-600">
                {importResults.filter(r => r.status === 'skipped').length}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Skipped</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-red-600">
                {importResults.filter(r => r.status === 'error').length}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Errors</div>
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-3">
            {importResults.map((result, index) => (
              <div key={index} className={`border rounded-lg p-3 ${
                result.status === 'created' ? 'bg-green-50 border-green-200' :
                result.status === 'updated' ? 'bg-blue-50 border-green-200' :
                result.status === 'skipped' ? 'bg-yellow-50 border-yellow-200' :
                'bg-red-50 border-red-200'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="text-center sm:text-left">
                    <h4 className="font-medium text-gray-900 text-sm sm:text-base">{result.name}</h4>
                    <p className="text-xs sm:text-sm text-gray-600">SKU: {result.sku || 'N/A'}</p>
                  </div>
                  <div className="flex items-center justify-center sm:justify-end gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      result.status === 'created' ? 'bg-green-100 text-green-800' :
                      result.status === 'updated' ? 'bg-blue-100 text-blue-800' :
                      result.status === 'skipped' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {result.status}
                    </span>
                    {result.status === 'created' && <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />}
                    {result.status === 'updated' && <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />}
                    {result.status === 'skipped' && <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600" />}
                    {result.status === 'error' && <XCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />}
                  </div>
                </div>
                {result.reason && (
                  <p className="text-xs sm:text-sm text-gray-600 mt-2 text-center sm:text-left break-words leading-relaxed">{result.reason}</p>
                )}
                {result.details && (
                  <p className="text-xs text-gray-500 mt-1 font-mono bg-gray-100 p-2 rounded text-center sm:text-left break-words leading-relaxed">
                    {result.details}
                  </p>
                )}
                {result.skuChanged && result.originalSku && (
                  <p className="text-xs sm:text-sm text-blue-600 mt-2 text-center sm:text-left break-words leading-relaxed">
                    <span className="font-medium">SKU Changed:</span> {result.originalSku} → {result.sku}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
        <Button variant="outline" onClick={resetImport} className="w-full sm:w-auto order-2 sm:order-1">
          <span className="hidden sm:inline">Import Another File</span>
          <span className="sm:hidden">Import Another</span>
        </Button>
        <Button onClick={onClose} className="w-full sm:w-auto order-1 sm:order-2">
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
        if (!open) {
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
