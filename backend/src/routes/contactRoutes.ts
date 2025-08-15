import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateClerkToken } from '../middleware/clerkAuth';
import { z } from 'zod';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schema for contact form
const contactFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject too long'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000, 'Message too long')
});

// Submit contact form (public endpoint)
router.post('/submit', async (req, res) => {
  try {
    // Validate input
    const validationResult = contactFormSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.issues
      });
    }

    const { name, email, subject, message } = validationResult.data;

    // Create contact message
    const contactMessage = await prisma.contactMessage.create({
      data: {
        name,
        email,
        subject,
        message,
        status: 'pending'
      }
    });

    // TODO: Send email notification to admin (implement later)
    // TODO: Send confirmation email to user (implement later)

    res.status(201).json({
      success: true,
      message: 'Contact message submitted successfully',
      data: {
        id: contactMessage.id,
        submittedAt: contactMessage.createdAt
      }
    });

  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit contact message. Please try again later.'
    });
  }
});

// Get all contact messages (admin only)
router.get('/messages', authenticateClerkToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 20;
    const offset = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};
    if (status && status !== 'all') {
      where.status = status;
    }

    // Get messages with pagination
    const [messages, total] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limitNum,
        select: {
          id: true,
          name: true,
          email: true,
          subject: true,
          message: true,
          status: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      prisma.contactMessage.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching contact messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact messages'
    });
  }
});

// Get single contact message (admin only)
router.get('/messages/:id', authenticateClerkToken, async (req, res) => {
  try {
    const { id } = req.params;
    const messageId = parseInt(id);

    if (isNaN(messageId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid message ID'
      });
    }

    const message = await prisma.contactMessage.findUnique({
      where: { id: messageId }
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    res.json({
      success: true,
      data: message
    });

  } catch (error) {
    console.error('Error fetching contact message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact message'
    });
  }
});

// Update message status (admin only)
router.patch('/messages/:id/status', authenticateClerkToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const messageId = parseInt(id);

    if (isNaN(messageId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid message ID'
      });
    }

    // Validate status
    const validStatuses = ['pending', 'read', 'replied', 'archived'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: pending, read, replied, archived'
      });
    }

    const updatedMessage = await prisma.contactMessage.update({
      where: { id: messageId },
      data: { status }
    });

    res.json({
      success: true,
      message: 'Message status updated successfully',
      data: updatedMessage
    });

  } catch (error) {
    console.error('Error updating message status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update message status'
    });
  }
});

// Delete contact message (admin only)
router.delete('/messages/:id', authenticateClerkToken, async (req, res) => {
  try {
    const { id } = req.params;
    const messageId = parseInt(id);

    if (isNaN(messageId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid message ID'
      });
    }

    await prisma.contactMessage.delete({
      where: { id: messageId }
    });

    res.json({
      success: true,
      message: 'Contact message deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting contact message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete contact message'
    });
  }
});

// Get contact statistics (admin only)
router.get('/stats', authenticateClerkToken, async (req, res) => {
  try {
    const [total, pending, read, replied, archived] = await Promise.all([
      prisma.contactMessage.count(),
      prisma.contactMessage.count({ where: { status: 'pending' } }),
      prisma.contactMessage.count({ where: { status: 'read' } }),
      prisma.contactMessage.count({ where: { status: 'replied' } }),
      prisma.contactMessage.count({ where: { status: 'archived' } })
    ]);

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivity = await prisma.contactMessage.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      }
    });

    res.json({
      success: true,
      data: {
        total,
        byStatus: {
          pending,
          read,
          replied,
          archived
        },
        recentActivity
      }
    });

  } catch (error) {
    console.error('Error fetching contact statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact statistics'
    });
  }
});

export default router;
