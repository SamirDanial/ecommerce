import { useState, useRef, useEffect } from "react";
import { Product } from "../types";

export interface FilterState {
  search: string;
  category: string;
  size: string;
  color: string;
  minPrice: string;
  maxPrice: string;
  inStock: boolean;
  sort: string;
  rating: string;
  onSale: boolean;
  featured: boolean;
}

export const useProductFilters = (products: Product[]) => {
  const [draftFilters, setDraftFilters] = useState<FilterState>({
    search: "",
    category: "all",
    size: "all",
    color: "all",
    minPrice: "",
    maxPrice: "",
    inStock: false,
    sort: "newest",
    rating: "any",
    onSale: false,
    featured: false,
  });

  const [appliedFilters, setAppliedFilters] = useState<FilterState>({
    search: "",
    category: "all",
    size: "all",
    color: "all",
    minPrice: "",
    maxPrice: "",
    inStock: false,
    sort: "newest",
    rating: "any",
    onSale: false,
    featured: false,
  });

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Reset draft filters to applied filters when sheet opens
  useEffect(() => {
    if (isSheetOpen) {
      setDraftFilters(appliedFilters);
    }
  }, [isSheetOpen, appliedFilters]);

  // Available sizes and colors
  const sizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
  const colors = [
    "Black", "White", "Red", "Blue", "Green", "Yellow", 
    "Purple", "Pink", "Orange", "Brown", "Gray", "Navy"
  ];

  const handleFilterChange = (
    key: keyof FilterState,
    value: string | boolean
  ) => {
    setDraftFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = async () => {
    const resetFilters = {
      search: "",
      category: "all",
      size: "all",
      color: "all",
      minPrice: "",
      maxPrice: "",
      inStock: false,
      sort: "newest",
      rating: "any",
      onSale: false,
      featured: false,
    };
    setDraftFilters(resetFilters);
    setAppliedFilters(resetFilters);
    setIsSheetOpen(false); // Close the sheet after clearing
  };

  const getActiveFiltersCount = () => {
    return Object.values(appliedFilters).filter(value => 
      value !== "" && value !== false && value !== "all" && value !== "any" && value !== "newest"
    ).length;
  };

  const hasActiveFilters = () => {
    return getActiveFiltersCount() > 0;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Apply the draft filters
    setAppliedFilters(draftFilters);
    setIsSheetOpen(false);
  };

  // Filter products based on applied filters
  const filteredProducts = products.filter(product => {
    if (appliedFilters.search && !product.name.toLowerCase().includes(appliedFilters.search.toLowerCase())) {
      return false;
    }
    if (appliedFilters.category && appliedFilters.category !== "all" && product.category?.name !== appliedFilters.category) {
      return false;
    }
    if (appliedFilters.size && appliedFilters.size !== "all" && product.variants && !product.variants.some(v => v.size === appliedFilters.size)) {
      return false;
    }
    if (appliedFilters.color && appliedFilters.color !== "all" && product.variants && !product.variants.some(v => v.color === appliedFilters.color)) {
      return false;
    }
    if (appliedFilters.minPrice && product.price < parseFloat(appliedFilters.minPrice)) {
      return false;
    }
    if (appliedFilters.maxPrice && product.price > parseFloat(appliedFilters.maxPrice)) {
      return false;
    }
    if (appliedFilters.inStock && product.variants && !product.variants.some(v => v.stock > 0)) {
      return false;
    }
    if (appliedFilters.onSale && !product.isOnSale) {
      return false;
    }
    if (appliedFilters.featured && !product.isFeatured) {
      return false;
    }
    if (appliedFilters.rating && appliedFilters.rating !== "any" && product.averageRating && product.averageRating < parseFloat(appliedFilters.rating)) {
      return false;
    }
    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (appliedFilters.sort) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return (b.averageRating || 0) - (a.averageRating || 0);
      case "name":
        return a.name.localeCompare(b.name);
      case "newest":
      default:
        // Handle case where createdAt might be undefined (from admin list)
        if (!a.createdAt || !b.createdAt) return 0;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return {
    filters: draftFilters, // Use draft filters for UI
    setFilters: setDraftFilters, // For backward compatibility
    appliedFilters, // New: the actually applied filters
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
    filteredProducts: sortedProducts,
  };
};
