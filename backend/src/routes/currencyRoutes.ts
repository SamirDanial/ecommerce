import express from 'express';
import { CurrencyService } from '../services/currencyService';
import currencyService from '../services/currencyService';

const router = express.Router();

/**
 * GET /api/currencies
 * Get all active currencies
 */
router.get('/', async (req, res) => {
  try {
    const currencies = await CurrencyService.getAllActiveCurrencies();
    res.json({
      success: true,
      data: currencies,
      count: currencies.length
    });
  } catch (error) {
    console.error('Error fetching currencies:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch currencies'
    });
  }
});

/**
 * GET /api/currencies/:code
 * Get currency by code
 */
router.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const currency = await CurrencyService.getCurrencyByCode(code);
    
    if (!currency) {
      return res.status(404).json({
        success: false,
        error: `Currency not found: ${code}`
      });
    }

    res.json({
      success: true,
      data: currency
    });
  } catch (error) {
    console.error('Error fetching currency:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch currency'
    });
  }
});

/**
 * GET /api/currencies/default
 * Get default currency
 */
router.get('/default', async (req, res) => {
  try {
    const currency = await CurrencyService.getDefaultCurrency();
    
    if (!currency) {
      return res.status(404).json({
        success: false,
        error: 'No default currency found'
      });
    }

    res.json({
      success: true,
      data: currency
    });
  } catch (error) {
    console.error('Error fetching default currency:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch default currency'
    });
  }
});

/**
 * POST /api/currencies/convert
 * Convert amount between currencies
 */
router.post('/convert', async (req, res) => {
  try {
    const { amount, fromCurrency, toCurrency } = req.body;

    if (!amount || !fromCurrency || !toCurrency) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: amount, fromCurrency, toCurrency'
      });
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be a positive number'
      });
    }

    const conversion = await CurrencyService.convertCurrency(
      amount,
      fromCurrency,
      toCurrency
    );

    res.json({
      success: true,
      data: conversion
    });
  } catch (error) {
    console.error('Error converting currency:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to convert currency'
    });
  }
});

/**
 * GET /api/currencies/exchange-rates
 * Get exchange rates for a base currency
 */
router.get('/exchange-rates', async (req, res) => {
  try {
    const { base = 'USD' } = req.query;
    const rates = await CurrencyService.getExchangeRates(base as string);

    res.json({
      success: true,
      data: {
        baseCurrency: base,
        rates,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch exchange rates'
    });
  }
});

/**
 * GET /api/currencies/stripe-supported
 * Get currencies supported by Stripe
 */
router.get('/stripe-supported', async (req, res) => {
  try {
    const currencies = await CurrencyService.getStripeSupportedCurrencies();
    
    res.json({
      success: true,
      data: currencies,
      count: currencies.length
    });
  } catch (error) {
    console.error('Error fetching Stripe supported currencies:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch Stripe supported currencies'
    });
  }
});

/**
 * GET /api/currencies/business-base-currency
 * Get the business's base currency information
 */
router.get('/business-base-currency', async (req, res) => {
  try {
    const baseCurrencyInfo = await currencyService.getBusinessBaseCurrency();
    
    if (!baseCurrencyInfo) {
      return res.status(404).json({
        success: false,
        error: 'Business base currency not found'
      });
    }

    res.json({
      success: true,
      data: baseCurrencyInfo
    });
  } catch (error) {
    console.error('Error fetching business base currency:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch business base currency'
    });
  }
});

/**
 * POST /api/currencies/format
 * Format amount with currency symbol
 */
router.post('/format', async (req, res) => {
  try {
    const { amount, currencyCode } = req.body;

    if (!amount || !currencyCode) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: amount, currencyCode'
      });
    }

    if (typeof amount !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Amount must be a number'
      });
    }

    const currency = await CurrencyService.getCurrencyByCode(currencyCode);
    
    if (!currency) {
      return res.status(404).json({
        success: false,
        error: `Currency not found: ${currencyCode}`
      });
    }

    const formatted = CurrencyService.formatCurrency(amount, currency);

    res.json({
      success: true,
      data: {
        amount,
        currency: currency.code,
        formatted,
        symbol: currency.symbol,
        position: currency.position,
        decimals: currency.decimals
      }
    });
  } catch (error) {
    console.error('Error formatting currency:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to format currency'
    });
  }
});

export default router;

