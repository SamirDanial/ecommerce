import React from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useVariantSelection } from '../hooks/useVariantSelection';
import { formatPrice } from '../utils/productUtils';
import SizeChart from './SizeChart';

interface DynamicVariantSelectorProps {
  productId: number;
  initialColor?: string;
  onVariantChange?: (variant: any) => void;
  showPricing?: boolean;
}

export const DynamicVariantSelector: React.FC<DynamicVariantSelectorProps> = ({
  productId,
  initialColor,
  onVariantChange,
  showPricing = true
}) => {
  const {
    selectedColor,
    selectedSize,
    availableColors,
    currentVariants,
    currentPrice,
    currentComparePrice,
    isOnSale,
    salePrice,
    availableSizes,
    selectedVariant,
    colorsLoading,
    variantsLoading,
    error,
    selectColor,
    selectSize
  } = useVariantSelection({ productId, initialColor, onVariantChange });



  if (colorsLoading) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-sm p-3 bg-red-50 rounded-lg">
        <div className="font-semibold mb-2">Error: {error}</div>
        <div className="text-xs text-gray-600">
          Product ID: {productId} | Color: {selectedColor || 'None'}
        </div>
      </div>
    );
  }

  if (!availableColors || availableColors.colors.length === 0) {
    return (
      <div className="text-gray-500 text-sm">
        No variants available for this product.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Color Selection and Size Chart Row */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        {/* Color Selection - Left Side */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Color: <span className="font-semibold">{selectedColor}</span>
            </h3>
            {variantsLoading && (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-xs text-gray-500">Loading variants...</span>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            {availableColors.colors.map((colorInfo) => (
              <button
                key={colorInfo.color}
                onClick={() => selectColor(colorInfo.color)}
                disabled={variantsLoading}
                className={`
                  relative p-1 rounded-full border-2 transition-all duration-200
                  ${selectedColor === colorInfo.color
                    ? 'border-blue-600 ring-2 ring-blue-200'
                    : 'border-gray-300 hover:border-gray-400'
                  }
                  ${!colorInfo.hasStock ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
                title={`${colorInfo.color} (${colorInfo.availableSizes} sizes available)`}
              >
                {colorInfo.colorCode ? (
                  <div 
                    className="w-8 h-8 rounded-full"
                    style={{ backgroundColor: colorInfo.colorCode }}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-xs text-gray-600 font-medium">
                      {colorInfo.color.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                
                {/* Stock indicator */}
                {colorInfo.hasStock && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Size Chart - Right Side (Desktop) */}
        <div className="lg:w-auto lg:flex-shrink-0">
          <SizeChart />
        </div>
      </div>

      {/* Size Selection */}
      {selectedColor && availableSizes.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Size: <span className="font-semibold">{selectedSize}</span>
          </h3>
          
          <div className="flex flex-wrap gap-2">
            {availableSizes.map((size) => {
              const variant = currentVariants?.variants.find(v => v.size === size);
              const isAvailable = variant && (variant.stock > 0 || variant.allowBackorder);
              const isLowStock = variant && variant.stock > 0 && variant.stock <= variant.lowStockThreshold;
              
              return (
                <Button
                  key={size}
                  variant={selectedSize === size ? "default" : "outline"}
                  size="sm"
                  disabled={!isAvailable || variantsLoading}
                  onClick={() => selectSize(size)}
                  className={`
                    min-w-[3rem] h-10
                    ${selectedSize === size ? 'bg-blue-600 hover:bg-blue-700' : ''}
                    ${!isAvailable ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  {size}
                  {isLowStock && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      Low
                    </Badge>
                  )}
                  {variant?.allowBackorder && variant.stock === 0 && (
                    <Badge variant="outline" className="ml-1 text-xs">
                      Backorder
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Dynamic Pricing Display */}
      {showPricing && selectedColor && currentPrice !== null && (
        <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Price for {selectedColor} {selectedSize && `(${selectedSize})`}:
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            {isOnSale && salePrice ? (
              <>
                <span className="text-2xl font-bold text-red-600">
                  {formatPrice(salePrice)}
                </span>
                <span className="text-lg text-gray-500 line-through">
                  {formatPrice(currentPrice)}
                </span>
                <Badge variant="destructive" className="text-xs">
                  SALE
                </Badge>
              </>
            ) : (
              <span className="text-2xl font-bold text-blue-600">
                {formatPrice(currentPrice)}
              </span>
            )}
            
            {currentComparePrice && currentComparePrice > currentPrice && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(currentComparePrice)}
              </span>
            )}
          </div>

          {/* Stock information */}
          {selectedVariant && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {selectedVariant.stock > 0 ? (
                <span className="text-green-600">
                  {selectedVariant.stock} in stock
                </span>
              ) : selectedVariant.allowBackorder ? (
                <span className="text-orange-600">
                  Available for backorder
                </span>
              ) : (
                <span className="text-red-600">
                  Out of stock
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="text-red-500 text-sm p-3 bg-red-50 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
};
