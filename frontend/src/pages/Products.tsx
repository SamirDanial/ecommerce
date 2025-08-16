import React from "react";
import { Button } from "../components/ui/button";
import { X } from "lucide-react";
import { Sheet } from "../components/ui/sheet";

// Custom hooks
import { useProducts } from "../hooks/useProducts";
import { useProductFilters } from "../hooks/useProductFilters";
import { useViewMode } from "../hooks/useViewMode";

// Components
import { ProductsHeader } from "../components/products/ProductsHeader";
import { ProductsBanner } from "../components/products/ProductsBanner";
import { ProductsGrid } from "../components/products/ProductsGrid";
import { ProductsFilters } from "../components/products/ProductsFilters";

const Products: React.FC = () => {
  // Custom hooks for data and logic
  const { products, categories, loading, error } = useProducts();
  const { viewMode, setViewMode } = useViewMode();
  const {
    filters,
    showAdvancedFilters,
    setShowAdvancedFilters,
    isSheetOpen,
    setIsSheetOpen,
    searchInputRef,
    sizes,
    colors,
    handleFilterChange,
    clearFilters,
    getActiveFiltersCount,
    hasActiveFilters,
    handleFormSubmit,
    filteredProducts,
  } = useProductFilters(products);

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading products...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Engaging Banner */}
        <ProductsBanner />

        {/* Header with Controls */}
        <ProductsHeader
          productCount={filteredProducts.length}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onFilterClick={() => setIsSheetOpen(true)}
          activeFiltersCount={getActiveFiltersCount()}
        />

        {/* Filter Sheet */}
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <ProductsFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onFormSubmit={handleFormSubmit}
            onClearFilters={clearFilters}
            showAdvancedFilters={showAdvancedFilters}
            onToggleAdvancedFilters={() => setShowAdvancedFilters(!showAdvancedFilters)}
            categories={categories}
            sizes={sizes}
            colors={colors}
            searchInputRef={searchInputRef}
            activeFiltersCount={getActiveFiltersCount()}
            hasActiveFilters={hasActiveFilters()}
          />
        </Sheet>

        {/* Active Filters Clear Button */}
        {hasActiveFilters() && (
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="ghost" 
              onClick={clearFilters}
              className="text-muted-foreground"
            >
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        )}

        {/* Products Grid */}
        <ProductsGrid 
          products={filteredProducts} 
          viewMode={viewMode} 
        />
      </div>
    </div>
  );
};

export default Products;
