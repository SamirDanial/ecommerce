import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateClerkToken, requireRole } from '../middleware/clerkAuth';

const router = express.Router();
const prisma = new PrismaClient();

// Apply Clerk authentication to all routes
router.use(authenticateClerkToken);

// Middleware to check if user is admin
const requireAdmin = requireRole(['ADMIN']);

// ===== TAX RATES MANAGEMENT =====

// Get all tax rates with pagination and filters
router.get('/tax-rates', requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', country = '', isActive } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { countryName: { contains: search as string, mode: 'insensitive' } },
        { countryCode: { contains: search as string, mode: 'insensitive' } },
        { stateName: { contains: search as string, mode: 'insensitive' } },
        { taxName: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (country) {
      where.countryCode = country;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    // Get tax rates with pagination
    const [taxRates, total] = await Promise.all([
      prisma.taxRate.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: [
          { countryName: 'asc' },
          { stateName: 'asc' }
        ]
      }),
      prisma.taxRate.count({ where })
    ]);

    // Get unique countries for filter dropdown
    const countries = await prisma.taxRate.findMany({
      select: { countryCode: true, countryName: true },
      distinct: ['countryCode'],
      orderBy: { countryName: 'asc' }
    });

    res.json({
      taxRates,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      },
      countries: countries.map((c: any) => ({ code: c.countryCode, name: c.countryName }))
    });
  } catch (error) {
    console.error('Error fetching tax rates:', error);
    res.status(500).json({ error: 'Failed to fetch tax rates' });
  }
});

// Get single tax rate
router.get('/tax-rates/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const taxRate = await prisma.taxRate.findUnique({
      where: { id: parseInt(id) }
    });

    if (!taxRate) {
      return res.status(404).json({ error: 'Tax rate not found' });
    }

    res.json(taxRate);
  } catch (error) {
    console.error('Error fetching tax rate:', error);
    res.status(500).json({ error: 'Failed to fetch tax rate' });
  }
});

// Create new tax rate
router.post('/tax-rates', requireAdmin, async (req, res) => {
  try {
    const { countryCode, countryName, stateCode, stateName, taxRate, taxName, isActive = true } = req.body;

    // Validation
    if (!countryCode || !countryName || !taxRate || !taxName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (taxRate < 0 || taxRate > 100) {
      return res.status(400).json({ error: 'Tax rate must be between 0 and 100' });
    }

    // Check if combination already exists
    const existing = await prisma.taxRate.findFirst({
      where: {
        countryCode,
        stateCode: stateCode || null
      }
    });

    if (existing) {
      return res.status(400).json({ error: 'Tax rate for this country/state combination already exists' });
    }

    const newTaxRate = await prisma.taxRate.create({
      data: {
        countryCode,
        countryName,
        stateCode,
        stateName,
        taxRate: parseFloat(taxRate),
        taxName,
        isActive
      }
    });

    res.status(201).json(newTaxRate);
  } catch (error) {
    console.error('Error creating tax rate:', error);
    res.status(500).json({ error: 'Failed to create tax rate' });
  }
});

// Update tax rate
router.put('/tax-rates/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { countryCode, countryName, stateCode, stateName, taxRate, taxName, isActive } = req.body;

    // Validation
    if (taxRate !== undefined && (taxRate < 0 || taxRate > 100)) {
      return res.status(400).json({ error: 'Tax rate must be between 0 and 100' });
    }

    const updatedTaxRate = await prisma.taxRate.update({
      where: { id: parseInt(id) },
      data: {
        countryCode,
        countryName,
        stateCode,
        stateName,
        taxRate: taxRate !== undefined ? parseFloat(taxRate) : undefined,
        taxName,
        isActive
      }
    });

    res.json(updatedTaxRate);
  } catch (error) {
    console.error('Error updating tax rate:', error);
    res.status(500).json({ error: 'Failed to update tax rate' });
  }
});

// Delete tax rate
router.delete('/tax-rates/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.taxRate.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Tax rate deleted successfully' });
  } catch (error) {
    console.error('Error deleting tax rate:', error);
    res.status(500).json({ error: 'Failed to delete tax rate' });
  }
});

// Bulk update tax rates
router.patch('/tax-rates/bulk', requireAdmin, async (req, res) => {
  try {
    const { ids, updates } = req.body;

    if (!ids || !Array.isArray(ids) || !updates) {
      return res.status(400).json({ error: 'Invalid request format' });
    }

    const result = await prisma.taxRate.updateMany({
      where: { id: { in: ids } },
      data: updates
    });

    res.json({ message: `${result.count} tax rates updated successfully` });
  } catch (error) {
    console.error('Error bulk updating tax rates:', error);
    res.status(500).json({ error: 'Failed to bulk update tax rates' });
  }
});

// ===== SHIPPING RATES MANAGEMENT =====

// Get all shipping rates with pagination and filters
router.get('/shipping-rates', requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', country = '', isActive } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { countryName: { contains: search as string, mode: 'insensitive' } },
        { countryCode: { contains: search as string, mode: 'insensitive' } },
        { stateName: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (country) {
      where.countryCode = country;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    // Get shipping rates with pagination
    const [shippingRates, total] = await Promise.all([
      prisma.shippingRate.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: [
          { countryName: 'asc' },
          { stateName: 'asc' }
        ]
      }),
      prisma.shippingRate.count({ where })
    ]);

    // Get unique countries for filter dropdown
    const countries = await prisma.shippingRate.findMany({
      select: { countryCode: true, countryName: true },
      distinct: ['countryCode'],
      orderBy: { countryName: 'asc' }
    });

    res.json({
      shippingRates,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      },
      countries: countries.map(c => ({ code: c.countryCode, name: c.countryName }))
    });
  } catch (error) {
    console.error('Error fetching shipping rates:', error);
    res.status(500).json({ error: 'Failed to fetch shipping rates' });
  }
});

// Get single shipping rate
router.get('/shipping-rates/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const shippingRate = await prisma.shippingRate.findUnique({
      where: { id: parseInt(id) }
    });

    if (!shippingRate) {
      return res.status(404).json({ error: 'Shipping rate not found' });
    }

    res.json(shippingRate);
  } catch (error) {
    console.error('Error fetching shipping rate:', error);
    res.status(500).json({ error: 'Failed to fetch shipping rate' });
  }
});

// Create new shipping rate
router.post('/shipping-rates', requireAdmin, async (req, res) => {
  try {
    const { countryCode, countryName, stateCode, stateName, shippingCost, deliveryDays, isActive = true } = req.body;

    // Validation
    if (!countryCode || !countryName || !shippingCost || !deliveryDays) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (shippingCost < 0) {
      return res.status(400).json({ error: 'Shipping cost cannot be negative' });
    }

    if (deliveryDays < 1) {
      return res.status(400).json({ error: 'Delivery days must be at least 1' });
    }

    // Check if combination already exists
    const existing = await prisma.shippingRate.findFirst({
      where: {
        countryCode,
        stateCode: stateCode || null
      }
    });

    if (existing) {
      return res.status(400).json({ error: 'Shipping rate for this country/state combination already exists' });
    }

    const newShippingRate = await prisma.shippingRate.create({
      data: {
        countryCode,
        countryName,
        stateCode,
        stateName,
        shippingCost: parseFloat(shippingCost),
        deliveryDays: parseInt(deliveryDays),
        isActive
      }
    });

    res.status(201).json(newShippingRate);
  } catch (error) {
    console.error('Error creating shipping rate:', error);
    res.status(500).json({ error: 'Failed to create shipping rate' });
  }
});

// Update shipping rate
router.put('/shipping-rates/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { countryCode, countryName, stateCode, stateName, shippingCost, deliveryDays, isActive } = req.body;

    // Validation
    if (shippingCost !== undefined && shippingCost < 0) {
      return res.status(400).json({ error: 'Shipping cost cannot be negative' });
    }

    if (deliveryDays !== undefined && deliveryDays < 1) {
      return res.status(400).json({ error: 'Delivery days must be at least 1' });
    }

    const updatedShippingRate = await prisma.shippingRate.update({
      where: { id: parseInt(id) },
      data: {
        countryCode,
        countryName,
        stateCode,
        stateName,
        shippingCost: shippingCost !== undefined ? parseFloat(shippingCost) : undefined,
        deliveryDays: deliveryDays !== undefined ? parseInt(deliveryDays) : undefined,
        isActive
      }
    });

    res.json(updatedShippingRate);
  } catch (error) {
    console.error('Error updating shipping rate:', error);
    res.status(500).json({ error: 'Failed to update shipping rate' });
  }
});

// Delete shipping rate
router.delete('/shipping-rates/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.shippingRate.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Shipping rate deleted successfully' });
  } catch (error) {
    console.error('Error deleting shipping rate:', error);
    res.status(500).json({ error: 'Failed to delete shipping rate' });
  }
});

// Bulk update shipping rates
router.patch('/shipping-rates/bulk', requireAdmin, async (req, res) => {
  try {
    const { ids, updates } = req.body;

    if (!ids || !Array.isArray(ids) || !updates) {
      return res.status(400).json({ error: 'Invalid request format' });
    }

    const result = await prisma.shippingRate.updateMany({
      where: { id: { in: ids } },
      data: updates
    });

    res.json({ message: `${result.count} shipping rates updated successfully` });
  } catch (error) {
    console.error('Error bulk updating shipping rates:', error);
    res.status(500).json({ error: 'Failed to bulk update shipping rates' });
  }
});

// ===== UTILITY ENDPOINTS =====

// Get all countries for dropdowns
router.get('/countries', requireAdmin, async (req, res) => {
  try {
    const countries = await prisma.taxRate.findMany({
      select: { countryCode: true, countryName: true },
      distinct: ['countryCode'],
      orderBy: { countryName: 'asc' }
    });

    res.json(countries.map(c => ({ code: c.countryCode, name: c.countryName })));
  } catch (error) {
    console.error('Error fetching countries:', error);
    res.status(500).json({ error: 'Failed to fetch countries' });
  }
});

// Get states for a specific country
router.get('/countries/:countryCode/states', requireAdmin, async (req, res) => {
  try {
    const { countryCode } = req.params;
    
    const states = await prisma.taxRate.findMany({
      where: { 
        countryCode,
        stateCode: { not: null }
      },
      select: { stateCode: true, stateName: true },
      distinct: ['stateCode'],
      orderBy: { stateName: 'asc' }
    });

    res.json(states.map(s => ({ code: s.stateCode, name: s.stateName })));
  } catch (error) {
    console.error('Error fetching states:', error);
    res.status(500).json({ error: 'Failed to fetch states' });
  }
});

// Get statistics
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const [taxCount, shippingCount, activeTaxCount, activeShippingCount] = await Promise.all([
      prisma.taxRate.count(),
      prisma.shippingRate.count(),
      prisma.taxRate.count({ where: { isActive: true } }),
      prisma.shippingRate.count({ where: { isActive: true } })
    ]);

    res.json({
      totalTaxRates: taxCount,
      totalShippingRates: shippingCount,
      activeTaxRates: activeTaxCount,
      activeShippingRates: activeShippingCount,
      inactiveTaxRates: taxCount - activeTaxCount,
      inactiveShippingRates: shippingCount - activeShippingCount
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;
