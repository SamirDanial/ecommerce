import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search,
  SortAsc,
  SortDesc,
  Grid3X3,
  List,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { toast } from 'sonner';
import { useAuth } from '@clerk/clerk-react';
import { createAuthHeaders } from '../../lib/axios';

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
      if (!formData.name.trim() || !formData.slug.trim()) {
        toast.error('Name and slug are required');
        return;
      }

      const token = await getToken({ template: 'e-commerce' });
      if (!token) {
        toast.error('Authentication token not available');
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
    }
  };

  // Update category
  const handleUpdate = async () => {
    try {
      if (!editingCategory || !formData.name.trim() || !formData.slug.trim()) {
        toast.error('Name and slug are required');
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
    }
  };



  // Confirm and execute deletion
  const confirmDelete = async () => {
    if (!deletingCategory) return;
    
    try {
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
    <div className="space-y-8">
      {/* Modern Header */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">Category Management</h1>
            <p className="text-purple-100 text-lg">Organize and manage your product categories with style</p>
          </div>
          <Button 
            onClick={openCreateDialog} 
            className="bg-white text-purple-600 hover:bg-purple-50 px-6 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Enhanced Filters and Search */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-lg border-2 border-gray-200 focus:border-purple-500 rounded-xl"
              />
            </div>
            
            <Select value={filterActive} onValueChange={(value: any) => setFilterActive(value)}>
              <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-purple-500 rounded-xl">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="inactive">Inactive Only</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-purple-500 rounded-xl">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="sortOrder">Sort Order</SelectItem>
                <SelectItem value="createdAt">Created Date</SelectItem>
                <SelectItem value="updatedAt">Updated Date</SelectItem>
                <SelectItem value="productCount">Product Count</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="h-12 border-2 border-gray-200 hover:border-purple-500 rounded-xl flex items-center gap-2"
            >
              {sortOrder === 'asc' ? <SortAsc className="w-5 h-5" /> : <SortDesc className="w-5 h-5" />}
              {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                onClick={() => setViewMode('grid')}
                className="h-12 px-4 rounded-xl"
              >
                <Grid3X3 className="w-5 h-5" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                onClick={() => setViewMode('list')}
                className="h-12 px-4 rounded-xl"
              >
                <List className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedCategories.map((category) => (
            <Card key={category.id} className="group hover:shadow-2xl transition-all duration-300 border-0 overflow-hidden bg-gradient-to-br from-white to-gray-50">
              {/* Category Image */}
              <div className="relative h-48 overflow-hidden">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                    <div className="text-4xl">👕</div>
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <Badge 
                    variant={category.isActive ? "default" : "secondary"}
                    className="px-3 py-1 text-sm font-medium"
                  >
                    {category.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                {/* Action Buttons Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center pointer-events-none">
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-auto">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openViewDialog(category);
                      }}
                      className="bg-white/90 hover:bg-white text-blue-600 shadow-lg"
                      title="View Category Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditDialog(category);
                      }}
                      className="bg-white/90 hover:bg-white text-green-600 shadow-lg"
                      title="Edit Category"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStatus(category);
                      }}
                      className="bg-white/90 hover:bg-white text-gray-700 shadow-lg"
                      title={category.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {category.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    </Button>
                    
                    {/* Image Upload Button */}
                    <input
                      type="file"
                      id={`image-upload-${category.id}`}
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          uploadCategoryImage(category.id, file);
                        }
                      }}
                      className="hidden"
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        document.getElementById(`image-upload-${category.id}`)?.click();
                      }}
                      className="bg-white/90 hover:bg-white text-indigo-600 shadow-lg"
                      title="Upload Image"
                    >
                      📷
                    </Button>
                    
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteDialog(category);
                      }}
                      disabled={category.productCount > 0}
                      className="bg-white/90 hover:bg-white text-red-600 shadow-lg"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Category Content */}
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                    {category.name}
                  </h3>
                  
                  {category.description && (
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {category.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="text-xs">
                      {category.productCount} products
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Sort: {category.sortOrder}
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                    /{category.slug}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span>Updated: {new Date(category.updatedAt).toLocaleDateString()}</span>
                </div>

                {/* View Details Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(category)}
                  className="w-full border-2 border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        // List View
        <div className="space-y-4">
          {filteredAndSortedCategories.map((category) => (
            <Card key={category.id} className="hover:shadow-lg transition-shadow border-0">
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  {/* Image */}
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                        <div className="text-2xl">👕</div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{category.name}</h3>
                        <p className="text-sm text-gray-500 font-mono mb-2">/{category.slug}</p>
                        {category.description && (
                          <p className="text-gray-600 text-sm line-clamp-2">{category.description}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant={category.isActive ? "default" : "secondary"}>
                          {category.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline">
                          {category.productCount} products
                        </Badge>
                      </div>
                    </div>

                                         <div className="flex items-center justify-between mb-4">
                       <div className="flex items-center gap-4 text-sm text-gray-500">
                         <span>Sort: {category.sortOrder}</span>
                         <span>Updated: {new Date(category.updatedAt).toLocaleDateString()}</span>
                       </div>
                       
                       <div className="flex items-center gap-2">
                         <Button
                           variant="ghost"
                           size="sm"
                           onClick={(e) => {
                             e.stopPropagation();
                             openViewDialog(category);
                           }}
                           title="View Category Details"
                           className="text-blue-600 hover:text-blue-700"
                         >
                           <Eye className="w-4 h-4" />
                         </Button>
                         <Button
                           variant="ghost"
                           size="sm"
                           onClick={(e) => {
                             e.stopPropagation();
                             openEditDialog(category);
                           }}
                           title="Edit Category"
                           className="text-green-600 hover:text-green-700"
                         >
                           <Edit className="w-4 h-4" />
                         </Button>
                         <Button
                           variant="ghost"
                           size="sm"
                           onClick={(e) => {
                             e.stopPropagation();
                             handleToggleStatus(category);
                           }}
                           title={category.isActive ? 'Deactivate' : 'Activate'}
                           className="text-gray-600 hover:text-gray-700"
                         >
                           {category.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                         </Button>
                         
                         {/* Image Upload Button */}
                         <input
                           type="file"
                           id={`list-image-upload-${category.id}`}
                           accept="image/*"
                           onChange={(e) => {
                             const file = e.target.files?.[0];
                             if (file) {
                               uploadCategoryImage(category.id, file);
                             }
                           }}
                           className="hidden"
                         />
                         <Button
                           variant="ghost"
                           size="sm"
                           onClick={(e) => {
                             e.stopPropagation();
                             document.getElementById(`list-image-upload-${category.id}`)?.click();
                           }}
                           title="Upload Image"
                           className="text-indigo-600 hover:text-indigo-700"
                         >
                           📷
                         </Button>
                         
                         <Button
                           variant="ghost"
                           size="sm"
                           onClick={(e) => {
                             e.stopPropagation();
                             openDeleteDialog(category);
                           }}
                           disabled={category.productCount > 0}
                           title="Delete Category"
                           className="text-red-600 hover:text-red-700"
                         >
                           <Trash2 className="w-4 h-4" />
                         </Button>
                       </div>
                     </div>

                     {/* View Details Button */}
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={() => openEditDialog(category)}
                       className="w-full border-2 border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
                     >
                       View Details
                     </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredAndSortedCategories.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="text-4xl">👕</div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No categories found</h3>
          {searchTerm || filterActive !== 'all' ? (
            <p className="text-gray-500">Try adjusting your search or filters</p>
          ) : (
            <p className="text-gray-500">Create your first category to get started</p>
          )}
        </div>
      )}

      {/* Create Category Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Create New Category</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Category name"
                  className="h-11 border-2 border-gray-200 focus:border-purple-500 rounded-lg"
                />
              </div>
              
              <div>
                <Label htmlFor="slug" className="text-sm font-medium">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  placeholder="category-slug"
                  className="h-11 border-2 border-gray-200 focus:border-purple-500 rounded-lg"
                />
              </div>
              
              <div>
                <Label htmlFor="image" className="text-sm font-medium">Category Image</Label>
                <div className="space-y-3">
                  {/* Image Preview */}
                  {(imagePreview || formData.image) && (
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200">
                      <img
                        src={imagePreview || formData.image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setSelectedImageFile(null);
                          handleInputChange('image', '');
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                        title="Remove image"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  
                  {/* File Upload Input */}
                  <div className="flex items-center gap-3">
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
                      className="h-11 px-4 border-2 border-gray-200 hover:border-purple-500 transition-colors"
                    >
                      📁 Choose Image
                    </Button>
                    {selectedImageFile && (
                      <span className="text-sm text-gray-600">
                        {selectedImageFile.name}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-500">
                    Supported formats: JPG, PNG, GIF. Max size: 5MB
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Category description (optional)"
                  rows={4}
                  className="border-2 border-gray-200 focus:border-purple-500 rounded-lg resize-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sortOrder" className="text-sm font-medium">Sort Order</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => handleInputChange('sortOrder', parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="h-11 border-2 border-gray-200 focus:border-purple-500 rounded-lg"
                  />
                </div>
                
                <div className="flex items-center space-x-3 pt-6">
                  <input
                    id="isActive"
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    className="w-5 h-5 rounded border-2 border-gray-300 focus:border-purple-500"
                  />
                  <Label htmlFor="isActive" className="text-sm font-medium">Active</Label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-6">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="px-6 py-2">
              Cancel
            </Button>
            <Button onClick={handleCreate} className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              Create Category
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enhanced Edit Dialog */}
      {isEditDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6">
          {/* Enhanced Backdrop */}
          <div 
            className="fixed inset-0 bg-gradient-to-br from-black/60 via-purple-900/20 to-blue-900/20 backdrop-blur-md"
            onClick={() => setIsEditDialogOpen(false)}
          />
          
          {/* Enhanced Dialog Content */}
          <div className="relative w-full max-w-[95vw] md:max-w-6xl mx-2 md:mx-4 max-h-[90vh] bg-gradient-to-br from-white via-slate-50/50 to-white border border-white/40 shadow-3xl rounded-3xl overflow-hidden flex flex-col">
            {/* Enhanced Header with Icon */}
            <div className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 px-4 sm:px-6 md:px-8 py-6 md:py-8 flex-shrink-0">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                  <Edit className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">
                    Edit Category
                  </h2>
                  <p className="text-white/80 mt-1 text-lg">
                    Update details for <span className="font-semibold">{editingCategory?.name || 'this category'}</span>
                  </p>
                </div>
              </div>
              
              {/* Close Button */}
              <button
                onClick={() => setIsEditDialogOpen(false)}
                className="absolute top-6 right-6 p-3 hover:bg-white/20 rounded-2xl transition-all duration-300 hover:scale-110"
              >
                <XCircle className="w-6 h-6 text-white" />
              </button>
            </div>
          
          {editingCategory && (
            <div className="p-4 sm:p-6 md:p-8 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
              {/* Hero Section with Current Image */}
              <div className="mb-8">
                <div className="p-6 bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl border border-slate-200/50">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Category Image</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Current Image Display */}
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-slate-700">Current Image:</p>
                      {formData.image ? (
                        <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-4 border-white shadow-xl">
                          <img
                            src={formData.image}
                            alt="Current category image"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                          <button
                            type="button"
                            onClick={() => deleteCategoryImage(editingCategory!.id)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-all duration-300 shadow-lg"
                            title="Delete current image"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border-4 border-white shadow-xl flex items-center justify-center">
                          <div className="text-4xl text-slate-400">📷</div>
                        </div>
                      )}
                    </div>
                    
                    {/* New Image Preview */}
                    {imagePreview && (
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-slate-700">New Image Preview:</p>
                        <div className="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-blue-300 shadow-lg">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreview(null);
                              setSelectedImageFile(null);
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                            title="Remove preview"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Upload Controls */}
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-slate-700">Upload New Image:</p>
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
                          className="h-12 px-6 bg-white border-2 border-blue-200 hover:border-blue-400 focus:ring-blue-500/20 rounded-xl transition-all duration-300 font-medium"
                        >
                          📁 Choose New Image
                        </Button>
                        
                        {selectedImageFile && (
                          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-sm font-medium text-blue-800 mb-1">Selected File:</p>
                            <p className="text-xs text-blue-600 font-mono break-all">{selectedImageFile.name}</p>
                          </div>
                        )}
                        
                        <div className="space-y-2 text-xs text-slate-500">
                          <div className="flex items-center space-x-2">
                            <span>📋 Supported: JPG, PNG, GIF</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span>📏 Max size: 5MB</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span>🎯 Recommended: 400x400px</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Grid - 2 Columns */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Left Column - Basic Information */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800 flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Basic Information</span>
                    </h3>
                    
                    <div className="space-y-4">
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
                        <p className="text-xs text-slate-500 mt-1">Used in the category URL (e.g., /categories/category-url-slug)</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                        <Textarea
                          value={formData.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          className="h-24 bg-white border-2 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl shadow-sm transition-all duration-300 resize-none text-base"
                          placeholder="Describe what this category is about, what products it contains, and any relevant information for customers..."
                          rows={4}
                        />
                        <p className="text-xs text-slate-500 mt-1">Optional but helps with SEO and customer understanding</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Settings & Status */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800 flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Settings & Status</span>
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Sort Order</label>
                        <Input
                          type="number"
                          value={formData.sortOrder}
                          onChange={(e) => handleInputChange('sortOrder', parseInt(e.target.value) || 0)}
                          className="h-12 bg-white border-2 border-slate-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl shadow-sm transition-all duration-300 text-base"
                          placeholder="0"
                          min="0"
                        />
                        <p className="text-xs text-slate-500 mt-1">Lower numbers appear first in category listings</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Category Status</label>
                        <Select value={formData.isActive ? 'active' : 'inactive'} onValueChange={(value) => handleInputChange('isActive', value === 'active')}>
                          <SelectTrigger className="h-12 bg-white border-2 border-slate-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl shadow-sm transition-all duration-300">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">🟢 Active - Visible to customers</SelectItem>
                            <SelectItem value="inactive">🔴 Inactive - Hidden from customers</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-slate-500 mt-1">Active categories are visible in the store</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Quick Stats */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800 flex items-center space-x-2">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      <span>Quick Stats</span>
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200/50">
                        <div className="text-2xl font-bold text-purple-600">{editingCategory.productCount}</div>
                        <div className="text-sm text-slate-600">Products</div>
                      </div>
                      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200/50">
                        <div className="text-2xl font-bold text-green-600">{editingCategory.sortOrder}</div>
                        <div className="text-sm text-slate-600">Sort Order</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Action Buttons */}
              <div className="flex items-center justify-between pt-8 pb-4 border-t border-slate-200/50 bg-white sticky bottom-0">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-slate-500">Ready to save changes</span>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                    className="h-12 px-8 bg-white border-2 border-slate-300 hover:bg-slate-50 hover:border-slate-400 rounded-xl transition-all duration-300 font-medium"
                  >
                    ✋ Cancel
                  </Button>
                  
                  <Button
                    onClick={handleUpdate}
                    className="h-12 px-8 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl rounded-xl transition-all duration-300 font-medium"
                  >
                    🚀 Save Changes
                  </Button>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      )}

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

      {/* Enhanced Delete Confirmation Dialog */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Enhanced Backdrop */}
          <div 
            className="fixed inset-0 bg-gradient-to-br from-black/60 via-red-900/20 to-orange-900/20 backdrop-blur-md"
            onClick={() => setIsDeleteDialogOpen(false)}
          />
          
          {/* Enhanced Dialog Content */}
          <div className="relative w-full max-w-md bg-gradient-to-br from-white via-red-50/50 to-white border border-red-200/40 shadow-3xl rounded-3xl overflow-hidden">
            {/* Enhanced Header with Icon */}
            <div className="relative bg-gradient-to-r from-red-600 via-orange-600 to-red-700 px-8 py-8">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                  <Trash2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">
                    Delete Category
                  </h2>
                  <p className="text-white/80 mt-1 text-lg">
                    This action cannot be undone
                  </p>
                </div>
              </div>
              
              {/* Close Button */}
              <button
                onClick={() => setIsDeleteDialogOpen(false)}
                className="absolute top-6 right-6 p-3 hover:bg-white/20 rounded-2xl transition-all duration-300 hover:scale-110"
              >
                <XCircle className="w-6 h-6 text-white" />
              </button>
            </div>
          
          {/* Dialog Content */}
          <div className="p-8">
            {/* Warning Icon */}
            <div className="text-center mb-6">
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
            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 border border-red-200/50 mb-6">
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

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                className="flex-1 h-12 bg-white border-slate-300 hover:bg-slate-50 hover:border-slate-400 rounded-xl transition-all duration-300 font-medium"
              >
                ✋ Cancel
              </Button>
              
              <Button
                onClick={confirmDelete}
                className="flex-1 h-12 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white shadow-lg hover:shadow-xl rounded-xl transition-all duration-300 font-medium"
              >
                🗑️ Delete Permanently
              </Button>
            </div>
          </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
