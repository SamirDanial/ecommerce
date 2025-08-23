import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateClerkToken, requireRole } from '../middleware/clerkAuth';
import currencyService from '../services/currencyService';

const router = express.Router();
const prisma = new PrismaClient();

// Apply Clerk authentication to all routes
router.use(authenticateClerkToken);

// Middleware to check if user is admin
const requireAdmin = requireRole(['ADMIN']);

// ===== BASE CURRENCY MANAGEMENT =====

// Get current business base currency
router.get('/base-currency', requireAdmin, async (req, res) => {
  try {
    const baseCurrency = await currencyService.getBaseCurrency();
    res.json({ baseCurrency });
  } catch (error) {
    console.error('Error getting base currency:', error);
    res.status(500).json({ error: 'Failed to get base currency' });
  }
});

// Change business base currency
router.post('/change-base-currency', requireAdmin, async (req, res) => {
  try {
    const { newBaseCurrency, conversionRate } = req.body;

    if (!newBaseCurrency || !conversionRate) {
      return res.status(400).json({ 
        error: 'Both newBaseCurrency and conversionRate are required' 
      });
    }

    if (conversionRate <= 0) {
      return res.status(400).json({ 
        error: 'Conversion rate must be greater than 0' 
      });
    }

    // Validate currency format
    if (!/^[A-Z]{3}$/.test(newBaseCurrency)) {
      return res.status(400).json({ 
        error: 'Currency must be a 3-letter code (e.g., PKR, USD, EUR)' 
      });
    }

    console.log(`🔄 Admin requested base currency change to ${newBaseCurrency} with rate ${conversionRate}`);

    const result = await currencyService.changeBaseCurrency(newBaseCurrency, conversionRate);
    
    res.json({
      success: true,
      message: result.message,
      updatedProducts: result.updatedProducts,
      newBaseCurrency
    });

  } catch (error) {
    console.error('Error changing base currency:', error);
    res.status(500).json({ 
      error: `Failed to change base currency: ${error.message}` 
    });
  }
});

// ===== EXCHANGE RATES MANAGEMENT =====

// Get all exchange rates
router.get('/exchange-rates', requireAdmin, async (req, res) => {
  try {
    const rates = await prisma.exchangeRate.findMany({
      where: { isActive: true },
      orderBy: [
        { fromCurrency: 'asc' },
        { toCurrency: 'asc' }
      ]
    });

    res.json(rates);
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    res.status(500).json({ error: 'Failed to fetch exchange rates' });
  }
});

// Update exchange rate
router.put('/exchange-rates/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { rate, source } = req.body;

    if (rate <= 0) {
      return res.status(400).json({ 
        error: 'Exchange rate must be greater than 0' 
      });
    }

    const updatedRate = await prisma.exchangeRate.update({
      where: { id: parseInt(id) },
      data: {
        rate: parseFloat(rate),
        source: source || 'Manual',
        lastUpdated: new Date()
      }
    });

    res.json(updatedRate);
  } catch (error) {
    console.error('Error updating exchange rate:', error);
    res.status(500).json({ error: 'Failed to update exchange rate' });
  }
});

// Bulk update exchange rates
router.post('/exchange-rates/bulk-update', requireAdmin, async (req, res) => {
  try {
    const { rates } = req.body;

    if (!Array.isArray(rates)) {
      return res.status(400).json({ 
        error: 'Rates must be an array' 
      });
    }

    const updatePromises = rates.map(async (rateData: any) => {
      const { id, rate, source } = rateData;
      
      if (rate <= 0) {
        throw new Error(`Invalid rate for ID ${id}: ${rate}`);
      }

      return prisma.exchangeRate.update({
        where: { id: parseInt(id) },
        data: {
          rate: parseFloat(rate),
          source: source || 'Manual',
          lastUpdated: new Date()
        }
      });
    });

    const updatedRates = await Promise.all(updatePromises);

    res.json({
      success: true,
      message: `Updated ${updatedRates.length} exchange rates`,
      updatedRates
    });

  } catch (error) {
    console.error('Error bulk updating exchange rates:', error);
    res.status(500).json({ 
      error: `Failed to bulk update exchange rates: ${error.message}` 
    });
  }
});

// ===== UTILITY ENDPOINTS =====

// Get available currencies
router.get('/currencies', requireAdmin, async (req, res) => {
  try {
    const currencies = [
      { code: 'USD', name: 'US Dollar' },
      { code: 'EUR', name: 'Euro' },
      { code: 'GBP', name: 'British Pound' },
      { code: 'PKR', name: 'Pakistani Rupee' },
      { code: 'CAD', name: 'Canadian Dollar' },
      { code: 'AUD', name: 'Australian Dollar' },
      { code: 'JPY', name: 'Japanese Yen' },
      { code: 'CHF', name: 'Swiss Franc' },
      { code: 'CNY', name: 'Chinese Yuan' },
      { code: 'INR', name: 'Indian Rupee' }
    ];

    res.json(currencies);
  } catch (error) {
    console.error('Error fetching currencies:', error);
    res.status(500).json({ error: 'Failed to fetch currencies' });
  }
});

// Test currency conversion
router.post('/test-conversion', requireAdmin, async (req, res) => {
  try {
    const { amount, fromCurrency, toCurrency } = req.body;

    if (!amount || !fromCurrency || !toCurrency) {
      return res.status(400).json({ 
        error: 'Amount, fromCurrency, and toCurrency are required' 
      });
    }

    const convertedAmount = await currencyService.convertPrice(
      parseFloat(amount), 
      fromCurrency, 
      toCurrency
    );

    res.json({
      originalAmount: amount,
      fromCurrency,
      toCurrency,
      convertedAmount,
      rate: await currencyService.getExchangeRate(fromCurrency, toCurrency)
    });

  } catch (error) {
    console.error('Error testing conversion:', error);
    res.status(500).json({ 
      error: `Failed to test conversion: ${error.message}` 
    });
  }
});

// Check if business config exists
router.get('/business-setup-status', authenticateClerkToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const config = await prisma.businessConfig.findFirst({
      where: { isActive: true }
    });
    
    res.json({
      exists: !!config,
      config: config ? {
        businessName: config.businessName,
        baseCurrency: config.baseCurrency
      } : null
    });
  } catch (error) {
    console.error('Error checking business setup status:', error);
    res.status(500).json({ error: 'Failed to check business setup status' });
  }
});

// Create initial business config
router.post('/business-setup', authenticateClerkToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { businessName, baseCurrency } = req.body;
    
    if (!businessName || !baseCurrency) {
      return res.status(400).json({ error: 'Business name and base currency are required' });
    }
    
    // Check if config already exists
    const existingConfig = await prisma.businessConfig.findFirst({
      where: { isActive: true }
    });
    
    if (existingConfig) {
      return res.status(400).json({ error: 'Business config already exists' });
    }
    
    // Create business config
    const businessConfig = await prisma.businessConfig.create({
      data: {
        businessId: 'main-business', // Simple ID for single business
        businessName,
        baseCurrency,
        isActive: true
      }
    });
    
    // Create or update initial exchange rate (base currency to itself = 1.0)
    await prisma.$queryRaw`
      INSERT INTO exchange_rates ("fromCurrency", "toCurrency", rate, "isBase", "isActive", source, "lastUpdated")
      VALUES (${baseCurrency}, ${baseCurrency}, 1.0, true, true, 'Initial Setup', NOW())
      ON CONFLICT ("fromCurrency", "toCurrency") 
      DO UPDATE SET 
        rate = 1.0,
        "isBase" = true,
        "isActive" = true,
        source = 'Initial Setup',
        "lastUpdated" = NOW()
    `;
    
    // Create or update currency config entry for base currency
    await prisma.$queryRaw`
      INSERT INTO currency_configs (code, name, symbol, rate, "isDefault", "isActive", "createdAt", "updatedAt")
      VALUES (${baseCurrency}, ${baseCurrency}, ${baseCurrency}, 1.0, true, true, NOW(), NOW())
      ON CONFLICT (code) 
      DO UPDATE SET 
        rate = 1.0,
        "isDefault" = true,
        "isActive" = true,
        "updatedAt" = NOW()
    `;
    
    res.json({
      success: true,
      message: 'Business configuration created successfully',
      config: businessConfig
    });
  } catch (error) {
    console.error('Error creating business setup:', error);
    res.status(500).json({ error: 'Failed to create business configuration' });
  }
});

export default router;
