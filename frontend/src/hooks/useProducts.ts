import { useState, useEffect, useCallback } from 'react';
import { useClerkAuth } from './useClerkAuth';
import { ProductService, CategoryService } from '../services/productService';
import { Product, Category, ProductFilters, CreateProductData, UpdateProductData } from '../types';
import { toast } from 'sonner';

export const useProducts = () => {
  const { getToken } = useClerkAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ProductFilters>({
    page: 1,
    limit: 12,
    search: '',
    category: 'all',
    status: 'all',
    featured: 'all',
    onSale: 'all',
    stockStatus: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) throw new Error('No authentication token');

      const result = await ProductService.getProducts(filters, token);
      setProducts(result.products);
      setTotalProducts(result.totalProducts);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [filters, getToken]);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      console.log('Fetching categories...');
      // Categories are public, no auth required
      const categories = await CategoryService.getCategories();
      console.log('Categories fetched:', categories);
      
      // Ensure categories is an array
      if (Array.isArray(categories)) {
        console.log('Setting categories:', categories);
        setCategories(categories);
      } else {
        console.error('Categories is not an array:', categories);
        setCategories([]);
        toast.error('Invalid categories data received');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
      setCategories([]); // Set empty array on error
    }
  }, []);

  // Create product
  const createProduct = useCallback(async (data: CreateProductData): Promise<Product | null> => {
    try {
      const token = await getToken();
      if (!token) throw new Error('No authentication token');

      const newProduct = await ProductService.createProduct(data, token);
      setProducts(prev => [newProduct, ...prev]);
      setTotalProducts(prev => prev + 1);
      toast.success('Product created successfully!');
      return newProduct;
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create product');
      return null;
    }
  }, [getToken]);

  // Update product
  const updateProduct = useCallback(async (data: UpdateProductData): Promise<Product | null> => {
    try {
      const token = await getToken();
      if (!token) throw new Error('No authentication token');

      const updatedProduct = await ProductService.updateProduct(data, token);
      setProducts(prev => prev.map(p => p.id === data.id ? updatedProduct : p));
      toast.success('Product updated successfully!');
      return updatedProduct;
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update product');
      return null;
    }
  }, [getToken]);

  // Delete product
  const deleteProduct = useCallback(async (id: number): Promise<boolean> => {
    try {
      const token = await getToken();
      if (!token) throw new Error('No authentication token');

      await ProductService.deleteProduct(id, token);
      setProducts(prev => prev.filter(p => p.id !== id));
      setTotalProducts(prev => prev - 1);
      toast.success('Product deleted successfully!');
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete product');
      return false;
    }
  }, [getToken]);

  // Toggle product status
  const toggleProductStatus = useCallback(async (id: number): Promise<boolean> => {
    try {
      const token = await getToken();
      if (!token) throw new Error('No authentication token');

      const updatedProduct = await ProductService.toggleProductStatus(id, token);
      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
      toast.success(`Product ${updatedProduct.isActive ? 'activated' : 'deactivated'} successfully!`);
      return true;
    } catch (error) {
      console.error('Error toggling product status:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to toggle product status');
      return false;
    }
  }, [getToken]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<ProductFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1 // Reset to first page when filters change
    }));
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({
      page: 1,
      limit: 12,
      search: '',
      category: 'all',
      status: 'all',
      featured: 'all',
      onSale: 'all',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  }, []);

  // Load initial data
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    // State
    products,
    categories,
    loading,
    filters,
    totalProducts,
    totalPages,
    
    // Actions
    fetchProducts,
    fetchCategories,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
    updateFilters,
    resetFilters,
    
    // Computed values
    hasProducts: products.length > 0,
    hasCategories: categories.length > 0
  };
};
