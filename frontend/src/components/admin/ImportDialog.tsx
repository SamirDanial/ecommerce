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
        console.error('Error fetching template:', error);
        toast.error('Failed to fetch import template');
      }
    };

    fetchTemplate();
  }, [isOpen, getToken]);

  // Reset all state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      // Small delay to ensure dialog is fully closed before resetting
      const timer = setTimeout(() => {
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
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await processFile(file);
    }
  };

  const processFile = async (file: File) => {
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
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

      if (data.length === 0) {
        toast.error('JSON file contains no products');
        return;
      }

      setProducts(data);
      setCurrentStep('preview');
      toast.success(`Loaded ${data.length} products from file`);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      toast.error('Invalid JSON file. Please check the format.');
    } finally {
      setLoading(false);
    }
  };

  const handleValidation = async () => {
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
    <div className="flex items-center justify-center mb-6">
      {(['upload', 'preview', 'validation', 'execution', 'summary'] as ImportStep[]).map((step, index) => (
        <div key={step} className="flex items-center">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
            getStepStatus(step) === 'completed' ? 'bg-green-500 border-green-500 text-white' :
            getStepStatus(step) === 'current' ? 'bg-blue-500 border-blue-500 text-white' :
            'bg-gray-100 border-gray-300 text-gray-500'
          }`}>
            {getStepStatus(step) === 'completed' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <span className="text-sm font-medium">{index + 1}</span>
            )}
          </div>
          {index < 4 && (
            <div className={`w-16 h-0.5 mx-2 ${
              getStepStatus(step) === 'completed' ? 'bg-green-500' : 'bg-gray-300'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderUploadStep = () => (
    <div className="space-y-6">
      {/* Template Information */}
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600" />
            Import Template & Requirements
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Required Fields</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                {template?.required_fields?.map((field: string) => (
                  <li key={field} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-red-500" />
                    {field}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Optional Fields</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                {template?.optional_fields?.slice(0, 8).map((field: string) => (
                  <li key={field} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-gray-400" />
                    {field}
                  </li>
                ))}
                {template?.optional_fields?.length > 8 && (
                  <li className="text-xs text-gray-500">
                    +{template.optional_fields.length - 8} more fields
                  </li>
                )}
              </ul>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={downloadTemplate}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Template
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentStep('preview')}
              disabled={!template}
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              View Sample Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-lg">Upload JSON File</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div 
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <div className="text-lg font-medium text-gray-900 mb-2">
              Choose a JSON file or drag and drop
            </div>
            <div className="text-sm text-gray-500 mb-4">
              Only JSON files are supported. File should contain an array of product objects.
            </div>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 mx-auto"
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <FileText className="w-4 h-4" />
              Select JSON File
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
        <CardHeader className="p-4">
          <CardTitle className="text-lg">Important Notes</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <ul className="space-y-2 text-sm text-gray-600">
            {template?.notes?.map((note: string, index: number) => (
              <li key={index} className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                {note}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );

  const renderPreviewStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-lg">Data Preview</CardTitle>
          <p className="text-sm text-gray-600">
            Review your data before validation. Found {products.length} products.
          </p>
        </CardHeader>
        <CardContent className="p-4">
          <div className="max-h-60 overflow-y-auto space-y-3">
            {products.slice(0, 5).map((product, index) => (
              <div key={index} className="border rounded-lg p-3 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">
                    {product.name || `Product ${index + 1}`}
                  </h4>
                  <span className="text-xs text-gray-500">
                    #{index + 1}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <div>Price: ${product.price || 'N/A'}</div>
                  <div>Category ID: {product.categoryId || 'N/A'}</div>
                  <div>SKU: {product.sku || 'N/A'}</div>
                  <div>Variants: {product.variants?.length || 0}</div>
                </div>
              </div>
            ))}
            {products.length > 5 && (
              <div className="text-center text-sm text-gray-500 py-2">
                ... and {products.length - 5} more products
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep('upload')}>
          Back to Upload
        </Button>
        <Button onClick={handleValidation} disabled={validating}>
          {validating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Validating...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Validate Data
            </>
          )}
        </Button>
      </div>
    </div>
  );

  const renderValidationStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-lg">Validation Results</CardTitle>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-green-600">
              ✓ {validationResults.filter(r => r.valid).length} Valid
            </span>
            <span className="text-amber-600">
              ⚠ {validationResults.filter(r => r.warnings && r.warnings.length > 0).length} Warnings
            </span>
            <span className="text-red-600">
              ✗ {validationResults.filter(r => !r.valid).length} Invalid
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="max-h-60 overflow-y-auto space-y-3">
            {validationResults.map((result) => (
              <div key={result.index} className={`border rounded-lg p-3 ${
                result.valid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">
                    {result.product.name || `Product ${result.index + 1}`}
                  </h4>
                  {result.valid ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
                {!result.valid && (
                  <div className="space-y-1">
                    {result.errors.map((error, errorIndex) => (
                      <div key={errorIndex} className="text-sm text-red-600 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                      </div>
                    ))}
                  </div>
                )}
                {result.warnings && result.warnings.length > 0 && (
                  <div className="space-y-1 mt-2">
                    {result.warnings.map((warning, warningIndex) => (
                      <div key={warningIndex} className="text-sm text-amber-600 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        {warning}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep('preview')}>
          Back to Preview
        </Button>
        <Button 
          onClick={() => setCurrentStep('execution')}
          disabled={validationResults.filter(r => !r.valid).length > 0}
          className="bg-green-600 hover:bg-green-700"
        >
          Continue to Import
        </Button>
      </div>
    </div>
  );

  const renderExecutionStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-lg">Import Options</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="skipDuplicates"
                checked={importOptions.skipDuplicates}
                onCheckedChange={(checked) => 
                  setImportOptions(prev => ({ ...prev, skipDuplicates: !!checked }))
                }
              />
              <Label htmlFor="skipDuplicates" className="text-sm">
                Skip duplicate products (based on SKU)
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
              <Label htmlFor="updateExisting" className="text-sm">
                Update existing products instead of skipping
              </Label>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-blue-800">
              <Info className="w-4 h-4" />
              <span className="text-sm font-medium">Ready to Import</span>
            </div>
            <p className="text-sm text-blue-700 mt-1">
              {validationResults.filter(r => r.valid).length} products will be imported.
              {importOptions.updateExisting && ' Existing products will be updated.'}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep('validation')}>
          Back to Validation
        </Button>
        <Button 
          onClick={handleImport}
          disabled={importing}
          className="bg-green-600 hover:bg-green-700"
        >
          {importing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Importing...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Start Import
            </>
          )}
        </Button>
      </div>
    </div>
  );

  const renderSummaryStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-lg">Import Summary</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {importResults.filter(r => r.status === 'created').length}
              </div>
              <div className="text-sm text-gray-600">Created</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {importResults.filter(r => r.status === 'updated').length}
              </div>
              <div className="text-sm text-gray-600">Updated</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {importResults.filter(r => r.status === 'skipped').length}
              </div>
              <div className="text-sm text-gray-600">Skipped</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {importResults.filter(r => r.status === 'error').length}
              </div>
              <div className="text-sm text-gray-600">Errors</div>
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-3">
            {importResults.map((result, index) => (
              <div key={index} className={`border rounded-lg p-3 ${
                result.status === 'created' ? 'bg-green-50 border-green-200' :
                result.status === 'updated' ? 'bg-blue-50 border-blue-200' :
                result.status === 'skipped' ? 'bg-yellow-50 border-yellow-200' :
                'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{result.name}</h4>
                    <p className="text-sm text-gray-600">SKU: {result.sku || 'N/A'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      result.status === 'created' ? 'bg-green-100 text-green-800' :
                      result.status === 'updated' ? 'bg-blue-100 text-blue-800' :
                      result.status === 'skipped' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {result.status}
                    </span>
                    {result.status === 'created' && <CheckCircle className="w-4 h-4 text-green-600" />}
                    {result.status === 'updated' && <CheckCircle className="w-4 h-4 text-blue-600" />}
                    {result.status === 'skipped' && <AlertCircle className="w-4 h-4 text-yellow-600" />}
                    {result.status === 'error' && <XCircle className="w-4 h-4 text-red-600" />}
                  </div>
                </div>
                {result.reason && (
                  <p className="text-sm text-gray-600 mt-2">{result.reason}</p>
                )}
                {result.details && (
                  <p className="text-xs text-gray-500 mt-1 font-mono bg-gray-100 p-2 rounded">
                    {result.details}
                  </p>
                )}
                {result.skuChanged && result.originalSku && (
                  <p className="text-sm text-blue-600 mt-2">
                    <span className="font-medium">SKU Changed:</span> {result.originalSku} → {result.sku}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={resetImport}>
          Import Another File
        </Button>
        <Button onClick={onClose}>
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
    <Dialog open={isOpen} onOpenChange={(open) => {
      // Only close if user explicitly closes the dialog
      // Don't close when moving between steps
      if (!open) {
        onClose();
      }
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="mb-4 sm:mb-6">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg">
              <Upload className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            </div>
            Import Products
          </DialogTitle>
          <p className="text-sm sm:text-base text-gray-600">
            Import products from JSON file with comprehensive validation and error handling
          </p>
        </DialogHeader>

        {renderStepIndicator()}
        {renderCurrentStep()}
      </DialogContent>
    </Dialog>
  );
};

export default ImportDialog;
