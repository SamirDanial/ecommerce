import React from 'react';
import { Eye, Edit, Trash2, Image as ImageIcon, Package, XCircle, CheckCircle, BarChart3, MoreHorizontal, Tag, Star } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
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
  const getFullImageUrl = (url: string | undefined): string | undefined => {
    if (!url) return undefined;
    if (url.startsWith('http')) return url; // Already a full URL
    
    // Get the API base URL from environment or use default
    const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    return `${apiBaseUrl}${url}`;
  };
  
  const imageUrl = getFullImageUrl(product.primaryImage?.url);
  const [imageError, setImageError] = React.useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  


  const handleImageError = () => {
    setImageError(true);
  };

  // Helper functions to handle dropdown menu actions and close the menu
  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen(false);
    onView(product);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen(false);
    onEdit(product);
  };

  const handleImageManager = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen(false);
    onImageManager(product);
  };

  const handleVariantManager = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen(false);
    onVariantManager(product);
  };

  const handleStockManager = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen(false);
    onStockManager(product);
  };

  const handleToggleStatus = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen(false);
    onToggleStatus(product.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen(false);
    onDelete(product);
  };

  return (
    <Card className={`group hover:shadow-2xl hover:bg-gradient-to-br hover:from-white/90 hover:to-white/70 hover:border-purple-200 hover:scale-[1.02] hover:shadow-purple-100/50 transition-all duration-300 border border-transparent overflow-hidden bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-xl rounded-xl ${
      viewMode === 'list' ? 'flex-row items-center p-4' : ''
    }`}>
      {/* Product Image - Only show in grid view */}
      {viewMode !== 'list' && (
        <div className="relative overflow-hidden bg-gray-100 aspect-[4/3]">
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
                __html: generatePlaceholderSVG('medium') 
              }}
            />
          )}

          {/* Sale Badge - Only show in grid view */}
          {product.isOnSale && product.salePrice && (
            <div className="absolute bottom-2 left-2">
              <Badge variant="destructive" className="px-2 py-0.5 text-xs font-medium shadow-sm">
                🔥 SALE
              </Badge>
            </div>
          )}

          {/* 3-Dots Menu - Clean and Elegant */}
          <div className="absolute top-2 right-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
            <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 bg-white/90 hover:bg-white/95 shadow-lg border border-gray-200/50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4 text-gray-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleView}>
                  <Eye className="mr-2 h-4 w-4 text-blue-600" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="mr-2 h-4 w-4 text-green-600" />
                  Edit Product
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleImageManager}>
                  <ImageIcon className="mr-2 h-4 w-4 text-purple-600" />
                  Manage Images
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleVariantManager}>
                  <Package className="mr-2 h-4 w-4 text-orange-600" />
                  Manage Variants
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleStockManager}>
                  <BarChart3 className="mr-2 h-4 w-4 text-indigo-600" />
                  Manage Stock
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleToggleStatus}
                  className={product.isActive ? 'text-red-600' : 'text-green-600'}
                >
                  {product.isActive ? (
                    <XCircle className="mr-2 h-4 w-4" />
                  ) : (
                    <CheckCircle className="mr-2 h-4 w-4" />
                  )}
                  {product.isActive ? 'Deactivate' : 'Activate'}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleDelete}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Product
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}

      {/* Product Info - Minimal */}
      <CardContent className={`${viewMode === 'list' ? 'p-0 flex-1' : 'p-3'}`}>
                {viewMode === 'list' ? (
          // List View - Inspired by Categories Layout
          <div className="flex items-start gap-4 h-full w-full">
            {/* Left Section - Product Image */}
            <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={product.primaryImage?.alt || product.name}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Package className="w-8 h-8" />
                </div>
              )}
            </div>

            {/* Middle Section - Product Information */}
            <div className="flex-1 min-w-0 space-y-2">
              {/* Product Name */}
              <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors text-lg">
                {product.name}
              </h3>
              
              {/* Category */}
              <div className="text-sm text-gray-600">
                Category: <span className="font-medium">{product.category?.name || 'No Category'}</span>
              </div>
              
              {/* Sale & Featured Status with Pricing */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {/* Sale Badge */}
                {product.isOnSale && (
                  <div className="flex items-center gap-1.5 bg-orange-100 text-orange-700 px-2 py-1 rounded-md border border-orange-200">
                    <Tag className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline text-sm font-medium">On Sale</span>
                  </div>
                )}
                
                {/* Featured Badge */}
                {product.isFeatured && (
                  <div className="flex items-center gap-1.5 bg-purple-100 text-purple-700 px-2 py-1 rounded-md border border-purple-200">
                    <Star className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline text-sm font-medium">Featured</span>
                  </div>
                )}
                
                {/* Pricing Information */}
                <div className="flex items-center gap-2 text-sm">
                  {product.isOnSale && product.salePrice ? (
                    <>
                      <span className="text-gray-400 line-through">${product.price}</span>
                      <span className="font-semibold text-orange-600">${product.salePrice}</span>
                    </>
                  ) : (
                    <span className="font-semibold text-gray-900">${product.price}</span>
                  )}
                </div>
              </div>
              
              {/* Metadata */}
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span>Stock: {product.totalStock || 0}</span>
                {product.sku && <span>SKU: {product.sku}</span>}
              </div>
              

            </div>

            {/* Right Section - Status and Actions */}
            <div className="flex flex-col items-end gap-3 flex-shrink-0">
              {/* Status Badges */}
              <div className="flex flex-col gap-2">
                {product.isActive ? (
                  <Badge variant="default" className="w-fit text-xs px-2 py-1 bg-blue-500 text-white font-medium">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="w-fit text-xs px-2 py-1 bg-gray-200 text-gray-600 font-medium">
                    Inactive
                  </Badge>
                )}
              </div>
              
              {/* Three Dots Menu */}
              <div className="relative">
                <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 bg-white/90 hover:bg-white/95 shadow-lg border border-gray-200/50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4 text-gray-600" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={handleView}>
                      <Eye className="mr-2 h-4 w-4 text-blue-600" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleEdit}>
                      <Edit className="mr-2 h-4 w-4 text-green-600" />
                      Edit Product
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleImageManager}>
                      <ImageIcon className="mr-2 h-4 w-4 text-purple-600" />
                      Manage Images
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleVariantManager}>
                      <Package className="mr-2 h-4 w-4 text-orange-600" />
                      Manage Variants
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleStockManager}>
                      <BarChart3 className="mr-2 h-4 w-4 text-indigo-600" />
                      Manage Stock
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleToggleStatus}
                      className={product.isActive ? 'text-red-600' : 'text-green-600'}
                    >
                      {product.isActive ? (
                        <XCircle className="mr-2 h-4 w-4" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      {product.isActive ? 'Deactivate' : 'Activate'}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={handleDelete}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Product
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
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
