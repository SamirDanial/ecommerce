# Color-Specific Image Loading System

## Overview

This system implements lazy loading of product images based on selected colors, significantly improving application performance by only loading images for the currently selected color instead of loading all product images at once.

## Features

- **Lazy Loading**: Images are loaded only when a specific color is selected
- **Smart Caching**: Once loaded, color images are cached to avoid re-fetching
- **Preloading**: Adjacent colors are preloaded in the background for better UX
- **Fallback Support**: Falls back to default images if color-specific images aren't found
- **Performance Optimized**: Reduces initial page load time and bandwidth usage

## Backend API

### New Endpoint

```
GET /api/products/:productId/images/:color
```

**Response:**
```json
{
  "images": [
    {
      "id": 1,
      "url": "product-black-1.jpg",
      "alt": "Product in Black",
      "sortOrder": 0,
      "isPrimary": true,
      "productId": 123
    }
  ],
  "isColorSpecific": true,
  "totalImages": 15,
  "colorImagesFound": 5
}
```

### Image Naming Convention

The system uses a naming convention to identify color-specific images:

- **Format**: `product-color-number.extension`
- **Examples**:
  - `tshirt-black-1.jpg`
  - `tshirt-black-2.jpg`
  - `tshirt-white-1.jpg`
  - `tshirt-blue-1.jpg`

## Frontend Implementation

### ProductImageGallery Component

The `ProductImageGallery` component now supports lazy loading:

```tsx
<ProductImageGallery
  images={images}
  productName={product.name}
  defaultImages={images.map(img => img.url)}
  productId={product.id}
  onImagesLoaded={handleImagesLoaded}
  enableLazyLoading={true}
/>
```

### Props

- `enableLazyLoading`: Enables the lazy loading system
- `productId`: Required for API calls to fetch color-specific images
- `onImagesLoaded`: Callback when images are loaded for a color
- `defaultImages`: Fallback images when no color is selected

### State Management

The component manages:
- `lazyLoadedImages`: Cache of loaded images by color
- `isLoadingImages`: Loading state for current color
- `selectedImage`: Currently displayed image index

## Usage Example

### 1. Basic Setup

```tsx
import ProductImageGallery from '../components/ProductImageGallery';

function ProductDetail({ product }) {
  const handleImagesLoaded = (images, color) => {
    console.log(`Loaded ${images.length} images for ${color}`);
  };

  return (
    <ProductImageGallery
      images={product.images}
      productName={product.name}
      productId={product.id}
      onImagesLoaded={handleImagesLoaded}
      enableLazyLoading={true}
    />
  );
}
```

### 2. Color Selection

When a user selects a color:
1. Component checks if images for that color are cached
2. If not cached, makes API call to fetch color-specific images
3. Displays loading state while fetching
4. Updates gallery with new images
5. Caches images for future use

### 3. Preloading Strategy

The system automatically preloads adjacent colors:
- **Next color**: Preloaded after 1 second
- **Previous color**: Preloaded after 1.5 seconds
- **Non-blocking**: Uses setTimeout to avoid blocking the main thread

## Performance Benefits

### Before (Loading All Images)
- **Initial Load**: All product images (e.g., 15 images × 3 colors = 45 images)
- **Bandwidth**: Higher initial usage
- **Memory**: All images stored in memory
- **User Experience**: Slower initial page load

### After (Lazy Loading)
- **Initial Load**: Only default images (e.g., 5 images)
- **Bandwidth**: Loaded on-demand
- **Memory**: Only loaded colors stored in memory
- **User Experience**: Faster initial page load, smooth color switching

## File Structure

```
backend/
├── src/routes/productRoutes.ts    # New color-specific image endpoint
frontend/
├── src/components/ProductImageGallery.tsx  # Enhanced with lazy loading
├── src/services/api.ts            # New getImagesByColor method
└── src/pages/ProductDetail.tsx    # Updated to use lazy loading
```

## Future Enhancements

### 1. Schema Enhancement
Add a `color` field to the `ProductImage` model for direct color association:

```prisma
model ProductImage {
  id        Int      @id @default(autoincrement())
  productId Int
  color     String?  @db.VarChar(50)  // New field
  url       String   @db.VarChar(500)
  // ... other fields
}
```

### 2. Advanced Caching
- Implement Redis caching for frequently accessed color images
- Add cache invalidation strategies
- Implement image compression and optimization

### 3. Progressive Loading
- Load low-resolution thumbnails first
- Progressive enhancement to high-resolution images
- WebP format support for better compression

## Troubleshooting

### Common Issues

1. **Images not loading**: Check if `enableLazyLoading` is true and `productId` is provided
2. **Wrong images displayed**: Verify image naming convention matches backend expectations
3. **Performance issues**: Ensure preloading delays are appropriate for your use case

### Debug Mode

Enable console logging to debug image loading:

```tsx
const handleImagesLoaded = (images, color) => {
  console.log(`Loaded ${images.length} images for color: ${color}`);
  console.log('Images:', images);
};
```

## Best Practices

1. **Image Naming**: Use consistent naming conventions for color-specific images
2. **Caching**: Leverage the built-in caching system
3. **Preloading**: Adjust preloading delays based on your server capacity
4. **Fallbacks**: Always provide default images for better UX
5. **Error Handling**: Implement proper error handling for failed image loads

## Conclusion

This color-specific image loading system provides significant performance improvements while maintaining a smooth user experience. It's designed to be easily extensible and can be enhanced with more advanced features as your application grows.
