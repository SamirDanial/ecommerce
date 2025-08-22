import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Package } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { toast } from 'sonner';
import VariantService, { CreateVariantData, ProductVariant, VariantOperation } from '../../services/variantService';
import { useClerkAuth } from '../../hooks/useClerkAuth';

interface VariantManagementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
  productName: string;
  existingVariants?: ProductVariant[];
  onVariantsChange: () => void;
}

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const COLORS = [
  { name: 'Black', code: '#000000' },
  { name: 'White', code: '#FFFFFF' },
  { name: 'Red', code: '#FF0000' },
  { name: 'Blue', code: '#0000FF' },
  { name: 'Green', code: '#00FF00' },
  { name: 'Yellow', code: '#FFFF00' },
  { name: 'Purple', code: '#800080' },
  { name: 'Orange', code: '#FFA500' },
  { name: 'Pink', code: '#FFC0CB' },
  { name: 'Brown', code: '#A52A2A' },
  { name: 'Gray', code: '#808080' },
  { name: 'Navy', code: '#000080' },
  { name: 'Teal', code: '#008080' },
  { name: 'Maroon', code: '#800000' },
  { name: 'Olive', code: '#808000' }
];

export const VariantManagementDialog: React.FC<VariantManagementDialogProps> = ({
  isOpen,
  onClose,
  productId,
  productName,
  existingVariants = [],
  onVariantsChange
}) => {
  const { getToken } = useClerkAuth();
  const [variants, setVariants] = useState<ProductVariant[]>(existingVariants);
  const [loading, setLoading] = useState(false);
  const [variantsLoading, setVariantsLoading] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['M', 'L']);
  const [selectedColors, setSelectedColors] = useState<string[]>(['Black', 'White']);
  const [basePrice, setBasePrice] = useState<number>(0);
  const [baseStock, setBaseStock] = useState<number>(10);
  const [baseCostPrice, setBaseCostPrice] = useState<number>(0);

  // Load existing variants when dialog opens
  useEffect(() => {
    if (isOpen) {
      console.log('Dialog opened, loading variants for product:', productId);
      
      // Set loading to true immediately when dialog opens
      setVariantsLoading(true);
      
      // Clear existing variants to show fresh loading state
      setVariants([]);
      
      // Reset deleted variants list
      setDeletedVariantIds([]);
      
      // Simple loading approach - just like ProductImageManagerDialog
      setTimeout(() => {
        if (existingVariants && existingVariants.length > 0) {
          setVariants(existingVariants);
          // Extract unique sizes and colors from existing variants
          const sizes = Array.from(new Set(existingVariants.map(v => v.size)));
          const colors = Array.from(new Set(existingVariants.map(v => v.color)));
          setSelectedSizes(sizes);
          setSelectedColors(colors);
          
          // Set base price, stock, and cost price from first variant
          if (existingVariants[0]) {
            setBasePrice(existingVariants[0].price || 0);
            setBaseStock(existingVariants[0].stock || 10);
            setBaseCostPrice(existingVariants[0].costPrice || 0);
          }
        } else {
          // Set default values if no variants exist
          setSelectedSizes(['M', 'L']);
          setSelectedColors(['Black', 'White']);
          setBasePrice(0);
          setBaseStock(10);
        }
        setVariantsLoading(false);
      }, 800);
    } else {
      console.log('Dialog closed, cleaning up state');
      // Reset loading state when dialog closes
      setVariantsLoading(false);
    }
  }, [isOpen, productId, existingVariants]); // Add existingVariants back to dependencies

  // Handle existingVariants updates when dialog is already open and loading is complete
  useEffect(() => {
    if (isOpen && !variantsLoading && existingVariants && existingVariants.length > 0) {
      // Only update if dialog is open, not loading, and we have new variants data
      console.log('Updating variants with new data:', existingVariants.length);
      setVariants(existingVariants);
      
      // Extract unique sizes and colors from existing variants
      const sizes = Array.from(new Set(existingVariants.map(v => v.size)));
      const colors = Array.from(new Set(existingVariants.map(v => v.color)));
      setSelectedSizes(sizes);
      setSelectedColors(colors);
      
      // Set base price and stock from first variant
      if (existingVariants[0]) {
        setBasePrice(existingVariants[0].price || 0);
        setBaseStock(existingVariants[0].stock || 10);
      }
    }
  }, [existingVariants, isOpen, variantsLoading]);

  // Debug: Track variants loading state changes
  useEffect(() => {
    console.log('Variants loading state changed:', variantsLoading);
  }, [variantsLoading]);

  const generateVariants = () => {
    const newVariants: CreateVariantData[] = [];
    
    selectedSizes.forEach(size => {
      selectedColors.forEach(color => {
        // Check if variant already exists
        const exists = variants.some(v => v.size === size && v.color === color);
        if (!exists) {
          const colorData = COLORS.find(c => c.name === color);
          newVariants.push({
            size,
            color,
            colorCode: colorData?.code,
            stock: baseStock,
            price: basePrice,
            costPrice: baseCostPrice,
            isActive: true
          });
        }
      });
    });

    if (newVariants.length === 0) {
      toast.info('All selected size/color combinations already exist');
      return;
    }

    setVariants(prev => [...prev, ...newVariants.map((v, index) => ({
      ...v,
      id: -(index + 1), // Temporary negative ID for new variants
      productId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }))]);
    
    toast.success(`Generated ${newVariants.length} new variants`);
  };

  const saveVariants = async () => {
    if (!getToken) {
      toast.error('Authentication required');
      return;
    }

    setLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      // Separate new variants and existing variants
      const newVariants = variants.filter(v => v.id < 0);
      const existingVariants = variants.filter(v => v.id > 0);

      // Prepare operations array for all variant changes
      const operations: VariantOperation[] = [];

      // Add create operations for new variants
      for (const variant of newVariants) {
        const { id, createdAt, updatedAt, ...variantData } = variant;
        operations.push({
          action: 'create',
          ...variantData
        });
      }

      // Add update operations for existing variants
      for (const variant of existingVariants) {
        const { id, createdAt, updatedAt, ...variantData } = variant;
        operations.push({
          action: 'update',
          id,
          ...variantData
        });
      }

      // Add delete operations for variants marked for deletion
      for (const variantId of deletedVariantIds) {
        operations.push({
          action: 'delete',
          id: variantId
        });
      }

      // Send all operations in one request
      const result = await VariantService.saveVariants(productId, operations, token);
      
      if (result.errors && result.errors.length > 0) {
        toast.warning(`Variants saved with ${result.errors.length} errors`);
        console.warn('Variant save errors:', result.errors);
      } else {
        toast.success('Variants saved successfully');
      }

      // Clear deleted variants list and remove them from UI after successful save
      setDeletedVariantIds([]);
      // Remove deleted variants from the variants list
      setVariants(prev => prev.filter(v => !deletedVariantIds.includes(v.id)));
      onVariantsChange();
      onClose();
    } catch (error) {
      console.error('Error saving variants:', error);
      toast.error('Failed to save variants');
    } finally {
      setLoading(false);
    }
  };

  const updateVariant = (variantId: number, field: keyof ProductVariant, value: any) => {
    setVariants(prev => prev.map(v => 
      v.id === variantId ? { ...v, [field]: value } : v
    ));
  };

  const [deletedVariantIds, setDeletedVariantIds] = useState<number[]>([]);

  const deleteVariant = (variantId: number) => {
    if (variantId > 0) {
      // Existing variant - mark for deletion (keep visible with undo option)
      setDeletedVariantIds(prev => [...prev, variantId]);
      toast.success('Variant marked for deletion. Click undo to restore or save to confirm.');
    } else {
      // New variant - just remove from list
      setVariants(prev => prev.filter(v => v.id !== variantId));
      toast.success('Variant removed');
    }
  };

  const undoDelete = (variantId: number) => {
    setDeletedVariantIds(prev => prev.filter(id => id !== variantId));
    toast.success('Variant restored');
  };

  const toggleVariantActive = (variantId: number) => {
    updateVariant(variantId, 'isActive', !variants.find(v => v.id === variantId)?.isActive);
  };

  const getVariantDisplay = (variant: ProductVariant) => {
    const colorData = COLORS.find(c => c.name === variant.color);
    return (
      <div className="flex items-center gap-2">
        <div 
          className="w-4 h-4 rounded-full border border-gray-300"
          style={{ backgroundColor: colorData?.code || '#ccc' }}
        />
        <span className="font-medium">{variant.color}</span>
        <span className="text-gray-500">•</span>
        <span className="font-medium">{variant.size}</span>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="mb-4 sm:mb-6">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-orange-100 rounded-lg">
              <Package className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
            </div>
            Manage Variants - {productName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Variant Generator */}
          <Card>
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Generate Variants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <Label>Sizes</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {SIZES.map(size => (
                      <Button
                        key={size}
                        variant={selectedSizes.includes(size) ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedSizes(prev => 
                          prev.includes(size) 
                            ? prev.filter(s => s !== size)
                            : [...prev, size]
                        )}
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Colors</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {COLORS.map(color => (
                      <Button
                        key={color.name}
                        variant={selectedColors.includes(color.name) ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedColors(prev => 
                          prev.includes(color.name) 
                            ? prev.filter(c => c !== color.name)
                            : [...prev, color.name]
                        )}
                        className="flex items-center gap-2"
                      >
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: color.code }}
                        />
                        {color.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Base Settings</Label>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="basePrice" className="text-xs text-gray-600 block mb-1">
                        Base Price ($)
                      </Label>
                      <Input
                        id="basePrice"
                        type="number"
                        step="any"
                        inputMode="decimal"
                        placeholder="29.99"
                        value={Number.isNaN(basePrice) ? '' : basePrice}
                        onChange={(e) => {
                          const { value } = e.target;
                          if (value === '') {
                            setBasePrice(0);
                            return;
                          }
                          const parsed = parseFloat(value);
                          if (!Number.isNaN(parsed)) {
                            setBasePrice(parsed);
                          }
                        }}
                        className="font-mono text-sm sm:text-base"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Starting price for all new variants
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="baseStock" className="text-xs text-gray-600 block mb-1">
                        Base Stock (units)
                      </Label>
                      <Input
                        id="baseStock"
                        type="text"
                        placeholder="25"
                        value={baseStock === 0 ? '' : baseStock || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Only allow numbers and empty string
                          if (value === '' || /^\d*$/.test(value)) {
                            if (value === '') {
                              setBaseStock(0);
                            } else {
                              const parsed = parseInt(value);
                              if (!isNaN(parsed)) {
                                setBaseStock(parsed);
                              }
                            }
                          }
                        }}
                        className="font-mono text-sm sm:text-base"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Starting inventory for all new variants
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="baseCostPrice" className="text-xs text-gray-600 block mb-1">
                        Base Cost Price ($)
                      </Label>
                      <Input
                        id="baseCostPrice"
                        type="number"
                        step="any"
                        inputMode="decimal"
                        placeholder="15.00"
                        value={Number.isNaN(baseCostPrice) ? '' : baseCostPrice}
                        onChange={(e) => {
                          const { value } = e.target;
                          if (value === '') {
                            setBaseCostPrice(0);
                            return;
                          }
                          const parsed = parseFloat(value);
                          if (!Number.isNaN(parsed)) {
                            setBaseCostPrice(parsed);
                          }
                        }}
                        className="font-mono text-sm sm:text-base"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Starting cost for all new variants (for profit calculation)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Button onClick={generateVariants} className="w-full">
                Generate {selectedSizes.length * selectedColors.length} Variants
              </Button>
            </CardContent>
          </Card>

          {/* Variants List */}
          <Card>
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="text-base sm:text-lg">
                Variants ({variants.filter(v => v.isActive).length} active)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              {/* Loading State */}
              {variantsLoading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading variants...</p>
                </div>
              )}
              
              {/* Variants List */}
              {!variantsLoading && (
                <div className="space-y-3">
                  {variants.length === 0 ? (
                    <div className="text-center py-6 sm:py-8 text-gray-500">
                      <p className="text-sm sm:text-base">No variants configured for this product.</p>
                      <p className="text-xs sm:text-sm mt-1">Use the variant generator above to create variants.</p>
                    </div>
                  ) : (
                    variants.map(variant => (
                      <div
                        key={variant.id}
                        className={`p-3 sm:p-4 border rounded-lg ${
                          deletedVariantIds.includes(variant.id) 
                            ? 'bg-red-50 border-red-300' 
                            : variant.isActive 
                              ? 'bg-white border-gray-200' 
                              : 'bg-gray-50 border-gray-300'
                        }`}
                      >
                        {deletedVariantIds.includes(variant.id) && (
                          <div className="mb-3 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm flex items-center justify-between">
                            <span>⚠️ Marked for deletion</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => undoDelete(variant.id)}
                              className="text-red-700 border-red-300 hover:bg-red-200"
                            >
                              Undo
                            </Button>
                          </div>
                        )}
                        
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                          <div className="flex-1">
                            {getVariantDisplay(variant)}
                          </div>
                          
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-2">
                              <div className="flex flex-col min-w-0">
                                <Label className="text-xs text-gray-600 mb-1">Price</Label>
                                <Input
                                  type="text"
                                  placeholder="29.99"
                                  value={variant.price || ''}
                                  disabled={deletedVariantIds.includes(variant.id)}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === '' || /^[\d.]*$/.test(value)) {
                                      if ((value.match(/\./g) || []).length <= 1) {
                                        if (value === '') {
                                          updateVariant(variant.id, 'price', undefined);
                                        } else if (value === '.') {
                                          return;
                                        } else {
                                          const parsed = parseFloat(value);
                                          if (!isNaN(parsed)) {
                                            updateVariant(variant.id, 'price', parsed);
                                          }
                                        }
                                      }
                                    }
                                  }}
                                  className="w-16 sm:w-20 font-mono text-xs sm:text-sm"
                                />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <Label className="text-xs text-gray-600 mb-1">Stock</Label>
                                <Input
                                  type="text"
                                  placeholder="25"
                                  value={variant.stock || ''}
                                  disabled={deletedVariantIds.includes(variant.id)}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === '' || /^\d*$/.test(value)) {
                                      if (value === '') {
                                        updateVariant(variant.id, 'stock', 0);
                                      } else {
                                        const parsed = parseInt(value);
                                        if (!isNaN(parsed)) {
                                          updateVariant(variant.id, 'stock', parsed);
                                        }
                                      }
                                    }
                                  }}
                                  className="w-16 sm:w-20 font-mono text-xs sm:text-sm"
                                />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <Label className="text-xs text-gray-600 mb-1">SKU</Label>
                                <Input
                                  placeholder="TSH-001"
                                  value={variant.sku || ''}
                                  disabled={deletedVariantIds.includes(variant.id)}
                                  onChange={(e) => updateVariant(variant.id, 'sku', e.target.value)}
                                  className="w-20 sm:w-24 text-xs sm:text-sm"
                                />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <Label className="text-xs text-gray-600 mb-1">Cost ($)</Label>
                                <Input
                                  type="text"
                                  placeholder="15.00"
                                  value={variant.costPrice || ''}
                                  disabled={deletedVariantIds.includes(variant.id)}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === '' || /^[\d.]*$/.test(value)) {
                                      if ((value.match(/\./g) || []).length <= 1) {
                                        if (value === '') {
                                          updateVariant(variant.id, 'costPrice', undefined);
                                        } else if (value === '.') {
                                          return;
                                        } else {
                                          const parsed = parseFloat(value);
                                          if (!isNaN(parsed)) {
                                            updateVariant(variant.id, 'costPrice', parsed);
                                          }
                                        }
                                      }
                                    }
                                  }}
                                  className="w-16 sm:w-20 font-mono text-xs sm:text-sm"
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  checked={variant.isActive}
                                  disabled={deletedVariantIds.includes(variant.id)}
                                  onCheckedChange={() => toggleVariantActive(variant.id)}
                                />
                                <Badge variant={variant.isActive ? "default" : "secondary"} className="text-xs">
                                  {variant.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </div>

                              <Button
                                variant="destructive"
                                size="sm"
                                disabled={deletedVariantIds.includes(variant.id)}
                                onClick={() => deleteVariant(variant.id)}
                                className="text-xs sm:text-sm"
                              >
                                {deletedVariantIds.includes(variant.id) ? 'Deleting...' : 'Delete'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="text-sm sm:text-base">
            Cancel
          </Button>
          <Button onClick={saveVariants} disabled={loading} className="text-sm sm:text-base">
            {loading ? 'Saving...' : 'Save All Variants'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
