import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateClerkToken } from '../middleware/clerkAuth';
import { notificationService } from '../services/notificationService';

const router = express.Router();
const prisma = new PrismaClient();

// Submit a review
router.post('/reviews', authenticateClerkToken, async (req, res) => {
  try {
    const { productId, rating, title, comment } = req.body;
    const userId = req.user!.id;

    // Validate required fields
    if (!productId || !rating || !title || !comment) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rating must be between 1 and 5' 
      });
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) }
    });

    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }

    // Check if user already reviewed this product
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId,
          productId: parseInt(productId)
        }
      }
    });

    if (existingReview) {
      // Update existing review
      const updatedReview = await prisma.review.update({
        where: { id: existingReview.id },
        data: {
          rating,
          title,
          comment,
          status: 'PENDING', // Reset to pending when updated
          updatedAt: new Date()
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          }
        }
      });

      return res.json({
        success: true,
        message: 'Review updated successfully',
        review: updatedReview
      });
    }

    // Create new review
    const newReview = await prisma.review.create({
      data: {
        userId,
        productId: parseInt(productId),
        rating,
        title,
        comment,
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        product: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    // Send notification to admins about new review
    try {
      const socketServer = (global as any).socketServer;
      if (socketServer) {
        await socketServer.sendAdminNotification({
          type: 'PRODUCT_REVIEW',
          title: 'New Product Review Submitted',
          message: `A new review has been submitted for "${product.name}" by ${newReview.user.name}. Rating: ${rating}/5 stars.`,
          category: 'PRODUCTS',
          priority: 'MEDIUM',
          targetType: 'PRODUCT',
          targetId: parseInt(productId),
          isGlobal: true,
          data: {
            reviewId: newReview.id,
            productId: parseInt(productId),
            productName: product.name,
            userId: userId,
            userName: newReview.user.name,
            rating: rating,
            title: title,
            comment: comment
          }
        });
      }
    } catch (notificationError) {
      console.error('Error sending review notification:', notificationError);
      // Don't fail the review submission if notification fails
    }

    res.json({
      success: true,
      message: 'Review submitted successfully',
      review: newReview
    });

  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit review' 
    });
  }
});

// Submit a question
router.post('/questions', authenticateClerkToken, async (req, res) => {
  try {
    const { productId, question } = req.body;
    const userId = req.user!.id;

    // Validate required fields
    if (!productId || !question) {
      return res.status(400).json({ 
        success: false, 
        message: 'Product ID and question are required' 
      });
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) }
    });

    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }

    // Create new question
    const newQuestion = await prisma.question.create({
      data: {
        userId,
        productId: parseInt(productId),
        question,
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        product: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    // Send notification to admins about new question
    try {
      const socketServer = (global as any).socketServer;
      if (socketServer) {
        await socketServer.sendAdminNotification({
          type: 'PRODUCT_QUESTION',
          title: 'New Product Question Submitted',
          message: `A new question has been submitted for "${product.name}" by ${newQuestion.user.name}.`,
          category: 'PRODUCTS',
          priority: 'MEDIUM',
          targetType: 'PRODUCT',
          targetId: newQuestion.id, // Use question ID instead of product ID to allow multiple notifications
          isGlobal: true,
          data: {
            questionId: newQuestion.id,
            productId: parseInt(productId),
            productName: product.name,
            userId: userId,
            userName: newQuestion.user.name,
            question: question
          }
        });
      }
    } catch (notificationError) {
      console.error('Error sending question notification:', notificationError);
      // Don't fail the question submission if notification fails
    }

    res.json({
      success: true,
      message: 'Question submitted successfully',
      question: newQuestion
    });

  } catch (error) {
    console.error('Error submitting question:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit question' 
    });
  }
});

// Get user's pending reviews and questions
router.get('/user/pending', authenticateClerkToken, async (req, res) => {
  try {
    const userId = req.user!.id;

    const [pendingReviews, pendingQuestions] = await Promise.all([
      prisma.review.findMany({
        where: {
          userId,
          status: 'PENDING'
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.question.findMany({
        where: {
          userId,
          status: 'PENDING'
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    res.json({
      success: true,
      pendingReviews,
      pendingQuestions
    });

  } catch (error) {
    console.error('Error fetching pending items:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch pending items' 
    });
  }
});

// Get product reviews (approved only) - public endpoint
router.get('/product/:productId/reviews', async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, rating, sort } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    const where: any = {
      productId: parseInt(productId),
      status: 'APPROVED',
      isActive: true
    };

    if (rating) {
      where.rating = parseInt(rating as string);
    }

    // Determine sorting order
    let orderBy: any = { createdAt: 'desc' }; // Default: most recent
    if (sort === 'helpful') {
      // Only show reviews that have been marked as helpful
      // Restructure the where clause to ensure proper filtering
      where.interactions = {
        some: {
          type: 'HELPFUL'
        }
      };
      // For helpful sorting, we'll sort by creation date first, then sort by helpful count in memory
      orderBy = { createdAt: 'desc' };
      
      console.log('🔍 Helpful filter - Final where clause:', JSON.stringify(where, null, 2));
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          },
          _count: {
            select: {
              interactions: {
                where: {
                  type: 'HELPFUL'
                }
              },
              replies: true
            }
          }
        },
        orderBy,
        skip,
        take: parseInt(limit as string)
      }),
      prisma.review.count({ where })
    ]);

    // Transform reviews to include helpful count
    const reviewsWithHelpfulCount = reviews.map(review => ({
      ...review,
      helpfulCount: review._count.interactions
    }));

    // Sort by helpful count if helpful filter is active
    if (sort === 'helpful') {
      reviewsWithHelpfulCount.sort((a, b) => b.helpfulCount - a.helpfulCount);
      
      console.log('🔍 Helpful filter - Reviews returned:', reviewsWithHelpfulCount.length);
      console.log('🔍 Helpful filter - Reviews with helpful interactions:', reviewsWithHelpfulCount.filter(r => r.helpfulCount > 0).length);
      console.log('🔍 Helpful filter - All reviews helpful counts:', reviewsWithHelpfulCount.map(r => ({ id: r.id, helpfulCount: r.helpfulCount })));
    }

    res.json({
      success: true,
      reviews: reviewsWithHelpfulCount,
      total,
      page: parseInt(page as string),
      totalPages: Math.ceil(total / parseInt(limit as string))
    });

  } catch (error) {
    console.error('Error fetching product reviews:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch reviews' 
    });
  }
});

// Get product reviews with user's pending reviews (authenticated endpoint)
router.get('/product/:productId/reviews/with-pending', authenticateClerkToken, async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, rating, sort } = req.query;
    const userId = req.user!.id;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    // Get ALL reviews for this product that are either:
    // 1. Approved and active, OR
    // 2. Pending and belong to the current user
    const whereClause: any = {
      productId: parseInt(productId),
      OR: [
        {
          status: 'APPROVED' as const,
          isActive: true
        },
        {
          status: 'PENDING' as const,
          userId: userId
        }
      ]
    };

    if (rating) {
      whereClause.rating = parseInt(rating as string);
    }

    // Determine sorting order
    let orderBy: any = { createdAt: 'desc' }; // Default: most recent
    if (sort === 'helpful') {
      // Only show reviews that have been marked as helpful
      whereClause.interactions = {
        some: {
          type: 'HELPFUL'
        }
      };
      // For helpful sorting, we'll sort by creation date first, then sort by helpful count in memory
      orderBy = { createdAt: 'desc' };
    }

    // Get all matching reviews
    const [allReviews, total] = await Promise.all([
      prisma.review.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          },
          _count: {
            select: {
              interactions: {
                where: {
                  type: 'HELPFUL'
                }
              },
              replies: true
            }
          }
        },
        orderBy,
        skip,
        take: parseInt(limit as string)
      }),
      prisma.review.count({ where: whereClause })
    ]);

    // Count approved reviews for pagination (since we want pagination based on approved only)
    const approvedCount = await prisma.review.count({
      where: {
        productId: parseInt(productId),
        status: 'APPROVED' as const,
        isActive: true
      }
    });

    // If helpful filter is active, count only helpful reviews for pagination
    let totalForPagination = approvedCount;
    if (sort === 'helpful') {
      totalForPagination = await prisma.review.count({
        where: {
          productId: parseInt(productId),
          status: 'APPROVED' as const,
          isActive: true,
          interactions: {
            some: {
              type: 'HELPFUL'
            }
          }
        }
      });
    }

    // Transform reviews to include helpful count
    const reviewsWithHelpfulCount = allReviews.map(review => ({
      ...review,
      helpfulCount: review._count.interactions
    }));

    // Sort by helpful count if helpful filter is active
    if (sort === 'helpful') {
      reviewsWithHelpfulCount.sort((a, b) => b.helpfulCount - a.helpfulCount);
    }

    res.json({
      success: true,
      reviews: reviewsWithHelpfulCount,
      total: totalForPagination, // Use helpful count when helpful filter is active
      page: parseInt(page as string),
      totalPages: Math.ceil(totalForPagination / parseInt(limit as string)),
      userPendingCount: allReviews.filter(r => r.status === 'PENDING').length
    });

  } catch (error) {
    console.error('Error fetching product reviews with pending:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch reviews' 
    });
  }
});

// Get product questions (approved only)
router.get('/product/:productId/questions', async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    const where = {
      productId: parseInt(productId),
      status: 'APPROVED' as const,
      isActive: true
    };

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true
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
    console.error('Error fetching product questions:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch questions' 
    });
  }
});

// Get product questions with pending ones for authenticated user
router.get('/product/:productId/questions/with-pending', authenticateClerkToken, async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user!.id;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    // Get approved questions
    const approvedWhere = {
      productId: parseInt(productId),
      status: 'APPROVED' as const,
      isActive: true
    };

    // Get pending questions for current user
    const pendingWhere = {
      productId: parseInt(productId),
      userId,
      status: 'PENDING' as const,
      isActive: true
    };

    const [approvedQuestions, pendingQuestions, approvedTotal] = await Promise.all([
      prisma.question.findMany({
        where: approvedWhere,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true
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
      prisma.question.findMany({
        where: pendingWhere,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          },
          _count: {
            select: {
              replies: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.question.count({ where: approvedWhere })
    ]);

    // Combine questions: pending first, then approved
    const allQuestions = [...pendingQuestions, ...approvedQuestions];
    
    // Calculate total for pagination (approved + user's pending)
    const total = approvedTotal + pendingQuestions.length;

    res.json({
      success: true,
      questions: allQuestions,
      total,
      page: parseInt(page as string),
      totalPages: Math.ceil(total / parseInt(limit as string)),
      pendingCount: pendingQuestions.length
    });

  } catch (error) {
    console.error('Error fetching product questions with pending:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch questions' 
    });
  }
});

// Get user's pending reviews for a specific product
router.get('/product/:productId/pending', authenticateClerkToken, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user!.id;

    const pendingReviews = await prisma.review.findMany({
      where: {
        userId,
        productId: parseInt(productId),
        status: 'PENDING'
      },
      orderBy: { createdAt: 'desc' }
    });

    const pendingQuestions = await prisma.question.findMany({
      where: {
        userId,
        productId: parseInt(productId),
        status: 'PENDING'
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      pendingReviews,
      pendingQuestions
    });

  } catch (error) {
    console.error('Error fetching pending items:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch pending items' 
    });
  }
});

// Update a pending review
router.put('/reviews/:reviewId', authenticateClerkToken, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, title, comment } = req.body;
    const userId = req.user!.id;

    // Check if review exists and belongs to user
    const existingReview = await prisma.review.findFirst({
      where: {
        id: parseInt(reviewId),
        userId
      }
    });

    if (!existingReview) {
      return res.status(404).json({ 
        success: false, 
        message: 'Review not found' 
      });
    }

    // If review is approved, it will be set back to pending after edit
    const shouldResetStatus = existingReview.status === 'APPROVED';

    // Update the review
    const updatedReview = await prisma.review.update({
      where: { id: parseInt(reviewId) },
      data: {
        rating,
        title,
        comment,
        updatedAt: new Date(),
        status: shouldResetStatus ? 'PENDING' : existingReview.status // Reset to pending if was approved
      },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: shouldResetStatus 
        ? 'Review updated successfully and sent for re-approval' 
        : 'Review updated successfully',
      review: updatedReview,
      statusChanged: shouldResetStatus
    });

  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update review' 
    });
  }
});

// Delete a pending review
router.delete('/reviews/:reviewId', authenticateClerkToken, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user!.id;

    // Check if review exists and belongs to user
    const existingReview = await prisma.review.findFirst({
      where: {
        id: parseInt(reviewId),
        userId
      }
    });

    if (!existingReview) {
      return res.status(404).json({ 
        success: false, 
        message: 'Review not found' 
      });
    }

    // Delete the review
    await prisma.review.delete({
      where: { id: parseInt(reviewId) }
    });

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

// Update a pending question
router.put('/questions/:questionId', authenticateClerkToken, async (req, res) => {
  try {
    const { questionId } = req.params;
    const { question } = req.body;
    const userId = req.user!.id;

    // Check if question exists and belongs to user
    const existingQuestion = await prisma.question.findFirst({
      where: {
        id: parseInt(questionId),
        userId,
        status: 'PENDING'
      }
    });

    if (!existingQuestion) {
      return res.status(404).json({ 
        success: false, 
        message: 'Question not found or not editable' 
      });
    }

    // Update the question
    const updatedQuestion = await prisma.question.update({
      where: { id: parseInt(questionId) },
      data: {
        question,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Question updated successfully',
      question: updatedQuestion
    });

  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update question' 
    });
  }
});

// Delete a pending question
router.delete('/questions/:questionId', authenticateClerkToken, async (req, res) => {
  try {
    const { questionId } = req.params;
    const userId = req.user!.id;

    // Check if question exists and belongs to user
    const existingQuestion = await prisma.question.findFirst({
      where: {
        id: parseInt(questionId),
        userId,
        status: 'PENDING'
      }
    });

    if (!existingQuestion) {
      return res.status(404).json({ 
        success: false, 
        message: 'Question not found or not deletable' 
      });
    }

    // Delete the question
    await prisma.question.delete({
      where: { id: parseInt(questionId) }
    });

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

// Create a reply to a review
router.post('/reviews/:reviewId/replies', authenticateClerkToken, async (req, res) => {
  const { reviewId } = req.params;
  const { reply } = req.body;
  const userId = req.user!.id;
  
  try {

    // Check if review exists
    const review = await prisma.review.findFirst({
      where: {
        id: parseInt(reviewId),
        isActive: true
      }
    });

    if (!review) {
      return res.status(404).json({ 
        success: false, 
        message: 'Review not found' 
      });
    }



    // Create the reply
    const newReply = await prisma.reviewReply.create({
      data: {
        reviewId: parseInt(reviewId),
        userId,
        reply,
        isActive: true
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Reply submitted successfully',
      reply: newReply
    });

  } catch (error) {
    console.error('Error creating reply:', error);
    console.error('Error details:', {
      reviewId,
      userId,
      reply,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorCode: (error as any)?.code,
      errorMeta: (error as any)?.meta
    });
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create reply',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update a reply
router.put('/replies/:replyId', authenticateClerkToken, async (req, res) => {
  try {
    const { replyId } = req.params;
    const { reply } = req.body;
    const userId = req.user!.id;

    // Check if reply exists and belongs to user
    const existingReply = await prisma.reviewReply.findFirst({
      where: {
        id: parseInt(replyId),
        userId,
        isActive: true
      }
    });

    if (!existingReply) {
      return res.status(404).json({ 
        success: false, 
        message: 'Reply not found or not editable' 
      });
    }

    // Update the reply
    const updatedReply = await prisma.reviewReply.update({
      where: { id: parseInt(replyId) },
      data: {
        reply,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Reply updated successfully',
      reply: updatedReply
    });

  } catch (error) {
    console.error('Error updating reply:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update reply' 
    });
  }
});

// Delete a reply
router.delete('/replies/:replyId', authenticateClerkToken, async (req, res) => {
  try {
    const { replyId } = req.params;
    const userId = req.user!.id;

    // Check if reply exists and belongs to user
    const existingReply = await prisma.reviewReply.findFirst({
      where: {
        id: parseInt(replyId),
        userId,
        isActive: true
      }
    });

    if (!existingReply) {
      return res.status(404).json({ 
        success: false, 
        message: 'Reply not found or not deletable' 
      });
    }

    // Delete the reply
    await prisma.reviewReply.delete({
      where: { id: parseInt(replyId) }
    });

    res.json({
      success: true,
      message: 'Reply deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting reply:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete reply' 
    });
  }
});

// Get current user info (database ID)
router.get('/user/me', authenticateClerkToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user'
    });
  }
});

// Get replies for a review
router.get('/reviews/:reviewId/replies', async (req, res) => {
  try {
    const { reviewId } = req.params;

    // Simply return all active replies for the review
    const replies = await prisma.reviewReply.findMany({
      where: {
        reviewId: parseInt(reviewId),
        isActive: true
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json({
      success: true,
      replies
    });

  } catch (error) {
    console.error('Error fetching replies:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch replies' 
    });
  }
});

// Mark review as helpful
router.post('/reviews/:reviewId/helpful', authenticateClerkToken, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user!.id;

    // Check if review exists
    const review = await prisma.review.findUnique({
      where: { id: parseInt(reviewId) }
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user already marked this review as helpful
    const existingInteraction = await prisma.reviewInteraction.findUnique({
      where: {
        reviewId_userId_type: {
          reviewId: parseInt(reviewId),
          userId,
          type: 'HELPFUL'
        }
      }
    });

    if (existingInteraction) {
      // Remove helpful mark
      await prisma.reviewInteraction.delete({
        where: { id: existingInteraction.id }
      });

      res.json({
        success: true,
        message: 'Helpful mark removed',
        isHelpful: false
      });
    } else {
      // Add helpful mark
      await prisma.reviewInteraction.create({
        data: {
          reviewId: parseInt(reviewId),
          userId,
          type: 'HELPFUL'
        }
      });

      res.json({
        success: true,
        message: 'Review marked as helpful',
        isHelpful: true
      });
    }

  } catch (error) {
    console.error('Error marking review as helpful:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark review as helpful'
    });
  }
});

// Report a review
router.post('/reviews/:reviewId/report', authenticateClerkToken, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reason } = req.body;
    const userId = req.user!.id;

    // Check if review exists
    const review = await prisma.review.findUnique({
      where: { id: parseInt(reviewId) }
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user already reported this review
    const existingReport = await prisma.reviewInteraction.findUnique({
      where: {
        reviewId_userId_type: {
          reviewId: parseInt(reviewId),
          userId,
          type: 'REPORT'
        }
      }
    });

    if (existingReport) {
      // User already reported this review, so remove the report (toggle off)
      await prisma.reviewInteraction.delete({
        where: {
          reviewId_userId_type: {
            reviewId: parseInt(reviewId),
            userId,
            type: 'REPORT'
          }
        }
      });

      res.json({
        success: true,
        message: 'Report removed successfully',
        isReported: false
      });
    } else {
      // Create new report
      await prisma.reviewInteraction.create({
        data: {
          reviewId: parseInt(reviewId),
          userId,
          type: 'REPORT',
          reason: reason // Store the report reason
        }
      });

      res.json({
        success: true,
        message: 'Review reported successfully',
        isReported: true
      });
    }

  } catch (error) {
    console.error('Error reporting review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to report review'
    });
  }
});

// Get review interactions (helpful count and user's interactions)
router.get('/reviews/:reviewId/interactions', authenticateClerkToken, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user!.id;

    // Get helpful count
    const helpfulCount = await prisma.reviewInteraction.count({
      where: {
        reviewId: parseInt(reviewId),
        type: 'HELPFUL'
      }
    });

    // Get user's interactions
    const userInteractions = await prisma.reviewInteraction.findMany({
      where: {
        reviewId: parseInt(reviewId),
        userId
      },
      select: {
        type: true
      }
    });

    const isHelpful = userInteractions.some(interaction => interaction.type === 'HELPFUL');
    const isReported = userInteractions.some(interaction => interaction.type === 'REPORT');

    res.json({
      success: true,
      helpfulCount,
      isHelpful,
      isReported
    });

  } catch (error) {
    console.error('Error fetching review interactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch review interactions'
    });
  }
});

// ===== QUESTION REPLIES ENDPOINTS =====

// Submit a reply to a question
router.post('/questions/:questionId/replies', authenticateClerkToken, async (req, res) => {
  try {
    const { questionId } = req.params;
    const { reply } = req.body;
    const userId = req.user!.id;

    if (!reply || !reply.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Reply content is required'
      });
    }

    // Check if question exists and is active
    const question = await prisma.question.findFirst({
      where: {
        id: parseInt(questionId),
        isActive: true
      }
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Create new reply
    const newReply = await prisma.questionReply.create({
      data: {
        questionId: parseInt(questionId),
        userId,
        reply: reply.trim()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Reply submitted successfully',
      reply: newReply
    });

  } catch (error) {
    console.error('Error submitting reply:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit reply'
    });
  }
});

// Get replies for a question
router.get('/questions/:questionId/replies', async (req, res) => {
  try {
    const { questionId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [replies, total] = await Promise.all([
      prisma.questionReply.findMany({
        where: {
          questionId: parseInt(questionId)
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
              role: true
            }
          }
        },
        orderBy: { createdAt: 'asc' },
        skip,
        take: parseInt(limit as string)
      }),
      prisma.questionReply.count({
        where: {
          questionId: parseInt(questionId)
        }
      })
    ]);

    res.json({
      success: true,
      replies,
      total,
      page: parseInt(page as string),
      totalPages: Math.ceil(total / parseInt(limit as string))
    });

  } catch (error) {
    console.error('Error fetching question replies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch replies'
    });
  }
});

// Update a reply (only by the reply author)
router.put('/questions/replies/:replyId', authenticateClerkToken, async (req, res) => {
  try {
    const { replyId } = req.params;
    const { reply } = req.body;
    const userId = req.user!.id;

    if (!reply || !reply.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Reply content is required'
      });
    }

    // Check if reply exists and belongs to user
    const existingReply = await prisma.questionReply.findFirst({
      where: {
        id: parseInt(replyId),
        userId,
        isActive: true
      }
    });

    if (!existingReply) {
      return res.status(404).json({
        success: false,
        message: 'Reply not found or not editable'
      });
    }

    // Update the reply
    const updatedReply = await prisma.questionReply.update({
      where: { id: parseInt(replyId) },
      data: { reply: reply.trim() },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Reply updated successfully',
      reply: updatedReply
    });

  } catch (error) {
    console.error('Error updating reply:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update reply'
    });
  }
});

// Delete a reply (only by the reply author)
router.delete('/questions/replies/:replyId', authenticateClerkToken, async (req, res) => {
  try {
    const { replyId } = req.params;
    const userId = req.user!.id;

    // Check if reply exists and belongs to user
    const existingReply = await prisma.questionReply.findFirst({
      where: {
        id: parseInt(replyId),
        userId
      }
    });

    if (!existingReply) {
      return res.status(404).json({
        success: false,
        message: 'Reply not found or not deletable'
      });
    }

    // Completely remove the reply from database
    await prisma.questionReply.delete({
      where: { id: parseInt(replyId) }
    });

    res.json({
      success: true,
      message: 'Reply deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting reply:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete reply'
    });
  }
});

export default router;
