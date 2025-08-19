import React from 'react';
import { Eye, Edit, Trash2, Image as ImageIcon, Package, XCircle, CheckCircle, BarChart3 } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Product } from '../../types';
import { formatPrice, generatePlaceholderSVG } from '../../utils/productUtils';


interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onToggleStatus: (id: number) => void;
  onImageManager: (product: Product) => void;
  onVariantManager: (product: Product) => void;
  onStockManager: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  viewMode = 'grid',
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
  onImageManager,
  onVariantManager,
  onStockManager
}) => {
  // Since variants are loaded on demand, we can't calculate stock status here
  // Stock status will be calculated when variants are actually loaded
  // Convert relative URL to full URL if needed
  const getFullImageUrl = (url: string | null): string | null => {
    if (!url) return null;
    if (url.startsWith('http')) return url; // Already a full URL
    
    // Get the API base URL from environment or use default
    const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    return `${apiBaseUrl}${url}`;
  };
  
  const imageUrl = getFullImageUrl(product.primaryImage?.url || null);
  const [imageError, setImageError] = React.useState(false);
  


  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <Card className={`group hover:shadow-2xl hover:bg-gradient-to-br hover:from-white/90 hover:to-white/70 hover:border-purple-200 hover:scale-[1.02] hover:shadow-purple-100/50 transition-all duration-300 border border-transparent overflow-hidden bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-xl rounded-xl ${
      viewMode === 'list' ? 'flex-row' : ''
    }`}>
      {/* Product Image */}
      <div className={`relative overflow-hidden bg-gray-100 ${
        viewMode === 'list' ? 'w-20 h-20 flex-shrink-0' : 'aspect-[4/3]'
      }`}>
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={handleImageError}
          />
        ) : (
          <div 
            className="h-full w-full flex items-center justify-center"
            dangerouslySetInnerHTML={{ 
              __html: generatePlaceholderSVG(viewMode === 'list' ? 'small' : 'medium') 
            }}
          />
        )}
        


        {/* Sale Badge */}
        {product.isOnSale && product.salePrice && (
          <div className={`absolute ${viewMode === 'list' ? 'bottom-1 left-1' : 'bottom-2 left-2'}`}>
            <Badge variant="destructive" className={`${viewMode === 'list' ? 'px-1 py-0 text-xs' : 'px-2 py-0.5 text-xs'} font-medium`}>
              SALE
            </Badge>
          </div>
        )}

        {/* Action Buttons Overlay - Compact */}
        <div className="absolute inset-0 bg-black bg-opacity-10 sm:bg-opacity-0 sm:group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center pointer-events-none">
          <div className="flex items-center gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 pointer-events-auto">
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onView(product);
              }}
              className="bg-white/90 hover:bg-white active:bg-white/80 text-blue-600 shadow-lg transition-all duration-200 h-8 w-8 p-0"
              title="View Product Details"
            >
              <Eye className="w-3 h-3" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(product);
              }}
              className="bg-white/90 hover:bg-white active:bg-white/80 text-green-600 shadow-lg transition-all duration-200 h-8 w-8 p-0"
              title="Edit Product"
            >
              <Edit className="w-3 h-3" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onToggleStatus(product.id);
              }}
              className="bg-white/90 hover:bg-white active:bg-white/80 text-gray-700 shadow-lg transition-all duration-200 h-8 w-8 p-0"
              title={product.isActive ? 'Deactivate' : 'Activate'}
            >
              {product.isActive ? <XCircle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onImageManager(product);
              }}
              className="bg-white/90 hover:bg-white active:bg-white/80 text-purple-600 shadow-lg transition-all duration-200 h-8 w-8 p-0"
              title="Manage Images"
            >
              <ImageIcon className="w-3 h-3" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onVariantManager(product);
              }}
              className="bg-white/90 hover:bg-white active:bg-white/80 text-orange-600 shadow-lg transition-all duration-200 h-8 w-8 p-0"
              title="Manage Variants"
            >
              <Package className="w-3 h-3" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onStockManager(product);
              }}
              className="bg-white/90 hover:bg-white active:bg-white/80 text-indigo-600 shadow-lg transition-all duration-200 h-8 w-8 p-0"
              title="Manage Stock"
            >
              <BarChart3 className="w-3 h-3" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(product);
              }}
              className="bg-white/90 hover:bg-white active:bg-white/80 text-red-600 shadow-lg transition-all duration-200 h-8 w-8 p-0"
              title="Delete Product"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Product Info - Minimal */}
      <CardContent className={`${viewMode === 'list' ? 'p-3 flex-1' : 'p-3'}`}>
        {viewMode === 'list' ? (
          // List View - Horizontal Layout
          <div className="flex items-center justify-between h-full">
            <div className="flex-1 min-w-0">
              {/* Product Name with Featured Badge */}
              <div className="flex items-start gap-2 mb-1">
                <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-purple-600 transition-colors text-sm flex-1">
                  {product.name}
                </h3>
                {product.isFeatured && (
                  <Badge variant="default" className="text-xs px-1 py-0 bg-yellow-500 hover:bg-yellow-600 flex-shrink-0">
                    ⭐
                  </Badge>
                )}
              </div>

              {/* Category and Price Row */}
              <div className="flex items-center gap-3 mb-1">
                <Badge variant="outline" className="text-xs">
                  {product.category?.name || 'No Category'}
                </Badge>
                <span className="text-sm font-bold text-gray-900">
                  {formatPrice(product.salePrice || product.price)}
                </span>
                {product.isOnSale && product.salePrice && (
                  <span className="text-xs text-red-600 font-medium">SALE</span>
                )}
              </div>

              {/* Variants and Stock */}
              <div className="flex items-center gap-3 text-xs text-gray-600">
                <span>Variants: {product._count?.variants || 0}</span>
                <span>•</span>
                <span>Stock: {product.totalStock || 0}</span>
                {!product.isActive && (
                  <>
                    <span>•</span>
                    <span className="text-red-500 font-medium">Inactive</span>
                  </>
                )}
              </div>
            </div>

            {/* Quick Actions for List View */}
            <div className="flex items-center gap-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onView(product)}
                className="h-7 px-2 text-xs border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
              >
                View
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(product)}
                className="h-7 px-2 text-xs border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
              >
                Edit
              </Button>
            </div>
          </div>
        ) : (
          // Grid View - Vertical Layout (Original)
          <>
            {/* Product Name with Featured Badge */}
            <div className="flex items-start gap-2 mb-2">
              <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors text-sm flex-1">
                {product.name}
              </h3>
              {product.isFeatured && (
                <Badge variant="default" className="text-xs px-1.5 py-0.5 bg-yellow-500 hover:bg-yellow-600">
                  ⭐
                </Badge>
              )}
            </div>

            {/* Essential Info Row */}
            <div className="flex items-center justify-between mb-2">
              {/* Category */}
              <Badge variant="outline" className="text-xs">
                {product.category?.name || 'No Category'}
              </Badge>
              
              {/* Price with Sale Indicator */}
              <div className="flex items-center gap-1">
                {product.isOnSale && product.salePrice && (
                  <span className="text-xs text-red-600 font-medium">SALE</span>
                )}
                <span className="text-sm font-bold text-gray-900">
                  {formatPrice(product.salePrice || product.price)}
                </span>
              </div>
            </div>

            {/* Variants Summary - Compact */}
            <p className="text-xs text-gray-600 mb-2">
              Variants: {product._count?.variants || 0} • Stock: {product.totalStock || 0}
            </p>

            {/* Quick Actions Row */}
            <div className="flex items-center justify-between">
              {/* Stock Status with Inactive Indicator */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  Stock: {product.totalStock || 0}
                </span>
                {!product.isActive && (
                  <span className="text-xs text-red-500 font-medium">• Inactive</span>
                )}
              </div>
              
              {/* View Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onView(product)}
                className="h-7 px-2 text-xs border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
              >
                View
              </Button>
            </div>
          </>
        )}
      </CardContent>


    </Card>
  );
};
