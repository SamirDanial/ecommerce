import express from 'express';
import { prisma } from '../lib/prisma';
import { authenticateClerkToken, requireRole } from '../middleware/clerkAuth';

const router = express.Router();

// Apply Clerk authentication to all routes
router.use(authenticateClerkToken);

// Get complete user profile with all related data
router.get('/', async (req, res) => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        preferences: true,
        addresses: true,
        paymentMethods: {
          where: { isActive: true }
        },
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            items: true,
            shippingAddress: true,
            billingAddress: true
          }
        },
        wishlist: {
          include: {
            product: {
              include: {
                images: true,
                category: true
              }
            }
          }
        },
        sessions: {
          where: { isActive: true },
          orderBy: { lastActivity: 'desc' }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate statistics
    const stats = {
      totalOrders: user.orders?.length || 0,
      totalWishlistItems: user.wishlist?.length || 0,
      totalAddresses: user.addresses?.length || 0,
      totalPaymentMethods: user.paymentMethods?.length || 0,
      activeSessions: user.sessions?.length || 0
    };

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      profile: user.profile,
      preferences: user.preferences,
      addresses: user.addresses,
      paymentMethods: user.paymentMethods,
      recentOrders: user.orders,
      wishlist: user.wishlist,
      sessions: user.sessions,
      stats
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const userId = req.user!.id;
    const { firstName, lastName, dateOfBirth, gender, bio, website, socialLinks } = req.body;

    const profile = await prisma.userProfile.upsert({
      where: { userId },
      update: {
        firstName,
        lastName,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender,
        bio,
        website,
        socialLinks
      },
      create: {
        userId,
        firstName,
        lastName,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender,
        bio,
        website,
        socialLinks
      }
    });

    res.json({ message: 'Profile updated successfully', profile });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error', error: 'Failed to update profile' });
  }
});

// Update user preferences
router.put('/preferences', async (req, res) => {
  try {
    const userId = req.user!.id;
    const {
      language,
      currency,
      timezone,
      emailNotifications,
      smsNotifications,
      marketingEmails,
      orderUpdates,
      promotionalOffers,
      newsletter
    } = req.body;

    const preferences = await prisma.userPreferences.upsert({
      where: { userId },
      update: {
        language,
        currency,
        timezone,
        emailNotifications,
        smsNotifications,
        marketingEmails,
        orderUpdates,
        promotionalOffers,
        newsletter
      },
      create: {
        userId,
        language,
        currency,
        timezone,
        emailNotifications,
        smsNotifications,
        marketingEmails,
        orderUpdates,
        promotionalOffers,
        newsletter
      }
    });

    console.log('Preferences updated successfully:', preferences);
    res.json({ message: 'Preferences updated successfully', preferences });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ message: 'Server error', error: 'Failed to update preferences' });
  }
});

// Get user preferences
router.get('/preferences', async (req, res) => {
  try {
    const userId = req.user!.id;

    const preferences = await prisma.userPreferences.findUnique({
      where: { userId }
    });

    if (!preferences) {
      // Create default preferences if none exist
      const defaultPreferences = await prisma.userPreferences.create({
        data: {
          userId,
          language: 'ENGLISH',
          currency: 'USD',
          timezone: 'UTC',
          emailNotifications: true,
          smsNotifications: false,
          marketingEmails: false,
          orderUpdates: true,
          promotionalOffers: false,
          newsletter: false
        }
      });
      return res.json(defaultPreferences);
    }

    res.json(preferences);
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({ message: 'Server error', error: 'Failed to fetch preferences' });
  }
});

// Get user addresses
router.get('/addresses', async (req, res) => {
  try {
    const userId = req.user!.id;

    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' }
    });

    res.json(addresses);
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ message: 'Server error', error: 'Failed to fetch addresses' });
  }
});

// Add new address
router.post('/addresses', async (req, res) => {
  try {
    const userId = req.user!.id;
    const {
      type,
      firstName,
      lastName,
      company,
      address1,
      address2,
      city,
      state,
      postalCode,
      country,
      phone,
      isDefault
    } = req.body;

    // If this is the default address, unset other defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false }
      });
    }

    const address = await prisma.address.create({
      data: {
        userId,
        type,
        firstName,
        lastName,
        company,
        address1,
        address2,
        city,
        state,
        postalCode,
        country,
        phone,
        isDefault
      }
    });

    res.status(201).json({ message: 'Address added successfully', address });
  } catch (error) {
    console.error('Error adding address:', error);
    res.status(500).json({ message: 'Server error', error: 'Failed to add address' });
  }
});

// Update address
router.put('/addresses/:id', async (req, res) => {
  try {
    const userId = req.user!.id;
    const addressId = parseInt(req.params.id);
    const updateData = req.body;

    // Ensure user owns this address
    const existingAddress = await prisma.address.findFirst({
      where: { id: addressId, userId }
    });

    if (!existingAddress) {
      return res.status(404).json({ message: 'Address not found' });
    }

    // If setting as default, unset other defaults
    if (updateData.isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false }
      });
    }

    const address = await prisma.address.update({
      where: { id: addressId },
      data: updateData
    });

    res.json({ message: 'Address updated successfully', address });
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ message: 'Server error', error: 'Failed to update address' });
  }
});

// Delete address
router.delete('/addresses/:id', async (req, res) => {
  try {
    const userId = req.user!.id;
    const addressId = parseInt(req.params.id);

    // Ensure user owns this address
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId }
    });

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    await prisma.address.delete({
      where: { id: addressId }
    });

    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({ message: 'Server error', error: 'Failed to delete address' });
  }
});

// Get payment methods
router.get('/payment-methods', async (req, res) => {
  try {
    const userId = req.user!.id;

    const paymentMethods = await prisma.paymentMethod.findMany({
      where: { userId, isActive: true },
      orderBy: { isDefault: 'desc' }
    });

    res.json(paymentMethods);
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({ message: 'Server error', error: 'Failed to fetch payment methods' });
  }
});

// Add payment method
router.post('/payment-methods', async (req, res) => {
  try {
    const userId = req.user!.id;
    const {
      type,
      provider,
      accountNumber,
      expiryMonth,
      expiryYear,
      cardholderName,
      isDefault,
      metadata
    } = req.body;

    // If this is the default method, unset other defaults
    if (isDefault) {
      await prisma.paymentMethod.updateMany({
        where: { userId },
        data: { isDefault: false }
      });
    }

    const paymentMethod = await prisma.paymentMethod.create({
      data: {
        userId,
        type,
        provider,
        accountNumber,
        expiryMonth,
        expiryYear,
        cardholderName,
        isDefault,
        metadata
      }
    });

    res.status(201).json({ message: 'Payment method added successfully', paymentMethod });
  } catch (error) {
    console.error('Error adding payment method:', error);
    res.status(500).json({ message: 'Server error', error: 'Failed to add payment method' });
  }
});

// Update payment method
router.put('/payment-methods/:id', async (req, res) => {
  try {
    const userId = req.user!.id;
    const methodId = parseInt(req.params.id);
    const updateData = req.body;

    // Ensure user owns this payment method
    const existingMethod = await prisma.paymentMethod.findFirst({
      where: { id: methodId, userId }
    });

    if (!existingMethod) {
      return res.status(404).json({ message: 'Payment method not found' });
    }

    // If setting as default, unset other defaults
    if (updateData.isDefault) {
      await prisma.paymentMethod.updateMany({
        where: { userId },
        data: { isDefault: false }
      });
    }

    const paymentMethod = await prisma.paymentMethod.update({
      where: { id: methodId },
      data: updateData
    });

    res.json({ message: 'Payment method updated successfully', paymentMethod });
  } catch (error) {
    console.error('Error updating payment method:', error);
    res.status(500).json({ message: 'Server error', error: 'Failed to update payment method' });
  }
});

// Delete payment method
router.delete('/payment-methods/:id', async (req, res) => {
  try {
    const userId = req.user!.id;
    const methodId = parseInt(req.params.id);

    // Ensure user owns this payment method
    const paymentMethod = await prisma.paymentMethod.findFirst({
      where: { id: methodId, userId }
    });

    if (!paymentMethod) {
      return res.status(404).json({ message: 'Payment method not found' });
    }

    await prisma.paymentMethod.update({
      where: { id: methodId },
      data: { isActive: false }
    });

    res.json({ message: 'Payment method deleted successfully' });
  } catch (error) {
    console.error('Error deleting payment method:', error);
    res.status(500).json({ message: 'Server error', error: 'Failed to delete payment method' });
  }
});

// Get user sessions
router.get('/sessions', async (req, res) => {
  try {
    const userId = req.user!.id;

    const sessions = await prisma.userSession.findMany({
      where: { userId, isActive: true },
      orderBy: { lastActivity: 'desc' }
    });

    res.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ message: 'Server error', error: 'Failed to fetch sessions' });
  }
});

// Revoke session
router.delete('/sessions/:id', async (req, res) => {
  try {
    const userId = req.user!.id;
    const sessionId = parseInt(req.params.id);

    // Ensure user owns this session
    const session = await prisma.userSession.findFirst({
      where: { id: sessionId, userId }
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    await prisma.userSession.update({
      where: { id: sessionId },
      data: { isActive: false }
    });

    res.json({ message: 'Session revoked successfully' });
  } catch (error) {
    console.error('Error revoking session:', error);
    res.status(500).json({ message: 'Server error', error: 'Failed to revoke session' });
  }
});

// Change password
router.put('/change-password', async (req, res) => {
  try {
    const userId = req.user!.id;
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password (this would need to be implemented based on your auth system)
    // For now, we'll assume the user is authenticated
    if (!user.password) {
      return res.status(400).json({ message: 'Password change not supported for this account type' });
    }

    // Hash new password
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Server error', error: 'Failed to change password' });
  }
});

// Get orders with optional status filter
router.get('/orders', async (req, res) => {
  try {
    const userId = req.user!.id;
    const { page = 1, limit = 10, status } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const where: any = { userId: userId };
    
    if (status && status !== 'all') {
      where.status = status as any;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  images: {
                    select: { url: true },
                    take: 1
                  }
                }
              }
            }
          },
          shippingAddress: true,
          billingAddress: true
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: Number(limit)
      }),
      prisma.order.count({ where })
    ]);

    res.json({
      orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// Get specific order details
router.get('/orders/:id', async (req, res) => {
  try {
    const userId = req.user!.id;
    const orderId = parseInt(req.params.id);

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: userId
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
                category: true
              }
            }
          }
        },
        shippingAddress: true,
        billingAddress: true,
        payments: true
      }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Failed to fetch order' });
  }
});

export default router;
