import express from 'express';
import { prisma } from '../lib/prisma';

const router = express.Router();

/**
 * @route GET /api/countries
 * @desc Get all active countries
 * @access Public
 */
router.get('/', async (req, res) => {
  try {
    console.log('Countries route hit!'); // Debug log
    
    // Query all countries where isActive is true
    const countries = await prisma.countryConfig.findMany({
      where: {
        isActive: true
      },
      orderBy: [
        { name: 'asc' }         // Order alphabetically by name (A-Z)
      ],
      select: {
        id: true,
        code: true,
        name: true,
        flagEmoji: true,
        phoneCode: true,
        isActive: true,
        isDefault: true,
        hasDelivery: true,
        deliveryCost: true,
        deliveryDays: true,
        sortOrder: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    res.json({
      success: true,
      data: countries,
      count: countries.length,
      message: `Found ${countries.length} active countries`
    });
    
  } catch (error) {
    console.error('Error fetching countries:', error);
    res.status(500).json({
      success: false,
      data: [],
      count: 0,
      message: 'Internal server error while fetching countries',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

/**
 * @route GET /api/countries/:code
 * @desc Get a specific country by code
 * @access Public
 */
router.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    
    if (!code || code.length !== 2) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Invalid country code. Must be a 2-letter ISO code.'
      });
    }
    
    const country = await prisma.countryConfig.findFirst({
      where: {
        code: code.toUpperCase(),
        isActive: true
      },
      select: {
        id: true,
        code: true,
        name: true,
        flagEmoji: true,
        phoneCode: true,
        isActive: true,
        isDefault: true,
        hasDelivery: true,
        deliveryCost: true,
        deliveryDays: true,
        sortOrder: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    if (!country) {
      return res.status(404).json({
        success: false,
        data: null,
        message: `Country with code '${code.toUpperCase()}' not found or inactive`
      });
    }
    
    res.json({
      success: true,
      data: country,
      message: `Found country: ${country.name}`
    });
    
  } catch (error) {
    console.error('Error fetching country:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Internal server error while fetching country',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

export default router;
