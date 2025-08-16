import React from "react";
import { Package } from "lucide-react";
import { ViewMode } from "../../hooks/useViewMode";
import ProductCard from "../ProductCard";

import { Product } from "../../types";

interface CategoryProductsGridProps {
  products: Product[];
  viewMode: ViewMode;
  onProductClick: (product: Product) => void;
  totalProducts: number;
}

export const CategoryProductsGrid: React.FC<CategoryProductsGridProps> = ({
  products,
  viewMode,
  onProductClick,
  totalProducts,
}) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No products found</h3>
        <p className="text-muted-foreground mb-4">
          Try adjusting your search terms or filters to find what you're looking for.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          Showing {products.length} of {totalProducts} products
        </p>
      </div>

            {/* Products Grid */}
      <div className={`grid gap-4 sm:gap-6 ${
        viewMode === 'grid' 
          ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
          : 'grid-cols-1'
      }`}>
        {products.map((product) => (
          <div key={product.id} onClick={() => onProductClick(product)}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
};
