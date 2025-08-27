import React, { useState, useEffect, useCallback } from 'react';
import { X, Save, Loader2, Package, Plus, Minus } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
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
  highlightedVariantId?: number | null;
}

export const StockManagementDialog: React.FC<StockManagementDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  product,
  highlightedVariantId
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

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="mb-4 sm:mb-6">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
              <Package className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
            Manage Stock - {product?.name}
          </DialogTitle>
        </DialogHeader>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="font-bold text-lg sm:text-xl text-blue-600">{totalStock}</div>
              <div className="text-xs sm:text-sm text-gray-500">Total Stock</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="font-bold text-lg sm:text-xl text-gray-600">{variants.length}</div>
              <div className="text-xs sm:text-sm text-gray-500">Variants</div>
            </CardContent>
          </Card>
          {lowStockCount > 0 && (
            <Card>
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="font-bold text-lg sm:text-xl text-yellow-600">{lowStockCount}</div>
                <div className="text-xs sm:text-sm text-gray-500">Low Stock</div>
              </CardContent>
            </Card>
          )}
          {outOfStockCount > 0 && (
            <Card>
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="font-bold text-lg sm:text-xl text-red-600">{outOfStockCount}</div>
                <div className="text-xs sm:text-sm text-gray-500">Out of Stock</div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Quick Settings */}
          <Card>
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Product Settings</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Low Stock Alert</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.lowStockThreshold}
                    onChange={(e) => handleProductThresholdChange(e.target.value)}
                    className="mt-1 h-9 text-sm sm:text-base"
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
            </CardContent>
          </Card>

          {/* Variants */}
          <Card>
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <div className="p-1.5 sm:p-2 bg-red-100 border border-red-300 rounded-lg">
                  <Package className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                </div>
                Variant Management
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              {variantsLoading ? (
                <div className="text-center py-6 sm:py-8">
                  <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin mx-auto mb-3 sm:mb-4 text-gray-400" />
                  <p className="text-sm sm:text-base text-gray-500">Loading variants...</p>
                </div>
              ) : variants.length > 0 ? (
              formData.variants.map((variantData) => {
                const originalVariant = variants.find(v => v.id === variantData.id);
                if (!originalVariant) return null;
                
                const stockStatus = getVariantStockStatus({
                  ...originalVariant,
                  stock: variantData.stock,
                  lowStockThreshold: variantData.lowStockThreshold,
                  allowBackorder: variantData.allowBackorder
                } as ProductVariant);
                
                const isHighlighted = highlightedVariantId === variantData.id;
                
                return (
                  <div 
                    key={variantData.id} 
                    className={`border rounded-lg p-3 sm:p-4 transition-all duration-300 ${
                      isHighlighted 
                        ? 'border-orange-400 bg-orange-50 shadow-lg ring-2 ring-orange-200' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {/* Mobile Layout */}
                    <div className="sm:hidden space-y-3">
                      {/* Top Row: Variant Info + Status */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900 text-sm">
                            {originalVariant.size} - {originalVariant.color}
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">
                            ${originalVariant.price || product.price}
                          </div>
                        </div>
                        <Badge 
                          variant={getStockStatusBadgeVariant(stockStatus.status)}
                          className={`text-xs ${getStockStatusColor(stockStatus.status)}`}
                        >
                          {stockStatus.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      {/* Bottom Row: Stock Controls + Alert + Backorder */}
                      <div className="flex items-center justify-between gap-3">
                        {/* Stock Controls */}
                        <div className="flex-1">
                          <Label className="text-xs text-gray-500 uppercase tracking-wide block mb-1">Stock</Label>
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7 w-7 p-0"
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
                              className="h-7 w-14 text-center font-mono text-sm"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => adjustStock(variantData.id, 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Alert Threshold */}
                        <div className="flex-1">
                          <Label className="text-xs text-gray-500 uppercase tracking-wide block mb-1">Alert</Label>
                          <Input
                            type="number"
                            min="1"
                            value={variantData.lowStockThreshold}
                            onChange={(e) => handleVariantThresholdChange(variantData.id, e.target.value)}
                            className="h-7 font-mono text-sm"
                          />
                        </div>
                        
                        {/* Backorder Toggle */}
                        <div className="flex flex-col items-center">
                          <Label className="text-xs text-gray-500 uppercase tracking-wide block mb-1">BO</Label>
                          <Checkbox
                            checked={variantData.allowBackorder}
                            onCheckedChange={(checked) => handleVariantBackorderChange(variantData.id, checked as boolean)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden sm:grid sm:grid-cols-12 gap-4 items-center">
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
                            className="h-8 w-16 text-center font-mono text-sm"
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
                          className="h-8 mt-1 font-mono text-sm"
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
              <div className="text-center py-6 sm:py-8 text-gray-500 border border-gray-200 rounded-lg">
                <Package className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-gray-300" />
                <p className="text-sm sm:text-base">No variants found for this product</p>
              </div>
            )}
            </CardContent>
          </Card>
        </form>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="text-sm sm:text-base"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-sm sm:text-base"
            onClick={handleSubmit}
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
      </DialogContent>
    </Dialog>
  );
};