import express from 'express';
import { prisma } from '../lib/prisma';
import { authenticateClerkToken } from '../middleware/clerkAuth';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for product image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/products'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

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

    const [products, total] = await Promise.all([
      prisma.product.findMany({
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
            orderBy: { sortOrder: 'asc' }
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
        orderBy,
        skip,
        take: limitNum
      }),
      prisma.product.count({ where })
    ]);

    // Convert decimals and calculate additional metrics
    const convertedProducts = products.map(product => {
      const totalStock = product.variants.reduce((sum, variant) => sum + variant.stock, 0);
      const activeVariants = product.variants.filter(v => v.isActive).length;
      
      return {
        ...convertDecimalToNumber(product),
        totalStock,
        activeVariants,
        hasLowStock: totalStock <= 10,
        hasOutOfStock: totalStock === 0
      };
    });

    res.json({
      products: convertedProducts,
      totalProducts: total,
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
          orderBy: { sortOrder: 'asc' }
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

    // Check if barcode is unique
    if (barcode) {
      const existingBarcode = await prisma.product.findUnique({ where: { barcode } });
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

// Upload product images
router.post('/:id/images', authenticateClerkToken, upload.array('images', 10), async (req, res) => {
  try {
    const { id } = req.params;
    const { color, alt, sortOrder = 0 } = req.body;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No images uploaded' });
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Create image records
    const imageData = files.map((file, index) => ({
      productId: parseInt(id),
      color: color || null,
      url: `/uploads/products/${file.filename}`,
      alt: alt || file.originalname,
      sortOrder: parseInt(sortOrder) + index,
      isPrimary: false
    }));

    // Set first image as primary if no primary exists
    const existingImages = await prisma.productImage.findMany({
      where: { productId: parseInt(id) }
    });

    if (existingImages.length === 0) {
      imageData[0].isPrimary = true;
    }

    const images = await prisma.productImage.createMany({
      data: imageData
    });

    res.status(201).json({ 
      message: 'Images uploaded successfully', 
      count: images.count 
    });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({ message: 'Failed to upload images', error: error });
  }
});

// Delete product image
router.delete('/:id/images/:imageId', authenticateClerkToken, async (req, res) => {
  try {
    const { id, imageId } = req.params;

    const image = await prisma.productImage.findFirst({
      where: { 
        id: parseInt(imageId),
        productId: parseInt(id)
      }
    });

    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // If this was the primary image, set another as primary
    if (image.isPrimary) {
      const nextImage = await prisma.productImage.findFirst({
        where: { 
          productId: parseInt(id),
          id: { not: parseInt(imageId) }
        },
        orderBy: { sortOrder: 'asc' }
      });

      if (nextImage) {
        await prisma.productImage.update({
          where: { id: nextImage.id },
          data: { isPrimary: true }
        });
      }
    }

    await prisma.productImage.delete({
      where: { id: parseInt(imageId) }
    });

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ message: 'Failed to delete image', error: error });
  }
});

// Update image order and primary status
router.patch('/:id/images/:imageId', authenticateClerkToken, async (req, res) => {
  try {
    const { id, imageId } = req.params;
    const { sortOrder, isPrimary, color, alt } = req.body;

    const updateData: any = {};
    if (sortOrder !== undefined) updateData.sortOrder = parseInt(sortOrder);
    if (color !== undefined) updateData.color = color;
    if (alt !== undefined) updateData.alt = alt;

    // Handle primary image change
    if (isPrimary) {
      // Remove primary from all other images
      await prisma.productImage.updateMany({
        where: { 
          productId: parseInt(id),
          id: { not: parseInt(imageId) }
        },
        data: { isPrimary: false }
      });

      updateData.isPrimary = true;
    }

    const image = await prisma.productImage.update({
      where: { id: parseInt(imageId) },
      data: updateData
    });

    res.json(image);
  } catch (error) {
    console.error('Error updating image:', error);
    res.status(500).json({ message: 'Failed to update image', error: error });
  }
});

// Variant management routes
router.post('/:productId/variants', authenticateClerkToken, async (req, res) => {
  try {
    const { productId } = req.params;
    const variantData = req.body;

    // Validate product exists
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Create variant
    const variant = await prisma.productVariant.create({
      data: {
        productId: parseInt(productId),
        size: variantData.size,
        color: variantData.color,
        colorCode: variantData.colorCode,
        stock: variantData.stock || 0,
        sku: variantData.sku,
        price: variantData.price ? parseFloat(variantData.price) : null,
        comparePrice: variantData.comparePrice ? parseFloat(variantData.comparePrice) : null,
        isActive: variantData.isActive !== false
      }
    });

    res.status(201).json(variant);
  } catch (error) {
    console.error('Error creating variant:', error);
    res.status(500).json({ message: 'Failed to create variant', error: error });
  }
});

router.put('/:productId/variants/:variantId', authenticateClerkToken, async (req, res) => {
  try {
    const { productId, variantId } = req.params;
    const variantData = req.body;

    // Validate variant exists and belongs to product
    const existingVariant = await prisma.productVariant.findFirst({
      where: {
        id: parseInt(variantId),
        productId: parseInt(productId)
      }
    });

    if (!existingVariant) {
      return res.status(404).json({ error: 'Variant not found' });
    }

    // Update variant
    const variant = await prisma.productVariant.update({
      where: { id: parseInt(variantId) },
      data: {
        size: variantData.size,
        color: variantData.color,
        colorCode: variantData.colorCode,
        stock: variantData.stock,
        sku: variantData.sku,
        price: variantData.price ? parseFloat(variantData.price) : null,
        comparePrice: variantData.comparePrice ? parseFloat(variantData.comparePrice) : null,
        isActive: variantData.isActive
      }
    });

    res.json(variant);
  } catch (error) {
    console.error('Error updating variant:', error);
    res.status(500).json({ message: 'Failed to update variant', error: error });
  }
});

router.delete('/:productId/variants/:variantId', authenticateClerkToken, async (req, res) => {
  try {
    const { productId, variantId } = req.params;

    // Validate variant exists and belongs to product
    const existingVariant = await prisma.productVariant.findFirst({
      where: {
        id: parseInt(variantId),
        productId: parseInt(productId)
      }
    });

    if (!existingVariant) {
      return res.status(404).json({ error: 'Variant not found' });
    }

    // Delete variant
    await prisma.productVariant.delete({
      where: { id: parseInt(variantId) }
    });

    res.json({ message: 'Variant deleted successfully' });
  } catch (error) {
    console.error('Error deleting variant:', error);
    res.status(500).json({ message: 'Failed to delete variant', error: error });
  }
});

router.get('/:productId/variants', authenticateClerkToken, async (req, res) => {
  try {
    const { productId } = req.params;

    const variants = await prisma.productVariant.findMany({
      where: { productId: parseInt(productId) },
      orderBy: [
        { color: 'asc' },
        { size: 'asc' }
      ]
    });

    res.json(variants);
  } catch (error) {
    console.error('Error fetching variants:', error);
    res.status(500).json({ message: 'Failed to fetch variants', error: error });
  }
});

// Get product statistics
router.get('/:id/stats', authenticateClerkToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [product, variants, images, reviews, orderItems, wishlistItems] = await Promise.all([
      prisma.product.findUnique({
        where: { id: parseInt(id) },
        select: { 
          name: true, 
          price: true, 
          isActive: true,
          isFeatured: true,
          isOnSale: true
        }
      }),
      prisma.productVariant.findMany({
        where: { productId: parseInt(id) },
        select: { stock: true, isActive: true }
      }),
      prisma.productImage.count({
        where: { productId: parseInt(id) }
      }),
      prisma.review.count({
        where: { 
          productId: parseInt(id),
          status: 'APPROVED',
          isActive: true
        }
      }),
      prisma.orderItem.count({
        where: { productId: parseInt(id) }
      }),
      prisma.wishlistItem.count({
        where: { productId: parseInt(id) }
      })
    ]);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
    const activeVariants = variants.filter(v => v.isActive).length;
    const lowStockVariants = variants.filter(v => v.stock <= 10 && v.stock > 0).length;
    const outOfStockVariants = variants.filter(v => v.stock === 0).length;

    const stats = {
      product: convertDecimalToNumber(product),
      inventory: {
        totalStock,
        activeVariants,
        lowStockVariants,
        outOfStockVariants,
        totalVariants: variants.length
      },
      engagement: {
        totalImages: images,
        totalReviews: reviews,
        totalOrders: orderItems,
        totalWishlists: wishlistItems
      }
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching product stats:', error);
    res.status(500).json({ message: 'Failed to fetch product stats', error: error });
  }
});

export default router;
