import express from 'express';
import { prisma } from '../lib/prisma';
import { authenticateClerkToken } from '../middleware/clerkAuth';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Test endpoint to check upload directory
router.get('/test-upload', async (req, res) => {
  try {
    const uploadPath = path.join(process.cwd(), 'uploads/products');
    const exists = fs.existsSync(uploadPath);
    const files = exists ? fs.readdirSync(uploadPath) : [];
    
    res.json({
      uploadPath,
      exists,
      fileCount: files.length,
      files: files.slice(0, 10) // Show first 10 files
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Test endpoint to check if route is reachable
router.get('/test-route', (req, res) => {
  res.json({ 
    message: 'Image route is reachable',
    productId: req.productId,
    timestamp: new Date().toISOString()
  });
});

// Test POST endpoint to check if route is reachable
router.post('/test-post', (req, res) => {
  res.json({ 
    message: 'Image POST route is reachable',
    productId: req.productId,
    body: req.body,
    timestamp: new Date().toISOString()
  });
});

// Get product images
router.get('/', authenticateClerkToken, async (req, res) => {
  try {
    const productId = req.productId;
    console.log('GET /images - productId from req:', productId);
    
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const images = await prisma.productImage.findMany({
      where: { productId },
      orderBy: { sortOrder: 'asc' }
    });

    res.json(images);
  } catch (error) {
    console.error('Error fetching product images:', error);
    res.status(500).json({ message: 'Failed to fetch product images', error: error });
  }
});

// Configure multer for product image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Use path relative to backend root directory
    const uploadPath = path.join(process.cwd(), 'uploads/products');
    console.log('Upload destination path:', uploadPath);
    
    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
      console.log('Created upload directory:', uploadPath);
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for images only
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check file type
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Upload single product image (like categories)
router.post('/', authenticateClerkToken, upload.single('image'), async (req, res) => {
  try {
    console.log('=== SINGLE IMAGE UPLOAD DEBUG START ===');
    console.log('Request method:', req.method);
    console.log('Request path:', req.path);
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('=== SINGLE IMAGE UPLOAD DEBUG END ===');
    
    const { color, alt, sortOrder = 0 } = req.body;
    const file = req.file;
    const productId = req.productId;
    
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    if (!file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Create single image record
    const image = await prisma.productImage.create({
      data: {
        productId: productId,
        color: color || null,
        url: `/uploads/products/${file.filename}`,
        alt: alt || file.originalname,
        sortOrder: parseInt(sortOrder) || 0,
        isPrimary: false
      }
    });

    // Set as primary if no primary exists
    const existingImages = await prisma.productImage.findMany({
      where: { productId: productId }
    });

    if (existingImages.length === 0) {
      await prisma.productImage.update({
        where: { id: image.id },
        data: { isPrimary: true }
      });
    }

    res.status(201).json({ 
      message: 'Image uploaded successfully', 
      image: image
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
    const productId = req.productId;
    
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

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
    const productId = req.productId;
    
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

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
