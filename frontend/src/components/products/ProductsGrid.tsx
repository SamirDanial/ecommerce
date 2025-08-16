import React from "react";
import { Product } from "../../types";
import ProductCard from "../ProductCard";
import { ViewMode } from "../../hooks/useViewMode";

interface ProductsGridProps {
  products: Product[];
  viewMode: ViewMode;
}

export const ProductsGrid: React.FC<ProductsGridProps> = ({
  products,
  viewMode,
}) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">
          No products found matching your criteria.
        </p>
      </div>
    );
  }

  return (
    <div
      className={
        viewMode === "grid"
          ? "grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 lg:gap-6"
          : "space-y-3 sm:space-y-4"
      }
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
