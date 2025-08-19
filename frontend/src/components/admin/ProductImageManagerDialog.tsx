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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploadDataArray, setUploadDataArray] = useState<UploadImageData[]>([{
    color: '',
    alt: '',
    sortOrder: existingImages.length
  }]);

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
      if (previewUrls.length > 0) {
        previewUrls.forEach(url => URL.revokeObjectURL(url));
      }
      setPreviewUrls([]);
      setSelectedFiles([]);
      setUploadDataArray([{ color: '', alt: '', sortOrder: images.length }]);
    }
  }, [isOpen, productId, fetchImages, previewUrls, images.length]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (previewUrls.length > 0) {
        previewUrls.forEach(url => URL.revokeObjectURL(url));
      }
    };
  }, [previewUrls]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      // Limit to 10 files
      const newFiles = files.slice(0, 10);
      setSelectedFiles(newFiles);
      
      // Clean up previous preview URLs
      if (previewUrls.length > 0) {
        previewUrls.forEach(url => URL.revokeObjectURL(url));
      }
      
      // Create new preview URLs
      const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls(newPreviewUrls);
      
      // Create upload data for each file
      const newUploadDataArray = newFiles.map((_, index) => ({
        color: uploadDataArray[0]?.color || '',
        alt: uploadDataArray[0]?.alt || '',
        sortOrder: (uploadDataArray[0]?.sortOrder || images.length) + index
      }));
      setUploadDataArray(newUploadDataArray);
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
    if (!token || selectedFiles.length === 0) return;

    console.log('Starting upload with:', {
      productId,
      selectedFiles: selectedFiles.map(f => ({ name: f.name, size: f.size, type: f.type })),
      uploadDataArray,
      token: token ? 'Present' : 'Missing'
    });

    try {
      setUploading(true);
      
      // Debug: Log selected files
      console.log('Selected files for upload:', {
        names: selectedFiles.map(f => f.name),
        sizes: selectedFiles.map(f => f.size),
        types: selectedFiles.map(f => f.type)
      });
      console.log('Upload data:', uploadDataArray);
      
      // Use the multiple images upload method
      await ProductImageService.uploadMultipleImages(productId, selectedFiles, uploadDataArray, token);
      
      toast.success(`${selectedFiles.length} images uploaded successfully`);
      
      // Clean up preview URLs
      if (previewUrls.length > 0) {
        previewUrls.forEach(url => URL.revokeObjectURL(url));
      }
      
      setSelectedFiles([]);
      setPreviewUrls([]);
      setUploadDataArray([{ color: '', alt: '', sortOrder: images.length }]);
      
      // Refresh images
      await fetchImages();
      onImagesChange?.();
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
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
                    value={uploadDataArray[0]?.color || ''}
                    onChange={(e) => setUploadDataArray(prev => 
                      prev.map((item, index) => ({ ...item, color: e.target.value }))
                    )}
                    placeholder="e.g., Red, Blue"
                  />
                </div>
                
                <div>
                  <Label htmlFor="alt">Alt Text (optional)</Label>
                  <Input
                    id="alt"
                    value={uploadDataArray[0]?.alt || ''}
                    onChange={(e) => setUploadDataArray(prev => 
                      prev.map((item, index) => ({ ...item, alt: e.target.value }))
                    )}
                    placeholder="Image description"
                  />
                </div>
                
                <div>
                  <Label htmlFor="sortOrder">Sort Order</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    value={uploadDataArray[0]?.sortOrder || ''}
                    onChange={(e) => {
                      const baseSortOrder = parseInt(e.target.value) || 0;
                      setUploadDataArray(prev => 
                        prev.map((item, index) => ({ ...item, sortOrder: baseSortOrder + index }))
                      );
                    }}
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
                    multiple // Allow multiple file selection
                  />
                  <label 
                    htmlFor="image-upload" 
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="h-8 w-8 text-gray-400" />
                    <div>
                      <span className="text-sm font-medium text-gray-600">
                        Click to select images
                      </span>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF, WEBP up to 5MB each (max 10 images)
                      </p>
                    </div>
                  </label>
                </div>

                {/* Upload Button */}
                <div className="flex justify-center">
                  <Button 
                    onClick={handleUpload} 
                    disabled={uploading || selectedFiles.length === 0}
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
                        Upload {selectedFiles.length > 0 && `(${selectedFiles.length})`}
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {selectedFiles.length > 0 && (
                <div className="mt-4 space-y-4">
                  {/* Image Preview */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-800 mb-3">
                      Selected Images ({selectedFiles.length}):
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition-colors w-32 h-32">
                            <img
                              src={previewUrls[index]}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        
                          {/* Remove button */}
                          <button
                            onClick={() => {
                              const newSelectedFiles = selectedFiles.filter((_, i) => i !== index);
                              setSelectedFiles(newSelectedFiles);
                              const newPreviewUrls = previewUrls.filter((_, i) => i !== index);
                              setPreviewUrls(newPreviewUrls);
                              // Clean up the removed preview URL
                              URL.revokeObjectURL(previewUrls[index]);
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
                            title="Remove image"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Images Grid */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Current Images ({images.length})</h3>
                <div className="text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-lg">
                  <Star className="h-4 w-4 inline mr-1 text-yellow-500" />
                  Primary image will be displayed on product pages and listings
                </div>
              </div>
              
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
                                  title="Set as primary image"
                                >
                                  <Star className="h-4 w-4" />
                                </Button>
                              )}
                              
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteImage(image.id)}
                                className="h-8 w-8 p-0"
                                title="Delete image"
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
