import React, { useState } from 'react';
import { ProductImage } from '../types';
import { ImageWithPlaceholder } from './ui/image-with-placeholder';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import PhotoSwipe from 'photoswipe';
import ColorSwatches from './ColorSwatches';

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
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  images,
  productName,
  className = '',
  colors = [],
  selectedColor = '',
  onColorChange,
  showColorSwatches = false
}) => {
  const [selectedImage, setSelectedImage] = useState(0);

  const currentImage = images[selectedImage] || images[0];
  const currentImageUrl = currentImage?.url;

  const handleImageChange = (index: number) => {
    setSelectedImage(index);
  };

  const handleColorChange = (colorName: string) => {
    if (onColorChange) {
      onColorChange(colorName);
    }
  };

  const handleZoom = () => {
    if (!images.length) return;

    const options = {
      dataSource: images.map((image, index) => ({
        src: image.url,
        width: 1200,
        height: 1200,
        alt: `${productName} - Image ${index + 1}`
      })),
      index: selectedImage,
      showHideAnimationType: 'fade' as const,
      showAnimationDuration: 300,
      hideAnimationDuration: 300,
      easing: 'cubic-bezier(0.4, 0, 0.22, 1)',
      allowPanToNext: true,
      allowMouseDrag: true,
      allowTouchDrag: true,
      allowVerticalDrag: true,
      allowHorizontalDrag: true,
      zoomAnimationDuration: 300,
      maxZoomLevel: 4,
      minZoomLevel: 1,
      secondaryZoomLevel: 2,
      maxSpreadZoom: 2,
      getDoubleTapZoom: (isMouseClick: boolean, item: any) => {
        return item.initialZoomLevel * 2;
      },
      paddingFn: () => {
        return { top: 30, bottom: 30, left: 70, right: 70 };
      }
    };

    const pswp = new PhotoSwipe(options);
    pswp.init();
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
        {currentImageUrl && (
          <ImageWithPlaceholder
            src={currentImageUrl}
            alt={`${productName} - Image ${selectedImage + 1}`}
            className="w-full h-full object-cover transition-all duration-300"
          />
        )}

        {/* Zoom button */}
        <Button
          onClick={handleZoom}
          size="sm"
          variant="secondary"
          className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>

        {/* Navigation arrows */}
        {images.length > 1 && (
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
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {images.map((image, index) => (
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
                src={image.url}
                alt={`${productName} thumbnail ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
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
