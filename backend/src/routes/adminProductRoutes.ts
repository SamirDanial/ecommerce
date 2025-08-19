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

    // First, get all products to calculate stock status
    const allProducts = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true, slug: true }
        },
        variants: {
          select: { 
            id: true, 
            size: true, 
            color: true, 
            stock: true, 
            price: true,
            isActive: true 
          }
        },
        images: {
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
      orderBy
    });

    // Convert decimals and calculate additional metrics
    let convertedProducts = allProducts.map(product => {
      const totalStock = product.variants.reduce((sum, variant) => sum + variant.stock, 0);
      const activeVariants = product.variants.filter(v => v.isActive).length;
      
      console.log(`🏷️ Product: ${product.name}, Variants: ${product.variants.length}, Total Stock: ${totalStock}`);
      product.variants.forEach(variant => {
        console.log(`  └─ ${variant.size} ${variant.color}: ${variant.stock} stock`);
      });
      
      return {
        ...convertDecimalToNumber(product),
        totalStock,
        activeVariants,
        hasLowStock: totalStock > 0 && totalStock <= 10,
        hasOutOfStock: totalStock === 0
      };
    });

    // Apply stock status filtering BEFORE pagination
    if (stockStatus && stockStatus !== 'all') {
      console.log(`🔍 Stock Status Filter: ${stockStatus}`);
      console.log(`📦 Products before filtering: ${convertedProducts.length}`);
      
      convertedProducts = convertedProducts.filter(product => {
        const matches = (() => {
          switch (stockStatus) {
            case 'in_stock':
              return product.totalStock > 10;
            case 'low_stock':
              return product.totalStock > 0 && product.totalStock <= 10;
            case 'out_of_stock':
              return product.totalStock === 0;
            case 'backorder':
              return product.totalStock === 0;
            default:
              return true;
          }
        })();
        
        console.log(`📊 Product: ${product.name}, Stock: ${product.totalStock}, Matches ${stockStatus}: ${matches}`);
        return matches;
      });
      
      console.log(`✅ Products after filtering: ${convertedProducts.length}`);
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
    const avgRating = product.reviews.length > 0 
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length 
      : 0;

    const convertedProduct = {
      ...convertDecimalToNumber(product),
      averageRating: Math.round(avgRating * 10) / 10,
      totalStock: product.variants.reduce((sum, variant) => sum + variant.stock, 0)
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

    // Generate slug from name
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

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
      updateData.slug = updateData.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
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

export default router;
