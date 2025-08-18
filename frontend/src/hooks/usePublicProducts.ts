import { useState, useEffect, useCallback } from 'react';
import { productService, categoryService } from '../services/api';
import { Product, Category } from '../types';

export const usePublicProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch products
  const fetchProducts = useCallback(async (params?: {
    category?: string;
    search?: string;
    sort?: string;
    limit?: number;
    page?: number;
    size?: string;
    color?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    rating?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const productsData = await productService.getAll(params);
      setProducts(productsData);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const categoriesData = await categoryService.getAll();
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
    }
  }, []);

  // Load initial data
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  return {
    products,
    categories,
    loading,
    error,
    fetchProducts,
    fetchCategories
  };
};
