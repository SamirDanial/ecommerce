import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, Edit, XCircle, Trash2, Eye } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '@clerk/clerk-react';
import { createAuthHeaders } from '../../lib/axios';

// Import new components
import CategoryHeader from '../../components/admin/CategoryHeader';
import CategoryFilters from '../../components/admin/CategoryFilters';
import CategoryContent from '../../components/admin/CategoryContent';

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  productCount: number;
}

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  image: string;
  isActive: boolean;
  sortOrder: number;
}

const Categories: React.FC = () => {
  const { getToken } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'sortOrder' | 'createdAt' | 'updatedAt' | 'productCount'>('sortOrder');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Form state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  
  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Image upload state
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    slug: '',
    description: '',
    image: '',
    isActive: true,
    sortOrder: 0
  });

  // Load categories
  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken({ template: 'e-commerce' });
      if (!token) {
        toast.error('Authentication token not available');
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/admin/categories`, {
        headers: createAuthHeaders(token)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCategories(data.categories);
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // Handle form input changes
  const handleInputChange = (field: keyof CategoryFormData, value: string | boolean | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-generate slug when name changes
    if (field === 'name') {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value as string)
      }));
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      image: '',
      isActive: true,
      sortOrder: 0
    });
    setEditingCategory(null);
    setSelectedImageFile(null);
    setImagePreview(null);
  };

  // Reset edit dialog image state
  const resetEditDialogImages = () => {
    setSelectedImageFile(null);
    setImagePreview(null);
  };

  // Handle image file selection
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image file size must be less than 5MB');
        return;
      }
      
      setSelectedImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload image for a category
  const uploadCategoryImage = async (categoryId: number, file: File) => {
    try {
      const token = await getToken({ template: 'e-commerce' });
      if (!token) {
        toast.error('Authentication token not available');
        return;
      }

      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/admin/categories/${categoryId}/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success('Image uploaded successfully');
          // Update the category in the list with new image
          setCategories(prevCategories => 
            prevCategories.map(cat => 
              cat.id === categoryId 
                ? { ...cat, image: data.imageUrl }
                : cat
            )
          );
          return data.imageUrl;
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(error.message || 'Failed to upload image');
      return null;
    }
  };

  // Delete category image
  const deleteCategoryImage = async (categoryId: number) => {
    try {
      const token = await getToken({ template: 'e-commerce' });
      if (!token) {
        toast.error('Authentication token not available');
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/admin/categories/${categoryId}/image`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success('Image deleted successfully');
          // Update the category in the list to remove image
          setCategories(prevCategories => 
            prevCategories.map(cat => 
              cat.id === categoryId 
                ? { ...cat, image: undefined }
                : cat
            )
          );
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
    } catch (error: any) {
      console.error('Error deleting image:', error);
      toast.error(error.message || 'Failed to delete image');
    }
  };

  // Open create dialog
  const openCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  // Open edit dialog
  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      image: category.image || '',
      isActive: category.isActive,
      sortOrder: category.sortOrder
    });
    setIsEditDialogOpen(true);
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (category: Category) => {
    setDeletingCategory(category);
    setIsDeleteDialogOpen(true);
  };

  // Create category
  const handleCreate = async () => {
    try {
      setIsSubmitting(true);
      
      if (!formData.name.trim() || !formData.slug.trim()) {
        toast.error('Name and slug are required');
        setIsSubmitting(false);
        return;
      }

      const token = await getToken({ template: 'e-commerce' });
      if (!token) {
        toast.error('Authentication token not available');
        setIsSubmitting(false);
        return;
      }

      // Create category first
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/admin/categories`, {
        method: 'POST',
        headers: createAuthHeaders(token),
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // If there's a selected image file, upload it
          if (selectedImageFile) {
            const imageUrl = await uploadCategoryImage(data.category.id, selectedImageFile);
            if (imageUrl) {
              // Update the category data with the new image URL
              data.category.image = imageUrl;
            }
          }
          
          toast.success('Category created successfully');
          setIsCreateDialogOpen(false);
          resetForm();
          loadCategories();
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
    } catch (error: any) {
      console.error('Error creating category:', error);
      const message = error.message || 'Failed to create category';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update category
  const handleUpdate = async () => {
    try {
      setIsUpdating(true);
      
      if (!editingCategory || !formData.name.trim() || !formData.slug.trim()) {
        toast.error('Name and slug are required');
        setIsUpdating(false);
        return;
      }

      // Optimistically update the category in UI immediately
      setCategories(prevCategories => 
        prevCategories.map(cat => 
          cat.id === editingCategory!.id 
            ? { ...cat, ...formData }
            : cat
        )
      );

      const token = await getToken({ template: 'e-commerce' });
      if (!token) {
        toast.error('Authentication token not available');
        // Revert the optimistic update
        setCategories(prevCategories => 
          prevCategories.map(cat => 
            cat.id === editingCategory!.id 
              ? { ...cat, ...editingCategory! }
              : cat
          )
        );
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/admin/categories/${editingCategory!.id}`, {
        method: 'PUT',
        headers: createAuthHeaders(token),
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // If there's a selected image file, upload it
          if (selectedImageFile) {
            const imageUrl = await uploadCategoryImage(editingCategory!.id, selectedImageFile);
            if (imageUrl) {
              // Update the category data with the new image URL
              data.category.image = imageUrl;
            }
          }
          
          toast.success('Category updated successfully');
          setIsEditDialogOpen(false);
          resetForm();
          // Update with the server response to ensure consistency
          setCategories(prevCategories => 
            prevCategories.map(cat => 
              cat.id === editingCategory!.id 
                ? { ...cat, ...data.category }
                : cat
            )
          );
        }
      } else {
        const errorData = await response.json();
        // Revert the optimistic update on error
        setCategories(prevCategories => 
          prevCategories.map(cat => 
            cat.id === editingCategory!.id 
              ? { ...cat, ...editingCategory! }
              : cat
          )
        );
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
    } catch (error: any) {
      console.error('Error updating category:', error);
      const message = error.message || 'Failed to update category';
      toast.error(message);
      // Revert the optimistic update on error
      setCategories(prevCategories => 
        prevCategories.map(cat => 
          cat.id === editingCategory!.id 
            ? { ...cat, ...editingCategory! }
            : cat
        )
      );
    } finally {
      setIsUpdating(false);
    }
  };



  // Confirm and execute deletion
  const confirmDelete = async () => {
    if (!deletingCategory) return;
    
    try {
      setIsDeleting(true);
      
      // Optimistically remove the category from UI immediately
      setCategories(prevCategories => 
        prevCategories.filter(cat => cat.id !== deletingCategory.id)
      );

      const token = await getToken({ template: 'e-commerce' });
      if (!token) {
        toast.error('Authentication token not available');
        // Revert the optimistic update
        setCategories(prevCategories => [...prevCategories, deletingCategory]);
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/admin/categories/${deletingCategory.id}`, {
        method: 'DELETE',
        headers: createAuthHeaders(token)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success('Category deleted successfully');
          // Category already removed from UI, no need to update
        }
      } else {
        const errorData = await response.json();
        // Revert the optimistic update on error
        setCategories(prevCategories => [...prevCategories, deletingCategory]);
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
    } catch (error: any) {
      console.error('Error deleting category:', error);
      const message = error.message || 'Failed to delete category';
      toast.error(message);
      // Revert the optimistic update on error
      setCategories(prevCategories => [...prevCategories, deletingCategory]);
    } finally {
      // Close dialog and reset state
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setDeletingCategory(null);
    }
  };

  // Toggle category status
  const handleToggleStatus = async (category: Category) => {
    try {
      // Optimistically update the UI immediately
      setCategories(prevCategories => 
        prevCategories.map(cat => 
          cat.id === category.id 
            ? { ...cat, isActive: !cat.isActive }
            : cat
        )
      );

      const token = await getToken({ template: 'e-commerce' });
      if (!token) {
        toast.error('Authentication token not available');
        // Revert the optimistic update
        setCategories(prevCategories => 
          prevCategories.map(cat => 
            cat.id === category.id 
              ? { ...cat, isActive: category.isActive }
              : cat
          )
        );
        return;
      }
      
      const url = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/admin/categories/${category.id}/toggle-status`;
      const headers = createAuthHeaders(token);
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: headers
      });
  
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success(data.message);
          // Update with the server response to ensure consistency
          setCategories(prevCategories => 
            prevCategories.map(cat => 
              cat.id === category.id 
                ? { ...cat, isActive: data.category.isActive }
                : cat
            )
          );
        }
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        // Revert the optimistic update on error
        setCategories(prevCategories => 
          prevCategories.map(cat => 
            cat.id === category.id 
              ? { ...cat, isActive: category.isActive }
              : cat
          )
        );
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
    } catch (error: any) {
      console.error('Error toggling category status:', error);
      const message = error.message || 'Failed to toggle category status';
      toast.error(message);
      // Revert the optimistic update on error
      setCategories(prevCategories => 
        prevCategories.map(cat => 
          cat.id === category.id 
            ? { ...cat, isActive: category.isActive }
            : cat
        )
      );
    }
  };

  // View category details
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const openViewDialog = (category: Category) => {
    setViewingCategory(category);
    setIsViewDialogOpen(true);
  };

  // Filter and sort categories
  const filteredAndSortedCategories = categories
    .filter(category => {
      const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           category.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesFilter = filterActive === 'all' || 
                           (filterActive === 'active' && category.isActive) ||
                           (filterActive === 'inactive' && !category.isActive);
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];
      
      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

    return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-1 sm:p-3 md:p-6">
      <div className="w-full space-y-3 sm:space-y-6 md:space-y-8">
        {/* Category Header */}
        <CategoryHeader onAddCategory={openCreateDialog} />

        {/* Category Filters */}
        <CategoryFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterActive={filterActive}
          onFilterChange={setFilterActive}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          sortOrder={sortOrder}
          onSortOrderChange={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* Enhanced Content Area */}
        <div className="p-2 sm:p-3 md:p-6">
          <CategoryContent
            loading={loading}
            viewMode={viewMode}
            categories={filteredAndSortedCategories}
            onView={openViewDialog}
            onEdit={openEditDialog}
            onToggleStatus={handleToggleStatus}
            onDelete={openDeleteDialog}
            onImageUpload={uploadCategoryImage}
          />
        </div>
      </div>

                  {/* Create Category Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader className="pb-6 flex-shrink-0">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Create New Category
            </DialogTitle>
            <p className="text-slate-600 mt-2">Add a new category to organize your products</p>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto pr-2 min-h-0">
                         {/* Top Section - Image Upload */}
             <div className="mb-8">
              
              {/* Centered Image Container */}
              <div className="flex justify-center">
                <div className="w-64 h-48 rounded-xl overflow-hidden border-2 border-slate-200 bg-slate-50 relative">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Image Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Image preview failed to load:', e);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : formData.image ? (
                    <img
                      src={formData.image}
                      alt="Category Image"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Category image failed to load:', e);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    /* Placeholder when no image */
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center text-slate-400">
                        <div className="text-4xl mb-2">🖼️</div>
                        <p className="text-sm font-medium">No image selected</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Remove Button - Only show when image exists */}
                  {(imagePreview || formData.image) && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setImagePreview(null);
                        setSelectedImageFile(null);
                        handleInputChange('image', '');
                      }}
                      className="absolute top-3 right-3 h-8 w-8 rounded-full p-0 shadow-lg z-10"
                      title="Remove image"
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Upload Controls - Below Image */}
              <div className="mt-4 space-y-3 max-w-md mx-auto">
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('image-upload')?.click()}
                  className="w-full h-12 border-2 border-dashed border-slate-300 hover:border-purple-500 hover:bg-purple-50/50 transition-all duration-200 rounded-xl"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">📁</span>
                    <span>Choose Image</span>
                  </div>
                </Button>
                
                {/* File Selection Feedback */}
                {selectedImageFile && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <span className="text-green-600">✓</span>
                    <span className="text-sm text-green-700 font-medium">{selectedImageFile.name}</span>
                    <span className="text-xs text-green-600">({(selectedImageFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                )}
                
                {/* Info Box */}
                <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg text-center">
                  <p className="font-medium mb-1">Supported formats:</p>
                  <p>JPG, PNG, GIF • Max size: 5MB</p>
                </div>
              </div>
            </div>
            
            {/* Bottom Section - Form Inputs in Two Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold text-slate-700">
                    Category Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter category name"
                    className="h-12 border-slate-200 focus:border-purple-500 focus:ring-purple-500/20 rounded-xl transition-all duration-200"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="slug" className="text-sm font-semibold text-slate-700">
                    URL Slug *
                  </Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    placeholder="category-url-slug"
                    className="h-12 border-slate-200 focus:border-purple-500 focus:ring-purple-500/20 rounded-xl transition-all duration-200"
                  />
                  <p className="text-xs text-slate-500">This will be used in the URL: /categories/category-url-slug</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-semibold text-slate-700">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe what this category is about..."
                    rows={4}
                    className="border-slate-200 focus:border-purple-500 focus:ring-purple-500/20 rounded-xl resize-none transition-all duration-200"
                  />
                </div>
              </div>
              
              {/* Right Column */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="sortOrder" className="text-sm font-semibold text-slate-700">
                    Sort Order
                  </Label>
                  <Input
                    id="sortOrder"
                    type="text"
                    value={formData.sortOrder}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Only allow numbers
                      if (value === '' || /^\d+$/.test(value)) {
                        handleInputChange('sortOrder', value === '' ? 0 : parseInt(value));
                      }
                    }}
                    placeholder="0"
                    className="h-12 border-slate-200 focus:border-purple-500 focus:ring-purple-500/20 rounded-xl transition-all duration-200"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">
                    Status
                  </Label>
                  <div className="flex items-center space-x-3 pt-3">
                    <input
                      id="isActive"
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => handleInputChange('isActive', e.target.checked)}
                      className="w-5 h-5 rounded border-2 border-slate-300 focus:border-purple-500 focus:ring-purple-500/20"
                    />
                    <Label htmlFor="isActive" className="text-sm font-medium text-slate-700">
                      Active
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 flex-shrink-0 bg-white">
            <Button 
              variant="outline" 
              onClick={() => setIsCreateDialogOpen(false)} 
              className="px-6 py-2.5 h-11 rounded-xl border-slate-300 hover:border-slate-400 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreate} 
              disabled={isSubmitting}
              className="px-6 py-2.5 h-11 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating...</span>
                </div>
              ) : (
                'Create Category'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) {
          resetEditDialogImages();
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader className="pb-6 flex-shrink-0">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Edit Category
            </DialogTitle>
            <p className="text-slate-600 mt-2">Update details for {editingCategory?.name || 'this category'}</p>
          </DialogHeader>
          
          {editingCategory && (
            <div className="flex-1 overflow-y-auto pr-2 min-h-0">
              {/* Top Section - Image Management */}
              <div className="mb-8">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Image Display - Shows current image OR new image preview */}
                  <div className="space-y-3">
                    {imagePreview ? (
                      // Show new image preview when selected
                      <div className="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-blue-300 bg-blue-50">
                        <img
                          src={imagePreview}
                          alt="New image preview"
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setImagePreview(null);
                            setSelectedImageFile(null);
                          }}
                          className="absolute top-2 right-2 h-8 w-8 rounded-full p-0 shadow-lg"
                          title="Remove new image"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : formData.image ? (
                      // Show current image when no new image is selected
                      <div className="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-slate-200 bg-slate-50">
                        <img
                          src={formData.image}
                          alt="Current category image"
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteCategoryImage(editingCategory.id)}
                          className="absolute top-2 right-2 h-8 w-8 rounded-full p-0 shadow-lg"
                          title="Delete current image"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      // Show placeholder when no image exists
                      <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 border-2 border-slate-200 flex items-center justify-center">
                        <div className="text-4xl text-slate-400">📷</div>
                      </div>
                    )}
                  </div>
                  

                  
                  {/* Upload Controls */}
                  <div className="space-y-3">
                    <input
                      type="file"
                      id="edit-image-upload"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('edit-image-upload')?.click()}
                      className="w-full h-12 border-2 border-dashed border-slate-300 hover:border-purple-500 hover:bg-purple-50/50 transition-all duration-200 rounded-xl"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">📁</span>
                        <span>Choose Image</span>
                      </div>
                    </Button>
                    
                    {selectedImageFile && (
                      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <span className="text-green-600">✓</span>
                        <span className="text-sm text-green-700 font-medium">{selectedImageFile.name}</span>
                        <span className="text-xs text-green-600">({(selectedImageFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                      </div>
                    )}
                    
                    <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
                      <p className="font-medium mb-1">Supported formats:</p>
                      <p>JPG, PNG, GIF • Max size: 5MB</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-6 mb-8">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-800 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Basic Information</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Category Name *</label>
                      <Input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="h-12 bg-white border-2 border-slate-200 focus:border-purple-500 focus:ring-purple-500/20 rounded-xl shadow-sm transition-all duration-300 text-base"
                        placeholder="Enter category name..."
                      />
                      <p className="text-xs text-slate-500 mt-1">This will be displayed to customers</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">URL Slug *</label>
                      <Input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => handleInputChange('slug', e.target.value)}
                        className="h-12 bg-white border-2 border-slate-200 focus:border-purple-500 focus:ring-purple-500/20 rounded-xl shadow-sm transition-all duration-300 font-mono text-base"
                        placeholder="category-url-slug"
                      />
                      <p className="text-xs text-slate-500 mt-1">Used in the category URL</p>
                    </div>
                  </div>
                </div>

                {/* Description - Full Width */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-800 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Description</span>
                  </h3>
                  
                  <div>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="w-full h-32 bg-white border-2 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl shadow-sm transition-all duration-300 resize-none text-base"
                      placeholder="Describe what this category is about, what products it contains, and any relevant information for customers..."
                      rows={5}
                    />
                    <p className="text-xs text-slate-500 mt-1">Optional but helps with SEO and customer understanding</p>
                  </div>
                </div>

                {/* Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-800 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Settings</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Sort Order</label>
                      <Input
                        type="text"
                        value={formData.sortOrder}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || /^\d+$/.test(value)) {
                            handleInputChange('sortOrder', value === '' ? 0 : parseInt(value));
                          }
                        }}
                        placeholder="0"
                        className="h-12 bg-white border-2 border-slate-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl shadow-sm transition-all duration-300 text-base"
                      />
                      <p className="text-xs text-slate-500 mt-1">Lower numbers appear first</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                      <div className="flex items-center space-x-3 pt-3">
                        <input
                          id="edit-isActive"
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) => handleInputChange('isActive', e.target.checked)}
                          className="w-5 h-5 rounded border-2 border-slate-300 focus:border-green-500 focus:ring-green-500/20"
                        />
                        <label htmlFor="edit-isActive" className="text-sm font-medium text-slate-700">
                          Active
                        </label>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Active categories are visible to customers</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}
          
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsEditDialogOpen(false);
                resetEditDialogImages();
              }} 
              className="px-6 py-2.5 h-11 rounded-xl border-slate-300 hover:border-slate-400 hover:bg-slate-400"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdate}
              disabled={isUpdating}
              className="px-6 py-2.5 h-11 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enhanced View Details Dialog */}
      {isViewDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Enhanced Backdrop */}
          <div 
            className="fixed inset-0 bg-gradient-to-br from-black/60 via-purple-900/20 to-blue-900/20 backdrop-blur-md"
            onClick={() => setIsViewDialogOpen(false)}
          />
          
          {/* Enhanced Dialog Content */}
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-gradient-to-br from-white via-slate-50/50 to-white border border-white/40 shadow-3xl rounded-3xl overflow-hidden flex flex-col">
            {/* Enhanced Header with Icon - Fixed */}
            <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 px-8 py-8 flex-shrink-0">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                  <Eye className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">
                    {viewingCategory?.name || 'Category'} Details
                  </h2>
                  <p className="text-white/80 mt-1 text-lg">
                    Complete information about this category
                  </p>
                </div>
              </div>
              
              {/* Close Button */}
              <button
                onClick={() => setIsViewDialogOpen(false)}
                className="absolute top-6 right-6 p-3 hover:bg-white/20 rounded-2xl transition-all duration-300 hover:scale-110"
              >
                <XCircle className="w-6 h-6 text-white" />
              </button>
            </div>
          
          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto">
            {viewingCategory ? (
              <div className="p-8">
                {/* Hero Section */}
                <div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 rounded-3xl p-8 mb-8 border border-slate-200/50">
                  <div className="flex items-center space-x-6">
                    <div className="p-6 bg-white rounded-3xl shadow-xl border border-slate-200/50">
                      {viewingCategory.image ? (
                        <img
                          src={viewingCategory.image}
                          alt={viewingCategory.name}
                          className="w-24 h-24 object-cover rounded-2xl"
                        />
                      ) : (
                        <span className="text-6xl">👕</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-4xl font-bold text-slate-900 mb-2">{viewingCategory.name}</h3>
                      <p className="text-xl text-slate-600 font-medium">Slug: <span className="font-mono bg-slate-100 px-3 py-1 rounded-lg">{viewingCategory.slug}</span></p>
                      
                      {/* Status Badge */}
                      <div className="mt-4">
                        <Badge 
                          variant={viewingCategory.isActive ? "default" : "destructive"}
                          className="px-4 py-2 text-base font-semibold"
                        >
                          {viewingCategory.isActive ? '🟢 Active' : '🔴 Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Information Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  {/* Main Details */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-slate-800 flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span>Category Details</span>
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200/50 shadow-sm">
                        <span className="text-base font-medium text-slate-700">Sort Order</span>
                        <span className="text-2xl font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl">{viewingCategory.sortOrder}</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200/50 shadow-sm">
                        <span className="text-base font-medium text-slate-700">Products Count</span>
                        <span className="text-xl font-semibold text-slate-700 bg-slate-50 px-4 py-2 rounded-xl">{viewingCategory.productCount}</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200/50 shadow-sm">
                        <span className="text-base font-medium text-slate-700">Created Date</span>
                        <span className="text-lg font-semibold text-slate-700 bg-slate-50 px-4 py-2 rounded-xl">{new Date(viewingCategory.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200/50 shadow-sm">
                        <span className="text-base font-medium text-slate-700">Last Updated</span>
                        <span className="text-lg font-semibold text-slate-700 bg-slate-50 px-4 py-2 rounded-xl">{new Date(viewingCategory.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-slate-800 flex items-center space-x-3">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span>Quick Actions</span>
                    </h3>
                    
                    <div className="space-y-4">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => {
                          setIsViewDialogOpen(false);
                          openEditDialog(viewingCategory);
                        }}
                        className="w-full justify-start bg-white border-slate-300 hover:bg-slate-50 hover:border-purple-400 h-14 text-base font-medium rounded-2xl transition-all duration-300"
                      >
                        <Edit className="w-5 h-5 mr-3" />
                        Edit Category
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full justify-start bg-white border-slate-300 hover:bg-slate-50 hover:border-blue-400 h-14 text-base font-medium rounded-2xl transition-all duration-300"
                      >
                        <Eye className="w-5 h-5 mr-3" />
                        View Products
                      </Button>
                      
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl border border-purple-200/50">
                        <h4 className="font-semibold text-slate-800 mb-2 flex items-center">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                          Quick Info
                        </h4>
                        <p className="text-sm text-slate-600">
                          This category is currently {viewingCategory.isActive ? 'active' : 'inactive'} and contains {viewingCategory.productCount} product{viewingCategory.productCount !== 1 ? 's' : ''}.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description Section */}
                {viewingCategory.description && (
                  <div className="bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-3xl p-6 border border-slate-200/50">
                    <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Description</span>
                    </h3>
                    <p className="text-lg text-slate-700 leading-relaxed">{viewingCategory.description}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No Category Selected</h3>
                <p className="text-slate-500">Please select a category to view its details.</p>
              </div>
            )}
          </div>
          </div>
        </div>
      )}

      {/* Delete Category Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Delete Category
            </DialogTitle>
            <p className="text-slate-600 mt-2">This action cannot be undone</p>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Warning Icon and Message */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-12 h-12 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Are you absolutely sure?
              </h3>
              <p className="text-slate-600">
                You are about to delete the category <span className="font-semibold text-slate-900">"{deletingCategory?.name}"</span>
              </p>
            </div>

            {/* Warning Details */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 border border-red-200/50">
              <h4 className="font-semibold text-red-800 mb-3 flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                ⚠️ Warning
              </h4>
              <ul className="text-sm text-red-700 space-y-2">
                <li>• This action cannot be undone</li>
                <li>• The category will be permanently removed</li>
                <li>• All associated data will be lost</li>
              </ul>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)} 
              className="px-6 py-2.5 h-11 rounded-xl border-slate-300 hover:border-slate-400 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmDelete}
              disabled={isDeleting}
              className="px-6 py-2.5 h-11 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Deleting...</span>
                </div>
              ) : (
                'Delete Permanently'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Categories;
