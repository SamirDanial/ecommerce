import express from 'express';
import { trackingService } from '../services/trackingService';
import { authenticateClerkToken } from '../middleware/clerkAuth';
import { PrismaClient } from '@prisma/client';
import { uploadCategoryImage, getImageUrl, deleteImageFile, extractFilenameFromUrl } from '../utils/fileUpload';

const router = express.Router();

// Check if user has admin role
router.get('/check-role', authenticateClerkToken, async (req, res) => {
  try {
    
    if (!req.user || !req.user.email) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const prisma = new PrismaClient();
    
    try {
      // Find user in database by email
      const user = await prisma.user.findUnique({
        where: {
          email: req.user.email
        },
        select: {
          id: true,
          email: true,
          role: true,
          name: true
        }
      });

      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found in database' 
        });
      }

      // Check if user has admin role
      const isAdmin = user.role === 'ADMIN';

      res.json({
        success: true,
        isAdmin: isAdmin,
        role: user.role,
        userId: user.id,
        email: user.email
      });
    } finally {
      await prisma.$disconnect();
    }

  } catch (error) {
    console.error('Error checking admin role:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to check admin role' 
    });
  }
});

// Get all orders with tracking info (for admin dashboard)
router.get('/orders', authenticateClerkToken, async (req, res) => {
  try {
    // For now, allow any authenticated user to view orders
    // In production, you'd want proper admin middleware here
    
    const prisma = new PrismaClient();
    
    try {
      const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

      res.json({
        success: true,
        orders: orders.map((order: any) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          currentStatus: order.currentStatus,
          status: order.status,
          customerName: order.user?.name || 'Unknown',
          customerEmail: order.user?.email || 'Unknown',
          total: order.total,
          createdAt: order.createdAt,
          lastStatusUpdate: order.lastStatusUpdate,
          itemsCount: order.items.length,
          items: order.items.map((item: any) => ({
            name: item.product?.name || item.productName,
            quantity: item.quantity,
            price: item.price
          }))
        }))
      });
    } finally {
      await prisma.$disconnect();
    }
  } catch (error) {
    console.error('Error getting orders:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get orders' 
    });
  }
});

// Update order status (admin function)
router.put('/orders/:orderId/status', authenticateClerkToken, async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);
    const { newStatus, notes } = req.body;

    if (!newStatus) {
      return res.status(400).json({ 
        success: false, 
        message: 'New status is required' 
      });
    }

    // For now, allow any authenticated user to update status
    // In production, you'd want admin middleware here
    const updatedOrder = await trackingService.updateOrderStatus({
      orderId,
      newStatus,
      notes,
      updatedBy: req.user!.email || 'admin'
    });

    res.json({
      success: true,
      message: 'Order status updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update order status' 
    });
  }
});

// Get order tracking info (admin view)
router.get('/orders/:orderId/tracking', authenticateClerkToken, async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);
    
    const trackingData = await trackingService.getOrderTracking(orderId);
    
    res.json({
      success: true,
      tracking: trackingData
    });
  } catch (error) {
    console.error('Error getting order tracking:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get tracking information' 
    });
  }
});

// ===== CATEGORY MANAGEMENT ENDPOINTS =====

// Get all categories (admin view)
router.get('/categories', authenticateClerkToken, async (req, res) => {
  try {
    const prisma = new PrismaClient();
    
    try {
      const categories = await prisma.category.findMany({
        include: {
          _count: {
            select: {
              products: true
            }
          }
        },
        orderBy: [
          { sortOrder: 'asc' },
          { name: 'asc' }
        ]
      });

      res.json({
        success: true,
        categories: categories.map(category => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          image: category.image,
          isActive: category.isActive,
          sortOrder: category.sortOrder,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt,
          productCount: category._count.products
        }))
      });
    } finally {
      await prisma.$disconnect();
    }
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get categories' 
    });
  }
});

// Create new category
router.post('/categories', authenticateClerkToken, async (req, res) => {
  try {
    const { name, slug, description, image, isActive, sortOrder } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name and slug are required' 
      });
    }

    const prisma = new PrismaClient();
    
    try {
      // Check if slug already exists
      const existingCategory = await prisma.category.findUnique({
        where: { slug }
      });

      if (existingCategory) {
        return res.status(400).json({ 
          success: false, 
          message: 'Category with this slug already exists' 
        });
      }

      const category = await prisma.category.create({
        data: {
          name,
          slug,
          description: description || null,
          image: image || null,
          isActive: isActive !== undefined ? isActive : true,
          sortOrder: sortOrder || 0
        }
      });

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        category
      });
    } finally {
      await prisma.$disconnect();
    }
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create category' 
    });
  }
});

// Update category
router.put('/categories/:id', authenticateClerkToken, async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id);
    const { name, slug, description, image, isActive, sortOrder } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name and slug are required' 
      });
    }

    const prisma = new PrismaClient();
    
    try {
      // Check if slug already exists for other categories
      const existingCategory = await prisma.category.findFirst({
        where: {
          slug,
          id: { not: categoryId }
        }
      });

      if (existingCategory) {
        return res.status(400).json({ 
          success: false, 
          message: 'Category with this slug already exists' 
        });
      }

      const updatedCategory = await prisma.category.update({
        where: { id: categoryId },
        data: {
          name,
          slug,
          description: description || null,
          image: image || null,
          isActive: isActive !== undefined ? isActive : true,
          sortOrder: sortOrder !== undefined ? sortOrder : 0
        }
      });

      res.json({
        success: true,
        message: 'Category updated successfully',
        category: updatedCategory
      });
    } finally {
      await prisma.$disconnect();
    }
  } catch (error) {
    console.error('Error updating category:', error);
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return res.status(404).json({ 
        success: false, 
        message: 'Category not found' 
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update category' 
    });
  }
});

// Delete category
router.delete('/categories/:id', authenticateClerkToken, async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id);

    const prisma = new PrismaClient();
    
    try {
      // Check if category has products
      const categoryWithProducts = await prisma.category.findUnique({
        where: { id: categoryId },
        include: {
          _count: {
            select: {
              products: true
            }
          }
        }
      });

      if (!categoryWithProducts) {
        return res.status(404).json({ 
          success: false, 
          message: 'Category not found' 
        });
      }

      if (categoryWithProducts._count.products > 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Cannot delete category with existing products. Please reassign or delete products first.' 
        });
      }

      await prisma.category.delete({
        where: { id: categoryId }
      });

      res.json({
        success: true,
        message: 'Category deleted successfully'
      });
    } finally {
      await prisma.$disconnect();
    }
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete category' 
    });
  }
});

// Toggle category active status
router.patch('/categories/:id/toggle-status', authenticateClerkToken, async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id);

    const prisma = new PrismaClient();
    
    try {
      const category = await prisma.category.findUnique({
        where: { id: categoryId }
      });

      if (!category) {
        return res.status(404).json({ 
          success: false, 
          message: 'Category not found' 
        });
      }

      const updatedCategory = await prisma.category.update({
        where: { id: categoryId },
        data: {
          isActive: !category.isActive
        }
      });

      res.json({
        success: true,
        message: `Category ${updatedCategory.isActive ? 'activated' : 'deactivated'} successfully`,
        category: updatedCategory
      });
    } finally {
      await prisma.$disconnect();
    }
  } catch (error) {
    console.error('Error toggling category status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to toggle category status' 
    });
  }
});

// Upload category image
router.post('/categories/:id/upload-image', authenticateClerkToken, uploadCategoryImage, async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id);
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const prisma = new PrismaClient();
    
    try {
      // Check if category exists
      const category = await prisma.category.findUnique({
        where: { id: categoryId }
      });

      if (!category) {
        // Delete uploaded file if category doesn't exist
        deleteImageFile(req.file.filename);
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      // Delete old image if it exists
      if (category.image) {
        const oldFilename = extractFilenameFromUrl(category.image);
        if (oldFilename) {
          deleteImageFile(oldFilename);
        }
      }

      // Update category with new image
      const imageUrl = getImageUrl(req.file.filename);
      const updatedCategory = await prisma.category.update({
        where: { id: categoryId },
        data: {
          image: imageUrl
        }
      });

      res.json({
        success: true,
        message: 'Category image uploaded successfully',
        category: updatedCategory,
        imageUrl: imageUrl
      });
    } finally {
      await prisma.$disconnect();
    }
  } catch (error) {
    console.error('Error uploading category image:', error);
    
    // Delete uploaded file on error
    if (req.file) {
      deleteImageFile(req.file.filename);
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to upload category image'
    });
  }
});

// Delete category image
router.delete('/categories/:id/image', authenticateClerkToken, async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id);

    const prisma = new PrismaClient();
    
    try {
      const category = await prisma.category.findUnique({
        where: { id: categoryId }
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      if (!category.image) {
        return res.status(400).json({
          success: false,
          message: 'Category has no image to delete'
        });
      }

      // Delete image file
      const filename = extractFilenameFromUrl(category.image);
      if (filename) {
        deleteImageFile(filename);
      }

      // Update category to remove image
      const updatedCategory = await prisma.category.update({
        where: { id: categoryId },
        data: {
          image: null
        }
      });

      res.json({
        success: true,
        message: 'Category image deleted successfully',
        category: updatedCategory
      });
    } finally {
      await prisma.$disconnect();
    }
  } catch (error) {
    console.error('Error deleting category image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category image'
    });
  }
});

export default router;
