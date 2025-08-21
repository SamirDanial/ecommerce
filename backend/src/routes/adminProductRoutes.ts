import express, { Request } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateClerkToken } from '../middleware/clerkAuth';
import adminProductVariantRoutes from './adminProductVariantRoutes.js';
import adminProductImageRoutes from './adminProductImageRoutes.js';
import adminProductStatsRoutes from './adminProductStatsRoutes.js';

// Extend Express Request interface to include productId
declare global {
  namespace Express {
    interface Request {
      productId?: number;
    }
  }
}

const router = express.Router();

// Helper function to convert Decimal to number
const convertDecimalToNumber = (obj: any): any => {
  if (obj && typeof obj === 'object') {
    if (Array.isArray(obj)) {
      return obj.map((item: any) => convertDecimalToNumber(item));
    }
    
    const converted = { ...obj };
    for (const key in converted) {
      if (converted[key] && typeof converted[key] === 'object') {
        if (converted[key].constructor.name === 'Decimal') {
          converted[key] = Number(converted[key]);
        } else if ((converted[key] as any).d) {
          converted[key] = Number(converted[key]);
        } else if (converted[key] instanceof Date) {
          converted[key] = converted[key].toISOString();
        } else if (converted[key] && typeof converted[key] === 'object') {
          converted[key] = convertDecimalToNumber(converted[key]);
        }
      }
    }
    return converted;
  }
  return obj;
};

// Helper function to generate unique slug
const generateUniqueSlug = async (name: string, existingSlug?: string): Promise<string> => {
  let baseSlug = name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  // If this is an update and the slug hasn't changed, return the existing one
  if (existingSlug && baseSlug === existingSlug) {
    return existingSlug;
  }
  
  let slug = baseSlug;
  let counter = 1;
  
  // Keep checking until we find a unique slug
  while (true) {
    const existingProduct = await prisma.product.findUnique({
      where: { slug }
    });
    
    if (!existingProduct) {
      return slug;
    }
    
    // If slug exists, append a number
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
};

// Helper function to generate unique SKU
const generateUniqueSku = async (baseSku: string): Promise<string> => {
  let sku = baseSku;
  let counter = 1;
  
  // Keep checking until we find a unique SKU
  while (true) {
    const existingProduct = await prisma.product.findUnique({
      where: { sku }
    });
    
    if (!existingProduct) {
      return sku;
    }
    
    // If SKU exists, append a number
    sku = `${baseSku}-${counter}`;
    counter++;
  }
};

// Get all products with advanced filtering and pagination
router.get('/', authenticateClerkToken, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      category, 
      status, 
      featured, 
      onSale,
      stockStatus,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    let where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { sku: { contains: search as string, mode: 'insensitive' } },
        { barcode: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (category && category !== 'all') {
      where.categoryId = parseInt(category as string);
    }

    if (status && status !== 'all') {
      where.isActive = status === 'active';
    }

    if (featured && featured !== 'all') {
      where.isFeatured = featured === 'true';
    }

    if (onSale && onSale !== 'all') {
      where.isOnSale = onSale === 'true';
    }

    // Build order by clause
    let orderBy: any = {};
    orderBy[sortBy as string] = sortOrder;

    // Get only essential data for product list display
    const allProducts = await prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        salePrice: true,
        isOnSale: true,
        isActive: true,
        isFeatured: true,
        category: {
          select: { id: true, name: true, slug: true }
        },
        // Get primary image for display
        images: {
          where: { isPrimary: true },
          select: { url: true, alt: true },
          take: 1
        },
        // Get variants for stock calculation and status filtering
        variants: {
          select: { 
            stock: true, 
            isActive: true, 
            stockStatus: true
          }
        },
        _count: {
          select: { 
            variants: true, 
            images: true,
            reviews: true,
            orderItems: true
          }
        }
      },
      orderBy
    });

    // Convert decimals and calculate stock for essential data
    let convertedProducts = allProducts.map(product => {
      // Calculate total stock from variants
      const totalStock = (product as any).variants.reduce((sum: number, variant: any) => {
        return sum + (variant.isActive ? variant.stock : 0);
      }, 0);
      
      // Calculate overall stock status based on variants
      const activeVariants = (product as any).variants.filter((v: any) => v.isActive);
      let overallStockStatus = 'IN_STOCK';
      
      if (activeVariants.length === 0) {
        overallStockStatus = 'OUT_OF_STOCK';
      } else {
        const outOfStockVariants = activeVariants.filter((v: any) => v.stock === 0);
        const lowStockVariants = activeVariants.filter((v: any) => 
          v.stock > 0 && v.stock <= 3
        );
        const backorderVariants = activeVariants.filter((v: any) => 
          v.stock === 0 && false // Simplified for now
        );
        
        if (outOfStockVariants.length === activeVariants.length) {
          overallStockStatus = backorderVariants.length > 0 ? 'BACKORDER' : 'OUT_OF_STOCK';
        } else if (lowStockVariants.length > 0) {
          overallStockStatus = 'LOW_STOCK';
        }
      }
      
      // Get primary image URL
      const primaryImage = (product as any).images.length > 0 ? (product as any).images[0] : null;
      
      // Remove the images array and variants array since we have primaryImage and totalStock
      const { images, variants, ...productWithoutImagesAndVariants } = convertDecimalToNumber(product);
      
      return {
        ...productWithoutImagesAndVariants,
        totalStock,
        overallStockStatus,
        primaryImage: primaryImage ? {
          url: primaryImage.url,
          alt: primaryImage.alt
        } : null
      };
    });

    // Apply stock status filtering if specified
    if (stockStatus && stockStatus !== 'all') {
      convertedProducts = convertedProducts.filter(product => 
        product.overallStockStatus === stockStatus
      );
    }

    // Now apply pagination to the filtered results
    const total = convertedProducts.length;
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedProducts = convertedProducts.slice(startIndex, endIndex);

    res.json({
      products: paginatedProducts,
      totalProducts: total, // Use total filtered count
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Failed to fetch products', error: error });
  }
});

// Get all products for export (returns complete product data)
router.get('/export', authenticateClerkToken, async (req, res) => {
  try {
    console.log('Export endpoint called');
    
    // Get all products with complete data (no pagination for export)
    const products = await prisma.product.findMany({
      include: {
        category: {
          select: { id: true, name: true, slug: true }
        },
        variants: {
          select: { 
            id: true,
            size: true,
            color: true,
            colorCode: true,
            stock: true, 
            isActive: true, 
            lowStockThreshold: true,
            allowBackorder: true,
            stockStatus: true,
            price: true,
            comparePrice: true,
            sku: true
          }
        },
        images: {
          select: { 
            id: true,
            url: true, 
            alt: true,
            isPrimary: true,
            sortOrder: true
          },
          orderBy: [
            { isPrimary: 'desc' },
            { sortOrder: 'asc' }
          ]
        },
        _count: {
          select: { 
            variants: true, 
            images: true,
            reviews: true,
            orderItems: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Convert decimals and add calculated fields
    const convertedProducts = products.map(product => {
      // Calculate total stock from variants
      const totalStock = product.variants.reduce((sum, variant) => {
        return sum + (variant.isActive ? variant.stock : 0);
      }, 0);
      
      // Get primary image URL
      const primaryImage = product.images.find(img => img.isPrimary) || product.images[0] || null;
      
      return {
        ...convertDecimalToNumber(product),
        totalStock,
        primaryImage: primaryImage ? {
          url: primaryImage.url,
          alt: primaryImage.alt
        } : null
      };
    });

    console.log(`Export endpoint returning ${convertedProducts.length} products`);
    res.json({
      products: convertedProducts,
      totalProducts: convertedProducts.length
    });
  } catch (error) {
    console.error('Error fetching products for export:', error);
    res.status(500).json({ message: 'Failed to fetch products for export', error: error });
  }
});

// Get single product with full details
router.get('/:id', authenticateClerkToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: {
          select: { id: true, name: true, slug: true, isActive: true }
        },
        variants: {
          orderBy: [{ size: 'asc' }, { color: 'asc' }]
        },
        images: {
          orderBy: [
            { isPrimary: 'desc' },
            { sortOrder: 'asc' }
          ]
        },
        reviews: {
          where: { status: 'APPROVED', isActive: true },
          include: {
            user: { select: { name: true, avatar: true } }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: {
          select: { 
            variants: true, 
            images: true,
            reviews: true,
            orderItems: true,
            wishlistItems: true
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Calculate average rating
    const avgRating = (product as any).reviews.length > 0 
      ? (product as any).reviews.reduce((sum: any, review: any) => sum + review.rating, 0) / (product as any).reviews.length 
      : 0;

    const convertedProduct = {
      ...convertDecimalToNumber(product),
      averageRating: Math.round(avgRating * 10) / 10,
      totalStock: (product as any).variants.reduce((sum: any, variant: any) => sum + variant.stock, 0)
    };

    res.json(convertedProduct);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Failed to fetch product', error: error });
  }
});

// Create new product
router.post('/', authenticateClerkToken, async (req, res) => {
  try {
    const {
      name,
      description,
      shortDescription,
      price,
      comparePrice,
      costPrice,
      categoryId,
      sku,
      barcode,
      weight,
      dimensions,
      tags,
      metaTitle,
      metaDescription,
      isActive = true,
      isFeatured = false,
      isOnSale = false,
      salePrice,
      saleEndDate,
      variants = []
    } = req.body;

    // Validate required fields
    if (!name || !description || !price || !categoryId) {
      return res.status(400).json({ 
        message: 'Name, description, price, and category are required' 
      });
    }

    // Check if SKU is unique
    if (sku) {
      const existingSku = await prisma.product.findUnique({ where: { sku } });
      if (existingSku) {
        return res.status(400).json({ message: 'SKU already exists' });
      }
    }

    // Check if barcode is unique (only if provided)
    if (barcode) {
      const existingBarcode = await prisma.product.findFirst({ where: { barcode } });
      if (existingBarcode) {
        return res.status(400).json({ message: 'Barcode already exists' });
      }
    }

    // Generate unique slug from name
    const slug = await generateUniqueSlug(name);

    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        description,
        shortDescription,
        price: parseFloat(price),
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        costPrice: costPrice ? parseFloat(costPrice) : null,
        categoryId: parseInt(categoryId),
        sku,
        barcode,
        weight: weight ? parseFloat(weight) : null,
        dimensions,
        tags: tags || [],
        metaTitle,
        metaDescription,
        isActive,
        isFeatured,
        isOnSale,
        salePrice: salePrice ? parseFloat(salePrice) : null,
        saleEndDate: saleEndDate ? new Date(saleEndDate) : null,
        slug
      },
      include: {
        category: true,
        variants: true,
        images: true
      }
    });

    // Create variants if provided
    if (variants && variants.length > 0) {
      const variantData = variants.map((variant: any) => ({
        productId: product.id,
        size: variant.size,
        color: variant.color,
        colorCode: variant.colorCode,
        stock: parseInt(variant.stock) || 0,
        sku: variant.sku,
        price: variant.price ? parseFloat(variant.price) : null,
        comparePrice: variant.comparePrice ? parseFloat(variant.comparePrice) : null,
        isActive: variant.isActive !== false
      }));

      await prisma.productVariant.createMany({
        data: variantData
      });
    }

    const createdProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        category: true,
        variants: true,
        images: true
      }
    });

    res.status(201).json(convertDecimalToNumber(createdProduct));
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Failed to create product', error: error });
  }
});

// Update product
router.put('/:id', authenticateClerkToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Remove fields that shouldn't be updated directly
    delete updateData.variants;
    delete updateData.images;
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    // Convert numeric fields
    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.comparePrice) updateData.comparePrice = parseFloat(updateData.comparePrice);
    if (updateData.costPrice) updateData.costPrice = parseFloat(updateData.costPrice);
    if (updateData.salePrice) updateData.salePrice = parseFloat(updateData.salePrice);
    if (updateData.weight) updateData.weight = parseFloat(updateData.weight);
    if (updateData.categoryId) updateData.categoryId = parseInt(updateData.categoryId);

    // Handle date fields
    if (updateData.saleEndDate) {
      updateData.saleEndDate = new Date(updateData.saleEndDate);
    }

    // Generate new slug if name changed
    if (updateData.name) {
      const currentProduct = await prisma.product.findUnique({
        where: { id: parseInt(id) }
      });
      if (currentProduct) {
        updateData.slug = await generateUniqueSlug(updateData.name, currentProduct.slug);
      }
    }

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        category: true,
        variants: true,
        images: true
      }
    });

    res.json(convertDecimalToNumber(product));
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Failed to update product', error: error });
  }
});

// Delete product
router.delete('/:id', authenticateClerkToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product has orders
    const orderItems = await prisma.orderItem.findFirst({
      where: { productId: parseInt(id) }
    });

    if (orderItems) {
      return res.status(400).json({ 
        message: 'Cannot delete product with existing orders. Consider deactivating instead.' 
      });
    }

    // Delete product (cascades to variants, images, etc.)
    await prisma.product.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Failed to delete product', error: error });
  }
});

// Toggle product status
router.patch('/:id/toggle-status', authenticateClerkToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: { isActive: !product.isActive },
      include: {
        category: true,
        variants: true,
        images: true
      }
    });

    res.json(convertDecimalToNumber(updatedProduct));
  } catch (error) {
    console.error('Error toggling product status:', error);
    res.status(500).json({ message: 'Failed to toggle product status', error: error });
  }
});

// Update stock management settings
router.put('/:id/stock-management', authenticateClerkToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { lowStockThreshold, allowBackorder, variants } = req.body;

    console.log('Updating stock management for product:', id);
    console.log('Data received:', { lowStockThreshold, allowBackorder, variants });

    // Update product-level settings
    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        lowStockThreshold: parseInt(lowStockThreshold) || 5,
        allowBackorder: allowBackorder || false
      } as any
    });

    console.log('Product updated:', updatedProduct.id);

    // Update variant-level settings
    if (variants && variants.length > 0) {
      for (const variantUpdate of variants) {
        await prisma.productVariant.update({
          where: { id: variantUpdate.id },
          data: {
            lowStockThreshold: parseInt(variantUpdate.lowStockThreshold) || 3,
            allowBackorder: variantUpdate.allowBackorder || false
          } as any
        });
        console.log('Variant updated:', variantUpdate.id);
      }
    }

    // Fetch updated product with variants
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true,
        variants: true,
        images: true
      }
    });

    console.log('Stock management updated successfully for product:', id);
    res.json(convertDecimalToNumber(product));
  } catch (error) {
    console.error('Error updating stock management:', error);
    res.status(500).json({ message: 'Failed to update stock management', error: error });
  }
});

// Update stock quantities and management settings
router.put('/:id/stock-and-settings', authenticateClerkToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { lowStockThreshold, allowBackorder, variants } = req.body;

    console.log('Updating stock and settings for product:', id);
    console.log('Data received:', { lowStockThreshold, allowBackorder, variants });

    // Update product-level settings
    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        lowStockThreshold: parseInt(lowStockThreshold) || 5,
        allowBackorder: allowBackorder || false
      } as any
    });

    console.log('Product updated:', updatedProduct.id);

    // Update variant-level settings and stock quantities
    if (variants && variants.length > 0) {
      for (const variantUpdate of variants) {
        await prisma.productVariant.update({
          where: { id: variantUpdate.id },
          data: {
            stock: parseInt(variantUpdate.stock) || 0,
            lowStockThreshold: parseInt(variantUpdate.lowStockThreshold) || 3,
            allowBackorder: variantUpdate.allowBackorder || false
          } as any
        });
        console.log('Variant stock and settings updated:', variantUpdate.id, 'Stock:', variantUpdate.stock);
      }
    }

    // Fetch updated product with variants
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true,
        variants: true,
        images: true
      }
    });

    console.log('Stock and settings updated successfully for product:', id);
    res.json(convertDecimalToNumber(product));
  } catch (error) {
    console.error('Error updating stock and settings:', error);
    res.status(500).json({ message: 'Failed to update stock and settings', error: error });
  }
});

// Get product variants for stock management
router.get('/:id/variants', authenticateClerkToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const variants = await prisma.productVariant.findMany({
      where: { productId: parseInt(id) },
      orderBy: [{ size: 'asc' }, { color: 'asc' }]
    });

    console.log(`Fetched ${variants.length} variants for product ${id}`);
    res.json(convertDecimalToNumber(variants));
  } catch (error) {
    console.error('Error fetching product variants:', error);
    res.status(500).json({ message: 'Failed to fetch product variants', error: error });
  }
});

// Mount sub-routes with product ID middleware
router.use('/:id/variants', (req, res, next) => {
  req.productId = parseInt(req.params.id);
  next();
}, adminProductVariantRoutes);

router.use('/:id/images', (req, res, next) => {
  req.productId = parseInt(req.params.id);
  next();
}, adminProductImageRoutes);

router.use('/:id/stats', (req, res, next) => {
  req.productId = parseInt(req.params.id);
  next();
}, adminProductStatsRoutes);

// Import products from JSON
router.post('/import/validate', authenticateClerkToken, async (req, res) => {
  try {
    const { products } = req.body;
    
    if (!Array.isArray(products)) {
      return res.status(400).json({ 
        message: 'Invalid format: products must be an array',
        valid: false 
      });
    }

    const validationResults = [];
    let hasErrors = false;

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const errors = [];
      
      // Required field validation
      if (!product.name || typeof product.name !== 'string') {
        errors.push('Name is required and must be a string');
      }
      if (!product.price || typeof product.price !== 'number') {
        errors.push('Price is required and must be a number');
      }
      if (!product.categoryId || typeof product.categoryId !== 'number') {
        errors.push('Category ID is required and must be a number');
      }
      if (!product.description || typeof product.description !== 'string') {
        errors.push('Description is required and must be a string');
      }

      // Data type validation
      if (product.isActive !== undefined && typeof product.isActive !== 'boolean') {
        errors.push('isActive must be a boolean');
      }
      if (product.isFeatured !== undefined && typeof product.isFeatured !== 'boolean') {
        errors.push('isFeatured must be a boolean');
      }
      if (product.isOnSale !== undefined && typeof product.isOnSale !== 'boolean') {
        errors.push('isOnSale must be a boolean');
      }

      // Price validation
      if (product.price < 0) {
        errors.push('Price cannot be negative');
      }
      if (product.comparePrice && product.comparePrice < 0) {
        errors.push('Compare price cannot be negative');
      }
      if (product.costPrice && product.costPrice < 0) {
        errors.push('Cost price cannot be negative');
      }

      // Category existence validation
      if (product.categoryId) {
        const category = await prisma.category.findUnique({
          where: { id: product.categoryId }
        });
        if (!category) {
          errors.push(`Category with ID ${product.categoryId} does not exist`);
        }
      }

      // SKU uniqueness validation - now just a warning since backend handles duplicates
      let skuWarning = null;
      if (product.sku) {
        const existingProduct = await prisma.product.findUnique({
          where: { sku: product.sku }
        });
        if (existingProduct) {
          skuWarning = `SKU ${product.sku} already exists - will be automatically made unique`;
        }
      }

      // Variant validation
      if (product.variants && Array.isArray(product.variants)) {
        for (let j = 0; j < product.variants.length; j++) {
          const variant = product.variants[j];
          if (!variant.size || !variant.color || typeof variant.stock !== 'number') {
            errors.push(`Variant ${j + 1}: size, color, and stock are required`);
          }
          if (variant.stock < 0) {
            errors.push(`Variant ${j + 1}: stock cannot be negative`);
          }
        }
      }

      validationResults.push({
        index: i,
        product: { name: product.name, sku: product.sku },
        errors,
        warnings: skuWarning ? [skuWarning] : [],
        valid: errors.length === 0
      });

      if (errors.length > 0) {
        hasErrors = true;
      }
    }

    res.json({
      valid: !hasErrors,
      results: validationResults,
      totalProducts: products.length,
      validProducts: validationResults.filter(r => r.valid).length,
      invalidProducts: validationResults.filter(r => !r.valid).length
    });

  } catch (error) {
    console.error('Import validation error:', error);
    res.status(500).json({ 
      message: 'Failed to validate import data', 
      error: error instanceof Error ? error.message : 'Unknown error',
      valid: false 
    });
  }
});

// Execute import after validation
router.post('/import/execute', authenticateClerkToken, async (req, res) => {
  try {
    const { products, options = {} } = req.body;
    const { 
      skipDuplicates = true, 
      createMissingCategories = false,
      updateExisting = false,
      orphanCategoryStrategy = 'create', // 'skip' | 'create' - new option for handling products with invalid categories
      productDuplicateStrategy = 'generate_unique' // 'skip' | 'replace' | 'update' | 'generate_unique' - new option for handling duplicate products
    } = options;

    if (!Array.isArray(products)) {
      return res.status(400).json({ 
        message: 'Invalid format: products must be an array',
        success: false 
      });
    }

    const importResults = [];
    let importedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    // Handle orphan products strategy - create "Orphan Products" category if needed
    let orphanCategoryId: number | null = null;
    if (orphanCategoryStrategy === 'create') {
      // Check if we need to create an orphan category for products with invalid category IDs
      const hasOrphanProducts = products.some((product: any) => 
        !product.categoryId || product.categoryId <= 0
      );

      if (hasOrphanProducts) {
        try {
          // Check if "Orphan Products" category already exists
          let orphanCategory = await prisma.category.findFirst({
            where: { 
              OR: [
                { name: 'Orphan Products' },
                { slug: 'orphan-products' }
              ]
            }
          });

          if (!orphanCategory) {
            // Create "Orphan Products" category
            orphanCategory = await prisma.category.create({
              data: {
                name: 'Orphan Products',
                slug: 'orphan-products',
                description: 'Products imported without valid categories',
                isActive: true,
                sortOrder: 9999 // Put at the end
              }
            });
            console.log(`Created orphan category: ${orphanCategory.name} (ID: ${orphanCategory.id})`);
          }
          
          orphanCategoryId = orphanCategory.id;
        } catch (error) {
          console.error('Error creating orphan category:', error);
          // Continue without orphan category
        }
      }
    }

    for (const productData of products) {
      try {
        // Handle orphan products by assigning them to orphan category
        let finalCategoryId = productData.categoryId;
        if ((!productData.categoryId || productData.categoryId <= 0) && orphanCategoryId) {
          finalCategoryId = orphanCategoryId;
          console.log(`Product ${productData.name} has invalid category ID, assigning to orphan category ${orphanCategoryId}`);
        } else if (!productData.categoryId || productData.categoryId <= 0) {
          // No orphan category available, skip this product
          importResults.push({
            name: productData.name,
            sku: productData.sku,
            status: 'error',
            reason: 'Invalid category ID and no orphan category available'
          });
          errorCount++;
          continue;
        }

        // Check for existing product and handle duplicate SKUs based on strategy
        let existingProduct = null;
        let finalSku = productData.sku;
        let shouldCreateNew = false;
        
        if (productData.sku) {
          existingProduct = await prisma.product.findUnique({
            where: { sku: productData.sku }
          });
          
          if (existingProduct) {
            // Handle duplicate product based on strategy
            if (productDuplicateStrategy === 'skip') {
              console.log(`Skipping duplicate product: ${productData.name} (SKU: ${productData.sku})`);
              importResults.push({
                name: productData.name,
                sku: productData.sku,
                status: 'skipped',
                reason: 'Product with this SKU already exists (skip strategy)'
              });
              skippedCount++;
              continue;
            } else if (productDuplicateStrategy === 'replace') {
              // Delete existing product and all its variants/images
              console.log(`Replacing existing product: ${existingProduct.name} (ID: ${existingProduct.id})`);
              await prisma.productVariant.deleteMany({
                where: { productId: existingProduct.id }
              });
              await prisma.productImage.deleteMany({
                where: { productId: existingProduct.id }
              });
              await prisma.product.delete({
                where: { id: existingProduct.id }
              });
              existingProduct = null; // Will create new product
            } else if (productDuplicateStrategy === 'update') {
              // Keep existing product, will update it
              console.log(`Updating existing product: ${existingProduct.name} (ID: ${existingProduct.id})`);
            } else {
              // Default: generate unique SKU
              finalSku = await generateUniqueSku(productData.sku);
              existingProduct = null; // Will create new product with unique SKU
            }
          }
        } else {
          // Generate SKU from name if not provided
          finalSku = await generateUniqueSku(productData.name);
        }

        if (existingProduct && updateExisting) {
            // Update existing product
            const slug = await generateUniqueSlug(productData.name, existingProduct.slug);
            const updatedProduct = await prisma.product.update({
              where: { id: existingProduct.id },
              data: {
                name: productData.name,
                description: productData.description,
                price: productData.price,
                comparePrice: productData.comparePrice,
                costPrice: productData.costPrice,
                shortDescription: productData.shortDescription,
                weight: productData.weight,
                dimensions: productData.dimensions,
                tags: productData.tags || [],
                metaTitle: productData.metaTitle,
                metaDescription: productData.metaDescription,
                isActive: productData.isActive,
                isFeatured: productData.isFeatured,
                isOnSale: productData.isOnSale,
                salePrice: productData.salePrice,
                saleEndDate: productData.saleEndDate,
                lowStockThreshold: productData.lowStockThreshold,
                allowBackorder: productData.allowBackorder,
                slug
              }
            });

            // Update variants if provided
            if (productData.variants && Array.isArray(productData.variants)) {
              // Delete existing variants
              await prisma.productVariant.deleteMany({
                where: { productId: existingProduct.id }
              });

              // Create new variants
              for (const variantData of productData.variants) {
                await prisma.productVariant.create({
                  data: {
                    productId: existingProduct.id,
                    size: variantData.size,
                    color: variantData.color,
                    colorCode: variantData.colorCode,
                    stock: variantData.stock,
                    sku: variantData.sku,
                    price: variantData.price,
                    comparePrice: variantData.comparePrice,
                    isActive: variantData.isActive !== false,
                    lowStockThreshold: variantData.lowStockThreshold || 3,
                    allowBackorder: variantData.allowBackorder || false
                  }
                });
              }
            }

            // Update images if provided
            if (productData.images && Array.isArray(productData.images)) {
              // Delete existing images
              await prisma.productImage.deleteMany({
                where: { productId: existingProduct.id }
              });

              // Create new images
              for (const imageData of productData.images) {
                await prisma.productImage.create({
                  data: {
                    productId: existingProduct.id,
                    url: imageData.url,
                    alt: imageData.alt || '',
                    isPrimary: imageData.isPrimary || false,
                    sortOrder: imageData.sortOrder || 0
                  }
                });
              }
            }

            importResults.push({
              name: productData.name,
              sku: productData.sku,
              status: 'updated',
              productId: existingProduct.id
            });
            importedCount++;
        } else if (existingProduct && !updateExisting) {
            // Skip duplicate product
            importResults.push({
              name: productData.name,
              sku: productData.sku,
              status: 'skipped',
              reason: 'Product with this SKU already exists'
            });
            skippedCount++;
        } else {
          // Create new product
          const slug = await generateUniqueSlug(productData.name);
          const newProduct = await prisma.product.create({
            data: {
              name: productData.name,
              description: productData.description,
              price: productData.price,
              comparePrice: productData.comparePrice,
              costPrice: productData.costPrice,
              categoryId: finalCategoryId, // Use the final category ID (may be orphan category)
              sku: finalSku,
              barcode: productData.barcode,
              weight: productData.weight,
              dimensions: productData.dimensions,
              tags: productData.tags || [],
              metaTitle: productData.metaTitle,
              metaDescription: productData.metaDescription,
              isActive: productData.isActive !== false,
              isFeatured: productData.isFeatured || false,
              isOnSale: productData.isOnSale || false,
              salePrice: productData.salePrice,
              saleEndDate: productData.saleEndDate,
              lowStockThreshold: productData.lowStockThreshold || 5,
              allowBackorder: productData.allowBackorder || false,
              slug
            }
          });

          // Create variants if provided
          if (productData.variants && Array.isArray(productData.variants)) {
            for (const variantData of productData.variants) {
              await prisma.productVariant.create({
                data: {
                  productId: newProduct.id,
                  size: variantData.size,
                  color: variantData.color,
                  colorCode: variantData.colorCode,
                  stock: variantData.stock,
                  sku: variantData.sku,
                  price: variantData.price,
                  comparePrice: variantData.comparePrice,
                  isActive: variantData.isActive !== false,
                  lowStockThreshold: variantData.lowStockThreshold || 3,
                  allowBackorder: variantData.allowBackorder || false
                }
              });
            }
          }

          // Create images if provided
          if (productData.images && Array.isArray(productData.images)) {
            for (const imageData of productData.images) {
              await prisma.productImage.create({
                data: {
                  productId: newProduct.id,
                  url: imageData.url,
                  alt: imageData.alt || '',
                  isPrimary: imageData.isPrimary || false,
                  sortOrder: imageData.sortOrder || 0
                }
              });
            }
          }

          importResults.push({
            name: productData.name,
            sku: finalSku,
            status: 'created',
            productId: newProduct.id,
            originalSku: productData.sku !== finalSku ? productData.sku : undefined,
            skuChanged: productData.sku !== finalSku
          });
          importedCount++;
        }
      } catch (error) {
        console.error(`Error importing product ${productData.name}:`, error);
        
        // Provide more detailed error information
        let errorReason = 'Unknown error occurred';
        let errorDetails = '';
        
        if (error instanceof Error) {
          errorReason = error.message;
          errorDetails = error.stack || '';
        } else if (typeof error === 'string') {
          errorReason = error;
        } else if (error && typeof error === 'object') {
          errorReason = (error as any).message || 'Database or validation error';
          errorDetails = (error as any).code || '';
        }
        
        importResults.push({
          name: productData.name,
          sku: productData.sku,
          status: 'error',
          reason: errorReason,
          details: errorDetails
        });
        errorCount++;
      }
    }

    // Determine overall success based on results
    const hasErrors = errorCount > 0;
    const hasFailures = importResults.some(r => r.status === 'error');
    const overallSuccess = !hasErrors && !hasFailures && importedCount > 0;
    
    // Set appropriate HTTP status
    const statusCode = overallSuccess ? 200 : (hasErrors ? 400 : 207); // 207 = Multi-Status
    
    res.status(statusCode).json({
      success: overallSuccess,
      results: importResults,
      summary: {
        total: products.length,
        imported: importedCount,
        updated: importResults.filter(r => r.status === 'updated').length,
        skipped: skippedCount,
        errors: errorCount,
        orphanCategoryCreated: orphanCategoryId ? true : false,
        orphanProductsHandled: orphanCategoryId ? 'assigned_to_orphan_category' : 'skipped'
      },
      message: overallSuccess 
        ? `Import completed successfully! ${importedCount} products imported.${orphanCategoryId ? ' Orphan products assigned to "Orphan Products" category.' : ''}`
        : hasErrors 
          ? `Import completed with errors. ${errorCount} products failed to import.`
          : `Import completed with mixed results. ${importedCount} products imported, ${errorCount} failed.`
    });

  } catch (error) {
    console.error('Import execution error:', error);
    res.status(500).json({ 
      message: 'Failed to execute import', 
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false 
    });
  }
});

// Get import template
router.get('/import/template', authenticateClerkToken, async (req, res) => {
  try {
    // Get sample categories for the template
    const categories = await prisma.category.findMany({
      select: { id: true, name: true },
      take: 5
    });

    const template = {
      description: "Product import template. Copy this structure and fill in your data.",
      required_fields: ["name", "description", "price", "categoryId"],
      optional_fields: [
        "shortDescription", "comparePrice", "costPrice", "sku", "barcode",
        "weight", "dimensions", "tags", "metaTitle", "metaDescription",
        "isActive", "isFeatured", "isOnSale", "salePrice", "saleEndDate",
        "lowStockThreshold", "allowBackorder", "variants", "images"
      ],
      sample_data: {
        name: "Sample Product",
        description: "This is a sample product description",
        shortDescription: "Short description for the product",
        price: 29.99,
        comparePrice: 39.99,
        costPrice: 15.00,
        categoryId: categories[0]?.id || 1,
        sku: "SAMPLE-001",
        barcode: "1234567890123",
        weight: 0.5,
        dimensions: "10x5x2 cm",
        tags: ["sample", "demo", "test"],
        metaTitle: "Sample Product - SEO Title",
        metaDescription: "SEO description for the sample product",
        isActive: true,
        isFeatured: false,
        isOnSale: false,
        salePrice: null,
        saleEndDate: null,
        lowStockThreshold: 5,
        allowBackorder: false,
        variants: [
          {
            size: "M",
            color: "Blue",
            colorCode: "#0000FF",
            stock: 100,
            sku: "SAMPLE-001-M-BLUE",
            price: 29.99,
            comparePrice: 39.99,
            isActive: true,
            lowStockThreshold: 3,
            allowBackorder: false
          }
        ],
        images: [
          {
            url: "https://example.com/image1.jpg",
            alt: "Sample Product Front View",
            isPrimary: true,
            sortOrder: 1
          },
          {
            url: "https://example.com/image2.jpg",
            alt: "Sample Product Back View",
            isPrimary: false,
            sortOrder: 2
          }
        ]
      },
      available_categories: categories,
      notes: [
        "All prices should be numbers (no currency symbols)",
        "Category ID must reference an existing category",
        "SKU must be unique across all products (duplicates will be automatically made unique)",
        "Variants are optional but recommended for products with multiple options",
        "Dates should be in ISO format (YYYY-MM-DD)",
        "Boolean fields accept true/false values",
        "If a SKU already exists, the system will automatically generate a unique one by appending a number"
      ]
    };

    res.json(template);
  } catch (error) {
    console.error('Template generation error:', error);
    res.status(500).json({ 
      message: 'Failed to generate template', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
