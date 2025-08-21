import React, { useState, useEffect, useCallback } from 'react';
import { ProductImage } from '../types';
import { ImageWithPlaceholder } from './ui/image-with-placeholder';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import ColorSwatches from './ColorSwatches';
import { productService } from '../services/api';
import { getFullImageUrl } from '../utils/imageUtils';

interface ProductImageGalleryProps {
  images: ProductImage[];
  productName: string;
  className?: string;
  colors?: Array<{
    name: string;
    color: string;
    colorCode?: string;
    imageUrl?: string;
    inStock?: boolean;
  }>;
  selectedColor?: string;
  onColorChange?: (color: string) => void;
  showColorSwatches?: boolean;
  // New props for color-specific images
  colorImages?: Record<string, string[]>; // Map of color name to image URLs
  defaultImages?: string[]; // Default images when no color is selected
  // New props for lazy loading
  productId?: number;
  onImagesLoaded?: (images: ProductImage[], color: string) => void;
  enableLazyLoading?: boolean;
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  images,
  productName,
  className = '',
  colors = [],
  selectedColor = '',
  onColorChange,
  showColorSwatches = false,
  colorImages = {},
  defaultImages = [],
  productId,
  onImagesLoaded,
  enableLazyLoading = false
}) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [lazyLoadedImages, setLazyLoadedImages] = useState<Record<string, ProductImage[]>>({});
  const [isLoadingImages, setIsLoadingImages] = useState(false);

  // Reset selected image when color changes
  React.useEffect(() => {
    setSelectedImage(0);
  }, [selectedColor]);

    // Lazy load images for a specific color
  const loadImagesForColor = useCallback(async (color: string) => {
    if (!enableLazyLoading || !productId) {
      console.log(`Lazy loading disabled or no productId: enableLazyLoading=${enableLazyLoading}, productId=${productId}`);
      return;
    }
    
    // Check if we already have images for this color (cached)
    if (lazyLoadedImages[color] && lazyLoadedImages[color].length > 0) {
      console.log(`Images for color ${color} already cached, using cached version`);
      return;
    }

    console.log(`Loading images for color: ${color}, productId: ${productId}`);
    
    try {
      setIsLoadingImages(true);
      const response = await productService.getImagesByColor(productId, color);
      
      console.log(`API response for color ${color}:`, response);
      
      if (response.images && response.images.length > 0) {
        const newImages: ProductImage[] = response.images.map((img: any, index: number) => ({
          id: img.id || index,
          url: img.url,
          alt: img.alt || `${productName} - ${color} - Image ${index + 1}`,
          sortOrder: img.sortOrder || index,
          isPrimary: img.isPrimary || index === 0,
          productId: img.productId,
          createdAt: img.createdAt || new Date().toISOString()
        }));

        console.log(`Mapped ${newImages.length} images for color ${color}:`, newImages);

        setLazyLoadedImages(prev => ({
          ...prev,
          [color]: newImages
        }));

        // Notify parent component
        if (onImagesLoaded) {
          onImagesLoaded(newImages, color);
        }
      } else {
        console.log(`No images returned for color ${color}`);
      }
    } catch (error) {
      console.error(`Failed to load images for color ${color}:`, error);
    } finally {
      setIsLoadingImages(false);
    }
  }, [enableLazyLoading, productId, lazyLoadedImages, productName, onImagesLoaded]);

  // Load images when color changes
  useEffect(() => {
    if (selectedColor && enableLazyLoading && productId) {
      console.log(`Color changed to: ${selectedColor}, loading images...`);
      loadImagesForColor(selectedColor);
      
      // Preload images for adjacent colors to improve UX
      if (colors && colors.length > 0) {
        const currentIndex = colors.findIndex(c => c.color === selectedColor);
        if (currentIndex !== -1) {
          // Preload next color
          const nextColor = colors[(currentIndex + 1) % colors.length];
          if (nextColor && !lazyLoadedImages[nextColor.color]) {
            setTimeout(() => loadImagesForColor(nextColor.color), 1000); // Delay to avoid blocking
          }
          
          // Preload previous color
          const prevColor = colors[currentIndex === 0 ? colors.length - 1 : currentIndex - 1];
          if (prevColor && !lazyLoadedImages[prevColor.color]) {
            setTimeout(() => loadImagesForColor(prevColor.color), 1500); // Further delay
          }
        }
      }
    }
  }, [selectedColor, enableLazyLoading, productId, loadImagesForColor, colors, lazyLoadedImages]);

  // Get images based on selected color
  const getImagesForColor = () => {
    // Priority 1: Lazy loaded images for the selected color
    if (enableLazyLoading && selectedColor && lazyLoadedImages[selectedColor]) {
      return lazyLoadedImages[selectedColor];
    }
    
    // Priority 2: Color-specific images from props
    if (selectedColor && colorImages[selectedColor]) {
      return colorImages[selectedColor].map((url, index) => ({
        id: index,
        url,
        alt: `${productName} - ${selectedColor} - Image ${index + 1}`,
        sortOrder: index,
        isPrimary: index === 0
      }));
    }
    
    // Priority 3: Default images or provided images
    return defaultImages.length > 0 
      ? defaultImages.map((url, index) => ({
          id: index,
          url,
          alt: `${productName} - Image ${index + 1}`,
          sortOrder: index,
          isPrimary: index === 0
        }))
      : images;
  };

  const currentImages = getImagesForColor();
  const currentImage = currentImages[selectedImage] || currentImages[0];
  const currentImageUrl = currentImage?.url ? getFullImageUrl(currentImage.url) : '';

  const handleImageChange = (index: number) => {
    setSelectedImage(index);
  };

  const handleColorChange = (colorName: string) => {
    if (onColorChange) {
      onColorChange(colorName);
    }
  };



  const handlePrevious = () => {
    const newIndex = selectedImage > 0 ? selectedImage - 1 : images.length - 1;
    handleImageChange(newIndex);
  };

  const handleNext = () => {
    const newIndex = selectedImage < images.length - 1 ? selectedImage + 1 : 0;
    handleImageChange(newIndex);
  };

  if (!images || images.length === 0) {
    return (
      <div className={`aspect-square bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Image */}
      <div className="relative aspect-square overflow-hidden rounded-lg border group bg-white">
        {isLoadingImages && enableLazyLoading ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <p className="text-sm text-gray-500">Loading {selectedColor} images...</p>
            </div>
          </div>
        ) : currentImageUrl ? (
          <ImageWithPlaceholder
            src={currentImageUrl}
            alt={`${productName} - Image ${selectedImage + 1}`}
            className="w-auto h-auto max-w-full max-h-full object-contain object-center transition-all duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <p className="text-gray-500">No images available</p>
          </div>
        )}



        {/* Navigation arrows */}
        {currentImages.length > 1 && (
          <>
            <Button
              onClick={handlePrevious}
              size="sm"
              variant="secondary"
              className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleNext}
              size="sm"
              variant="secondary"
              className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {currentImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {currentImages.map((image, index) => (
            <button
              key={index}
              onClick={() => handleImageChange(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 transition-all ${
                selectedImage === index
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <ImageWithPlaceholder
                src={getFullImageUrl(image.url)}
                alt={`${productName} thumbnail ${index + 1}`}
                className="w-auto h-auto max-w-full max-h-full object-contain object-center rounded-lg"
              />
            </button>
          ))}
        </div>
        )}

      {/* Color Swatches */}
      {showColorSwatches && colors && colors.length > 0 && (
        <ColorSwatches
          colors={colors}
          selectedColor={selectedColor}
          onColorChange={handleColorChange}
          className="mt-4"
        />
      )}
    </div>
  );
};

export default ProductImageGallery;
