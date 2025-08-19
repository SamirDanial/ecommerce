import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Upload, Trash2, Star, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useClerkAuth } from '../../hooks/useClerkAuth';
import ProductImageService, { UploadImageData, UpdateImageData } from '../../services/productImageService';
import { ProductImage } from '../../types';
import { getApiBaseUrl } from '../../config/api';

interface ProductImageManagerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
  productName: string;
  existingImages?: ProductImage[];
  onImagesChange?: () => void;
}

const ProductImageManagerDialog: React.FC<ProductImageManagerDialogProps> = ({
  isOpen,
  onClose,
  productId,
  productName,
  existingImages = [],
  onImagesChange
}) => {
  const { getToken } = useClerkAuth();
  const [images, setImages] = useState<ProductImage[]>(existingImages);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadData, setUploadData] = useState<UploadImageData>({
    color: '',
    alt: '',
    sortOrder: existingImages.length
  });

  const fetchImages = useCallback(async () => {
    const token = await getToken();
    if (!token) return;
    
    try {
      setLoading(true);
      const fetchedImages = await ProductImageService.getProductImages(productId, token);
      console.log('Fetched images:', fetchedImages);
      setImages(fetchedImages);
    } catch (error) {
      console.error('Error fetching images:', error);
      toast.error('Failed to fetch product images');
    } finally {
      setLoading(false);
    }
  }, [productId, getToken]);

  useEffect(() => {
    if (isOpen) {
      fetchImages();
    } else {
      // Clean up preview URL when dialog closes
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
      setSelectedFile(null);
    }
  }, [isOpen, productId, fetchImages, previewUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      const file = files[0]; // Take only the first file
      console.log('File selected:', file);
      
      // Clean up previous preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      
      // Create new preview URL
      const newPreviewUrl = URL.createObjectURL(file);
      
      setSelectedFile(file);
      setPreviewUrl(newPreviewUrl);
    }
  };



  // Helper function to get full image URL
  const getFullImageUrl = (imageUrl: string) => {
    if (imageUrl.startsWith('http')) {
      return imageUrl; // Already a full URL
    }
    const fullUrl = `${getApiBaseUrl()}${imageUrl}`;
    console.log('Converting image URL:', imageUrl, '→', fullUrl);
    return fullUrl; // Prepend base URL
  };

  const handleUpload = async () => {
    const token = await getToken();
    if (!token || !selectedFile) return;

    console.log('Starting upload with:', {
      productId,
      selectedFile: { name: selectedFile.name, size: selectedFile.size, type: selectedFile.type },
      uploadData,
      token: token ? 'Present' : 'Missing'
    });

    try {
      setUploading(true);
      
      // Debug: Log selected file
      console.log('Selected file for upload:', {
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type
      });
      console.log('Upload data:', uploadData);
      
      await ProductImageService.uploadImage(productId, selectedFile, uploadData, token);
      
      toast.success('Image uploaded successfully');
      
      // Clean up preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      
      setSelectedFile(null);
      setPreviewUrl(null);
      setUploadData({ color: '', alt: '', sortOrder: images.length });
      
      // Refresh images
      await fetchImages();
      onImagesChange?.();
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    const token = await getToken();
    if (!token) return;

    try {
      await ProductImageService.deleteImage(productId, imageId, token);
      toast.success('Image deleted successfully');
      
      // Refresh images
      await fetchImages();
      onImagesChange?.();
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    }
  };

  const handleSetPrimary = async (imageId: number) => {
    const token = await getToken();
    if (!token) return;

    try {
      await ProductImageService.updateImage(productId, imageId, { isPrimary: true }, token);
      toast.success('Primary image updated');
      
      // Refresh images
      await fetchImages();
      onImagesChange?.();
    } catch (error) {
      console.error('Error updating primary image:', error);
      toast.error('Failed to update primary image');
    }
  };

  const handleUpdateImage = async (imageId: number, data: Partial<UpdateImageData>) => {
    const token = await getToken();
    if (!token) return;

    try {
      await ProductImageService.updateImage(productId, imageId, data, token);
      toast.success('Image updated successfully');
      
      // Refresh images
      await fetchImages();
      onImagesChange?.();
    } catch (error) {
      console.error('Error updating image:', error);
      toast.error('Failed to update image');
    }
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length) return;
    
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    
    // Update sort order
    const updatedImages = newImages.map((img, index) => ({
      ...img,
      sortOrder: index
    }));
    
    setImages(updatedImages);
    
    // Update backend
    updatedImages.forEach((img, index) => {
      handleUpdateImage(img.id, { sortOrder: index });
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Manage Images for "{productName}"
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Section */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Upload New Images</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <Label htmlFor="color">Color (optional)</Label>
                  <Input
                    id="color"
                    value={uploadData.color}
                    onChange={(e) => setUploadData(prev => ({ ...prev, color: e.target.value }))}
                    placeholder="e.g., Red, Blue"
                  />
                </div>
                
                <div>
                  <Label htmlFor="alt">Alt Text (optional)</Label>
                  <Input
                    id="alt"
                    value={uploadData.alt}
                    onChange={(e) => setUploadData(prev => ({ ...prev, alt: e.target.value }))}
                    placeholder="Image description"
                  />
                </div>
                
                <div>
                  <Label htmlFor="sortOrder">Sort Order</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    value={uploadData.sortOrder}
                    onChange={(e) => setUploadData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                    min="0"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {/* File Input Section */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="image-upload"
                  />
                  <label 
                    htmlFor="image-upload" 
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="h-8 w-8 text-gray-400" />
                    <div>
                      <span className="text-sm font-medium text-gray-600">
                        Click to select image
                      </span>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF, WEBP up to 5MB each
                      </p>
                    </div>
                  </label>
                </div>

                {/* Upload Button */}
                <div className="flex justify-center">
                  <Button 
                    onClick={handleUpload} 
                    disabled={uploading || !selectedFile}
                    className="flex items-center gap-2 px-8"
                    size="lg"
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Upload {selectedFile && '(1)'}
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {selectedFile && (
                <div className="mt-4 space-y-4">
                  {/* Image Preview */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-800 mb-3">
                      Image Preview:
                    </h4>
                    <div className="flex justify-center">
                                              <div className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition-colors w-32 h-32">
                            {previewUrl && (
                              <img
                                src={previewUrl}
                                alt="Preview"
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                        
                        {/* Remove button */}
                        {previewUrl && (
                          <button
                            onClick={() => {
                              if (previewUrl) URL.revokeObjectURL(previewUrl);
                              setSelectedFile(null);
                              setPreviewUrl(null);
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
                            title="Remove image"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* File Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">
                      Selected File:
                    </h4>
                    <div className="text-sm text-blue-700">
                      <div className="flex items-center justify-between">
                        <span className="flex-1 truncate">{selectedFile.name}</span>
                        <span className="text-xs text-blue-600">
                          ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Images Grid */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Current Images ({images.length})</h3>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading images...</p>
                </div>
              ) : images.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No images uploaded yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div key={image.id} className="relative group">
                      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                        <CardContent className="p-0">
                          <div className="relative aspect-square">
                            <img
                              src={getFullImageUrl(image.url)}
                              alt={image.alt || 'Product image'}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.error('Failed to load image:', image.url);
                                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD4KICA8L3N2Zz4=';
                              }}
                            />
                            
                            {/* Primary Badge */}
                            {image.isPrimary && (
                              <Badge className="absolute top-2 left-2 bg-yellow-500 text-white">
                                <Star className="h-3 w-3 mr-1" />
                                Primary
                              </Badge>
                            )}
                            
                            {/* Color Badge */}
                            {image.color && (
                              <Badge className="absolute top-2 right-2 bg-blue-500 text-white">
                                {image.color}
                              </Badge>
                            )}
                            
                            {/* Actions Overlay */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              {!image.isPrimary && (
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => handleSetPrimary(image.id)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Star className="h-4 w-4" />
                                </Button>
                              )}
                              
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteImage(image.id)}
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">Order: {image.sortOrder}</span>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => moveImage(index, index - 1)}
                                  disabled={index === 0}
                                  className="h-6 w-6 p-0"
                                >
                                  ↑
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => moveImage(index, index + 1)}
                                  disabled={index === images.length - 1}
                                  className="h-6 w-6 p-0"
                                >
                                  ↓
                                </Button>
                              </div>
                            </div>
                            
                            <Input
                              value={image.alt || ''}
                              onChange={(e) => handleUpdateImage(image.id, { alt: e.target.value })}
                              placeholder="Alt text"
                              className="text-sm"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductImageManagerDialog;
