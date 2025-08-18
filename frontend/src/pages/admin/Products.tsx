import React, { useState } from 'react';
import { 
  Plus, 
  Grid3X3, 
  List, 
  Upload,
  Download,
  BarChart3,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { useProducts } from '../../hooks/useProducts';
import { ProductCard } from '../../components/admin/ProductCard';
import { ProductFilters } from '../../components/admin/ProductFilters';
import { CreateProductDialog } from '../../components/admin/CreateProductDialog';
import { VariantManagementDialog } from '../../components/admin/VariantManagementDialog';
import { Product } from '../../types';
import { toast } from 'sonner';

const Products: React.FC = () => {
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
    toggleProductStatus,
    deleteProduct,
    fetchProducts
  } = useProducts();

  // Debug logging
  console.log('Products page - categories:', categories);
  console.log('Products page - categories length:', categories?.length);

  // UI State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isImageManagerOpen, setIsImageManagerOpen] = useState(false);
  const [isVariantManagerOpen, setIsVariantManagerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Dialog handlers
  const openCreateDialog = () => setIsCreateDialogOpen(true);
  const openEditDialog = (product: Product) => {
    setSelectedProduct(product);
    setIsEditDialogOpen(true);
  };
  const openViewDialog = (product: Product) => {
    setSelectedProduct(product);
    setIsViewDialogOpen(true);
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

      {/* Dialogs will be implemented next */}
      {/* Edit Product Dialog */}
      {/* View Product Dialog */}
      {/* Delete Confirmation Dialog */}
      {/* Image Manager Dialog */}
    </div>
  );
};

export default Products;

