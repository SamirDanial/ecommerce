import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateClerkToken, requireRole } from '../middleware/clerkAuth';

const router = express.Router();
const prisma = new PrismaClient();

// ===== PUBLIC ENDPOINTS (No authentication required) =====

// Get delivery scope configuration (public)
router.get('/public/scope', async (req, res) => {
  try {
    // For now, we'll use a default business ID
    // In a multi-tenant system, this would come from the authenticated user's business
    const businessId = 'default-business';
    
    let deliveryScope = await prisma.deliveryScope.findUnique({
      where: { businessId }
    });

    if (!deliveryScope) {
      // Create default scope if none exists
      deliveryScope = await prisma.deliveryScope.create({
        data: {
          businessId,
          businessName: 'My Business',
          hasInternationalDelivery: false,
          primaryCountryCode: 'US',
          primaryCountryName: 'United States',
          primaryCurrency: 'USD',
          isActive: true
        }
      });
    }

    res.json(deliveryScope);
  } catch (error) {
    console.error('Error fetching delivery scope:', error);
    res.status(500).json({ error: 'Failed to fetch delivery scope' });
  }
});

// Apply Clerk authentication to all routes AFTER public endpoints
router.use(authenticateClerkToken);

// Middleware to check if user is admin
const requireAdmin = requireRole(['ADMIN']);

// ===== DELIVERY SCOPE MANAGEMENT =====

// Get delivery scope configuration
router.get('/scope', requireAdmin, async (req, res) => {
  try {
    // For now, we'll use a default business ID
    // In a multi-tenant system, this would come from the authenticated user's business
    const businessId = 'default-business';
    
    let deliveryScope = await prisma.deliveryScope.findUnique({
      where: { businessId }
    });

    if (!deliveryScope) {
      // Create default scope if none exists
      deliveryScope = await prisma.deliveryScope.create({
        data: {
          businessId,
          businessName: 'My Business',
          hasInternationalDelivery: false,
          primaryCountryCode: 'US',
          primaryCountryName: 'United States',
          primaryCurrency: 'USD',
          isActive: true
        }
      });
    }

    res.json(deliveryScope);
  } catch (error) {
    console.error('Error fetching delivery scope:', error);
    res.status(500).json({ error: 'Failed to fetch delivery scope' });
  }
});

// Update delivery scope configuration
router.put('/scope', requireAdmin, async (req, res) => {
  try {
    const { businessName, hasInternationalDelivery, primaryCountryCode, primaryCountryName, primaryCurrency } = req.body;
    const businessId = 'default-business';

    const updatedScope = await prisma.deliveryScope.upsert({
      where: { businessId },
      update: {
        businessName,
        hasInternationalDelivery,
        primaryCountryCode,
        primaryCountryName,
        primaryCurrency
      },
      create: {
        businessId,
        businessName,
        hasInternationalDelivery,
        primaryCountryCode,
        primaryCountryName,
        primaryCurrency,
        isActive: true
      }
    });

    res.json(updatedScope);
  } catch (error) {
    console.error('Error updating delivery scope:', error);
    res.status(500).json({ error: 'Failed to update delivery scope' });
  }
});

// ===== LOCAL SHIPPING RATES MANAGEMENT =====

// Get local shipping rates
router.get('/local-shipping', requireAdmin, async (req, res) => {
  try {
    const businessId = 'default-business';
    const { page = 1, limit = 20, search = '', state = '' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Build where clause
    const where: any = { businessId };
    
    if (search) {
      where.OR = [
        { cityName: { contains: search as string, mode: 'insensitive' } },
        { stateName: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (state) {
      where.stateCode = state;
    }

    // Get local shipping rates with pagination
    const [rates, total] = await Promise.all([
      prisma.localShippingRate.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: [
          { stateName: 'asc' },
          { cityName: 'asc' }
        ]
      }),
      prisma.localShippingRate.count({ where })
    ]);

    // Get unique states for filter dropdown
    const states = await prisma.localShippingRate.findMany({
      where: { businessId },
      select: { stateCode: true, stateName: true },
      distinct: ['stateCode'],
      orderBy: { stateName: 'asc' }
    });

    res.json({
      rates,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      },
      states: states.map(s => ({ code: s.stateCode, name: s.stateName }))
    });
  } catch (error) {
    console.error('Error fetching local shipping rates:', error);
    res.status(500).json({ error: 'Failed to fetch local shipping rates' });
  }
});

// Create local shipping rate
router.post('/local-shipping', requireAdmin, async (req, res) => {
  try {
    const { cityName, stateCode, stateName, shippingCost, deliveryDays } = req.body;
    const businessId = 'default-business';

    const newRate = await prisma.localShippingRate.create({
      data: {
        businessId,
        cityName,
        stateCode,
        stateName,
        shippingCost: parseFloat(shippingCost),
        deliveryDays: parseInt(deliveryDays),
        isActive: true
      }
    });

    res.json(newRate);
  } catch (error) {
    console.error('Error creating local shipping rate:', error);
    res.status(500).json({ error: 'Failed to create local shipping rate' });
  }
});

// Update local shipping rate
router.put('/local-shipping/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { cityName, stateCode, stateName, shippingCost, deliveryDays, isActive } = req.body;

    const updatedRate = await prisma.localShippingRate.update({
      where: { id: parseInt(id) },
      data: {
        cityName,
        stateCode,
        stateName,
        shippingCost: parseFloat(shippingCost),
        deliveryDays: parseInt(deliveryDays),
        isActive
      }
    });

    res.json(updatedRate);
  } catch (error) {
    console.error('Error updating local shipping rate:', error);
    res.status(500).json({ error: 'Failed to update local shipping rate' });
  }
});

// Delete local shipping rate
router.delete('/local-shipping/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.localShippingRate.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Local shipping rate deleted successfully' });
  } catch (error) {
    console.error('Error deleting local shipping rate:', error);
    res.status(500).json({ error: 'Failed to delete local shipping rate' });
  }
});

// ===== LOCAL TAX RATES MANAGEMENT =====

// Get local tax rates
router.get('/local-tax', requireAdmin, async (req, res) => {
  try {
    const businessId = 'default-business';
    const { page = 1, limit = 20, search = '', state = '' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Build where clause
    const where: any = { businessId };
    
    if (search) {
      where.OR = [
        { cityName: { contains: search as string, mode: 'insensitive' } },
        { stateName: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (state) {
      where.stateCode = state;
    }

    // Get local tax rates with pagination
    const [rates, total] = await Promise.all([
      prisma.localTaxRate.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: [
          { stateName: 'asc' },
          { cityName: 'asc' }
        ]
      }),
      prisma.localTaxRate.count({ where })
    ]);

    // Get unique states for filter dropdown
    const states = await prisma.localTaxRate.findMany({
      where: { businessId },
      select: { stateCode: true, stateName: true },
      distinct: ['stateCode'],
      orderBy: { stateName: 'asc' }
    });

    res.json({
      rates,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      },
      states: states.map(s => ({ code: s.stateCode, name: s.stateName }))
    });
  } catch (error) {
    console.error('Error fetching local tax rates:', error);
    res.status(500).json({ error: 'Failed to fetch local tax rates' });
  }
});

// Create local tax rate
router.post('/local-tax', requireAdmin, async (req, res) => {
  try {
    const { cityName, stateCode, stateName, taxRate, taxName } = req.body;
    const businessId = 'default-business';

    const newRate = await prisma.localTaxRate.create({
      data: {
        businessId,
        cityName,
        stateCode,
        stateName,
        taxRate: parseFloat(taxRate),
        taxName,
        isActive: true
      }
    });

    res.json(newRate);
  } catch (error) {
    console.error('Error creating local tax rate:', error);
    res.status(500).json({ error: 'Failed to create local tax rate' });
  }
});

// Update local tax rate
router.put('/local-tax/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { cityName, stateCode, stateName, taxRate, taxName, isActive } = req.body;

    const updatedRate = await prisma.localTaxRate.update({
      where: { id: parseInt(id) },
      data: {
        cityName,
        stateCode,
        stateName,
        taxRate: parseFloat(taxRate),
        taxName,
        isActive
      }
    });

    res.json(updatedRate);
  } catch (error) {
    console.error('Error updating local tax rate:', error);
    res.status(500).json({ error: 'Failed to update local tax rate' });
  }
});

// Delete local tax rate
router.delete('/local-tax/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.localTaxRate.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Local tax rate deleted successfully' });
  } catch (error) {
    console.error('Error deleting local tax rate:', error);
    res.status(500).json({ error: 'Failed to delete local tax rate' });
  }
});

// ===== UTILITY ENDPOINTS =====

// Get countries for dropdown
router.get('/countries', requireAdmin, async (req, res) => {
  try {
    const countries = await prisma.countryConfig.findMany({
      where: { isActive: true },
      select: { code: true, name: true },
      orderBy: { name: 'asc' }
    });

    res.json(countries);
  } catch (error) {
    console.error('Error fetching countries:', error);
    res.status(500).json({ error: 'Failed to fetch countries' });
  }
});

// Get currencies for dropdown
router.get('/currencies', requireAdmin, async (req, res) => {
  try {
    const currencies = await prisma.currencyConfig.findMany({
      where: { isActive: true },
      select: { code: true, name: true },
      orderBy: { name: 'asc' }
    });

    res.json(currencies);
  } catch (error) {
    console.error('Error fetching currencies:', error);
    res.status(500).json({ error: 'Failed to fetch currencies' });
  }
});

// Get states for a country
router.get('/countries/:countryCode/states', requireAdmin, async (req, res) => {
  try {
    const { countryCode } = req.params;
    
    // This would typically come from a states table
    // For now, we'll return common US states as an example
    const usStates = [
      { code: 'AL', name: 'Alabama' },
      { code: 'AK', name: 'Alaska' },
      { code: 'AZ', name: 'Arizona' },
      { code: 'AR', name: 'Arkansas' },
      { code: 'CA', name: 'California' },
      { code: 'CO', name: 'Colorado' },
      { code: 'CT', name: 'Connecticut' },
      { code: 'DE', name: 'Delaware' },
      { code: 'FL', name: 'Florida' },
      { code: 'GA', name: 'Georgia' },
      { code: 'HI', name: 'Hawaii' },
      { code: 'ID', name: 'Idaho' },
      { code: 'IL', name: 'Illinois' },
      { code: 'IN', name: 'Indiana' },
      { code: 'IA', name: 'Iowa' },
      { code: 'KS', name: 'Kansas' },
      { code: 'KY', name: 'Kentucky' },
      { code: 'LA', name: 'Louisiana' },
      { code: 'ME', name: 'Maine' },
      { code: 'MD', name: 'Maryland' },
      { code: 'MA', name: 'Massachusetts' },
      { code: 'MI', name: 'Michigan' },
      { code: 'MN', name: 'Minnesota' },
      { code: 'MS', name: 'Mississippi' },
      { code: 'MO', name: 'Missouri' },
      { code: 'MT', name: 'Montana' },
      { code: 'NE', name: 'Nebraska' },
      { code: 'NV', name: 'Nevada' },
      { code: 'NH', name: 'New Hampshire' },
      { code: 'NJ', name: 'New Jersey' },
      { code: 'NM', name: 'New Mexico' },
      { code: 'NY', name: 'New York' },
      { code: 'NC', name: 'North Carolina' },
      { code: 'ND', name: 'North Dakota' },
      { code: 'OH', name: 'Ohio' },
      { code: 'OK', name: 'Oklahoma' },
      { code: 'OR', name: 'Oregon' },
      { code: 'PA', name: 'Pennsylvania' },
      { code: 'RI', name: 'Rhode Island' },
      { code: 'SC', name: 'South Carolina' },
      { code: 'SD', name: 'South Dakota' },
      { code: 'TN', name: 'Tennessee' },
      { code: 'TX', name: 'Texas' },
      { code: 'UT', name: 'Utah' },
      { code: 'VT', name: 'Vermont' },
      { code: 'VA', name: 'Virginia' },
      { code: 'WA', name: 'Washington' },
      { code: 'WV', name: 'West Virginia' },
      { code: 'WI', name: 'Wisconsin' },
      { code: 'WY', name: 'Wyoming' }
    ];

    if (countryCode === 'US') {
      res.json(usStates);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Error fetching states:', error);
    res.status(500).json({ error: 'Failed to fetch states' });
  }
});

export default router;
