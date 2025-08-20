import React, { useState } from 'react';
import { 
  Plus, 
  Grid3X3, 
  List, 
  Upload,
  Download,
  BarChart3,
  Loader2,
  RefreshCw,
  AlertTriangle,
  Trash2,
  Package
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useProducts } from '../../hooks/useProducts';
import { ProductService } from '../../services/productService';
import { useClerkAuth } from '../../hooks/useClerkAuth';
import { ProductCard } from '../../components/admin/ProductCard';
import { ProductFilters } from '../../components/admin/ProductFilters';
import { CreateProductDialog } from '../../components/admin/CreateProductDialog';
import { EditProductDialog } from '../../components/admin/EditProductDialog';
import { VariantManagementDialog } from '../../components/admin/VariantManagementDialog';
import ProductImageManagerDialog from '../../components/admin/ProductImageManagerDialog';
import { StockManagementDialog } from '../../components/admin/StockManagementDialog';
import { Product } from '../../types';
import { toast } from 'sonner';

const Products: React.FC = () => {
  const { getToken } = useClerkAuth();
  const {
    products,
    categories,
    loading,
    filters,
    totalProducts,
    totalPages,
    updateFilters,
    resetFilters,
    createProduct,
    updateProduct,
    toggleProductStatus,
    deleteProduct,
    updateStockAndSettings,
    fetchProducts
  } = useProducts();

  // UI State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isImageManagerOpen, setIsImageManagerOpen] = useState(false);
  const [isVariantManagerOpen, setIsVariantManagerOpen] = useState(false);
  const [isStockManagerOpen, setIsStockManagerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoadingProductDetails, setIsLoadingProductDetails] = useState(false);
  const [isLoadingProductEdit, setIsLoadingProductEdit] = useState(false);

  // Dialog handlers
  const openCreateDialog = () => setIsCreateDialogOpen(true);
  const openEditDialog = async (product: Product) => {
    try {
      // Show edit dialog immediately with loading state
      setSelectedProduct(product); // Set minimal product data first
      setIsEditDialogOpen(true);
      setIsLoadingProductEdit(true);
      
      // Fetch full product details in the background
      const token = await getToken();
      if (!token) throw new Error('No authentication token');
      
      const fullProduct = await ProductService.getProduct(product.id, token);
      setSelectedProduct(fullProduct); // Update with full data
      setIsLoadingProductEdit(false);
    } catch (error) {
      console.error('Error fetching product details:', error);
      toast.error('Failed to load product details');
      setIsLoadingProductEdit(false);
      // Keep dialog open with minimal data
    }
  };
  const openViewDialog = async (product: Product) => {
    try {
      // Show dialog immediately with loading state
      setSelectedProduct(product); // Set minimal product data first
      setIsViewDialogOpen(true);
      setIsLoadingProductDetails(true);
      
      // Fetch full product details in the background
      const token = await getToken();
      if (!token) throw new Error('No authentication token');
      
      const fullProduct = await ProductService.getProduct(product.id, token);
      setSelectedProduct(fullProduct); // Update with full data
      setIsLoadingProductDetails(false);
    } catch (error) {
      console.error('Error fetching product details:', error);
      toast.error('Failed to load product details');
      setIsLoadingProductDetails(false);
      // Keep dialog open with minimal data
    }
  };
  const openDeleteDialog = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };
  const openImageManager = (product: Product) => {
    setSelectedProduct(product);
    setIsImageManagerOpen(true);
  };
  const openVariantManager = (product: Product) => {
    setSelectedProduct(product);
    setIsVariantManagerOpen(true);
  };
  const openStockManager = (product: Product) => {
    console.log('openStockManager called with product:', product);
    setSelectedProduct(product);
    setIsStockManagerOpen(true);
    console.log('isStockManagerOpen set to true');
  };

  // Action handlers
  const handleToggleStatus = async (id: number) => {
    await toggleProductStatus(id);
  };

  const handleDelete = async (product: Product) => {
    const success = await deleteProduct(product.id);
    if (success) {
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
    }
  };

  // Calculate stats
  const activeProducts = products.filter(p => p.isActive).length;
  const lowStockProducts = products.filter(p => p.hasLowStock || false).length;
  const outOfStockProducts = products.filter(p => p.hasOutOfStock || false).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Management</h1>
            <p className="text-gray-600">Manage your product catalog, inventory, and variants</p>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex items-center gap-3">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="flex items-center gap-2"
            >
              <Grid3X3 className="h-4 w-4" />
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="flex items-center gap-2"
            >
              <List className="h-4 w-4" />
              List
            </Button>
            
            {/* Refresh Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={fetchProducts}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh
            </Button>
            
            {/* Create Product Button */}
            <Button
              onClick={openCreateDialog}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Create Product
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Products</p>
                <p className="text-2xl font-bold text-green-600">{activeProducts}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-600">{lowStockProducts}</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">{outOfStockProducts}</p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Button
            onClick={openCreateDialog}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Product
          </Button>
          
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <ProductFilters
        filters={filters}
        categories={categories}
        loading={loading}
        onFiltersChange={updateFilters}
        onReset={resetFilters}
      />

      {/* Products Grid/List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : products.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center">
            <div className="text-gray-400 mb-4">
              <BarChart3 className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">
              {filters.search || filters.category || filters.status || filters.featured || filters.onSale
                ? 'Try adjusting your filters or search terms'
                : 'Get started by creating your first product'}
            </p>
            {!filters.search && !filters.category && !filters.status && !filters.featured && !filters.onSale && (
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Create Product
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Products Display */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              {products.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  viewMode="grid"
                  onView={openViewDialog}
                  onEdit={openEditDialog}
                  onDelete={openDeleteDialog}
                  onToggleStatus={handleToggleStatus}
                  onImageManager={openImageManager}
                  onVariantManager={openVariantManager}
                  onStockManager={openStockManager}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {products.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  viewMode="list"
                  onView={openViewDialog}
                  onEdit={openEditDialog}
                  onDelete={openDeleteDialog}
                  onToggleStatus={handleToggleStatus}
                  onImageManager={openImageManager}
                  onVariantManager={openVariantManager}
                  onStockManager={openStockManager}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center mt-8">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateFilters({ page: Math.max(1, filters.page - 1) })}
                  disabled={filters.page <= 1}
                >
                  Previous
                </Button>
                
                <span className="text-sm text-gray-600">
                  Page {filters.page} of {totalPages}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateFilters({ page: Math.min(totalPages, filters.page + 1) })}
                  disabled={filters.page >= totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Floating Action Button - Mobile Only */}
      <Button
        onClick={openCreateDialog}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-50 md:hidden"
        size="lg"
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : (
          <Plus className="h-6 w-6" />
        )}
      </Button>

      {/* Create Product Dialog */}
      <CreateProductDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={async (data) => {
          const newProduct = await createProduct(data);
          if (newProduct) {
            setIsCreateDialogOpen(false);
          }
        }}
        categories={categories}
        categoriesLoading={loading}
      />

      {/* Variant Management Dialog */}
      {selectedProduct && (
        <VariantManagementDialog
          isOpen={isVariantManagerOpen}
          onClose={() => {
            setIsVariantManagerOpen(false);
            setSelectedProduct(null);
          }}
          productId={selectedProduct.id}
          productName={selectedProduct.name}
          existingVariants={selectedProduct.variants || []}
          onVariantsChange={() => {
            // Refresh products to get updated variant data
            fetchProducts();
            toast.success('Variants updated successfully');
          }}
        />
      )}

      {/* Image Manager Dialog */}
      {selectedProduct && (
        <ProductImageManagerDialog
          isOpen={isImageManagerOpen}
          onClose={() => {
            setIsImageManagerOpen(false);
            setSelectedProduct(null);
          }}
          productId={selectedProduct.id}
          productName={selectedProduct.name}
          existingImages={selectedProduct.images || []}
          onImagesChange={() => {
            // Refresh products to get updated image data
            fetchProducts();
            toast.success('Images updated successfully');
          }}
        />
      )}

      {/* Stock Management Dialog */}
      {selectedProduct && (
        <>
          {console.log('Rendering StockManagementDialog with:', { isStockManagerOpen, selectedProduct: selectedProduct?.id })}
          <StockManagementDialog
            isOpen={isStockManagerOpen}
            onClose={() => {
              console.log('StockManagementDialog onClose called');
              setIsStockManagerOpen(false);
              setSelectedProduct(null);
            }}
            onSubmit={async (data) => {
              try {
                const updatedProduct = await updateStockAndSettings(
                  data.productId,
                  {
                    lowStockThreshold: data.lowStockThreshold,
                    allowBackorder: data.allowBackorder,
                    variants: data.variants
                  }
                );
                
                if (updatedProduct) {
                  // Close the dialog
                  setIsStockManagerOpen(false);
                  setSelectedProduct(null);
                }
              } catch (error) {
                console.error('Error updating stock and settings:', error);
                // Error handling is already done in the hook
              }
            }}
            product={selectedProduct}
          />
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              Delete Product
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
            
            {selectedProduct && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Package className="h-4 w-4 text-gray-600" />
                  </div>
                  <p className="font-medium text-gray-900 truncate">
                    {selectedProduct.name}
                  </p>
                </div>
                <p className="text-sm text-gray-600">
                  SKU: {selectedProduct.sku || 'N/A'}
                </p>
                <p className="text-sm text-gray-600">
                  Category: {selectedProduct.category?.name || 'N/A'}
                </p>
              </div>
            )}
            
            <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-700 font-medium">⚠️ Warning:</p>
              <ul className="text-sm text-red-600 mt-1 space-y-1">
                <li>• All product data will be permanently deleted</li>
                <li>• Product images and variants will be removed</li>
                <li>• This action cannot be undone</li>
              </ul>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedProduct(null);
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedProduct && handleDelete(selectedProduct)}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Product
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Product Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={(open) => {
        setIsViewDialogOpen(open);
        if (!open) {
          setSelectedProduct(null);
          setIsLoadingProductDetails(false);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              Product Details
            </DialogTitle>
          </DialogHeader>
          
          {isLoadingProductDetails && (
            <div className="py-12 flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
              <p className="text-gray-600">Loading product details...</p>
            </div>
          )}

          {selectedProduct && !isLoadingProductDetails && (
            <div className="py-4 space-y-6">
              {/* Product Header - Mobile Responsive */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Product Images */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Product Images</h3>
                  {selectedProduct.images && selectedProduct.images.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {selectedProduct.images.map((image, index) => (
                        <div key={image.id} className="relative group">
                          <img
                            src={image.url.startsWith('http') ? image.url : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${image.url}`}
                            alt={image.alt || `Product image ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-gray-200"
                          />
                          {image.isPrimary && (
                            <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                              Primary
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <span className="text-white text-sm font-medium">View</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">No images uploaded</p>
                    </div>
                  )}
                </div>

                {/* Basic Product Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="text-sm font-medium text-gray-600 min-w-[80px]">Name:</span>
                      <span className="text-gray-900 font-medium">{selectedProduct.name}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="text-sm font-medium text-gray-600 min-w-[80px]">SKU:</span>
                      <span className="text-gray-900">{selectedProduct.sku || 'N/A'}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="text-sm font-medium text-gray-600 min-w-[80px]">Category:</span>
                      <span className="text-gray-900">{selectedProduct.category?.name || 'N/A'}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="text-sm font-medium text-gray-600 min-w-[80px]">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedProduct.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedProduct.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Pricing</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Regular Price</p>
                    <p className="text-lg font-bold text-gray-900">${selectedProduct.price}</p>
                  </div>
                  {selectedProduct.comparePrice && (
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Compare Price</p>
                      <p className="text-lg font-bold text-gray-500 line-through">${selectedProduct.comparePrice}</p>
                    </div>
                  )}
                  {selectedProduct.salePrice && (
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Sale Price</p>
                      <p className="text-lg font-bold text-green-600">${selectedProduct.salePrice}</p>
                    </div>
                  )}
                  {selectedProduct.costPrice && (
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Cost Price</p>
                      <p className="text-lg font-bold text-gray-900">${selectedProduct.costPrice}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Description */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">Description</h3>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedProduct.description || 'No description available'}
                  </p>
                </div>
              </div>

              {/* Product Variants */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">Variants</h3>
                {selectedProduct.variants && selectedProduct.variants.length > 0 ? (
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Color</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedProduct.variants.map((variant) => (
                            <tr key={variant.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-900">{variant.size || 'N/A'}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                <div className="flex items-center gap-2">
                                  {variant.color && (
                                    <div 
                                      className="w-4 h-4 rounded-full border border-gray-300"
                                      style={{ backgroundColor: variant.colorCode || variant.color }}
                                    />
                                  )}
                                  <span>{variant.color || 'N/A'}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">{variant.stock || 0}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{variant.sku || 'N/A'}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                ${variant.price || selectedProduct.price}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  variant.isActive 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {variant.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No variants configured</p>
                  </div>
                )}
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Inventory</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Stock:</span>
                      <span className="font-medium">{selectedProduct.totalStock || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Weight:</span>
                      <span className="font-medium">{selectedProduct.weight ? `${selectedProduct.weight}g` : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Low Stock:</span>
                      <span className={`font-medium ${selectedProduct.hasLowStock ? 'text-orange-600' : 'text-gray-900'}`}>
                        {selectedProduct.hasLowStock ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Out of Stock:</span>
                      <span className={`font-medium ${selectedProduct.hasOutOfStock ? 'text-red-600' : 'text-gray-900'}`}>
                        {selectedProduct.hasOutOfStock ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h4 className="font-medium text-gray-900 mb-2">SEO & Metadata</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Slug:</span>
                      <span className="font-medium font-mono text-xs">{selectedProduct.slug}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Meta Title:</span>
                      <span className="font-medium">{selectedProduct.metaTitle || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Meta Description:</span>
                      <span className="font-medium text-xs truncate max-w-[120px]">
                        {selectedProduct.metaDescription || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Timestamps</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span className="font-medium">{selectedProduct.createdAt ? new Date(selectedProduct.createdAt).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Updated:</span>
                      <span className="font-medium">{selectedProduct.updatedAt ? new Date(selectedProduct.updatedAt).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    {selectedProduct.saleEndDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sale Ends:</span>
                        <span className="font-medium">{new Date(selectedProduct.saleEndDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => {
                setIsViewDialogOpen(false);
                setSelectedProduct(null);
                setIsLoadingProductDetails(false);
              }}
              className="flex-1 sm:flex-none sm:px-6"
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setIsViewDialogOpen(false);
                setIsLoadingProductDetails(false);
                openEditDialog(selectedProduct!);
              }}
              className="flex-1 sm:flex-none sm:px-6"
            >
              Edit Product
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      {selectedProduct && (
        <EditProductDialog
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setSelectedProduct(null);
            setIsLoadingProductEdit(false);
          }}
          onSubmit={async (data) => {
            await updateProduct(data);
            fetchProducts(); // Refresh the products list
          }}
          product={selectedProduct}
          categories={categories || []}
          categoriesLoading={loading || isLoadingProductEdit}
        />
      )}
    </div>
  );
};

export default Products;

