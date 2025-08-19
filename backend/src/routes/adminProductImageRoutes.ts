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
    cb(null, path.join(__dirname, '../../../uploads/products'));
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

// Upload product images
router.post('/', authenticateClerkToken, upload.array('images', 10), async (req, res) => {
  try {
    const { color, alt, sortOrder = 0 } = req.body;
    const files = req.files as Express.Multer.File[];
    const productId = parseInt(req.params.id || req.body.productId);

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No images uploaded' });
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Create image records
    const imageData = files.map((file, index) => ({
      productId: productId,
      color: color || null,
      url: `/uploads/products/${file.filename}`,
      alt: alt || file.originalname,
      sortOrder: parseInt(sortOrder) + index,
      isPrimary: false
    }));

    // Set first image as primary if no primary exists
    const existingImages = await prisma.productImage.findMany({
      where: { productId: productId }
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
router.delete('/:imageId', authenticateClerkToken, async (req, res) => {
  try {
    const { imageId } = req.params;
    const productId = parseInt(req.params.id || req.body.productId);

    const image = await prisma.productImage.findFirst({
      where: { 
        id: parseInt(imageId),
        productId: productId
      }
    });

    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // If this was the primary image, set another as primary
    if (image.isPrimary) {
      const nextImage = await prisma.productImage.findFirst({
        where: { 
          productId: productId,
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
router.patch('/:imageId', authenticateClerkToken, async (req, res) => {
  try {
    const { imageId } = req.params;
    const { sortOrder, isPrimary, color, alt } = req.body;
    const productId = parseInt(req.params.id || req.body.productId);

    const updateData: any = {};
    if (sortOrder !== undefined) updateData.sortOrder = parseInt(sortOrder);
    if (color !== undefined) updateData.color = color;
    if (alt !== undefined) updateData.alt = alt;

    // Handle primary image change
    if (isPrimary) {
      // Remove primary from all other images
      await prisma.productImage.updateMany({
        where: { 
          productId: productId,
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

export default router;
