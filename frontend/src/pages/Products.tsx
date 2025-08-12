import React, { useState, useEffect } from "react";
import { Product, Category } from "../types";
import { productService } from "../services/api";
import ProductCard from "../components/ProductCard";
import { Button } from "../components/ui/button";

import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Separator } from "../components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Checkbox } from "../components/ui/checkbox";
import { Label } from "../components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "../components/ui/sheet";
import {
  Search,
  Filter,
  Grid3X3,
  List,
  ChevronDown,
  X,
  SlidersHorizontal,
  Settings,
  Tag,
  Palette,
  Ruler,
  DollarSign,
  Package,
  Star,
  SortAsc,
  SortDesc,
} from "lucide-react";
import { categoryService } from '../services/api';

interface FilterState {
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

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    category: "",
    size: "",
    color: "",
    minPrice: "",
    maxPrice: "",
    inStock: false,
    sort: "newest",
    rating: "",
    onSale: false,
    featured: false,
  });

  const searchInputRef = React.useRef<HTMLInputElement>(null);



  // Available sizes and colors
  const sizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
  const colors = [
    "Black",
    "White",
    "Red",
    "Blue",
    "Green",
    "Yellow",
    "Purple",
    "Pink",
    "Gray",
    "Brown",
  ];
  const ratings = ["4+", "3+", "2+", "1+"];
  const sortOptions = [
    { value: "newest", label: "Newest First", icon: SortDesc },
    { value: "oldest", label: "Oldest First", icon: SortAsc },
    { value: "price_asc", label: "Price: Low to High", icon: SortAsc },
    { value: "price_desc", label: "Price: High to Low", icon: SortDesc },
    { value: "name_asc", label: "Name: A to Z", icon: SortAsc },
    { value: "name_desc", label: "Name: Z to A", icon: SortDesc },
    { value: "rating_desc", label: "Highest Rated", icon: Star },
    { value: "rating_asc", label: "Lowest Rated", icon: Star },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Load all products by default (no filters applied)
        const [productsData, categoriesData] = await Promise.all([
          productService.getAll({}), // Send empty params to get all products
          categoryService.getAll(),
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (err) {
        setError("Failed to fetch products");
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Only run on component mount

  const handleFilterChange = (
    key: keyof FilterState,
    value: string | boolean
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handlePriceChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "minPrice" | "maxPrice"
  ) => {
    e.preventDefault();
    handleFilterChange(type, e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const handleSelectChange = (key: keyof FilterState, value: string) => {
    handleFilterChange(key, value === "all" ? "" : value);
  };



  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert rating string to numeric value (e.g., "4+" -> 4)
    let ratingValue: number | undefined;
    if (filters.rating) {
      const ratingMatch = filters.rating.match(/(\d+)/);
      if (ratingMatch) {
        ratingValue = parseInt(ratingMatch[1]);
      }
    }
    
    // Collect all form data
    const formData = {
      search: filters.search,
      category: filters.category,
      size: filters.size,
      color: filters.color,
      minPrice: filters.minPrice ? parseFloat(filters.minPrice) : undefined,
      maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
      inStock: filters.inStock,
      sort: filters.sort,
      rating: ratingValue ? ratingValue.toString() : undefined,
      onSale: filters.onSale,
      featured: filters.featured,
    };

    try {
      setLoading(true);
      setError(null);
      
      const [productsData, categoriesData] = await Promise.all([
        productService.getAll(formData),
        categoryService.getAll(),
      ]);
      
      setProducts(productsData);
      setCategories(categoriesData);
      setIsSheetOpen(false); // Close the sheet after applying filters
    } catch (err) {
      setError("Failed to fetch filtered products");
      console.error("Error fetching filtered products:", err);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = async () => {
    // Clear all filter states
    setFilters({
      search: "",
      category: "",
      size: "",
      color: "",
      minPrice: "",
      maxPrice: "",
      inStock: false,
      sort: "newest",
      rating: "",
      onSale: false,
      featured: false,
    });


    // Reload all products
    try {
      setLoading(true);
      setError(null);
      
      const [productsData, categoriesData] = await Promise.all([
        productService.getAll({}), // Send empty params to get all products
        categoryService.getAll(),
      ]);
      
      setProducts(productsData);
      setCategories(categoriesData);
      setIsSheetOpen(false); // Close the sheet after clearing filters
    } catch (err) {
      setError("Failed to fetch products");
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const hasActiveFilters = () => {
    return (
      (filters.search && filters.search !== "") ||
      (filters.category && filters.category !== "") ||
      (filters.size && filters.size !== "") ||
      (filters.color && filters.color !== "") ||
      filters.minPrice ||
      filters.maxPrice ||
      filters.inStock ||
      filters.sort !== "newest" ||
      filters.rating ||
      filters.onSale ||
      filters.featured
    );
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search && filters.search !== "") count++;
    if (filters.category && filters.category !== "") count++;
    if (filters.size && filters.size !== "") count++;
    if (filters.color && filters.color !== "") count++;
    if (filters.minPrice || filters.maxPrice) count++;
    if (filters.inStock) count++;
    if (filters.sort !== "newest") count++;
    if (filters.rating) count++;
    if (filters.onSale) count++;
    if (filters.featured) count++;
    return count;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading products...</p>
        </div>
      </div>
    );
  }

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
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold">Our Products</h1>
            <p className="text-muted-foreground mt-2">
              {products.length} product{products.length !== 1 ? 's' : ''} found
            </p>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                setViewMode('grid');
              }}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                setViewMode('list');
              }}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filter Toggle and Active Filters */}
        <div className="flex items-center justify-between mb-6">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 h-12 px-6"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {getActiveFiltersCount() > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {getActiveFiltersCount()}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-md bg-background shadow-2xl">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex-shrink-0 flex items-center justify-between p-6 border-b">
                  <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">Filters</h2>
                    {getActiveFiltersCount() > 0 && (
                      <Badge variant="secondary">{getActiveFiltersCount()}</Badge>
                    )}
                  </div>
                </div>

                {/* Filter Content */}
                <form onSubmit={handleFormSubmit} className="flex flex-col flex-1 min-h-0">
                  <div className="flex-1 overflow-y-auto p-6 space-y-8 min-h-0 scrollbar-hide">
                    <div
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          e.stopPropagation();
                          return false;
                        }
                      }}
                    >
                      {/* Basic Filters */}
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Filter className="h-4 w-4" />
                          Basic Filters
                        </h3>

                        {/* Search Filter */}
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <Search className="h-4 w-4" />
                            Search Products
                          </Label>
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
                            <input
                              ref={searchInputRef}
                              placeholder="Search products..."
                              value={filters.search}
                              onChange={(e) => handleFilterChange("search", e.target.value)}
                              className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-4 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              type="text"
                              autoComplete="off"
                            />
                          </div>
                        </div>

                        {/* Category Filter */}
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <Tag className="h-4 w-4" />
                            Category
                          </Label>
                          <Select
                            value={filters.category || "all"}
                            onValueChange={(value) =>
                              handleSelectChange("category", value)
                            }
                          >
                            <SelectTrigger type="button">
                              <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Categories</SelectItem>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.slug}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Size Filter */}
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <Ruler className="h-4 w-4" />
                            Size
                          </Label>
                          <Select
                            value={filters.size || "all"}
                            onValueChange={(value) =>
                              handleSelectChange("size", value)
                            }
                          >
                            <SelectTrigger type="button">
                              <SelectValue placeholder="All Sizes" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Sizes</SelectItem>
                              {sizes.map((size) => (
                                <SelectItem key={size} value={size}>
                                  {size}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Color Filter */}
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <Palette className="h-4 w-4" />
                            Color
                          </Label>
                          <Select
                            value={filters.color || "all"}
                            onValueChange={(value) =>
                              handleSelectChange("color", value)
                            }
                          >
                            <SelectTrigger type="button">
                              <SelectValue placeholder="All Colors" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Colors</SelectItem>
                              {colors.map((color) => (
                                <SelectItem key={color} value={color}>
                                  {color}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <Separator />

                      {/* Advanced Filters */}
                      <div className="space-y-6">
                        <button
                          type="button"
                          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                          className="flex items-center justify-between w-full text-left"
                        >
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            Advanced Filters
                          </h3>
                          <ChevronDown 
                            className={`h-4 w-4 transition-transform duration-200 ${
                              showAdvancedFilters ? 'rotate-180' : ''
                            }`} 
                          />
                        </button>

                        {showAdvancedFilters && (
                          <div className="space-y-6 animate-in slide-in-from-top-2 duration-200">
                            {/* Price Range */}
                            <div className="space-y-2">
                              <Label className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                Price Range
                              </Label>
                              <div className="flex gap-2">
                                <Input
                                  placeholder="Min"
                                  type="number"
                                  value={filters.minPrice}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePriceChange(e, "minPrice")}
                                  onKeyDown={handleKeyDown}
                                  className="flex-1"
                                />
                                <Input
                                  placeholder="Max"
                                  type="number"
                                  value={filters.maxPrice}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePriceChange(e, "maxPrice")}
                                  onKeyDown={handleKeyDown}
                                  className="flex-1"
                                />
                              </div>
                            </div>

                            {/* Rating Filter */}
                            <div className="space-y-2">
                              <Label className="flex items-center gap-2">
                                <Star className="h-4 w-4" />
                                Minimum Rating
                              </Label>
                              <Select
                                value={filters.rating || "all"}
                                onValueChange={(value) =>
                                  handleSelectChange("rating", value)
                                }
                              >
                                <SelectTrigger type="button">
                                  <SelectValue placeholder="Any Rating" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">Any Rating</SelectItem>
                                  {ratings.map((rating) => (
                                    <SelectItem key={rating} value={rating}>
                                      {rating} Stars & Up
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Sort Options */}
                            <div className="space-y-2">
                              <Label className="flex items-center gap-2">
                                <SortAsc className="h-4 w-4" />
                                Sort By
                              </Label>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className="w-full justify-between"
                                    type="button"
                                  >
                                    {sortOptions.find(
                                      (option) => option.value === filters.sort
                                    )?.label || "Sort by"}
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-full min-w-[200px]">
                                  {sortOptions.map((option) => {
                                    const IconComponent = option.icon;
                                    return (
                                      <DropdownMenuItem
                                        key={option.value}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          handleFilterChange("sort", option.value);
                                        }}
                                        className={
                                          filters.sort === option.value
                                            ? "bg-accent"
                                            : ""
                                        }
                                      >
                                        <IconComponent className="h-4 w-4 mr-2" />
                                        {option.label}
                                      </DropdownMenuItem>
                                    );
                                  })}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            {/* Checkbox Filters */}
                            <div className="space-y-4">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="inStock"
                                  checked={filters.inStock}
                                  onCheckedChange={(checked) =>
                                    handleFilterChange("inStock", checked as boolean)
                                  }
                                  onKeyDown={(e) =>
                                    e.key === "Enter" && e.preventDefault()
                                  }
                                />
                                <Label
                                  htmlFor="inStock"
                                  className="flex items-center gap-2"
                                >
                                  <Package className="h-4 w-4" />
                                  In Stock Only
                                </Label>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="onSale"
                                  checked={filters.onSale}
                                  onCheckedChange={(checked) =>
                                    handleFilterChange("onSale", checked as boolean)
                                  }
                                  onKeyDown={(e) =>
                                    e.key === "Enter" && e.preventDefault()
                                  }
                                />
                                <Label
                                  htmlFor="onSale"
                                  className="flex items-center gap-2"
                                >
                                  <Tag className="h-4 w-4" />
                                  On Sale Only
                                </Label>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="featured"
                                  checked={filters.featured}
                                  onCheckedChange={(checked) =>
                                    handleFilterChange("featured", checked as boolean)
                                  }
                                  onKeyDown={(e) =>
                                    e.key === "Enter" && e.preventDefault()
                                  }
                                />
                                <Label
                                  htmlFor="featured"
                                  className="flex items-center gap-2"
                                >
                                  <Star className="h-4 w-4" />
                                  Featured Products
                                </Label>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex-shrink-0 border-t p-6 space-y-4">
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        className="flex-1"
                      >
                        Apply Filters
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={async (e) => {
                          e.preventDefault();
                          await clearFilters();
                        }}
                        className="flex-1"
                      >
                        Clear All
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      {getActiveFiltersCount()} filter
                      {getActiveFiltersCount() !== 1 ? "s" : ""} applied
                    </p>
                  </div>
                </form>
              </div>
            </SheetContent>
          </Sheet>

          {hasActiveFilters() && (
            <Button 
              variant="ghost" 
              onClick={async (e) => {
                e.preventDefault();
                await clearFilters();
              }} 
              className="text-muted-foreground"
            >
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>

        {/* Products Grid */}
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
          }
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* No Products Found */}
        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No products found matching your criteria.
            </p>
            {hasActiveFilters() && (
              <Button
                onClick={async (e) => {
                  e.preventDefault();
                  await clearFilters();
                }}
                className="mt-4"
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
