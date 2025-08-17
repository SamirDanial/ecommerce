import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateClerkToken, requireRole } from '../middleware/clerkAuth';

const router = express.Router();
const prisma = new PrismaClient();



// Public test endpoint (no auth required) to verify CORS
router.get('/cors-test', (req, res) => {
  res.json({
    success: true,
    message: 'CORS is working - no authentication required',
    timestamp: new Date().toISOString(),
    cors: 'enabled'
  });
});

// Apply admin auth middleware to all routes
router.use(authenticateClerkToken, requireRole(['ADMIN']));

// Test endpoint to verify the route is working
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Admin localization route is working',
    timestamp: new Date().toISOString(),
    user: req.user
  });
});

// ===== LANGUAGES =====

// Get all languages (including inactive)
router.get('/languages', async (req, res) => {
  try {
    const languages = await prisma.languageConfig.findMany({
      orderBy: [
        { isActive: 'desc' },
        { name: 'asc' }
      ]
    });

    res.json({
      success: true,
      data: languages,
      total: languages.length
    });
  } catch (error) {
    console.error('Error fetching languages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch languages'
    });
  } finally {
    await prisma.$disconnect();
  }
});

// Update language
router.put('/languages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, isActive, flag, direction } = req.body;

    // Validate required fields
    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: 'Name and code are required'
      });
    }

    // Check if code is unique (excluding current language)
    const existingLanguage = await prisma.languageConfig.findFirst({
      where: {
        code: code,
        id: { not: parseInt(id) }
      }
    });

    if (existingLanguage) {
      return res.status(400).json({
        success: false,
        message: 'Language code already exists'
      });
    }

    const updatedLanguage = await prisma.languageConfig.update({
      where: { id: parseInt(id) },
      data: {
        name,
        code,
        isActive: isActive ?? true,
        nativeName: name,
        isRTL: direction === 'rtl'
      }
    });

    res.json({
      success: true,
      data: updatedLanguage,
      message: 'Language updated successfully'
    });
  } catch (error) {
    console.error('Error updating language:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update language'
    });
  } finally {
    await prisma.$disconnect();
  }
});

// ===== CURRENCIES =====

// Get all currencies (including inactive)
router.get('/currencies', async (req, res) => {
  try {
    const currencies = await prisma.currencyConfig.findMany({
      orderBy: [
        { isActive: 'desc' },
        { name: 'asc' }
      ]
    });

    res.json({
      success: true,
      data: currencies,
      total: currencies.length
    });
  } catch (error) {
    console.error('Error fetching currencies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch currencies'
    });
  } finally {
    await prisma.$disconnect();
  }
});

// Update currency
router.put('/currencies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, symbol, isActive, exchangeRate } = req.body;

    // Validate required fields
    if (!name || !code || !symbol) {
      return res.status(400).json({
        success: false,
        message: 'Name, code, and symbol are required'
      });
    }

    // Check if code is unique (excluding current currency)
    const existingCurrency = await prisma.currencyConfig.findFirst({
      where: {
        code: code,
        id: { not: parseInt(id) }
      }
    });

    if (existingCurrency) {
      return res.status(400).json({
        success: false,
        message: 'Currency code already exists'
      });
    }

    const updatedCurrency = await prisma.currencyConfig.update({
      where: { id: parseInt(id) },
      data: {
        name,
        code,
        symbol,
        isActive: isActive ?? true,
        rate: exchangeRate ? parseFloat(exchangeRate) : 1.0
      }
    });

    res.json({
      success: true,
      data: updatedCurrency,
      message: 'Currency updated successfully'
    });
  } catch (error) {
    console.error('Error updating currency:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update currency'
    });
  } finally {
    await prisma.$disconnect();
  }
});

// ===== COUNTRIES =====

// Get all countries (including inactive)
router.get('/countries', async (req, res) => {
  try {
    const countries = await prisma.countryConfig.findMany({
      orderBy: [
        { isActive: 'desc' },
        { name: 'asc' }
      ]
    });

    res.json({
      success: true,
      data: countries,
      total: countries.length
    });
  } catch (error) {
    console.error('Error fetching countries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch countries'
    });
  } finally {
    await prisma.$disconnect();
  }
});

// Update country
router.put('/countries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, isActive, phoneCode, flag } = req.body;

    // Validate required fields
    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: 'Name and code are required'
      });
    }

    // Check if code is unique (excluding current country)
    const existingCountry = await prisma.countryConfig.findFirst({
      where: {
        code: code,
        id: { not: parseInt(id) }
      }
    });

    if (existingCountry) {
      return res.status(400).json({
        success: false,
        message: 'Country code already exists'
      });
    }

    const updatedCountry = await prisma.countryConfig.update({
      where: { id: parseInt(id) },
      data: {
        name,
        code,
        isActive: isActive ?? true,
        phoneCode: phoneCode || null,
        flagEmoji: flag || null
      }
    });

    res.json({
      success: true,
      data: updatedCountry,
      message: 'Country updated successfully'
    });
  } catch (error) {
    console.error('Error updating country:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update country'
    });
  } finally {
    await prisma.$disconnect();
  }
});



export default router;
