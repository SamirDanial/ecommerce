import express from 'express';
import { prisma } from '../lib/prisma';
import { authenticateClerkToken } from '../middleware/clerkAuth';
import { notificationService } from '../services/notificationService';

const router = express.Router();

// Get all reviews with search and filter support
router.get('/', authenticateClerkToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search, productId, userId } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (productId) {
      where.productId = parseInt(productId as string);
    }
    
    if (userId) {
      where.userId = parseInt(userId as string);
    }

    // Add search functionality
    if (search) {
      where.OR = [
        { comment: { contains: search as string, mode: 'insensitive' } },
        { title: { contains: search as string, mode: 'insensitive' } },
        { user: { name: { contains: search as string, mode: 'insensitive' } } },
        { user: { email: { contains: search as string, mode: 'insensitive' } } },
        { product: { name: { contains: search as string, mode: 'insensitive' } } }
      ];
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true
            }
          },
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: {
                where: { isPrimary: true },
                select: { url: true, alt: true }
              }
            }
          },
          _count: {
            select: {
              interactions: true,
              replies: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string)
      }),
      prisma.review.count({ where })
    ]);

    res.json({
      success: true,
      reviews,
      total,
      page: parseInt(page as string),
      totalPages: Math.ceil(total / parseInt(limit as string))
    });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews'
    });
  }
});

// Get all pending reviews
router.get('/pending', authenticateClerkToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, productId, userId } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {};
    
    if (status) {
      where.status = status;
    } else {
      where.status = 'PENDING';
    }
    
    if (productId) {
      where.productId = parseInt(productId as string);
    }
    
    if (userId) {
      where.userId = parseInt(userId as string);
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true
            }
          },
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: {
                where: { isPrimary: true },
                select: { url: true, alt: true }
              }
            }
          },
          _count: {
            select: {
              interactions: true,
              replies: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string)
      }),
      prisma.review.count({ where })
    ]);

    res.json({
      success: true,
      reviews,
      total,
      page: parseInt(page as string),
      totalPages: Math.ceil(total / parseInt(limit as string))
    });

  } catch (error) {
    console.error('Error fetching pending reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending reviews'
    });
  }
});

// Get all questions with search and filter support
router.get('/questions', authenticateClerkToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search, productId, userId } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (productId) {
      where.productId = parseInt(productId as string);
    }
    
    if (userId) {
      where.userId = parseInt(userId as string);
    }

    // Add search functionality
    if (search) {
      where.OR = [
        { question: { contains: search as string, mode: 'insensitive' } },
        { answer: { contains: search as string, mode: 'insensitive' } },
        { user: { name: { contains: search as string, mode: 'insensitive' } } },
        { user: { email: { contains: search as string, mode: 'insensitive' } } },
        { product: { name: { contains: search as string, mode: 'insensitive' } } }
      ];
    }

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true
            }
          },
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: {
                where: { isPrimary: true },
                select: { url: true, alt: true }
              }
            }
          },
          _count: {
            select: {
              replies: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string)
      }),
      prisma.question.count({ where })
    ]);

    res.json({
      success: true,
      questions,
      total,
      page: parseInt(page as string),
      totalPages: Math.ceil(total / parseInt(limit as string))
    });

  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch questions'
    });
  }
});

// Get all pending questions
router.get('/questions/pending', authenticateClerkToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, productId, userId } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {};
    
    if (status) {
      where.status = status;
    } else {
      where.status = 'PENDING';
    }
    
    if (productId) {
      where.productId = parseInt(productId as string);
    }
    
    if (userId) {
      where.userId = parseInt(userId as string);
    }

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true
            }
          },
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: {
                where: { isPrimary: true },
                select: { url: true, alt: true }
              }
            }
          },
          _count: {
            select: {
              replies: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string)
      }),
      prisma.question.count({ where })
    ]);

    res.json({
      success: true,
      questions,
      total,
      page: parseInt(page as string),
      totalPages: Math.ceil(total / parseInt(limit as string))
    });

  } catch (error) {
    console.error('Error fetching pending questions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending questions'
    });
  }
});

// Approve a review
router.put('/:reviewId/approve', authenticateClerkToken, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const adminUserId = req.user!.id;

    const review = await prisma.review.findUnique({
      where: { id: parseInt(reviewId) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        product: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    const updatedReview = await prisma.review.update({
      where: { id: parseInt(reviewId) },
      data: {
        status: 'APPROVED',
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        product: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Add notification action
    try {
      // Find the notification for this review
      const notification = await prisma.notification.findFirst({
        where: {
          targetType: 'PRODUCT',
          targetId: review.productId,
          type: 'PRODUCT_REVIEW',
          data: {
            path: ['reviewId'],
            equals: parseInt(reviewId)
          }
        }
      });

      if (notification) {
        await notificationService.addNotificationAction(notification.id, {
          actionType: 'approve',
          actionData: { reviewId: parseInt(reviewId), approvedBy: adminUserId },
          performedBy: adminUserId
        });
      }
    } catch (notificationError) {
      console.error('Error adding notification action:', notificationError);
    }

    res.json({
      success: true,
      message: 'Review approved successfully',
      review: updatedReview
    });

  } catch (error) {
    console.error('Error approving review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve review'
    });
  }
});

// Set review status to pending
router.put('/:reviewId/pending', authenticateClerkToken, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const adminUserId = req.user!.id;

    const review = await prisma.review.findUnique({
      where: { id: parseInt(reviewId) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        product: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    const updatedReview = await prisma.review.update({
      where: { id: parseInt(reviewId) },
      data: {
        status: 'PENDING',
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        product: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Add notification action
    try {
      // Find the notification for this review
      const notification = await prisma.notification.findFirst({
        where: {
          targetType: 'PRODUCT',
          targetId: review.productId,
          type: 'PRODUCT_REVIEW',
          data: {
            path: ['reviewId'],
            equals: parseInt(reviewId)
          }
        }
      });

      if (notification) {
        await notificationService.addNotificationAction(notification.id, {
          actionType: 'set_pending',
          actionData: { reviewId: parseInt(reviewId), setPendingBy: adminUserId },
          performedBy: adminUserId
        });
      }
    } catch (notificationError) {
      console.error('Error adding notification action:', notificationError);
    }

    res.json({
      success: true,
      message: 'Review status updated to pending successfully',
      review: updatedReview
    });

  } catch (error) {
    console.error('Error setting review to pending:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set review to pending'
    });
  }
});

// Reject a review
router.put('/:reviewId/reject', authenticateClerkToken, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reason } = req.body;
    const adminUserId = req.user!.id;

    const review = await prisma.review.findUnique({
      where: { id: parseInt(reviewId) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        product: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    const updatedReview = await prisma.review.update({
      where: { id: parseInt(reviewId) },
      data: {
        status: 'REJECTED',
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        product: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Add notification action
    try {
      // Find the notification for this review
      const notification = await prisma.notification.findFirst({
        where: {
          targetType: 'PRODUCT',
          targetId: review.productId,
          type: 'PRODUCT_REVIEW',
          data: {
            path: ['reviewId'],
            equals: parseInt(reviewId)
          }
        }
      });

      if (notification) {
        await notificationService.addNotificationAction(notification.id, {
          actionType: 'reject',
          actionData: { reviewId: parseInt(reviewId), rejectedBy: adminUserId, reason },
          performedBy: adminUserId
        });
      }
    } catch (notificationError) {
      console.error('Error adding notification action:', notificationError);
    }

    res.json({
      success: true,
      message: 'Review rejected successfully',
      review: updatedReview
    });

  } catch (error) {
    console.error('Error rejecting review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject review'
    });
  }
});

// Approve a question
router.put('/questions/:questionId/approve', authenticateClerkToken, async (req, res) => {
  try {
    const { questionId } = req.params;
    const adminUserId = req.user!.id;

    const question = await prisma.question.findUnique({
      where: { id: parseInt(questionId) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        product: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    const updatedQuestion = await prisma.question.update({
      where: { id: parseInt(questionId) },
      data: {
        status: 'APPROVED',
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        product: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Add notification action
    try {
      // Find the notification for this question
      const notification = await prisma.notification.findFirst({
        where: {
          targetType: 'PRODUCT',
          targetId: question.productId,
          type: 'PRODUCT_QUESTION',
          data: {
            path: ['questionId'],
            equals: parseInt(questionId)
          }
        }
      });

      if (notification) {
        await notificationService.addNotificationAction(notification.id, {
          actionType: 'approve',
          actionData: { questionId: parseInt(questionId), approvedBy: adminUserId },
          performedBy: adminUserId
        });
      }
    } catch (notificationError) {
      console.error('Error adding notification action:', notificationError);
    }

    res.json({
      success: true,
      message: 'Question approved successfully',
      question: updatedQuestion
    });

  } catch (error) {
    console.error('Error approving question:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve question'
    });
  }
});

// Set question status to pending
router.put('/questions/:questionId/pending', authenticateClerkToken, async (req, res) => {
  try {
    const { questionId } = req.params;
    const adminUserId = req.user!.id;

    const question = await prisma.question.findUnique({
      where: { id: parseInt(questionId) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        product: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    const updatedQuestion = await prisma.question.update({
      where: { id: parseInt(questionId) },
      data: {
        status: 'PENDING',
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        product: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Add notification action
    try {
      // Find the notification for this question
      const notification = await prisma.notification.findFirst({
        where: {
          targetType: 'PRODUCT',
          targetId: question.productId,
          type: 'PRODUCT_QUESTION',
          data: {
            path: ['questionId'],
            equals: parseInt(questionId)
          }
        }
      });

      if (notification) {
        await notificationService.addNotificationAction(notification.id, {
          actionType: 'set_pending',
          actionData: { questionId: parseInt(questionId), setPendingBy: adminUserId },
          performedBy: adminUserId
        });
      }
    } catch (notificationError) {
      console.error('Error adding notification action:', notificationError);
    }

    res.json({
      success: true,
      message: 'Question status updated to pending successfully',
      question: updatedQuestion
    });

  } catch (error) {
    console.error('Error setting question to pending:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set question to pending'
    });
  }
});

// Reject a question
router.put('/questions/:questionId/reject', authenticateClerkToken, async (req, res) => {
  try {
    const { questionId } = req.params;
    const { reason } = req.body;
    const adminUserId = req.user!.id;

    const question = await prisma.question.findUnique({
      where: { id: parseInt(questionId) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        product: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    const updatedQuestion = await prisma.question.update({
      where: { id: parseInt(questionId) },
      data: {
        status: 'REJECTED',
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        product: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Add notification action
    try {
      // Find the notification for this question
      const notification = await prisma.notification.findFirst({
        where: {
          targetType: 'PRODUCT',
          targetId: question.productId,
          type: 'PRODUCT_QUESTION',
          data: {
            path: ['questionId'],
            equals: parseInt(questionId)
          }
        }
      });

      if (notification) {
        await notificationService.addNotificationAction(notification.id, {
          actionType: 'reject',
          actionData: { questionId: parseInt(questionId), rejectedBy: adminUserId, reason },
          performedBy: adminUserId
        });
      }
    } catch (notificationError) {
      console.error('Error adding notification action:', notificationError);
    }

    res.json({
      success: true,
      message: 'Question rejected successfully',
      question: updatedQuestion
    });

  } catch (error) {
    console.error('Error rejecting question:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject question'
    });
  }
});

// Answer a question (approve and add answer)
router.put('/questions/:questionId/answer', authenticateClerkToken, async (req, res) => {
  try {
    const { questionId } = req.params;
    const { answer } = req.body;
    const adminUserId = req.user!.id;

    if (!answer || !answer.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Answer is required'
      });
    }

    const question = await prisma.question.findUnique({
      where: { id: parseInt(questionId) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        product: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    const updatedQuestion = await prisma.question.update({
      where: { id: parseInt(questionId) },
      data: {
        status: 'ANSWERED',
        answer: answer.trim(),
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        product: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Add notification action
    try {
      // Find the notification for this question
      const notification = await prisma.notification.findFirst({
        where: {
          targetType: 'PRODUCT',
          targetId: question.productId,
          type: 'PRODUCT_QUESTION',
          data: {
            path: ['questionId'],
            equals: parseInt(questionId)
          }
        }
      });

      if (notification) {
        await notificationService.addNotificationAction(notification.id, {
          actionType: 'answer',
          actionData: { questionId: parseInt(questionId), answeredBy: adminUserId, answer: answer.trim() },
          performedBy: adminUserId
        });
      }
    } catch (notificationError) {
      console.error('Error adding notification action:', notificationError);
    }

    res.json({
      success: true,
      message: 'Question answered successfully',
      question: updatedQuestion
    });

  } catch (error) {
    console.error('Error answering question:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to answer question'
    });
  }
});

// Delete a review (admin only)
router.delete('/:reviewId', authenticateClerkToken, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const adminUserId = req.user!.id;

    const review = await prisma.review.findUnique({
      where: { id: parseInt(reviewId) }
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    await prisma.review.delete({
      where: { id: parseInt(reviewId) }
    });

    // Add notification action
    try {
      // Find the notification for this review
      const notification = await prisma.notification.findFirst({
        where: {
          targetType: 'PRODUCT',
          targetId: review.productId,
          type: 'PRODUCT_REVIEW',
          data: {
            path: ['reviewId'],
            equals: parseInt(reviewId)
          }
        }
      });

      if (notification) {
        await notificationService.addNotificationAction(notification.id, {
          actionType: 'delete',
          actionData: { reviewId: parseInt(reviewId), deletedBy: adminUserId },
          performedBy: adminUserId
        });
      }
    } catch (notificationError) {
      console.error('Error adding notification action:', notificationError);
    }

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review'
    });
  }
});

// Delete a question (admin only)
router.delete('/questions/:questionId', authenticateClerkToken, async (req, res) => {
  try {
    const { questionId } = req.params;
    const adminUserId = req.user!.id;

    const question = await prisma.question.findUnique({
      where: { id: parseInt(questionId) }
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    await prisma.question.delete({
      where: { id: parseInt(questionId) }
    });

    // Add notification action
    try {
      // Find the notification for this question
      const notification = await prisma.notification.findFirst({
        where: {
          targetType: 'PRODUCT',
          targetId: question.productId,
          type: 'PRODUCT_QUESTION',
          data: {
            path: ['questionId'],
            equals: parseInt(questionId)
          }
        }
      });

      if (notification) {
        await notificationService.addNotificationAction(notification.id, {
          actionType: 'delete',
          actionData: { questionId: parseInt(questionId), deletedBy: adminUserId },
          performedBy: adminUserId
        });
      }
    } catch (notificationError) {
      console.error('Error adding notification action:', notificationError);
    }

    res.json({
      success: true,
      message: 'Question deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete question'
    });
  }
});

// Get review statistics
router.get('/stats', authenticateClerkToken, async (req, res) => {
  try {
    const [pendingCount, approvedCount, rejectedCount, totalCount] = await Promise.all([
      prisma.review.count({ where: { status: 'PENDING' } }),
      prisma.review.count({ where: { status: 'APPROVED' } }),
      prisma.review.count({ where: { status: 'REJECTED' } }),
      prisma.review.count()
    ]);

    res.json({
      success: true,
      stats: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        total: totalCount
      }
    });

  } catch (error) {
    console.error('Error fetching review stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch review statistics'
    });
  }
});

// Get question statistics
router.get('/questions/stats', authenticateClerkToken, async (req, res) => {
  try {
    const [pendingCount, approvedCount, rejectedCount, answeredCount, totalCount] = await Promise.all([
      prisma.question.count({ where: { status: 'PENDING' } }),
      prisma.question.count({ where: { status: 'APPROVED' } }),
      prisma.question.count({ where: { status: 'REJECTED' } }),
      prisma.question.count({ where: { status: 'ANSWERED' } }),
      prisma.question.count()
    ]);

    res.json({
      success: true,
      stats: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        answered: answeredCount,
        total: totalCount
      }
    });

  } catch (error) {
    console.error('Error fetching question stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch question statistics'
    });
  }
});

export default router;
