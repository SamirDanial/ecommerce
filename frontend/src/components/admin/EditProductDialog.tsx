import React, { useState, useEffect } from 'react';
import { Save, Loader2, Edit } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Category, Product, UpdateProductData } from '../../types';
import { toast } from 'sonner';

interface EditProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateProductData) => Promise<void>;
  product: Product | null;
  categories: Category[];
  categoriesLoading?: boolean;
}

export const EditProductDialog: React.FC<EditProductDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  product,
  categories,
  categoriesLoading = false
}) => {
  const [formData, setFormData] = useState<UpdateProductData>({
    id: 0,
    name: '',
    description: '',
    shortDescription: '',
    price: 0,
    comparePrice: 0,
    costPrice: 0,
    categoryId: 0,
    slug: '',
    sku: '',
    barcode: '',
    weight: 0,
    dimensions: '',
    tags: [],
    metaTitle: '',
    metaDescription: '',
    isActive: true,
    isFeatured: false,
    isOnSale: false,
    salePrice: undefined,
    saleEndDate: undefined,
    lowStockThreshold: 5,
    allowBackorder: false
  });

  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');



  // Initialize form data when product changes
  useEffect(() => {
    if (product) {

      setFormData({
        id: product.id,
        name: product.name || '',
        description: product.description || '',
        shortDescription: product.shortDescription || '',
        price: product.price || 0,
        comparePrice: product.comparePrice || 0,
        costPrice: product.costPrice || 0,
        categoryId: product.categoryId || 0,
        slug: product.slug || '',
        sku: product.sku || '',
        barcode: product.barcode || '',
        weight: product.weight || 0,
        dimensions: product.dimensions || '',
        tags: product.tags || [],
        metaTitle: product.metaTitle || '',
        metaDescription: product.metaDescription || '',
        isActive: product.isActive ?? true,
        isFeatured: product.isFeatured ?? false,
        isOnSale: product.isOnSale ?? false,
        salePrice: product.salePrice,
        saleEndDate: product.saleEndDate,
        lowStockThreshold: product.lowStockThreshold || 5,
        allowBackorder: product.allowBackorder ?? false
      });
    }
  }, [product]);

  // Update category when categories are loaded
  useEffect(() => {
    if (product && categories && categories.length > 0 && formData.categoryId) {

      
      // Check if the current categoryId exists in the loaded categories
      const categoryExists = categories.some(cat => cat.id === formData.categoryId);
      if (!categoryExists) {

        setFormData(prev => ({ ...prev, categoryId: 0 }));
      }
    }
  }, [categories]);

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // Auto-generate meta title and description if empty
  const handleNameChange = (name: string) => {
    handleInputChange('name', name);
    
    // Auto-generate slug from name (always generate, even if empty)
    const generatedSlug = generateSlug(name);
    handleInputChange('slug', generatedSlug);
    
    // Auto-generate meta title if empty
    if (!formData.metaTitle) {
      handleInputChange('metaTitle', name);
    }
    
    // Auto-generate meta description if empty
    if (!formData.metaDescription && formData.shortDescription && formData.shortDescription.trim()) {
      handleInputChange('metaDescription', formData.shortDescription);
    }
  };

  const handleInputChange = (field: keyof UpdateProductData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNumberInput = (field: keyof UpdateProductData, value: string) => {
    if (value === '') {
      handleInputChange(field, undefined);
    } else {
      const numValue = parseFloat(value) || 0;
      handleInputChange(field, numValue);
    }
  };

  const handleTagAdd = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      handleInputChange('tags', [...(formData.tags || []), tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    handleInputChange('tags', (formData.tags || []).filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTagAdd();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name?.trim()) {
      toast.error('Product name is required');
      return;
    }

    if (!formData.price || formData.price <= 0) {
      toast.error('Product price must be greater than 0');
      return;
    }

    if (!formData.categoryId) {
      toast.error('Please select a category');
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData);
      toast.success('Product updated successfully!');
      onClose();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    } finally {
      setLoading(false);
    }
  };



  const handleClose = () => {
    if (product) {
      // Reset form to original product data
      setFormData({
        id: product.id,
        name: product.name || '',
        description: product.description || '',
        shortDescription: product.shortDescription || '',
        price: product.price || 0,
        comparePrice: product.comparePrice || 0,
        costPrice: product.costPrice || 0,
        categoryId: product.categoryId || 0,
        slug: product.slug || '',
        sku: product.sku || '',
        barcode: product.barcode || '',
        weight: product.weight || 0,
        dimensions: product.dimensions || '',
        tags: product.tags || [],
        metaTitle: product.metaTitle || '',
        metaDescription: product.metaDescription || '',
        isActive: product.isActive ?? true,
        isFeatured: product.isFeatured ?? false,
        isOnSale: product.isOnSale ?? false,
        salePrice: product.salePrice,
        saleEndDate: product.saleEndDate
      });
    }
    onClose();
  };



  if (!product) return null;

  // Check if we have complete product data (not just minimal data from list view)
  const hasCompleteData = product.description !== undefined && 
                         product.tags !== undefined && 
                         product.variants !== undefined &&
                         product.images !== undefined;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) handleClose();
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="mb-4 sm:mb-6">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
              <Edit className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
            Edit Product
          </DialogTitle>
          <p className="text-sm sm:text-base text-gray-600">
            {hasCompleteData 
              ? "Update product information and settings" 
              : "Loading product details..."
            }
          </p>
        </DialogHeader>

        {/* Loading State for Incomplete Product Data */}
        {!hasCompleteData && (
          <div className="py-8 sm:py-12 flex flex-col items-center justify-center">
            <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-blue-600 mb-3 sm:mb-4" />
            <p className="text-sm sm:text-base text-gray-600 font-medium">Loading product details...</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Please wait while we fetch complete product information</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                Basic Information
                {!hasCompleteData && (
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Enter product name"
                    required
                    disabled={!hasCompleteData}
                    className={!hasCompleteData ? "opacity-60" : ""}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="categoryId">Category *</Label>
                  <Select
                    value={formData.categoryId && formData.categoryId > 0 ? formData.categoryId.toString() : ''}
                    onValueChange={(value) => {
                      const parsedValue = parseInt(value);
                      if (!isNaN(parsedValue)) {
                        handleInputChange('categoryId', parsedValue);
                      }
                    }}
                    disabled={categoriesLoading || !hasCompleteData}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories && categories.length > 0 ? (
                        categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>
                          {categoriesLoading ? 'Loading categories...' : 'No categories available'}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>

                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => handleInputChange('sku', e.target.value)}
                    placeholder="Stock Keeping Unit"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="barcode">Barcode</Label>
                  <Input
                    id="barcode"
                    value={formData.barcode}
                    onChange={(e) => handleInputChange('barcode', e.target.value)}
                    placeholder="Product barcode"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    placeholder="URL-friendly name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortDescription">Short Description</Label>
                <Textarea
                  id="shortDescription"
                  value={formData.shortDescription}
                  onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                  placeholder="Brief product description"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Full Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Detailed product description"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Pricing & Inventory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Regular Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => handleNumberInput('price', e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="comparePrice">Compare Price</Label>
                  <Input
                    id="comparePrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.comparePrice || ''}
                    onChange={(e) => handleNumberInput('comparePrice', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="costPrice">Cost Price</Label>
                  <Input
                    id="costPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.costPrice || ''}
                    onChange={(e) => handleNumberInput('costPrice', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (g)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.weight || ''}
                    onChange={(e) => handleNumberInput('weight', e.target.value)}
                    placeholder="0.0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dimensions">Dimensions</Label>
                  <Input
                    id="dimensions"
                    value={formData.dimensions}
                    onChange={(e) => handleInputChange('dimensions', e.target.value)}
                    placeholder="L x W x H (cm)"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={handleTagInputKeyPress}
                        placeholder="Add a tag"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleTagAdd}
                        className="px-4"
                      >
                        Add
                      </Button>
                    </div>
                    {formData.tags && formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="px-2 py-1 text-sm"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleTagRemove(tag)}
                              className="ml-2 text-gray-500 hover:text-gray-700"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stock Management */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Stock Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-blue-800">Stock Information</span>
                </div>
                <p className="text-sm text-blue-700">
                  Stock is managed at the variant level (size + color combinations). 
                  Each variant can have different stock levels and pricing.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                  <Input
                    id="lowStockThreshold"
                    type="number"
                    min="1"
                    value={formData.lowStockThreshold || 5}
                    onChange={(e) => handleInputChange('lowStockThreshold', parseInt(e.target.value) || 5)}
                    placeholder="5"
                  />
                  <p className="text-xs text-gray-500">
                    Products with stock below this number will show "Low Stock" warning
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="allowBackorder">Allow Backorders</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="allowBackorder"
                      checked={formData.allowBackorder || false}
                      onCheckedChange={(checked) => handleInputChange('allowBackorder', checked)}
                    />
                    <Label htmlFor="allowBackorder" className="text-sm">
                      Allow customers to purchase out-of-stock items
                    </Label>
                  </div>
                  <p className="text-xs text-gray-500">
                    When enabled, out-of-stock variants can still be purchased
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Stock Status Legend</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 p-2 bg-green-50 rounded border">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-700">In Stock</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded border">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-yellow-700">Low Stock</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-red-50 rounded border">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-red-700">Out of Stock</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-orange-50 rounded border">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-sm text-orange-700">Backorder</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sale Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Sale Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isOnSale"
                  checked={formData.isOnSale}
                  onCheckedChange={(checked) => handleInputChange('isOnSale', checked)}
                />
                <Label htmlFor="isOnSale">Enable sale pricing</Label>
              </div>

              {formData.isOnSale && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salePrice">Sale Price</Label>
                    <Input
                      id="salePrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.salePrice || ''}
                      onChange={(e) => handleNumberInput('salePrice', e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="saleEndDate">Sale End Date</Label>
                    <Input
                      id="saleEndDate"
                      type="datetime-local"
                      value={formData.saleEndDate ? new Date(formData.saleEndDate).toISOString().slice(0, 16) : ''}
                      onChange={(e) => handleInputChange('saleEndDate', e.target.value ? new Date(e.target.value) : undefined)}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SEO & Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">SEO & Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input
                    id="metaTitle"
                    value={formData.metaTitle}
                    onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                    placeholder="SEO title for search engines"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Input
                    id="metaDescription"
                    value={formData.metaDescription}
                    onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                    placeholder="SEO description for search engines"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) => handleInputChange('isFeatured', checked)}
                  />
                  <Label htmlFor="isFeatured">Featured</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 sm:flex-none sm:px-8"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !hasCompleteData}
              className="flex-1 sm:flex-none sm:px-8 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Updating...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  <span>Update Product</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
