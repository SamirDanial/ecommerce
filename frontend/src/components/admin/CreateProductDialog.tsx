import React, { useState } from 'react';
import { X, Plus, Save, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Category, CreateProductData } from '../../types';
import { toast } from 'sonner';

interface CreateProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProductData) => Promise<void>;
  categories: Category[];
  categoriesLoading?: boolean;
}

export const CreateProductDialog: React.FC<CreateProductDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  categories,
  categoriesLoading = false
}) => {
  // Debug logging
  console.log('CreateProductDialog - categories received:', categories);
  console.log('CreateProductDialog - categories length:', categories?.length);
  console.log('CreateProductDialog - categories type:', typeof categories);
  const [formData, setFormData] = useState<CreateProductData>({
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
    saleEndDate: undefined
  });

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

  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const handleInputChange = (field: keyof CreateProductData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNumberInput = (field: keyof CreateProductData, value: string) => {
    if (value === '') {
      handleInputChange(field, undefined);
    } else {
      const numValue = parseFloat(value) || 0;
      handleInputChange(field, numValue);
    }
  };

  const handleTagAdd = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      handleInputChange('tags', [...formData.tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return;
    }
    
    if (!formData.categoryId) {
      toast.error('Please select a category');
      return;
    }
    
    if (!formData.slug?.trim()) {
      toast.error('Slug is required');
      return;
    }
    
    if (formData.price <= 0) {
      toast.error('Price must be greater than 0');
      return;
    }

    if (formData.isOnSale && formData.salePrice && formData.salePrice >= formData.price) {
      toast.error('Sale price must be less than regular price');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      toast.success('Product created successfully!');
      onClose();
      // Reset form
      setFormData({
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
        saleEndDate: undefined
      });
    } catch (error) {
      toast.error('Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Create New Product</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Enter product name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  {categoriesLoading ? (
                    <div className="space-y-2">
                      <Select disabled>
                        <SelectTrigger>
                          <SelectValue placeholder="Loading categories..." />
                        </SelectTrigger>
                      </Select>
                      <p className="text-xs text-gray-500">Loading categories...</p>
                    </div>
                  ) : categories && categories.length > 0 ? (
                    <Select
                      value={formData.categoryId.toString()}
                      onValueChange={(value) => handleInputChange('categoryId', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="space-y-2">
                      <Select disabled>
                        <SelectTrigger>
                          <SelectValue placeholder="No categories available" />
                        </SelectTrigger>
                      </Select>
                      <p className="text-xs text-red-500">
                        No categories found. Please create categories first.
                      </p>
                    </div>
                  )}
                  
                  {/* Debug info */}
                  <div className="text-xs text-gray-500">
                    Categories loaded: {categories?.length || 0}
                    {categoriesLoading && ' (loading...)'}
                  </div>
                </div>
              </div>

              {/* Slug Field */}
              <div className="space-y-2">
                <Label htmlFor="slug">Product Slug</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="slug"
                    value={formData.slug || ''}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    className="font-mono text-sm"
                    placeholder={formData.name ? generateSlug(formData.name) : "Enter product name first"}
                  />
                  {formData.name && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newSlug = generateSlug(formData.name);
                        handleInputChange('slug', newSlug);
                      }}
                      className="px-3"
                    >
                      Regenerate
                    </Button>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  This will be used in the product URL. {formData.name ? 'You can edit it manually or regenerate from the product name.' : 'Slug will be auto-generated when you enter a product name.'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortDescription">Short Description</Label>
                <Textarea
                  id="shortDescription"
                  value={formData.shortDescription || ''}
                  onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                  placeholder="Brief product description (recommended: 150 characters)"
                  rows={2}
                  maxLength={200}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Used for product previews and meta descriptions</span>
                  <span>{(formData.shortDescription || '').length}/200</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Full Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Detailed product description (recommended: 500+ characters)"
                  rows={4}
                  maxLength={2000}
                  required
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Detailed product information for customers</span>
                  <span>{formData.description.length}/2000</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    value={formData.comparePrice}
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
                    value={formData.costPrice}
                    onChange={(e) => handleNumberInput('costPrice', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isOnSale"
                  checked={formData.isOnSale}
                  onCheckedChange={(checked) => handleInputChange('isOnSale', checked)}
                />
                <Label htmlFor="isOnSale">Enable Sale Price</Label>
              </div>

              {formData.isOnSale && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salePrice">Sale Price</Label>
                    <Input
                      id="salePrice"
                      type="number"
                      step="0.01"
                      min="0"
                      max={formData.price > 0 ? formData.price - 0.01 : undefined}
                      value={formData.salePrice || ''}
                      onChange={(e) => handleNumberInput('salePrice', e.target.value)}
                      placeholder="0.00"
                      className={formData.salePrice && formData.salePrice >= formData.price ? 'border-red-500' : ''}
                    />
                    {formData.salePrice && formData.salePrice >= formData.price && (
                      <p className="text-xs text-red-500">Sale price must be less than regular price</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="saleEndDate">Sale End Date</Label>
                    <Input
                      id="saleEndDate"
                      type="date"
                      value={formData.saleEndDate || ''}
                      onChange={(e) => handleInputChange('saleEndDate', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Product Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={formData.sku || ''}
                    onChange={(e) => handleInputChange('sku', e.target.value)}
                    placeholder="Stock Keeping Unit"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="barcode">Barcode</Label>
                  <Input
                    id="barcode"
                    value={formData.barcode || ''}
                    onChange={(e) => handleInputChange('barcode', e.target.value)}
                    placeholder="Product barcode"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.weight}
                    onChange={(e) => handleNumberInput('weight', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dimensions">Dimensions</Label>
                  <Input
                    id="dimensions"
                    value={formData.dimensions || ''}
                    onChange={(e) => handleInputChange('dimensions', e.target.value)}
                    placeholder="L x W x H (cm)"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add a tag"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleTagAdd())}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleTagAdd}
                    className="px-3"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map(tag => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="cursor-pointer hover:bg-red-100"
                        onClick={() => handleTagRemove(tag)}
                      >
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* SEO & Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">SEO & Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  value={formData.metaTitle || ''}
                  onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                  placeholder="SEO title for search engines"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={formData.metaDescription || ''}
                  onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                  placeholder="SEO description for search engines"
                  rows={3}
                />
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

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Product
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
