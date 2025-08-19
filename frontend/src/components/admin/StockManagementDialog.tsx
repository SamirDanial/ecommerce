import React, { useState, useEffect, useCallback } from 'react';
import { X, Save, Loader2, Package, Plus, Minus } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Product, ProductVariant } from '../../types';
import { getVariantStockStatus, getStockStatusBadgeVariant, getStockStatusColor } from '../../utils/stockUtils';
import { ProductService } from '../../services/productService';
import { useAuth } from '@clerk/clerk-react';
import { toast } from 'sonner';

interface StockManagementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    productId: number;
    lowStockThreshold: number;
    allowBackorder: boolean;
    variants: Array<{
      id: number;
      stock: number;
      lowStockThreshold: number;
      allowBackorder: boolean;
    }>;
  }) => Promise<void>;
  product: Product | null;
}

export const StockManagementDialog: React.FC<StockManagementDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  product
}) => {
  const [formData, setFormData] = useState({
    productId: 0,
    lowStockThreshold: 5,
    allowBackorder: false,
    variants: [] as Array<{
      id: number;
      stock: number;
      lowStockThreshold: number;
      allowBackorder: boolean;
    }>
  });

  const [loading, setLoading] = useState(false);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [variantsLoading, setVariantsLoading] = useState(false);
  const { getToken } = useAuth();

  const loadVariants = useCallback(async () => {
    if (!product) return;
    
    try {
      setVariantsLoading(true);
      const token = await getToken();
      if (!token) throw new Error('No authentication token');

      const variantsData = await ProductService.getProductVariants(product.id, token);
      setVariants(variantsData);
      
      // Update form data with loaded variants
      setFormData(prev => ({
        ...prev,
        variants: variantsData.map(variant => ({
          id: variant.id,
          stock: variant.stock,
          lowStockThreshold: variant.lowStockThreshold || 3,
          allowBackorder: variant.allowBackorder || false
        }))
      }));
    } catch (error) {
      console.error('Error loading variants:', error);
      toast.error('Failed to load product variants');
    } finally {
      setVariantsLoading(false);
    }
  }, [product, getToken]);

  // Load variants when dialog opens
  useEffect(() => {
    if (isOpen && product) {
      loadVariants();
    }
  }, [isOpen, product, loadVariants]);

  // Initialize form data when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        productId: product.id,
        lowStockThreshold: product.lowStockThreshold || 5,
        allowBackorder: product.allowBackorder || false,
        variants: []
      });
    }
  }, [product]);

  const handleProductThresholdChange = (value: string) => {
    const numValue = parseInt(value) || 5;
    setFormData(prev => ({
      ...prev,
      lowStockThreshold: numValue
    }));
  };

  const handleProductBackorderChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      allowBackorder: checked
    }));
  };

  const handleVariantStockChange = (variantId: number, value: string) => {
    const numValue = Math.max(0, parseInt(value) || 0);
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map(v => 
        v.id === variantId 
          ? { ...v, stock: numValue }
          : v
      )
    }));
  };

  const handleVariantThresholdChange = (variantId: number, value: string) => {
    const numValue = parseInt(value) || 3;
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map(v => 
        v.id === variantId 
          ? { ...v, lowStockThreshold: numValue }
          : v
      )
    }));
  };

  const handleVariantBackorderChange = (variantId: number, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map(v => 
        v.id === variantId 
          ? { ...v, allowBackorder: checked }
          : v
      )
    }));
  };

  const adjustStock = (variantId: number, delta: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map(v => 
        v.id === variantId 
          ? { ...v, stock: Math.max(0, v.stock + delta) }
          : v
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error updating stock:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalStock = formData.variants.reduce((sum, v) => sum + v.stock, 0);
  const lowStockCount = formData.variants.filter(v => v.stock <= v.lowStockThreshold && v.stock > 0).length;
  const outOfStockCount = formData.variants.filter(v => v.stock === 0).length;

  if (!product || !product.variants) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${isOpen ? 'block' : 'hidden'}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl mx-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Stock Manager</h2>
                <p className="text-sm text-gray-600">{product.name}</p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="text-center">
                  <div className="font-bold text-lg text-blue-600">{totalStock}</div>
                  <div className="text-gray-500">Total</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg text-gray-600">{variants.length}</div>
                  <div className="text-gray-500">Variants</div>
                </div>
                {lowStockCount > 0 && (
                  <div className="text-center">
                    <div className="font-bold text-lg text-yellow-600">{lowStockCount}</div>
                    <div className="text-gray-500">Low</div>
                  </div>
                )}
                {outOfStockCount > 0 && (
                  <div className="text-center">
                    <div className="font-bold text-lg text-red-600">{outOfStockCount}</div>
                    <div className="text-gray-500">Out</div>
                  </div>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Quick Settings */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Low Stock Alert</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.lowStockThreshold}
                  onChange={(e) => handleProductThresholdChange(e.target.value)}
                  className="mt-1 h-9"
                />
              </div>
              
              <div className="flex items-center space-x-2 pt-6">
                <Checkbox
                  checked={formData.allowBackorder}
                  onCheckedChange={handleProductBackorderChange}
                />
                <Label className="text-sm">Allow backorders when out of stock</Label>
              </div>
            </div>
          </div>

          {/* Variants */}
          <div className="space-y-3">
            {variantsLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">Loading variants...</p>
              </div>
            ) : variants.length > 0 && formData.variants.length > 0 ? (
              formData.variants.map((variantData) => {
                const originalVariant = variants.find(v => v.id === variantData.id);
                if (!originalVariant) return null;
                
                const stockStatus = getVariantStockStatus({
                  ...originalVariant,
                  stock: variantData.stock,
                  lowStockThreshold: variantData.lowStockThreshold,
                  allowBackorder: variantData.allowBackorder
                } as ProductVariant);
                
                return (
                  <div key={variantData.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* Variant Info */}
                      <div className="col-span-2">
                        <div className="font-medium text-gray-900 text-sm">
                          {originalVariant.size}
                        </div>
                        <div className="text-sm text-gray-600">
                          {originalVariant.color}
                        </div>
                      </div>
                      
                      {/* Status Badge */}
                      <div className="col-span-2">
                        <Badge 
                          variant={getStockStatusBadgeVariant(stockStatus.status)}
                          className={`text-xs ${getStockStatusColor(stockStatus.status)}`}
                        >
                          {stockStatus.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      {/* Stock Controls */}
                      <div className="col-span-3">
                        <Label className="text-xs text-gray-500 uppercase tracking-wide">Stock</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => adjustStock(variantData.id, -1)}
                            disabled={variantData.stock <= 0}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Input
                            type="number"
                            min="0"
                            value={variantData.stock}
                            onChange={(e) => handleVariantStockChange(variantData.id, e.target.value)}
                            className="h-8 w-16 text-center font-mono"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => adjustStock(variantData.id, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Alert Threshold */}
                      <div className="col-span-2">
                        <Label className="text-xs text-gray-500 uppercase tracking-wide">Alert At</Label>
                        <Input
                          type="number"
                          min="1"
                          value={variantData.lowStockThreshold}
                          onChange={(e) => handleVariantThresholdChange(variantData.id, e.target.value)}
                          className="h-8 mt-1 font-mono"
                        />
                      </div>
                      
                      {/* Price Display */}
                      <div className="col-span-2">
                        <Label className="text-xs text-gray-500 uppercase tracking-wide">Price</Label>
                        <div className="text-sm font-medium text-gray-900 mt-1">
                          ${originalVariant.price || product.price}
                        </div>
                      </div>
                      
                      {/* Backorder Toggle */}
                      <div className="col-span-1 text-center">
                        <Label className="text-xs text-gray-500 uppercase tracking-wide block mb-1">BO</Label>
                        <Checkbox
                          checked={variantData.allowBackorder}
                          onCheckedChange={(checked) => handleVariantBackorderChange(variantData.id, checked as boolean)}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-lg">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No variants found for this product</p>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
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
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};