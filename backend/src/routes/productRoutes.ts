import express from 'express';
import { prisma } from '../lib/prisma';

const router = express.Router();

// Helper function to convert Decimal to number and DateTime to string
const convertDecimalToNumber = (obj: any): any => {
  if (obj && typeof obj === 'object') {
    // Handle arrays
    if (Array.isArray(obj)) {
      return obj.map((item: any) => convertDecimalToNumber(item));
    }
    
    const converted = { ...obj };
    for (const key in converted) {
      if (converted[key] && typeof converted[key] === 'object') {
        if (converted[key].constructor.name === 'Decimal') {
          // Handle Prisma Decimal
          converted[key] = Number(converted[key]);
        } else if ((converted[key] as any).d) {
          // Handle Prisma Decimal object structure
          converted[key] = Number(converted[key]);
        } else if (converted[key] instanceof Date) {
          // Handle DateTime fields
          converted[key] = converted[key].toISOString();
        } else if (converted[key] && typeof converted[key] === 'object') {
          // Recursively convert nested objects
          converted[key] = convertDecimalToNumber(converted[key]);
        }
      }
    }
    return converted;
  }
  return obj;
};

// Get all products
router.get('/', async (req, res) => {
  try {
    const { category, search, sort, limit, page, size, color, minPrice, maxPrice, inStock, rating } = req.query;
    
    let where: any = {};
    
    // Filter by category
    if (category) {
      where.category = {
        slug: category as string
      };
    }
    
    // Search functionality
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { tags: { hasSome: [search as string] } }
      ];
    }

    // Filter by size
    if (size) {
      where.variants = {
        some: {
          size: size as string
        }
      };
    }

    // Filter by color
    if (color) {
      where.variants = {
        some: {
          color: { contains: color as string, mode: 'insensitive' }
        }
      };
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      const priceConditions = [];
      
      if (minPrice && maxPrice) {
        priceConditions.push(
          { price: { gte: parseFloat(minPrice as string), lte: parseFloat(maxPrice as string) } },
          { salePrice: { gte: parseFloat(minPrice as string), lte: parseFloat(maxPrice as string) } }
        );
      } else if (minPrice) {
        priceConditions.push(
          { price: { gte: parseFloat(minPrice as string) } },
          { salePrice: { gte: parseFloat(minPrice as string) } }
        );
      } else if (maxPrice) {
        priceConditions.push(
          { price: { lte: parseFloat(maxPrice as string) } },
          { salePrice: { lte: parseFloat(maxPrice as string) } }
        );
      }
      
      if (priceConditions.length > 0) {
        where.OR = priceConditions;
      }
    }

    // Filter by in-stock
    if (inStock === 'true') {
      where.variants = {
        some: {
          stock: { gt: 0 }
        }
      };
    }

    // Filter by minimum rating
    if (rating) {
      const minRating = parseFloat(rating as string);
      if (!isNaN(minRating)) {
        // We'll filter by rating after fetching products since we need to calculate average ratings
        // This will be handled in the post-processing step
      }
    }
    
    // Pagination
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 12;
    const skip = (pageNum - 1) * limitNum;
    
    // Sorting
    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    if (sort === 'price_desc') orderBy = { price: 'desc' };
    if (sort === 'name_asc') orderBy = { name: 'asc' };
    if (sort === 'name_desc') orderBy = { name: 'desc' };
    if (sort === 'rating_asc') orderBy = { reviews: { _count: 'asc' } };
    if (sort === 'rating_desc') orderBy = { reviews: { _count: 'desc' } };
    
    const products = await (prisma.product as any).findMany({
      where,
      include: {
        category: true,
        variants: true,
        images: {
          orderBy: [
            { isPrimary: 'desc' },
            { sortOrder: 'asc' }
          ]
        },
        reviews: {
          where: {
            status: 'APPROVED',
            isActive: true
          },
          include: {
            user: {
              select: { name: true, avatar: true }
            }
          }
        },
        _count: {
          select: { 
            reviews: {
              where: {
                status: 'APPROVED',
                isActive: true
              }
            }
          }
        }
      },
      orderBy,
      skip,
      take: limitNum
    });
    
    // Calculate average rating and convert decimals
    let convertedProducts = products.map((product: any) => {
      const avgRating = product.reviews && product.reviews.length > 0 
        ? product.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / product.reviews.length 
        : 0;
      
      return {
        ...convertDecimalToNumber(product),
        averageRating: Math.round(avgRating * 10) / 10,
        reviewCount: product._count?.reviews || 0
      };
    });

    // Filter by minimum rating if specified
    if (rating) {
      const minRating = parseFloat(rating as string);
      if (!isNaN(minRating)) {
        convertedProducts = convertedProducts.filter((product: any) => {
          return product.averageRating >= minRating;
        });
      }
    }
    
    res.json(convertedProducts);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
});

// Get featured products
router.get('/featured', async (req, res) => {
  try {
    const products = await (prisma.product as any).findMany({
      where: { 
        isFeatured: true 
      },
      include: {
        category: true,
        variants: true,
        images: {
          orderBy: [
            { isPrimary: 'desc' },
            { sortOrder: 'asc' }
          ]
        },
        reviews: {
          where: {
            status: 'APPROVED',
            isActive: true
          }
        },
        _count: {
          select: { 
            reviews: {
              where: {
                status: 'APPROVED',
                isActive: true
              }
            }
          }
        }
      },
      take: 8
    });
    
    const convertedProducts = products.map((product: any) => {
      const avgRating = product.reviews && product.reviews.length > 0 
        ? product.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / product.reviews.length 
        : 0;
      
      return {
        ...convertDecimalToNumber(product),
        averageRating: Math.round(avgRating * 10) / 10,
        reviewCount: product._count?.reviews || 0
      };
    });
    
    res.json(convertedProducts);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
});

// Get related products (frequently bought together)
router.get('/:id/related', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    
    // Get the current product to find its category and tags
    const currentProduct = await (prisma.product as any).findUnique({
      where: { id: productId },
      select: { categoryId: true, tags: true }
    });
    
    if (!currentProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Find related products based on category and tags
    const relatedProducts = await (prisma.product as any).findMany({
      where: {
        id: { not: productId },
        isActive: true,
        OR: [
          { categoryId: currentProduct.categoryId },
          { tags: { hasSome: currentProduct.tags || [] } }
        ]
      },
      include: {
        category: true,
        variants: true,
        images: true,
        reviews: {
          where: {
            status: 'APPROVED',
            isActive: true
          }
        },
        _count: {
          select: { 
            reviews: {
              where: {
                status: 'APPROVED',
                isActive: true
              }
            }
          }
        }
      },
      take: 3,
      orderBy: { isFeatured: 'desc' }
    });
    
    const convertedProducts = relatedProducts.map((product: any) => {
      const avgRating = product.reviews && product.reviews.length > 0 
        ? product.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / product.reviews.length 
        : 0;
      
      return {
        ...convertDecimalToNumber(product),
        averageRating: Math.round(avgRating * 10) / 10,
        reviewCount: product._count?.reviews || 0
      };
    });
    
    res.json(convertedProducts);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await (prisma.product as any).findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        category: true,
        variants: true,
        images: true,
        reviews: {
          where: {
            status: 'APPROVED',
            isActive: true
          },
          include: {
            user: {
              select: { name: true, avatar: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { 
            reviews: {
              where: {
                status: 'APPROVED',
                isActive: true
              }
            }
          }
        }
      }
    });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Calculate average rating
    const avgRating = product.reviews && product.reviews.length > 0 
      ? product.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / product.reviews.length 
      : 0;
    
    const convertedProduct = {
      ...convertDecimalToNumber(product),
      averageRating: Math.round(avgRating * 10) / 10,
      reviewCount: product._count?.reviews || 0
    };
    
    res.json(convertedProduct);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
});

// Get product by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const product = await (prisma.product as any).findUnique({
      where: { slug: req.params.slug },
      include: {
        category: true,
        variants: true,
        images: true,
        reviews: {
          where: {
            status: 'APPROVED',
            isActive: true
          },
          include: {
            user: {
              select: { name: true, avatar: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { 
            reviews: {
              where: {
                status: 'APPROVED',
                isActive: true
              }
            }
          }
        }
      }
    });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Calculate average rating
    const avgRating = product.reviews && product.reviews.length > 0 
      ? product.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / product.reviews.length 
      : 0;
    
    const convertedProduct = {
      ...convertDecimalToNumber(product),
      averageRating: Math.round(avgRating * 10) / 10,
      reviewCount: product._count?.reviews || 0
    };
    
    res.json(convertedProduct);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
});

// Get product images by color (lazy loading)
router.get('/:productId/images/:color', async (req, res) => {
  try {
    const { productId, color } = req.params;
    
    console.log(`Fetching images for product ${productId}, color: ${color}`);
    
    // First try to get images with the exact color field match
    let colorImages = await (prisma.productImage as any).findMany({
      where: { 
        productId: parseInt(productId),
        color: color
      },
      orderBy: { sortOrder: 'asc' }
    });
    
    // If no exact matches, fall back to filename-based filtering
    if (colorImages.length === 0) {
      const allImages = await (prisma.productImage as any).findMany({
        where: { productId: parseInt(productId) },
        orderBy: { sortOrder: 'asc' }
      });
      
      console.log(`No exact color matches, filtering ${allImages.length} images by filename`);
      
      // Filter images by color using naming convention as fallback
      colorImages = allImages.filter((image: any) => {
        const fileName = image.url.toLowerCase();
        const colorLower = color.toLowerCase();
        
        // Check if filename contains the color
        const hasColor = fileName.includes(colorLower) || 
                        fileName.includes(`-${colorLower}-`) ||
                        fileName.includes(`_${colorLower}_`);
        
        console.log(`Image ${image.url}: color ${colorLower} found = ${hasColor}`);
        return hasColor;
      });
    } else {
      console.log(`Found ${colorImages.length} exact color matches for ${color}`);
    }
    
    // If still no color-specific images found, return default images
    const imagesToReturn = colorImages.length > 0 ? colorImages : await (prisma.productImage as any).findMany({
      where: { productId: parseInt(productId) },
      orderBy: { sortOrder: 'asc' }
    });
    
    res.json({
      images: convertDecimalToNumber(imagesToReturn),
      isColorSpecific: colorImages.length > 0,
      totalImages: imagesToReturn.length,
      colorImagesFound: colorImages.length
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching color-specific images:', error);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
});

// Create product
router.post('/', async (req, res) => {
  try {
    const { variants, images, ...productData } = req.body;
    
    const product = await (prisma.product as any).create({
      data: {
        ...productData,
        variants: variants ? {
          create: variants
        } : undefined,
        images: images ? {
          create: images
        } : undefined
      },
      include: {
        category: true,
        variants: true,
        images: true
      }
    });
    
    const convertedProduct = convertDecimalToNumber(product);
    res.status(201).json(convertedProduct);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
});

// Update product
router.put('/:id', async (req, res) => {
  try {
    const { variants, images, ...productData } = req.body;
    
    const product = await (prisma.product as any).update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...productData,
        variants: variants ? {
          deleteMany: {},
          create: variants
        } : undefined,
        images: images ? {
          deleteMany: {},
          create: images
        } : undefined
      },
      include: {
        category: true,
        variants: true,
        images: true
      }
    });
    
    const convertedProduct = convertDecimalToNumber(product);
    res.json(convertedProduct);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return res.status(404).json({ message: 'Product not found' });
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    await prisma.product.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return res.status(404).json({ message: 'Product not found' });
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
});

// Get active flash sales
router.get('/flash-sales/active', async (req, res) => {
  try {
    const now = new Date();
    const flashSales = await (prisma as any).flashSale.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now }
      },
      orderBy: { endDate: 'asc' }
    });

    const convertedFlashSales = flashSales.map((flashSale: any) => ({
      ...convertDecimalToNumber(flashSale),
      timeLeft: {
        days: Math.floor((new Date(flashSale.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
        hours: Math.floor(((new Date(flashSale.endDate).getTime() - now.getTime()) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor(((new Date(flashSale.endDate).getTime() - now.getTime()) % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor(((new Date(flashSale.endDate).getTime() - now.getTime()) % (1000 * 60)) / 1000)
      }
    }));

    res.json(convertedFlashSales);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
});

export default router;
